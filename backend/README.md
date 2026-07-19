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
Inference Providers if OpenRouter fails or hits a rate limit. Provider API keys
are supplied per user from the frontend settings page, not from environment
variables.

```bash
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
HUGGINGFACE_MODEL=openai/gpt-oss-120b:fastest
```

## Auth and Database Environment

Authentication is handled by this FastAPI backend. Supabase is used only as
Postgres storage, so provide a Supabase Postgres connection string rather than
Supabase Auth API keys.

```bash
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
# or
SUPABASE_DATABASE_URL=postgresql://postgres:password@host:5432/postgres
# SUPABASE_URL is also accepted if you want to store the Postgres URL there.

AUTH_JWT_SECRET=replace_with_a_long_random_secret
AUTH_CREDENTIALS_SECRET=replace_with_another_long_random_secret
AUTH_ACCESS_TOKEN_MINUTES=15
AUTH_REFRESH_TOKEN_DAYS=30
REDIS_URL=redis://localhost:6379/0
LLM_CREDENTIALS_CACHE_TTL_SECONDS=3600

OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
HUGGINGFACE_MODEL=openai/gpt-oss-120b:fastest
```

On startup the backend creates:

```text
auth_users
auth_refresh_tokens
user_llm_credentials
```

Users add their own OpenRouter API key and Hugging Face token from the frontend
settings page. Those provider credentials are encrypted before being stored and
are decrypted only when the authenticated user starts a generation request.
If `REDIS_URL` is configured, encrypted provider credentials are cached by user
id before falling back to Postgres.

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
