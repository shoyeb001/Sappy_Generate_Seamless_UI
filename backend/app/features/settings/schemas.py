from pydantic import BaseModel, Field


class LLMCredentialsRequest(BaseModel):
    openrouter_api_key: str = Field(..., min_length=10)
    huggingface_token: str = Field(..., min_length=10)


class LLMCredentialsStatusResponse(BaseModel):
    has_openrouter_api_key: bool
    has_huggingface_token: bool
    is_complete: bool


class LLMCredentialsSavedResponse(BaseModel):
    status: str = "saved"
    credentials: LLMCredentialsStatusResponse


class DecryptedLLMCredentials(BaseModel):
    openrouter_api_key: str
    huggingface_token: str
