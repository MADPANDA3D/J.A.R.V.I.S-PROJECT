/**
 * Setup validation tests
 * These tests ensure our test environment is properly configured
 */

import { describe, it, expect, vi } from 'vitest';

describe('Test Environment Setup', () => {
  it('should have global error function available', () => {
    expect(typeof error).toBe('function');
    expect(() => error('test error')).toThrow('test error');
  });

  it('should have global BugStatus enum available', () => {
    expect(BugStatus).toBeDefined();
    expect(BugStatus.OPEN).toBe('open');
    expect(BugStatus.IN_PROGRESS).toBe('in_progress');
    expect(BugStatus.RESOLVED).toBe('resolved');
    expect(BugStatus.CLOSED).toBe('closed');
  });

  it('should have global BugPriority enum available', () => {
    expect(BugPriority).toBeDefined();
    expect(BugPriority.LOW).toBe('low');
    expect(BugPriority.MEDIUM).toBe('medium');
    expect(BugPriority.HIGH).toBe('high');
    expect(BugPriority.CRITICAL).toBe('critical');
  });

  it('should have mocked console methods', () => {
    expect(vi.isMockFunction(console.log)).toBe(true);
    expect(vi.isMockFunction(console.error)).toBe(true);
    expect(vi.isMockFunction(console.warn)).toBe(true);
    expect(vi.isMockFunction(console.info)).toBe(true);
  });

  it('should have mocked browser APIs', () => {
    expect(typeof window.matchMedia).toBe('function');
    expect(typeof global.ResizeObserver).toBe('function');
    expect(typeof global.IntersectionObserver).toBe('function');
  });

  it('should have mocked storage APIs', () => {
    expect(typeof localStorage.getItem).toBe('function');
    expect(typeof sessionStorage.setItem).toBe('function');
    expect(vi.isMockFunction(localStorage.getItem)).toBe(true);
  });

  it('should have test environment variables set', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBe('test-key');
  });
});
