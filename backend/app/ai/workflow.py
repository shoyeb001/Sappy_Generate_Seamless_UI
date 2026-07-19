import json
import re
from operator import add
from typing import Annotated, TypedDict

from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from app.ai.llm import get_llm
from app.ai.prompts import (
    CLASSIFY_PROMPT,
    GENERATE_COLORS_PROMPT,
    GENERATE_SCREEN_HTML_PROMPT,
    GENERATE_TYPOGRAPHY_PROMPT,
    GENERATE_UI_STYLE_PROMPT,
    PLAN_PROJECT_PROMPT,
    PLAN_SCREENS_PROMPT,
)
from app.schemas.generation import (
    ColorSystem,
    DesignSystem,
    GeneratedScreen,
    ProjectPlan,
    ScreenClassification,
    ScreenPlan,
    TypographySystem,
    UIStyle,
)


class GenerationState(TypedDict, total=False):
    prompt: str
    classification: ScreenClassification
    project: ProjectPlan
    colors: ColorSystem
    typography: TypographySystem
    ui_style: UIStyle
    design_system: DesignSystem
    screens: list[ScreenPlan]
    generated_screens: Annotated[list[GeneratedScreen], add]
    errors: Annotated[list[str], add]


class ScreenGenerationState(TypedDict):
    prompt: str
    project: ProjectPlan
    design_system: DesignSystem
    screen: ScreenPlan


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


def _fallback_colors() -> ColorSystem:
    return ColorSystem(
        primary="#2563EB",
        secondary="#7C3AED",
        accent="#F59E0B",
        background="#F8FAFC",
        surface="#FFFFFF",
        text_primary="#0F172A",
        text_secondary="#64748B",
    )


def _fallback_typography() -> TypographySystem:
    return TypographySystem(
        heading_font="Inter",
        body_font="Inter",
        heading_large="48px",
        heading_medium="32px",
        body="16px",
        small="14px",
    )


def _fallback_ui_style(project: ProjectPlan | None = None) -> UIStyle:
    visual_direction = "Modern product interface"
    if project:
        visual_direction = f"Modern {project.type.lower()} interface"

    return UIStyle(
        border_radius="12px",
        spacing_scale=["4px", "8px", "12px", "16px", "24px", "32px"],
        shadow_style="soft",
        visual_direction=visual_direction,
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


def _fallback_generated_screen(screen: ScreenPlan, design_system: DesignSystem) -> GeneratedScreen:
    colors = design_system.colors
    typography = design_system.typography
    ui_style = design_system.ui_style
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{screen.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>

  <script>
    tailwind.config = {{
      theme: {{
        extend: {{
          colors: {{
            primary: "{colors.primary}",
            secondary: "{colors.secondary}",
            accent: "{colors.accent}",
            background: "{colors.background}",
            surface: "{colors.surface}",
            textPrimary: "{colors.text_primary}",
            textSecondary: "{colors.text_secondary}"
          }},
          fontFamily: {{
            heading: ["{typography.heading_font}", "sans-serif"],
            body: ["{typography.body_font}", "sans-serif"]
          }},
          borderRadius: {{
            design: "{ui_style.border_radius}"
          }}
        }}
      }}
    }}
  </script>
</head>
<body class="min-h-screen bg-background text-textPrimary font-body">
  <main class="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-12 py-10">
    <header class="mb-10 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-secondary">{ui_style.visual_direction}</p>
        <h1 class="mt-3 font-heading text-5xl font-bold text-textPrimary">{screen.name}</h1>
      </div>
      <div class="rounded-design bg-surface px-5 py-3 text-sm font-medium text-textSecondary shadow">
        1440 x 900
      </div>
    </header>
    <section class="grid flex-1 grid-cols-[1.15fr_0.85fr] gap-8">
      <div class="rounded-design bg-surface p-8 shadow">
        <p class="text-sm font-semibold text-primary">Purpose</p>
        <h2 class="mt-3 font-heading text-3xl font-bold">{screen.purpose}</h2>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-textSecondary">{screen.description}</p>
        <div class="mt-8 grid grid-cols-3 gap-4">
          <div class="rounded-design border border-slate-200 p-5">
            <p class="text-sm text-textSecondary">Primary action</p>
            <p class="mt-2 text-xl font-semibold">Review details</p>
          </div>
          <div class="rounded-design border border-slate-200 p-5">
            <p class="text-sm text-textSecondary">Status</p>
            <p class="mt-2 text-xl font-semibold">Ready</p>
          </div>
          <div class="rounded-design border border-slate-200 p-5">
            <p class="text-sm text-textSecondary">Priority</p>
            <p class="mt-2 text-xl font-semibold">High</p>
          </div>
        </div>
      </div>
      <aside class="rounded-design bg-primary p-8 text-white shadow">
        <p class="text-sm font-semibold uppercase tracking-wide text-white/75">Generated screen</p>
        <h3 class="mt-4 font-heading text-3xl font-bold">Consistent UI foundation</h3>
        <p class="mt-5 leading-7 text-white/80">
          This fallback screen uses the shared design tokens and keeps the generated project usable even when the LLM response is invalid.
        </p>
        <button class="mt-8 rounded-design bg-accent px-5 py-3 font-semibold text-slate-950">Continue</button>
      </aside>
    </section>
  </main>
</body>
</html>"""

    return GeneratedScreen(
        id=screen.id,
        name=screen.name,
        html=html,
        width=1440,
        height=900,
    )


def _extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise ValueError("LLM response did not contain JSON")

    return json.loads(match.group(0))


def _strip_markdown_fences(html: str) -> str:
    cleaned = html.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:html)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


async def _call_json_node(
    system_prompt: str,
    user_content: str,
    max_tokens: int = 900,
    temperature: float = 0.2,
) -> dict:
    llm = get_llm()
    content = await llm.chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return _extract_json(content)


async def classify_required_pages(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]

    try:
        payload = await _call_json_node(CLASSIFY_PROMPT, prompt, temperature=0.4)
        classification = ScreenClassification.model_validate(payload)
        return {"classification": classification}
    except Exception as exc:
        return {
            "classification": _fallback_classification(prompt),
            "errors": [f"classify_required_pages: {exc}"],
        }


async def plan_project(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]

    try:
        payload = await _call_json_node(PLAN_PROJECT_PROMPT, prompt, temperature=0.4)
        project = ProjectPlan.model_validate(payload)
        return {"project": project}
    except Exception as exc:
        return {
            "project": _fallback_project(prompt),
            "errors": [f"plan_project: {exc}"],
        }


async def generate_colors(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]
    project = state["project"]
    context = json.dumps(
        {
            "user_prompt": prompt,
            "project": project.model_dump(),
        },
        indent=2,
    )

    try:
        payload = await _call_json_node(GENERATE_COLORS_PROMPT, context, temperature=0.7)
        colors = ColorSystem.model_validate(payload)
        return {"colors": colors}
    except Exception as exc:
        return {
            "colors": _fallback_colors(),
            "errors": [f"generate_colors: {exc}"],
        }


async def generate_typography(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]
    project = state["project"]
    context = json.dumps(
        {
            "user_prompt": prompt,
            "project": project.model_dump(),
        },
        indent=2,
    )

    try:
        payload = await _call_json_node(GENERATE_TYPOGRAPHY_PROMPT, context, temperature=0.5)
        typography = TypographySystem.model_validate(payload)
        return {"typography": typography}
    except Exception as exc:
        return {
            "typography": _fallback_typography(),
            "errors": [f"generate_typography: {exc}"],
        }


async def generate_ui_style(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]
    project = state["project"]
    context = json.dumps(
        {
            "user_prompt": prompt,
            "project": project.model_dump(),
        },
        indent=2,
    )

    try:
        payload = await _call_json_node(GENERATE_UI_STYLE_PROMPT, context, temperature=0.7)
        ui_style = UIStyle.model_validate(payload)
        return {"ui_style": ui_style}
    except Exception as exc:
        return {
            "ui_style": _fallback_ui_style(project),
            "errors": [f"generate_ui_style: {exc}"],
        }


async def build_design_system(state: GenerationState) -> GenerationState:
    design_system = DesignSystem(
        colors=state["colors"],
        typography=state["typography"],
        ui_style=state["ui_style"],
    )
    return {"design_system": design_system}


async def plan_screens(state: GenerationState) -> GenerationState:
    prompt = state["prompt"]
    classification = state["classification"]
    project = state["project"]
    design_system = state["design_system"]

    context = json.dumps(
        {
            "user_prompt": prompt,
            "project": project.model_dump(),
            "classification": classification.model_dump(),
            "design_system": design_system.model_dump(),
        },
        indent=2,
    )

    try:
        payload = await _call_json_node(PLAN_SCREENS_PROMPT, context, temperature=0.4)
        screens = [ScreenPlan.model_validate(screen) for screen in payload["screens"][:5]]
        if not screens:
            raise ValueError("Screen planner returned no screens")

        return {"screens": screens}
    except Exception as exc:
        return {
            "screens": _fallback_screens(classification),
            "errors": [f"plan_screens: {exc}"],
        }


async def generate_screen_html(state: ScreenGenerationState) -> GenerationState:
    prompt = state["prompt"]
    project = state["project"]
    design_system = state["design_system"]
    screen = state["screen"]

    context = json.dumps(
        {
            "user_prompt": prompt,
            "project": project.model_dump(),
            "design_system": design_system.model_dump(),
            "screen": screen.model_dump(),
            "default_dimensions": {
                "width": 1440,
                "height": 900,
            },
        },
        indent=2,
    )

    try:
        payload = await _call_json_node(GENERATE_SCREEN_HTML_PROMPT, context, max_tokens=15000, temperature=0.7)
        if "html" in payload:
            payload["html"] = _strip_markdown_fences(payload["html"])
        generated_screen = GeneratedScreen.model_validate(payload)
        return {"generated_screens": [generated_screen]}
    except Exception as exc:
        print(f"Error generating screen HTML for {screen.id}: {exc}")
        return {
            "generated_screens": [_fallback_generated_screen(screen, design_system)],
            "errors": [f"generate_screen_html[{screen.id}]: {exc}"],
        }


def dispatch_screen_generation(state: GenerationState) -> list[Send]:
    return [
        Send(
            "generate_screen_html",
            {
                "prompt": state["prompt"],
                "project": state["project"],
                "design_system": state["design_system"],
                "screen": screen,
            },
        )
        for screen in state["screens"]
    ]


def build_generation_graph():
    graph = StateGraph(GenerationState)
    graph.add_node("classify_required_pages", classify_required_pages)
    graph.add_node("plan_project", plan_project)
    graph.add_node("generate_colors", generate_colors)
    graph.add_node("generate_typography", generate_typography)
    graph.add_node("generate_ui_style", generate_ui_style)
    graph.add_node("build_design_system", build_design_system)
    graph.add_node("plan_screens", plan_screens)
    graph.add_node("generate_screen_html", generate_screen_html)

    graph.add_edge(START, "classify_required_pages")
    graph.add_edge("classify_required_pages", "plan_project")
    graph.add_edge("plan_project", "generate_colors")
    graph.add_edge("plan_project", "generate_typography")
    graph.add_edge("plan_project", "generate_ui_style")
    graph.add_edge(
        ["generate_colors", "generate_typography", "generate_ui_style"],
        "build_design_system",
    )
    graph.add_edge("build_design_system", "plan_screens")
    graph.add_conditional_edges("plan_screens", dispatch_screen_generation)
    graph.add_edge("generate_screen_html", END)

    return graph.compile()


generation_graph = build_generation_graph()
