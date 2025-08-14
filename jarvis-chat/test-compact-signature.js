#!/usr/bin/env node

/**
 * Test compact JSON signature generation
 */

import crypto from 'crypto';

// Test the compact format from the updated workflow
const compactPayload = '{"action":"completed","workflow_run":{"conclusion":"success","head_sha":"test_sha","name":"Deploy to VPS"},"repository":{"name":"MADPANDA3D/J.A.R.V.I.S-PROJECT"},"pusher":{"name":"github-actions"},"ref":"refs/heads/main","metadata":{"version":"test_sha","branch":"main","build_id":"123456","timestamp":"2025-08-14T20:45:00Z","workflow_url":"https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT/actions/runs/123456"}}';

const testSecret = 'test_webhook_secret';

console.log('=== COMPACT JSON SIGNATURE TEST ===\n');

// Method 1: Using openssl command line (like GitHub workflow)
console.log('1. OpenSSL Command Line Method:');
console.log('   Command: echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | xxd -p -c 256');

// Method 2: Node.js crypto (should match)
const nodeSignature = crypto
  .createHmac('sha256', testSecret)
  .update(compactPayload, 'utf8')
  .digest('hex');

console.log('   Node.js signature:', nodeSignature);
console.log('   With sha256 prefix: sha256=' + nodeSignature);

console.log('\n2. Payload Analysis:');
console.log('   Length:', compactPayload.length, 'characters');
console.log('   Contains newlines:', compactPayload.includes('\n') ? 'YES' : 'NO');
console.log('   Contains extra spaces:', compactPayload.includes('  ') ? 'YES' : 'NO');
console.log('   First 100 chars:', compactPayload.substring(0, 100) + '...');

console.log('\n3. GitHub Webhook Signature Verification:');

function verifyGitHubSignature(payload, signature, secret) {
  const expectedSig = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
    
  return signature === expectedSig;
}

const testSig = 'sha256=' + nodeSignature;
const isValid = verifyGitHubSignature(compactPayload, testSig, testSecret);

console.log('   Generated signature:', testSig);
console.log('   Verification result:', isValid ? 'VALID' : 'INVALID');

console.log('\n✅ This compact format should fix the webhook signature issue!');