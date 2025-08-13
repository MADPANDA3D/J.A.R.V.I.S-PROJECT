// Simple ES module test for webhookService fixes
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch
globalThis.fetch = vi.fn();

// Mock AbortController
globalThis.AbortController = vi.fn(() => ({
  signal: { aborted: false },
  abort: vi.fn(),
}));

// Simple test to validate our fixes
describe('WebhookService Core Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle timeout function correctly', async () => {
    // Mock a successful fetch response
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        response: 'Hello, how can I help you?',
        success: true,
      }),
    };

    globalThis.fetch.mockResolvedValueOnce(mockResponse);

    // Dynamically import to avoid issues
    const { WebhookService } = await import('./src/lib/webhookService.ts');
    
    const webhookService = new WebhookService({
      webhookUrl: 'https://test-webhook.example.com/webhook',
      timeout: 5000,
    });

    const payload = {
      message: 'Hello',
      userId: 'user_123', 
      timestamp: new Date().toISOString(),
    };

    const result = await webhookService.sendMessage(payload);
    
    expect(result.success).toBe(true);
    expect(result.response).toBe('Hello, how can I help you?');
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('should handle network errors correctly', async () => {
    globalThis.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const { WebhookService, WebhookErrorType } = await import('./src/lib/webhookService.ts');
    
    const webhookService = new WebhookService({
      webhookUrl: 'https://test-webhook.example.com/webhook',
      timeout: 5000,
    });

    const payload = {
      message: 'Test',
      userId: 'user_123',
      timestamp: new Date().toISOString(),
    };

    try {
      await webhookService.sendMessage(payload);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.type).toBe(WebhookErrorType.NETWORK_ERROR);
      expect(error.isRetryable).toBe(true);
    }
  });
});