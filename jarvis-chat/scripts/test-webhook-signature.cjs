#!/usr/bin/env node

/**
 * Standalone Webhook Signature Verification Test
 * Tests the HMAC-SHA256 signature verification logic
 */

const crypto = require('crypto');

const WEBHOOK_SECRET = 'bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h';

function verifyGitHubSignature(payload, signature) {
    if (!signature) {
        return false;
    }
    
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
    
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        return false;
    }
}

function runTests() {
    console.log('🧪 Running Webhook Signature Verification Tests...\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Test 1: Valid signature verification
    totalTests++;
    console.log('Test 1: Valid signature verification');
    const payload1 = JSON.stringify({
        zen: "Design for failure.",
        hook_id: 12345678,
        repository: { name: "J.A.R.V.I.S-PROJECT" }
    });
    
    const validSignature = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload1)
        .digest('hex');
    
    if (verifyGitHubSignature(payload1, validSignature)) {
        console.log('✅ PASSED: Valid signature verified correctly');
        passedTests++;
    } else {
        console.log('❌ FAILED: Valid signature was rejected');
    }
    
    // Test 2: Invalid signature rejection
    totalTests++;
    console.log('\nTest 2: Invalid signature rejection');
    const invalidSignature = 'sha256=invalid_signature_hash';
    
    if (!verifyGitHubSignature(payload1, invalidSignature)) {
        console.log('✅ PASSED: Invalid signature rejected correctly');
        passedTests++;
    } else {
        console.log('❌ FAILED: Invalid signature was accepted');
    }
    
    // Test 3: Missing signature handling
    totalTests++;
    console.log('\nTest 3: Missing signature handling');
    
    if (!verifyGitHubSignature(payload1, null) && 
        !verifyGitHubSignature(payload1, undefined) && 
        !verifyGitHubSignature(payload1, '')) {
        console.log('✅ PASSED: Missing signatures rejected correctly');
        passedTests++;
    } else {
        console.log('❌ FAILED: Missing signature was accepted');
    }
    
    // Test 4: Ping event payload
    totalTests++;
    console.log('\nTest 4: Ping event payload verification');
    const pingPayload = JSON.stringify({
        zen: "Test payload for ping event",
        hook_id: 87654321,
        repository: {
            name: "J.A.R.V.I.S-PROJECT",
            full_name: "MADPANDA3D/J.A.R.V.I.S-PROJECT"
        }
    });
    
    const pingSignature = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(pingPayload)
        .digest('hex');
    
    if (verifyGitHubSignature(pingPayload, pingSignature)) {
        console.log('✅ PASSED: Ping event signature verified correctly');
        passedTests++;
    } else {
        console.log('❌ FAILED: Ping event signature was rejected');
    }
    
    // Test 5: Workflow run event payload
    totalTests++;
    console.log('\nTest 5: Workflow run event payload verification');
    const workflowPayload = JSON.stringify({
        action: "completed",
        workflow_run: {
            conclusion: "success",
            head_sha: "abcd1234567890abcdef1234567890abcdef1234",
            name: "Deploy to VPS"
        },
        repository: {
            name: "J.A.R.V.I.S-PROJECT"
        }
    });
    
    const workflowSignature = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(workflowPayload)
        .digest('hex');
    
    if (verifyGitHubSignature(workflowPayload, workflowSignature)) {
        console.log('✅ PASSED: Workflow run signature verified correctly');
        passedTests++;
    } else {
        console.log('❌ FAILED: Workflow run signature was rejected');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Webhook signature verification is working correctly.');
        return true;
    } else {
        console.log('❌ Some tests failed. Please check the implementation.');
        return false;
    }
}

// Demonstration of signature calculation
function demonstrateSignatureCalculation() {
    console.log('\n🔐 Signature Calculation Demonstration:');
    console.log('=====================================');
    
    const examplePayload = '{"zen":"Design for failure.","hook_id":12345678}';
    const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(examplePayload)
        .digest('hex');
    
    console.log(`Webhook Secret: ${WEBHOOK_SECRET}`);
    console.log(`Example Payload: ${examplePayload}`);
    console.log(`Calculated Signature: sha256=${signature}`);
    
    console.log('\n📝 curl command for testing:');
    console.log(`curl -X POST http://localhost:9000/webhook/deploy \\`);
    console.log(`    -H "Content-Type: application/json" \\`);
    console.log(`    -H "X-GitHub-Event: ping" \\`);
    console.log(`    -H "X-Hub-Signature-256: sha256=${signature}" \\`);
    console.log(`    -d '${examplePayload}'`);
}

// Run tests
const testsPassed = runTests();
demonstrateSignatureCalculation();

process.exit(testsPassed ? 0 : 1);