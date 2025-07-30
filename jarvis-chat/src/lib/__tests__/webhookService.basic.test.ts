/**
 * Basic WebhookService Test Suite
 * Focused tests for core webhook functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WebhookService,
  WebhookErrorType,
  WebhookPayload,
  WebhookResponse,
} from '../webhookService';

// Mock fetch globally
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

// Mock AbortController
global.AbortController = vi.fn(() => ({
  signal: { aborted: false },
  abort: vi.fn(),
})) as unknown as typeof AbortController;

describe('WebhookService - Basic Tests', () => {
  let webhookService: WebhookService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();

    // Create webhook service with test configuration
    webhookService = new WebhookService({
      webhookUrl: 'https://test-webhook.example.com/webhook',
      timeout: 5000,
      retryConfig: {
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 1000,
        backoffFactor: 2.0,
        jitter: false,
      },
      circuitBreakerOptions: {
        failureThreshold: 3,
        recoveryTimeout: 1000,
        monitoringWindow: 5000,
      },
      enableMetrics: true,
    });
  });

  describe('Message Sending Success Scenarios', () => {
    it('should send message successfully with valid payload', async () => {
      const mockResponse: WebhookResponse = {
        response: 'Hello, how can I help you?',
        success: true,
        requestId: 'req_123',
        processingTime: 150,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const payload: WebhookPayload = {
        message: 'Hello',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
        conversationId: 'conv_123',
      };

      const result = await webhookService.sendMessage(payload);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-webhook.example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'JARVIS-Chat/1.0',
          }),
          body: expect.stringContaining('"message":"Hello"'),
        })
      );
    });

    it('should include request metadata in payload', async () => {
      const mockResponse: WebhookResponse = {
        response: 'Response',
        success: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const payload: WebhookPayload = {
        message: 'Test message',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
        metadata: { source: 'chat', priority: 'normal' },
      };

      await webhookService.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toMatchObject({
        message: 'Test message',
        userId: 'user_123',
        metadata: { source: 'chat', priority: 'normal' },
        requestId: expect.stringMatching(/^req_/),
        clientVersion: '1.0.0',
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw validation error for missing webhook URL', async () => {
      const serviceWithoutUrl = new WebhookService({ webhookUrl: '' });

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(serviceWithoutUrl.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.VALIDATION_ERROR,
          message: 'Webhook URL not configured',
          isRetryable: false,
        })
      );
    });

    it('should handle HTTP error responses', async () => {
      // Mock all retry attempts to return the same error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.HTTP_ERROR,
          statusCode: 500,
          isRetryable: true,
        })
      );
    });

    it('should handle network errors', async () => {
      // Mock all retry attempts to return the same network error
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.NETWORK_ERROR,
          isRetryable: true,
        })
      );
    });

    it('should handle malformed response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ invalid: 'response' }),
      });

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.VALIDATION_ERROR,
          message: 'Invalid response format from webhook',
          isRetryable: false,
        })
      );
    });
  });

  describe('Basic Retry Logic', () => {
    it('should retry on retryable errors and eventually succeed', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              response: 'Success after retries',
              success: true,
            }),
        });

      const payload: WebhookPayload = {
        message: 'Test retry',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookService.sendMessage(payload);

      expect(result.response).toBe('Success after retries');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const serviceWithoutUrl = new WebhookService({ webhookUrl: '' });

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(serviceWithoutUrl.sendMessage(payload)).rejects.toThrow();

      // Should not make any fetch calls for validation errors
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Webhook Payload Validation', () => {
    it('should validate required payload fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Valid payload',
            success: true,
          }),
      });

      const payload: WebhookPayload = {
        message: 'Test message',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await webhookService.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toHaveProperty('message', 'Test message');
      expect(requestBody).toHaveProperty('userId', 'user_123');
      expect(requestBody).toHaveProperty('timestamp');
      expect(requestBody).toHaveProperty('requestId');
      expect(requestBody).toHaveProperty('clientVersion');
    });

    it('should include optional payload fields when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Valid payload with optional fields',
            success: true,
          }),
      });

      const payload: WebhookPayload = {
        message: 'Test message',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
        conversationId: 'conv_456',
        metadata: {
          source: 'mobile_app',
          version: '1.2.3',
          sessionId: 'session_789',
        },
      };

      await webhookService.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.conversationId).toBe('conv_456');
      expect(requestBody.metadata).toEqual({
        source: 'mobile_app',
        version: '1.2.3',
        sessionId: 'session_789',
      });
    });
  });

  describe('Performance and Metrics', () => {
    it('should track request metrics on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Metrics test',
            success: true,
          }),
      });

      const payload: WebhookPayload = {
        message: 'Test metrics',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await webhookService.sendMessage(payload);

      const metrics = webhookService.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should track error metrics on failures', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      const payload: WebhookPayload = {
        message: 'Test error metrics',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow();

      const metrics = webhookService.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.failedRequests).toBeGreaterThan(0);
      expect(metrics.errorRate).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Webhook is healthy',
            success: true,
          }),
      });

      const healthStatus = await webhookService.healthCheck();

      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.responseTime).toBeGreaterThanOrEqual(0);
      expect(healthStatus.error).toBeUndefined();

      // Verify health check payload
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.message).toBe('__health_check__');
      expect(requestBody.userId).toBe('system');
    });

    it('should return unhealthy status on errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Connection failed'));

      const healthStatus = await webhookService.healthCheck();

      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.error).toBeDefined();
      expect(healthStatus.responseTime).toBeUndefined();
    });
  });

  describe('Configuration and Security', () => {
    it('should include standard headers in all requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Headers test',
            success: true,
          }),
      });

      const payload: WebhookPayload = {
        message: 'Headers test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await webhookService.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['User-Agent']).toBe('JARVIS-Chat/1.0');
    });

    it('should generate unique request IDs', async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              response: 'Request ID test',
              success: true,
            }),
        })
      );

      const payload: WebhookPayload = {
        message: 'Request ID test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      // Send multiple requests
      await webhookService.sendMessage(payload);
      await webhookService.sendMessage(payload);

      const call1Body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const call2Body = JSON.parse(mockFetch.mock.calls[1][1].body);

      expect(call1Body.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(call2Body.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(call1Body.requestId).not.toBe(call2Body.requestId);
    });

    it('should provide circuit breaker configuration methods', () => {
      webhookService.configureCircuitBreaker({
        failureThreshold: 10,
        recoveryTimeout: 30000,
      });

      const config = webhookService.getConfig();
      expect(config.circuitBreakerOptions.failureThreshold).toBe(10);
      expect(config.circuitBreakerOptions.recoveryTimeout).toBe(30000);
    });

    it('should allow manual circuit breaker reset', () => {
      webhookService.resetCircuitBreaker();

      const metrics = webhookService.getMetrics();
      expect(metrics.circuitBreakerState).toBe('closed');
    });
  });
});
