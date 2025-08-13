#!/usr/bin/env node

/**
 * Integration Test Script for Webhook Monitoring System
 * Tests compatibility with Stories 005.001-005.003 infrastructure
 * and validates monitoring system performance impact
 */

const crypto = require('crypto');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');

// Test configuration
const TEST_CONFIG = {
    webhookUrl: 'http://localhost:9000/webhook',
    healthUrl: 'http://localhost:9000/webhook/health',
    metricsUrl: 'http://localhost:9000/webhook/metrics',
    alertsUrl: 'http://localhost:9000/webhook/alerts',
    historicalUrl: 'http://localhost:9000/webhook/analytics/historical',
    usagePatternsUrl: 'http://localhost:9000/webhook/analytics/usage-patterns',
    websocketUrl: 'ws://localhost:9001',
    testSecret: process.env.WEBHOOK_SECRET || 'test-secret-key',
    maxResponseTime: 500, // Maximum acceptable response time in ms
    testConcurrency: 10, // Number of concurrent requests for load testing
    testDuration: 30000, // Test duration in ms (30 seconds)
};

// Test results tracking
const testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    warnings: [],
    errors: [],
    performanceMetrics: {
        baselineLatency: null,
        monitoringLatency: null,
        overhead: null,
        throughput: {
            baseline: 0,
            withMonitoring: 0
        }
    },
    compatibilityResults: {
        story005001: { passed: false, details: [] },
        story005002: { passed: false, details: [] },
        story005003: { passed: false, details: [] }
    }
};

// Utility functions
const logTest = (testName, status, details = null) => {
    const timestamp = new Date().toISOString();
    const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
    console.log(`${symbol} [${timestamp}] ${testName} - ${status}`);
    if (details) {
        console.log(`   ${details}`);
    }
    
    testResults.totalTests++;
    if (status === 'PASS') {
        testResults.passedTests++;
    } else if (status === 'FAIL') {
        testResults.failedTests++;
        testResults.errors.push({ test: testName, details });
    } else if (status === 'WARN') {
        testResults.warnings.push({ test: testName, details });
    }
};

const generateWebhookSignature = (payload, secret) => {
    return `sha256=${crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex')}`;
};

const makeRequest = (options, data = null) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const protocol = options.protocol === 'https:' ? https : http;
        
        const req = protocol.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                try {
                    const parsedData = responseData ? JSON.parse(responseData) : null;
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsedData,
                        responseTime,
                        rawData: responseData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: null,
                        responseTime,
                        rawData: responseData
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(data);
        }
        
        req.end();
    });
};

// Test 1: Basic Health Check Integration
const testHealthCheckIntegration = async () => {
    try {
        const url = new URL(TEST_CONFIG.healthUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const response = await makeRequest(options);
        
        if (response.statusCode === 200 && response.data) {
            const requiredFields = ['status', 'timestamp', 'services', 'metrics'];
            const hasAllFields = requiredFields.every(field => response.data.hasOwnProperty(field));
            
            if (hasAllFields) {
                logTest('Health Check Integration', 'PASS', 
                    `Response time: ${response.responseTime}ms, Status: ${response.data.status}`);
                
                // Validate service health structure
                const services = response.data.services;
                if (services.webhook_server && services.websocket_server && services.webhook_auth) {
                    logTest('Health Check Service Structure', 'PASS', 
                        'All required services present in health check');
                } else {
                    logTest('Health Check Service Structure', 'FAIL', 
                        'Missing required services in health check response');
                }
            } else {
                logTest('Health Check Integration', 'FAIL', 
                    'Missing required fields in response');
            }
        } else {
            logTest('Health Check Integration', 'FAIL', 
                `Invalid response: ${response.statusCode}, ${response.rawData}`);
        }
    } catch (error) {
        logTest('Health Check Integration', 'FAIL', error.message);
    }
};

// Test 2: Webhook Authentication Compatibility (Story 005.001)
const testWebhookAuthenticationCompatibility = async () => {
    try {
        const payload = JSON.stringify({
            zen: "Non-blocking is better than blocking.",
            hook_id: 12345678,
            hook: {
                type: "Repository",
                id: 12345678,
                name: "web",
                active: true,
                events: ["ping", "workflow_run"],
                config: {
                    content_type: "json",
                    insecure_ssl: "0",
                    url: "http://example.com/webhook"
                }
            }
        });
        
        const signature = generateWebhookSignature(payload, TEST_CONFIG.testSecret);
        
        const url = new URL(TEST_CONFIG.webhookUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'ping',
                'X-GitHub-Delivery': crypto.randomUUID(),
                'X-Hub-Signature-256': signature,
                'User-Agent': 'GitHub-Hookshot/test'
            }
        };
        
        const response = await makeRequest(options, payload);
        
        if (response.statusCode === 200) {
            logTest('Webhook Authentication Compatibility (005.001)', 'PASS', 
                `Ping webhook processed successfully in ${response.responseTime}ms`);
            testResults.compatibilityResults.story005001.passed = true;
            testResults.compatibilityResults.story005001.details.push('Webhook authentication working correctly');
        } else {
            logTest('Webhook Authentication Compatibility (005.001)', 'FAIL', 
                `Authentication failed: ${response.statusCode}`);
            testResults.compatibilityResults.story005001.details.push(`Authentication failed with status ${response.statusCode}`);
        }
    } catch (error) {
        logTest('Webhook Authentication Compatibility (005.001)', 'FAIL', error.message);
        testResults.compatibilityResults.story005001.details.push(`Error: ${error.message}`);
    }
};

// Test 3: Webhook Payload Handler Compatibility (Story 005.002)
const testWebhookPayloadHandlerCompatibility = async () => {
    try {
        // Test workflow_run event processing
        const workflowPayload = JSON.stringify({
            action: "completed",
            workflow_run: {
                id: 12345,
                name: "CI/CD Pipeline",
                status: "completed",
                conclusion: "success",
                workflow_id: 123,
                check_suite_id: 456,
                check_suite_node_id: "MDEwOkNoZWNrU3VpdGU0NTY=",
                head_branch: "main",
                head_sha: "abc123def456",
                run_number: 42,
                run_attempt: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            repository: {
                id: 789,
                name: "test-repo",
                full_name: "user/test-repo"
            }
        });
        
        const signature = generateWebhookSignature(workflowPayload, TEST_CONFIG.testSecret);
        
        const url = new URL(TEST_CONFIG.webhookUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'workflow_run',
                'X-GitHub-Delivery': crypto.randomUUID(),
                'X-Hub-Signature-256': signature,
                'User-Agent': 'GitHub-Hookshot/test'
            }
        };
        
        const response = await makeRequest(options, workflowPayload);
        
        if (response.statusCode === 200) {
            logTest('Webhook Payload Handler Compatibility (005.002)', 'PASS', 
                `Workflow run event processed successfully in ${response.responseTime}ms`);
            testResults.compatibilityResults.story005002.passed = true;
            testResults.compatibilityResults.story005002.details.push('Workflow run event processing working correctly');
        } else {
            logTest('Webhook Payload Handler Compatibility (005.002)', 'FAIL', 
                `Payload processing failed: ${response.statusCode}`);
            testResults.compatibilityResults.story005002.details.push(`Payload processing failed with status ${response.statusCode}`);
        }
    } catch (error) {
        logTest('Webhook Payload Handler Compatibility (005.002)', 'FAIL', error.message);
        testResults.compatibilityResults.story005002.details.push(`Error: ${error.message}`);
    }
};

// Test 4: GitHub Actions Integration Compatibility (Story 005.003)
const testGitHubActionsIntegrationCompatibility = async () => {
    try {
        // Simulate a GitHub Actions deployment webhook
        const deploymentPayload = JSON.stringify({
            action: "completed",
            workflow_run: {
                id: 98765,
                name: "Deploy to Production",
                status: "completed",
                conclusion: "success",
                workflow_id: 321,
                check_suite_id: 654,
                head_branch: "main",
                head_sha: "def456abc123",
                run_number: 100,
                run_attempt: 1,
                created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
                updated_at: new Date().toISOString(),
                jobs_url: "https://api.github.com/repos/user/repo/actions/runs/98765/jobs",
                logs_url: "https://api.github.com/repos/user/repo/actions/runs/98765/logs"
            },
            repository: {
                id: 111,
                name: "jarvis-chat",
                full_name: "user/jarvis-chat"
            }
        });
        
        const signature = generateWebhookSignature(deploymentPayload, TEST_CONFIG.testSecret);
        
        const url = new URL(TEST_CONFIG.webhookUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'workflow_run',
                'X-GitHub-Delivery': crypto.randomUUID(),
                'X-Hub-Signature-256': signature,
                'User-Agent': 'GitHub-Hookshot/test'
            }
        };
        
        const response = await makeRequest(options, deploymentPayload);
        
        if (response.statusCode === 200) {
            logTest('GitHub Actions Integration Compatibility (005.003)', 'PASS', 
                `Deployment webhook processed successfully in ${response.responseTime}ms`);
            testResults.compatibilityResults.story005003.passed = true;
            testResults.compatibilityResults.story005003.details.push('GitHub Actions deployment webhook working correctly');
        } else {
            logTest('GitHub Actions Integration Compatibility (005.003)', 'FAIL', 
                `Deployment webhook failed: ${response.statusCode}`);
            testResults.compatibilityResults.story005003.details.push(`Deployment webhook failed with status ${response.statusCode}`);
        }
    } catch (error) {
        logTest('GitHub Actions Integration Compatibility (005.003)', 'FAIL', error.message);
        testResults.compatibilityResults.story005003.details.push(`Error: ${error.message}`);
    }
};

// Test 5: Performance Impact Validation
const testPerformanceImpact = async () => {
    console.log('\n🔍 Starting Performance Impact Validation...');
    
    try {
        // Baseline performance test (simple ping)
        const baselineStart = Date.now();
        const baselineRequests = [];
        
        for (let i = 0; i < TEST_CONFIG.testConcurrency; i++) {
            const payload = JSON.stringify({ zen: "Testing baseline performance" });
            const signature = generateWebhookSignature(payload, TEST_CONFIG.testSecret);
            
            const url = new URL(TEST_CONFIG.webhookUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 80,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-GitHub-Event': 'ping',
                    'X-GitHub-Delivery': crypto.randomUUID(),
                    'X-Hub-Signature-256': signature,
                    'User-Agent': 'GitHub-Hookshot/perf-test'
                }
            };
            
            baselineRequests.push(makeRequest(options, payload));
        }
        
        const baselineResults = await Promise.all(baselineRequests);
        const baselineEnd = Date.now();
        
        const baselineLatencies = baselineResults.map(r => r.responseTime);
        const avgBaselineLatency = baselineLatencies.reduce((a, b) => a + b, 0) / baselineLatencies.length;
        const baselineThroughput = (TEST_CONFIG.testConcurrency * 1000) / (baselineEnd - baselineStart);
        
        testResults.performanceMetrics.baselineLatency = avgBaselineLatency;
        testResults.performanceMetrics.throughput.baseline = baselineThroughput;
        
        logTest('Baseline Performance', 'INFO', 
            `Avg latency: ${avgBaselineLatency.toFixed(2)}ms, Throughput: ${baselineThroughput.toFixed(2)} req/s`);
        
        // Wait a moment to let metrics settle
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Performance test with monitoring active
        const monitoringStart = Date.now();
        const monitoringRequests = [];
        
        for (let i = 0; i < TEST_CONFIG.testConcurrency; i++) {
            const payload = JSON.stringify({
                action: "completed",
                workflow_run: {
                    id: 99000 + i,
                    name: "Performance Test Workflow",
                    status: "completed",
                    conclusion: "success",
                    workflow_id: 999,
                    run_number: i + 1
                }
            });
            const signature = generateWebhookSignature(payload, TEST_CONFIG.testSecret);
            
            const url = new URL(TEST_CONFIG.webhookUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 80,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-GitHub-Event': 'workflow_run',
                    'X-GitHub-Delivery': crypto.randomUUID(),
                    'X-Hub-Signature-256': signature,
                    'User-Agent': 'GitHub-Hookshot/perf-test'
                }
            };
            
            monitoringRequests.push(makeRequest(options, payload));
        }
        
        const monitoringResults = await Promise.all(monitoringRequests);
        const monitoringEnd = Date.now();
        
        const monitoringLatencies = monitoringResults.map(r => r.responseTime);
        const avgMonitoringLatency = monitoringLatencies.reduce((a, b) => a + b, 0) / monitoringLatencies.length;
        const monitoringThroughput = (TEST_CONFIG.testConcurrency * 1000) / (monitoringEnd - monitoringStart);
        
        testResults.performanceMetrics.monitoringLatency = avgMonitoringLatency;
        testResults.performanceMetrics.throughput.withMonitoring = monitoringThroughput;
        testResults.performanceMetrics.overhead = ((avgMonitoringLatency - avgBaselineLatency) / avgBaselineLatency) * 100;
        
        logTest('Monitoring Performance', 'INFO', 
            `Avg latency: ${avgMonitoringLatency.toFixed(2)}ms, Throughput: ${monitoringThroughput.toFixed(2)} req/s`);
        
        const overheadPercentage = testResults.performanceMetrics.overhead;
        if (overheadPercentage < 5) {
            logTest('Performance Impact Validation', 'PASS', 
                `Monitoring overhead: ${overheadPercentage.toFixed(2)}% (acceptable)`);
        } else if (overheadPercentage < 15) {
            logTest('Performance Impact Validation', 'WARN', 
                `Monitoring overhead: ${overheadPercentage.toFixed(2)}% (moderate impact)`);
        } else {
            logTest('Performance Impact Validation', 'FAIL', 
                `Monitoring overhead: ${overheadPercentage.toFixed(2)}% (high impact)`);
        }
        
    } catch (error) {
        logTest('Performance Impact Validation', 'FAIL', error.message);
    }
};

// Test 6: Historical Analytics Endpoint Testing
const testHistoricalAnalyticsEndpoints = async () => {
    try {
        // Test historical analytics endpoint
        const url = new URL(TEST_CONFIG.historicalUrl + '?timeRange=1h&format=summary');
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const response = await makeRequest(options);
        
        if (response.statusCode === 200 && response.data) {
            const requiredFields = ['timeRange', 'summary'];
            const hasAllFields = requiredFields.every(field => response.data.hasOwnProperty(field));
            
            if (hasAllFields && response.data.summary.reliability_trend) {
                logTest('Historical Analytics Endpoints', 'PASS', 
                    `Response time: ${response.responseTime}ms, Data points: ${response.data.summary.snapshots_count}`);
            } else {
                logTest('Historical Analytics Endpoints', 'FAIL', 
                    'Missing required fields in historical analytics response');
            }
        } else {
            logTest('Historical Analytics Endpoints', 'FAIL', 
                `Invalid response: ${response.statusCode}`);
        }
        
        // Test usage patterns endpoint
        const usageUrl = new URL(TEST_CONFIG.usagePatternsUrl + '?period=hourly');
        const usageOptions = {
            hostname: usageUrl.hostname,
            port: usageUrl.port || 80,
            path: usageUrl.pathname + usageUrl.search,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const usageResponse = await makeRequest(usageOptions);
        
        if (usageResponse.statusCode === 200 && usageResponse.data) {
            if (usageResponse.data.patterns && usageResponse.data.insights) {
                logTest('Usage Patterns Analytics', 'PASS', 
                    `Response time: ${usageResponse.responseTime}ms, Patterns: ${usageResponse.data.patterns.length}`);
            } else {
                logTest('Usage Patterns Analytics', 'FAIL', 
                    'Missing patterns or insights in usage analytics response');
            }
        } else {
            logTest('Usage Patterns Analytics', 'FAIL', 
                `Invalid response: ${usageResponse.statusCode}`);
        }
        
    } catch (error) {
        logTest('Historical Analytics Endpoints', 'FAIL', error.message);
    }
};

// Test 7: WebSocket Integration Testing
const testWebSocketIntegration = async () => {
    return new Promise((resolve) => {
        try {
            const ws = new WebSocket(TEST_CONFIG.websocketUrl);
            let messageReceived = false;
            
            const timeout = setTimeout(() => {
                if (!messageReceived) {
                    logTest('WebSocket Integration', 'FAIL', 'No messages received within timeout period');
                }
                ws.close();
                resolve();
            }, 10000); // 10 second timeout
            
            ws.on('open', () => {
                logTest('WebSocket Connection', 'PASS', 'Successfully connected to WebSocket server');
                
                // Send a test webhook to trigger notifications
                setTimeout(async () => {
                    const payload = JSON.stringify({ zen: "WebSocket test trigger" });
                    const signature = generateWebhookSignature(payload, TEST_CONFIG.testSecret);
                    
                    const url = new URL(TEST_CONFIG.webhookUrl);
                    const options = {
                        hostname: url.hostname,
                        port: url.port || 80,
                        path: url.pathname,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-GitHub-Event': 'ping',
                            'X-GitHub-Delivery': crypto.randomUUID(),
                            'X-Hub-Signature-256': signature
                        }
                    };
                    
                    await makeRequest(options, payload);
                }, 1000);
            });
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    messageReceived = true;
                    logTest('WebSocket Integration', 'PASS', 
                        `Received message: ${message.type || 'unknown type'}`);
                    clearTimeout(timeout);
                    ws.close();
                    resolve();
                } catch (error) {
                    logTest('WebSocket Message Parsing', 'WARN', 
                        `Received unparseable message: ${data.toString()}`);
                }
            });
            
            ws.on('error', (error) => {
                logTest('WebSocket Integration', 'FAIL', error.message);
                clearTimeout(timeout);
                resolve();
            });
            
            ws.on('close', () => {
                if (!messageReceived) {
                    logTest('WebSocket Integration', 'WARN', 'Connection closed without receiving test message');
                }
                clearTimeout(timeout);
                resolve();
            });
            
        } catch (error) {
            logTest('WebSocket Integration', 'FAIL', error.message);
            resolve();
        }
    });
};

// Main test execution
const runIntegrationTests = async () => {
    console.log('🚀 Starting Webhook Monitoring Integration Tests');
    console.log('='.repeat(60));
    console.log(`Test Configuration:`);
    console.log(`  Webhook URL: ${TEST_CONFIG.webhookUrl}`);
    console.log(`  Health URL: ${TEST_CONFIG.healthUrl}`);
    console.log(`  WebSocket URL: ${TEST_CONFIG.websocketUrl}`);
    console.log(`  Test Concurrency: ${TEST_CONFIG.testConcurrency}`);
    console.log(`  Max Response Time: ${TEST_CONFIG.maxResponseTime}ms`);
    console.log('='.repeat(60));
    
    // Run all tests
    await testHealthCheckIntegration();
    await testWebhookAuthenticationCompatibility();
    await testWebhookPayloadHandlerCompatibility();
    await testGitHubActionsIntegrationCompatibility();
    await testPerformanceImpact();
    await testHistoricalAnalyticsEndpoints();
    await testWebSocketIntegration();
    
    // Generate final report
    console.log('\n📊 Integration Test Results');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed: ${testResults.passedTests} ✅`);
    console.log(`Failed: ${testResults.failedTests} ❌`);
    console.log(`Warnings: ${testResults.warnings.length} ⚠️`);
    
    console.log('\n📈 Performance Metrics:');
    if (testResults.performanceMetrics.baselineLatency) {
        console.log(`  Baseline Latency: ${testResults.performanceMetrics.baselineLatency.toFixed(2)}ms`);
        console.log(`  Monitoring Latency: ${testResults.performanceMetrics.monitoringLatency.toFixed(2)}ms`);
        console.log(`  Overhead: ${testResults.performanceMetrics.overhead.toFixed(2)}%`);
        console.log(`  Baseline Throughput: ${testResults.performanceMetrics.throughput.baseline.toFixed(2)} req/s`);
        console.log(`  Monitoring Throughput: ${testResults.performanceMetrics.throughput.withMonitoring.toFixed(2)} req/s`);
    }
    
    console.log('\n🔗 Story Compatibility Results:');
    Object.entries(testResults.compatibilityResults).forEach(([story, result]) => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${story.toUpperCase()}: ${status}`);
        result.details.forEach(detail => {
            console.log(`    - ${detail}`);
        });
    });
    
    if (testResults.errors.length > 0) {
        console.log('\n❌ Errors:');
        testResults.errors.forEach(error => {
            console.log(`  ${error.test}: ${error.details}`);
        });
    }
    
    if (testResults.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        testResults.warnings.forEach(warning => {
            console.log(`  ${warning.test}: ${warning.details}`);
        });
    }
    
    const overallSuccess = testResults.failedTests === 0;
    console.log(`\n🎯 Overall Result: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILURE'}`);
    
    if (overallSuccess) {
        console.log('✨ All integration tests passed! Monitoring system is compatible with existing infrastructure.');
    } else {
        console.log('🔧 Some tests failed. Please review the errors and fix the issues before deploying.');
    }
    
    console.log('='.repeat(60));
    
    // Exit with appropriate code
    process.exit(overallSuccess ? 0 : 1);
};

// Run tests if this script is executed directly
if (require.main === module) {
    runIntegrationTests().catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = {
    runIntegrationTests,
    testResults,
    TEST_CONFIG
};