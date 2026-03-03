#!/bin/bash
# ============================================================
# deploy.sh — Deploy crm-api (NestJS) lên INET server
# Usage: bash deploy.sh
# Prerequisites: SSH key đã được thêm vào server
# ============================================================

set -e  # Dừng ngay nếu có lỗi

# ─── Config ─────────────────────────────────────────────────
SERVER_USER="root"
SERVER_HOST="your-server-ip"      # ← THAY bằng IP server thực của bạn
SERVER_PORT=22
REMOTE_DIR="/var/www/crm-api"
LOCAL_DIR="$(dirname "$0")"       # Thư mục chứa script này (crm-api/)

# ─── Colors ─────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"; exit 1; }

# ─── Step 1: Local build ────────────────────────────────────
log "🔨 Step 1/5: Local build..."
cd "$LOCAL_DIR"
npm run build || error "Build failed"
log "Build thành công ✅"

# ─── Step 2: Create remote dir ──────────────────────────────
log "📁 Step 2/5: Tạo thư mục trên server..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"

# ─── Step 3: Upload files ───────────────────────────────────
log "📤 Step 3/5: Upload files (rsync)..."
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='.git' \
  -e "ssh -p $SERVER_PORT" \
  "$LOCAL_DIR/" \
  "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/"

log "Upload thành công ✅"

# ─── Step 4: Remote setup ───────────────────────────────────
log "⚙️  Step 4/5: Cài dependencies và khởi động PM2..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'REMOTE_SCRIPT'
  set -e
  cd /var/www/crm-api

  # Install prod deps only
  npm install --omit=dev

  # Create log dir
  mkdir -p /var/log/pm2

  # PM2: start or reload
  if pm2 describe crm-api > /dev/null 2>&1; then
    echo "Reloading existing PM2 process..."
    pm2 reload ecosystem.config.js --env production
  else
    echo "Starting new PM2 process..."
    pm2 start ecosystem.config.js --env production
    pm2 save
  fi

  echo "PM2 status:"
  pm2 status crm-api
REMOTE_SCRIPT

log "Server setup thành công ✅"

# ─── Step 5: Health check ───────────────────────────────────
log "🏥 Step 5/5: Health check..."
sleep 3

PROD_API_URL="http://$SERVER_HOST:3002/api/v1"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_API_URL/health" 2>/dev/null || echo "000")

if [ "$HEALTH" = "200" ]; then
  log "🎉 Deploy thành công! Health check: $HEALTH"
  log ""
  log "📋 Checklist sau deploy:"
  log "  1. Cập nhật NEXT_PUBLIC_API_URL trên Vercel → https://api.tranhoangnhu.website/api/v1"
  log "  2. Cập nhật CORS_ORIGINS trong /var/www/crm-api/.env trên server"
  log "  3. Cài SSL: certbot --nginx -d api.tranhoangnhu.website"
  log "  4. Chạy test: node test-api.js https://api.tranhoangnhu.website/api/v1"
else
  warn "Health check trả về: $HEALTH (có thể cần thêm thời gian hoặc check firewall)"
  warn "Thử thủ công: curl $PROD_API_URL/health"
fi
