import json
import re
from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from app.ai.llm import get_llm
from app.ai.prompts import CLASSIFY_PROMPT, PLAN_PROJECT_PROMPT, PLAN_SCREENS_PROMPT
from app.schemas.generation import ProjectPlan, ScreenClassification, ScreenPlan


class GenerationState(TypedDict, total=False):
    prompt: str
    classification: ScreenClassification
    project: ProjectPlan
    screens: list[ScreenPlan]
    errors: list[str]


def _fallback_classification(prompt: str) -> ScreenClassification:
    normalized_prompt = prompt.lower()
    single_screen_terms = ["single", "one page", "one screen", "landing page", "dashboard"]

    if any(term in normalized_prompt for term in single_screen_terms):
        screens = ["Main Screen"]
        reasoning = "The prompt appears to request one focused interface."
    else:
        screens = ["Login", "Dashboard", "Browse", "Details", "Profile"]
        reasoning = "The prompt appears to describe a multi-screen application."

    return ScreenClassification(
        screen_count=len(screens),
        reasoning=reasoning,
        suggested_screens=screens,
    )


def _fallback_project(prompt: str) -> ProjectPlan:
    return ProjectPlan(
        name="Generated UI",
        type="Application",
        description=f"A generated UI concept based on: {prompt[:120]}",
        target_users=["End users"],
        device_type="responsive",
    )


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "screen"


def _fallback_screens(classification: ScreenClassification) -> list[ScreenPlan]:
    return [
        ScreenPlan(
            id=_slugify(name),
            name=name,
            description=f"A {name.lower()} interface for the requested product.",
            purpose=f"Help users complete the {name.lower()} workflow.",
        )
        for name in classification.suggested_screens[:5]
    ]


def _extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise ValueError("LLM response did not contain JSON")

    return json.loads(match.group(0))


async def _call_json_node(system_prompt: str, user_content: str) -> dict:
    llm = get_llm()
    content = await llm.chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=0.2,
        max_tokens=900,
    )
    return _extract_json(content)


async def classify_required_pages(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]

    try:
        payload = await _call_json_node(CLASSIFY_PROMPT, prompt)
        classification = ScreenClassification.model_validate(payload)
        return {**state, "classification": classification}
    except Exception as exc:
        return {
            **state,
            "classification": _fallback_classification(prompt),
            "errors": [*state.get("errors", []), f"classify_required_pages: {exc}"],
        }


async def plan_project(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]

    try:
        payload = await _call_json_node(PLAN_PROJECT_PROMPT, prompt)
        project = ProjectPlan.model_validate(payload)
        return {**state, "project": project}
    except Exception as exc:
        return {
            **state,
            "project": _fallback_project(prompt),
            "errors": [*state.get("errors", []), f"plan_project: {exc}"],
        }


async def plan_screens(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]
    classification = state["classification"]
    project = state["project"]

    context = json.dumps(
        {
            "user_prompt": prompt,
            "project": project.model_dump(),
            "classification": classification.model_dump(),
        },
        indent=2,
    )

    try:
        payload = await _call_json_node(PLAN_SCREENS_PROMPT, context)
        screens = [ScreenPlan.model_validate(screen) for screen in payload["screens"][:5]]
        if not screens:
            raise ValueError("Screen planner returned no screens")

        return {**state, "screens": screens}
    except Exception as exc:
        return {
            **state,
            "screens": _fallback_screens(classification),
            "errors": [*state.get("errors", []), f"plan_screens: {exc}"],
        }


def build_generation_graph():
    graph = StateGraph(GenerationState)
    graph.add_node("classify_required_pages", classify_required_pages)
    graph.add_node("plan_project", plan_project)
    graph.add_node("plan_screens", plan_screens)

    graph.add_edge(START, "classify_required_pages")
    graph.add_edge("classify_required_pages", "plan_project")
    graph.add_edge("plan_project", "plan_screens")
    graph.add_edge("plan_screens", END)

    return graph.compile()


generation_graph = build_generation_graph()
