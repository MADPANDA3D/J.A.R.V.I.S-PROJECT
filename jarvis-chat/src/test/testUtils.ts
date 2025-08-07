/**
 * Test Utilities
 * Common utilities and helpers for testing
 */

import { vi } from 'vitest';

// Common error factory
export const createTestError = (message: string, code?: string) => {
  const error = new Error(message);
  if (code) {
    (error as Error & { code: string }).code = code;
  }
  return error;
};

// Mock implementations for common services
export const mockSupabaseOperations = {
  getBugReportById: vi.fn(),
  updateBugReport: vi.fn(),
  createBugReport: vi.fn(),
  deleteBugReport: vi.fn(),
  getBugReports: vi.fn(),
};

export const mockNotificationService = {
  sendNotification: vi.fn(),
  sendBugStatusUpdate: vi.fn(),
  sendAssignmentNotification: vi.fn(),
  sendEscalationAlert: vi.fn(),
};

export const mockBugLifecycleService = {
  changeBugStatus: vi.fn(),
  getStatusHistory: vi.fn(),
  validateStatusTransition: vi.fn(),
  escalateBug: vi.fn(),
};

export const mockAssignmentSystem = {
  assignBug: vi.fn(),
  autoAssignBug: vi.fn(),
  getAssignmentRecommendations: vi.fn(),
  calculateWorkloadMetrics: vi.fn(),
};

// Common test data factories
export const createMockBugReport = (overrides: unknown = {}) => ({
  id: 'test-bug-' + Math.random().toString(36).substr(2, 9),
  title: 'Test Bug Report',
  description: 'This is a test bug report',
  bug_type: 'functionality',
  severity: 'medium',
  status: 'open',
  user_id: 'test-user-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides: unknown = {}) => ({
  id: 'test-user-' + Math.random().toString(36).substr(2, 9),
  email: 'test@example.com',
  name: 'Test User',
  role: 'developer',
  team: 'frontend',
  workload: 3,
  skills: ['react', 'typescript'],
  available: true,
  ...overrides,
});

// Setup function to reset all mocks
export const resetAllMocks = () => {
  Object.values(mockSupabaseOperations).forEach(mock => mock.mockReset());
  Object.values(mockNotificationService).forEach(mock => mock.mockReset());
  Object.values(mockBugLifecycleService).forEach(mock => mock.mockReset());
  Object.values(mockAssignmentSystem).forEach(mock => mock.mockReset());
};

// Common async test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const waitForCondition = async (
  condition: () => boolean, 
  timeout = 5000, 
  interval = 100
): Promise<void> => {
  const start = Date.now();
  while (!condition() && Date.now() - start < timeout) {
    await waitFor(interval);
  }
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};
