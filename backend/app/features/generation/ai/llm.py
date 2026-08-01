from typing import Any

from openai import AsyncOpenAI

from app.core.logging import get_logger

logger = get_logger(__name__)

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
HUGGINGFACE_BASE_URL = "https://router.huggingface.co/v1"

DEFAULT_MODEL = "google/gemma-4-26b-a4b-it:free"
DEFAULT_HUGGINGFACE_MODEL = "openai/gpt-oss-120b:fastest"


class LLMClient:
    def __init__(
        self,
        *,
        openrouter_api_key: str | None,
        huggingface_api_key: str | None,
        openrouter_model: str = DEFAULT_MODEL,
        huggingface_model: str = DEFAULT_HUGGINGFACE_MODEL,
    ) -> None:
        self.openrouter_model = openrouter_model
        self.huggingface_model = huggingface_model
        self.openrouter_client = (
            AsyncOpenAI(api_key=openrouter_api_key, base_url=OPENROUTER_BASE_URL)
            if openrouter_api_key
            else None
        )
        self.huggingface_client = (
            AsyncOpenAI(api_key=huggingface_api_key, base_url=HUGGINGFACE_BASE_URL)
            if huggingface_api_key
            else None
        )

        if not self.openrouter_client and not self.huggingface_client:
            raise RuntimeError(
                "Add your OpenRouter API key and Hugging Face token in settings."
            )

    async def chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs: Any,
    ) -> str:
        """Try OpenRouter first, fall back to Hugging Face on failure."""
        last_error: Exception | None = None

        if self.openrouter_client:
            try:
                return await self._complete(
                    self.openrouter_client,
                    self.openrouter_model,
                    messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs,
                )
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "OpenRouter call failed; trying Hugging Face fallback: %s", exc
                )

        if self.huggingface_client:
            try:
                return await self._complete(
                    self.huggingface_client,
                    self.huggingface_model,
                    messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs,
                )
            except Exception as exc:
                if last_error:
                    raise RuntimeError(
                        f"OpenRouter failed: {last_error}; Hugging Face failed: {exc}"
                    ) from exc
                raise

        if last_error:
            raise RuntimeError(
                f"OpenRouter failed and no Hugging Face token is configured: {last_error}"
            ) from last_error

        raise RuntimeError("No LLM provider is configured")

    @staticmethod
    async def _complete(
        client: AsyncOpenAI,
        model: str,
        messages: list[dict[str, str]],
        *,
        temperature: float,
        max_tokens: int,
        **kwargs: Any,
    ) -> str:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )
        return response.choices[0].message.content or ""


def get_llm(
    *,
    openrouter_api_key: str,
    huggingface_token: str,
    openrouter_model: str = DEFAULT_MODEL,
    huggingface_model: str = DEFAULT_HUGGINGFACE_MODEL,
) -> LLMClient:
    return LLMClient(
        openrouter_api_key=openrouter_api_key,
        huggingface_api_key=huggingface_token,
        openrouter_model=openrouter_model,
        huggingface_model=huggingface_model,
    )
