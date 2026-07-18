import json
import re
from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from app.ai.llm import get_llm
from app.schemas.generation import ScreenClassification


class GenerationState(TypedDict, total=False):
    prompt: str
    classification: ScreenClassification
    errors: list[str]


SYSTEM_PROMPT = """You classify a user's UI generation prompt for a hackathon UI generator.
Return only valid JSON matching this schema:
{
  "screen_count": number from 1 to 5,
  "reasoning": "short explanation",
  "suggested_screens": ["screen name"]
}

Rules:
- If the user asks for one page, one dashboard, one screen, or a landing page, choose 1.
- If the user ask for number of screen then return that number of screens but not more than 5.
- If the user describes a full app, choose the minimum useful set of screens.
- Never return more than 5 screens.
- Use realistic product screen names.
"""


def _fallback_classification(prompt: str) -> ScreenClassification:
    print("Using fallback classification for prompt:", prompt)
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


def _extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise ValueError("LLM response did not contain JSON")

    return json.loads(match.group(0))


async def classify_required_pages(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]

    try:
        llm = get_llm()
        content = await llm.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=600,
        )
        print("LLM response:", content)
        classification = ScreenClassification.model_validate(_extract_json(content))
        return {
            **state,
            "classification": classification,
        }
    except Exception as exc:
        return {
            **state,
            "classification": _fallback_classification(prompt),
            "errors": [*state.get("errors", []), str(exc)],
        }


def build_generation_graph():
    graph = StateGraph(GenerationState)
    graph.add_node("classify_required_pages", classify_required_pages)
    graph.add_edge(START, "classify_required_pages")
    graph.add_edge("classify_required_pages", END)
    return graph.compile()


generation_graph = build_generation_graph()
