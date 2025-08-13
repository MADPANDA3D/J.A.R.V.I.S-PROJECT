/**
 * Safe logging utilities to prevent OOM from JSON.stringify
 */

/**
 * Safe JSON stringify that truncates large objects and handles circular references
 */
export function safeStringify(obj: unknown, limit = 10_000): string {
  try {
    const seen = new WeakSet();
    const s = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
        
        // Convert Map to object for serialization
        if (value instanceof Map) {
          return Object.fromEntries(value);
        }
      }
      return value;
    });
    
    return s.length > limit ? s.slice(0, limit) + '…[truncated]' : s;
  } catch (error) {
    return `[Stringify Error: ${(error as Error).message}]`;
  }
}

/**
 * Create minimal error object to prevent circular references and OOM
 */
export function minimalError(error: unknown): Record<string, unknown> {
  if (!error || typeof error !== 'object') {
    return { message: String(error) };
  }
  
  const err = error as Record<string, unknown>;
  return {
    name: err.name,
    message: err.message,
    code: err.code,
    ...(err.status && { status: err.status })
  };
}

/**
 * Check if we're in test environment to avoid noisy logging
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
}