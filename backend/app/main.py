from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config.database import close_database, init_database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await init_database()
    yield
    await close_database()


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI UI Generator API",
        description="FastAPI backend for the hackathon prompt-to-UI generator.",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
