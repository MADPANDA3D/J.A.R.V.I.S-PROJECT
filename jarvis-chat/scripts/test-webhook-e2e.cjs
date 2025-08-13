#!/usr/bin/env node

/**
 * End-to-End Webhook Testing Script
 * Tests complete webhook payload processing workflow
 */

const crypto = require('crypto');

const WEBHOOK_SECRET = 'bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h';
const WEBHOOK_URL = 'http://localhost:9000/webhook/deploy';
const HEALTH_URL = 'http://localhost:9000/health';

// Test payloads for different GitHub events
const TEST_PAYLOADS = {
    ping: {
        zen: "Design for failure.",
        hook_id: 12345678,
        repository: {
            name: "J.A.R.V.I.S-PROJECT",
            full_name: "MADPANDA3D/J.A.R.V.I.S-PROJECT"
        }
    },
    workflow_run_success: {
        action: "completed",
        workflow_run: {
            conclusion: "success",
            head_sha: "abcd1234567890abcdef1234567890abcdef1234",
            name: "Deploy to VPS",
            status: "completed"
        },
        repository: {
            name: "J.A.R.V.I.S-PROJECT",
            full_name: "MADPANDA3D/J.A.R.V.I.S-PROJECT"
        }
    },
    workflow_run_failure: {
        action: "completed",
        workflow_run: {
            conclusion: "failure",
            head_sha: "efgh5678901234567890abcdef1234567890abcd",
            name: "Deploy to VPS",
            status: "completed"
        },
        repository: {
            name: "J.A.R.V.I.S-PROJECT"
        }
    }
};

function generateSignature(payload) {
    return 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
}

async function testWebhookEndpoint(eventType, payload, description) {
    console.log(`\n🧪 Testing: ${description}`);
    console.log('='.repeat(50));
    
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString);
    
    console.log(`Event Type: ${eventType}`);
    console.log(`Payload: ${payloadString.substring(0, 100)}${payloadString.length > 100 ? '...' : ''}`);
    console.log(`Signature: ${signature}`);
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': eventType,
                'X-Hub-Signature-256': signature,
                'User-Agent': 'GitHub-Hookshot/test'
            },
            body: payloadString
        });
        
        const responseText = await response.text();
        
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
        console.log(`Response Body: ${responseText}`);
        
        if (response.ok) {
            console.log('✅ Test PASSED');
            return true;
        } else {
            console.log('❌ Test FAILED - Non-200 status');
            return false;
        }
    } catch (error) {
        console.log(`❌ Test FAILED - Network error: ${error.message}`);
        return false;
    }
}

async function testHealthEndpoint() {
    console.log('\n🏥 Testing Health Endpoint');
    console.log('='.repeat(30));
    
    try {
        const response = await fetch(HEALTH_URL);
        const data = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${JSON.stringify(data, null, 2)}`);
        
        if (response.ok && data.status === 'healthy') {
            console.log('✅ Health check PASSED');
            return true;
        } else {
            console.log('❌ Health check FAILED');
            return false;
        }
    } catch (error) {
        console.log(`❌ Health check FAILED - ${error.message}`);
        return false;
    }
}

async function testInvalidSignature() {
    console.log('\n🔒 Testing Invalid Signature Rejection');
    console.log('='.repeat(40));
    
    const payload = JSON.stringify(TEST_PAYLOADS.ping);
    const invalidSignature = 'sha256=invalid_signature_hash';
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'ping',
                'X-Hub-Signature-256': invalidSignature
            },
            body: payload
        });
        
        console.log(`Response Status: ${response.status}`);
        
        if (response.status === 401) {
            console.log('✅ Invalid signature correctly rejected');
            return true;
        } else {
            console.log('❌ Invalid signature was not rejected');
            return false;
        }
    } catch (error) {
        console.log(`❌ Test FAILED - ${error.message}`);
        return false;
    }
}

async function testMissingSignature() {
    console.log('\n🚫 Testing Missing Signature Rejection');
    console.log('='.repeat(40));
    
    const payload = JSON.stringify(TEST_PAYLOADS.ping);
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'ping'
            },
            body: payload
        });
        
        console.log(`Response Status: ${response.status}`);
        
        if (response.status === 401) {
            console.log('✅ Missing signature correctly rejected');
            return true;
        } else {
            console.log('❌ Missing signature was not rejected');
            return false;
        }
    } catch (error) {
        console.log(`❌ Test FAILED - ${error.message}`);
        return false;
    }
}

async function generateCurlCommands() {
    console.log('\n📝 cURL Commands for Manual Testing:');
    console.log('='.repeat(50));
    
    // Ping event
    const pingPayload = JSON.stringify(TEST_PAYLOADS.ping);
    const pingSignature = generateSignature(pingPayload);
    
    console.log('\n1. Test Ping Event:');
    console.log('curl -X POST http://localhost:9000/webhook/deploy \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -H "X-GitHub-Event: ping" \\');
    console.log(`    -H "X-Hub-Signature-256: ${pingSignature}" \\`);
    console.log(`    -d '${pingPayload}'`);
    
    // Workflow run success
    const workflowPayload = JSON.stringify(TEST_PAYLOADS.workflow_run_success);
    const workflowSignature = generateSignature(workflowPayload);
    
    console.log('\n2. Test Workflow Run Success:');
    console.log('curl -X POST http://localhost:9000/webhook/deploy \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -H "X-GitHub-Event: workflow_run" \\');
    console.log(`    -H "X-Hub-Signature-256: ${workflowSignature}" \\`);
    console.log(`    -d '${workflowPayload}'`);
    
    // Health check
    console.log('\n3. Test Health Endpoint:');
    console.log('curl -f http://localhost:9000/health');
    
    // Invalid signature test
    console.log('\n4. Test Invalid Signature (Should return 401):');
    console.log('curl -X POST http://localhost:9000/webhook/deploy \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -H "X-GitHub-Event: ping" \\');
    console.log('    -H "X-Hub-Signature-256: sha256=invalid_signature" \\');
    console.log(`    -d '${pingPayload}'`);
}

async function runE2ETests() {
    console.log('🚀 Starting End-to-End Webhook Testing');
    console.log('=====================================');
    
    const results = [];
    
    // Test health endpoint first
    results.push(await testHealthEndpoint());
    
    // Test ping event
    results.push(await testWebhookEndpoint('ping', TEST_PAYLOADS.ping, 'GitHub Ping Event'));
    
    // Test workflow run success
    results.push(await testWebhookEndpoint('workflow_run', TEST_PAYLOADS.workflow_run_success, 'Workflow Run Success Event'));
    
    // Test workflow run failure
    results.push(await testWebhookEndpoint('workflow_run', TEST_PAYLOADS.workflow_run_failure, 'Workflow Run Failure Event'));
    
    // Test security - invalid signature
    results.push(await testInvalidSignature());
    
    // Test security - missing signature
    results.push(await testMissingSignature());
    
    // Generate manual test commands
    await generateCurlCommands();
    
    // Summary
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 End-to-End Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All end-to-end tests passed! Webhook processing is working correctly.');
        
        console.log('\n✅ Verified Functionality:');
        console.log('  - Health endpoint responding');
        console.log('  - Ping event processing');
        console.log('  - Workflow run event processing');
        console.log('  - Invalid signature rejection');
        console.log('  - Missing signature rejection');
        console.log('  - Proper HTTP status codes');
        console.log('  - JSON response formatting');
        
        return true;
    } else {
        console.log(`❌ ${totalTests - passedTests} tests failed. Please check webhook server configuration.`);
        
        console.log('\n🔧 Troubleshooting Steps:');
        console.log('  1. Ensure webhook server is running on port 9000');
        console.log('  2. Check webhook secret is configured correctly');
        console.log('  3. Verify environment variables are loaded');
        console.log('  4. Check server logs: journalctl -u jarvis-webhook -f');
        console.log('  5. Test connectivity: curl http://localhost:9000/health');
        
        return false;
    }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ for fetch API support');
    console.log('Current Node.js version:', process.version);
    process.exit(1);
}

// Run tests
runE2ETests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });