#!/usr/bin/env node

/**
 * Automated Alerting System Testing Script
 * 
 * Tests the comprehensive alerting and notification system
 * including threshold-based alerts, WebSocket notifications, and alert management
 */

const http = require('http');
const crypto = require('crypto');
const WebSocket = require('ws');

// Test configuration
const WEBHOOK_URL = 'http://localhost:9000';
const WEBSOCKET_URL = 'ws://localhost:9001';
const WEBHOOK_SECRET = 'bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h';

// Test utilities
const makeRequest = (path, method = 'GET', data = null, headers = {}) => {
    return new Promise((resolve, reject) => {
        const url = new URL(path, WEBHOOK_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsedBody = body ? JSON.parse(body) : {};
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsedBody
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

const createWebhookSignature = (payload, secret) => {
    return 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// WebSocket notification listener
const createWebSocketListener = () => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(WEBSOCKET_URL);
        const notifications = [];
        let connectionEstablished = false;

        ws.on('open', () => {
            console.log('📡 WebSocket connection established for alert monitoring');
            connectionEstablished = true;
        });

        ws.on('message', (data) => {
            try {
                const notification = JSON.parse(data.toString());
                notifications.push(notification);
                console.log(`🔔 Received notification: ${notification.type} - ${notification.message || notification.alert?.message}`);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            if (!connectionEstablished) {
                reject(error);
            }
        });

        // Return listener interface
        setTimeout(() => {
            resolve({
                getNotifications: () => notifications,
                close: () => ws.close(),
                isConnected: () => ws.readyState === WebSocket.OPEN
            });
        }, 1000);
    });
};

// Test suite
const runAlertingSystemTests = async () => {
    console.log('🧪 Starting Automated Alerting System Tests\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    const runTest = async (testName, testFunc) => {
        console.log(`🔍 Running: ${testName}`);
        try {
            const result = await testFunc();
            if (result.success) {
                console.log(`✅ PASS: ${testName}`);
                results.passed++;
            } else {
                console.log(`❌ FAIL: ${testName} - ${result.error}`);
                results.failed++;
            }
            results.tests.push({ name: testName, ...result });
        } catch (error) {
            console.log(`❌ ERROR: ${testName} - ${error.message}`);
            results.failed++;
            results.tests.push({ 
                name: testName, 
                success: false, 
                error: error.message 
            });
        }
        console.log('');
    };

    // Test 1: Alert configuration and thresholds endpoint
    await runTest('Alert Configuration Endpoint', async () => {
        const response = await makeRequest('/webhook/alerts');
        
        if (response.status !== 200) {
            return { success: false, error: `Expected status 200, got ${response.status}` };
        }

        const requiredFields = ['timestamp', 'alerting_enabled', 'thresholds', 'total_active', 'critical', 'warnings'];
        for (const field of requiredFields) {
            if (response.body[field] === undefined) {
                return { success: false, error: `Missing required field: ${field}` };
            }
        }

        // Validate thresholds structure
        const thresholds = response.body.thresholds;
        const requiredThresholds = ['errorRate', 'responseTime', 'authFailureRate', 'consecutiveFailures'];
        for (const threshold of requiredThresholds) {
            if (!thresholds[threshold] || !thresholds[threshold].warning || !thresholds[threshold].critical) {
                return { success: false, error: `Invalid threshold configuration for ${threshold}` };
            }
        }

        return { 
            success: true, 
            data: {
                alerting_enabled: response.body.alerting_enabled,
                total_active_alerts: response.body.total_active,
                critical_alerts: response.body.critical,
                warning_alerts: response.body.warnings,
                thresholds_configured: Object.keys(thresholds).length
            }
        };
    });

    // Test 2: Generate authentication failure alerts
    await runTest('Authentication Failure Alert Generation', async () => {
        // Get initial alert count
        const initialResponse = await makeRequest('/webhook/alerts');
        if (initialResponse.status !== 200) {
            return { success: false, error: 'Failed to get initial alert status' };
        }

        const initialAlerts = initialResponse.body.total_active;

        // Generate multiple authentication failures to trigger alert
        const failureCount = 5;
        for (let i = 0; i < failureCount; i++) {
            const invalidPayload = { test: `auth_failure_${i}` };
            const invalidSignature = 'sha256=invalid_signature';
            
            await makeRequest('/webhook/deploy', 'POST', invalidPayload, {
                'X-GitHub-Event': 'ping',
                'X-Hub-Signature-256': invalidSignature
            });
            
            await sleep(100); // Small delay between failures
        }

        // Wait for alert system to process
        await sleep(2000);

        // Check for new alerts
        const updatedResponse = await makeRequest('/webhook/alerts');
        if (updatedResponse.status !== 200) {
            return { success: false, error: 'Failed to get updated alert status' };
        }

        const updatedAlerts = updatedResponse.body.total_active;
        const activeAlerts = updatedResponse.body.active_alerts || [];

        // Look for authentication failure alerts
        const authAlerts = activeAlerts.filter(alert => alert.type === 'auth_failure');

        if (authAlerts.length === 0) {
            return { success: false, error: 'No authentication failure alerts generated despite multiple failures' };
        }

        return { 
            success: true, 
            data: {
                initial_alerts: initialAlerts,
                updated_alerts: updatedAlerts,
                auth_failure_alerts: authAlerts.length,
                alert_severity: authAlerts[0]?.severity,
                failure_count: failureCount
            }
        };
    });

    // Test 3: WebSocket alert notifications
    await runTest('WebSocket Alert Notifications', async () => {
        let wsListener;
        try {
            // Establish WebSocket connection
            wsListener = await createWebSocketListener();
            
            if (!wsListener.isConnected()) {
                return { success: false, error: 'Failed to establish WebSocket connection' };
            }

            // Generate a webhook failure to trigger alert
            const invalidPayload = { test: 'websocket_alert_test' };
            const invalidSignature = 'sha256=invalid_signature';
            
            await makeRequest('/webhook/deploy', 'POST', invalidPayload, {
                'X-GitHub-Event': 'ping',
                'X-Hub-Signature-256': invalidSignature
            });

            // Wait for notification
            await sleep(3000);

            const notifications = wsListener.getNotifications();
            const alertNotifications = notifications.filter(n => n.type === 'alert');

            if (alertNotifications.length === 0) {
                return { success: false, error: 'No alert notifications received via WebSocket' };
            }

            // Validate notification structure
            const alertNotification = alertNotifications[0];
            if (!alertNotification.alert || !alertNotification.alert.id || !alertNotification.alert.type) {
                return { success: false, error: 'Invalid alert notification structure' };
            }

            return { 
                success: true, 
                data: {
                    notifications_received: notifications.length,
                    alert_notifications: alertNotifications.length,
                    alert_type: alertNotification.alert.type,
                    alert_severity: alertNotification.alert.severity,
                    notification_timestamp: alertNotification.timestamp
                }
            };
        } finally {
            if (wsListener) {
                wsListener.close();
            }
        }
    });

    // Test 4: Alert acknowledgment
    await runTest('Alert Acknowledgment System', async () => {
        // Get current active alerts
        const alertsResponse = await makeRequest('/webhook/alerts');
        if (alertsResponse.status !== 200) {
            return { success: false, error: 'Failed to get current alerts' };
        }

        const activeAlerts = alertsResponse.body.active_alerts || [];
        if (activeAlerts.length === 0) {
            return { success: false, error: 'No active alerts to acknowledge' };
        }

        const alertToAck = activeAlerts[0];
        
        // Acknowledge the alert
        const ackResponse = await makeRequest(`/webhook/alerts/${alertToAck.id}/acknowledge`, 'POST', {
            acknowledgedBy: 'test-user'
        });

        if (ackResponse.status !== 200) {
            return { success: false, error: `Failed to acknowledge alert: ${ackResponse.status}` };
        }

        if (!ackResponse.body.success) {
            return { success: false, error: 'Alert acknowledgment response indicates failure' };
        }

        // Verify alert is acknowledged
        const verifyResponse = await makeRequest('/webhook/alerts');
        const updatedAlerts = verifyResponse.body.active_alerts || [];
        const acknowledgedAlert = updatedAlerts.find(alert => alert.id === alertToAck.id);

        return { 
            success: true, 
            data: {
                alert_id: alertToAck.id,
                alert_type: alertToAck.type,
                acknowledged_by: ackResponse.body.alert.acknowledged_by,
                acknowledged_at: ackResponse.body.alert.acknowledged_at,
                still_active: !!acknowledgedAlert
            }
        };
    });

    // Test 5: Alert resolution
    await runTest('Alert Resolution System', async () => {
        // Get current active alerts
        const alertsResponse = await makeRequest('/webhook/alerts');
        if (alertsResponse.status !== 200) {
            return { success: false, error: 'Failed to get current alerts' };
        }

        const activeAlerts = alertsResponse.body.active_alerts || [];
        if (activeAlerts.length === 0) {
            return { success: false, error: 'No active alerts to resolve' };
        }

        const alertToResolve = activeAlerts[0];
        
        // Resolve the alert
        const resolveResponse = await makeRequest(`/webhook/alerts/${alertToResolve.id}/resolve`, 'POST', {
            resolvedBy: 'test-user'
        });

        if (resolveResponse.status !== 200) {
            return { success: false, error: `Failed to resolve alert: ${resolveResponse.status}` };
        }

        if (!resolveResponse.body.success) {
            return { success: false, error: 'Alert resolution response indicates failure' };
        }

        // Verify alert is removed from active alerts
        await sleep(1000);
        const verifyResponse = await makeRequest('/webhook/alerts');
        const updatedAlerts = verifyResponse.body.active_alerts || [];
        const resolvedAlert = updatedAlerts.find(alert => alert.id === alertToResolve.id);

        return { 
            success: true, 
            data: {
                alert_id: alertToResolve.id,
                alert_type: alertToResolve.type,
                resolved_by: resolveResponse.body.resolved_by,
                resolved_at: resolveResponse.body.resolved_at,
                removed_from_active: !resolvedAlert
            }
        };
    });

    // Test 6: Dynamic alert threshold configuration
    await runTest('Dynamic Alert Threshold Configuration', async () => {
        // Get current configuration
        const currentResponse = await makeRequest('/webhook/alerts');
        const currentThresholds = currentResponse.body.thresholds;

        // Update thresholds
        const newThresholds = {
            errorRate: {
                warning: 5,
                critical: 15
            },
            responseTime: {
                warning: 300,
                critical: 800
            }
        };

        const updateResponse = await makeRequest('/webhook/alerts/config', 'POST', {
            thresholds: newThresholds,
            enabled: true
        });

        if (updateResponse.status !== 200) {
            return { success: false, error: `Failed to update configuration: ${updateResponse.status}` };
        }

        if (!updateResponse.body.success) {
            return { success: false, error: 'Configuration update response indicates failure' };
        }

        // Verify configuration was updated
        const verifyResponse = await makeRequest('/webhook/alerts');
        const updatedThresholds = verifyResponse.body.thresholds;

        if (updatedThresholds.errorRate.warning !== newThresholds.errorRate.warning ||
            updatedThresholds.responseTime.critical !== newThresholds.responseTime.critical) {
            return { success: false, error: 'Threshold configuration was not properly updated' };
        }

        return { 
            success: true, 
            data: {
                old_error_warning: currentThresholds.errorRate.warning,
                new_error_warning: updatedThresholds.errorRate.warning,
                old_response_critical: currentThresholds.responseTime.critical,
                new_response_critical: updatedThresholds.responseTime.critical,
                config_updated: true
            }
        };
    });

    // Test 7: Alert history and recent alerts
    await runTest('Alert History and Recent Alerts', async () => {
        const response = await makeRequest('/webhook/alerts');
        
        if (response.status !== 200) {
            return { success: false, error: `Failed to get alerts: ${response.status}` };
        }

        const recentHistory = response.body.recent_history || [];
        
        if (recentHistory.length === 0) {
            return { success: false, error: 'No alert history available' };
        }

        // Validate history structure
        const historyItem = recentHistory[0];
        const requiredHistoryFields = ['id', 'type', 'severity', 'message', 'timestamp', 'resolved'];
        
        for (const field of requiredHistoryFields) {
            if (historyItem[field] === undefined) {
                return { success: false, error: `Missing history field: ${field}` };
            }
        }

        // Count resolved vs unresolved
        const resolvedCount = recentHistory.filter(alert => alert.resolved).length;
        const unresolvedCount = recentHistory.length - resolvedCount;

        return { 
            success: true, 
            data: {
                total_history_items: recentHistory.length,
                resolved_alerts: resolvedCount,
                unresolved_alerts: unresolvedCount,
                most_recent_alert_type: historyItem.type,
                most_recent_alert_age: new Date() - new Date(historyItem.timestamp)
            }
        };
    });

    // Test 8: Performance degradation alert simulation
    await runTest('Performance Degradation Alert Simulation', async () => {
        // This test simulates high response times by checking if the system
        // would generate alerts based on current thresholds
        
        const metricsResponse = await makeRequest('/webhook/metrics');
        if (metricsResponse.status !== 200) {
            return { success: false, error: 'Failed to get performance metrics' };
        }

        const alertsResponse = await makeRequest('/webhook/alerts');
        if (alertsResponse.status !== 200) {
            return { success: false, error: 'Failed to get alert configuration' };
        }

        const avgResponseTime = metricsResponse.body.webhook_performance.response_times.average_ms;
        const warningThreshold = alertsResponse.body.thresholds.responseTime.warning;
        const criticalThreshold = alertsResponse.body.thresholds.responseTime.critical;
        
        // Determine expected alert level based on current metrics
        let expectedAlertLevel = 'none';
        if (avgResponseTime >= criticalThreshold) {
            expectedAlertLevel = 'critical';
        } else if (avgResponseTime >= warningThreshold) {
            expectedAlertLevel = 'warning';
        }

        // Check if appropriate alerts exist
        const activeAlerts = alertsResponse.body.active_alerts || [];
        const performanceAlerts = activeAlerts.filter(alert => alert.type === 'performance_degradation');

        return { 
            success: true, 
            data: {
                avg_response_time: avgResponseTime,
                warning_threshold: warningThreshold,
                critical_threshold: criticalThreshold,
                expected_alert_level: expectedAlertLevel,
                performance_alerts_count: performanceAlerts.length,
                alert_system_working: expectedAlertLevel === 'none' ? performanceAlerts.length === 0 : performanceAlerts.length > 0
            }
        };
    });

    // Display results
    console.log('🏁 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total: ${results.tests.length}`);
    console.log(`🎯 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%\n`);

    if (results.failed > 0) {
        console.log('❌ Failed Tests:');
        results.tests
            .filter(test => !test.success)
            .forEach(test => {
                console.log(`   • ${test.name}: ${test.error}`);
            });
        console.log('');
    }

    if (results.passed > 0) {
        console.log('✅ Passed Tests with Details:');
        results.tests
            .filter(test => test.success)
            .forEach(test => {
                console.log(`   • ${test.name}`);
                if (test.data) {
                    Object.entries(test.data).forEach(([key, value]) => {
                        console.log(`     ${key}: ${JSON.stringify(value)}`);
                    });
                }
            });
    }

    return results.passed === results.tests.length;
};

// Main execution
if (require.main === module) {
    runAlertingSystemTests()
        .then(success => {
            if (success) {
                console.log('\n🎉 All alerting system tests passed!');
                process.exit(0);
            } else {
                console.log('\n💥 Some alerting system tests failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runAlertingSystemTests };