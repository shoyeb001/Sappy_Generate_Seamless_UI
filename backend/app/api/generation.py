from uuid import uuid4

from fastapi import APIRouter

from app.ai.workflow import generation_graph
from app.schemas.generation import CreateProjectRequest, CreateProjectResponse

router = APIRouter(prefix="/projects", tags=["generation"])


@router.post("", response_model=CreateProjectResponse)
async def create_project(request: CreateProjectRequest) -> CreateProjectResponse:
    result = await generation_graph.ainvoke(
        {
            "prompt": request.prompt,
            "errors": [],
        }
    )

    return CreateProjectResponse(
        project_id=str(uuid4()),
        status="generated",
        prompt=request.prompt,
        classification=result["classification"],
        project=result["project"],
        design_system=result["design_system"],
        screens=result["screens"],
        generated_screens=result["generated_screens"],
    )
