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
