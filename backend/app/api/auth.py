from fastapi import APIRouter, Depends

from app.schemas.auth import AuthCredentials, AuthSession, AuthUser, RefreshTokenRequest
from app.services.auth_service import AuthService, get_auth_service
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthSession)
async def signup(
    credentials: AuthCredentials,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthSession:
    return await auth_service.signup(
        email=credentials.email,
        password=credentials.password,
    )


@router.post("/login", response_model=AuthSession)
async def login(
    credentials: AuthCredentials,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthSession:
    return await auth_service.signin(
        email=credentials.email,
        password=credentials.password,
    )


@router.post("/refresh", response_model=AuthSession)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> AuthSession:
    return await auth_service.refresh(refresh_token=request.refresh_token)


@router.get("/me", response_model=AuthUser)
async def me(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    return current_user
