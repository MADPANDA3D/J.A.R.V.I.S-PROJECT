# Webhook Environment Management Procedures

## 🔧 Environment Variable Management Best Practices

This document provides comprehensive procedures for managing webhook environment variables, troubleshooting authentication failures, and maintaining secure webhook configurations.

## 📋 Table of Contents

1. [Environment Variable Configuration](#environment-variable-configuration)
2. [Webhook Secret Synchronization](#webhook-secret-synchronization)
3. [VPS Environment Management](#vps-environment-management)
4. [Troubleshooting Guide](#troubleshooting-guide)
5. [Security Best Practices](#security-best-practices)
6. [Validation Checklist](#validation-checklist)
7. [Maintenance Procedures](#maintenance-procedures)

## 🔑 Environment Variable Configuration

### Required Environment Variables

The webhook server requires the following environment variables:

```bash
# Primary webhook configuration
WEBHOOK_SECRET=bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h
WEBHOOK_PORT=9000

# Project paths
PROJECT_ROOT=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT
LOGS_DIR=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs

# Runtime configuration
NODE_ENV=production
WEBSOCKET_PORT=9001
```

### Environment File Locations

| Environment | File Path | Purpose |
|-------------|-----------|---------|
| Production VPS | `/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env` | Primary environment file |
| Systemd Service | `/etc/systemd/system/jarvis-webhook.service` | Service environment variables |
| Development | `jarvis-chat/scripts/.env.production` | Template file |

## 🔄 Webhook Secret Synchronization

### Step-by-Step Synchronization Process

#### 1. GitHub Webhook Configuration

1. Navigate to your GitHub repository settings
2. Go to "Webhooks" section
3. Edit or create webhook with:
   - **Payload URL**: `http://69.62.71.229:9000/webhook/deploy`
   - **Content Type**: `application/json`
   - **Secret**: `bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h`
   - **Events**: Select "Workflow runs" and "Ping"

#### 2. VPS Environment Synchronization

```bash
# Create backup of existing configuration
cp /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env \
   /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env.backup.$(date +%Y%m%d_%H%M%S)

# Update environment file
cat > /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env << 'EOF'
WEBHOOK_SECRET=bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h
WEBHOOK_PORT=9000
PROJECT_ROOT=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT
NODE_ENV=production
WEBSOCKET_PORT=9001
LOGS_DIR=/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs
EOF

# Set secure permissions
chmod 600 /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env
```

#### 3. Service Configuration Update

```bash
# Update systemd service file
sudo cp jarvis-chat/scripts/jarvis-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart jarvis-webhook
```

#### 4. Verification

```bash
# Test webhook secret synchronization
WEBHOOK_SECRET="bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h"
TEST_PAYLOAD='{"zen":"Design for failure.","hook_id":12345678}'
TEST_SIGNATURE=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')

curl -X POST http://localhost:9000/webhook/deploy \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -H "X-Hub-Signature-256: $TEST_SIGNATURE" \
    -d "$TEST_PAYLOAD"

# Expected response: {"message":"Webhook ping received successfully",...}
```

## 🖥️ VPS Environment Management

### Environment File Management

#### Creating New Environment Configuration

```bash
#!/bin/bash
# create-webhook-env.sh

WEBHOOK_SECRET="$1"
PROJECT_ROOT="${2:-/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT}"

if [ -z "$WEBHOOK_SECRET" ]; then
    echo "Usage: $0 <webhook-secret> [project-root]"
    exit 1
fi

# Create environment file
cat > "$PROJECT_ROOT/.env" << EOF
# JARVIS Chat Webhook Environment Configuration
# Generated on $(date)

# Webhook Configuration
WEBHOOK_SECRET=$WEBHOOK_SECRET
WEBHOOK_PORT=9000

# Project Configuration
PROJECT_ROOT=$PROJECT_ROOT
NODE_ENV=production

# WebSocket Configuration
WEBSOCKET_PORT=9001

# Logging Configuration
LOGS_DIR=$PROJECT_ROOT/logs
EOF

# Set secure permissions
chmod 600 "$PROJECT_ROOT/.env"
chown root:root "$PROJECT_ROOT/.env"

echo "✅ Environment file created at $PROJECT_ROOT/.env"
```

#### Environment Variable Validation

```bash
#!/bin/bash
# validate-webhook-env.sh

ENV_FILE="/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env"

echo "🔍 Validating webhook environment configuration..."

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file not found: $ENV_FILE"
    exit 1
fi

# Check file permissions
PERMS=$(stat -c "%a" "$ENV_FILE")
if [ "$PERMS" != "600" ]; then
    echo "⚠️ Environment file permissions should be 600, found: $PERMS"
    echo "Fix with: chmod 600 $ENV_FILE"
fi

# Load and validate required variables
source "$ENV_FILE"

# Validate WEBHOOK_SECRET
if [ -z "$WEBHOOK_SECRET" ]; then
    echo "❌ WEBHOOK_SECRET is not set"
    exit 1
elif [ ${#WEBHOOK_SECRET} -lt 32 ]; then
    echo "⚠️ WEBHOOK_SECRET seems too short (${#WEBHOOK_SECRET} characters)"
else
    echo "✅ WEBHOOK_SECRET is properly configured"
fi

# Validate WEBHOOK_PORT
if [ -z "$WEBHOOK_PORT" ] || [ "$WEBHOOK_PORT" != "9000" ]; then
    echo "❌ WEBHOOK_PORT should be 9000, found: $WEBHOOK_PORT"
    exit 1
else
    echo "✅ WEBHOOK_PORT is properly configured"
fi

# Validate PROJECT_ROOT
if [ -z "$PROJECT_ROOT" ] || [ ! -d "$PROJECT_ROOT" ]; then
    echo "❌ PROJECT_ROOT is invalid: $PROJECT_ROOT"
    exit 1
else
    echo "✅ PROJECT_ROOT is valid"
fi

echo "🎉 Environment configuration validation passed"
```

### Service Management

#### Service Status Check

```bash
#!/bin/bash
# check-webhook-service.sh

SERVICE_NAME="jarvis-webhook"

echo "🔍 Checking webhook service status..."

# Check if service is active
if systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ Service is running"
    
    # Show service status
    systemctl status $SERVICE_NAME --no-pager -l
    
    # Check environment variables
    echo -e "\n📋 Environment Variables:"
    systemctl show $SERVICE_NAME -p Environment | sed 's/Environment=//' | tr ' ' '\n'
    
    # Test connectivity
    echo -e "\n🔌 Testing connectivity..."
    if curl -f -s http://localhost:9000/health > /dev/null; then
        echo "✅ Health endpoint responding"
    else
        echo "❌ Health endpoint not responding"
    fi
    
else
    echo "❌ Service is not running"
    echo "Start with: sudo systemctl start $SERVICE_NAME"
    
    # Show recent logs
    echo -e "\n📝 Recent logs:"
    journalctl -u $SERVICE_NAME -n 10 --no-pager
fi
```

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Webhook Authentication Failures

**Symptoms:**
- HTTP 401 responses from webhook endpoint
- "Invalid signature" errors in logs
- GitHub webhook delivery failures

**Diagnosis:**
```bash
# Check current webhook secret
grep WEBHOOK_SECRET /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env

# Check service environment
systemctl show jarvis-webhook -p Environment | grep WEBHOOK_SECRET

# Test signature generation
echo -n '{"test":"payload"}' | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET"
```

**Solution:**
1. Verify GitHub webhook secret matches VPS configuration
2. Restart webhook service after environment changes
3. Test with known-good payload and signature

#### Issue 2: Environment File Not Loaded

**Symptoms:**
- Service starts but uses default values
- WEBHOOK_SECRET shows as 'your-webhook-secret-here'
- Environment variables not reflecting in service

**Diagnosis:**
```bash
# Check if environment file exists and is readable
ls -la /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env

# Check service configuration
systemctl cat jarvis-webhook

# Check service logs for environment loading
journalctl -u jarvis-webhook | grep -i env
```

**Solution:**
1. Ensure `.env` file exists with correct path
2. Update systemd service file with correct EnvironmentFile directive
3. Reload systemd and restart service

#### Issue 3: Permission Denied Errors

**Symptoms:**
- Service fails to start
- "Permission denied" in logs
- Cannot read environment file

**Diagnosis:**
```bash
# Check file ownership and permissions
ls -la /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env

# Check service user
systemctl show jarvis-webhook -p User

# Check directory permissions
ls -la /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/
```

**Solution:**
```bash
# Fix ownership and permissions
chown root:root /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env
chmod 600 /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env

# Ensure project directory is accessible
chmod 755 /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/
```

### Troubleshooting Workflow

```bash
#!/bin/bash
# troubleshoot-webhook.sh

echo "🔧 JARVIS Webhook Troubleshooting Tool"
echo "====================================="

# Step 1: Check service status
echo -e "\n1. Service Status Check:"
if systemctl is-active --quiet jarvis-webhook; then
    echo "✅ Service is running"
else
    echo "❌ Service is not running"
    echo "   Start: sudo systemctl start jarvis-webhook"
    echo "   Logs: journalctl -u jarvis-webhook -f"
fi

# Step 2: Check connectivity
echo -e "\n2. Connectivity Check:"
if curl -f -s http://localhost:9000/health > /dev/null; then
    echo "✅ Health endpoint accessible"
    curl http://localhost:9000/health | jq .
else
    echo "❌ Health endpoint not accessible"
    echo "   Check firewall: ufw status"
    echo "   Check port: netstat -tlnp | grep 9000"
fi

# Step 3: Check environment
echo -e "\n3. Environment Check:"
if [ -f "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env" ]; then
    echo "✅ Environment file exists"
    
    # Check permissions
    PERMS=$(stat -c "%a" "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env")
    if [ "$PERMS" == "600" ]; then
        echo "✅ Environment file permissions correct"
    else
        echo "⚠️ Environment file permissions: $PERMS (should be 600)"
    fi
    
    # Check webhook secret
    if grep -q "WEBHOOK_SECRET=bxWGYH5dx8" "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env"; then
        echo "✅ Webhook secret configured"
    else
        echo "❌ Webhook secret not configured correctly"
    fi
else
    echo "❌ Environment file missing"
    echo "   Create: cp jarvis-chat/scripts/.env.production /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env"
fi

# Step 4: Test webhook signature
echo -e "\n4. Signature Test:"
source /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env 2>/dev/null
if [ -n "$WEBHOOK_SECRET" ]; then
    TEST_PAYLOAD='{"zen":"Troubleshooting test"}'
    TEST_SIG=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')
    
    echo "Testing signature verification..."
    RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:9000/webhook/deploy \
        -H "Content-Type: application/json" \
        -H "X-GitHub-Event: ping" \
        -H "X-Hub-Signature-256: $TEST_SIG" \
        -d "$TEST_PAYLOAD")
    
    if [ "$RESULT" == "200" ]; then
        echo "✅ Signature verification working"
    else
        echo "❌ Signature verification failed (HTTP $RESULT)"
    fi
else
    echo "❌ Cannot test signature - WEBHOOK_SECRET not loaded"
fi

echo -e "\n🎯 Troubleshooting Complete"
```

## 🔒 Security Best Practices

### 1. Environment File Security

```bash
# Correct permissions and ownership
chmod 600 /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env
chown root:root /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env

# Prevent backup files from being readable
find /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/ -name ".env.*" -exec chmod 600 {} \;
```

### 2. Webhook Secret Management

- **Never commit secrets to version control**
- **Use strong, randomly generated secrets (64+ characters)**
- **Rotate secrets regularly (quarterly recommended)**
- **Store secrets in secure configuration management system**

### 3. Logging Security

```bash
# Ensure webhook secrets are not logged
grep -r "WEBHOOK_SECRET" /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/
# Should return no results

# Check systemd logs for secret exposure
journalctl -u jarvis-webhook | grep -i secret
# Should only show masked values
```

### 4. Network Security

```bash
# Restrict webhook access to GitHub IPs (optional)
# Get GitHub webhook IPs: https://api.github.com/meta

# Firewall configuration
ufw allow from 140.82.112.0/20 to any port 9000 comment 'GitHub webhooks'
ufw allow from 192.30.252.0/22 to any port 9000 comment 'GitHub webhooks'
```

## ✅ Validation Checklist

### Pre-Deployment Checklist

- [ ] **Environment File Created**: `.env` file exists at correct location
- [ ] **Secure Permissions**: Environment file has 600 permissions
- [ ] **Webhook Secret Set**: WEBHOOK_SECRET matches GitHub configuration
- [ ] **Required Variables**: All required environment variables present
- [ ] **Service Configuration**: Systemd service file updated
- [ ] **Backup Created**: Existing configuration backed up

### Post-Deployment Checklist

- [ ] **Service Running**: `systemctl is-active jarvis-webhook` returns "active"
- [ ] **Health Check**: `curl http://localhost:9000/health` returns 200
- [ ] **Port Listening**: `netstat -tlnp | grep 9000` shows listener
- [ ] **Environment Loaded**: Service shows correct environment variables
- [ ] **Signature Test**: Test webhook accepts valid signatures
- [ ] **Security Test**: Test webhook rejects invalid signatures
- [ ] **WebSocket Active**: WebSocket server running on port 9001
- [ ] **Logs Working**: Webhook events logged to file

### GitHub Integration Checklist

- [ ] **Webhook URL**: Points to correct VPS endpoint
- [ ] **Webhook Secret**: Matches VPS configuration exactly
- [ ] **Event Selection**: "Workflow runs" and "Ping" events enabled
- [ ] **Content Type**: Set to "application/json"
- [ ] **SSL Verification**: Enabled (if using HTTPS)
- [ ] **Delivery Test**: GitHub webhook delivery test successful

## 🔄 Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Tasks

```bash
#!/bin/bash
# weekly-webhook-maintenance.sh

echo "🔧 Weekly Webhook Maintenance"
echo "============================"

# Check service health
systemctl status jarvis-webhook --no-pager

# Check log file size
LOG_SIZE=$(du -h /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/webhook.log 2>/dev/null | cut -f1)
echo "Log file size: $LOG_SIZE"

# Rotate logs if over 100MB
if [ -f "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/webhook.log" ]; then
    SIZE_BYTES=$(stat -c%s "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/webhook.log")
    if [ $SIZE_BYTES -gt 104857600 ]; then  # 100MB
        echo "Rotating large log file..."
        mv /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/webhook.log \
           /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/webhook.log.$(date +%Y%m%d)
        systemctl restart jarvis-webhook
    fi
fi

# Check disk space
df -h /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/
```

#### Monthly Tasks

```bash
#!/bin/bash
# monthly-webhook-maintenance.sh

echo "🔧 Monthly Webhook Maintenance"
echo "============================="

# Archive old log files
find /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/ -name "*.log.*" -mtime +30 -exec gzip {} \;

# Archive old environment backups
find /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/ -name ".env.backup.*" -mtime +90 -delete

# Security audit
echo "Checking for secret exposure in logs..."
if grep -r "bxWGYH5dx8" /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/logs/ 2>/dev/null; then
    echo "⚠️ WARNING: Webhook secret found in logs - investigate immediately"
else
    echo "✅ No secret exposure found in logs"
fi

# Performance check
echo "Recent webhook performance:"
journalctl -u jarvis-webhook --since "1 month ago" | grep -c "WEBHOOK_RECEIVED"
```

### Emergency Procedures

#### Webhook Secret Compromise Response

```bash
#!/bin/bash
# emergency-secret-rotation.sh

echo "🚨 Emergency Webhook Secret Rotation"
echo "==================================="

# Generate new secret
NEW_SECRET=$(openssl rand -hex 32)
echo "New secret generated: $NEW_SECRET"

# Update environment file
cp /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env \
   /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env.emergency.$(date +%Y%m%d_%H%M%S)

sed -i "s/WEBHOOK_SECRET=.*/WEBHOOK_SECRET=$NEW_SECRET/" \
    /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env

# Update systemd service
sed -i "s/Environment=WEBHOOK_SECRET=.*/Environment=WEBHOOK_SECRET=$NEW_SECRET/" \
    /etc/systemd/system/jarvis-webhook.service

# Restart service
systemctl daemon-reload
systemctl restart jarvis-webhook

echo "✅ VPS webhook secret updated"
echo "⚠️ MANUAL ACTION REQUIRED: Update GitHub webhook secret to: $NEW_SECRET"
echo "⚠️ GitHub Settings → Webhooks → Edit webhook → Update secret"
```

---

## 📞 Support and Escalation

### Support Contacts

- **Primary**: Development Team
- **Escalation**: System Administrator
- **Emergency**: DevOps Team

### Documentation Updates

This document should be updated when:
- Webhook secrets are rotated
- Environment file locations change
- New environment variables are added
- Service configuration is modified
- Security procedures are updated

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|---------|
| 1.0 | 2025-07-26 | Initial environment management procedures | James (Dev Agent) |

---

*This document is part of Story 005.001: Webhook Secret Synchronization implementation.*