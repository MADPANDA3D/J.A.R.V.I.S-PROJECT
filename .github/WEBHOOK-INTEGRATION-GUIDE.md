# GitHub Actions Webhook Integration Guide

## 🔗 Webhook Integration Overview

This guide explains how the GitHub Actions workflow integrates with the VPS webhook server for automated deployments.

## 📋 Integration Flow

### 1. Workflow Trigger
- **Push Event**: Developer pushes code to `main` branch
- **Manual Trigger**: Workflow can be manually triggered via GitHub Actions UI
- **Workflow Start**: GitHub Actions starts the `Deploy to VPS` workflow

### 2. Build Pipeline
1. **Environment Setup**: Ubuntu runner with Node.js 20
2. **Code Checkout**: Repository code retrieved
3. **Dependencies**: NPM packages installed with `npm ci`
4. **Testing**: Full test suite execution
5. **Linting**: Code quality checks
6. **Type Checking**: TypeScript validation
7. **Build**: Production build generation
8. **Validation**: Build artifacts verification

### 3. Webhook Event Generation
- **Automatic Generation**: GitHub automatically generates `workflow_run` event when workflow completes
- **Event Payload**: Contains workflow status, repository info, commit details
- **Webhook Delivery**: GitHub delivers event to configured webhook endpoints

### 4. VPS Processing
- **Authentication**: VPS webhook server validates event using synchronized secret (Story 005.001)
- **Event Handling**: Enhanced payload handler processes workflow_run event (Story 005.002)
- **Deployment Trigger**: Successful workflows trigger VPS deployment automation

## ⚙️ Webhook Configuration Requirements

### GitHub Repository Webhook Settings

The repository webhook must be configured with:

- **Payload URL**: `http://69.62.71.229:9000/webhook/deploy`
- **Content Type**: `application/json`
- **Secret**: `bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h`
- **Events**: 
  - ✅ Workflow runs (for deployment automation)
  - ✅ Ping (for testing)
- **Active**: ✅ Enabled

### VPS Webhook Server Configuration

Verify VPS webhook server is configured properly:

```bash
# Check webhook service status
sudo systemctl status jarvis-webhook

# Verify environment variables
sudo systemctl show jarvis-webhook -p Environment | grep WEBHOOK_SECRET

# Test webhook endpoint
curl -f http://localhost:9000/health
```

## 📊 Workflow_run Event Payload Structure

When the GitHub Actions workflow completes, GitHub automatically sends a `workflow_run` event with this structure:

```json
{
  "action": "completed",
  "workflow_run": {
    "id": 123456789,
    "name": "Deploy to VPS",
    "head_branch": "main",
    "head_sha": "abc123def456",
    "status": "completed",
    "conclusion": "success",
    "workflow_id": 12345,
    "url": "https://api.github.com/repos/MADPANDA3D/J.A.R.V.I.S-PROJECT/actions/runs/123456789",
    "created_at": "2025-07-26T10:00:00Z",
    "updated_at": "2025-07-26T10:05:00Z"
  },
  "repository": {
    "id": 123456789,
    "name": "J.A.R.V.I.S-PROJECT",
    "full_name": "MADPANDA3D/J.A.R.V.I.S-PROJECT"
  }
}
```

## 🧪 Testing Integration

### 1. Test Workflow Execution

```bash
# Trigger workflow manually via GitHub CLI
gh workflow run deploy.yml --ref main

# Check workflow status
gh run list --workflow=deploy.yml

# View workflow logs
gh run view --log
```

### 2. Test Webhook Delivery

Monitor VPS webhook logs to verify event delivery:

```bash
# Monitor webhook server logs
sudo journalctl -u jarvis-webhook -f

# Check recent webhook events
curl http://localhost:9000/logs

# View webhook dashboard
curl http://localhost:9000/dashboard
```

### 3. Expected Log Entries

Successful integration should show these log entries on VPS:

```
[TIMESTAMP] WEBHOOK_RECEIVED: {"event":"workflow_run","category":"deployment",...}
[TIMESTAMP] WEBHOOK_WORKFLOW_RUN: {"action":"completed","conclusion":"success",...}
[TIMESTAMP] DEPLOYMENT_START: {"version":"abc1234","timestamp":"..."}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Webhook Events Not Delivered

**Symptoms:**
- Workflow completes successfully
- No webhook events received on VPS
- No deployment triggered

**Diagnosis:**
```bash
# Check GitHub webhook deliveries
# Go to GitHub → Settings → Webhooks → Recent Deliveries

# Verify webhook endpoint accessibility
curl -f http://69.62.71.229:9000/health

# Check VPS firewall
sudo ufw status | grep 9000
```

**Solution:**
1. Verify GitHub webhook configuration matches VPS endpoint
2. Ensure VPS webhook server is running and accessible
3. Check firewall allows traffic on port 9000

#### 2. Webhook Authentication Failures

**Symptoms:**
- Webhook events delivered but return 401 Unauthorized
- VPS logs show "Invalid signature" errors

**Diagnosis:**
```bash
# Verify webhook secret configuration
sudo systemctl show jarvis-webhook -p Environment | grep WEBHOOK_SECRET

# Check GitHub webhook secret matches
# Compare with: bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h
```

**Solution:**
1. Ensure GitHub webhook secret matches VPS configuration
2. Restart webhook service after secret changes
3. Test with ping event from GitHub webhook settings

#### 3. Workflow Failures Preventing Deployment

**Symptoms:**
- Workflow fails during build/test phases
- No workflow_run event generated
- No deployment triggered

**Diagnosis:**
```bash
# Check workflow logs in GitHub Actions
gh run view --log

# Common failure points:
# - npm ci fails (dependency issues)
# - npm run test fails (test failures)
# - npm run build fails (build errors)
```

**Solution:**
1. Fix failing tests or build errors
2. Use manual trigger with `force_deploy: true` for emergency deployments
3. Verify all package.json scripts exist and work locally

## 📈 Monitoring and Validation

### Health Check Commands

```bash
# Complete integration health check
curl -s http://localhost:9000/health | jq '.'

# Recent webhook activity
curl -s http://localhost:9000/logs | tail -20

# Webhook dashboard
curl -s http://localhost:9000/dashboard
```

### GitHub Actions Monitoring

```bash
# List recent workflow runs
gh run list --workflow=deploy.yml --limit=10

# View specific run details
gh run view [RUN_ID]

# Check workflow configuration
gh workflow view deploy.yml
```

### Success Indicators

✅ **Successful Integration Indicators:**
- GitHub Actions workflow completes successfully
- VPS webhook server receives workflow_run events
- Webhook authentication succeeds (no 401 errors)
- VPS deployment automation triggers
- Application updates deployed successfully

## 🔄 Deployment Process Validation

### End-to-End Test Procedure

1. **Make Code Change**: Create a simple change in the repository
2. **Commit and Push**: Push change to main branch
3. **Monitor Workflow**: Watch GitHub Actions workflow execution
4. **Verify Webhook**: Check VPS webhook logs for event receipt
5. **Confirm Deployment**: Verify application deployment succeeds
6. **Test Application**: Confirm updated application is running

### Expected Timeline

- **Workflow Trigger**: Immediate (< 30 seconds after push)
- **Build Process**: 2-5 minutes (depending on tests and build complexity)
- **Webhook Delivery**: < 30 seconds after workflow completion
- **VPS Deployment**: 2-3 minutes (container restart and health checks)
- **Total Time**: 5-10 minutes from code push to live deployment

## 📞 Support and Escalation

### Integration Issues

1. **Check GitHub webhook delivery status** in repository settings
2. **Verify VPS webhook server logs** for authentication and processing errors
3. **Test workflow manually** to isolate build vs webhook issues
4. **Review VPS deployment logs** for deployment automation errors

### Emergency Procedures

If automated deployment fails:

1. **Manual Deployment**: Use VPS deployment scripts directly
2. **Force Workflow**: Use `workflow_dispatch` with `force_deploy: true`
3. **Rollback**: Use VPS rollback procedures if deployment causes issues

---

This integration guide ensures the GitHub Actions workflow properly triggers VPS deployments through the webhook system established in Stories 005.001 and 005.002.