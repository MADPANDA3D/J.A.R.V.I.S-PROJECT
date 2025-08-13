/**
 * Minimal WebhookService test to debug timeout issues
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { WebhookErrorType, WebhookService } from '../webhookService';

describe('WebhookService Simple', () => {
  beforeAll(() => {
    // Prevent accidental global fetch usage
    // @ts-expect-error test guard
    globalThis.fetch = (() => {
      throw new Error('TEST used global fetch; inject via WebhookService deps');
    }) as typeof fetch;
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await vi.runOnlyPendingTimersAsync();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should throw validation error for missing webhook URL', async () => {
    const mockFetch = vi.fn();
    const service = new WebhookService(
      { webhookUrl: '', timeout: 200, retryConfig: { maxAttempts: 1, baseDelay: 50, maxDelay: 200, backoffFactor: 2.0, jitter: false }, circuitBreakerOptions: { failureThreshold: 3, recoveryTimeout: 1000, monitoringWindow: 5000 }, enableMetrics: true },
      { fetch: mockFetch }
    );

    await expect(service.sendMessage({ message: 'test', timestamp: new Date().toISOString(), userId: 'test' }))
      .rejects.toMatchObject({ type: WebhookErrorType.VALIDATION_ERROR });

    expect(mockFetch).not.toHaveBeenCalled();
    service.destroy();
  });

  it('should handle HTTP 400 error without retries', async () => {
    const mockFetch = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: vi.fn().mockResolvedValue({})
    } as Partial<Response>);

    const service = new WebhookService(
      { webhookUrl: 'https://example.test/webhook', timeout: 200, retryConfig: { maxAttempts: 1, baseDelay: 50, maxDelay: 200, backoffFactor: 2.0, jitter: false }, circuitBreakerOptions: { failureThreshold: 3, recoveryTimeout: 1000, monitoringWindow: 5000 }, enableMetrics: true },
      { fetch: mockFetch }
    );

    await expect(service.sendMessage({ message: 'test', timestamp: new Date().toISOString(), userId: 'test' }))
      .rejects.toMatchObject({ type: WebhookErrorType.HTTP_ERROR });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    service.destroy();
  });
});