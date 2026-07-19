from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import asyncpg
from fastapi import HTTPException, status

from app.config.settings import get_settings

_pool: asyncpg.Pool | None = None


CREATE_AUTH_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_user_id
    ON auth_refresh_tokens(user_id);
"""


async def init_database() -> None:
    global _pool

    if _pool:
        return

    settings = get_settings()
    if not settings.postgres_url:
        raise RuntimeError(
            "Configure DATABASE_URL, SUPABASE_DATABASE_URL, or SUPABASE_URL with a Postgres connection string."
        )

    _pool = await asyncpg.create_pool(dsn=settings.postgres_url, min_size=1, max_size=5)
    async with _pool.acquire() as connection:
        await connection.execute(CREATE_AUTH_TABLES_SQL)


async def close_database() -> None:
    global _pool

    if _pool:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if not _pool:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection is not initialized.",
        )
    return _pool


@asynccontextmanager
async def acquire_connection() -> AsyncIterator[asyncpg.Connection]:
    pool = get_pool()
    async with pool.acquire() as connection:
        yield connection
