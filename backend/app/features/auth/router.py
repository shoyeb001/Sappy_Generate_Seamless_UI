from fastapi import APIRouter

from app.features.auth.dependencies import AuthServiceDep, CurrentUserDep
from app.features.auth.schemas import (
    AuthCredentials,
    AuthSession,
    AuthUser,
    RefreshTokenRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthSession)
async def signup(
    credentials: AuthCredentials,
    auth_service: AuthServiceDep,
) -> AuthSession:
    return await auth_service.signup(
        email=credentials.email,
        password=credentials.password,
    )


@router.post("/login", response_model=AuthSession)
async def login(
    credentials: AuthCredentials,
    auth_service: AuthServiceDep,
) -> AuthSession:
    return await auth_service.signin(
        email=credentials.email,
        password=credentials.password,
    )


@router.post("/refresh", response_model=AuthSession)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: AuthServiceDep,
) -> AuthSession:
    return await auth_service.refresh(refresh_token=request.refresh_token)


@router.get("/me", response_model=AuthUser)
async def me(current_user: CurrentUserDep) -> AuthUser:
    return current_user
