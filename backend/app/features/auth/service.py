from datetime import datetime, timedelta
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    hash_password,
    hash_token,
    utc_now,
    verify_password,
)
from app.features.auth.models import AuthRefreshToken, AuthUser as AuthUserModel
from app.features.auth.schemas import AuthSession, AuthUser


class AuthService:
    def __init__(self, session: AsyncSession, settings: Settings | None = None) -> None:
        self.session = session
        self.settings = settings or get_settings()

    async def signup(self, *, email: str, password: str) -> AuthSession:
        normalized_email = self._normalize_email(email)
        user = AuthUserModel(
            id=uuid4(),
            email=normalized_email,
            password_hash=hash_password(password),
        )
        self.session.add(user)

        try:
            await self.session.flush()
        except IntegrityError as exc:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            ) from exc

        return await self._create_session(
            AuthUser(id=str(user.id), email=user.email)
        )

    async def signin(self, *, email: str, password: str) -> AuthSession:
        normalized_email = self._normalize_email(email)
        user = await self.session.scalar(
            select(AuthUserModel).where(AuthUserModel.email == normalized_email)
        )

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        return await self._create_session(
            AuthUser(id=str(user.id), email=user.email)
        )

    async def refresh(self, *, refresh_token: str) -> AuthSession:
        refresh_token_hash = hash_token(refresh_token)
        now = utc_now()

        token_row = await self.session.scalar(
            select(AuthRefreshToken)
            .where(AuthRefreshToken.token_hash == refresh_token_hash)
            .with_for_update()
        )

        if (
            not token_row
            or token_row.revoked_at
            or token_row.expires_at <= now
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        token_row.revoked_at = now

        user = await self.session.get(AuthUserModel, token_row.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        return await self._create_session(
            AuthUser(id=str(user.id), email=user.email)
        )

    async def get_user(self, *, access_token: str) -> AuthUser:
        payload = decode_access_token(access_token)
        user = await self.session.get(AuthUserModel, UUID(payload["sub"]))

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists.",
            )

        return AuthUser(id=str(user.id), email=user.email)

    async def _create_session(self, user: AuthUser) -> AuthSession:
        access_token, access_expires_at = create_access_token(
            subject=user.id,
            email=user.email,
        )
        refresh_token = create_refresh_token()
        refresh_expires_at = utc_now() + timedelta(
            days=self.settings.auth_refresh_token_days
        )

        self.session.add(
            AuthRefreshToken(
                id=uuid4(),
                user_id=UUID(user.id),
                token_hash=hash_token(refresh_token),
                expires_at=refresh_expires_at,
            )
        )
        await self.session.flush()

        return AuthSession(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=self.settings.auth_access_token_minutes * 60,
            expires_at=access_expires_at,
            user=user,
        )

    def _normalize_email(self, email: str) -> str:
        return email.strip().lower()
