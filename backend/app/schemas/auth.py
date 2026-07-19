from pydantic import BaseModel, Field


class AuthCredentials(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)


class AuthUser(BaseModel):
    id: str
    email: str | None = None


class AuthSession(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    expires_at: int | None = None
    user: AuthUser
