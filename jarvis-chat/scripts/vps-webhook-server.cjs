#!/usr/bin/env node

/**
 * JARVIS Chat - VPS Deployment Webhook Server
 * 
 * This server runs on your VPS and handles:
 * 1. Auto-deployment notifications from GitHub Actions
 * 2. Log return system for remote team access
 * 3. Update notifications to active users
 * 
 * Usage: node vps-webhook-server.js
 * Port: 9000 (configurable)
 */

const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/J.A.R.V.I.S/J.A.R.V.I.S-PROJECT';
const LOGS_DIR = path.join(PROJECT_ROOT, 'logs');

// Supported GitHub webhook event types
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

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// WebSocket server for real-time notifications
const wss = new WebSocket.Server({ port: 9001 });
const connectedClients = new Set();

wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log('🔌 Client connected to update notifications');
    
    ws.on('close', () => {
        connectedClients.delete(ws);
        console.log('🔌 Client disconnected from update notifications');
    });
});

// Utility Functions

// Event validation and classification
const isValidEventType = (eventType) => {
    return Object.values(SUPPORTED_EVENTS).includes(eventType?.toLowerCase());
};

const classifyEvent = (eventType) => {
    const normalizedType = eventType?.toLowerCase();
    
    switch (normalizedType) {
        case SUPPORTED_EVENTS.PING:
            return { type: SUPPORTED_EVENTS.PING, category: 'test' };
        case SUPPORTED_EVENTS.WORKFLOW_RUN:
            return { type: SUPPORTED_EVENTS.WORKFLOW_RUN, category: 'deployment' };
        case SUPPORTED_EVENTS.PUSH:
            return { type: SUPPORTED_EVENTS.PUSH, category: 'repository' };
        case SUPPORTED_EVENTS.PULL_REQUEST:
            return { type: SUPPORTED_EVENTS.PULL_REQUEST, category: 'repository' };
        default:
            return { type: normalizedType || 'unknown', category: 'unsupported' };
    }
};

// Create standardized webhook response
const createWebhookResponse = (type, message, data = {}) => {
    return {
        message,
        status: type === RESPONSE_TYPES.ERROR ? 'error' : 'healthy',
        type,
        timestamp: new Date().toISOString(),
        ...data
    };
};

const verifyGitHubSignature = (payload, signature) => {
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

const logAction = async (action, details) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${action}: ${JSON.stringify(details)}\n`;
    
    // Local log
    console.log(`📝 ${action}:`, details);
    
    // Write to log file
    try {
        await fs.mkdir(LOGS_DIR, { recursive: true });
        await fs.appendFile(path.join(LOGS_DIR, 'webhook.log'), logEntry);
    } catch (error) {
        console.error('❌ Failed to write log:', error);
    }
    
    // Send to log return system
    await sendLogToGitHub(action, details);
};

const sendLogToGitHub = async (action, details) => {
    // This will be implemented to push logs back to GitHub repository
    // For now, we'll prepare the log entry
    const logData = {
        timestamp: new Date().toISOString(),
        action,
        details,
        server: 'VPS-Webhook'
    };
    
    // TODO: Implement GitHub API push for logs
    console.log('📤 Log prepared for GitHub:', logData);
};

// Event handlers
const handlePingEvent = async (data, req) => {
    await logAction('WEBHOOK_PING', {
        zen: data.zen,
        hook_id: data.hook_id,
        repository: data.repository?.name,
        hook_url: data.hook?.url,
        user_agent: req.headers['user-agent']
    });

    return createWebhookResponse(
        RESPONSE_TYPES.SUCCESS,
        'Webhook ping received successfully',
        {
            zen: data.zen,
            hook_id: data.hook_id,
            repository: data.repository?.name
        }
    );
};

const handleWorkflowRunEvent = async (data, req) => {
    const { action, workflow_run } = data;
    
    await logAction('WEBHOOK_WORKFLOW_RUN', {
        action,
        conclusion: workflow_run?.conclusion,
        status: workflow_run?.status,
        workflow_name: workflow_run?.name,
        head_sha: workflow_run?.head_sha,
        repository: data.repository?.name
    });

    if (action === 'completed' && workflow_run.conclusion === 'success') {
        const version = workflow_run.head_sha.substring(0, 7);
        
        console.log('🚀 Deployment webhook received for version:', version);
        
        // Start deployment in background
        deployApplication(version).catch(error => {
            console.error('💥 Deployment failed:', error);
        });
        
        return createWebhookResponse(
            RESPONSE_TYPES.SUCCESS,
            'Deployment initiated',
            {
                version,
                workflow_name: workflow_run.name,
                conclusion: workflow_run.conclusion
            }
        );
    } else {
        return createWebhookResponse(
            RESPONSE_TYPES.INFO,
            'Workflow run event processed',
            {
                action,
                status: workflow_run?.status,
                conclusion: workflow_run?.conclusion,
                workflow_name: workflow_run?.name
            }
        );
    }
};

const handleUnsupportedEvent = async (eventType, data, req) => {
    await logAction('WEBHOOK_UNSUPPORTED_EVENT', {
        event_type: eventType,
        repository: data.repository?.name,
        user_agent: req.headers['user-agent'],
        payload_keys: Object.keys(data)
    });

    return createWebhookResponse(
        RESPONSE_TYPES.WARNING,
        `Webhook event '${eventType}' received but not processed`,
        {
            event_type: eventType,
            supported_events: Object.values(SUPPORTED_EVENTS)
        }
    );
};

const notifyUsers = (message, type = 'info') => {
    const notification = {
        type,
        message,
        timestamp: new Date().toISOString()
    };
    
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
        }
    });
    
    console.log(`📢 Notified ${connectedClients.size} clients:`, message);
};

const executeCommand = (command, description) => {
    return new Promise((resolve, reject) => {
        console.log(`🔧 Executing: ${description}`);
        exec(command, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ ${description} failed:`, error);
                reject({ error: error.message, stderr });
            } else {
                console.log(`✅ ${description} completed`);
                if (stdout) console.log('Output:', stdout);
                resolve({ stdout, stderr });
            }
        });
    });
};

const deployApplication = async (version = 'latest') => {
    try {
        await logAction('DEPLOYMENT_START', { version, timestamp: new Date().toISOString() });
        
        // Step 1: Notify users of pending update
        notifyUsers(
            '🔄 System update in progress. The application will restart in 5 seconds. Sorry for any inconvenience.',
            'warning'
        );
        
        // Step 2: Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Step 3: Stop current container
        try {
            await executeCommand(
                'docker-compose -f docker-compose.prod.yml stop',
                'Stopping current container'
            );
        } catch (error) {
            // Container might not be running, continue
            console.log('⚠️ Container stop failed (might not be running)');
        }
        
        // Step 4: Pull latest image
        await executeCommand(
            'docker-compose -f docker-compose.prod.yml pull',
            'Pulling latest image'
        );
        
        // Step 5: Start new container
        await executeCommand(
            'docker-compose -f docker-compose.prod.yml up -d',
            'Starting updated container'
        );
        
        // Step 6: Wait for health check
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Step 7: Verify deployment
        try {
            await executeCommand(
                'curl -f http://localhost:3000/health',
                'Health check'
            );
            
            // Step 8: Notify users of successful update
            notifyUsers(
                `✅ Update completed successfully! Welcome to version ${version}. All systems operational.`,
                'success'
            );
            
            await logAction('DEPLOYMENT_SUCCESS', { version, timestamp: new Date().toISOString() });
            
        } catch (healthError) {
            throw new Error('Health check failed after deployment');
        }
        
    } catch (error) {
        await logAction('DEPLOYMENT_FAILED', { 
            error: error.message, 
            version, 
            timestamp: new Date().toISOString() 
        });
        
        notifyUsers(
            '❌ Update failed. System is attempting to recover. Please refresh the page in a moment.',
            'error'
        );
        
        // Attempt rollback
        try {
            await executeCommand(
                'docker-compose -f docker-compose.prod.yml restart',
                'Attempting service recovery'
            );
        } catch (rollbackError) {
            console.error('💥 Rollback failed:', rollbackError);
        }
        
        throw error;
    }
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        connectedClients: connectedClients.size
    });
});

// GitHub webhook endpoint for deployments
app.post('/webhook/deploy', async (req, res) => {
    try {
        const signature = req.headers['x-hub-signature-256'];
        const payload = JSON.stringify(req.body);
        
        // Verify GitHub signature
        if (!verifyGitHubSignature(payload, signature)) {
            await logAction('WEBHOOK_AUTH_FAILED', { 
                headers: req.headers,
                ip: req.ip,
                event: req.headers['x-github-event']
            });
            return res.status(401).json(createWebhookResponse(
                RESPONSE_TYPES.ERROR,
                'Invalid signature'
            ));
        }
        
        const event = req.headers['x-github-event'];
        const data = req.body;
        
        // Validate payload structure
        if (!data || typeof data !== 'object') {
            await logAction('WEBHOOK_MALFORMED_PAYLOAD', { 
                event,
                content_type: req.headers['content-type'],
                body_type: typeof req.body
            });
            return res.status(400).json(createWebhookResponse(
                RESPONSE_TYPES.ERROR,
                'Malformed payload - expected JSON object'
            ));
        }
        
        // Classify event type
        const eventClassification = classifyEvent(event);
        
        await logAction('WEBHOOK_RECEIVED', { 
            event,
            category: eventClassification.category,
            ref: data.ref,
            repository: data.repository?.name,
            pusher: data.pusher?.name,
            user_agent: req.headers['user-agent']
        });
        
        let response;
        
        // Route to appropriate event handler
        switch (eventClassification.type) {
            case SUPPORTED_EVENTS.PING:
                response = await handlePingEvent(data, req);
                break;
                
            case SUPPORTED_EVENTS.WORKFLOW_RUN:
                response = await handleWorkflowRunEvent(data, req);
                break;
                
            default:
                if (eventClassification.category === 'unsupported') {
                    response = await handleUnsupportedEvent(event, data, req);
                } else {
                    // Supported event type but no specific handler yet
                    await logAction('WEBHOOK_NOT_IMPLEMENTED', {
                        event_type: event,
                        category: eventClassification.category
                    });
                    response = createWebhookResponse(
                        RESPONSE_TYPES.INFO,
                        `Webhook event '${event}' received but handler not implemented`,
                        { event_type: event }
                    );
                }
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        await logAction('WEBHOOK_ERROR', { 
            error: error.message,
            stack: error.stack,
            event: req.headers['x-github-event']
        });
        res.status(500).json(createWebhookResponse(
            RESPONSE_TYPES.ERROR,
            'Internal server error',
            { error: error.message }
        ));
    }
});

// Log return endpoint
app.post('/webhook/logs', async (req, res) => {
    try {
        const { level, message, timestamp, component } = req.body;
        
        await logAction('APPLICATION_LOG', {
            level,
            message,
            timestamp,
            component
        });
        
        res.json({ status: 'logged' });
        
    } catch (error) {
        console.error('❌ Log webhook error:', error);
        res.status(500).json({ error: 'Failed to process log' });
    }
});

// Get recent logs endpoint (for debugging)
app.get('/logs', async (req, res) => {
    try {
        const logFile = path.join(LOGS_DIR, 'webhook.log');
        const logs = await fs.readFile(logFile, 'utf8');
        const recentLogs = logs.split('\n').slice(-50).join('\n');
        
        res.json({
            logs: recentLogs,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.json({
            logs: 'No logs available',
            error: error.message
        });
    }
});

// Team dashboard for live log viewing
app.get('/dashboard', async (req, res) => {
    try {
        const logFile = path.join(LOGS_DIR, 'webhook.log');
        let logs = 'No logs available yet';
        
        try {
            const logContent = await fs.readFile(logFile, 'utf8');
            logs = logContent.split('\n').slice(-100).join('\n');
        } catch (logError) {
            logs = 'Log file not found - webhook server may be starting up';
        }
        
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>🚀 JARVIS Deployment Dashboard</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            background: #0a0a0a; 
            color: #00ff41; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.4;
        }
        .header { 
            background: #1a1a1a; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            border: 1px solid #333;
        }
        .status { 
            display: flex; 
            gap: 30px; 
            margin: 15px 0;
        }
        .stat { 
            background: #2a2a2a; 
            padding: 10px 15px; 
            border-radius: 5px; 
            border: 1px solid #444;
        }
        .logs { 
            background: #111; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #333;
            max-height: 70vh;
            overflow-y: auto;
        }
        .logs pre { 
            margin: 0; 
            white-space: pre-wrap; 
            word-wrap: break-word;
            font-size: 12px;
        }
        .success { color: #00ff00; }
        .error { color: #ff4444; }
        .warning { color: #ffaa00; }
        .info { color: #44aaff; }
        h1 { color: #00ff41; text-shadow: 0 0 10px #00ff41; }
        .refresh-note { color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 JARVIS Deployment Dashboard</h1>
        <div class="status">
            <div class="stat">
                <strong>Last Updated:</strong> ${new Date().toLocaleString()}
            </div>
            <div class="stat">
                <strong>Connected Clients:</strong> ${connectedClients.size}
            </div>
            <div class="stat">
                <strong>Server Status:</strong> <span class="success">ONLINE</span>
            </div>
        </div>
        <div class="refresh-note">⚡ Auto-refreshes every 30 seconds</div>
    </div>
    
    <div class="logs">
        <h2>📋 Recent Deployment Logs (Last 100 entries):</h2>
        <pre>${logs.replace(/ERROR/g, '<span class="error">ERROR</span>')
                    .replace(/SUCCESS/g, '<span class="success">SUCCESS</span>')
                    .replace(/WARNING/g, '<span class="warning">WARNING</span>')
                    .replace(/INFO/g, '<span class="info">INFO</span>')}</pre>
    </div>
    
    <script>
        // Optional: Add WebSocket connection for real-time updates
        console.log('JARVIS Dashboard loaded - monitoring deployments...');
    </script>
</body>
</html>
        `);
        
    } catch (error) {
        res.status(500).send(`
            <h1>Dashboard Error</h1>
            <p>Error loading dashboard: ${error.message}</p>
            <p><a href="/health">Check server health</a></p>
        `);
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 JARVIS Webhook Server running on port ${PORT}`);
    console.log(`📡 WebSocket notifications on port 9001`);
    console.log(`📝 Logs directory: ${LOGS_DIR}`);
    console.log(`📁 Project root: ${PROJECT_ROOT}`);
    
    logAction('SERVER_START', {
        port: PORT,
        websocketPort: 9001,
        projectRoot: PROJECT_ROOT,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    await logAction('SERVER_SHUTDOWN', { timestamp: new Date().toISOString() });
    process.exit(0);
});

module.exports = app;