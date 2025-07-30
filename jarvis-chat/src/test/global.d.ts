/**
 * Global type definitions for test environment
 */

declare global {
  // Global error function
  function error(message: string): never;

  // Bug status enum
  const BugStatus: {
    readonly OPEN: 'open';
    readonly IN_PROGRESS: 'in_progress';
    readonly RESOLVED: 'resolved';
    readonly CLOSED: 'closed';
    readonly VERIFIED: 'verified';
    readonly ASSIGNED: 'assigned';
    readonly TESTING: 'testing';
  };

  // Bug priority enum
  const BugPriority: {
    readonly LOW: 'low';
    readonly MEDIUM: 'medium';
    readonly HIGH: 'high';
    readonly CRITICAL: 'critical';
    readonly URGENT: 'urgent';
  };

  // Test environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'test' | 'development' | 'production';
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      VITE_WEBHOOK_URL?: string;
      VITE_N8N_WEBHOOK_URL?: string;
    }
  }

  // Console mocks
  interface Console {
    log: import('vi').MockedFunction<typeof console.log>;
    debug: import('vi').MockedFunction<typeof console.debug>;
    info: import('vi').MockedFunction<typeof console.info>;
    warn: import('vi').MockedFunction<typeof console.warn>;
    error: import('vi').MockedFunction<typeof console.error>;
  }
}

export {};
