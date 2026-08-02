from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.cache import close_cache, init_cache
from app.core.config import get_settings
from app.core.database import close_database, init_database
from app.core.logging import configure_logging, get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    configure_logging(settings.log_level)

    await init_database()
    try:
        await init_cache()
    except Exception as exc:
        logger.warning(
            "Redis cache unavailable; continuing without credential cache: %s", exc
        )
    yield
    await close_cache()
    await close_database()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AI UI Generator API",
        description="FastAPI backend for the prompt-to-UI generator.",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
