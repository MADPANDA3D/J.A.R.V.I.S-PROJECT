import { vi, afterEach, afterAll } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { createTestError } from './testUtils';

// Global error function for tests
(global as unknown as { error: (message: string) => void }).error = (message: string) => {
  throw createTestError(message);
};

// Define BugStatus enum globally for tests
(global as unknown as { BugStatus: typeof BugStatus }).BugStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  VERIFIED: 'verified',
  ASSIGNED: 'assigned',
  TESTING: 'testing'
} as const;

// Define BugPriority enum globally for tests
(global as unknown as { BugPriority: typeof BugPriority }).BugPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  URGENT: 'urgent'
} as const;

// Mock console methods to prevent noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock environment variables for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Safety net: Make accidental global fetch usage blow up loudly in tests
globalThis.fetch = (() => {
  throw new Error('TEST used global fetch; inject a mock via WebhookService deps');
}) as typeof fetch;

// Timeout overflow protection sentinel - temporarily disabled to avoid vitest timer conflicts
// TODO: Re-enable after fixing timer mock conflicts
// import { MAX_TIMEOUT_MS } from '../lib/time';
// const realSetTimeout = global.setTimeout;
// vi.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void, ms?: number, ...args: unknown[]) => {
//   if (typeof ms === 'number' && ms > MAX_TIMEOUT_MS) {
//     throw new Error(`Timeout overflow scheduled: ${ms}`);
//   }
//   return realSetTimeout(fn, ms as number, ...args);
// }) as typeof setTimeout);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Make a writable global for tests that reassign it (secrets-management.test.ts)
(globalThis as unknown as { secretsManager: unknown }).secretsManager = undefined;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
process.env.VITE_N8N_WEBHOOK_URL = 'https://n8n.madpanda3d.com/webhook/4bed7e4e-041a-4f19-b736-d320250a50ca';

// Mock import.meta.env for Vite environment variables
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
      VITE_N8N_WEBHOOK_URL: 'https://n8n.madpanda3d.com/webhook/4bed7e4e-041a-4f19-b736-d320250a50ca',
      NODE_ENV: 'test',
      MODE: 'test'
    }
  }
});

// Global test cleanup hooks for proper resource management
afterEach(() => {
  // Clean up React DOM
  cleanup();
  
  // Clear all mocks and timers
  vi.clearAllMocks();
  vi.clearAllTimers();
  
  // Clear any remaining local/session storage
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Force cleanup and exit after all tests
afterAll(async () => {
  // Clear all global mocks
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  
  // Clear timers
  vi.clearAllTimers();
  vi.runOnlyPendingTimers();
  
  // Allow brief moment for cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
});
