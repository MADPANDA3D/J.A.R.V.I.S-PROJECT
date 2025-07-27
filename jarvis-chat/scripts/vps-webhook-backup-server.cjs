#!/usr/bin/env node

/**
 * JARVIS Chat - VPS Backup Webhook Server
 * 
 * This is the backup/failover webhook server that runs on port 9002
 * and provides identical functionality to the primary server for redundancy.
 * 
 * Usage: node vps-webhook-backup-server.cjs
 * Port: 9002 (configurable via BACKUP_WEBHOOK_PORT)
 */

const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.BACKUP_WEBHOOK_PORT || 9002;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT';
const LOGS_DIR = path.join(PROJECT_ROOT, 'logs');
const PRIMARY_SERVER_URL = process.env.PRIMARY_WEBHOOK_URL || 'http://localhost:9000';

// Server identification
const SERVER_ID = 'backup-webhook-server';
const SERVER_TYPE = 'backup';

// Supported GitHub webhook event types (identical to primary)
const SUPPORTED_EVENTS = {
    PING: 'ping',
    WORKFLOW_RUN: 'workflow_run',
    PUSH: 'push',
    PULL_REQUEST: 'pull_request'
};

// Event handler response types
const RESPONSE_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

// Performance monitoring and health tracking
const performanceMetrics = {
    startTime: Date.now(),
    serverType: SERVER_TYPE,
    serverId: SERVER_ID,
    webhookStats: {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        lastProcessed: null
    },
    healthStatus: {
        status: 'healthy',
        uptime: 0,
        lastHealthCheck: new Date(),
        primaryServerStatus: 'unknown'
    },
    failoverStats: {
        activeSince: null,
        requestsHandledAsBackup: 0,
        failoverTriggerTime: null
    }
};

// Middleware for JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Hub-Signature-256');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [BACKUP] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

/**
 * Webhook signature verification (identical to primary server)
 */
function verifyWebhookSignature(payload, signature) {
    if (!signature) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload, 'utf8')
        .digest('hex');

    const actualSignature = signature.replace('sha256=', '');
    
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(actualSignature, 'hex')
    );
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    const uptime = Date.now() - performanceMetrics.startTime;
    performanceMetrics.healthStatus.uptime = uptime;
    performanceMetrics.healthStatus.lastHealthCheck = new Date();

    res.json({
        server: SERVER_ID,
        type: SERVER_TYPE,
        status: performanceMetrics.healthStatus.status,
        uptime: uptime,
        port: PORT,
        timestamp: new Date().toISOString(),
        webhookStats: performanceMetrics.webhookStats,
        failoverStats: performanceMetrics.failoverStats,
        primaryServerStatus: performanceMetrics.healthStatus.primaryServerStatus
    });
});

/**
 * Detailed health endpoint for monitoring integration
 */
app.get('/webhook/health', (req, res) => {
    const uptime = Date.now() - performanceMetrics.startTime;
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: {
            id: SERVER_ID,
            type: SERVER_TYPE,
            port: PORT,
            uptime: `${Math.floor(uptime / 1000)}s`
        },
        services: {
            webhook_server: {
                status: 'healthy',
                port: PORT,
                uptime: `${Math.floor(uptime / (1000 * 60))}m`
            },
            webhook_auth: {
                status: WEBHOOK_SECRET !== 'your-webhook-secret-here' ? 'healthy' : 'warning',
                secret_configured: WEBHOOK_SECRET !== 'your-webhook-secret-here'
            }
        },
        metrics: {
            ...performanceMetrics.webhookStats,
            failover_ready: true,
            backup_server: true
        },
        failover: performanceMetrics.failoverStats
    });
});

/**
 * Primary webhook endpoint (identical functionality to primary server)
 */
app.post('/webhook/deploy', async (req, res) => {
    const startTime = Date.now();
    const signature = req.headers['x-hub-signature-256'];
    const eventType = req.headers['x-github-event'];
    const deliveryId = req.headers['x-github-delivery'];

    console.log(`\n[BACKUP WEBHOOK] Processing ${eventType} event (${deliveryId})`);

    try {
        // Verify webhook signature
        const payload = JSON.stringify(req.body);
        if (!verifyWebhookSignature(payload, signature)) {
            console.error('[BACKUP] ❌ Invalid webhook signature');
            performanceMetrics.webhookStats.failed++;
            return res.status(401).json({
                type: RESPONSE_TYPES.ERROR,
                message: 'Invalid webhook signature',
                server: SERVER_ID,
                timestamp: new Date().toISOString()
            });
        }

        // Update stats
        performanceMetrics.webhookStats.totalProcessed++;
        performanceMetrics.webhookStats.lastProcessed = new Date();
        
        // Mark as handling failover request
        if (!performanceMetrics.failoverStats.activeSince) {
            performanceMetrics.failoverStats.activeSince = new Date();
            performanceMetrics.failoverStats.failoverTriggerTime = new Date();
            console.log(`[BACKUP] 🔄 Backup server now handling requests (failover activated)`);
        }
        performanceMetrics.failoverStats.requestsHandledAsBackup++;

        // Process event based on type
        let response;
        switch (eventType) {
            case SUPPORTED_EVENTS.PING:
                response = await handlePingEvent(req.body);
                break;
            case SUPPORTED_EVENTS.WORKFLOW_RUN:
                response = await handleWorkflowRunEvent(req.body);
                break;
            default:
                response = {
                    type: RESPONSE_TYPES.INFO,
                    message: `Event type '${eventType}' received but not processed by backup server`,
                    server: SERVER_ID
                };
        }

        // Success response
        performanceMetrics.webhookStats.successful++;
        const processingTime = Date.now() - startTime;

        res.json({
            ...response,
            server: SERVER_ID,
            type: SERVER_TYPE, 
            processingTime: `${processingTime}ms`,
            timestamp: new Date().toISOString(),
            deliveryId
        });

        console.log(`[BACKUP] ✅ Processed ${eventType} in ${processingTime}ms`);

    } catch (error) {
        performanceMetrics.webhookStats.failed++;
        console.error(`[BACKUP] ❌ Error processing webhook:`, error.message);

        res.status(500).json({
            type: RESPONSE_TYPES.ERROR,
            message: 'Internal server error in backup webhook server',
            server: SERVER_ID,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Handle ping events (identical to primary)
 */
async function handlePingEvent(payload) {
    console.log('[BACKUP] 🏓 Ping event received from GitHub');
    
    return {
        type: RESPONSE_TYPES.SUCCESS,
        message: 'Backup webhook server is healthy and responding',
        zen: payload.zen || 'Backup server zen',
        repository: payload.repository?.full_name || 'unknown'
    };
}

/**
 * Handle workflow run events (identical to primary)  
 */
async function handleWorkflowRunEvent(payload) {
    const workflowName = payload.workflow_run?.name || 'Unknown Workflow';
    const status = payload.workflow_run?.status;
    const conclusion = payload.workflow_run?.conclusion;
    const repository = payload.repository?.full_name || 'unknown';

    console.log(`[BACKUP] 🔧 Workflow '${workflowName}' - Status: ${status}, Conclusion: ${conclusion}`);

    // Log deployment event
    try {
        await logDeploymentEvent({
            type: 'workflow_run',
            workflow: workflowName,
            status,
            conclusion,
            repository,
            server: SERVER_ID,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[BACKUP] ❌ Failed to log deployment event:', error.message);
    }

    return {
        type: RESPONSE_TYPES.SUCCESS,
        message: `Workflow '${workflowName}' processed by backup server`,
        workflow: workflowName,
        status,
        conclusion,
        repository
    };
}

/**
 * Log deployment events (identical to primary)
 */
async function logDeploymentEvent(event) {
    try {
        await fs.mkdir(LOGS_DIR, { recursive: true });
        const logFile = path.join(LOGS_DIR, `deployments-backup-${new Date().toISOString().split('T')[0]}.log`);
        const logEntry = `${JSON.stringify(event)}\n`;
        await fs.appendFile(logFile, logEntry);
    } catch (error) {
        console.error('[BACKUP] Failed to write deployment log:', error.message);
    }
}

/**
 * Check primary server health
 */
async function checkPrimaryServerHealth() {
    try {
        const fetch = require('node-fetch');
        const response = await fetch(`${PRIMARY_SERVER_URL}/health`, { 
            timeout: 2000 
        });
        
        if (response.ok) {
            performanceMetrics.healthStatus.primaryServerStatus = 'healthy';
            return true;
        } else {
            performanceMetrics.healthStatus.primaryServerStatus = 'unhealthy';
            return false;
        }
    } catch (error) {
        performanceMetrics.healthStatus.primaryServerStatus = 'unreachable';
        return false;
    }
}

/**
 * Graceful shutdown handler
 */
process.on('SIGTERM', () => {
    console.log('[BACKUP] 🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[BACKUP] 🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start the backup webhook server
app.listen(PORT, () => {
    console.log(`\n🔄 JARVIS Backup Webhook Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Webhook endpoint: http://localhost:${PORT}/webhook/deploy`);
    console.log(`⚡ Server ID: ${SERVER_ID}`);
    console.log(`🎯 Primary server: ${PRIMARY_SERVER_URL}`);
    
    performanceMetrics.startTime = Date.now();
    
    // Start primary server health monitoring
    setInterval(checkPrimaryServerHealth, 5000); // Check every 5 seconds
    
    console.log('🚀 Backup webhook server ready for failover!\n');
});