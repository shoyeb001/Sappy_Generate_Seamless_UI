from datetime import timedelta
from uuid import UUID, uuid4

import asyncpg
from fastapi import HTTPException, status

from app.config.database import acquire_connection
from app.config.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_token,
    utc_now,
    verify_password,
)
from app.config.settings import Settings, get_settings
from app.schemas.auth import AuthSession, AuthUser


class AuthService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    async def signup(self, *, email: str, password: str) -> AuthSession:
        normalized_email = self._normalize_email(email)
        user_id = uuid4()

        try:
            async with acquire_connection() as connection:
                await connection.execute(
                    """
                    INSERT INTO auth_users (id, email, password_hash)
                    VALUES ($1, $2, $3)
                    """,
                    user_id,
                    normalized_email,
                    hash_password(password),
                )
        except asyncpg.UniqueViolationError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            ) from exc

        return await self._create_session(
            AuthUser(id=str(user_id), email=normalized_email),
        )

    async def signin(self, *, email: str, password: str) -> AuthSession:
        normalized_email = self._normalize_email(email)

        async with acquire_connection() as connection:
            row = await connection.fetchrow(
                """
                SELECT id, email, password_hash
                FROM auth_users
                WHERE email = $1
                """,
                normalized_email,
            )

        if not row or not verify_password(password, row["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        return await self._create_session(
            AuthUser(id=str(row["id"]), email=row["email"]),
        )

    async def refresh(self, *, refresh_token: str) -> AuthSession:
        refresh_token_hash = hash_token(refresh_token)
        now = utc_now()

        async with acquire_connection() as connection:
            async with connection.transaction():
                row = await connection.fetchrow(
                    """
                    SELECT
                        auth_refresh_tokens.id AS refresh_token_id,
                        auth_refresh_tokens.expires_at,
                        auth_refresh_tokens.revoked_at,
                        auth_users.id AS user_id,
                        auth_users.email
                    FROM auth_refresh_tokens
                    JOIN auth_users ON auth_users.id = auth_refresh_tokens.user_id
                    WHERE auth_refresh_tokens.token_hash = $1
                    FOR UPDATE
                    """,
                    refresh_token_hash,
                )

                if not row or row["revoked_at"] or row["expires_at"] <= now:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid or expired refresh token.",
                    )

                await connection.execute(
                    """
                    UPDATE auth_refresh_tokens
                    SET revoked_at = NOW()
                    WHERE id = $1
                    """,
                    row["refresh_token_id"],
                )

                user = AuthUser(id=str(row["user_id"]), email=row["email"])
                return await self._create_session(user, connection=connection)

    async def get_user(self, *, access_token: str) -> AuthUser:
        from app.config.security import decode_access_token

        payload = decode_access_token(access_token)
        user_id = payload["sub"]

        async with acquire_connection() as connection:
            row = await connection.fetchrow(
                """
                SELECT id, email
                FROM auth_users
                WHERE id = $1
                """,
                UUID(user_id),
            )

        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists.",
            )

        return AuthUser(id=str(row["id"]), email=row["email"])

    async def _create_session(
        self,
        user: AuthUser,
        *,
        connection: asyncpg.Connection | None = None,
    ) -> AuthSession:
        access_token, access_expires_at = create_access_token(
            subject=user.id,
            email=user.email,
        )
        refresh_token = create_refresh_token()
        refresh_expires_at = utc_now() + timedelta(days=self.settings.auth_refresh_token_days)

        if connection:
            await self._store_refresh_token(
                connection=connection,
                user_id=UUID(user.id),
                refresh_token=refresh_token,
                expires_at=refresh_expires_at,
            )
        else:
            async with acquire_connection() as managed_connection:
                await self._store_refresh_token(
                    connection=managed_connection,
                    user_id=UUID(user.id),
                    refresh_token=refresh_token,
                    expires_at=refresh_expires_at,
                )

        return AuthSession(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=self.settings.auth_access_token_minutes * 60,
            expires_at=access_expires_at,
            user=user,
        )

    async def _store_refresh_token(
        self,
        *,
        connection: asyncpg.Connection,
        user_id: UUID,
        refresh_token: str,
        expires_at,
    ) -> None:
        await connection.execute(
            """
            INSERT INTO auth_refresh_tokens (id, user_id, token_hash, expires_at)
            VALUES ($1, $2, $3, $4)
            """,
            uuid4(),
            user_id,
            hash_token(refresh_token),
            expires_at,
        )

    def _normalize_email(self, email: str) -> str:
        return email.strip().lower()


def get_auth_service() -> AuthService:
    return AuthService()
