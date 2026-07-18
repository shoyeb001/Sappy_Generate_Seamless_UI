from typing import Literal

from pydantic import BaseModel, Field


class CreateProjectRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Natural-language UI request.")


class ScreenClassification(BaseModel):
    screen_count: int = Field(..., ge=1, le=5)
    reasoning: str
    suggested_screens: list[str] = Field(..., min_length=1, max_length=5)


class ProjectPlan(BaseModel):
    name: str
    type: str
    description: str
    target_users: list[str] = Field(..., min_length=1)
    device_type: Literal["desktop", "mobile", "tablet", "responsive"]


class ScreenPlan(BaseModel):
    id: str
    name: str
    description: str
    purpose: str


class CreateProjectResponse(BaseModel):
    project_id: str
    status: Literal["planned"]
    prompt: str
    classification: ScreenClassification
    project: ProjectPlan
    screens: list[ScreenPlan] = Field(..., min_length=1, max_length=5)
