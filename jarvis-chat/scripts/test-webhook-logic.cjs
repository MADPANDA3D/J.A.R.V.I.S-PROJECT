#!/usr/bin/env node

/**
 * Webhook Logic Unit Tests
 * Tests event classification, validation, and response generation logic
 */

const crypto = require('crypto');

// Constants from webhook server
const SUPPORTED_EVENTS = {
    PING: 'ping',
    WORKFLOW_RUN: 'workflow_run',
    PUSH: 'push',
    PULL_REQUEST: 'pull_request'
};

const RESPONSE_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

// Webhook logic functions (extracted from server)
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

const createWebhookResponse = (type, message, data = {}) => {
    return {
        message,
        status: type === RESPONSE_TYPES.ERROR ? 'error' : 'healthy',
        type,
        timestamp: new Date().toISOString(),
        ...data
    };
};

const verifyGitHubSignature = (payload, signature, secret) => {
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', secret)
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
};

// Test data
const WEBHOOK_SECRET = 'bxWGYH5dx8/IS8AJOKokMWaXmdAWsQ87IfZSt38zNo0yX0g1BiHTezqxR6rstM4h';

// Test functions
function testEventValidation() {
    console.log('🧪 Testing Event Validation');
    console.log('============================');
    
    const tests = [
        { event: 'ping', expected: true, description: 'Ping event validation' },
        { event: 'workflow_run', expected: true, description: 'Workflow run event validation' },
        { event: 'push', expected: true, description: 'Push event validation' },
        { event: 'pull_request', expected: true, description: 'Pull request event validation' },
        { event: 'issues', expected: false, description: 'Unsupported issues event' },
        { event: null, expected: false, description: 'Null event type' },
        { event: undefined, expected: false, description: 'Undefined event type' },
        { event: '', expected: false, description: 'Empty event type' },
        { event: 'PING', expected: true, description: 'Case insensitive validation' }
    ];
    
    let passed = 0;
    const total = tests.length;
    
    tests.forEach((test, index) => {
        const result = isValidEventType(test.event);
        const success = result === test.expected;
        
        console.log(`${index + 1}. ${test.description}`);
        console.log(`   Input: "${test.event}" | Expected: ${test.expected} | Got: ${result} | ${success ? '✅' : '❌'}`);
        
        if (success) passed++;
    });
    
    console.log(`\nResult: ${passed}/${total} tests passed\n`);
    return { passed, total };
}

function testEventClassification() {
    console.log('🏷️ Testing Event Classification');
    console.log('================================');
    
    const tests = [
        { 
            event: 'ping', 
            expected: { type: 'ping', category: 'test' },
            description: 'Ping event classification'
        },
        { 
            event: 'workflow_run', 
            expected: { type: 'workflow_run', category: 'deployment' },
            description: 'Workflow run classification'
        },
        { 
            event: 'push', 
            expected: { type: 'push', category: 'repository' },
            description: 'Push event classification'
        },
        { 
            event: 'issues', 
            expected: { type: 'issues', category: 'unsupported' },
            description: 'Unsupported event classification'
        },
        { 
            event: null, 
            expected: { type: 'unknown', category: 'unsupported' },
            description: 'Null event classification'
        },
        { 
            event: 'WORKFLOW_RUN', 
            expected: { type: 'workflow_run', category: 'deployment' },
            description: 'Case insensitive classification'
        }
    ];
    
    let passed = 0;
    const total = tests.length;
    
    tests.forEach((test, index) => {
        const result = classifyEvent(test.event);
        const success = result.type === test.expected.type && result.category === test.expected.category;
        
        console.log(`${index + 1}. ${test.description}`);
        console.log(`   Input: "${test.event}"`);
        console.log(`   Expected: ${JSON.stringify(test.expected)}`);
        console.log(`   Got: ${JSON.stringify(result)}`);
        console.log(`   ${success ? '✅' : '❌'}`);
        
        if (success) passed++;
    });
    
    console.log(`\nResult: ${passed}/${total} tests passed\n`);
    return { passed, total };
}

function testResponseGeneration() {
    console.log('📋 Testing Response Generation');
    console.log('===============================');
    
    const tests = [
        {
            type: RESPONSE_TYPES.SUCCESS,
            message: 'Test success message',
            data: { test: 'data' },
            description: 'Success response generation'
        },
        {
            type: RESPONSE_TYPES.ERROR,
            message: 'Test error message',
            data: {},
            description: 'Error response generation'
        },
        {
            type: RESPONSE_TYPES.INFO,
            message: 'Test info message',
            data: { info: 'additional' },
            description: 'Info response generation'
        },
        {
            type: RESPONSE_TYPES.WARNING,
            message: 'Test warning message',
            data: {},
            description: 'Warning response generation'
        }
    ];
    
    let passed = 0;
    const total = tests.length;
    
    tests.forEach((test, index) => {
        const result = createWebhookResponse(test.type, test.message, test.data);
        
        // Validate required fields
        const hasMessage = result.message === test.message;
        const hasStatus = result.status !== undefined;
        const hasType = result.type === test.type;
        const hasTimestamp = result.timestamp !== undefined;
        const hasCorrectStatus = test.type === RESPONSE_TYPES.ERROR ? 
            result.status === 'error' : result.status === 'healthy';
        
        // Check if additional data is merged
        const hasAdditionalData = Object.keys(test.data).every(key => 
            result[key] === test.data[key]
        );
        
        const success = hasMessage && hasStatus && hasType && hasTimestamp && 
                       hasCorrectStatus && hasAdditionalData;
        
        console.log(`${index + 1}. ${test.description}`);
        console.log(`   Message: ${hasMessage ? '✅' : '❌'} "${result.message}"`);
        console.log(`   Status: ${hasCorrectStatus ? '✅' : '❌'} "${result.status}"`);
        console.log(`   Type: ${hasType ? '✅' : '❌'} "${result.type}"`);
        console.log(`   Timestamp: ${hasTimestamp ? '✅' : '❌'} ${result.timestamp ? 'present' : 'missing'}`);
        console.log(`   Additional Data: ${hasAdditionalData ? '✅' : '❌'}`);
        console.log(`   Overall: ${success ? '✅' : '❌'}\n`);
        
        if (success) passed++;
    });
    
    console.log(`Result: ${passed}/${total} tests passed\n`);
    return { passed, total };
}

function testSignatureVerification() {
    console.log('🔐 Testing Signature Verification');
    console.log('==================================');
    
    const tests = [
        {
            payload: '{"test":"payload"}',
            description: 'Valid signature verification'
        },
        {
            payload: '{"zen":"Design for failure.","hook_id":12345678}',
            description: 'Ping payload signature verification'
        },
        {
            payload: '{"action":"completed","workflow_run":{"conclusion":"success"}}',
            description: 'Workflow payload signature verification'
        },
        {
            payload: '',
            description: 'Empty payload signature verification'
        }
    ];
    
    let passed = 0;
    let total = 0;
    
    tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.description}`);
        
        // Generate valid signature
        const validSignature = 'sha256=' + crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(test.payload)
            .digest('hex');
        
        // Test 1: Valid signature
        total++;
        const validResult = verifyGitHubSignature(test.payload, validSignature, WEBHOOK_SECRET);
        console.log(`   Valid signature: ${validResult ? '✅' : '❌'}`);
        if (validResult) passed++;
        
        // Test 2: Invalid signature
        total++;
        const invalidSignature = 'sha256=invalid_signature_hash';
        const invalidResult = verifyGitHubSignature(test.payload, invalidSignature, WEBHOOK_SECRET);
        console.log(`   Invalid signature rejected: ${!invalidResult ? '✅' : '❌'}`);
        if (!invalidResult) passed++;
        
        // Test 3: Missing signature
        total++;
        const missingResult = verifyGitHubSignature(test.payload, null, WEBHOOK_SECRET);
        console.log(`   Missing signature rejected: ${!missingResult ? '✅' : '❌'}`);
        if (!missingResult) passed++;
        
        console.log('');
    });
    
    console.log(`Result: ${passed}/${total} tests passed\n`);
    return { passed, total };
}

function testPayloadValidation() {
    console.log('📄 Testing Payload Validation Logic');
    console.log('====================================');
    
    const tests = [
        {
            payload: { test: 'data' },
            description: 'Valid object payload',
            expected: true
        },
        {
            payload: null,
            description: 'Null payload',
            expected: false
        },
        {
            payload: undefined,
            description: 'Undefined payload',
            expected: false
        },
        {
            payload: 'string payload',
            description: 'String payload',
            expected: false
        },
        {
            payload: 123,
            description: 'Number payload',
            expected: false
        },
        {
            payload: [],
            description: 'Array payload',
            expected: true // Arrays are objects in JavaScript
        },
        {
            payload: {},
            description: 'Empty object payload',
            expected: true
        }
    ];
    
    let passed = 0;
    const total = tests.length;
    
    tests.forEach((test, index) => {
        // Simulate the validation logic from the server
        const isValid = test.payload !== null && test.payload !== undefined && typeof test.payload === 'object';
        const success = isValid === test.expected;
        
        console.log(`${index + 1}. ${test.description}`);
        console.log(`   Input: ${JSON.stringify(test.payload)}`);
        console.log(`   Expected: ${test.expected} | Got: ${isValid} | ${success ? '✅' : '❌'}`);
        
        if (success) passed++;
    });
    
    console.log(`\nResult: ${passed}/${total} tests passed\n`);
    return { passed, total };
}

function runAllTests() {
    console.log('🚀 Starting Webhook Logic Unit Tests');
    console.log('=====================================\n');
    
    const results = [];
    
    // Run all test suites
    results.push(testEventValidation());
    results.push(testEventClassification());
    results.push(testResponseGeneration());
    results.push(testSignatureVerification());
    results.push(testPayloadValidation());
    
    // Calculate totals
    const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
    const totalTests = results.reduce((sum, result) => sum + result.total, 0);
    
    // Summary
    console.log('='.repeat(50));
    console.log('📊 Overall Test Results');
    console.log('='.repeat(50));
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    
    if (totalPassed === totalTests) {
        console.log('\n🎉 All unit tests passed! Webhook logic is working correctly.');
        
        console.log('\n✅ Verified Logic Components:');
        console.log('  - Event type validation (case insensitive)');
        console.log('  - Event classification with categories');
        console.log('  - Standardized response generation');
        console.log('  - HMAC-SHA256 signature verification');
        console.log('  - Payload structure validation');
        console.log('  - Error handling for edge cases');
        
        return true;
    } else {
        console.log(`\n❌ ${totalTests - totalPassed} tests failed. Logic needs refinement.`);
        return false;
    }
}

// Run tests
const success = runAllTests();
process.exit(success ? 0 : 1);