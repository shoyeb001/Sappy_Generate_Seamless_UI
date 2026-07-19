from redis.asyncio import Redis

from app.config.settings import get_settings

_redis: Redis | None = None


async def init_cache() -> None:
    global _redis

    settings = get_settings()
    if _redis or not settings.redis_url:
        return

    _redis = Redis.from_url(
        settings.redis_url,
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )
    await _redis.ping()


async def close_cache() -> None:
    global _redis

    if _redis:
        await _redis.aclose()
        _redis = None


def get_redis() -> Redis | None:
    return _redis
