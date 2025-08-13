// Quick validation test for webhookService fixes
const { WebhookService, WebhookError, WebhookErrorType } = require('./dist/lib/webhookService.js');

console.log('Testing WebhookService fixes...');

// Test 1: WebhookError creation
try {
  const error = new WebhookError('test', WebhookErrorType.TIMEOUT_ERROR, 408, true, {});
  console.log('✅ WebhookError created successfully');
  console.log('✅ Error type:', error.type);
  console.log('✅ Status code:', error.statusCode);
  console.log('✅ Is retryable:', error.isRetryable);
} catch (e) {
  console.log('❌ WebhookError creation failed:', e.message);
}

// Test 2: WebhookService instantiation
try {
  const service = new WebhookService({
    webhookUrl: 'https://test.example.com/webhook',
    timeout: 5000
  });
  console.log('✅ WebhookService created successfully');
} catch (e) {
  console.log('❌ WebhookService creation failed:', e.message);
}

console.log('Basic validation complete');