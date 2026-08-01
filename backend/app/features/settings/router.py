from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.features.auth.dependencies import CurrentUserDep
from app.features.settings.schemas import (
    LLMCredentialsRequest,
    LLMCredentialsSavedResponse,
    LLMCredentialsStatusResponse,
)
from app.features.settings.service import SettingsService

router = APIRouter(prefix="/settings", tags=["settings"])


def get_settings_service(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SettingsService:
    return SettingsService(session)


SettingsServiceDep = Annotated[SettingsService, Depends(get_settings_service)]


@router.get("/llm-credentials/status", response_model=LLMCredentialsStatusResponse)
async def get_llm_credentials_status(
    current_user: CurrentUserDep,
    settings_service: SettingsServiceDep,
) -> LLMCredentialsStatusResponse:
    return await settings_service.get_llm_credentials_status(user_id=current_user.id)


@router.put("/llm-credentials", response_model=LLMCredentialsSavedResponse)
async def save_llm_credentials(
    request: LLMCredentialsRequest,
    current_user: CurrentUserDep,
    settings_service: SettingsServiceDep,
) -> LLMCredentialsSavedResponse:
    credentials_status = await settings_service.save_llm_credentials(
        user_id=current_user.id,
        credentials=request,
    )
    return LLMCredentialsSavedResponse(credentials=credentials_status)
