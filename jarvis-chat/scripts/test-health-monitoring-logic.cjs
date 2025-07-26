#!/usr/bin/env node

/**
 * Health Monitoring Logic Unit Tests
 * 
 * Tests the health monitoring functions and performance metrics
 * without requiring a running server
 */

// Mock the required modules and globals for testing
const mockPerformanceMetrics = {
    startTime: Date.now() - 300000, // 5 minutes ago
    webhookStats: {
        totalProcessed: 50,
        successful: 48,
        failed: 2,
        authFailures: 1,
        processingTimes: [120, 150, 89, 203, 156, 134, 98, 167, 178, 142],
        eventTypes: {
            ping: 15,
            workflow_run: 33,
            unsupported: 2
        },
        averageResponseTime: 0,
        p95ResponseTime: 0,
        requestsPerMinute: 0,
        lastRequestTime: Date.now() - 30000
    },
    serviceHealth: {
        webhookServer: { 
            status: 'healthy', 
            port: 9000, 
            errors: 2, 
            uptime: 0,
            lastHealthCheck: null,
            errorRate: 0
        },
        websocketServer: { 
            status: 'healthy', 
            port: 9001, 
            connections: 3,
            totalConnections: 25,
            messagesDelivered: 147,
            lastConnectionTime: Date.now() - 60000
        },
        authentication: { 
            status: 'healthy', 
            secretConfigured: true,
            successRate: 100,
            totalAttempts: 49,
            failures: 1
        }
    },
    systemHealth: {
        memory: { used: 52428800, total: 67108864, percentage: 78.125 },
        cpu: { usage: 15.5 }
    }
};

// Mock process object
const mockProcess = {
    memoryUsage: () => ({
        heapUsed: 52428800,
        heapTotal: 67108864,
        external: 1048576,
        arrayBuffers: 524288
    }),
    version: 'v20.0.0',
    platform: 'linux',
    arch: 'x64',
    hrtime: () => [0, 5000000] // 5ms
};

// Health monitoring functions (extracted from server code)
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

const updatePerformanceMetrics = (metrics) => {
    const now = Date.now();
    const uptime = now - metrics.startTime;
    metrics.serviceHealth.webhookServer.uptime = uptime;
    metrics.serviceHealth.webhookServer.lastHealthCheck = now;
    
    // Calculate average response time
    const times = metrics.webhookStats.processingTimes;
    if (times.length > 0) {
        metrics.webhookStats.averageResponseTime = 
            times.reduce((sum, time) => sum + time, 0) / times.length;
        
        // Calculate 95th percentile
        const sorted = [...times].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        metrics.webhookStats.p95ResponseTime = sorted[p95Index] || 0;
    }
    
    // Calculate error rates
    const total = metrics.webhookStats.totalProcessed;
    if (total > 0) {
        metrics.serviceHealth.webhookServer.errorRate = 
            (metrics.webhookStats.failed / total) * 100;
        metrics.serviceHealth.authentication.successRate = 
            ((total - metrics.webhookStats.authFailures) / total) * 100;
    }
    
    return metrics;
};

const getServiceStatus = (metrics, PORT = 9000) => {  
    const now = Date.now();
    const uptime = now - metrics.startTime;
    const errorRate = metrics.serviceHealth.webhookServer.errorRate;
    const authSuccessRate = metrics.serviceHealth.authentication.successRate;
    
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
                total_requests: metrics.webhookStats.totalProcessed,
                errors: metrics.serviceHealth.webhookServer.errors
            },
            websocket_server: {
                status: 'healthy',
                port: 9001,
                active_connections: metrics.serviceHealth.websocketServer.connections,
                total_connections: metrics.serviceHealth.websocketServer.totalConnections,
                messages_delivered: metrics.serviceHealth.websocketServer.messagesDelivered
            },
            webhook_auth: {
                status: authSuccessRate < 80 ? 'unhealthy' : authSuccessRate < 95 ? 'degraded' : 'healthy',
                secret_configured: metrics.serviceHealth.authentication.secretConfigured,
                success_rate: parseFloat(authSuccessRate.toFixed(2)),
                total_attempts: metrics.serviceHealth.authentication.totalAttempts,
                failures: metrics.serviceHealth.authentication.failures
            }
        },
        metrics: {
            webhook_delivery: {
                success_rate: parseFloat(((metrics.webhookStats.successful / Math.max(metrics.webhookStats.totalProcessed, 1)) * 100).toFixed(2)),
                total_processed: metrics.webhookStats.totalProcessed,
                avg_response_time: parseFloat(metrics.webhookStats.averageResponseTime.toFixed(2)),
                p95_response_time: parseFloat(metrics.webhookStats.p95ResponseTime.toFixed(2))
            },
            event_processing: {
                ping_events: metrics.webhookStats.eventTypes.ping,
                workflow_run_events: metrics.webhookStats.eventTypes.workflow_run,
                unsupported_events: metrics.webhookStats.eventTypes.unsupported
            },
            system_resources: {
                memory: {
                    used_mb: parseFloat((metrics.systemHealth.memory.used / 1024 / 1024).toFixed(2)),
                    total_mb: parseFloat((metrics.systemHealth.memory.total / 1024 / 1024).toFixed(2)),
                    usage_percentage: parseFloat(metrics.systemHealth.memory.percentage.toFixed(2))
                },
                cpu: {
                    usage_percentage: parseFloat(metrics.systemHealth.cpu.usage.toFixed(2))
                }
            }
        }
    };
};

// Test suite
const runHealthMonitoringLogicTests = async () => {
    console.log('🧪 Starting Health Monitoring Logic Tests\n');

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

    // Test 1: Format uptime function
    await runTest('Format Uptime Function', async () => {
        const testCases = [
            { input: 1000, expected: '1s' },
            { input: 65000, expected: '1m 5s' },
            { input: 3665000, expected: '1h 1m 5s' },
            { input: 90061000, expected: '1d 1h 1m' }
        ];

        for (const testCase of testCases) {
            const result = formatUptime(testCase.input);
            if (result !== testCase.expected) {
                return { 
                    success: false, 
                    error: `Expected '${testCase.expected}' for ${testCase.input}ms, got '${result}'` 
                };
            }
        }

        return { 
            success: true, 
            data: { test_cases_passed: testCases.length }
        };
    });

    // Test 2: Performance metrics calculation
    await runTest('Performance Metrics Calculation', async () => {
        const testMetrics = JSON.parse(JSON.stringify(mockPerformanceMetrics));
        updatePerformanceMetrics(testMetrics);

        // Validate average response time calculation
        const expectedAvg = testMetrics.webhookStats.processingTimes.reduce((sum, time) => sum + time, 0) / 
                           testMetrics.webhookStats.processingTimes.length;
        
        if (Math.abs(testMetrics.webhookStats.averageResponseTime - expectedAvg) > 0.1) {
            return { 
                success: false, 
                error: `Average response time calculation incorrect. Expected ${expectedAvg}, got ${testMetrics.webhookStats.averageResponseTime}` 
            };
        }

        // Validate P95 calculation
        const sorted = [...testMetrics.webhookStats.processingTimes].sort((a, b) => a - b);
        const expectedP95 = sorted[Math.floor(sorted.length * 0.95)];
        
        if (testMetrics.webhookStats.p95ResponseTime !== expectedP95) {
            return { 
                success: false, 
                error: `P95 response time calculation incorrect. Expected ${expectedP95}, got ${testMetrics.webhookStats.p95ResponseTime}` 
            };
        }

        // Validate error rate calculation
        const expectedErrorRate = (testMetrics.webhookStats.failed / testMetrics.webhookStats.totalProcessed) * 100;
        
        if (Math.abs(testMetrics.serviceHealth.webhookServer.errorRate - expectedErrorRate) > 0.1) {
            return { 
                success: false, 
                error: `Error rate calculation incorrect. Expected ${expectedErrorRate}, got ${testMetrics.serviceHealth.webhookServer.errorRate}` 
            };
        }

        return { 
            success: true, 
            data: {
                avg_response_time: testMetrics.webhookStats.averageResponseTime,
                p95_response_time: testMetrics.webhookStats.p95ResponseTime,
                error_rate: testMetrics.serviceHealth.webhookServer.errorRate
            }
        };
    });

    // Test 3: Service status determination
    await runTest('Service Status Determination', async () => {
        // Test healthy status
        const healthyMetrics = JSON.parse(JSON.stringify(mockPerformanceMetrics));
        healthyMetrics.webhookStats.failed = 1; // 2% error rate
        updatePerformanceMetrics(healthyMetrics);
        
        const healthyStatus = getServiceStatus(healthyMetrics);
        if (healthyStatus.status !== 'healthy') {
            return { 
                success: false, 
                error: `Expected healthy status with low error rate, got ${healthyStatus.status}` 
            };
        }

        // Test degraded status
        const degradedMetrics = JSON.parse(JSON.stringify(mockPerformanceMetrics));
        degradedMetrics.webhookStats.failed = 6; // 12% error rate
        updatePerformanceMetrics(degradedMetrics);
        
        const degradedStatus = getServiceStatus(degradedMetrics);
        if (degradedStatus.status !== 'degraded') {
            return { 
                success: false, 
                error: `Expected degraded status with medium error rate, got ${degradedStatus.status}` 
            };
        }

        // Test unhealthy status
        const unhealthyMetrics = JSON.parse(JSON.stringify(mockPerformanceMetrics));
        unhealthyMetrics.webhookStats.failed = 15; // 30% error rate
        updatePerformanceMetrics(unhealthyMetrics);
        
        const unhealthyStatus = getServiceStatus(unhealthyMetrics);
        if (unhealthyStatus.status !== 'unhealthy') {
            return { 
                success: false, 
                error: `Expected unhealthy status with high error rate, got ${unhealthyStatus.status}` 
            };
        }

        return { 
            success: true, 
            data: {
                healthy_test: healthyStatus.services.webhook_server.error_rate,
                degraded_test: degradedStatus.services.webhook_server.error_rate,
                unhealthy_test: unhealthyStatus.services.webhook_server.error_rate
            }
        };
    });

    // Test 4: Health status response structure
    await runTest('Health Status Response Structure', async () => {
        const testMetrics = JSON.parse(JSON.stringify(mockPerformanceMetrics));
        updatePerformanceMetrics(testMetrics);
        
        const status = getServiceStatus(testMetrics);

        // Validate top-level structure
        const requiredFields = ['status', 'timestamp', 'uptime', 'services', 'metrics'];
        for (const field of requiredFields) {
            if (!status[field]) {
                return { success: false, error: `Missing required field: ${field}` };
            }
        }

        // Validate services structure
        const requiredServices = ['webhook_server', 'websocket_server', 'webhook_auth'];
        for (const service of requiredServices) {
            if (!status.services[service]) {
                return { success: false, error: `Missing service: ${service}` };
            }
        }

        // Validate metrics structure
        const requiredMetrics = ['webhook_delivery', 'event_processing', 'system_resources'];
        for (const metric of requiredMetrics) {
            if (!status.metrics[metric]) {
                return { success: false, error: `Missing metric: ${metric}` };
            }
        }

        // Validate data types
        if (typeof status.services.webhook_server.port !== 'number') {
            return { success: false, error: 'Webhook server port should be a number' };
        }

        if (typeof status.metrics.webhook_delivery.success_rate !== 'number') {
            return { success: false, error: 'Success rate should be a number' };
        }

        return { 
            success: true, 
            data: {
                status: status.status,
                services_count: Object.keys(status.services).length,
                metrics_count: Object.keys(status.metrics).length
            }
        };
    });

    // Test 5: Authentication success rate calculation
    await runTest('Authentication Success Rate Calculation', async () => {
        const testMetrics = JSON.parse(JSON.stringify(mockPerformanceMetrics));
        
        // Test case 1: High success rate
        testMetrics.webhookStats.totalProcessed = 100;
        testMetrics.webhookStats.authFailures = 2;
        updatePerformanceMetrics(testMetrics);
        
        const expectedSuccessRate1 = ((100 - 2) / 100) * 100; // 98%
        const actualSuccessRate1 = testMetrics.serviceHealth.authentication.successRate;
        
        if (Math.abs(actualSuccessRate1 - expectedSuccessRate1) > 0.1) {
            return { 
                success: false, 
                error: `Auth success rate calculation incorrect. Expected ${expectedSuccessRate1}, got ${actualSuccessRate1}` 
            };
        }

        // Test case 2: Low success rate (should mark as degraded)
        testMetrics.webhookStats.authFailures = 10; // 90% success rate
        updatePerformanceMetrics(testMetrics);
        
        const status = getServiceStatus(testMetrics);
        if (status.services.webhook_auth.status !== 'degraded') {
            return { 
                success: false, 
                error: `Expected degraded auth status with 90% success rate, got ${status.services.webhook_auth.status}` 
            };
        }

        return { 
            success: true, 
            data: {
                high_success_rate: expectedSuccessRate1,
                low_success_rate: testMetrics.serviceHealth.authentication.successRate,
                auth_status: status.services.webhook_auth.status
            }
        };
    });

    // Test 6: Webhook processing time metrics
    await runTest('Webhook Processing Time Metrics', async () => {
        const testMetrics = JSON.parse(JSON.stringify(mockPerformanceMetrics));
        
        // Test adding processing times (should maintain only last 100)
        const initialLength = testMetrics.webhookStats.processingTimes.length;
        
        // Simulate adding many processing times
        for (let i = 0; i < 95; i++) {
            testMetrics.webhookStats.processingTimes.push(100 + i);
            // Simulate the server's behavior of keeping only last 100
            if (testMetrics.webhookStats.processingTimes.length > 100) {
                testMetrics.webhookStats.processingTimes.shift();
            }
        }
        
        // Should have exactly 100 times (last 100)
        if (testMetrics.webhookStats.processingTimes.length !== 100) {
            return { 
                success: false, 
                error: `Expected exactly 100 processing times, got ${testMetrics.webhookStats.processingTimes.length}` 
            };
        }

        updatePerformanceMetrics(testMetrics);

        // Validate calculations with new data
        const avgTime = testMetrics.webhookStats.averageResponseTime;
        const p95Time = testMetrics.webhookStats.p95ResponseTime;

        if (avgTime <= 0 || p95Time <= 0) {
            return { 
                success: false, 
                error: `Invalid calculated times: avg=${avgTime}, p95=${p95Time}` 
            };
        }

        if (p95Time < avgTime) {
            return { 
                success: false, 
                error: `P95 time (${p95Time}) should be >= average time (${avgTime})` 
            };
        }

        return { 
            success: true, 
            data: {
                processing_times_count: testMetrics.webhookStats.processingTimes.length,
                avg_time: avgTime,
                p95_time: p95Time
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
    runHealthMonitoringLogicTests()
        .then(success => {
            if (success) {
                console.log('\n🎉 All health monitoring logic tests passed!');
                process.exit(0);
            } else {
                console.log('\n💥 Some health monitoring logic tests failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runHealthMonitoringLogicTests };