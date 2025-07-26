# Webhook Configuration Validation Checklist

## 🎯 Quick Reference for Webhook Authentication Failures

This checklist provides a systematic approach to diagnosing and resolving webhook authentication issues.

## ✅ Primary Validation Checklist

### 1. Environment Variable Verification

**Check VPS Environment Configuration:**
```bash
# Verify environment file exists
[ -f /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env ] && echo "✅ Environment file exists" || echo "❌ Environment file missing"

# Check webhook secret is set
grep "WEBHOOK_SECRET=bxWGYH5dx8" /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env && echo "✅ Webhook secret configured" || echo "❌ Webhook secret missing"

# Verify file permissions
[ "$(stat -c '%a' /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env)" = "600" ] && echo "✅ Secure permissions" || echo "⚠️ Insecure permissions"
```

### 2. Service Status Verification

**Check Webhook Service:**
```bash
# Service status
systemctl is-active jarvis-webhook && echo "✅ Service running" || echo "❌ Service not running"

# Environment variables loaded
systemctl show jarvis-webhook -p Environment | grep -q "WEBHOOK_SECRET=bxWGYH5dx8" && echo "✅ Environment loaded" || echo "❌ Environment not loaded"

# Service logs
journalctl -u jarvis-webhook -n 5 --no-pager
```

### 3. Connectivity Testing

**Test Webhook Endpoints:**
```bash
# Health check
curl -f http://localhost:9000/health && echo "✅ Health endpoint OK" || echo "❌ Health endpoint failed"

# Webhook signature test
WEBHOOK_SECRET="bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h"
TEST_PAYLOAD='{"zen":"Validation test","hook_id":12345678}'
TEST_SIGNATURE=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')

curl -X POST http://localhost:9000/webhook/deploy \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -H "X-Hub-Signature-256: $TEST_SIGNATURE" \
    -d "$TEST_PAYLOAD" && echo "✅ Signature verification working" || echo "❌ Signature verification failed"
```

### 4. GitHub Configuration Verification

**GitHub Webhook Settings Checklist:**
- [ ] Payload URL: `http://69.62.71.229:9000/webhook/deploy`
- [ ] Content type: `application/json`
- [ ] Secret: `bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h`
- [ ] Events: "Workflow runs" and "Ping" selected
- [ ] Active: Webhook is enabled

## 🔧 Diagnostic Commands

### Quick Diagnostic Script

```bash
#!/bin/bash
# webhook-quick-check.sh

echo "🔍 JARVIS Webhook Quick Diagnostic"
echo "================================="

# Check 1: Service Status
echo -e "\n1. Service Status:"
if systemctl is-active --quiet jarvis-webhook; then
    echo "✅ Service running"
    systemctl show jarvis-webhook -p MainPID | cut -d= -f2 | xargs -I {} echo "   PID: {}"
else
    echo "❌ Service not running"
    echo "   Start: sudo systemctl start jarvis-webhook"
fi

# Check 2: Port Binding
echo -e "\n2. Port Status:"
if netstat -tlnp | grep -q ":9000.*LISTEN"; then
    echo "✅ Port 9000 listening"
    netstat -tlnp | grep ":9000.*LISTEN"
else
    echo "❌ Port 9000 not listening"
fi

# Check 3: Environment
echo -e "\n3. Environment Status:"
if [ -f "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env" ]; then
    echo "✅ Environment file exists"
    
    # Check webhook secret
    if grep -q "WEBHOOK_SECRET=bxWGYH5dx8" "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env"; then
        echo "✅ Webhook secret configured"
    else
        echo "❌ Webhook secret not found or incorrect"
    fi
    
    # Check permissions
    PERMS=$(stat -c "%a" "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env")
    if [ "$PERMS" = "600" ]; then
        echo "✅ Secure permissions (600)"
    else
        echo "⚠️ Permissions: $PERMS (should be 600)"
    fi
else
    echo "❌ Environment file missing"
fi

# Check 4: Connectivity
echo -e "\n4. Connectivity Test:"
if curl -f -s http://localhost:9000/health > /dev/null; then
    echo "✅ Health endpoint responding"
    
    # Quick signature test
    source /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env 2>/dev/null
    if [ -n "$WEBHOOK_SECRET" ]; then
        TEST_PAYLOAD='{"zen":"Quick test"}'
        TEST_SIG=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')
        
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:9000/webhook/deploy \
            -H "Content-Type: application/json" \
            -H "X-GitHub-Event: ping" \
            -H "X-Hub-Signature-256: $TEST_SIG" \
            -d "$TEST_PAYLOAD")
        
        if [ "$RESPONSE" = "200" ]; then
            echo "✅ Webhook signature verification working"
        else
            echo "❌ Webhook signature verification failed (HTTP $RESPONSE)"
        fi
    fi
else
    echo "❌ Health endpoint not responding"
fi

echo -e "\n🎯 Diagnostic Complete"
```

## 🚨 Common Issues and Quick Fixes

### Issue 1: "Invalid signature" Errors

**Quick Fix:**
```bash
# 1. Verify webhook secret matches
grep WEBHOOK_SECRET /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env

# 2. Expected value should be:
# WEBHOOK_SECRET=bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h

# 3. If incorrect, fix and restart:
sed -i 's/WEBHOOK_SECRET=.*/WEBHOOK_SECRET=bxWGYH5dx8\/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h/' /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env
systemctl restart jarvis-webhook
```

### Issue 2: Service Won't Start

**Quick Fix:**
```bash
# 1. Check logs
journalctl -u jarvis-webhook -n 20 --no-pager

# 2. Common causes:
# - Port already in use: netstat -tlnp | grep 9000
# - Permission issues: ls -la /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/
# - Missing Node.js: which node

# 3. Reset service:
systemctl stop jarvis-webhook
pkill -f "vps-webhook-server"
systemctl start jarvis-webhook
```

### Issue 3: Environment Not Loading

**Quick Fix:**
```bash
# 1. Check systemd service configuration
systemctl cat jarvis-webhook | grep Environment

# 2. Update service file if needed:
cp jarvis-chat/scripts/jarvis-webhook.service /etc/systemd/system/
systemctl daemon-reload
systemctl restart jarvis-webhook
```

## 📋 Pre-Deployment Validation

**Run Before Any Changes:**
```bash
# Create this as validate-before-deploy.sh
#!/bin/bash

echo "🔍 Pre-Deployment Validation"
echo "============================"

ERRORS=0

# Check 1: Backup exists
if [ ! -f "/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env.backup"* ]; then
    echo "⚠️ No environment backup found"
    echo "   Create backup: cp /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env.backup.$(date +%Y%m%d_%H%M%S)"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Environment backup exists"
fi

# Check 2: New configuration is valid
if [ -f "jarvis-chat/scripts/.env.production" ]; then
    if grep -q "WEBHOOK_SECRET=bxWGYH5dx8" "jarvis-chat/scripts/.env.production"; then
        echo "✅ New configuration is valid"
    else
        echo "❌ New configuration missing webhook secret"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ New configuration file not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Service is running
if systemctl is-active --quiet jarvis-webhook; then
    echo "✅ Current service is running"
else
    echo "⚠️ Current service is not running"
fi

# Check 4: GitHub webhook configuration
echo -e "\n📋 Manual Verification Required:"
echo "   1. GitHub webhook URL: http://69.62.71.229:9000/webhook/deploy"
echo "   2. GitHub webhook secret: bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h"
echo "   3. GitHub webhook events: Workflow runs, Ping"

if [ $ERRORS -eq 0 ]; then
    echo -e "\n✅ Pre-deployment validation passed"
    exit 0
else
    echo -e "\n❌ Pre-deployment validation failed ($ERRORS errors)"
    exit 1
fi
```

## 🧪 Post-Deployment Testing

**Run After Any Changes:**
```bash
#!/bin/bash
# post-deployment-test.sh

echo "🧪 Post-Deployment Testing"
echo "=========================="

TESTS_PASSED=0
TOTAL_TESTS=5

# Test 1: Service Status
echo -e "\nTest 1: Service Status"
if systemctl is-active --quiet jarvis-webhook; then
    echo "✅ PASS: Service is running"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ FAIL: Service is not running"
fi

# Test 2: Health Endpoint
echo -e "\nTest 2: Health Endpoint"
if curl -f -s http://localhost:9000/health > /dev/null; then
    echo "✅ PASS: Health endpoint responding"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ FAIL: Health endpoint not responding"
fi

# Test 3: Environment Loading
echo -e "\nTest 3: Environment Loading"
if systemctl show jarvis-webhook -p Environment | grep -q "WEBHOOK_SECRET=bxWGYH5dx8"; then
    echo "✅ PASS: Environment variables loaded"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ FAIL: Environment variables not loaded"
fi

# Test 4: Valid Signature Acceptance
echo -e "\nTest 4: Valid Signature Acceptance"
source /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env 2>/dev/null
if [ -n "$WEBHOOK_SECRET" ]; then
    TEST_PAYLOAD='{"zen":"Post-deployment test"}'
    TEST_SIG=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print "sha256="$2}')
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:9000/webhook/deploy \
        -H "Content-Type: application/json" \
        -H "X-GitHub-Event: ping" \
        -H "X-Hub-Signature-256: $TEST_SIG" \
        -d "$TEST_PAYLOAD")
    
    if [ "$RESPONSE" = "200" ]; then
        echo "✅ PASS: Valid signature accepted"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "❌ FAIL: Valid signature rejected (HTTP $RESPONSE)"
    fi
else
    echo "❌ FAIL: Cannot load webhook secret"
fi

# Test 5: Invalid Signature Rejection
echo -e "\nTest 5: Invalid Signature Rejection"
INVALID_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:9000/webhook/deploy \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -H "X-Hub-Signature-256: sha256=invalid_signature" \
    -d '{"test":"invalid"}')

if [ "$INVALID_RESPONSE" = "401" ]; then
    echo "✅ PASS: Invalid signature rejected"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ FAIL: Invalid signature not rejected (HTTP $INVALID_RESPONSE)"
fi

# Summary
echo -e "\n" + "="*50
echo "📊 Test Results: $TESTS_PASSED/$TOTAL_TESTS tests passed"

if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
    echo "🎉 All post-deployment tests passed!"
    echo "✅ Webhook configuration is working correctly"
    exit 0
else
    echo "❌ Some tests failed - investigate issues before proceeding"
    exit 1
fi
```

## 🔄 Recovery Procedures

### Emergency Rollback

```bash
#!/bin/bash
# emergency-rollback.sh

echo "🚨 Emergency Webhook Configuration Rollback"
echo "==========================================="

# Find most recent backup
BACKUP_FILE=$(ls -t /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env.backup.* 2>/dev/null | head -1)

if [ -n "$BACKUP_FILE" ]; then
    echo "📦 Restoring from backup: $BACKUP_FILE"
    
    # Create rollback backup
    cp /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env \
       /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env.rollback.$(date +%Y%m%d_%H%M%S)
    
    # Restore backup
    cp "$BACKUP_FILE" /root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT/.env
    
    # Restart service
    systemctl restart jarvis-webhook
    
    # Verify restoration
    if systemctl is-active --quiet jarvis-webhook && curl -f -s http://localhost:9000/health > /dev/null; then
        echo "✅ Rollback successful - service restored"
    else
        echo "❌ Rollback failed - manual intervention required"
        exit 1
    fi
else
    echo "❌ No backup file found - cannot rollback automatically"
    echo "   Manual recovery required"
    exit 1
fi
```

---

## 📞 Emergency Contacts

**If all troubleshooting fails:**

1. **Check service logs**: `journalctl -u jarvis-webhook -f`
2. **Check system resources**: `df -h && free -m`
3. **Check network connectivity**: `netstat -tlnp | grep 9000`
4. **Contact system administrator**

**Critical failure indicators requiring immediate attention:**
- Service repeatedly crashing
- Webhook secret potentially compromised
- Multiple authentication failures
- System resource exhaustion

---

*This checklist is part of Story 005.001: Webhook Secret Synchronization implementation.*