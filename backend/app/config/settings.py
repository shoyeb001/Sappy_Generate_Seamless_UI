from functools import lru_cache

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    database_url: str = Field(default="", alias="DATABASE_URL")
    supabase_database_url: str = Field(default="", alias="SUPABASE_DATABASE_URL")
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    auth_jwt_secret: str = Field(default="change-me-in-production", alias="AUTH_JWT_SECRET")
    auth_access_token_minutes: int = Field(default=15, alias="AUTH_ACCESS_TOKEN_MINUTES")
    auth_refresh_token_days: int = Field(default=30, alias="AUTH_REFRESH_TOKEN_DAYS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def postgres_url(self) -> str:
        return self.database_url or self.supabase_database_url or self.supabase_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
