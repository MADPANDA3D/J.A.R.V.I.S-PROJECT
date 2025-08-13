import { describe, it, expect, vi } from 'vitest';

describe('Minimal Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with fake timers', async () => {
    vi.useFakeTimers();
    
    let resolved = false;
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolved = true;
        resolve(true);
      }, 1000);
    });

    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    expect(resolved).toBe(true);
    vi.useRealTimers();
  });

  it('should import WebhookService', async () => {
    const { WebhookService } = await import('../webhookService');
    expect(WebhookService).toBeDefined();
  });
});