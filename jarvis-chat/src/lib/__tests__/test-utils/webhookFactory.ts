/**
 * Webhook Test Factory
 * Guarantees service uses injected fetch in every test to prevent timeout issues
 */

import { vi } from 'vitest';
import { WebhookService, type WebhookServiceConfig } from '../../webhookService';

export const makeWebhook = (cfg: Partial<WebhookServiceConfig> = {}, deps?: { fetch?: typeof fetch }) => {
  const mockFetch = deps?.fetch ?? vi.fn();
  const service = new WebhookService(
    {
      webhookUrl: 'https://example.test/webhook',
      timeout: 200,           // small so fake timers don't need huge jumps
      retryConfig: {
        maxAttempts: 3,
        baseDelay: 50,        // small delays for fast testing
        maxDelay: 200,
        backoffFactor: 2.0,
        jitter: false,        // disable jitter for predictable testing
      },
      circuitBreakerOptions: {
        failureThreshold: 3,
        recoveryTimeout: 1000, // short recovery for testing
        monitoringWindow: 5000,
      },
      enableMetrics: true,
      ...cfg,
    },
    { fetch: mockFetch }
  );
  return { service, mockFetch };
};