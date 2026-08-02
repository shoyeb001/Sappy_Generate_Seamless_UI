from fastapi import APIRouter

from app.features.auth.router import router as auth_router
from app.features.generation.router import router as generation_router
from app.features.health.router import router as health_router
from app.features.settings.router import router as settings_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(settings_router)
api_router.include_router(generation_router)
