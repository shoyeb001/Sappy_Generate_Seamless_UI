from typing import Any

from openai import AsyncOpenAI

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
HUGGINGFACE_BASE_URL = "https://router.huggingface.co/v1"

DEFAULT_MODEL = "google/gemma-4-26b-a4b-it:free"
DEFAULT_HUGGINGFACE_MODEL = "openai/gpt-oss-120b:fastest"



class LLMClient:
    def __init__(
        self,
        *,
        openrouter_api_key: str | None,
        openrouter_model: str = DEFAULT_MODEL,
        huggingface_api_key: str | None,
        huggingface_model: str = DEFAULT_HUGGINGFACE_MODEL,
    ) -> None:
        self.openrouter_model = openrouter_model
        self.huggingface_model = huggingface_model
        self.openrouter_client = (
            AsyncOpenAI(
                api_key=openrouter_api_key,
                base_url=OPENROUTER_BASE_URL,
            )
            if openrouter_api_key
            else None
        )
        self.huggingface_client = (
            AsyncOpenAI(
                api_key=huggingface_api_key,
                base_url=HUGGINGFACE_BASE_URL,
            )
            if huggingface_api_key
            else None
        )

        if not self.openrouter_client and not self.huggingface_client:
            raise RuntimeError(
                "Add your OpenRouter API key and Hugging Face token in settings."
            )
        if not self.openrouter_client:
            raise RuntimeError(
                "Add your OpenRouter API key in settings."
            )

    async def chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs: Any,
    ) -> str:
        last_error: Exception | None = None

        if self.huggingface_client:
            try:
                response = await self.huggingface_client.chat.completions.create(
                    model=self.huggingface_model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs,
                )
                content = response.choices[0].message.content
                return content or ""
            except Exception as exc:
                if last_error:
                    raise RuntimeError(
                        f"OpenRouter failed: {last_error}; Hugging Face failed: {exc}"
                    ) from exc
                raise
        if self.openrouter_client:
            try:
                response = await self.openrouter_client.chat.completions.create(
                    model=self.openrouter_model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs,
                )
                content = response.choices[0].message.content
                return content or ""
            except Exception as exc:
                last_error = exc
                print(f"OpenRouter call failed; trying Hugging Face fallback: {exc}")
        if last_error:
            raise RuntimeError(
                f"OpenRouter failed and no Hugging Face token is configured: {last_error}"
            ) from last_error

        raise RuntimeError("No LLM provider is configured")


def get_llm(
    *,
    openrouter_api_key: str,
    huggingface_token: str,
    openrouter_model: str = DEFAULT_MODEL,
    huggingface_model: str = DEFAULT_HUGGINGFACE_MODEL,
) -> LLMClient:
    return LLMClient(
        openrouter_api_key=openrouter_api_key,
        openrouter_model=openrouter_model,
        huggingface_api_key=huggingface_token,
        huggingface_model=huggingface_model,
    )
