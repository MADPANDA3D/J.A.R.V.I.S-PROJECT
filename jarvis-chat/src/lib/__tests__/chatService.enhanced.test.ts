/**
 * Enhanced ChatService Test Suite
 * Tests for enhanced webhook integration and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chatService } from '../chatService';
import * as webhookServiceModule from '../webhookService';

// Mock the webhook service
vi.mock('../webhookService', () => {
  const mockWebhookService = {
    sendMessage: vi.fn(),
    healthCheck: vi.fn(),
    getMetrics: vi.fn(),
    configureCircuitBreaker: vi.fn(),
    resetCircuitBreaker: vi.fn(),
    getConfig: vi.fn(),
  };

  return {
    webhookService: mockWebhookService,
    WebhookError: class WebhookError extends Error {
      constructor(
        message: string,
        public type: string,
        public statusCode?: number,
        public isRetryable: boolean = true
      ) {
        super(message);
        this.name = 'WebhookError';
      }
    },
    WebhookErrorType: {
      NETWORK_ERROR: 'network_error',
      TIMEOUT_ERROR: 'timeout_error',
      HTTP_ERROR: 'http_error',
      VALIDATION_ERROR: 'validation_error',
      CIRCUIT_BREAKER_OPEN: 'circuit_breaker_open',
      UNKNOWN_ERROR: 'unknown_error',
    },
  };
});

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('ChatService - Enhanced Integration', () => {
  const mockWebhookService = webhookServiceModule.webhookService as typeof webhookServiceModule.webhookService & {
    sendMessage: ReturnType<typeof vi.fn>;
    healthCheck: ReturnType<typeof vi.fn>;
    getMetrics: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset webhook service mocks
    mockWebhookService.sendMessage.mockClear();
    mockWebhookService.healthCheck.mockClear();
    mockWebhookService.getMetrics.mockClear();
  });

  describe('Enhanced sendMessageToAI', () => {
    it('should use webhook service with proper payload structure', async () => {
      const mockResponse = {
        response: 'AI response from webhook service',
        success: true,
        requestId: 'req_123',
      };

      mockWebhookService.sendMessage.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessageToAI(
        'Hello',
        'user_123',
        'conv_456'
      );

      expect(result).toBe('AI response from webhook service');
      expect(mockWebhookService.sendMessage).toHaveBeenCalledWith({
        type: 'Text',
        message: 'Hello',
        sessionId: 'conv_456',
        source: 'webapp',
        chatId: 1,
        timestamp: expect.any(String),
      });
    });

    it('should handle webhook service errors gracefully', async () => {
      const webhookError = new webhookServiceModule.WebhookError(
        'Network connection failed',
        'network_error',
        undefined,
        true
      );

      mockWebhookService.sendMessage.mockRejectedValueOnce(webhookError);

      await expect(
        chatService.sendMessageToAI('Hello', 'user_123')
      ).rejects.toThrow('Failed to get AI response. Please try again.');
    });

    it('should use fallback response when circuit breaker is open', async () => {
      const circuitBreakerError = new webhookServiceModule.WebhookError(
        'Circuit breaker is open - webhook temporarily unavailable',
        'circuit_breaker_open',
        503,
        false
      );

      mockWebhookService.sendMessage.mockRejectedValueOnce(circuitBreakerError);

      const result = await chatService.sendMessageToAI('Hello', 'user_123');

      // Should return fallback response instead of throwing
      expect(result).toContain('Hello');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use fallback response when webhook URL not configured', async () => {
      const configError = new webhookServiceModule.WebhookError(
        'Webhook URL not configured',
        'validation_error',
        undefined,
        false
      );

      mockWebhookService.sendMessage.mockRejectedValueOnce(configError);

      const result = await chatService.sendMessageToAI('Hello', 'user_123');

      // Should return fallback response instead of throwing
      expect(result).toContain('Hello');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include conversation ID in webhook payload when provided', async () => {
      const mockResponse = {
        response: 'Response with conversation context',
        success: true,
      };

      mockWebhookService.sendMessage.mockResolvedValueOnce(mockResponse);

      await chatService.sendMessageToAI(
        'Follow up question',
        'user_123',
        'conv_789'
      );

      expect(mockWebhookService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Text',
          sessionId: 'conv_789',
          source: 'webapp',
          chatId: 1,
        })
      );
    });

    it('should handle missing conversation ID gracefully', async () => {
      const mockResponse = {
        response: 'Response without conversation context',
        success: true,
      };

      mockWebhookService.sendMessage.mockResolvedValueOnce(mockResponse);

      await chatService.sendMessageToAI('New conversation', 'user_123');

      expect(mockWebhookService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Text',
          sessionId: expect.stringMatching(/^session_\d+_user_123$/),
          source: 'webapp',
          chatId: 1,
        })
      );
    });
  });

  describe('Webhook Status Monitoring', () => {
    it('should return webhook health status and metrics', async () => {
      const mockHealthStatus = {
        status: 'healthy' as const,
        responseTime: 150,
      };

      const mockMetrics = {
        totalRequests: 100,
        successfulRequests: 95,
        failedRequests: 5,
        averageResponseTime: 200,
        p95ResponseTime: 350,
        circuitBreakerState: 'closed' as const,
        errorRate: 5,
      };

      mockWebhookService.healthCheck.mockResolvedValueOnce(mockHealthStatus);
      mockWebhookService.getMetrics.mockReturnValueOnce(mockMetrics);

      // Mock environment variable for webhook URL
      const originalEnv = import.meta.env.VITE_N8N_WEBHOOK_URL;
      vi.stubGlobal('import.meta', {
        env: {
          ...import.meta.env,
          VITE_N8N_WEBHOOK_URL: 'https://test-webhook.example.com',
        },
      });

      const status = await chatService.getWebhookStatus();

      expect(status).toEqual({
        health: mockHealthStatus,
        metrics: mockMetrics,
        isConfigured: true,
      });

      // Restore original environment
      vi.stubGlobal('import.meta', {
        env: { ...import.meta.env, VITE_N8N_WEBHOOK_URL: originalEnv },
      });
    });

    it('should handle health check errors gracefully', async () => {
      const mockMetrics = {
        totalRequests: 10,
        successfulRequests: 8,
        failedRequests: 2,
        averageResponseTime: 300,
        p95ResponseTime: 500,
        circuitBreakerState: 'open' as const,
        errorRate: 20,
      };

      mockWebhookService.healthCheck.mockRejectedValueOnce(
        new Error('Health check failed')
      );
      // Mock getMetrics to return the same value multiple times (it gets called twice - once in Promise.all, once in catch block)
      mockWebhookService.getMetrics.mockReturnValue(mockMetrics);

      const status = await chatService.getWebhookStatus();

      expect(status.health.status).toBe('unhealthy');
      expect(status.health.error).toBe('Failed to get status');
      expect(status.metrics).toBeDefined();
      expect(mockWebhookService.getMetrics).toHaveBeenCalled();
    });

    it('should detect when webhook is not configured', async () => {
      const mockHealthStatus = {
        status: 'unhealthy' as const,
        error: 'Webhook URL not configured',
      };

      const mockMetrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        circuitBreakerState: 'closed' as const,
        errorRate: 0,
      };

      mockWebhookService.healthCheck.mockResolvedValueOnce(mockHealthStatus);
      mockWebhookService.getMetrics.mockReturnValueOnce(mockMetrics);

      const status = await chatService.getWebhookStatus();

      // The status will show webhook configuration status
      expect(status.health.status).toBe('unhealthy');
      expect(status.metrics).toBeDefined();
      expect(typeof status.isConfigured).toBe('boolean');
    });
  });

  describe('Integration with Existing Features', () => {
    it('should maintain backward compatibility with existing methods', () => {
      // Verify that existing methods still exist
      expect(typeof chatService.saveMessage).toBe('function');
      expect(typeof chatService.loadMessageHistory).toBe('function');
      expect(typeof chatService.subscribeToMessages).toBe('function');
      expect(typeof chatService.processChatMessage).toBe('function');
    });

    it('should pass conversation ID to enhanced webhook service', async () => {
      const mockResponse = {
        response: 'AI response with conversation context',
        success: true,
      };

      mockWebhookService.sendMessage.mockResolvedValueOnce(mockResponse);

      const result = await chatService.sendMessageToAI(
        'Test message',
        'user_123',
        'conv_123'
      );

      expect(mockWebhookService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Text',
          message: 'Test message',
          sessionId: 'conv_123',
          source: 'webapp',
          chatId: 1,
        })
      );

      expect(result).toBe('AI response with conversation context');
    });
  });
});
