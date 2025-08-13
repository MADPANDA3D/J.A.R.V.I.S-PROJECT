#!/usr/bin/env node

/**
 * Performance Metrics Collection Testing Script
 * 
 * Tests the enhanced performance metrics collection system
 * including categorized error reporting and connection monitoring
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
const runPerformanceMetricsTests = async () => {
    console.log('🧪 Starting Performance Metrics Collection Tests\n');

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

    // Test 1: Enhanced metrics endpoint availability
    await runTest('Enhanced Metrics Endpoint Availability', async () => {
        const response = await makeRequest('/webhook/metrics');
        
        if (response.status !== 200) {
            return { success: false, error: `Expected status 200, got ${response.status}` };
        }

        const requiredSections = [
            'timestamp', 'collection_period', 'webhook_performance', 
            'event_breakdown', 'error_analysis', 'connection_monitoring',
            'websocket_metrics', 'performance_trends'
        ];
        
        for (const section of requiredSections) {
            if (!response.body[section]) {
                return { success: false, error: `Missing required section: ${section}` };
            }
        }

        return { 
            success: true, 
            data: {
                sections_count: Object.keys(response.body).length,
                uptime: response.body.collection_period.uptime_human,
                total_requests: response.body.webhook_performance.total_requests
            }
        };
    });

    // Test 2: Error categorization validation
    await runTest('Error Categorization System', async () => {
        const response = await makeRequest('/webhook/metrics');
        
        if (response.status !== 200) {
            return { success: false, error: 'Failed to get metrics' };
        }

        const errorAnalysis = response.body.error_analysis;
        if (!errorAnalysis) {
            return { success: false, error: 'Missing error_analysis section' };
        }

        const requiredErrorFields = ['total_errors', 'error_breakdown', 'most_common_error', 'error_trend'];
        for (const field of requiredErrorFields) {
            if (errorAnalysis[field] === undefined) {
                return { success: false, error: `Missing error analysis field: ${field}` };
            }
        }

        // Test that error breakdown is properly structured
        if (typeof errorAnalysis.error_breakdown !== 'object') {
            return { success: false, error: 'Error breakdown should be an object' };
        }

        return { 
            success: true, 
            data: {
                total_errors: errorAnalysis.total_errors,
                most_common_error: errorAnalysis.most_common_error,
                error_trend: errorAnalysis.error_trend
            }
        };
    });

    // Test 3: Response time tracking by event type
    await runTest('Response Time Tracking by Event Type', async () => {
        // Send different types of webhook events to populate metrics
        const testEvents = [
            { event: 'ping', payload: { zen: 'Test ping', hook_id: 12345 } },
            { event: 'workflow_run', payload: { action: 'completed', workflow_run: { conclusion: 'success', name: 'test' } } }
        ];

        for (const testEvent of testEvents) {
            const signature = createWebhookSignature(testEvent.payload, WEBHOOK_SECRET);
            await makeRequest('/webhook/deploy', 'POST', testEvent.payload, {
                'X-GitHub-Event': testEvent.event,
                'X-Hub-Signature-256': signature
            });
            await sleep(100); // Small delay between requests
        }

        // Wait for metrics to update
        await sleep(1000);

        const response = await makeRequest('/webhook/metrics');
        if (response.status !== 200) {
            return { success: false, error: 'Failed to get updated metrics' };
        }

        const responseTimesByEvent = response.body.webhook_performance.response_times.by_event_type;
        if (!responseTimesByEvent) {
            return { success: false, error: 'Missing response times by event type' };
        }

        const requiredEventTypes = ['ping', 'workflow_run', 'unsupported'];
        for (const eventType of requiredEventTypes) {
            if (!responseTimesByEvent[eventType]) {
                return { success: false, error: `Missing response times for ${eventType} events` };
            }

            if (typeof responseTimesByEvent[eventType].count !== 'number' ||
                typeof responseTimesByEvent[eventType].avg_ms !== 'number') {
                return { success: false, error: `Invalid response time data structure for ${eventType}` };
            }
        }

        return { 
            success: true, 
            data: {
                ping_count: responseTimesByEvent.ping.count,
                ping_avg_ms: responseTimesByEvent.ping.avg_ms,
                workflow_run_count: responseTimesByEvent.workflow_run.count,
                workflow_run_avg_ms: responseTimesByEvent.workflow_run.avg_ms
            }
        };
    });

    // Test 4: Connection monitoring validation
    await runTest('Connection Monitoring System', async () => {
        const response = await makeRequest('/webhook/metrics');
        
        if (response.status !== 200) {
            return { success: false, error: 'Failed to get metrics' };
        }

        const connectionMonitoring = response.body.connection_monitoring;
        if (!connectionMonitoring) {
            return { success: false, error: 'Missing connection_monitoring section' };
        }

        const requiredSections = ['github_connectivity', 'webhook_server', 'websocket_server'];
        for (const section of requiredSections) {
            if (!connectionMonitoring[section]) {
                return { success: false, error: `Missing connection monitoring section: ${section}` };
            }
        }

        // Validate GitHub connectivity structure
        const githubConn = connectionMonitoring.github_connectivity;
        const requiredGithubFields = ['status', 'consecutive_failures', 'total_retries', 'avg_latency_ms'];
        for (const field of requiredGithubFields) {
            if (githubConn[field] === undefined) {
                return { success: false, error: `Missing GitHub connectivity field: ${field}` };
            }
        }

        if (!['healthy', 'degraded', 'unhealthy'].includes(githubConn.status)) {
            return { success: false, error: `Invalid GitHub connectivity status: ${githubConn.status}` };
        }

        return { 
            success: true, 
            data: {
                github_status: githubConn.status,
                consecutive_failures: githubConn.consecutive_failures,
                webhook_server_port: connectionMonitoring.webhook_server.port,
                websocket_connections: connectionMonitoring.websocket_server.active_connections
            }
        };
    });

    // Test 5: Performance trends tracking
    await runTest('Performance Trends Tracking', async () => {
        const response = await makeRequest('/webhook/metrics');
        
        if (response.status !== 200) {
            return { success: false, error: 'Failed to get metrics' };
        }

        const performanceTrends = response.body.performance_trends;
        if (!performanceTrends) {
            return { success: false, error: 'Missing performance_trends section' };
        }

        const requiredTrendFields = ['data_points', 'time_range', 'latest_values', 'trend_data'];
        for (const field of requiredTrendFields) {
            if (!performanceTrends[field]) {
                return { success: false, error: `Missing performance trends field: ${field}` };
            }
        }

        // Validate trend data arrays
        const trendData = performanceTrends.trend_data;
        const requiredArrays = ['timestamps', 'success_rates', 'response_times', 'error_rates', 'connection_counts'];
        for (const arrayName of requiredArrays) {
            if (!Array.isArray(trendData[arrayName])) {
                return { success: false, error: `Trend data ${arrayName} should be an array` };
            }
        }

        // Validate that all arrays have the same length
        const arrayLengths = requiredArrays.map(name => trendData[name].length);
        const uniqueLengths = [...new Set(arrayLengths)];
        if (uniqueLengths.length > 1) {
            return { success: false, error: 'Trend data arrays should have the same length' };
        }

        return { 
            success: true, 
            data: {
                data_points: performanceTrends.data_points,
                duration_minutes: performanceTrends.time_range.duration_minutes,
                latest_success_rate: performanceTrends.latest_values.success_rate,
                latest_avg_response_time: performanceTrends.latest_values.avg_response_time
            }
        };
    });

    // Test 6: Error categorization with actual errors
    await runTest('Error Categorization with Actual Errors', async () => {
        // Generate authentication error
        const invalidPayload = { test: 'auth error' };
        const invalidSignature = 'sha256=invalid_signature';
        
        const authErrorResponse = await makeRequest('/webhook/deploy', 'POST', invalidPayload, {
            'X-GitHub-Event': 'ping',
            'X-Hub-Signature-256': invalidSignature
        });

        if (authErrorResponse.status !== 401) {
            return { success: false, error: `Expected 401 for auth error, got ${authErrorResponse.status}` };
        }

        // Generate malformed payload error
        const malformedResponse = await makeRequest('/webhook/deploy', 'POST', null, {
            'X-GitHub-Event': 'ping',
            'X-Hub-Signature-256': createWebhookSignature({}, WEBHOOK_SECRET),
            'Content-Type': 'text/plain'
        });

        // Wait for metrics to update
        await sleep(1000);

        const metricsResponse = await makeRequest('/webhook/metrics');
        if (metricsResponse.status !== 200) {
            return { success: false, error: 'Failed to get updated metrics after errors' };
        }

        const errorAnalysis = metricsResponse.body.error_analysis;
        if (errorAnalysis.total_errors === 0) {
            return { success: false, error: 'Expected errors to be recorded but found none' };
        }

        // Check that authentication errors are categorized
        if (!errorAnalysis.error_breakdown.authenticationErrors && 
            !errorAnalysis.error_breakdown.malformedPayloads) {
            return { success: false, error: 'Expected authentication or malformed payload errors to be categorized' };
        }

        return { 
            success: true, 
            data: {
                total_errors: errorAnalysis.total_errors,
                error_categories: Object.keys(errorAnalysis.error_breakdown),
                most_common_error: errorAnalysis.most_common_error
            }
        };
    });

    // Test 7: WebSocket metrics tracking
    await runTest('WebSocket Metrics Tracking', async () => {
        const response = await makeRequest('/webhook/metrics');
        
        if (response.status !== 200) {
            return { success: false, error: 'Failed to get metrics' };
        }

        const websocketMetrics = response.body.websocket_metrics;
        if (!websocketMetrics) {
            return { success: false, error: 'Missing websocket_metrics section' };
        }

        const requiredWebSocketFields = [
            'active_connections', 'total_lifetime_connections', 'messages_delivered',
            'connection_errors', 'message_failures'
        ];
        
        for (const field of requiredWebSocketFields) {
            if (typeof websocketMetrics[field] !== 'number') {
                return { success: false, error: `WebSocket metric ${field} should be a number` };
            }
        }

        // Validate that active connections is not negative
        if (websocketMetrics.active_connections < 0) {
            return { success: false, error: 'Active connections should not be negative' };
        }

        return { 
            success: true, 
            data: {
                active_connections: websocketMetrics.active_connections,
                total_lifetime_connections: websocketMetrics.total_lifetime_connections,
                messages_delivered: websocketMetrics.messages_delivered,
                connection_errors: websocketMetrics.connection_errors
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
    runPerformanceMetricsTests()
        .then(success => {
            if (success) {
                console.log('\n🎉 All performance metrics tests passed!');
                process.exit(0);
            } else {
                console.log('\n💥 Some performance metrics tests failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runPerformanceMetricsTests };