/**
 * Comprehensive WebhookService Test Suite
 * Tests for webhook functionality, error handling, retry logic, and performance
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import {
  WebhookService,
  WebhookError,
  WebhookErrorType,
  WebhookPayload,
  WebhookResponse,
} from '../webhookService';
import { MockN8nServer, mockN8nServer } from '../mockN8nServer';

// Mock fetch globally
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

// Mock AbortController
global.AbortController = vi.fn(() => ({
  signal: { aborted: false },
  abort: vi.fn(),
})) as any;

// Mock timers for testing
vi.useFakeTimers();

describe('WebhookService', () => {
  let webhookService: WebhookService;
  let mockServer: MockN8nServer;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    vi.clearAllTimers();

    // Reset mock server
    mockServer = new MockN8nServer();
    mockServer.clearHistory();
    mockServer.clearScenarios();

    // Create webhook service with test configuration
    webhookService = new WebhookService({
      webhookUrl: 'https://test-webhook.example.com/webhook',
      timeout: 5000,
      retryConfig: {
        maxAttempts: 3,
        baseDelay: 100, // Shorter delays for testing
        maxDelay: 1000,
        backoffFactor: 2.0,
        jitter: false, // Disable jitter for predictable testing
      },
      circuitBreakerOptions: {
        failureThreshold: 3,
        recoveryTimeout: 1000, // Shorter for testing
        monitoringWindow: 5000,
      },
      enableMetrics: true,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
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

    it('should handle response with additional fields', async () => {
      const mockResponse: WebhookResponse = {
        response: 'Response with extra data',
        success: true,
        requestId: 'server_req_456',
        processingTime: 200,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookService.sendMessage(payload);

      expect(result.requestId).toBe('server_req_456');
      expect(result.processingTime).toBe(200);
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
      mockFetch.mockResolvedValueOnce({
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
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

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

    it('should handle timeout errors', async () => {
      // Mock AbortError
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.TIMEOUT_ERROR,
          statusCode: 408,
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

    it('should handle webhook response with success: false', async () => {
      const errorResponse = {
        response: '',
        success: false,
        error: 'Processing failed on server',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(errorResponse),
      });

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.HTTP_ERROR,
          message: 'Processing failed on server',
          isRetryable: true,
        })
      );
    });
  });

  describe('Retry Logic with Exponential Backoff', () => {
    it('should retry on retryable errors', async () => {
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

    it('should respect max retry attempts', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new TypeError('Persistent network error'));

      const payload: WebhookPayload = {
        message: 'Test max retries',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow();

      // Should try initial attempt + 2 retries = 3 total
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should calculate exponential backoff delays', async () => {
      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const payload: WebhookPayload = {
        message: 'Test backoff',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      const promise = webhookService.sendMessage(payload);

      // Fast-forward timers to simulate delays
      vi.runAllTimers();

      await expect(promise).rejects.toThrow();

      // Should have made multiple attempts
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 4xx client errors (except 408, 429)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const payload: WebhookPayload = {
        message: 'Test client error',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(webhookService.sendMessage(payload)).rejects.toThrow();

      // Should only make one attempt for non-retryable client errors
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable HTTP status codes', async () => {
      // Test 429 (Too Many Requests) - should retry
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              response: 'Success after rate limit',
              success: true,
            }),
        });

      const payload: WebhookPayload = {
        message: 'Test rate limit retry',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookService.sendMessage(payload);

      expect(result.response).toBe('Success after rate limit');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after failure threshold', async () => {
      // Configure service with low failure threshold
      const testService = new WebhookService({
        webhookUrl: 'https://test.example.com/webhook',
        circuitBreakerOptions: {
          failureThreshold: 2,
          recoveryTimeout: 1000,
          monitoringWindow: 5000,
        },
      });

      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const payload: WebhookPayload = {
        message: 'Test circuit breaker',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      // First failure
      await expect(testService.sendMessage(payload)).rejects.toThrow();

      // Second failure - should open circuit
      await expect(testService.sendMessage(payload)).rejects.toThrow();

      // Third call should fail immediately with circuit breaker error
      await expect(testService.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.CIRCUIT_BREAKER_OPEN,
          isRetryable: false,
        })
      );

      const metrics = testService.getMetrics();
      expect(metrics.circuitBreakerState).toBe('open');
    });

    it('should reset circuit breaker on successful request', async () => {
      const testService = new WebhookService({
        webhookUrl: 'https://test.example.com/webhook',
        circuitBreakerOptions: {
          failureThreshold: 2,
          recoveryTimeout: 100, // Very short for testing
          monitoringWindow: 5000,
        },
      });

      const payload: WebhookPayload = {
        message: 'Test circuit recovery',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      // Cause failures to open circuit
      mockFetch.mockRejectedValue(new TypeError('Network error'));
      await expect(testService.sendMessage(payload)).rejects.toThrow();
      await expect(testService.sendMessage(payload)).rejects.toThrow();

      // Fast forward time for recovery timeout
      vi.advanceTimersByTime(150);

      // Next call should attempt recovery (half-open state)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Circuit recovered',
            success: true,
          }),
      });

      const result = await testService.sendMessage(payload);
      expect(result.response).toBe('Circuit recovered');

      const metrics = testService.getMetrics();
      expect(metrics.circuitBreakerState).toBe('closed');
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
      // Force some failures to change circuit state
      webhookService.resetCircuitBreaker();

      const metrics = webhookService.getMetrics();
      expect(metrics.circuitBreakerState).toBe('closed');
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

    it('should validate webhook response format strictly', async () => {
      const testCases = [
        // Missing success field
        { response: 'test' },
        // Wrong success type
        { response: 'test', success: 'true' },
        // Missing response when success is true
        { success: true },
        // Null response
        null,
        // Non-object response
        'string response',
      ];

      for (const invalidResponse of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(invalidResponse),
        });

        const payload: WebhookPayload = {
          message: 'Test validation',
          userId: 'user_123',
          timestamp: new Date().toISOString(),
        };

        await expect(webhookService.sendMessage(payload)).rejects.toThrow(
          expect.objectContaining({
            type: WebhookErrorType.VALIDATION_ERROR,
            message: 'Invalid response format from webhook',
          })
        );
      }
    });
  });

  describe('Performance and Metrics', () => {
    it('should track request metrics', async () => {
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
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
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

    it('should calculate percentile response times', async () => {
      // Send multiple requests to get response time data
      for (let i = 0; i < 10; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              response: `Response ${i}`,
              success: true,
            }),
        });

        const payload: WebhookPayload = {
          message: `Test message ${i}`,
          userId: 'user_123',
          timestamp: new Date().toISOString(),
        };

        await webhookService.sendMessage(payload);
      }

      const metrics = webhookService.getMetrics();
      expect(metrics.p95ResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should include last request timestamp in metrics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Timestamp test',
            success: true,
          }),
      });

      const beforeRequest = new Date();

      const payload: WebhookPayload = {
        message: 'Test timestamp',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await webhookService.sendMessage(payload);

      const metrics = webhookService.getMetrics();
      expect(metrics.lastRequestTime).toBeDefined();
      expect(metrics.lastRequestTime!.getTime()).toBeGreaterThanOrEqual(
        beforeRequest.getTime()
      );
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
      expect(healthStatus.responseTime).toBeGreaterThan(0);
      expect(healthStatus.error).toBeUndefined();

      // Verify health check payload
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.message).toBe('__health_check__');
      expect(requestBody.userId).toBe('system');
    });

    it('should return degraded status for slow responses', async () => {
      // Mock a slow response by controlling Date.now
      const originalDateNow = Date.now;
      let timeAdvance = 0;
      vi.spyOn(Date, 'now').mockImplementation(
        () => originalDateNow() + timeAdvance
      );

      mockFetch.mockImplementationOnce(async () => {
        // Simulate 1.5 second delay
        timeAdvance = 1500;
        return {
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              response: 'Slow response',
              success: true,
            }),
        };
      });

      const healthStatus = await webhookService.healthCheck();

      expect(healthStatus.status).toBe('degraded');
      expect(healthStatus.responseTime).toBeGreaterThan(1000);

      vi.restoreAllMocks();
    });

    it('should return unhealthy status on errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Connection failed'));

      const healthStatus = await webhookService.healthCheck();

      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.error).toContain('Connection failed');
      expect(healthStatus.responseTime).toBeUndefined();
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      // Setup mock to respond to multiple requests
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              response: 'Concurrent response',
              success: true,
            }),
        })
      );

      const payload: WebhookPayload = {
        message: 'Concurrent test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      // Send 5 concurrent requests
      const promises = Array(5)
        .fill(null)
        .map(() => webhookService.sendMessage(payload));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.response).toBe('Concurrent response');
      });

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should handle mixed success/failure in concurrent requests', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new TypeError('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              response: 'Success',
              success: true,
            }),
        });
      });

      const payload: WebhookPayload = {
        message: 'Mixed results test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      const promises = Array(4)
        .fill(null)
        .map(() => webhookService.sendMessage(payload).catch(err => err));

      const results = await Promise.all(promises);

      // Should have mix of successful responses and errors
      const successes = results.filter(r => r.success === true);
      const errors = results.filter(r => r instanceof Error);

      expect(successes.length).toBeGreaterThan(0);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication and Security', () => {
    it('should include authorization header when secret is provided', async () => {
      // Mock environment variable
      const originalEnv = import.meta.env.N8N_WEBHOOK_SECRET;
      vi.stubGlobal('import.meta', {
        env: {
          ...import.meta.env,
          N8N_WEBHOOK_SECRET: 'test-secret-token',
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Authenticated response',
            success: true,
          }),
      });

      const serviceWithAuth = new WebhookService({
        webhookUrl: 'https://test-webhook.example.com/webhook',
      });

      const payload: WebhookPayload = {
        message: 'Authenticated request',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await serviceWithAuth.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers.Authorization).toBe(
        'Bearer test-secret-token'
      );

      // Restore original environment
      vi.stubGlobal('import.meta', {
        env: { ...import.meta.env, N8N_WEBHOOK_SECRET: originalEnv },
      });
    });

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
  });
});
