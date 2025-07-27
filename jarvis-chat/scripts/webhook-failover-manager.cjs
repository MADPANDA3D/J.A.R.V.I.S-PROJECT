#!/usr/bin/env node

/**
 * JARVIS Chat - Webhook Failover Manager
 * 
 * This service manages automatic failover between primary and backup webhook servers.
 * It monitors server health and switches GitHub webhook URLs when necessary.
 * 
 * Features:
 * - Sub-5-second failover detection
 * - Automatic GitHub webhook URL switching
 * - Health monitoring with recovery detection
 * - Failover state management
 * - Real-time notifications
 * 
 * Usage: node webhook-failover-manager.cjs
 * Port: 9003 (management interface)
 */

const express = require('express');
const { Octokit } = require('@octokit/rest');
const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.FAILOVER_MANAGER_PORT || 9003;

// Configuration
const config = {
    github: {
        token: process.env.GITHUB_TOKEN || '',
        owner: process.env.GITHUB_OWNER || '',
        repo: process.env.GITHUB_REPO || '',
        webhookId: process.env.GITHUB_WEBHOOK_ID || ''
    },
    servers: {
        primary: {
            url: process.env.PRIMARY_WEBHOOK_URL || 'http://69.62.71.229:9000',
            endpoint: '/webhook/deploy',
            healthEndpoint: '/health',
            port: 9000
        },
        backup: {
            url: process.env.BACKUP_WEBHOOK_URL || 'http://69.62.71.229:9002',
            endpoint: '/webhook/deploy', 
            healthEndpoint: '/health',
            port: 9002
        }
    },
    failover: {
        healthCheckInterval: 2000, // 2 seconds
        failoverThreshold: 3, // Failed checks before failover
        recoveryThreshold: 5, // Successful checks before recovery
        timeout: 4000 // 4 second timeout for health checks
    }
};

// Failover state management
const failoverState = {
    currentActive: 'primary', // 'primary' or 'backup'
    primaryHealth: {
        status: 'unknown',
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        lastCheck: null,
        lastFailure: null,
        responseTime: null
    },
    backupHealth: {
        status: 'unknown',
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        lastCheck: null,
        lastFailure: null,
        responseTime: null
    },
    failoverHistory: [],
    notifications: [],
    startTime: Date.now()
};

// Initialize GitHub API
const octokit = new Octokit({
    auth: config.github.token
});

// Express middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

/**
 * Health check for individual server
 */
async function checkServerHealth(serverType) {
    const server = config.servers[serverType];
    const healthState = failoverState[`${serverType}Health`];
    const startTime = Date.now();

    try {
        const fetch = require('node-fetch');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.failover.timeout);

        const response = await fetch(`${server.url}${server.healthEndpoint}`, {
            method: 'GET',
            signal: controller.signal,
            timeout: config.failover.timeout
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
            const healthData = await response.json();
            
            // Successful health check
            healthState.status = 'healthy';
            healthState.consecutiveFailures = 0;
            healthState.consecutiveSuccesses++;
            healthState.lastCheck = new Date();
            healthState.responseTime = responseTime;

            console.log(`[HEALTH] ${serverType.toUpperCase()} server healthy (${responseTime}ms)`);
            return true;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        // Failed health check
        healthState.status = 'unhealthy';
        healthState.consecutiveSuccesses = 0;
        healthState.consecutiveFailures++;
        healthState.lastCheck = new Date();
        healthState.lastFailure = new Date();
        healthState.responseTime = responseTime;

        console.log(`[HEALTH] ${serverType.toUpperCase()} server unhealthy: ${error.message} (${responseTime}ms)`);
        return false;
    }
}

/**
 * Update GitHub webhook URL
 */
async function updateGitHubWebhookUrl(newUrl) {
    try {
        if (!config.github.token || !config.github.webhookId) {
            console.log('[GITHUB] GitHub configuration missing, skipping webhook URL update');
            return false;
        }

        await octokit.rest.repos.updateWebhook({
            owner: config.github.owner,
            repo: config.github.repo,
            hook_id: config.github.webhookId,
            config: {
                url: newUrl,
                content_type: 'json',
                secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret-here'
            }
        });

        console.log(`[GITHUB] ✅ Webhook URL updated to: ${newUrl}`);
        return true;
    } catch (error) {
        console.error(`[GITHUB] ❌ Failed to update webhook URL: ${error.message}`);
        return false;
    }
}

/**
 * Trigger failover to backup server
 */
async function triggerFailover() {
    if (failoverState.currentActive === 'backup') {
        console.log('[FAILOVER] Already running on backup server');
        return;
    }

    console.log('\n🚨 [FAILOVER] Triggering failover to backup server...');
    const failoverStart = Date.now();

    // Update webhook URL to backup server
    const backupWebhookUrl = `${config.servers.backup.url}${config.servers.backup.endpoint}`;
    const success = await updateGitHubWebhookUrl(backupWebhookUrl);

    const failoverTime = Date.now() - failoverStart;

    if (success) {
        // Update state
        failoverState.currentActive = 'backup';
        
        // Record failover event
        const failoverEvent = {
            type: 'failover',
            from: 'primary',
            to: 'backup',
            timestamp: new Date(),
            responseTime: failoverTime,
            reason: `Primary server failed ${failoverState.primaryHealth.consecutiveFailures} consecutive health checks`,
            success: true
        };

        failoverState.failoverHistory.push(failoverEvent);
        failoverState.notifications.push({
            type: 'critical',
            message: `Failover completed in ${failoverTime}ms - Now using backup server`,
            timestamp: new Date()
        });

        console.log(`[FAILOVER] ✅ Failover completed in ${failoverTime}ms`);
        
        // Broadcast notification
        broadcastNotification(failoverEvent);
    } else {
        console.log(`[FAILOVER] ❌ Failover failed after ${failoverTime}ms`);
        
        failoverState.notifications.push({
            type: 'error',
            message: `Failover attempt failed - Unable to update GitHub webhook URL`,
            timestamp: new Date()
        });
    }
}

/**
 * Trigger recovery to primary server
 */
async function triggerRecovery() {
    if (failoverState.currentActive === 'primary') {
        console.log('[RECOVERY] Already running on primary server');
        return;
    }

    console.log('\n🔄 [RECOVERY] Triggering recovery to primary server...');
    const recoveryStart = Date.now();

    // Update webhook URL back to primary server
    const primaryWebhookUrl = `${config.servers.primary.url}${config.servers.primary.endpoint}`;
    const success = await updateGitHubWebhookUrl(primaryWebhookUrl);

    const recoveryTime = Date.now() - recoveryStart;

    if (success) {
        // Update state
        failoverState.currentActive = 'primary';
        
        // Record recovery event
        const recoveryEvent = {
            type: 'recovery',
            from: 'backup',
            to: 'primary',
            timestamp: new Date(),
            responseTime: recoveryTime,
            reason: `Primary server recovered with ${failoverState.primaryHealth.consecutiveSuccesses} consecutive successful health checks`,
            success: true
        };

        failoverState.failoverHistory.push(recoveryEvent);
        failoverState.notifications.push({
            type: 'success',
            message: `Recovery completed in ${recoveryTime}ms - Back to primary server`,
            timestamp: new Date()
        });

        console.log(`[RECOVERY] ✅ Recovery completed in ${recoveryTime}ms`);
        
        // Broadcast notification
        broadcastNotification(recoveryEvent);
    } else {
        console.log(`[RECOVERY] ❌ Recovery failed after ${recoveryTime}ms`);
        
        failoverState.notifications.push({
            type: 'error',
            message: `Recovery attempt failed - Unable to update GitHub webhook URL`,
            timestamp: new Date()
        });
    }
}

/**
 * Broadcast notification via WebSocket
 */
function broadcastNotification(event) {
    // This would integrate with existing WebSocket server
    console.log(`[NOTIFICATION] Broadcasting: ${JSON.stringify(event)}`);
}

/**
 * Main failover monitoring loop
 */
async function monitorServers() {
    // Check both servers
    const primaryHealthy = await checkServerHealth('primary');
    const backupHealthy = await checkServerHealth('backup');

    // Failover logic
    if (failoverState.currentActive === 'primary') {
        // Currently using primary server
        if (!primaryHealthy && failoverState.primaryHealth.consecutiveFailures >= config.failover.failoverThreshold) {
            if (backupHealthy) {
                await triggerFailover();
            } else {
                console.log('[FAILOVER] ⚠️ Primary unhealthy but backup also unavailable!');
                failoverState.notifications.push({
                    type: 'critical',
                    message: 'Both primary and backup servers are unhealthy!',
                    timestamp: new Date()
                });
            }
        }
    } else {
        // Currently using backup server
        if (primaryHealthy && failoverState.primaryHealth.consecutiveSuccesses >= config.failover.recoveryThreshold) {
            await triggerRecovery();
        }
    }
}

/**
 * REST API Endpoints
 */

// Health status endpoint
app.get('/health', (req, res) => {
    const uptime = Date.now() - failoverState.startTime;
    
    res.json({
        service: 'webhook-failover-manager',
        status: 'healthy',
        uptime: uptime,
        currentActive: failoverState.currentActive,
        primaryHealth: failoverState.primaryHealth,
        backupHealth: failoverState.backupHealth,
        timestamp: new Date().toISOString()
    });
});

// Failover status endpoint
app.get('/failover/status', (req, res) => {
    res.json({
        currentActive: failoverState.currentActive,
        servers: {
            primary: {
                ...config.servers.primary,
                health: failoverState.primaryHealth
            },
            backup: {
                ...config.servers.backup,
                health: failoverState.backupHealth
            }
        },
        history: failoverState.failoverHistory.slice(-10), // Last 10 events
        notifications: failoverState.notifications.slice(-20) // Last 20 notifications
    });
});

// Manual failover endpoint
app.post('/failover/trigger', async (req, res) => {
    const { target } = req.body;
    
    if (target === 'backup' && failoverState.currentActive === 'primary') {
        await triggerFailover();
        res.json({ success: true, message: 'Failover to backup triggered' });
    } else if (target === 'primary' && failoverState.currentActive === 'backup') {
        await triggerRecovery();
        res.json({ success: true, message: 'Recovery to primary triggered' });
    } else {
        res.status(400).json({ 
            success: false, 
            message: `Cannot switch to ${target} - already active or invalid target` 
        });
    }
});

// Configuration endpoint
app.get('/config', (req, res) => {
    res.json({
        ...config,
        github: {
            ...config.github,
            token: config.github.token ? '***configured***' : 'not configured'
        }
    });
});

/**
 * Start the failover manager
 */
function startFailoverManager() {
    console.log('\n🔄 JARVIS Webhook Failover Manager Starting...');
    console.log(`📊 Management interface: http://localhost:${PORT}`);
    console.log(`🎯 Primary server: ${config.servers.primary.url}`);
    console.log(`🔄 Backup server: ${config.servers.backup.url}`);
    console.log(`⏱️ Health check interval: ${config.failover.healthCheckInterval}ms`);
    console.log(`🚨 Failover threshold: ${config.failover.failoverThreshold} failed checks`);
    console.log(`✅ Recovery threshold: ${config.failover.recoveryThreshold} successful checks`);

    // Start health monitoring
    setInterval(monitorServers, config.failover.healthCheckInterval);
    
    // Initial health check
    setTimeout(monitorServers, 1000);

    console.log('\n🚀 Failover manager ready - Monitoring webhook servers!\n');
}

// Start the management server
app.listen(PORT, () => {
    startFailoverManager();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Failover manager shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Failover manager shutting down gracefully...');
    process.exit(0);
});