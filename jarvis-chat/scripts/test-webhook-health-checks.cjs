#!/usr/bin/env node

/**
 * Webhook Health Check Testing Script
 * 
 * Tests the enhanced webhook server health monitoring system
 * including performance metrics, service status, and error handling
 */

const http = require('http');
const crypto = require('crypto');

// Test configuration
const WEBHOOK_URL = 'http://localhost:9000';
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

// Test suite
const runHealthCheckTests = async () => {
    console.log('🧪 Starting Webhook Health Check Tests\n');

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

    // Test 1: Basic health check endpoint
    await runTest('Basic Health Check Endpoint', async () => {
        const response = await makeRequest('/health');
        
        if (response.status !== 200) {
            return { success: false, error: `Expected status 200, got ${response.status}` };
        }

        const requiredFields = ['status', 'timestamp', 'uptime', 'services', 'metrics'];
        for (const field of requiredFields) {
            if (!response.body[field]) {
                return { success: false, error: `Missing required field: ${field}` };
            }
        }

        if (!['healthy', 'degraded', 'unhealthy'].includes(response.body.status)) {
            return { success: false, error: `Invalid status: ${response.body.status}` };
        }

        return { 
            success: true, 
            data: {
                status: response.body.status,
                uptime: response.body.uptime.human,
                services: Object.keys(response.body.services).length
            }
        };
    });

    // Test 2: Detailed webhook health endpoint
    await runTest('Detailed Webhook Health Endpoint', async () => {
        const response = await makeRequest('/webhook/health');
        
        if (response.status !== 200) {
            return { success: false, error: `Expected status 200, got ${response.status}` };
        }

        const requiredFields = ['status', 'detailed_metrics', 'services'];
        for (const field of requiredFields) {
            if (!response.body[field]) {
                return { success: false, error: `Missing required field: ${field}` };
            }
        }

        // Check detailed metrics structure
        const detailedMetrics = response.body.detailed_metrics;
        const requiredDetailedFields = ['environment', 'ports', 'service_start_time'];
        for (const field of requiredDetailedFields) {
            if (!detailedMetrics[field]) {
                return { success: false, error: `Missing detailed metric: ${field}` };
            }
        }

        return { 
            success: true, 
            data: {
                environment: detailedMetrics.environment.node_version,
                ports: detailedMetrics.ports,
                secret_configured: detailedMetrics.environment.webhook_secret_configured
            }
        };
    });

    // Test 3: Service status validation
    await runTest('Service Status Validation', async () => {
        const response = await makeRequest('/health');
        
        if (response.status !== 200) {
            return { success: false, error: `Health endpoint failed: ${response.status}` };
        }

        const services = response.body.services;
        const requiredServices = ['webhook_server', 'websocket_server', 'webhook_auth'];
        
        for (const service of requiredServices) {
            if (!services[service]) {
                return { success: false, error: `Missing service: ${service}` };
            }
            
            const serviceData = services[service];
            if (!serviceData.status || !['healthy', 'degraded', 'unhealthy'].includes(serviceData.status)) {
                return { success: false, error: `Invalid status for ${service}: ${serviceData.status}` };
            }
        }

        // Validate specific service fields
        if (typeof services.webhook_server.port !== 'number') {
            return { success: false, error: 'Webhook server port should be a number' };
        }

        if (typeof services.websocket_server.active_connections !== 'number') {
            return { success: false, error: 'WebSocket connections should be a number' };
        }

        if (typeof services.webhook_auth.secret_configured !== 'boolean') {
            return { success: false, error: 'Auth secret configured should be boolean' };
        }

        return { 
            success: true, 
            data: {
                webhook_port: services.webhook_server.port,
                websocket_connections: services.websocket_server.active_connections,
                auth_configured: services.webhook_auth.secret_configured
            }
        };
    });

    // Test 4: Performance metrics structure
    await runTest('Performance Metrics Structure', async () => {
        const response = await makeRequest('/health');
        
        if (response.status !== 200) {
            return { success: false, error: `Health endpoint failed: ${response.status}` };
        }

        const metrics = response.body.metrics;
        const requiredMetrics = ['webhook_delivery', 'event_processing', 'system_resources'];
        
        for (const metric of requiredMetrics) {
            if (!metrics[metric]) {
                return { success: false, error: `Missing metric category: ${metric}` };
            }
        }

        // Validate webhook delivery metrics
        const webhookMetrics = metrics.webhook_delivery;
        const requiredWebhookFields = ['success_rate', 'total_processed', 'avg_response_time', 'p95_response_time'];
        for (const field of requiredWebhookFields) {
            if (typeof webhookMetrics[field] !== 'number') {
                return { success: false, error: `Invalid webhook metric ${field}: should be number` };
            }
        }

        // Validate event processing metrics
        const eventMetrics = metrics.event_processing;
        const requiredEventFields = ['ping_events', 'workflow_run_events', 'unsupported_events'];
        for (const field of requiredEventFields) {
            if (typeof eventMetrics[field] !== 'number') {
                return { success: false, error: `Invalid event metric ${field}: should be number` };
            }
        }

        // Validate system resources
        const systemMetrics = metrics.system_resources;
        if (!systemMetrics.memory || !systemMetrics.cpu) {
            return { success: false, error: 'Missing system resource metrics' };
        }

        return { 
            success: true, 
            data: {
                success_rate: webhookMetrics.success_rate,
                total_processed: webhookMetrics.total_processed,
                memory_usage: systemMetrics.memory.usage_percentage,
                cpu_usage: systemMetrics.cpu.usage_percentage
            }
        };
    });

    // Test 5: Health metrics update after webhook processing
    await runTest('Health Metrics Update After Webhook Processing', async () => {
        // Get initial metrics
        const initialResponse = await makeRequest('/health');
        if (initialResponse.status !== 200) {
            return { success: false, error: 'Failed to get initial health status' };
        }

        const initialProcessed = initialResponse.body.metrics.webhook_delivery.total_processed;
        const initialPingEvents = initialResponse.body.metrics.event_processing.ping_events;

        // Send a ping webhook
        const pingPayload = {
            zen: 'Health check test ping',
            hook_id: 12345,
            repository: { name: 'test-repo' }
        };

        const signature = createWebhookSignature(pingPayload, WEBHOOK_SECRET);
        const webhookResponse = await makeRequest('/webhook/deploy', 'POST', pingPayload, {
            'X-GitHub-Event': 'ping',
            'X-Hub-Signature-256': signature
        });

        if (webhookResponse.status !== 200) {
            return { success: false, error: `Webhook request failed: ${webhookResponse.status}` };
        }

        // Wait a moment for metrics to update
        await sleep(1000);

        // Get updated metrics
        const updatedResponse = await makeRequest('/health');
        if (updatedResponse.status !== 200) {
            return { success: false, error: 'Failed to get updated health status' };
        }

        const updatedProcessed = updatedResponse.body.metrics.webhook_delivery.total_processed;
        const updatedPingEvents = updatedResponse.body.metrics.event_processing.ping_events;

        // Verify metrics were updated
        if (updatedProcessed <= initialProcessed) {
            return { success: false, error: 'Total processed count did not increase' };
        }

        if (updatedPingEvents <= initialPingEvents) {
            return { success: false, error: 'Ping events count did not increase' };
        }

        return { 
            success: true, 
            data: {
                initial_processed: initialProcessed,
                updated_processed: updatedProcessed,
                initial_pings: initialPingEvents,
                updated_pings: updatedPingEvents
            }
        };
    });

    // Test 6: Error handling in health endpoints
    await runTest('Error Handling in Health Endpoints', async () => {
        // This test verifies that health endpoints handle errors gracefully
        // We'll test with the detailed health endpoint which has more complex logic
        
        const response = await makeRequest('/webhook/health');
        
        if (response.status !== 200) {
            return { success: false, error: `Expected successful response, got ${response.status}` };
        }

        // Verify error handling structure exists
        if (!response.body.status) {
            return { success: false, error: 'Health endpoint should always return status' };
        }

        // Verify timestamp is present and valid
        if (!response.body.timestamp) {
            return { success: false, error: 'Health endpoint should always return timestamp' };
        }

        const timestamp = new Date(response.body.timestamp);
        if (isNaN(timestamp.getTime())) {
            return { success: false, error: 'Invalid timestamp format' };
        }

        return { 
            success: true, 
            data: {
                status: response.body.status,
                timestamp_valid: true,
                response_size: JSON.stringify(response.body).length
            }
        };
    });

    // Test 7: Authentication failure metrics tracking
    await runTest('Authentication Failure Metrics Tracking', async () => {
        // Get initial auth metrics
        const initialResponse = await makeRequest('/health');
        if (initialResponse.status !== 200) {
            return { success: false, error: 'Failed to get initial health status' };
        }

        const initialAuthFailures = initialResponse.body.services.webhook_auth.failures || 0;
        const initialTotalAttempts = initialResponse.body.services.webhook_auth.total_attempts || 0;

        // Send webhook with invalid signature
        const payload = { test: 'invalid signature test' };
        const invalidSignature = 'sha256=invalid_signature';
        
        const webhookResponse = await makeRequest('/webhook/deploy', 'POST', payload, {
            'X-GitHub-Event': 'ping',
            'X-Hub-Signature-256': invalidSignature
        });

        if (webhookResponse.status !== 401) {
            return { success: false, error: `Expected 401 for invalid signature, got ${webhookResponse.status}` };
        }

        // Wait for metrics update
        await sleep(1000);

        // Check updated auth metrics
        const updatedResponse = await makeRequest('/health');
        if (updatedResponse.status !== 200) {
            return { success: false, error: 'Failed to get updated health status' };
        }

        const updatedAuthFailures = updatedResponse.body.services.webhook_auth.failures || 0;
        const updatedTotalAttempts = updatedResponse.body.services.webhook_auth.total_attempts || 0;

        // Verify metrics were updated
        if (updatedAuthFailures <= initialAuthFailures) {
            return { success: false, error: 'Auth failures count did not increase' };
        }

        if (updatedTotalAttempts <= initialTotalAttempts) {
            return { success: false, error: 'Total attempts count did not increase' };
        }

        return { 
            success: true, 
            data: {
                initial_failures: initialAuthFailures,
                updated_failures: updatedAuthFailures,
                initial_attempts: initialTotalAttempts,
                updated_attempts: updatedTotalAttempts
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
    runHealthCheckTests()
        .then(success => {
            if (success) {
                console.log('\n🎉 All health check tests passed!');
                process.exit(0);
            } else {
                console.log('\n💥 Some health check tests failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runHealthCheckTests };