#!/bin/bash

# JARVIS Chat VPS Webhook Server Deployment Script
# This script configures and deploys the webhook server on the VPS

set -e

echo "🚀 Starting JARVIS Webhook Server deployment..."

# Configuration
PROJECT_ROOT="/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT"
SERVICE_NAME="jarvis-webhook"
WEBHOOK_SECRET="bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h"

# Create project directories
echo "📁 Creating project directories..."
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/scripts"

# Backup existing environment file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "💾 Backing up existing environment file..."
    cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > "$PROJECT_ROOT/.env" << EOF
# JARVIS Chat VPS Environment Configuration
WEBHOOK_SECRET=$WEBHOOK_SECRET
WEBHOOK_PORT=9000
PROJECT_ROOT=$PROJECT_ROOT
NODE_ENV=production
WEBSOCKET_PORT=9001
LOGS_DIR=$PROJECT_ROOT/logs
EOF

echo "✅ Environment file created at $PROJECT_ROOT/.env"

# Set proper permissions
chmod 600 "$PROJECT_ROOT/.env"
echo "🔒 Environment file permissions set (600)"

# Copy webhook server script
echo "📋 Copying webhook server script..."
cp vps-webhook-server.cjs "$PROJECT_ROOT/scripts/"
chmod +x "$PROJECT_ROOT/scripts/vps-webhook-server.cjs"

# Copy systemd service file
echo "🔧 Installing systemd service..."
sudo cp jarvis-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload

# Stop existing service if running
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "⏹️ Stopping existing webhook service..."
    sudo systemctl stop $SERVICE_NAME
fi

# Enable and start service
echo "▶️ Starting webhook service..."
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# Check service status
echo "🔍 Checking service status..."
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Webhook service is running successfully"
    sudo systemctl status $SERVICE_NAME --no-pager -l
else
    echo "❌ Failed to start webhook service"
    sudo systemctl status $SERVICE_NAME --no-pager -l
    exit 1
fi

# Test webhook endpoints
echo "🧪 Testing webhook endpoints..."

# Test health endpoint
echo "Testing health endpoint..."
if curl -f http://localhost:9000/health; then
    echo "✅ Health endpoint is responding"
else
    echo "❌ Health endpoint is not responding"
fi

# Test webhook signature verification
echo "🔐 Testing webhook signature verification..."
TEST_PAYLOAD='{"zen":"Design for failure.","hook_id":12345678}'
TEST_SIGNATURE=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')

echo "Test payload: $TEST_PAYLOAD"
echo "Expected signature: $TEST_SIGNATURE"

if curl -X POST http://localhost:9000/webhook/deploy \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -H "X-Hub-Signature-256: $TEST_SIGNATURE" \
    -d "$TEST_PAYLOAD"; then
    echo "✅ Webhook signature verification is working"
else
    echo "❌ Webhook signature verification failed"
fi

echo ""
echo "🎉 Webhook server deployment completed!"
echo ""
echo "📊 Service Information:"
echo "  - Service: $SERVICE_NAME"
echo "  - Webhook Port: 9000"
echo "  - WebSocket Port: 9001"
echo "  - Project Root: $PROJECT_ROOT"
echo "  - Logs: $PROJECT_ROOT/logs"
echo ""
echo "📋 Management Commands:"
echo "  - Check status: sudo systemctl status $SERVICE_NAME"
echo "  - View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  - Restart: sudo systemctl restart $SERVICE_NAME"
echo "  - Stop: sudo systemctl stop $SERVICE_NAME"
echo ""
echo "🌐 Endpoints:"
echo "  - Health: http://localhost:9000/health"
echo "  - Webhook: http://localhost:9000/webhook/deploy"
echo "  - Logs: http://localhost:9000/logs"
echo "  - Dashboard: http://localhost:9000/dashboard"