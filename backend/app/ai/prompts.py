CLASSIFY_PROMPT = """You classify a user's UI generation prompt for a hackathon UI generator.
Return only valid JSON matching this schema:
{
  "screen_count": number from 1 to 5,
  "reasoning": "short explanation",
  "suggested_screens": ["screen name"]
}

Rules:
- If the user asks for one page, one dashboard, one screen, or a landing page, choose 1.
- If the user explicitly names screens, include those screen names in suggested_screens.
- If the user describes a full app, choose the minimum useful set of screens.
- Never return more than 5 screens.
- Use realistic product screen names.
"""

PLAN_PROJECT_PROMPT = """You plan the product identity for a UI generation request.
Return only valid JSON matching this schema:
{
  "name": "short product/app name",
  "type": "application category",
  "description": "one sentence product description",
  "target_users": ["user group"],
  "device_type": "desktop | mobile | tablet | responsive"
}

Rules:
- Infer a realistic name if the user does not provide one.
- Choose responsive unless the prompt clearly asks for mobile, tablet, or desktop.
- Keep the description specific to the user prompt.
"""

GENERATE_COLORS_PROMPT = """You create a color system for a generated UI application.
Return only valid JSON matching this schema:
{
  "primary": "#6366F1",
  "secondary": "#8B5CF6",
  "accent": "#F59E0B",
  "background": "#F8FAFC",
  "surface": "#FFFFFF",
  "text_primary": "#0F172A",
  "text_secondary": "#64748B"
}

Rules:
- Return only 6-digit hex colors.
- Choose colors that fit the project category and target users.
- Ensure text colors have strong contrast against background and surface.
- Avoid a palette dominated by one hue.
- Keep the palette practical for production UI screens.
"""

GENERATE_TYPOGRAPHY_PROMPT = """You create a typography system for a generated UI application.
Return only valid JSON matching this schema:
{
  "heading_font": "Hanken Grotesk",
  "body_font": "Inter",
  "heading_large": "48px",
  "heading_medium": "32px",
  "body": "16px",
  "small": "14px"
}

Rules:
- Use realistic web fonts that can be loaded from Google Fonts.
- Choose heading and body fonts that fit the project category.
- Use pixel sizes suitable for the requested device type.
- Keep the scale restrained and usable for generated product screens.
"""

GENERATE_UI_STYLE_PROMPT = """You create the visual UI style rules for a generated UI application.
Return only valid JSON matching this schema:
{
  "border_radius": "12px",
  "spacing_scale": ["4px", "8px", "12px", "16px", "24px", "32px"],
  "shadow_style": "soft",
  "visual_direction": "Modern educational SaaS"
}

Rules:
- shadow_style must be one of: none, subtle, soft, medium, dramatic.
- Choose border radius and spacing that fit the project category and device type.
- Keep the visual direction specific and concise.
- Avoid generic AI visual cliches and excessive gradients.
"""

PLAN_SCREENS_PROMPT = """You plan UI screens for a generated application.
Return only valid JSON matching this schema:
{
  "screens": [
    {
      "id": "kebab-case-id",
      "name": "Screen Name",
      "description": "what appears on this screen",
      "purpose": "why this screen exists"
    }
  ]
}

Rules:
- Return exactly the number of screens from the classification.
- Respect explicitly requested screens from the user prompt. If the user names screens, include them unless there are more than 5.
- Maximum 5 screens.
- Use stable kebab-case ids.
- Keep screens useful for the MVP flow.
"""

GENERATE_SCREEN_HTML_PROMPT = """You generate one production-quality UI screen as standalone HTML.
Return only valid JSON matching this schema:
{
  "id": "screen-id-from-input",
  "name": "Screen Name From Input",
  "html": "<!DOCTYPE html><html lang=\\"en\\">...</html>",
  "width": 1440,
  "height": 900
}

Requirements:
- Generate a complete standalone HTML document.
- Include Tailwind CSS via CDN using <script src="https://cdn.tailwindcss.com"></script>.
- Use the shared DesignSystem from the input for colors, typography, radius, spacing, shadows, and visual direction.
- Define Tailwind theme tokens from the DesignSystem in a tailwind.config script.
- Use realistic, domain-specific content. Do not use lorem ipsum.
- Return raw HTML inside the JSON html string. Do not include markdown code fences.
- Default to desktop dimensions of width 1440 and height 900 unless the project device type clearly requires otherwise.
- The body should render a complete first-screen UI for the requested screen, not a placeholder.
- Keep navigation, components, and content consistent with the project and design system.
- Use semantic structure where practical.
"""
