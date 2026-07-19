# AI UI Generator Backend

FastAPI backend for the hackathon prompt-to-UI generation MVP.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## LLM Environment

The backend tries OpenRouter first and automatically falls back to Hugging Face
Inference Providers if OpenRouter fails or hits a rate limit.

```bash
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free

HF_TOKEN=your_huggingface_token
HUGGINGFACE_MODEL=openai/gpt-oss-120b:fastest
```

You can also use `HUGGINGFACE_API_KEY` instead of `HF_TOKEN`.

## Demo Health Check

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ai-ui-generator-backend",
  "timestamp": "2026-07-18T00:00:00+00:00"
}
```
