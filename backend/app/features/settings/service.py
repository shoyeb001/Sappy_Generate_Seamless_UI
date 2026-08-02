import json
from uuid import UUID

from fastapi import HTTPException, status
from redis.exceptions import RedisError
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import get_redis
from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.core.security import decrypt_secret, encrypt_secret
from app.features.settings.models import UserLLMCredentials
from app.features.settings.schemas import (
    DecryptedLLMCredentials,
    LLMCredentialsRequest,
    LLMCredentialsStatusResponse,
)

logger = get_logger(__name__)


class SettingsService:
    def __init__(self, session: AsyncSession, settings: Settings | None = None) -> None:
        self.session = session
        self.settings = settings or get_settings()

    async def save_llm_credentials(
        self,
        *,
        user_id: str,
        credentials: LLMCredentialsRequest,
    ) -> LLMCredentialsStatusResponse:
        openrouter_api_key_encrypted = encrypt_secret(
            credentials.openrouter_api_key.strip()
        )
        huggingface_token_encrypted = encrypt_secret(
            credentials.huggingface_token.strip()
        )

        statement = (
            pg_insert(UserLLMCredentials)
            .values(
                user_id=UUID(user_id),
                openrouter_api_key_encrypted=openrouter_api_key_encrypted,
                huggingface_token_encrypted=huggingface_token_encrypted,
            )
            .on_conflict_do_update(
                index_elements=[UserLLMCredentials.user_id],
                set_={
                    "openrouter_api_key_encrypted": openrouter_api_key_encrypted,
                    "huggingface_token_encrypted": huggingface_token_encrypted,
                    "updated_at": func.now(),
                },
            )
        )
        await self.session.execute(statement)

        await self._set_cached_credentials(
            user_id=user_id,
            openrouter_api_key_encrypted=openrouter_api_key_encrypted,
            huggingface_token_encrypted=huggingface_token_encrypted,
        )

        return LLMCredentialsStatusResponse(
            has_openrouter_api_key=True,
            has_huggingface_token=True,
            is_complete=True,
        )

    async def get_llm_credentials_status(
        self,
        *,
        user_id: str,
    ) -> LLMCredentialsStatusResponse:
        row = await self.session.get(UserLLMCredentials, UUID(user_id))

        has_openrouter_api_key = bool(row and row.openrouter_api_key_encrypted)
        has_huggingface_token = bool(row and row.huggingface_token_encrypted)
        return LLMCredentialsStatusResponse(
            has_openrouter_api_key=has_openrouter_api_key,
            has_huggingface_token=has_huggingface_token,
            is_complete=has_openrouter_api_key and has_huggingface_token,
        )

    async def get_decrypted_llm_credentials(
        self,
        *,
        user_id: str,
    ) -> DecryptedLLMCredentials:
        cached_credentials = await self._get_cached_credentials(user_id=user_id)
        if cached_credentials:
            return self._decrypt_credentials(cached_credentials)

        row = await self.session.get(UserLLMCredentials, UUID(user_id))
        if not row:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Add your OpenRouter API key and Hugging Face token before generating UI.",
            )

        credentials_payload = {
            "openrouter_api_key_encrypted": row.openrouter_api_key_encrypted,
            "huggingface_token_encrypted": row.huggingface_token_encrypted,
        }
        await self._set_cached_credentials(user_id=user_id, **credentials_payload)
        return self._decrypt_credentials(credentials_payload)

    def _decrypt_credentials(
        self,
        credentials_payload: dict[str, str],
    ) -> DecryptedLLMCredentials:
        try:
            openrouter_api_key = decrypt_secret(
                credentials_payload["openrouter_api_key_encrypted"]
            )
            huggingface_token = decrypt_secret(
                credentials_payload["huggingface_token_encrypted"]
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stored AI provider credentials could not be decrypted.",
            ) from exc

        if not openrouter_api_key or not huggingface_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Add your OpenRouter API key and Hugging Face token before generating UI.",
            )

        return DecryptedLLMCredentials(
            openrouter_api_key=openrouter_api_key,
            huggingface_token=huggingface_token,
        )

    async def _get_cached_credentials(self, *, user_id: str) -> dict[str, str] | None:
        redis = get_redis()
        if not redis:
            return None

        try:
            cached_value = await redis.get(self._credentials_cache_key(user_id))
        except RedisError:
            return None
        if not cached_value:
            return None

        try:
            payload = json.loads(cached_value)
        except json.JSONDecodeError:
            await self._delete_cached_credentials(user_id=user_id)
            return None

        if not isinstance(payload, dict):
            return None

        openrouter_api_key_encrypted = payload.get("openrouter_api_key_encrypted")
        huggingface_token_encrypted = payload.get("huggingface_token_encrypted")
        if not isinstance(openrouter_api_key_encrypted, str) or not isinstance(
            huggingface_token_encrypted,
            str,
        ):
            await self._delete_cached_credentials(user_id=user_id)
            return None

        return {
            "openrouter_api_key_encrypted": openrouter_api_key_encrypted,
            "huggingface_token_encrypted": huggingface_token_encrypted,
        }

    async def _set_cached_credentials(
        self,
        *,
        user_id: str,
        openrouter_api_key_encrypted: str,
        huggingface_token_encrypted: str,
    ) -> None:
        redis = get_redis()
        if not redis:
            return

        try:
            await redis.set(
                self._credentials_cache_key(user_id),
                json.dumps(
                    {
                        "openrouter_api_key_encrypted": openrouter_api_key_encrypted,
                        "huggingface_token_encrypted": huggingface_token_encrypted,
                    }
                ),
                ex=self.settings.llm_credentials_cache_ttl_seconds,
            )
        except RedisError:
            return

    async def _delete_cached_credentials(self, *, user_id: str) -> None:
        redis = get_redis()
        if not redis:
            return

        try:
            await redis.delete(self._credentials_cache_key(user_id))
        except RedisError:
            return

    def _credentials_cache_key(self, user_id: str) -> str:
        return f"llm_credentials:{user_id}"
