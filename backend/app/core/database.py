from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


async def init_database() -> None:
    global _engine, _session_factory

    if _engine:
        return

    settings = get_settings()
    if not settings.postgres_url:
        raise RuntimeError(
            "Configure DATABASE_URL, SUPABASE_DATABASE_URL, or SUPABASE_URL "
            "with a Postgres connection string."
        )

    _engine = create_async_engine(
        settings.async_postgres_url,
        pool_size=5,
        max_overflow=0,
        pool_pre_ping=True,
        # Disable prepared-statement caching for pgbouncer/Supabase transaction pooling.
        connect_args={"statement_cache_size": 0},
    )
    _session_factory = async_sessionmaker(
        _engine,
        expire_on_commit=False,
        autoflush=False,
    )

    # Import models so their tables register on Base.metadata before create_all.
    from app.features.auth import models as _auth_models  # noqa: F401
    from app.features.settings import models as _settings_models  # noqa: F401

    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def close_database() -> None:
    global _engine, _session_factory

    if _engine:
        await _engine.dispose()
        _engine = None
        _session_factory = None


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    if not _session_factory:
        raise RuntimeError("Database is not initialized.")
    return _session_factory


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding a database session with commit/rollback."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
