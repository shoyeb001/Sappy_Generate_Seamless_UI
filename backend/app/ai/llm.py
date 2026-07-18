import os
from functools import lru_cache
from typing import Any

from openai import AsyncOpenAI

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "cohere/north-mini-code:free"


class OpenRouterLLM:
    def __init__(
        self,
        api_key: str,
        model: str = DEFAULT_MODEL,
        base_url: str = OPENROUTER_BASE_URL,
    ) -> None:
        self.model = model
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
        )

    async def chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs: Any,
    ) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )

        content = response.choices[0].message.content
        return content or ""


@lru_cache
def get_llm() -> OpenRouterLLM:
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")

    return OpenRouterLLM(
        api_key=api_key,
        model=os.getenv("OPENROUTER_MODEL", DEFAULT_MODEL),
    )
