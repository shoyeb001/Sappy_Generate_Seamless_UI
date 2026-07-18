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
