#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "==> Setting up backend..."
cd backend
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements.txt
cd ..

echo "==> Setting up frontend..."
cd frontend
npm install --silent 2>/dev/null || true
cd ..

echo ""
echo "QuikDrop is ready. Run:"
echo "  ./scripts/dev.sh"
echo ""
