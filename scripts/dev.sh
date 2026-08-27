#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Start backend
if lsof -ti:8000 >/dev/null 2>&1; then
  echo "Backend already running on :8000"
else
  echo "==> Starting backend on :8000"
  (cd "$ROOT/backend" && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000) &
fi

# Start frontend
if lsof -ti:3000 >/dev/null 2>&1; then
  echo "Frontend already running on :3000"
else
  echo "==> Starting frontend on :3000"
  (cd "$ROOT/frontend" && npm run dev) &
fi

echo ""
echo "QuikDrop is running:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:8000/api"
echo "  Health:   http://localhost:8000/api/health"
echo ""
echo "Press Ctrl+C to stop."
wait
