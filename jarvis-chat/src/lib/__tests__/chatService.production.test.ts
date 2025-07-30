/**
 * Production ChatService Test
 * Tests the chat service with the actual production webhook
 */

import { describe, it, expect } from 'vitest';
import { chatService } from '../chatService';

describe('ChatService - Production Integration', () {
  it('should gracefully handle empty webhook responses with fallback', async () {
    // This test uses the real production webhook which currently returns empty responses
    const result = await chatService.sendMessageToAI(
      'Hello JARVIS!',
      'test_user_prod'
    );

    // Since the webhook returns empty response, it should fallback to local response
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Hello JARVIS!'); // Should contain the original message

    console.log(
      '✅ Fallback response received:',
      result.substring(0, 100) + '...'
    );
  });

  it('should provide webhook status diagnostics', async () {
    const status = await chatService.getWebhookStatus();

    expect(status).toBeDefined();
    expect(status.health).toBeDefined();
    expect(status.metrics).toBeDefined();
    expect(typeof status.isConfigured).toBe('boolean');

    console.log('📊 Webhook Status:', {
      configured: status.isConfigured,
      health: status.health.status,
      error: status.health.error,
      totalRequests: status.metrics.totalRequests,
      errorRate: status.metrics.errorRate,
    });

    // With empty responses, health should be unhealthy
    expect(status.health.status).toBe('unhealthy');
    expect(status.isConfigured).toBe(true); // URL is configured
  });

  it('should demonstrate conversation flow with fallback', async () {
    const conversationId = 'test_conv_' + Date.now();

    // Send first message
    const response1 = await chatService.sendMessageToAI(
      'Start a conversation about AI',
      'test_user_conv',
      conversationId
    );

    expect(response1).toBeDefined();
    expect(response1).toContain('AI');

    // Send follow-up message
    const response2 = await chatService.sendMessageToAI(
      'Tell me more about that topic',
      'test_user_conv',
      conversationId
    );

    expect(response2).toBeDefined();
    expect(response2).toContain('Tell me more');

    console.log('💬 Conversation test results:');
    console.log('  Message 1:', response1.substring(0, 60) + '...');
    console.log('  Message 2:', response2.substring(0, 60) + '...');
  });
});
