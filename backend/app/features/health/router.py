from datetime import UTC, datetime

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "ai-ui-generator-backend",
        "timestamp": datetime.now(UTC).isoformat(),
    }
