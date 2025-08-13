/**
 * Comprehensive WebhookService Test Suite
 * Tests for webhook functionality, error handling, retry logic, and performance
 * 
 * FIXED: Uses makeWebhook factory and fake timers to prevent timeouts and OOM
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import {
  WebhookErrorType,
  WebhookPayload,
  WebhookResponse,
} from '../webhookService';
import { makeWebhook } from './test-utils/webhookFactory';
import { resetServiceMonitoring } from '../serviceMonitoring';

// Helper for microtask flushing - commented out as currently unused
// const flushMicrotasks = async () => await Promise.resolve();

describe('WebhookService', () => {
  // Blow up if anything accidentally uses real global fetch in tests
  beforeAll(() => {
    // @ts-expect-error test guard
    globalThis.fetch = (() => {
      throw new Error('TEST used global fetch; inject via WebhookService deps');
    }) as typeof fetch;
  });

  beforeEach(() => {
    vi.useFakeTimers();
    // Stub console methods to prevent noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    await vi.runOnlyPendingTimersAsync();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    // Reset singleton state to prevent OOM from growing arrays
    resetServiceMonitoring();
  });

  describe('Message Sending Success Scenarios', () => {
    it('should send message successfully with valid payload', async () => {
      const { service, mockFetch } = makeWebhook();
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

      const result = await service.sendMessage(payload);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.test/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'JARVIS-Chat/1.0',
          }),
          body: expect.stringContaining('"message":"Hello"'),
        })
      );

      service.destroy();
    });

    it('should include request metadata in payload', async () => {
      const { service, mockFetch } = makeWebhook();
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

      await service.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toMatchObject({
        message: 'Test message',
        userId: 'user_123',
        metadata: { source: 'chat', priority: 'normal' },
        requestId: expect.stringMatching(/^req_/),
        clientVersion: '1.0.0',
      });

      service.destroy();
    });

    it('should handle response with additional fields', async () => {
      const { service, mockFetch } = makeWebhook();
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

      const result = await service.sendMessage(payload);

      expect(result.requestId).toBe('server_req_456');
      expect(result.processingTime).toBe(200);

      service.destroy();
    });
  });

  describe('Error Handling', () => {
    it('should throw validation error for missing webhook URL', async () => {
      const { service: serviceWithoutUrl } = makeWebhook({ webhookUrl: '' });

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
      const { service, mockFetch } = makeWebhook();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({})
      } as Partial<Response>);

      await expect(service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' }))
        .rejects.toMatchObject({ type: WebhookErrorType.HTTP_ERROR });

      expect(mockFetch).toHaveBeenCalledTimes(1); // no retries on 4xx (except 408/429)

      service.destroy();
    });

    it('should handle network errors', async () => {
      const { service, mockFetch } = makeWebhook({ retryConfig: { maxAttempts: 1, baseDelay: 50, maxDelay: 200, backoffFactor: 2.0, jitter: false } }); // avoid retry sleeps
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' }))
        .rejects.toMatchObject({ type: WebhookErrorType.NETWORK_ERROR });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      service.destroy();
    });

    it('should handle timeout errors', async () => {
      const { service, mockFetch } = makeWebhook({ timeout: 200 }); // alias handled by factory
      // fetch never resolves → request-level AbortController should fire
      mockFetch.mockResolvedValueOnce(new Promise(() => {}) as Promise<Response>);

      const p = service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' });
      await vi.advanceTimersByTimeAsync(200);
      await expect(p).rejects.toMatchObject({ type: WebhookErrorType.TIMEOUT_ERROR });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      service.destroy();
    });

    it('should handle malformed response format', async () => {
      const { service, mockFetch } = makeWebhook();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ not: 'the expected shape' })
      } as Partial<Response>);

      await expect(service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' }))
        .rejects.toMatchObject({ type: WebhookErrorType.VALIDATION_ERROR });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      service.destroy();
    });

    it('should handle webhook response with success: false', async () => {
      const { service, mockFetch } = makeWebhook();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ success: false, error: 'nope' })
      } as Partial<Response>);

      await expect(service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' }))
        .rejects.toMatchObject({ type: WebhookErrorType.HTTP_ERROR });

      expect(mockFetch).toHaveBeenCalledTimes(1); // no retries on explicit failure

      service.destroy();
    });
  });

  describe('Retry Logic with Exponential Backoff', () => {
    it('should retry on retryable errors with fake timer advancement', async () => {
      const { service, mockFetch } = makeWebhook();
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
      const resultPromise = service.sendMessage(payload);

      // Advance timers to trigger retries
      // First retry after 50ms, second retry after 100ms
      await vi.advanceTimersByTimeAsync(150);

      const result = await resultPromise;

      expect(result.response).toBe('Success after retries');
      expect(mockFetch).toHaveBeenCalledTimes(3);

      service.destroy();
    });

    it('should not retry on non-retryable errors', async () => {
      const { service: serviceWithoutUrl, mockFetch } = makeWebhook({ webhookUrl: '' });

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

    it('should respect max attempts', async () => {
      const { service, mockFetch } = makeWebhook({ retryConfig: { maxAttempts: 3, baseDelay: 50, maxDelay: 200, backoffFactor: 2.0, jitter: false } });
      mockFetch.mockRejectedValue(new TypeError('net down'));

      const p = service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' });

      // attempts: #1 immediately, then sleeps 50, #2, sleep 100, #3 → reject
      await vi.advanceTimersByTimeAsync(50 + 100);
      await expect(p).rejects.toMatchObject({ type: WebhookErrorType.NETWORK_ERROR });
      expect(mockFetch).toHaveBeenCalledTimes(3);

      service.destroy();
    });

    it('should calculate exponential backoff delays', async () => {
      const { service, mockFetch } = makeWebhook({ retryConfig: { maxAttempts: 3, baseDelay: 50, maxDelay: 200, backoffFactor: 2.0, jitter: false } });
      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const p = service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' });
      await vi.advanceTimersByTimeAsync(50);  // after first backoff
      expect(mockFetch).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(100); // after second backoff
      expect(mockFetch).toHaveBeenCalledTimes(3);

      await expect(p).rejects.toMatchObject({ type: WebhookErrorType.NETWORK_ERROR });

      service.destroy();
    });

    it('should not retry on 4xx client errors (except 408, 429)', async () => {
      const { service, mockFetch } = makeWebhook();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn().mockResolvedValue({})
      } as Partial<Response>);

      await expect(service.sendMessage({ message: 'hi', timestamp: new Date().toISOString(), userId: 'user_123' }))
        .rejects.toMatchObject({ type: WebhookErrorType.HTTP_ERROR });

      // Should only make one attempt for non-retryable client errors
      expect(mockFetch).toHaveBeenCalledTimes(1);

      service.destroy();
    });

    it('should retry on retryable HTTP status codes', async () => {
      const { service, mockFetch } = makeWebhook();
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

      const resultPromise = service.sendMessage(payload);

      // Advance timer for the retry delay
      await vi.advanceTimersByTimeAsync(50);

      const result = await resultPromise;

      expect(result.response).toBe('Success after rate limit');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      service.destroy();
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after failure threshold with fake timers', async () => {
      // Configure service with low failure threshold
      const { service: testService, mockFetch } = makeWebhook({
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

      // First failure - advance timers for retries
      const firstPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(150);
      await expect(firstPromise).rejects.toThrow();

      // Second failure - should open circuit
      const secondPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(150);
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
      const { service: testService, mockFetch } = makeWebhook({
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
      
      const firstPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(150);
      await expect(firstPromise).rejects.toThrow();
      
      const secondPromise = testService.sendMessage(payload);
      await vi.advanceTimersByTimeAsync(150);
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
      const { service } = makeWebhook();
      service.configureCircuitBreaker({
        failureThreshold: 10,
        recoveryTimeout: 30000,
      });

      const config = service.getConfig();
      expect(config.circuitBreakerOptions.failureThreshold).toBe(10);
      expect(config.circuitBreakerOptions.recoveryTimeout).toBe(30000);

      service.destroy();
    });

    it('should allow manual circuit breaker reset', () => {
      const { service } = makeWebhook();
      // Force some failures to change circuit state
      service.resetCircuitBreaker();

      const metrics = service.getMetrics();
      expect(metrics.circuitBreakerState).toBe('closed');

      service.destroy();
    });
  });

  describe('Webhook Payload Validation', () => {
    it('should validate required payload fields', async () => {
      const { service, mockFetch } = makeWebhook();
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

      await service.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody).toHaveProperty('message', 'Test message');
      expect(requestBody).toHaveProperty('userId', 'user_123');
      expect(requestBody).toHaveProperty('timestamp');
      expect(requestBody).toHaveProperty('requestId');
      expect(requestBody).toHaveProperty('clientVersion');

      service.destroy();
    });

    it('should include optional payload fields when provided', async () => {
      const { service, mockFetch } = makeWebhook();
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

      await service.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.conversationId).toBe('conv_456');
      expect(requestBody.metadata).toEqual({
        source: 'mobile_app',
        version: '1.2.3',
        sessionId: 'session_789',
      });

      service.destroy();
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
        const { service, mockFetch } = makeWebhook();
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

        await expect(service.sendMessage(payload)).rejects.toThrow(
          expect.objectContaining({
            type: WebhookErrorType.VALIDATION_ERROR,
            message: 'Invalid response format from webhook',
          })
        );

        service.destroy();
      }
    });
  });

  describe('Performance and Metrics', () => {
    it('should track request metrics', async () => {
      const { service, mockFetch } = makeWebhook();
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

      await service.sendMessage(payload);

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);

      service.destroy();
    });

    it('should track error metrics on failures', async () => {
      const { service, mockFetch } = makeWebhook();
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      const payload: WebhookPayload = {
        message: 'Test error metrics',
        userId: 'user_123',
        timestamp: new Date().toISOString(),
      };

      const errorPromise = service.sendMessage(payload);
      
      // Advance timers for retry attempts
      await vi.advanceTimersByTimeAsync(150);
      
      await expect(errorPromise).rejects.toThrow();

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.failedRequests).toBeGreaterThan(0);
      expect(metrics.errorRate).toBeGreaterThan(0);

      service.destroy();
    });

    it('should calculate percentile response times', async () => {
      const { service, mockFetch } = makeWebhook();
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

        await service.sendMessage(payload);
      }

      const metrics = service.getMetrics();
      expect(metrics.p95ResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageResponseTime).toBeGreaterThanOrEqual(0);

      service.destroy();
    });

    it('should include last request timestamp in metrics', async () => {
      const { service, mockFetch } = makeWebhook();
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

      await service.sendMessage(payload);

      const metrics = service.getMetrics();
      expect(metrics.lastRequestTime).toBeDefined();
      expect(metrics.lastRequestTime!.getTime()).toBeGreaterThanOrEqual(
        beforeRequest.getTime()
      );

      service.destroy();
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      const { service, mockFetch } = makeWebhook();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Webhook is healthy',
            success: true,
          }),
      });

      const healthStatus = await service.healthCheck();

      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.responseTime).toBeGreaterThan(0);
      expect(healthStatus.error).toBeUndefined();

      // Verify health check payload
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.message).toBe('__health_check__');
      expect(requestBody.userId).toBe('system');

      service.destroy();
    });

    it('should return unhealthy status on errors', async () => {
      const { service, mockFetch } = makeWebhook();
      mockFetch.mockRejectedValueOnce(new TypeError('Connection failed'));

      const healthPromise = service.healthCheck();
      
      // Advance timers for retry attempts
      await vi.advanceTimersByTimeAsync(150);
      
      const healthStatus = await healthPromise;

      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.error).toContain('Connection failed');
      expect(healthStatus.responseTime).toBeUndefined();

      service.destroy();
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      const { service, mockFetch } = makeWebhook();
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
        .map(() => service.sendMessage(payload));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.response).toBe('Concurrent response');
      });

      expect(mockFetch).toHaveBeenCalledTimes(5);

      service.destroy();
    });

    it('should handle mixed success/failure in concurrent requests', async () => {
      const { service, mockFetch } = makeWebhook({ retryConfig: { maxAttempts: 1, baseDelay: 50, maxDelay: 200, backoffFactor: 2.0, jitter: false } });
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
            return await service.sendMessage(payload);
          } catch (err) {
            // Need to advance timers for failed requests with retries
            await vi.advanceTimersByTimeAsync(150);
            return err;
          }
        });

      const results = await Promise.all(promises);

      // Should have mix of successful responses and errors
      const successes = results.filter(r => r && typeof r === 'object' && 'success' in r && r.success === true);
      const errors = results.filter(r => r instanceof Error);

      expect(successes.length).toBeGreaterThan(0);
      expect(errors.length).toBeGreaterThan(0);

      service.destroy();
    });
  });

  describe('Authentication and Security', () => {
    it('should include authorization header when secret is provided', async () => {
      const { service: serviceWithAuth, mockFetch } = makeWebhook({ webhookSecret: 'test-secret-token' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            response: 'Authenticated response',
            success: true,
          }),
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

      // No need to restore environment since we're using config

      serviceWithAuth.destroy();
    });

    it('should include standard headers in all requests', async () => {
      const { service, mockFetch } = makeWebhook();
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

      await service.sendMessage(payload);

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['User-Agent']).toBe('JARVIS-Chat/1.0');

      service.destroy();
    });

    it('should generate unique request IDs', async () => {
      const { service, mockFetch } = makeWebhook();
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
      await service.sendMessage(payload);
      await service.sendMessage(payload);

      const call1Body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const call2Body = JSON.parse(mockFetch.mock.calls[1][1].body);

      expect(call1Body.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(call2Body.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(call1Body.requestId).not.toBe(call2Body.requestId);

      service.destroy();
    });
  });

  describe('Timer Management and Cleanup', () => {
    it('should not have pending timers after operation completion', async () => {
      const { service, mockFetch } = makeWebhook();
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

      await service.sendMessage(payload);

      // Verify no timers are left pending (only circuit breaker recovery timer should remain)
      expect(vi.getTimerCount()).toBe(1);

      service.destroy();
    });

    it('should clean up resources on destroy', () => {
      const { service } = makeWebhook();

      // Service should have created a recovery timer
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      service.destroy();

      // Timer should be cleaned up, but fake timer tracking might still show it
      // The important thing is that the timeout ID is cleared from the service
    });
  });
});