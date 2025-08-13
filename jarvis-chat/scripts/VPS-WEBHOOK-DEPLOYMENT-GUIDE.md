# VPS Webhook Server Deployment Guide

## 🚀 Complete VPS Webhook Configuration for Story 005.001

This guide provides step-by-step instructions for configuring the webhook secret synchronization between GitHub and the VPS server.

## 📋 Prerequisites

- VPS access with root privileges
- Node.js installed on VPS
- systemd for service management
- curl for testing

## 🔧 Task 1: VPS Environment Configuration

### Step 1: Access VPS and Navigate to Project Directory

```bash
# SSH into your VPS
ssh root@69.62.71.229

# Navigate to project directory
cd /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT
```

### Step 2: Backup Existing Configuration

```bash
# Backup existing environment file if it exists
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
fi
```

### Step 3: Create Environment Configuration

```bash
# Create the .env file with correct webhook secret
cat > .env << 'EOF'
# JARVIS Chat VPS Environment Configuration
WEBHOOK_SECRET=bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h
WEBHOOK_PORT=9000
PROJECT_ROOT=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT
NODE_ENV=production
WEBSOCKET_PORT=9001
LOGS_DIR=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs
EOF

# Set secure permissions
chmod 600 .env
echo "✅ Environment file created with secure permissions"
```

### Step 4: Verify Environment Variable Format

```bash
# Check the environment file contents
cat .env | grep WEBHOOK_SECRET

# Expected output:
# WEBHOOK_SECRET=bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h
```

## ⚙️ Task 2: Webhook Server Service Restart

### Step 1: Update Systemd Service File

```bash
# Update the systemd service file
cat > /etc/systemd/system/jarvis-webhook.service << 'EOF'
[Unit]
Description=JARVIS Chat Webhook Server
Documentation=https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT
After=network.target docker.service
Requires=network.target docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT
ExecStart=/usr/bin/node /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/scripts/vps-webhook-server.cjs
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=jarvis-webhook

# Environment variables
Environment=NODE_ENV=production
Environment=WEBHOOK_PORT=9000
Environment=WEBHOOK_SECRET=bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h
Environment=PROJECT_ROOT=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=false
ReadWritePaths=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT

[Install]
WantedBy=multi-user.target
EOF
```

### Step 2: Restart Webhook Server

```bash
# Reload systemd configuration
systemctl daemon-reload

# Stop existing service if running
systemctl stop jarvis-webhook

# Start the service with new configuration
systemctl start jarvis-webhook

# Enable auto-start on boot
systemctl enable jarvis-webhook

# Check service status
systemctl status jarvis-webhook
```

### Step 3: Verify Service Startup

```bash
# Check that service started successfully
systemctl is-active jarvis-webhook
# Expected output: active

# View recent logs
journalctl -u jarvis-webhook -n 20 --no-pager

# Expected log entries should show:
# - Server starting on port 9000
# - WebSocket server on port 9001  
# - Environment variables loaded correctly
```

## 🧪 Task 3: Signature Verification Testing

### Step 1: Test Health Endpoint

```bash
# Test basic connectivity
curl -f http://localhost:9000/health

# Expected response:
# {"status":"healthy","timestamp":"...","connectedClients":0}
```

### Step 2: Test Webhook Signature Verification

```bash
# Set variables for testing
WEBHOOK_SECRET="bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h"
TEST_PAYLOAD='{"zen":"Design for failure.","hook_id":12345678,"repository":{"name":"J.A.R.V.I.S-PROJECT"}}'

# Calculate correct signature
TEST_SIGNATURE=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')

echo "Test Payload: $TEST_PAYLOAD"
echo "Calculated Signature: $TEST_SIGNATURE"

# Test ping event with correct signature
curl -X POST http://localhost:9000/webhook/deploy \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -H "X-Hub-Signature-256: $TEST_SIGNATURE" \
    -d "$TEST_PAYLOAD"

# Expected response:
# {"message":"Webhook ping received successfully","status":"healthy","timestamp":"..."}
```

### Step 3: Test Invalid Signature Rejection

```bash
# Test with invalid signature
curl -X POST http://localhost:9000/webhook/deploy \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -H "X-Hub-Signature-256: sha256=invalid_signature_here" \
    -d "$TEST_PAYLOAD"

# Expected response:
# {"error":"Invalid signature"}
# HTTP Status: 401
```

## 🔄 Task 4: End-to-End Payload Processing

### Step 1: Test Workflow Run Event

```bash
# Create workflow_run test payload
WORKFLOW_PAYLOAD='{"action":"completed","workflow_run":{"conclusion":"success","head_sha":"abcd1234567890abcdef1234567890abcdef1234","name":"Deploy to VPS"},"repository":{"name":"J.A.R.V.I.S-PROJECT"}}'

# Calculate signature for workflow payload
WORKFLOW_SIGNATURE=$(echo -n "$WORKFLOW_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')

# Test workflow_run event
curl -X POST http://localhost:9000/webhook/deploy \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: workflow_run" \
    -H "X-Hub-Signature-256: $WORKFLOW_SIGNATURE" \
    -d "$WORKFLOW_PAYLOAD"

# Expected response:
# {"message":"Deployment initiated","version":"abcd123","timestamp":"..."}
```

### Step 2: Test WebSocket Notifications

```bash
# In one terminal, monitor WebSocket connections
# (This requires a WebSocket client like wscat or websocat)
# wscat -c ws://localhost:9001

# The workflow_run test above should trigger deployment notifications
# Check logs for WebSocket client connections:
journalctl -u jarvis-webhook -f | grep "Client connected"
```

### Step 3: Verify Logging Functionality

```bash
# Check webhook logs
curl http://localhost:9000/logs

# Check log files
tail -f /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/webhook.log

# Expected entries:
# - WEBHOOK_PING events
# - WEBHOOK_RECEIVED events  
# - DEPLOYMENT_START events (for workflow_run)
```

## 📊 Monitoring and Troubleshooting

### Service Management Commands

```bash
# Check service status
systemctl status jarvis-webhook

# View live logs
journalctl -u jarvis-webhook -f

# Restart service
systemctl restart jarvis-webhook

# Stop service
systemctl stop jarvis-webhook

# Check if service is running
systemctl is-active jarvis-webhook
```

### Common Issues and Solutions

#### Issue: Service fails to start
**Solution:**
```bash
# Check logs for error details
journalctl -u jarvis-webhook -n 50

# Common causes:
# - Port 9000 already in use: netstat -tlnp | grep 9000
# - Permission issues: check file permissions
# - Missing dependencies: npm install in project directory
```

#### Issue: Signature verification fails
**Solution:**
```bash
# Verify environment variable is set correctly
systemctl show jarvis-webhook -p Environment

# Check that WEBHOOK_SECRET matches GitHub webhook configuration
echo $WEBHOOK_SECRET

# Test signature calculation manually:
echo -n 'test' | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET"
```

#### Issue: GitHub webhook not reaching server
**Solution:**
```bash
# Check firewall settings
ufw status

# Ensure port 9000 is open
ufw allow 9000

# Test external connectivity (from another machine)
curl http://69.62.71.229:9000/health
```

## ✅ Validation Checklist

- [ ] Environment variable `WEBHOOK_SECRET` is set correctly on VPS
- [ ] Webhook server starts successfully on port 9000
- [ ] WebSocket server starts successfully on port 9001
- [ ] Health endpoint responds: `curl http://localhost:9000/health`
- [ ] Ping events are processed correctly with valid signature
- [ ] Invalid signatures are rejected with 401 status
- [ ] Workflow_run events trigger deployment process
- [ ] WebSocket notifications are sent to connected clients
- [ ] All events are logged to webhook.log file
- [ ] Service auto-starts on server reboot

## 🔐 Security Considerations

1. **Environment File Permissions**: Ensure `.env` file has 600 permissions
2. **Webhook Secret**: Never log or expose the webhook secret in application logs
3. **Signature Verification**: Always use timing-safe comparison for signatures
4. **Service User**: Run service with minimal required privileges
5. **Firewall**: Only open necessary ports (9000, 9001)

## 📞 Support

If you encounter issues during deployment:

1. Check service logs: `journalctl -u jarvis-webhook -f`
2. Verify environment variables: `systemctl show jarvis-webhook -p Environment`
3. Test connectivity: `curl http://localhost:9000/health`
4. Check GitHub webhook configuration matches VPS secret

This completes the webhook secret synchronization for Story 005.001.