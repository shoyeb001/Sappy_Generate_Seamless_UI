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


class ColorSystem(BaseModel):
    primary: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    secondary: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    accent: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    background: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    surface: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    text_primary: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    text_secondary: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")


class TypographySystem(BaseModel):
    heading_font: str
    body_font: str
    heading_large: str
    heading_medium: str
    body: str
    small: str


class UIStyle(BaseModel):
    border_radius: str
    spacing_scale: list[str] = Field(..., min_length=3)
    shadow_style: Literal["none", "subtle", "soft", "medium", "dramatic"]
    visual_direction: str


class DesignSystem(BaseModel):
    colors: ColorSystem
    typography: TypographySystem
    ui_style: UIStyle


class ScreenPlan(BaseModel):
    id: str
    name: str
    description: str
    purpose: str


class GeneratedScreen(BaseModel):
    id: str
    name: str
    html: str
    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)


class EditScreenRequest(BaseModel):
    instruction: str = Field(..., min_length=3, description="Requested change for one screen.")
    original_prompt: str = Field(..., min_length=3)
    project: ProjectPlan | None = None
    design_system: DesignSystem | None = None
    screen_plan: ScreenPlan | None = None
    screen: GeneratedScreen


class ScreenEditDecision(BaseModel):
    summary: str
    preserve: list[str] = Field(default_factory=list)
    changes: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)


class CreateProjectResponse(BaseModel):
    project_id: str
    status: Literal["planned", "generated"]
    prompt: str
    classification: ScreenClassification
    project: ProjectPlan
    design_system: DesignSystem
    screens: list[ScreenPlan] = Field(..., min_length=1, max_length=5)
    generated_screens: list[GeneratedScreen] = Field(..., min_length=1, max_length=5)
