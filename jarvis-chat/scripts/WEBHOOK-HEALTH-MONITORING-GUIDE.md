# Webhook Health Monitoring System

## Overview

The enhanced VPS webhook server now includes comprehensive health monitoring and performance metrics collection. This system provides real-time visibility into webhook delivery performance, service health, and system resources.

## Health Check Endpoints

### Basic Health Check
**Endpoint:** `GET /health`

Returns overall system health status with key metrics:

```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-07-26T10:30:00.000Z",
  "uptime": {
    "milliseconds": 300000,
    "human": "5m 0s"
  },
  "services": {
    "webhook_server": {
      "status": "healthy",
      "port": 9000,
      "uptime": "5m 0s",
      "error_rate": 2.0,
      "total_requests": 50,
      "errors": 1
    },
    "websocket_server": {
      "status": "healthy",
      "port": 9001,
      "active_connections": 3,
      "total_connections": 25,
      "messages_delivered": 147
    },
    "webhook_auth": {
      "status": "healthy",
      "secret_configured": true,
      "success_rate": 98.0,
      "total_attempts": 50,
      "failures": 1
    }
  },
  "metrics": {
    "webhook_delivery": {
      "success_rate": 96.0,
      "total_processed": 50,
      "avg_response_time": 143.7,
      "p95_response_time": 203.0
    },
    "event_processing": {
      "ping_events": 15,
      "workflow_run_events": 33,
      "unsupported_events": 2
    },
    "system_resources": {
      "memory": {
        "used_mb": 50.0,
        "total_mb": 64.0,
        "usage_percentage": 78.1
      },
      "cpu": {
        "usage_percentage": 15.5
      }
    }
  }
}
```

### Detailed Webhook Health Check
**Endpoint:** `GET /webhook/health`

Returns detailed health information including environment details:

```json
{
  // ... all fields from basic health check ...
  "detailed_metrics": {
    "recent_processing_times": [120, 150, 89, 203, 156],
    "last_request_time": "2025-07-26T10:29:30.000Z",
    "service_start_time": "2025-07-26T10:25:00.000Z",
    "environment": {
      "node_version": "v20.0.0",
      "platform": "linux",
      "arch": "x64",
      "webhook_secret_configured": true
    },
    "ports": {
      "webhook_server": 9000,
      "websocket_server": 9001
    }
  }
}
```

## Health Status Levels

### Healthy
- Error rate ≤ 10%
- Authentication success rate ≥ 95%
- All services operational

### Degraded
- Error rate 10-25%
- Authentication success rate 80-95%
- Services functional but performance impacted

### Unhealthy
- Error rate > 25%
- Authentication success rate < 80%
- Critical service failures

## Performance Metrics

### Webhook Processing Metrics
- **Total Processed**: Count of all webhook requests processed
- **Success Rate**: Percentage of successfully processed webhooks
- **Average Response Time**: Mean processing time in milliseconds
- **P95 Response Time**: 95th percentile processing time
- **Error Rate**: Percentage of failed webhook processing attempts

### Authentication Metrics
- **Success Rate**: Percentage of successful signature verifications
- **Total Attempts**: Count of all authentication attempts
- **Failures**: Count of authentication failures
- **Secret Configured**: Boolean indicating if webhook secret is properly set

### Event Processing Metrics
- **Ping Events**: Count of GitHub ping events processed
- **Workflow Run Events**: Count of deployment events processed
- **Unsupported Events**: Count of unhandled event types

### System Resource Metrics
- **Memory Usage**: Heap memory utilization in MB and percentage
- **CPU Usage**: Estimated CPU utilization percentage

## WebSocket Connection Monitoring

The health monitoring system tracks WebSocket connections for real-time notifications:

- **Active Connections**: Current number of connected clients
- **Total Connections**: Lifetime count of WebSocket connections
- **Messages Delivered**: Count of notifications sent to clients
- **Connection Health**: WebSocket server operational status

## Automatic Metrics Updates

The system automatically updates performance metrics:

- **Real-time Processing**: Metrics updated with each webhook request
- **Periodic Health Checks**: System health updated every 30 seconds
- **Performance Tracking**: Processing times maintained for last 100 requests
- **Error Rate Calculation**: Rolling error rates calculated automatically

## Health Status Thresholds

### Service-Specific Thresholds

**Webhook Server:**
- Healthy: Error rate ≤ 10%
- Degraded: Error rate 10-25%
- Unhealthy: Error rate > 25%

**WebSocket Server:**
- Always healthy unless connection errors occur
- Tracks connection count and message delivery

**Authentication System:**
- Healthy: Success rate ≥ 95%
- Degraded: Success rate 80-95%
- Unhealthy: Success rate < 80%

## Integration with Existing Infrastructure

### Logging Integration
All health monitoring integrates with existing webhook logging:
- Health check events logged with `logAction` function
- Performance metrics included in webhook processing logs
- Error conditions logged with detailed context

### WebSocket Notifications
Health status changes can trigger WebSocket notifications:
- Service degradation alerts
- Error rate threshold breaches
- Authentication failure spikes

### Environment Variable Monitoring
Health checks validate environment configuration:
- Webhook secret presence verification
- Port availability confirmation
- Service configuration validation

## Testing and Validation

### Unit Testing
Use the provided test script to validate health monitoring logic:

```bash
node test-health-monitoring-logic.cjs
```

Tests cover:
- Uptime formatting functions
- Performance metrics calculations
- Service status determination
- Authentication success rate tracking
- Response structure validation

### Integration Testing
Use the integration test script to validate endpoints:

```bash
node test-webhook-health-checks.cjs
```

Tests require running webhook server and validate:
- Health endpoint accessibility
- Response structure completeness
- Metrics accuracy after webhook processing
- Error handling and status updates

## Deployment Considerations

### Performance Impact
- Health monitoring adds minimal overhead (<1ms per request)
- Metrics calculations optimized for high-throughput processing
- Memory usage bounded by processing time history limit (100 entries)

### Security
- No sensitive information exposed in health endpoints
- Webhook secret presence indicated by boolean flag only
- Error messages sanitized to prevent information disclosure

### Monitoring Integration
Health endpoints compatible with standard monitoring tools:
- Prometheus scraping (JSON format easily parsed)
- Nagios/Icinga health checks
- Custom monitoring dashboards
- Log aggregation systems

## Troubleshooting

### Common Issues

**Health Check Returns Unhealthy:**
1. Check error logs for recent webhook failures
2. Verify webhook secret configuration
3. Confirm network connectivity to webhook endpoints
4. Review recent deployment changes

**High Error Rates:**
1. Check GitHub webhook delivery logs
2. Verify signature calculation in webhook payloads
3. Confirm environment variable synchronization
4. Test webhook endpoints manually

**Authentication Failures:**
1. Verify webhook secret in environment variables
2. Check GitHub webhook configuration
3. Test signature generation manually
4. Confirm HMAC-SHA256 calculation

### Diagnostic Commands

```bash
# Check health status
curl http://localhost:9000/health

# Get detailed health information
curl http://localhost:9000/webhook/health

# Test webhook processing
curl -X POST http://localhost:9000/webhook/deploy \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -H "X-Hub-Signature-256: sha256=..." \
  -d '{"zen":"test"}'
```

## Future Enhancements

### Planned Features
- Historical performance data persistence
- Trend analysis and anomaly detection
- Configurable alert thresholds
- Monitoring dashboard UI
- Custom metrics export formats

### Integration Opportunities
- External monitoring system integration
- Performance analytics dashboard
- Automated alert notifications
- Health check automation in CI/CD pipelines