/**
 * Time utilities for safe timeout handling and duration clamping
 * Prevents timer overflow warnings and provides cancelable sleep functionality
 */

// Maximum safe timeout value for setTimeout (2^31-1 ms)
export const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * Clamp delay to prevent timer overflow
 */
export function clampDelay(ms: number): number {
  return Math.max(0, Math.min(ms, MAX_TIMEOUT_MS));
}

/**
 * Safe sleep function that respects AbortSignal and clamps delays
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const delay = clampDelay(ms);
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delay);

    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal?.aborted) {
      clearTimeout(timeoutId);
      return onAbort();
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Safe setTimeout wrapper that clamps delays
 */
export function safeSetTimeout(callback: () => void, ms: number): ReturnType<typeof setTimeout> {
  const clampedMs = clampDelay(ms);
  return setTimeout(callback, clampedMs);
}