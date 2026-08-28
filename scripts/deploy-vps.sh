#!/bin/bash
# QuikDrop Safe Deploy Script
# SOT App: https://github.com/kopipes/quickdrop.git
# SOT DB:  VPS (/var/www/quikdrop/backend/data/quikdrop.db) — never overwritten by deploy
# Usage:   sudo bash /var/www/quikdrop/scripts/deploy-vps.sh [rollback]

set -e
APP_DIR=/var/www/quikdrop
BACKUP_DIR=/var/www/quikdrop-backups
REPO=https://github.com/kopipes/quickdrop.git
DOMAIN=quikdrop.devop.my.id
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

if [ "$1" == "rollback" ]; then
  LATEST=$(ls -t $BACKUP_DIR 2>/dev/null | head -1)
  if [ -z "$LATEST" ]; then
    echo "No backups found in $BACKUP_DIR"
    exit 1
  fi
  echo "Rolling back app code to: $LATEST"
  sudo rsync -a --delete $BACKUP_DIR/$LATEST/ $APP_DIR/
  echo "Restarting services..."
  sudo systemctl restart quikdrop-backend quikdrop-frontend
  echo "Rollback complete to $LATEST"
  exit 0
fi

echo "=== QuikDrop Deploy $TIMESTAMP ==="

echo "1. Backing up current app code (NOT the DB)..."
if [ -d "$APP_DIR" ]; then
  sudo mkdir -p $BACKUP_DIR/$TIMESTAMP
  sudo rsync -a --exclude='backend/data' --exclude='backend/tmp' --exclude='backend/.venv' --exclude='frontend/node_modules' --exclude='frontend/.next' --exclude='.git' $APP_DIR/ $BACKUP_DIR/$TIMESTAMP/
  echo "   Backup saved: $BACKUP_DIR/$TIMESTAMP"
fi

echo "2. Pulling latest from GitHub..."
cd $APP_DIR
sudo git fetch origin main
sudo git reset --hard origin/main

echo "3. Installing backend dependencies..."
cd $APP_DIR/backend
sudo -u bob bash -c "python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt"

echo "4. Installing frontend dependencies + building..."
cd $APP_DIR/frontend
sudo -u bob bash -c "npm install --silent && NEXT_PUBLIC_API_URL=https://$DOMAIN npx next build"

echo "5. Setting permissions..."
sudo chown -R bob:bob $APP_DIR

echo "6. Restarting services..."
sudo systemctl restart quikdrop-backend quikdrop-frontend
sleep 3
sudo systemctl is-active quikdrop-backend quikdrop-frontend

echo "7. Reloading nginx (config unchanged, but verify)..."
sudo nginx -t && sudo systemctl reload nginx

echo "8. Keeping last 5 backups..."
ls -t $BACKUP_DIR | tail -n +6 | xargs -I{} sudo rm -rf $BACKUP_DIR/{}

echo "=== Deploy complete! ==="
echo "   Site: https://$DOMAIN"
echo "   Rollback: sudo bash $APP_DIR/scripts/deploy-vps.sh rollback"
