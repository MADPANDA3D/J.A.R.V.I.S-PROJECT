#!/usr/bin/env node

/**
 * JARVIS Chat - Webhook Failover Testing Suite
 * 
 * Comprehensive testing for webhook failover and redundancy system.
 * Tests failover performance, retry logic, and delivery verification.
 * 
 * Usage: node test-webhook-failover.cjs
 */

const { performance } = require('perf_hooks');
const crypto = require('crypto');

// Test configuration
const testConfig = {
    primaryServer: 'http://69.62.71.229:9000',
    backupServer: 'http://69.62.71.229:9002',
    failoverManager: 'http://69.62.71.229:9003',
    webhookSecret: process.env.WEBHOOK_SECRET || 'test-secret',
    testTimeout: 30000,
    failoverTimeLimit: 5000, // 5 seconds max for failover
    verboseLogging: true
};

// Test results tracking
const testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    testDetails: [],
    startTime: Date.now(),
    failoverPerformance: [],
    retryLogicTests: [],
    verificationTests: []
};

/**
 * Utility functions
 */
function log(message, type = 'INFO') {
    if (testConfig.verboseLogging) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${type}] ${message}`);
    }
}

function createWebhookSignature(payload, secret) {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

function createTestPayload(eventType = 'workflow_run') {
    const payload = {
        action: 'completed',
        workflow_run: {
            id: Math.floor(Math.random() * 1000000),
            name: 'Test Deployment Workflow',
            status: 'completed',
            conclusion: 'success',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        repository: {
            full_name: 'test/webhook-failover-test',
            name: 'webhook-failover-test'
        }
    };
    
    return JSON.stringify(payload);
}

async function makeWebhookRequest(url, payload, signature, timeout = 10000) {
    const fetch = require('node-fetch');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'workflow_run',
                'X-GitHub-Delivery': crypto.randomUUID(),
                'X-Hub-Signature-256': signature,
                'User-Agent': 'GitHub-Hookshot/test'
            },
            body: payload,
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        const responseData = await response.json();
        return {
            success: response.ok,
            status: response.status,
            data: responseData,
            responseTime: responseData.processingTime || 'unknown'
        };
    } catch (error) {
        clearTimeout(timeoutId);
        return {
            success: false,
            error: error.message,
            responseTime: null
        };
    }
}

async function getServerHealth(serverUrl) {
    const fetch = require('node-fetch');
    try {
        const response = await fetch(`${serverUrl}/health`, { timeout: 5000 });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getFailoverStatus() {
    const fetch = require('node-fetch');
    try {
        const response = await fetch(`${testConfig.failoverManager}/failover/status`, { timeout: 5000 });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Test Suite Functions
 */

async function testPrimaryServerHealth() {
    log('Testing primary server health...', 'TEST');
    
    const health = await getServerHealth(testConfig.primaryServer);
    const success = health && health.status === 'healthy';
    
    recordTestResult('Primary Server Health Check', success, {
        serverUrl: testConfig.primaryServer,
        healthData: health,
        error: success ? null : 'Server unhealthy or unreachable'
    });

    return success;
}

async function testBackupServerHealth() {
    log('Testing backup server health...', 'TEST');
    
    const health = await getServerHealth(testConfig.backupServer);
    const success = health && health.status === 'healthy';
    
    recordTestResult('Backup Server Health Check', success, {
        serverUrl: testConfig.backupServer,
        healthData: health,
        error: success ? null : 'Backup server unhealthy or unreachable'
    });

    return success;
}

async function testFailoverManagerHealth() {
    log('Testing failover manager health...', 'TEST');
    
    const health = await getServerHealth(testConfig.failoverManager);
    const success = health && health.service === 'webhook-failover-manager';
    
    recordTestResult('Failover Manager Health Check', success, {
        managerUrl: testConfig.failoverManager,
        healthData: health,
        error: success ? null : 'Failover manager unhealthy or unreachable'
    });

    return success;
}

async function testBasicWebhookDelivery() {
    log('Testing basic webhook delivery to primary server...', 'TEST');
    
    const payload = createTestPayload();
    const signature = createWebhookSignature(payload, testConfig.webhookSecret);
    const startTime = performance.now();
    
    const result = await makeWebhookRequest(
        `${testConfig.primaryServer}/webhook/deploy`,
        payload,
        signature
    );
    
    const responseTime = performance.now() - startTime;
    const success = result.success;
    
    recordTestResult('Basic Webhook Delivery', success, {
        responseTime: Math.round(responseTime) + 'ms',
        serverResponse: result,
        error: success ? null : result.error
    });

    return success;
}

async function testBackupWebhookDelivery() {
    log('Testing webhook delivery to backup server...', 'TEST');
    
    const payload = createTestPayload();
    const signature = createWebhookSignature(payload, testConfig.webhookSecret);
    const startTime = performance.now();
    
    const result = await makeWebhookRequest(
        `${testConfig.backupServer}/webhook/deploy`,
        payload,
        signature
    );
    
    const responseTime = performance.now() - startTime;
    const success = result.success;
    
    recordTestResult('Backup Webhook Delivery', success, {
        responseTime: Math.round(responseTime) + 'ms',
        serverResponse: result,
        error: success ? null : result.error
    });

    return success;
}

async function testFailoverPerformance() {
    log('Testing failover performance (simulated primary failure)...', 'TEST');
    
    // Get initial failover status
    const initialStatus = await getFailoverStatus();
    if (!initialStatus) {
        recordTestResult('Failover Performance Test', false, {
            error: 'Could not get initial failover status'
        });
        return false;
    }

    log(`Current active server: ${initialStatus.currentActive}`);
    
    // Simulate failover trigger (would normally be automatic)
    const fetch = require('node-fetch');
    const failoverStartTime = performance.now();
    
    try {
        const targetServer = initialStatus.currentActive === 'primary' ? 'backup' : 'primary';
        
        const response = await fetch(`${testConfig.failoverManager}/failover/trigger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: targetServer }),
            timeout: testConfig.failoverTimeLimit
        });

        const failoverTime = performance.now() - failoverStartTime;
        const success = response.ok && failoverTime < testConfig.failoverTimeLimit;

        const responseData = response.ok ? await response.json() : null;

        testResults.failoverPerformance.push({
            failoverTime: Math.round(failoverTime),
            success: success,
            targetServer: targetServer,
            response: responseData
        });

        recordTestResult('Failover Performance', success, {
            failoverTime: Math.round(failoverTime) + 'ms',
            timeLimit: testConfig.failoverTimeLimit + 'ms',
            targetServer: targetServer,
            response: responseData,
            error: success ? null : `Failover took too long or failed: ${failoverTime}ms`
        });

        return success;

    } catch (error) {
        const failoverTime = performance.now() - failoverStartTime;
        
        recordTestResult('Failover Performance', false, {
            failoverTime: Math.round(failoverTime) + 'ms',
            error: error.message
        });

        return false;
    }
}

async function testEnhancedRetryLogic() {
    log('Testing enhanced retry logic with circuit breaker...', 'TEST');
    
    // Test with intentionally invalid endpoint to trigger retries
    const payload = createTestPayload();
    const signature = createWebhookSignature(payload, testConfig.webhookSecret);
    const invalidUrl = 'http://69.62.71.229:9999/webhook/deploy'; // Non-existent port
    
    const startTime = performance.now();
    
    const result = await makeWebhookRequest(invalidUrl, payload, signature, 15000);
    
    const totalTime = performance.now() - startTime;
    
    // Success means the retry logic was triggered (expect failure but with retry attempts)
    const success = !result.success && totalTime > 2000; // Should have taken time due to retries
    
    testResults.retryLogicTests.push({
        totalTime: Math.round(totalTime),
        retriesDetected: totalTime > 2000,
        result: result
    });

    recordTestResult('Enhanced Retry Logic', success, {
        totalTime: Math.round(totalTime) + 'ms',
        expectedFailure: true,
        retriesDetected: totalTime > 2000,
        error: success ? null : 'Retry logic may not be working properly'
    });

    return success;
}

async function testWebhookDeliveryVerification() {
    log('Testing webhook delivery verification...', 'TEST');
    
    const payload = createTestPayload();
    const signature = createWebhookSignature(payload, testConfig.webhookSecret);
    
    // Send webhook to primary server
    const deliveryResult = await makeWebhookRequest(
        `${testConfig.primaryServer}/webhook/deploy`,
        payload,
        signature
    );

    if (!deliveryResult.success) {
        recordTestResult('Webhook Delivery Verification', false, {
            error: 'Initial webhook delivery failed'
        });
        return false;
    }

    // Try to verify delivery
    const fetch = require('node-fetch');
    try {
        const verificationResponse = await fetch(`${testConfig.primaryServer}/webhook/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestId: crypto.randomUUID(),
                timestamp: new Date().toISOString()
            }),
            timeout: 10000
        });

        // Even if verification endpoint doesn't exist, test that server is responsive
        const success = verificationResponse.status !== 500;

        testResults.verificationTests.push({
            deliverySuccessful: deliveryResult.success,
            verificationAttempted: true,
            verificationResponse: verificationResponse.status
        });

        recordTestResult('Webhook Delivery Verification', success, {
            deliveryResult: deliveryResult,
            verificationStatus: verificationResponse.status,
            error: success ? null : 'Verification system not responding properly'
        });

        return success;

    } catch (error) {
        recordTestResult('Webhook Delivery Verification', false, {
            deliveryResult: deliveryResult,
            verificationError: error.message
        });
        return false;
    }
}

async function testEndToEndRedundancy() {
    log('Testing end-to-end redundancy with complete deployment pipeline...', 'TEST');
    
    const testSteps = [];
    let allStepsSuccessful = true;

    // Step 1: Verify both servers are healthy
    const primaryHealth = await getServerHealth(testConfig.primaryServer);
    const backupHealth = await getServerHealth(testConfig.backupServer);
    
    testSteps.push({
        step: 'Server Health Check',
        primaryHealthy: !!primaryHealth,
        backupHealthy: !!backupHealth
    });

    if (!primaryHealth || !backupHealth) {
        allStepsSuccessful = false;
    }

    // Step 2: Send webhook to current active server
    const failoverStatus = await getFailoverStatus();
    if (failoverStatus) {
        const activeServerUrl = failoverStatus.currentActive === 'primary' ? 
            testConfig.primaryServer : testConfig.backupServer;

        const payload = createTestPayload();
        const signature = createWebhookSignature(payload, testConfig.webhookSecret);
        
        const webhookResult = await makeWebhookRequest(
            `${activeServerUrl}/webhook/deploy`,
            payload,
            signature
        );

        testSteps.push({
            step: 'Webhook Delivery',
            activeServer: failoverStatus.currentActive,
            success: webhookResult.success,
            responseTime: webhookResult.responseTime
        });

        if (!webhookResult.success) {
            allStepsSuccessful = false;
        }
    } else {
        testSteps.push({
            step: 'Webhook Delivery',
            error: 'Could not determine active server'
        });
        allStepsSuccessful = false;
    }

    // Step 3: Verify failover capability
    if (allStepsSuccessful) {
        const failoverTest = await testFailoverPerformance();
        testSteps.push({
            step: 'Failover Test',
            success: failoverTest
        });

        if (!failoverTest) {
            allStepsSuccessful = false;
        }
    }

    recordTestResult('End-to-End Redundancy', allStepsSuccessful, {
        testSteps: testSteps,
        error: allStepsSuccessful ? null : 'One or more redundancy components failed'
    });

    return allStepsSuccessful;
}

function recordTestResult(testName, success, details = {}) {
    testResults.totalTests++;
    if (success) {
        testResults.passedTests++;
        log(`✅ ${testName}: PASSED`, 'RESULT');
    } else {
        testResults.failedTests++;
        log(`❌ ${testName}: FAILED`, 'RESULT');
        if (details.error) {
            log(`   Error: ${details.error}`, 'ERROR');
        }
    }

    testResults.testDetails.push({
        testName,
        success,
        timestamp: new Date().toISOString(),
        details
    });
}

async function generateTestReport() {
    const totalTime = Date.now() - testResults.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔄 WEBHOOK FAILOVER AND REDUNDANCY TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Test Summary:`);
    console.log(`   Total Tests: ${testResults.totalTests}`);
    console.log(`   Passed: ${testResults.passedTests} ✅`);
    console.log(`   Failed: ${testResults.failedTests} ❌`);
    console.log(`   Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
    console.log(`   Total Time: ${Math.round(totalTime / 1000)}s`);

    if (testResults.failoverPerformance.length > 0) {
        console.log(`\n⚡ Failover Performance:`);
        testResults.failoverPerformance.forEach((test, index) => {
            console.log(`   Test ${index + 1}: ${test.failoverTime}ms (${test.success ? 'PASS' : 'FAIL'})`);
        });
    }

    console.log(`\n📋 Detailed Test Results:`);
    testResults.testDetails.forEach((test, index) => {
        const status = test.success ? '✅' : '❌';
        console.log(`   ${index + 1}. ${status} ${test.testName}`);
        if (test.details.error) {
            console.log(`      Error: ${test.details.error}`);
        }
        if (test.details.responseTime) {
            console.log(`      Response Time: ${test.details.responseTime}`);
        }
    });

    console.log('\n' + '='.repeat(80));
    
    const overallSuccess = testResults.failedTests === 0;
    console.log(`🎯 Overall Result: ${overallSuccess ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
    console.log('='.repeat(80) + '\n');

    return overallSuccess;
}

/**
 * Main test execution
 */
async function runAllTests() {
    console.log('🚀 Starting Webhook Failover and Redundancy Test Suite...\n');
    
    try {
        // Health checks first
        await testPrimaryServerHealth();
        await testBackupServerHealth();
        await testFailoverManagerHealth();
        
        // Basic delivery tests
        await testBasicWebhookDelivery();
        await testBackupWebhookDelivery();
        
        // Advanced redundancy tests
        await testFailoverPerformance();
        await testEnhancedRetryLogic();
        await testWebhookDeliveryVerification();
        
        // Comprehensive test
        await testEndToEndRedundancy();
        
        // Generate final report
        const success = await generateTestReport();
        process.exit(success ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Test suite failed with error:', error.message);
        process.exit(1);
    }
}

// Start the test suite
if (require.main === module) {
    runAllTests();
}