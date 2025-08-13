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

// Performance monitoring and health tracking
const performanceMetrics = {
    startTime: Date.now(),
    webhookStats: {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        authFailures: 0,
        processingTimes: [],
        eventTypes: {
            ping: 0,
            workflow_run: 0,
            unsupported: 0
        },
        averageResponseTime: 0,
        p95ResponseTime: 0,
        requestsPerMinute: 0,
        lastRequestTime: null,
        // Enhanced error categorization
        errorCategories: {
            authenticationErrors: 0,
            malformedPayloads: 0,
            processingErrors: 0,
            networkErrors: 0,
            timeoutErrors: 0,
            unknownErrors: 0
        },
        // Detailed response time tracking
        responseTimesByEvent: {
            ping: [],
            workflow_run: [],
            unsupported: []
        },
        // Connection status tracking
        connectionHealth: {
            githubConnectivity: 'healthy',
            lastGithubRequest: null,
            consecutiveFailures: 0,
            totalRetries: 0,
            avgLatency: 0
        }
    },
    serviceHealth: {
        webhookServer: { 
            status: 'healthy', 
            port: 9000, 
            errors: 0, 
            uptime: 0,
            lastHealthCheck: null,
            errorRate: 0,
            peakRequestsPerMinute: 0,
            currentLoad: 0
        },
        websocketServer: { 
            status: 'healthy', 
            port: 9001, 
            connections: 0,
            totalConnections: 0,
            messagesDelivered: 0,
            lastConnectionTime: null,
            connectionErrors: 0,
            messageFailures: 0
        },
        authentication: { 
            status: 'healthy', 
            secretConfigured: false,
            successRate: 100,
            totalAttempts: 0,
            failures: 0,
            lastFailureTime: null,
            failureStreak: 0
        }
    },
    systemHealth: {
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 },
        disk: { available: 0, used: 0, percentage: 0 },
        network: {
            inboundConnections: 0,
            outboundConnections: 0,
            dataTransfer: { in: 0, out: 0 }
        }
    },
    // Performance trends (last 60 data points = 30 minutes at 30-second intervals)
    performanceTrends: {
        timestamps: [],
        successRates: [],
        responseTimes: [],
        errorRates: [],
        connectionCounts: []
    }
};

// Initialize authentication status and health tracking
performanceMetrics.serviceHealth.authentication.secretConfigured = 
    WEBHOOK_SECRET !== 'your-webhook-secret-here';

// Health monitoring functions
const updatePerformanceMetrics = () => {
    const now = Date.now();
    const uptime = now - performanceMetrics.startTime;
    performanceMetrics.serviceHealth.webhookServer.uptime = uptime;
    performanceMetrics.serviceHealth.webhookServer.lastHealthCheck = now;
    
    // Calculate average response time
    const times = performanceMetrics.webhookStats.processingTimes;
    if (times.length > 0) {
        performanceMetrics.webhookStats.averageResponseTime = 
            times.reduce((sum, time) => sum + time, 0) / times.length;
        
        // Calculate 95th percentile
        const sorted = [...times].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        performanceMetrics.webhookStats.p95ResponseTime = sorted[p95Index] || 0;
    }
    
    // Calculate error rates
    const total = performanceMetrics.webhookStats.totalProcessed;
    if (total > 0) {
        performanceMetrics.serviceHealth.webhookServer.errorRate = 
            (performanceMetrics.webhookStats.failed / total) * 100;
        performanceMetrics.serviceHealth.authentication.successRate = 
            ((total - performanceMetrics.webhookStats.authFailures) / total) * 100;
    }
    
    // Update system health
    updateSystemHealth();
};

const updateSystemHealth = () => {
    const memUsage = process.memoryUsage();
    performanceMetrics.systemHealth.memory = {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
    };
    
    // CPU usage approximation based on event loop delay
    const start = process.hrtime();
    setImmediate(() => {
        const delta = process.hrtime(start);
        const nanosec = delta[0] * 1e9 + delta[1];
        const millisec = nanosec / 1e6;
        performanceMetrics.systemHealth.cpu.usage = Math.min(millisec / 10, 100);
    });
};

const recordWebhookProcessing = (processingTime, success = true, authSuccess = true, eventType = 'unknown', errorCategory = null) => {
    const now = Date.now();
    performanceMetrics.webhookStats.totalProcessed++;
    performanceMetrics.webhookStats.lastRequestTime = now;
    
    // Update GitHub connectivity status
    performanceMetrics.webhookStats.connectionHealth.lastGithubRequest = now;
    if (success) {
        performanceMetrics.webhookStats.connectionHealth.consecutiveFailures = 0;
        performanceMetrics.webhookStats.connectionHealth.githubConnectivity = 'healthy';
    } else {
        performanceMetrics.webhookStats.connectionHealth.consecutiveFailures++;
        if (performanceMetrics.webhookStats.connectionHealth.consecutiveFailures >= 3) {
            performanceMetrics.webhookStats.connectionHealth.githubConnectivity = 'degraded';
        }
        if (performanceMetrics.webhookStats.connectionHealth.consecutiveFailures >= 5) {
            performanceMetrics.webhookStats.connectionHealth.githubConnectivity = 'unhealthy';
        }
    }
    
    if (success) {
        performanceMetrics.webhookStats.successful++;
    } else {
        performanceMetrics.webhookStats.failed++;
        performanceMetrics.serviceHealth.webhookServer.errors++;
        
        // Categorize the error
        if (errorCategory) {
            if (performanceMetrics.webhookStats.errorCategories[errorCategory] !== undefined) {
                performanceMetrics.webhookStats.errorCategories[errorCategory]++;
            } else {
                performanceMetrics.webhookStats.errorCategories.unknownErrors++;
            }
        }
    }
    
    if (!authSuccess) {
        performanceMetrics.webhookStats.authFailures++;
        performanceMetrics.serviceHealth.authentication.failures++;
        performanceMetrics.serviceHealth.authentication.lastFailureTime = now;
        performanceMetrics.serviceHealth.authentication.failureStreak++;
        performanceMetrics.webhookStats.errorCategories.authenticationErrors++;
    } else {
        performanceMetrics.serviceHealth.authentication.failureStreak = 0;
    }
    
    performanceMetrics.serviceHealth.authentication.totalAttempts++;
    
    // Keep only last 100 processing times for memory efficiency
    performanceMetrics.webhookStats.processingTimes.push(processingTime);
    if (performanceMetrics.webhookStats.processingTimes.length > 100) {
        performanceMetrics.webhookStats.processingTimes.shift();
    }
    
    // Track response times by event type
    const eventTypeKey = eventType.toLowerCase().replace(/[^a-z_]/g, '_');
    if (performanceMetrics.webhookStats.responseTimesByEvent[eventTypeKey]) {
        performanceMetrics.webhookStats.responseTimesByEvent[eventTypeKey].push(processingTime);
        // Keep only last 50 times per event type
        if (performanceMetrics.webhookStats.responseTimesByEvent[eventTypeKey].length > 50) {
            performanceMetrics.webhookStats.responseTimesByEvent[eventTypeKey].shift();
        }
    }
    
    // Calculate current load (requests per minute)
    const oneMinuteAgo = now - 60000;
    const recentRequests = performanceMetrics.webhookStats.processingTimes.length;
    performanceMetrics.serviceHealth.webhookServer.currentLoad = recentRequests;
    
    if (recentRequests > performanceMetrics.serviceHealth.webhookServer.peakRequestsPerMinute) {
        performanceMetrics.serviceHealth.webhookServer.peakRequestsPerMinute = recentRequests;
    }
    
    updatePerformanceMetrics();
    recordPerformanceTrend();
};

const getServiceStatus = () => {
    const now = Date.now();
    const uptime = now - performanceMetrics.startTime;
    const errorRate = performanceMetrics.serviceHealth.webhookServer.errorRate;
    const authSuccessRate = performanceMetrics.serviceHealth.authentication.successRate;
    
    // Determine overall health status
    let overallStatus = 'healthy';
    if (errorRate > 10 || authSuccessRate < 95) {
        overallStatus = 'degraded';
    }
    if (errorRate > 25 || authSuccessRate < 80) {
        overallStatus = 'unhealthy';
    }
    
    return {
        status: overallStatus,
        timestamp: new Date(now).toISOString(),
        uptime: {
            milliseconds: uptime,
            human: formatUptime(uptime)
        },
        services: {
            webhook_server: {
                status: errorRate > 25 ? 'unhealthy' : errorRate > 10 ? 'degraded' : 'healthy',
                port: PORT,
                uptime: formatUptime(uptime),
                error_rate: parseFloat(errorRate.toFixed(2)),
                total_requests: performanceMetrics.webhookStats.totalProcessed,
                errors: performanceMetrics.serviceHealth.webhookServer.errors
            },
            websocket_server: {
                status: 'healthy',
                port: 9001,
                active_connections: performanceMetrics.serviceHealth.websocketServer.connections,
                total_connections: performanceMetrics.serviceHealth.websocketServer.totalConnections,
                messages_delivered: performanceMetrics.serviceHealth.websocketServer.messagesDelivered
            },
            webhook_auth: {
                status: authSuccessRate < 80 ? 'unhealthy' : authSuccessRate < 95 ? 'degraded' : 'healthy',
                secret_configured: performanceMetrics.serviceHealth.authentication.secretConfigured,
                success_rate: parseFloat(authSuccessRate.toFixed(2)),
                total_attempts: performanceMetrics.serviceHealth.authentication.totalAttempts,
                failures: performanceMetrics.serviceHealth.authentication.failures
            }
        },
        metrics: {
            webhook_delivery: {
                success_rate: parseFloat(((performanceMetrics.webhookStats.successful / Math.max(performanceMetrics.webhookStats.totalProcessed, 1)) * 100).toFixed(2)),
                total_processed: performanceMetrics.webhookStats.totalProcessed,
                avg_response_time: parseFloat(performanceMetrics.webhookStats.averageResponseTime.toFixed(2)),
                p95_response_time: parseFloat(performanceMetrics.webhookStats.p95ResponseTime.toFixed(2)),
                current_load: performanceMetrics.serviceHealth.webhookServer.currentLoad,
                peak_load: performanceMetrics.serviceHealth.webhookServer.peakRequestsPerMinute
            },
            event_processing: {
                ping_events: performanceMetrics.webhookStats.eventTypes.ping,
                workflow_run_events: performanceMetrics.webhookStats.eventTypes.workflow_run,
                unsupported_events: performanceMetrics.webhookStats.eventTypes.unsupported,
                response_times_by_event: {
                    ping_avg: performanceMetrics.webhookStats.responseTimesByEvent.ping.length > 0 ?
                        parseFloat((performanceMetrics.webhookStats.responseTimesByEvent.ping.reduce((a, b) => a + b, 0) / 
                        performanceMetrics.webhookStats.responseTimesByEvent.ping.length).toFixed(2)) : 0,
                    workflow_run_avg: performanceMetrics.webhookStats.responseTimesByEvent.workflow_run.length > 0 ?
                        parseFloat((performanceMetrics.webhookStats.responseTimesByEvent.workflow_run.reduce((a, b) => a + b, 0) / 
                        performanceMetrics.webhookStats.responseTimesByEvent.workflow_run.length).toFixed(2)) : 0,
                    unsupported_avg: performanceMetrics.webhookStats.responseTimesByEvent.unsupported.length > 0 ?
                        parseFloat((performanceMetrics.webhookStats.responseTimesByEvent.unsupported.reduce((a, b) => a + b, 0) / 
                        performanceMetrics.webhookStats.responseTimesByEvent.unsupported.length).toFixed(2)) : 0
                }
            },
            error_analysis: getDetailedErrorAnalysis(),
            connection_status: getConnectionStatusReport(),
            system_resources: {
                memory: {
                    used_mb: parseFloat((performanceMetrics.systemHealth.memory.used / 1024 / 1024).toFixed(2)),
                    total_mb: parseFloat((performanceMetrics.systemHealth.memory.total / 1024 / 1024).toFixed(2)),
                    usage_percentage: parseFloat(performanceMetrics.systemHealth.memory.percentage.toFixed(2))
                },
                cpu: {
                    usage_percentage: parseFloat(performanceMetrics.systemHealth.cpu.usage.toFixed(2))
                },
                network: {
                    inbound_connections: performanceMetrics.systemHealth.network.inboundConnections,
                    outbound_connections: performanceMetrics.systemHealth.network.outboundConnections
                }
            },
            performance_trends: {
                data_points: performanceMetrics.performanceTrends.timestamps.length,
                time_range_minutes: performanceMetrics.performanceTrends.timestamps.length > 1 ?
                    Math.round((performanceMetrics.performanceTrends.timestamps[performanceMetrics.performanceTrends.timestamps.length - 1] - 
                    performanceMetrics.performanceTrends.timestamps[0]) / 60000) : 0,
                recent_success_rate: performanceMetrics.performanceTrends.successRates.length > 0 ?
                    performanceMetrics.performanceTrends.successRates[performanceMetrics.performanceTrends.successRates.length - 1] : 0,
                recent_avg_response_time: performanceMetrics.performanceTrends.responseTimes.length > 0 ?
                    performanceMetrics.performanceTrends.responseTimes[performanceMetrics.performanceTrends.responseTimes.length - 1] : 0
            }
        }
    };
};

const formatUptime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

// Enhanced performance tracking functions
const recordPerformanceTrend = () => {
    const now = Date.now();
    const trends = performanceMetrics.performanceTrends;
    
    // Only record every 30 seconds to avoid excessive data
    if (trends.timestamps.length === 0 || now - trends.timestamps[trends.timestamps.length - 1] >= 30000) {
        trends.timestamps.push(now);
        
        // Calculate current success rate
        const total = performanceMetrics.webhookStats.totalProcessed;
        const successRate = total > 0 ? (performanceMetrics.webhookStats.successful / total) * 100 : 100;
        trends.successRates.push(parseFloat(successRate.toFixed(2)));
        
        // Record current average response time
        trends.responseTimes.push(parseFloat(performanceMetrics.webhookStats.averageResponseTime.toFixed(2)));
        
        // Record current error rate
        const errorRate = total > 0 ? (performanceMetrics.webhookStats.failed / total) * 100 : 0;
        trends.errorRates.push(parseFloat(errorRate.toFixed(2)));
        
        // Record current connection count
        trends.connectionCounts.push(performanceMetrics.serviceHealth.websocketServer.connections);
        
        // Keep only last 60 data points (30 minutes)
        const maxPoints = 60;
        if (trends.timestamps.length > maxPoints) {
            trends.timestamps.shift();
            trends.successRates.shift();
            trends.responseTimes.shift();
            trends.errorRates.shift();
            trends.connectionCounts.shift();
        }
    }
};

const getDetailedErrorAnalysis = () => {
    const errors = performanceMetrics.webhookStats.errorCategories;
    const totalErrors = Object.values(errors).reduce((sum, count) => sum + count, 0);
    
    const analysis = {
        total_errors: totalErrors,
        error_breakdown: {},
        most_common_error: 'none',
        error_trend: 'stable'
    };
    
    if (totalErrors > 0) {
        // Calculate error percentages
        Object.entries(errors).forEach(([category, count]) => {
            if (count > 0) {
                analysis.error_breakdown[category] = {
                    count,
                    percentage: parseFloat(((count / totalErrors) * 100).toFixed(2))
                };
            }
        });
        
        // Find most common error
        const maxError = Object.entries(errors).reduce((max, [category, count]) => 
            count > max.count ? { category, count } : max, { category: 'none', count: 0 });
        analysis.most_common_error = maxError.category;
        
        // Determine error trend from recent data
        const trends = performanceMetrics.performanceTrends;
        if (trends.errorRates.length >= 3) {
            const recent = trends.errorRates.slice(-3);
            const increasing = recent[2] > recent[1] && recent[1] > recent[0];
            const decreasing = recent[2] < recent[1] && recent[1] < recent[0];
            
            if (increasing) analysis.error_trend = 'increasing';
            else if (decreasing) analysis.error_trend = 'decreasing';
        }
    }
    
    return analysis;
};

const getConnectionStatusReport = () => {
    const connection = performanceMetrics.webhookStats.connectionHealth;
    const now = Date.now();
    
    return {
        github_connectivity: {
            status: connection.githubConnectivity,
            last_request: connection.lastGithubRequest ? 
                new Date(connection.lastGithubRequest).toISOString() : null,
            consecutive_failures: connection.consecutiveFailures,
            total_retries: connection.totalRetries,
            avg_latency_ms: parseFloat(connection.avgLatency.toFixed(2)),
            time_since_last_request: connection.lastGithubRequest ? 
                formatUptime(now - connection.lastGithubRequest) : 'never'
        },
        webhook_server: {
            port: performanceMetrics.serviceHealth.webhookServer.port,
            current_load: performanceMetrics.serviceHealth.webhookServer.currentLoad,
            peak_load: performanceMetrics.serviceHealth.webhookServer.peakRequestsPerMinute,
            error_rate: parseFloat(performanceMetrics.serviceHealth.webhookServer.errorRate.toFixed(2))
        },
        websocket_server: {
            port: performanceMetrics.serviceHealth.websocketServer.port,
            active_connections: performanceMetrics.serviceHealth.websocketServer.connections,
            connection_errors: performanceMetrics.serviceHealth.websocketServer.connectionErrors,
            message_failures: performanceMetrics.serviceHealth.websocketServer.messageFailures,
            last_connection: performanceMetrics.serviceHealth.websocketServer.lastConnectionTime ?
                new Date(performanceMetrics.serviceHealth.websocketServer.lastConnectionTime).toISOString() : null
        }
    };
};

// Update metrics every 30 seconds
setInterval(updatePerformanceMetrics, 30000);

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// WebSocket server for real-time notifications
const wss = new WebSocket.Server({ port: 9001 });
const connectedClients = new Set();

wss.on('connection', (ws) => {
    connectedClients.add(ws);
    performanceMetrics.serviceHealth.websocketServer.connections = connectedClients.size;
    performanceMetrics.serviceHealth.websocketServer.totalConnections++;
    performanceMetrics.serviceHealth.websocketServer.lastConnectionTime = Date.now();
    console.log('🔌 Client connected to update notifications');
    
    ws.on('close', () => {
        connectedClients.delete(ws);
        performanceMetrics.serviceHealth.websocketServer.connections = connectedClients.size;
        console.log('🔌 Client disconnected from update notifications');
    });
    
    ws.on('error', (error) => {
        console.error('🔌 WebSocket error:', error);
        connectedClients.delete(ws);
        performanceMetrics.serviceHealth.websocketServer.connections = connectedClients.size;
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
    
    let deliveredCount = 0;
    connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify(notification));
                deliveredCount++;
            } catch (error) {
                console.error('📢 Failed to send notification to client:', error);
                connectedClients.delete(client);
            }
        } else {
            connectedClients.delete(client);
        }
    });
    
    performanceMetrics.serviceHealth.websocketServer.connections = connectedClients.size;
    performanceMetrics.serviceHealth.websocketServer.messagesDelivered += deliveredCount;
    
    console.log(`📢 Notified ${deliveredCount} clients:`, message);
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
    try {
        const healthStatus = getServiceStatus();
        res.json(healthStatus);
    } catch (error) {
        console.error('❌ Health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Detailed webhook health endpoint
app.get('/webhook/health', (req, res) => {
    try {
        const healthStatus = getServiceStatus();
        const detailedHealth = {
            ...healthStatus,
            detailed_metrics: {
                recent_processing_times: performanceMetrics.webhookStats.processingTimes.slice(-10),
                last_request_time: performanceMetrics.webhookStats.lastRequestTime ? 
                    new Date(performanceMetrics.webhookStats.lastRequestTime).toISOString() : null,
                service_start_time: new Date(performanceMetrics.startTime).toISOString(),
                environment: {
                    node_version: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    webhook_secret_configured: performanceMetrics.serviceHealth.authentication.secretConfigured
                },
                ports: {
                    webhook_server: PORT,
                    websocket_server: 9001
                }
            }
        };
        
        res.json(detailedHealth);
    } catch (error) {
        console.error('❌ Webhook health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: 'Webhook health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Alert management endpoints
app.get('/webhook/alerts', (req, res) => {
    try {
        const alertSummary = getAlertSummary();
        res.json({
            timestamp: new Date().toISOString(),
            alerting_enabled: performanceMetrics.alerting.enabled,
            thresholds: performanceMetrics.alerting.thresholds,
            ...alertSummary
        });
    } catch (error) {
        console.error('❌ Alerts endpoint error:', error);
        res.status(500).json({
            error: 'Failed to get alerts',
            timestamp: new Date().toISOString()
        });
    }
});

// Acknowledge alert endpoint
app.post('/webhook/alerts/:alertId/acknowledge', (req, res) => {
    try {
        const { alertId } = req.params;
        const { acknowledgedBy = 'unknown' } = req.body;
        
        const alert = performanceMetrics.alerting.activeAlerts.get(alertId);
        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found',
                alert_id: alertId
            });
        }
        
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = Date.now();
        
        // Send acknowledgment notification
        if (performanceMetrics.alerting.notifications.webhook) {
            const notification = {
                type: 'alert_acknowledged',
                alert: {
                    id: alert.id,
                    type: alert.type,
                    message: `Alert acknowledged by ${acknowledgedBy}: ${alert.message}`,
                    acknowledgedBy,
                    timestamp: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            };
            
            notifyUsers(JSON.stringify(notification), 'alert_acknowledged');
        }
        
        console.log(`✓ Alert acknowledged: ${alert.type} - ${alert.message} (by ${acknowledgedBy})`);
        
        res.json({
            success: true,
            alert: {
                id: alert.id,
                acknowledged_by: acknowledgedBy,
                acknowledged_at: new Date(alert.acknowledgedAt).toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Alert acknowledgment error:', error);
        res.status(500).json({
            error: 'Failed to acknowledge alert',
            message: error.message
        });
    }
});

// Resolve alert endpoint
app.post('/webhook/alerts/:alertId/resolve', (req, res) => {
    try {
        const { alertId } = req.params;
        const { resolvedBy = 'manual' } = req.body;
        
        const success = resolveAlert(alertId, resolvedBy);
        
        if (!success) {
            return res.status(404).json({
                error: 'Alert not found or already resolved',
                alert_id: alertId
            });
        }
        
        res.json({
            success: true,
            message: 'Alert resolved successfully',
            resolved_by: resolvedBy,
            resolved_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Alert resolution error:', error);
        res.status(500).json({
            error: 'Failed to resolve alert',
            message: error.message
        });
    }
});

// Update alert thresholds endpoint
app.post('/webhook/alerts/config', (req, res) => {
    try {
        const { thresholds, enabled, notifications } = req.body;
        
        if (typeof enabled === 'boolean') {
            performanceMetrics.alerting.enabled = enabled;
        }
        
        if (thresholds && typeof thresholds === 'object') {
            // Merge new thresholds with existing ones
            performanceMetrics.alerting.thresholds = {
                ...performanceMetrics.alerting.thresholds,
                ...thresholds
            };
        }
        
        if (notifications && typeof notifications === 'object') {
            performanceMetrics.alerting.notifications = {
                ...performanceMetrics.alerting.notifications,
                ...notifications
            };
        }
        
        console.log('📝 Alert configuration updated:', {
            enabled: performanceMetrics.alerting.enabled,
            thresholds: performanceMetrics.alerting.thresholds,
            notifications: performanceMetrics.alerting.notifications
        });
        
        res.json({
            success: true,
            message: 'Alert configuration updated',
            config: {
                enabled: performanceMetrics.alerting.enabled,
                thresholds: performanceMetrics.alerting.thresholds,
                notifications: performanceMetrics.alerting.notifications
            }
        });
        
    } catch (error) {
        console.error('❌ Alert configuration error:', error);
        res.status(500).json({
            error: 'Failed to update alert configuration',
            message: error.message
        });
    }
});

// Enhanced performance metrics endpoint
app.get('/webhook/metrics', async (req, res) => {
    try {
        const now = Date.now();
        const uptime = now - performanceMetrics.startTime;
        
        const metricsReport = {
            timestamp: new Date(now).toISOString(),
            collection_period: {
                start_time: new Date(performanceMetrics.startTime).toISOString(),
                uptime_ms: uptime,
                uptime_human: formatUptime(uptime)
            },
            webhook_performance: {
                total_requests: performanceMetrics.webhookStats.totalProcessed,
                successful_requests: performanceMetrics.webhookStats.successful,
                failed_requests: performanceMetrics.webhookStats.failed,
                success_rate: performanceMetrics.webhookStats.totalProcessed > 0 ? 
                    parseFloat(((performanceMetrics.webhookStats.successful / performanceMetrics.webhookStats.totalProcessed) * 100).toFixed(2)) : 100,
                authentication: {
                    total_attempts: performanceMetrics.serviceHealth.authentication.totalAttempts,
                    failures: performanceMetrics.webhookStats.authFailures,
                    success_rate: performanceMetrics.serviceHealth.authentication.successRate,
                    current_failure_streak: performanceMetrics.serviceHealth.authentication.failureStreak,
                    last_failure: performanceMetrics.serviceHealth.authentication.lastFailureTime ?
                        new Date(performanceMetrics.serviceHealth.authentication.lastFailureTime).toISOString() : null
                },
                response_times: {
                    average_ms: parseFloat(performanceMetrics.webhookStats.averageResponseTime.toFixed(2)),
                    p95_ms: parseFloat(performanceMetrics.webhookStats.p95ResponseTime.toFixed(2)),
                    recent_samples: performanceMetrics.webhookStats.processingTimes.slice(-10),
                    by_event_type: {
                        ping: {
                            count: performanceMetrics.webhookStats.responseTimesByEvent.ping.length,
                            avg_ms: performanceMetrics.webhookStats.responseTimesByEvent.ping.length > 0 ?
                                parseFloat((performanceMetrics.webhookStats.responseTimesByEvent.ping.reduce((a, b) => a + b, 0) / 
                                performanceMetrics.webhookStats.responseTimesByEvent.ping.length).toFixed(2)) : 0
                        },
                        workflow_run: {
                            count: performanceMetrics.webhookStats.responseTimesByEvent.workflow_run.length,
                            avg_ms: performanceMetrics.webhookStats.responseTimesByEvent.workflow_run.length > 0 ?
                                parseFloat((performanceMetrics.webhookStats.responseTimesByEvent.workflow_run.reduce((a, b) => a + b, 0) / 
                                performanceMetrics.webhookStats.responseTimesByEvent.workflow_run.length).toFixed(2)) : 0
                        },
                        unsupported: {
                            count: performanceMetrics.webhookStats.responseTimesByEvent.unsupported.length,
                            avg_ms: performanceMetrics.webhookStats.responseTimesByEvent.unsupported.length > 0 ?
                                parseFloat((performanceMetrics.webhookStats.responseTimesByEvent.unsupported.reduce((a, b) => a + b, 0) / 
                                performanceMetrics.webhookStats.responseTimesByEvent.unsupported.length).toFixed(2)) : 0
                        }
                    }
                },
                load_metrics: {
                    current_requests_per_minute: performanceMetrics.serviceHealth.webhookServer.currentLoad,
                    peak_requests_per_minute: performanceMetrics.serviceHealth.webhookServer.peakRequestsPerMinute,
                    last_request: performanceMetrics.webhookStats.lastRequestTime ?
                        new Date(performanceMetrics.webhookStats.lastRequestTime).toISOString() : null,
                    time_since_last_request: performanceMetrics.webhookStats.lastRequestTime ?
                        formatUptime(now - performanceMetrics.webhookStats.lastRequestTime) : 'never'
                }
            },
            event_breakdown: {
                ping_events: {
                    count: performanceMetrics.webhookStats.eventTypes.ping,
                    percentage: performanceMetrics.webhookStats.totalProcessed > 0 ?
                        parseFloat(((performanceMetrics.webhookStats.eventTypes.ping / performanceMetrics.webhookStats.totalProcessed) * 100).toFixed(2)) : 0
                },
                workflow_run_events: {
                    count: performanceMetrics.webhookStats.eventTypes.workflow_run,
                    percentage: performanceMetrics.webhookStats.totalProcessed > 0 ?
                        parseFloat(((performanceMetrics.webhookStats.eventTypes.workflow_run / performanceMetrics.webhookStats.totalProcessed) * 100).toFixed(2)) : 0
                },
                unsupported_events: {
                    count: performanceMetrics.webhookStats.eventTypes.unsupported,
                    percentage: performanceMetrics.webhookStats.totalProcessed > 0 ?
                        parseFloat(((performanceMetrics.webhookStats.eventTypes.unsupported / performanceMetrics.webhookStats.totalProcessed) * 100).toFixed(2)) : 0
                }
            },
            error_analysis: getDetailedErrorAnalysis(),
            connection_monitoring: getConnectionStatusReport(),
            websocket_metrics: {
                active_connections: performanceMetrics.serviceHealth.websocketServer.connections,
                total_lifetime_connections: performanceMetrics.serviceHealth.websocketServer.totalConnections,
                messages_delivered: performanceMetrics.serviceHealth.websocketServer.messagesDelivered,
                connection_errors: performanceMetrics.serviceHealth.websocketServer.connectionErrors,
                message_failures: performanceMetrics.serviceHealth.websocketServer.messageFailures,
                last_connection: performanceMetrics.serviceHealth.websocketServer.lastConnectionTime ?
                    new Date(performanceMetrics.serviceHealth.websocketServer.lastConnectionTime).toISOString() : null
            },
            performance_trends: {
                data_points: performanceMetrics.performanceTrends.timestamps.length,
                time_range: {
                    start: performanceMetrics.performanceTrends.timestamps.length > 0 ?
                        new Date(performanceMetrics.performanceTrends.timestamps[0]).toISOString() : null,
                    end: performanceMetrics.performanceTrends.timestamps.length > 0 ?
                        new Date(performanceMetrics.performanceTrends.timestamps[performanceMetrics.performanceTrends.timestamps.length - 1]).toISOString() : null,
                    duration_minutes: performanceMetrics.performanceTrends.timestamps.length > 1 ?
                        Math.round((performanceMetrics.performanceTrends.timestamps[performanceMetrics.performanceTrends.timestamps.length - 1] - 
                        performanceMetrics.performanceTrends.timestamps[0]) / 60000) : 0
                },
                latest_values: {
                    success_rate: performanceMetrics.performanceTrends.successRates.length > 0 ?
                        performanceMetrics.performanceTrends.successRates[performanceMetrics.performanceTrends.successRates.length - 1] : 0,
                    avg_response_time: performanceMetrics.performanceTrends.responseTimes.length > 0 ?
                        performanceMetrics.performanceTrends.responseTimes[performanceMetrics.performanceTrends.responseTimes.length - 1] : 0,
                    error_rate: performanceMetrics.performanceTrends.errorRates.length > 0 ?
                        performanceMetrics.performanceTrends.errorRates[performanceMetrics.performanceTrends.errorRates.length - 1] : 0,
                    connection_count: performanceMetrics.performanceTrends.connectionCounts.length > 0 ?
                        performanceMetrics.performanceTrends.connectionCounts[performanceMetrics.performanceTrends.connectionCounts.length - 1] : 0
                },
                trend_data: {
                    timestamps: performanceMetrics.performanceTrends.timestamps,
                    success_rates: performanceMetrics.performanceTrends.successRates,
                    response_times: performanceMetrics.performanceTrends.responseTimes,
                    error_rates: performanceMetrics.performanceTrends.errorRates,
                    connection_counts: performanceMetrics.performanceTrends.connectionCounts
                }
            },
            system_resources: {
                memory: {
                    used_mb: parseFloat((performanceMetrics.systemHealth.memory.used / 1024 / 1024).toFixed(2)),
                    total_mb: parseFloat((performanceMetrics.systemHealth.memory.total / 1024 / 1024).toFixed(2)),
                    usage_percentage: parseFloat(performanceMetrics.systemHealth.memory.percentage.toFixed(2))
                },
                cpu: {
                    usage_percentage: parseFloat(performanceMetrics.systemHealth.cpu.usage.toFixed(2))
                },
                network: {
                    inbound_connections: performanceMetrics.systemHealth.network.inboundConnections,
                    outbound_connections: performanceMetrics.systemHealth.network.outboundConnections
                }
            }
        };
        
        res.json(metricsReport);
    } catch (error) {
        console.error('❌ Metrics endpoint error:', error);
        res.status(500).json({
            error: 'Failed to generate metrics report',
            timestamp: new Date().toISOString()
        });
    }
});

// GitHub webhook endpoint for deployments
app.post('/webhook/deploy', async (req, res) => {
    const startTime = Date.now();
    let authSuccess = true;
    let processingSuccess = true;
    
    try {
        const signature = req.headers['x-hub-signature-256'];
        const payload = JSON.stringify(req.body);
        
        // Verify GitHub signature
        if (!verifyGitHubSignature(payload, signature)) {
            authSuccess = false;
            processingSuccess = false;
            
            await logAction('WEBHOOK_AUTH_FAILED', { 
                headers: req.headers,
                ip: req.ip,
                event: req.headers['x-github-event']
            });
            
            recordWebhookProcessing(Date.now() - startTime, false, false, 'authentication', 'authenticationErrors');
            
            return res.status(401).json(createWebhookResponse(
                RESPONSE_TYPES.ERROR,
                'Invalid signature'
            ));
        }
        
        const event = req.headers['x-github-event'];
        const data = req.body;
        
        // Validate payload structure
        if (!data || typeof data !== 'object') {
            processingSuccess = false;
            
            await logAction('WEBHOOK_MALFORMED_PAYLOAD', { 
                event,
                content_type: req.headers['content-type'],
                body_type: typeof req.body
            });
            
            recordWebhookProcessing(Date.now() - startTime, false, authSuccess, event, 'malformedPayloads');
            
            return res.status(400).json(createWebhookResponse(
                RESPONSE_TYPES.ERROR,
                'Malformed payload - expected JSON object'
            ));
        }
        
        // Classify event type
        const eventClassification = classifyEvent(event);
        
        // Update event type metrics
        if (eventClassification.type === SUPPORTED_EVENTS.PING) {
            performanceMetrics.webhookStats.eventTypes.ping++;
        } else if (eventClassification.type === SUPPORTED_EVENTS.WORKFLOW_RUN) {
            performanceMetrics.webhookStats.eventTypes.workflow_run++;
        } else {
            performanceMetrics.webhookStats.eventTypes.unsupported++;
        }
        
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
        
        recordWebhookProcessing(Date.now() - startTime, true, authSuccess, event);
        res.json(response);
        
    } catch (error) {
        processingSuccess = false;
        const errorCategory = error.code === 'TIMEOUT' ? 'timeoutErrors' : 
                             error.code === 'ECONNREFUSED' ? 'networkErrors' : 'processingErrors';
        
        recordWebhookProcessing(Date.now() - startTime, false, authSuccess, req.headers['x-github-event'] || 'unknown', errorCategory);
        
        console.error('❌ Webhook error:', error);
        await logAction('WEBHOOK_ERROR', { 
            error: error.message,
            stack: error.stack,
            event: req.headers['x-github-event'],
            error_category: errorCategory
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

// Historical Data Persistence System
const HISTORICAL_DATA_FILE = path.join(LOGS_DIR, 'webhook-historical-data.json');
const MAX_HISTORICAL_RECORDS = 10000; // Keep last 10,000 records
const HISTORICAL_SNAPSHOT_INTERVAL = 60000; // 1 minute

let historicalData = {
    snapshots: [],
    dailyAggregates: {},
    weeklyAggregates: {},
    monthlyAggregates: {},
    trendAnalysis: {
        reliability: { current: 100, trend: 'stable', history: [] },
        performance: { current: 0, trend: 'stable', history: [] },
        usage: { current: 0, trend: 'stable', history: [] }
    },
    lastPersisted: null
};

// Load existing historical data
const loadHistoricalData = async () => {
    try {
        const data = await fs.readFile(HISTORICAL_DATA_FILE, 'utf8');
        historicalData = { ...historicalData, ...JSON.parse(data) };
        console.log(`📊 Loaded ${historicalData.snapshots.length} historical records`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('⚠️ Error loading historical data:', error.message);
        }
        // Create logs directory if it doesn't exist
        await fs.mkdir(LOGS_DIR, { recursive: true });
    }
};

// Save historical data to file
const persistHistoricalData = async () => {
    try {
        await fs.writeFile(HISTORICAL_DATA_FILE, JSON.stringify(historicalData, null, 2));
        historicalData.lastPersisted = Date.now();
    } catch (error) {
        console.error('❌ Error persisting historical data:', error.message);
    }
};

// Create snapshot of current metrics
const createMetricsSnapshot = () => {
    const now = Date.now();
    const uptime = now - performanceMetrics.startTime;
    
    return {
        timestamp: now,
        iso_timestamp: new Date(now).toISOString(),
        uptime_ms: uptime,
        webhook_metrics: {
            total_processed: performanceMetrics.webhookStats.totalProcessed,
            successful: performanceMetrics.webhookStats.successful,
            failed: performanceMetrics.webhookStats.failed,
            success_rate: performanceMetrics.webhookStats.totalProcessed > 0 ? 
                ((performanceMetrics.webhookStats.successful / performanceMetrics.webhookStats.totalProcessed) * 100) : 100,
            auth_failures: performanceMetrics.webhookStats.authFailures,
            avg_response_time: performanceMetrics.webhookStats.averageResponseTime,
            p95_response_time: performanceMetrics.webhookStats.p95ResponseTime,
            event_types: { ...performanceMetrics.webhookStats.eventTypes },
            error_categories: { ...performanceMetrics.webhookStats.errorCategories }
        },
        service_health: {
            webhook_server: { ...performanceMetrics.serviceHealth.webhookServer },
            websocket_server: { ...performanceMetrics.serviceHealth.websocketServer },
            authentication: { ...performanceMetrics.serviceHealth.authentication }
        },
        system_health: { ...performanceMetrics.systemHealth },
        connection_health: { ...performanceMetrics.webhookStats.connectionHealth }
    };
};

// Generate trend analysis
const generateTrendAnalysis = () => {
    const snapshots = historicalData.snapshots;
    if (snapshots.length < 2) return;
    
    const recent = snapshots.slice(-30); // Last 30 snapshots (30 minutes)
    const older = snapshots.slice(-60, -30); // Previous 30 snapshots for comparison
    
    if (recent.length === 0 || older.length === 0) return;
    
    // Calculate reliability trend (success rate)
    const recentReliability = recent.reduce((sum, s) => sum + s.webhook_metrics.success_rate, 0) / recent.length;
    const olderReliability = older.reduce((sum, s) => sum + s.webhook_metrics.success_rate, 0) / older.length;
    
    historicalData.trendAnalysis.reliability = {
        current: parseFloat(recentReliability.toFixed(2)),
        trend: recentReliability > olderReliability + 1 ? 'improving' : 
               recentReliability < olderReliability - 1 ? 'declining' : 'stable',
        history: recent.map(s => ({ 
            timestamp: s.timestamp, 
            value: s.webhook_metrics.success_rate 
        }))
    };
    
    // Calculate performance trend (response time)
    const recentPerformance = recent.reduce((sum, s) => sum + s.webhook_metrics.avg_response_time, 0) / recent.length;
    const olderPerformance = older.reduce((sum, s) => sum + s.webhook_metrics.avg_response_time, 0) / older.length;
    
    historicalData.trendAnalysis.performance = {
        current: parseFloat(recentPerformance.toFixed(2)),
        trend: recentPerformance < olderPerformance - 10 ? 'improving' : 
               recentPerformance > olderPerformance + 10 ? 'declining' : 'stable',
        history: recent.map(s => ({ 
            timestamp: s.timestamp, 
            value: s.webhook_metrics.avg_response_time 
        }))
    };
    
    // Calculate usage trend (requests per snapshot period)
    const recentUsage = recent.reduce((sum, s) => sum + s.webhook_metrics.total_processed, 0) / recent.length;
    const olderUsage = older.reduce((sum, s) => sum + s.webhook_metrics.total_processed, 0) / older.length;
    
    historicalData.trendAnalysis.usage = {
        current: parseFloat(recentUsage.toFixed(2)),
        trend: recentUsage > olderUsage + 5 ? 'increasing' : 
               recentUsage < olderUsage - 5 ? 'decreasing' : 'stable',
        history: recent.map(s => ({ 
            timestamp: s.timestamp, 
            value: s.webhook_metrics.total_processed 
        }))
    };
};

// Generate daily aggregates
const generateDailyAggregates = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todaySnapshots = historicalData.snapshots.filter(s => 
        new Date(s.timestamp).toISOString().split('T')[0] === today
    );
    
    if (todaySnapshots.length === 0) return;
    
    const aggregate = {
        date: today,
        snapshots_count: todaySnapshots.length,
        webhook_metrics: {
            max_total_processed: Math.max(...todaySnapshots.map(s => s.webhook_metrics.total_processed)),
            avg_success_rate: todaySnapshots.reduce((sum, s) => sum + s.webhook_metrics.success_rate, 0) / todaySnapshots.length,
            avg_response_time: todaySnapshots.reduce((sum, s) => sum + s.webhook_metrics.avg_response_time, 0) / todaySnapshots.length,
            max_p95_response_time: Math.max(...todaySnapshots.map(s => s.webhook_metrics.p95_response_time)),
            total_auth_failures: Math.max(...todaySnapshots.map(s => s.webhook_metrics.auth_failures)),
            event_type_breakdown: {
                ping: Math.max(...todaySnapshots.map(s => s.webhook_metrics.event_types.ping)),
                workflow_run: Math.max(...todaySnapshots.map(s => s.webhook_metrics.event_types.workflow_run)),
                unsupported: Math.max(...todaySnapshots.map(s => s.webhook_metrics.event_types.unsupported))
            }
        },
        system_health: {
            max_memory_usage: Math.max(...todaySnapshots.map(s => s.system_health.memory.percentage)),
            avg_cpu_usage: todaySnapshots.reduce((sum, s) => sum + s.system_health.cpu.usage, 0) / todaySnapshots.length
        }
    };
    
    historicalData.dailyAggregates[today] = aggregate;
};

// Historical data snapshot worker
const startHistoricalDataCollection = () => {
    setInterval(() => {
        // Create and store snapshot
        const snapshot = createMetricsSnapshot();
        historicalData.snapshots.push(snapshot);
        
        // Maintain max records limit
        if (historicalData.snapshots.length > MAX_HISTORICAL_RECORDS) {
            historicalData.snapshots = historicalData.snapshots.slice(-MAX_HISTORICAL_RECORDS);
        }
        
        // Generate analytics
        generateTrendAnalysis();
        generateDailyAggregates();
        
        // Persist every 5 minutes
        if (!historicalData.lastPersisted || Date.now() - historicalData.lastPersisted > 300000) {
            persistHistoricalData();
        }
    }, HISTORICAL_SNAPSHOT_INTERVAL);
    
    console.log(`📈 Historical data collection started (${HISTORICAL_SNAPSHOT_INTERVAL/1000}s intervals)`);
};

// Historical analytics endpoints
app.get('/webhook/analytics/historical', async (req, res) => {
    try {
        const { timeRange = '24h', format = 'detailed' } = req.query;
        
        let startTime;
        const now = Date.now();
        
        switch (timeRange) {
            case '1h': startTime = now - (60 * 60 * 1000); break;
            case '6h': startTime = now - (6 * 60 * 60 * 1000); break;
            case '24h': startTime = now - (24 * 60 * 60 * 1000); break;
            case '7d': startTime = now - (7 * 24 * 60 * 60 * 1000); break;
            case '30d': startTime = now - (30 * 24 * 60 * 60 * 1000); break;
            default: startTime = now - (24 * 60 * 60 * 1000);
        }
        
        const filteredSnapshots = historicalData.snapshots.filter(s => s.timestamp >= startTime);
        
        if (format === 'summary') {
            res.json({
                timeRange,
                summary: {
                    snapshots_count: filteredSnapshots.length,
                    date_range: {
                        start: filteredSnapshots.length > 0 ? new Date(filteredSnapshots[0].timestamp).toISOString() : null,
                        end: filteredSnapshots.length > 0 ? new Date(filteredSnapshots[filteredSnapshots.length - 1].timestamp).toISOString() : null
                    },
                    reliability_trend: historicalData.trendAnalysis.reliability,
                    performance_trend: historicalData.trendAnalysis.performance,
                    usage_trend: historicalData.trendAnalysis.usage
                }
            });
        } else {
            res.json({
                timeRange,
                snapshots: filteredSnapshots,
                trend_analysis: historicalData.trendAnalysis,
                daily_aggregates: historicalData.dailyAggregates
            });
        }
    } catch (error) {
        console.error('❌ Historical analytics error:', error);
        res.status(500).json({
            error: 'Failed to retrieve historical analytics',
            message: error.message
        });
    }
});

app.get('/webhook/analytics/usage-patterns', async (req, res) => {
    try {
        const { period = 'daily' } = req.query;
        const snapshots = historicalData.snapshots;
        
        if (snapshots.length === 0) {
            return res.json({
                period,
                patterns: [],
                insights: { message: 'Insufficient data for pattern analysis' }
            });
        }
        
        // Group snapshots by time period
        const groups = {};
        snapshots.forEach(snapshot => {
            const date = new Date(snapshot.timestamp);
            let groupKey;
            
            switch (period) {
                case 'hourly':
                    groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
                    break;
                case 'daily':
                    groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    break;
                case 'weekly':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    groupKey = `Week of ${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
                    break;
                default:
                    groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
            
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(snapshot);
        });
        
        // Analyze patterns
        const patterns = Object.entries(groups).map(([period, periodSnapshots]) => {
            const maxProcessed = Math.max(...periodSnapshots.map(s => s.webhook_metrics.total_processed));
            const avgSuccessRate = periodSnapshots.reduce((sum, s) => sum + s.webhook_metrics.success_rate, 0) / periodSnapshots.length;
            const avgResponseTime = periodSnapshots.reduce((sum, s) => sum + s.webhook_metrics.avg_response_time, 0) / periodSnapshots.length;
            
            return {
                period,
                snapshots_count: periodSnapshots.length,
                webhook_volume: maxProcessed,
                avg_success_rate: parseFloat(avgSuccessRate.toFixed(2)),
                avg_response_time: parseFloat(avgResponseTime.toFixed(2)),
                event_distribution: {
                    ping: Math.max(...periodSnapshots.map(s => s.webhook_metrics.event_types.ping)),
                    workflow_run: Math.max(...periodSnapshots.map(s => s.webhook_metrics.event_types.workflow_run)),
                    unsupported: Math.max(...periodSnapshots.map(s => s.webhook_metrics.event_types.unsupported))
                }
            };
        });
        
        // Generate insights
        const insights = {
            total_periods: patterns.length,
            avg_volume_per_period: patterns.reduce((sum, p) => sum + p.webhook_volume, 0) / patterns.length,
            peak_volume_period: patterns.reduce((max, p) => p.webhook_volume > max.webhook_volume ? p : max, patterns[0]),
            reliability_consistency: {
                min_success_rate: Math.min(...patterns.map(p => p.avg_success_rate)),
                max_success_rate: Math.max(...patterns.map(p => p.avg_success_rate)),
                avg_success_rate: patterns.reduce((sum, p) => sum + p.avg_success_rate, 0) / patterns.length
            }
        };
        
        res.json({
            period,
            patterns: patterns.sort((a, b) => a.period.localeCompare(b.period)),
            insights
        });
    } catch (error) {
        console.error('❌ Usage patterns analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze usage patterns',
            message: error.message
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('💥 Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 JARVIS Webhook Server running on port ${PORT}`);
    console.log(`📡 WebSocket notifications on port 9001`);
    console.log(`📝 Logs directory: ${LOGS_DIR}`);
    console.log(`📁 Project root: ${PROJECT_ROOT}`);
    console.log(`📈 Historical analytics: http://0.0.0.0:${PORT}/webhook/analytics/historical`);
    console.log(`📊 Usage patterns: http://0.0.0.0:${PORT}/webhook/analytics/usage-patterns`);
    
    // Initialize historical data system
    await loadHistoricalData();
    startHistoricalDataCollection();
    
    logAction('SERVER_START', {
        port: PORT,
        websocketPort: 9001,
        projectRoot: PROJECT_ROOT,
        alerting_enabled: performanceMetrics.alerting.enabled,
        historical_data_enabled: true,
        timestamp: new Date().toISOString()
    });
    
    // Log alerting system status
    console.log(`🚨 Alerting System: ${performanceMetrics.alerting.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📋 Alert Thresholds:`);
    console.log(`   Error Rate: Warning ${performanceMetrics.alerting.thresholds.errorRate.warning}%, Critical ${performanceMetrics.alerting.thresholds.errorRate.critical}%`);
    console.log(`   Response Time: Warning ${performanceMetrics.alerting.thresholds.responseTime.warning}ms, Critical ${performanceMetrics.alerting.thresholds.responseTime.critical}ms`);
    console.log(`   Auth Failures: Warning ${performanceMetrics.alerting.thresholds.authFailureRate.warning}%, Critical ${performanceMetrics.alerting.thresholds.authFailureRate.critical}%`);
    console.log(`🔔 Notifications: WebSocket ${performanceMetrics.alerting.notifications.webhook ? 'ON' : 'OFF'}, Console ${performanceMetrics.alerting.notifications.console ? 'ON' : 'OFF'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    
    // Create shutdown alert
    if (performanceMetrics.alerting.enabled) {
        createAlert(
            'system_shutdown',
            'warning',
            'Webhook server is shutting down',
            {
                shutdown_reason: 'SIGTERM received',
                uptime: Date.now() - performanceMetrics.startTime,
                active_alerts: performanceMetrics.alerting.activeAlerts.size,
                timestamp: new Date().toISOString()
            }
        );
        
        // Give alerts time to be sent
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await logAction('SERVER_SHUTDOWN', { 
        timestamp: new Date().toISOString(),
        active_alerts: performanceMetrics.alerting.activeAlerts.size
    });
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Received interrupt signal, shutting down gracefully');
    
    // Create shutdown alert
    if (performanceMetrics.alerting.enabled) {
        createAlert(
            'system_shutdown',
            'warning',
            'Webhook server interrupted',
            {
                shutdown_reason: 'SIGINT received',
                uptime: Date.now() - performanceMetrics.startTime,
                active_alerts: performanceMetrics.alerting.activeAlerts.size,
                timestamp: new Date().toISOString()
            }
        );
        
        // Give alerts time to be sent
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await logAction('SERVER_SHUTDOWN', { 
        timestamp: new Date().toISOString(),
        active_alerts: performanceMetrics.alerting.activeAlerts.size
    });
    process.exit(0);
});

module.exports = app;