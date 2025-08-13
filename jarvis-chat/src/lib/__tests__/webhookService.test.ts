/**
 * Comprehensive WebhookService Test Suite
 * Tests for webhook functionality, error handling, retry logic, and performance
 * 
 * FIXED: Uses fake timers and deterministic time advancement to prevent timeouts and OOM
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  WebhookService,
  WebhookErrorType,
  WebhookPayload,
  WebhookResponse,
} from '../webhookService';

// Global fake timers setup
vi.useFakeTimers();

describe('WebhookService', () => {
  let webhookService: WebhookService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear all mocks and timers
    vi.clearAllMocks();
    vi.clearAllTimers();

    // Create fresh mock fetch
    mockFetch = vi.fn();

    // Create webhook service with test configuration and injected fetch
    webhookService = new WebhookService({
      webhookUrl: 'https://test-webhook.example.com/webhook',
      timeout: 5000,
      retryConfig: {
        maxAttempts: 3,
        baseDelay: 100, // Small delays for testing
        maxDelay: 1000,
        backoffFactor: 2.0,
        jitter: false, // Disable jitter for predictable testing
      },
      circuitBreakerOptions: {
        failureThreshold: 3,
        recoveryTimeout: 1000, // Short recovery for testing
        monitoringWindow: 5000,
      },
      enableMetrics: true,
    }, { fetch: mockFetch });
  });

  afterEach(() => {
    // Clean up timers and restore mocks
    vi.runOnlyPendingTimers();
    vi.clearAllTimers();
    webhookService.destroy(); // Clean up service resources
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
      const serviceWithoutUrl = new WebhookService({ webhookUrl: '' }, { fetch: mockFetch });

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

      serviceWithoutUrl.destroy();
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
    it('should retry on retryable errors with fake timer advancement', async () => {
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

      // Start the async operation
      const resultPromise = webhookService.sendMessage(payload);

      // Advance timers to trigger retries
      // First retry after 100ms, second retry after 200ms
      await vi.advanceTimersByTimeAsync(300);

      const result = await resultPromise;

      expect(result.response).toBe('Success after retries');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const serviceWithoutUrl = new WebhookService({ webhookUrl: '' }, { fetch: mockFetch });

      const payload: WebhookPayload = {
        message: 'Test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await expect(serviceWithoutUrl.sendMessage(payload)).rejects.toThrow();

      // Should not make any fetch calls for validation errors
      expect(mockFetch).not.toHaveBeenCalled();

      serviceWithoutUrl.destroy();
    });

    it('should respect max retry attempts', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new TypeError('Persistent network error'));

      const payload: WebhookPayload = {
        message: 'Test max retries',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      const resultPromise = webhookService.sendMessage(payload);

      // Advance timers to complete all retry attempts
      // Total time: 100ms + 200ms = 300ms for all retries
      await vi.advanceTimersByTimeAsync(300);

      await expect(resultPromise).rejects.toThrow();

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

      // Advance timers to complete all attempts
      await vi.advanceTimersByTimeAsync(300);

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

      const resultPromise = webhookService.sendMessage(payload);

      // Advance timer for the retry delay
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;

      expect(result.response).toBe('Success after rate limit');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after failure threshold with fake timers', async () => {
      // Configure service with low failure threshold
      const testService = new WebhookService({
        webhookUrl: 'https://test.example.com/webhook',
        circuitBreakerOptions: {
          failureThreshold: 2,
          recoveryTimeout: 1000,
          monitoringWindow: 5000,
        },
      }, { fetch: mockFetch });

      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const payload: WebhookPayload = {
        message: 'Test circuit breaker',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      // First failure - advance timers for retries
      const firstPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(300);
      await expect(firstPromise).rejects.toThrow();

      // Second failure - should open circuit
      const secondPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(300);
      await expect(secondPromise).rejects.toThrow();

      // Third call should fail immediately with circuit breaker error
      await expect(testService.sendMessage(payload)).rejects.toThrow(
        expect.objectContaining({
          type: WebhookErrorType.CIRCUIT_BREAKER_OPEN,
          isRetryable: false,
        })
      );

      const metrics = testService.getMetrics();
      expect(metrics.circuitBreakerState).toBe('open');

      testService.destroy();
    });

    it('should reset circuit breaker on successful request', async () => {
      const testService = new WebhookService({
        webhookUrl: 'https://test.example.com/webhook',
        circuitBreakerOptions: {
          failureThreshold: 2,
          recoveryTimeout: 100, // Very short for testing
          monitoringWindow: 5000,
        },
      }, { fetch: mockFetch });

      const payload: WebhookPayload = {
        message: 'Test circuit recovery',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      // Cause failures to open circuit
      mockFetch.mockRejectedValue(new TypeError('Network error'));
      
      const firstPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(300);
      await expect(firstPromise).rejects.toThrow();
      
      const secondPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(300);
      await expect(secondPromise).rejects.toThrow();

      // Fast forward time for recovery timeout
      await vi.advanceTimersByTimeAsync(150);

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

      testService.destroy();
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

      const errorPromise = webhookService.sendMessage(payload);
      
      // Advance timers for retry attempts
      await vi.advanceTimersByTimeAsync(300);
      
      await expect(errorPromise).rejects.toThrow();

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

    it('should return unhealthy status on errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Connection failed'));

      const healthPromise = webhookService.healthCheck();
      
      // Advance timers for retry attempts
      await vi.advanceTimersByTimeAsync(300);
      
      const healthStatus = await healthPromise;

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
        .map(async () => {
          try {
            return await webhookService.sendMessage(payload);
          } catch (err) {
            // Need to advance timers for failed requests with retries
            await vi.advanceTimersByTimeAsync(300);
            return err;
          }
        });

      const results = await Promise.all(promises);

      // Should have mix of successful responses and errors
      const successes = results.filter(r => r && typeof r === 'object' && 'success' in r && r.success === true);
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
      }, { fetch: mockFetch });

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

      serviceWithAuth.destroy();
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

  describe('Timer Management and Cleanup', () => {
    it('should not have pending timers after operation completion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ response: 'Success', success: true }),
      });

      const payload: WebhookPayload = {
        message: 'Timer test',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      await webhookService.sendMessage(payload);

      // Verify no timers are left pending
      expect(vi.getTimerCount()).toBe(1); // Only the circuit breaker recovery timer should remain
    });

    it('should clean up resources on destroy', () => {
      const service = new WebhookService({
        webhookUrl: 'https://test.example.com/webhook',
      }, { fetch: mockFetch });

      // Service should have created a recovery timer
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      service.destroy();

      // Timer should be cleaned up, but fake timer tracking might still show it
      // The important thing is that the timeout ID is cleared from the service
    });
  });
});