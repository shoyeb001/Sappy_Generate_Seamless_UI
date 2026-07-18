from typing import Literal

from pydantic import BaseModel, Field


class CreateProjectRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Natural-language UI request.")


class ScreenClassification(BaseModel):
    screen_count: int = Field(..., ge=1, le=5)
    reasoning: str
    suggested_screens: list[str] = Field(..., min_length=1, max_length=5)


class CreateProjectResponse(BaseModel):
    project_id: str
    status: Literal["classified"]
    prompt: str
    classification: ScreenClassification
