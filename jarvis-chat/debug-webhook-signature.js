#!/usr/bin/env node

/**
 * Webhook Signature Debug Script
 * Tests signature generation methods to match VPS server expectations
 */

import crypto from 'crypto';

// Example payload similar to what GitHub workflow sends
const testPayload = {
  "action": "completed",
  "workflow_run": {
    "conclusion": "success",
    "head_sha": "ca0ff9ccfb73a4a03ce8641ea69caca472f554bf",
    "name": "Deploy to VPS"
  },
  "repository": {
    "name": "MADPANDA3D/J.A.R.V.I.S-PROJECT"
  },
  "pusher": {
    "name": "github-actions"
  },
  "ref": "refs/heads/main",
  "metadata": {
    "version": "ca0ff9ccfb73a4a03ce8641ea69caca472f554bf",
    "branch": "main",
    "build_id": "16976177128",
    "timestamp": "2025-08-14T20:42:33Z",
    "workflow_url": "https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT/actions/runs/16976177128"
  }
};

const testSecret = 'test_webhook_secret';

// Test different signature methods
console.log('=== WEBHOOK SIGNATURE DEBUG ===\n');

// Method 1: Current GitHub workflow method (raw string -> HMAC)
const payloadString = JSON.stringify(testPayload);
console.log('1. GitHub Workflow Method (current):');
console.log('   Payload length:', payloadString.length);
console.log('   First 100 chars:', payloadString.substring(0, 100));

const signature1 = crypto
  .createHmac('sha256', testSecret)
  .update(payloadString)
  .digest('hex');
console.log('   Signature (hex):', signature1);
console.log('   With prefix:', `sha256=${signature1}`);
console.log('');

// Method 2: Binary output then hex (like GitHub does)  
const signature2 = crypto
  .createHmac('sha256', testSecret)
  .update(payloadString)
  .digest();
const hexSignature2 = signature2.toString('hex');
console.log('2. Binary then Hex Method:');
console.log('   Signature (hex):', hexSignature2);
console.log('   With prefix:', `sha256=${hexSignature2}`);
console.log('');

// Method 3: UTF-8 encoding explicit
const signature3 = crypto
  .createHmac('sha256', testSecret)
  .update(payloadString, 'utf8')
  .digest('hex');
console.log('3. Explicit UTF-8 Encoding:');
console.log('   Signature (hex):', signature3);
console.log('   With prefix:', `sha256=${signature3}`);
console.log('');

// Method 4: GitHub's exact method (what GitHub actually uses)
function githubSignature(payload, secret) {
  return 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

const signature4 = githubSignature(payloadString, testSecret);
console.log('4. GitHub Standard Method:');
console.log('   Full signature:', signature4);
console.log('');

// Method 5: Test with different payload formatting (compact vs pretty)
const compactPayload = JSON.stringify(testPayload);
const prettyPayload = JSON.stringify(testPayload, null, 2);

console.log('5. Payload Format Comparison:');
console.log('   Compact length:', compactPayload.length);
console.log('   Pretty length:', prettyPayload.length);

const compactSig = githubSignature(compactPayload, testSecret);
const prettySig = githubSignature(prettyPayload, testSecret);

console.log('   Compact signature:', compactSig);
console.log('   Pretty signature: ', prettySig);
console.log('   Same result:', compactSig === prettySig ? 'YES' : 'NO');
console.log('');

// Method 6: Test verification function
function verifySignature(payload, signature, secret) {
  const expectedSig = githubSignature(payload, secret);
  return signature === expectedSig;
}

console.log('6. Signature Verification Test:');
const testSig = githubSignature(payloadString, testSecret);
console.log('   Generated:', testSig);
console.log('   Verified:', verifySignature(payloadString, testSig, testSecret));
console.log('');

// Method 7: Test with empty/null values
console.log('7. Edge Cases:');
try {
  const emptySig = githubSignature('', testSecret);
  console.log('   Empty payload sig:', emptySig);
} catch (e) {
  console.log('   Empty payload error:', e.message);
}

try {
  const nullSig = githubSignature('{}', '');
  console.log('   Empty secret sig:', nullSig);
} catch (e) {
  console.log('   Empty secret error:', e.message);
}

console.log('\n=== RECOMMENDATIONS ===');
console.log('1. Verify VPS webhook server expects "sha256=" prefix');
console.log('2. Check if VPS server strips/adds whitespace to payload');
console.log('3. Confirm VPS uses same secret as GitHub workflow');
console.log('4. Test with exact payload from GitHub logs');
console.log('5. Check if VPS expects different header name (X-Hub-Signature vs X-Hub-Signature-256)');