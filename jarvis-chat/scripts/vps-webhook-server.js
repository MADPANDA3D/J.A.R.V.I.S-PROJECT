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
                ip: req.ip 
            });
            return res.status(401).json({ error: 'Invalid signature' });
        }
        
        const event = req.headers['x-github-event'];
        const data = req.body;
        
        await logAction('WEBHOOK_RECEIVED', { 
            event, 
            ref: data.ref,
            repository: data.repository?.name,
            pusher: data.pusher?.name
        });
        
        // Handle workflow_run completion (from GitHub Actions)
        if (event === 'workflow_run' && data.action === 'completed' && data.workflow_run.conclusion === 'success') {
            const version = data.workflow_run.head_sha.substring(0, 7);
            
            console.log('🚀 Deployment webhook received for version:', version);
            
            // Start deployment in background
            deployApplication(version).catch(error => {
                console.error('💥 Deployment failed:', error);
            });
            
            res.json({ 
                message: 'Deployment initiated',
                version,
                timestamp: new Date().toISOString()
            });
            
        } else {
            res.json({ 
                message: 'Webhook received but no action taken',
                event,
                action: data.action
            });
        }
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        await logAction('WEBHOOK_ERROR', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
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