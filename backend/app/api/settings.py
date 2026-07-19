from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.settings import (
    LLMCredentialsRequest,
    LLMCredentialsSavedResponse,
    LLMCredentialsStatusResponse,
)
from app.services.settings_service import SettingsService, get_settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/llm-credentials/status", response_model=LLMCredentialsStatusResponse)
async def get_llm_credentials_status(
    current_user: AuthUser = Depends(get_current_user),
    settings_service: SettingsService = Depends(get_settings_service),
) -> LLMCredentialsStatusResponse:
    return await settings_service.get_llm_credentials_status(user_id=current_user.id)


@router.put("/llm-credentials", response_model=LLMCredentialsSavedResponse)
async def save_llm_credentials(
    request: LLMCredentialsRequest,
    current_user: AuthUser = Depends(get_current_user),
    settings_service: SettingsService = Depends(get_settings_service),
) -> LLMCredentialsSavedResponse:
    credentials_status = await settings_service.save_llm_credentials(
        user_id=current_user.id,
        credentials=request,
    )
    return LLMCredentialsSavedResponse(credentials=credentials_status)
