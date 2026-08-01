from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(default="", alias="DATABASE_URL")
    supabase_database_url: str = Field(default="", alias="SUPABASE_DATABASE_URL")
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    redis_url: str = Field(default="", alias="REDIS_URL")
    llm_credentials_cache_ttl_seconds: int = Field(
        default=3600,
        alias="LLM_CREDENTIALS_CACHE_TTL_SECONDS",
    )
    auth_jwt_secret: str = Field(
        default="change-me-in-production", alias="AUTH_JWT_SECRET"
    )
    auth_credentials_secret: str = Field(default="", alias="AUTH_CREDENTIALS_SECRET")
    auth_access_token_minutes: int = Field(
        default=15, alias="AUTH_ACCESS_TOKEN_MINUTES"
    )
    auth_refresh_token_days: int = Field(default=30, alias="AUTH_REFRESH_TOKEN_DAYS")
    openrouter_model: str = Field(
        default="google/gemma-4-26b-a4b-it:free",
        alias="OPENROUTER_MODEL",
    )
    huggingface_model: str = Field(
        default="openai/gpt-oss-120b:fastest",
        alias="HUGGINGFACE_MODEL",
    )
    cors_origins: list[str] = Field(
        default=["http://localhost:5173"],
        alias="CORS_ORIGINS",
    )
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def postgres_url(self) -> str:
        return self.database_url or self.supabase_database_url or self.supabase_url

    @property
    def async_postgres_url(self) -> str:
        """The Postgres DSN normalized to the SQLAlchemy asyncpg driver."""
        url = self.postgres_url
        if url.startswith("postgresql+asyncpg://"):
            return url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    @property
    def credentials_secret(self) -> str:
        return self.auth_credentials_secret or self.auth_jwt_secret


@lru_cache
def get_settings() -> Settings:
    return Settings()
