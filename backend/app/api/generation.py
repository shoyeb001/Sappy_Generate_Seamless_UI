import json
from collections.abc import AsyncIterator
from uuid import uuid4

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse

from app.ai.workflow import generation_graph
from app.middleware.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.generation import CreateProjectRequest, CreateProjectResponse

router = APIRouter(prefix="/projects", tags=["generation"])


def _sse_event(event_type: str, data: dict) -> str:
    return f"event: {event_type}\ndata: {json.dumps(jsonable_encoder(data))}\n\n"


@router.post("", response_model=CreateProjectResponse)
async def create_project(
    request: CreateProjectRequest,
    current_user: AuthUser = Depends(get_current_user),
) -> CreateProjectResponse:
    result = await generation_graph.ainvoke(
        {
            "prompt": request.prompt,
            "user_id": current_user.id,
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


async def _stream_generation_events(
    request: CreateProjectRequest,
    project_id: str,
    current_user: AuthUser,
) -> AsyncIterator[str]:
    yield _sse_event(
        "generation_started",
        {
            "project_id": project_id,
            "prompt": request.prompt,
        },
    )

    final_screen_count = 0

    try:
        async for update in generation_graph.astream(
            {
                "prompt": request.prompt,
                "user_id": current_user.id,
                "errors": [],
            },
            stream_mode="updates",
        ):
            if "plan_project" in update:
                project = update["plan_project"].get("project")
                if project:
                    yield _sse_event(
                        "project_planned",
                        {
                            "project": project,
                        },
                    )

            if "build_design_system" in update:
                design_system = update["build_design_system"].get("design_system")
                if design_system:
                    yield _sse_event(
                        "design_system_completed",
                        {
                            "design_system": design_system,
                        },
                    )

            if "plan_screens" in update:
                screens = update["plan_screens"].get("screens")
                if screens:
                    yield _sse_event(
                        "screens_planned",
                        {
                            "screens": screens,
                        },
                    )

            if "generate_screen_html" in update:
                generated_screens = update["generate_screen_html"].get("generated_screens", [])
                for screen in generated_screens:
                    final_screen_count += 1
                    yield _sse_event(
                        "screen_completed",
                        {
                            "screen": screen,
                        },
                    )

        yield _sse_event(
            "generation_completed",
            {
                "project_id": project_id,
                "screen_count": final_screen_count,
            },
        )
    except Exception as exc:
        yield _sse_event(
            "generation_failed",
            {
                "project_id": project_id,
                "message": str(exc),
            },
        )


@router.post("/stream")
async def stream_project_generation(
    request: CreateProjectRequest,
    current_user: AuthUser = Depends(get_current_user),
) -> StreamingResponse:
    project_id = str(uuid4())
    return StreamingResponse(
        _stream_generation_events(request, project_id, current_user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
