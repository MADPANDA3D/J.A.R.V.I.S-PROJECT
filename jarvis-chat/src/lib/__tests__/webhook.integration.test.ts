/**
 * Real Webhook Integration Test
 * Tests against the actual n8n webhook endpoint
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WebhookService, WebhookPayload } from '../webhookService';

describe('Real n8n Webhook Integration', () => {
  let webhookService: WebhookService;

  beforeEach(() => {
    // Use actual webhook configuration from environment
    webhookService = new WebhookService({
      webhookUrl:
        'https://n8n.madpanda3d.com/webhook/4bed7e4e-041a-4f19-b736-d320250a50ca',
      timeout: 10000, // Longer timeout for real network request
      retryConfig: {
        maxAttempts: 2, // Fewer retries for real testing
        baseDelay: 500,
        maxDelay: 2000,
        backoffFactor: 2.0,
        jitter: false,
      },
      circuitBreakerOptions: {
        failureThreshold: 5,
        recoveryTimeout: 30000,
        monitoringWindow: 60000,
      },
      enableMetrics: true,
    });
  });

  it('should successfully send message to real n8n webhook', async () => {
    const payload: WebhookPayload = {
      message: 'Hello from JARVIS Chat integration test!',
      userId: 'test_user_123',
      timestamp: new Date().toISOString(),
      conversationId: 'test_conv_456',
      metadata: {
        source: 'integration_test',
        testCase: 'basic_message_sending',
        clientVersion: '1.0.0',
      },
    };

    const response = await webhookService.sendMessage(payload);

    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.response).toBeDefined();
    expect(typeof response.response).toBe('string');
    expect(response.response.length).toBeGreaterThan(0);

    console.log('✅ Webhook Response:', response);

    // Check metrics were updated
    const metrics = webhookService.getMetrics();
    expect(metrics.totalRequests).toBeGreaterThan(0);
    expect(metrics.successfulRequests).toBeGreaterThan(0);
    expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);

    console.log('📊 Webhook Metrics:', metrics);
  }, 15000); // 15 second timeout for real network request

  it('should perform health check successfully', async () => {
    const healthStatus = await webhookService.healthCheck();

    expect(healthStatus.status).toMatch(/healthy|degraded/);
    expect(healthStatus.responseTime).toBeGreaterThan(0);

    if (healthStatus.status === 'healthy') {
      expect(healthStatus.responseTime).toBeLessThan(2000); // Should be reasonably fast
    }

    console.log('🏥 Health Check Result:', healthStatus);
  }, 15000);

  it('should handle conversation context properly', async () => {
    const conversationId = `test_conv_${Date.now()}`;

    // Send first message
    const message1: WebhookPayload = {
      message: 'Hello, I am starting a new conversation',
      userId: 'test_user_conv',
      timestamp: new Date().toISOString(),
      conversationId,
      metadata: {
        source: 'conversation_test',
        messageNumber: 1,
      },
    };

    const response1 = await webhookService.sendMessage(message1);
    expect(response1.success).toBe(true);

    // Send follow-up message with same conversation ID
    const message2: WebhookPayload = {
      message: 'This is a follow-up message in the same conversation',
      userId: 'test_user_conv',
      timestamp: new Date().toISOString(),
      conversationId,
      metadata: {
        source: 'conversation_test',
        messageNumber: 2,
      },
    };

    const response2 = await webhookService.sendMessage(message2);
    expect(response2.success).toBe(true);

    console.log('💬 Conversation Test Results:');
    console.log('  Message 1 Response:', response1.response);
    console.log('  Message 2 Response:', response2.response);
  }, 20000);

  it('should demonstrate error recovery and circuit breaker', async () => {
    // This test will only run if we want to test error scenarios
    // For now, we'll just verify the service configuration
    const config = webhookService.getConfig();

    expect(config.webhookUrl).toBe(
      'https://n8n.madpanda3d.com/webhook-test/4bed7e4e-041a-4f19-b736-d320250a50ca'
    );
    expect(config.circuitBreakerOptions.failureThreshold).toBe(5);
    expect(config.enableMetrics).toBe(true);

    console.log('⚙️ Webhook Configuration:', {
      url: config.webhookUrl,
      timeout: config.timeout,
      retryAttempts: config.retryConfig.maxAttempts,
      circuitBreakerThreshold: config.circuitBreakerOptions.failureThreshold,
    });
  });

  it('should test different message types and formats', async () => {
    const testMessages = [
      'Simple greeting message',
      'Question: What is the weather like today?',
      'Command: Please help me with a coding problem',
      'Multi-line message:\nLine 1\nLine 2\nLine 3',
      '🚀 Message with emojis and special chars: @#$%^&*()',
      'Very long message: ' + 'A'.repeat(500), // Test longer content
    ];

    for (let i = 0; i < testMessages.length; i++) {
      const payload: WebhookPayload = {
        message: testMessages[i],
        userId: 'test_user_formats',
        timestamp: new Date().toISOString(),
        conversationId: `format_test_${i}`,
        metadata: {
          source: 'format_test',
          messageType: `type_${i}`,
          testIndex: i,
        },
      };

      const response = await webhookService.sendMessage(payload);

      expect(response.success).toBe(true);
      expect(response.response).toBeDefined();

      console.log(
        `📝 Message ${i + 1} (${testMessages[i].substring(0, 30)}...):`,
        response.response.substring(0, 100) + '...'
      );

      // Small delay between requests to be respectful to the webhook
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }, 30000);
});
