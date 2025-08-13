/**
 * Webhook Test Factory
 * Guarantees service uses injected fetch in every test to prevent timeout issues
 * Maps legacy timeout parameter to correct service configuration
 */

import { vi } from 'vitest';
import { WebhookService, type WebhookServiceConfig } from '../../webhookService';

type PartialCfg = Partial<WebhookServiceConfig> & { timeout?: number };

export const makeWebhook = (cfg: PartialCfg = {}, deps?: { fetch?: typeof fetch }) => {
  const mockFetch = deps?.fetch ?? vi.fn();

  // Map legacy alias -> real config key
  const {
    timeout,
    ...rest
  } = cfg;

  const service = new WebhookService(
    {
      webhookUrl: 'https://example.test/webhook',
      timeout: timeout ?? 200,  // Use the timeout parameter directly (matches service expectation)
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
      ...rest,
    } as WebhookServiceConfig,
    { fetch: mockFetch }
  );
  return { service, mockFetch };
};