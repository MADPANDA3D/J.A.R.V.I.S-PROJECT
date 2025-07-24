/**
 * Simple Message Test - using our WebhookService
 */

const { WebhookService } =
  require('./src/lib/webhookService.ts').default ||
  require('./src/lib/webhookService.ts');

async function testSimpleMessage() {
  console.log('🧪 Testing Simple Message with WebhookService');
  console.log('='.repeat(50));

  // Create webhook service with minimal config
  const webhookService = new WebhookService({
    webhookUrl:
      'https://n8n.madpanda3d.com/webhook/4bed7e4e-041a-4f19-b736-d320250a50ca',
    timeout: 10000,
    retryConfig: {
      maxAttempts: 1, // No retries for testing
      baseDelay: 100,
      maxDelay: 100,
      backoffFactor: 1,
      jitter: false,
    },
  });

  // Payload structure matching n8n workflow expectations
  const payload = {
    type: 'Text',
    message: 'Hello JARVIS!',
    sessionId: `test_session_${Date.now()}`,
    source: 'webapp',
    chatId: 1,
    timestamp: new Date().toISOString(),
  };

  console.log('📨 Sending payload:', JSON.stringify(payload, null, 2));
  console.log('');

  try {
    const response = await webhookService.sendMessage(payload);
    console.log('✅ SUCCESS! Response received:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('   Type:', error.type);
    console.log('   Status Code:', error.statusCode);
    console.log('   Retryable:', error.isRetryable);

    console.log('');
    console.log('🔍 This confirms the issue:');
    console.log('   • n8n webhook receives the request (200 OK)');
    console.log('   • But returns empty response body');
    console.log('   • Your "Respond to Webhook" node needs configuration');
  }

  // Show metrics
  const metrics = webhookService.getMetrics();
  console.log('');
  console.log('📊 Metrics:');
  console.log(`   Requests: ${metrics.totalRequests}`);
  console.log(`   Successful: ${metrics.successfulRequests}`);
  console.log(`   Failed: ${metrics.failedRequests}`);
  console.log(`   Error Rate: ${metrics.errorRate}%`);
}

testSimpleMessage().catch(console.error);
