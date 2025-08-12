/**
 * Bug Reporting Service Tests
 * Tests for the core bug reporting functionality and integrations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bugReportingService } from '../bugReporting';
import type { BugReportData } from '@/types/bugReport';

// Mock dependencies
vi.mock('../centralizedLogging', () => ({
  centralizedLogging: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../errorTracking', () => ({
  errorTracker: {
    getRecentErrors: vi.fn(() => [
      {
        errorId: 'error-1',
        timestamp: new Date().toISOString(),
        message: 'Test error',
        stack: 'Error stack trace',
        severity: 'high',
        category: 'javascript'
      }
    ]),
    getSessionId: vi.fn(() => 'test-session-id'),
    addCorrelation: vi.fn()
  }
}));

vi.mock('../performanceMetrics', () => ({
  performanceMetrics: {
    getCurrentMetrics: vi.fn(() => ({
      timestamp: new Date().toISOString(),
      apiResponseTimes: {
        avg: 150,
        p50: 120,
        p95: 300,
        p99: 500,
        min: 50,
        max: 1000
      },
      systemResources: {
        cpuUsage: 45,
        memoryUsage: 60,
        diskUsage: 30,
        networkTraffic: 25
      },
      errorRates: {
        clientErrors: 2,
        serverErrors: 1,
        authErrors: 0,
        totalErrors: 3
      }
    })),
    getActiveAlerts: vi.fn(() => [])
  }
}));

vi.mock('../supabase', () => ({
  bugReportOperations: {
    createBugReport: vi.fn(() => Promise.resolve({
      data: {
        id: 'test-bug-id',
        monitoring_data: {
          tracking_number: 'BUG-25-12345678'
        }
      },
      error: null
    }))
  }
}));

describe('BugReportingService', () => {
  const mockBugData: BugReportData = {
    title: 'Test Bug Report',
    description: 'This is a test bug report description with sufficient length to meet validation requirements.',
    bugType: 'functionality',
    severity: 'medium',
    reproductionSteps: 'Step 1: Do something\nStep 2: Observe the issue',
    browserInfo: {
      name: 'Chrome',
      version: '120.0.0.0',
      platform: 'MacIntel',
      isMobile: false,
      screenResolution: { width: 1920, height: 1080 },
      viewport: { width: 1200, height: 800 },
      colorDepth: 24,
      language: 'en-US',
      languages: ['en-US', 'en'],
      timezone: 'America/New_York',
      cookieEnabled: true,
      javaEnabled: false,
      onLine: true
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    currentUrl: 'https://jarvis-chat.example.com/test'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates bug report successfully', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);
    expect(result.bugId).toBe('test-bug-id');
    expect(result.trackingNumber).toBe('BUG-25-12345678');
    expect(result.message).toBe('Bug report submitted successfully');
  });

  it('collects enhanced error context', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);
    
    // Verify that error tracking methods were called
    const { errorTracker } = await import('../errorTracking');
    expect(errorTracker.getRecentErrors).toHaveBeenCalledWith(10);
    expect(errorTracker.addCorrelation).toHaveBeenCalled();
  });

  it('integrates with performance metrics', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);
    
    // Verify that performance metrics were collected
    const { performanceMetrics } = await import('../performanceMetrics');
    expect(performanceMetrics.getCurrentMetrics).toHaveBeenCalled();
  });

  it('handles database submission errors', async () => {
    const { bugReportOperations } = await import('../supabase');
    vi.mocked(bugReportOperations.createBugReport).mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' }
    });

    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Database error');
  });

  it('logs submission activity', async () => {
    await bugReportingService.createBugReport(mockBugData);

    const { centralizedLogging } = await import('../centralizedLogging');
    expect(centralizedLogging.info).toHaveBeenCalledWith(
      'bug-reporting',
      'system',
      'Starting bug report creation',
      expect.objectContaining({
        bugType: 'functionality',
        severity: 'medium'
      })
    );
  });

  it('handles missing browser info gracefully', async () => {
    const bugDataWithoutBrowser = {
      ...mockBugData,
      browserInfo: undefined
    };

    // Should still create the bug report but collect browser info automatically
    const result = await bugReportingService.createBugReport(bugDataWithoutBrowser as any);
    expect(result.success).toBe(true);
  });

  it('correlates bug reports with errors', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);
    
    const { errorTracker } = await import('../errorTracking');
    expect(errorTracker.addCorrelation).toHaveBeenCalledWith(
      'error-1',
      expect.objectContaining({
        type: 'bug_report',
        id: 'test-bug-id'
      })
    );
  });

  it('generates correlation IDs for tracking', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);
    
    // Verify that correlation ID was generated and logged
    const { centralizedLogging } = await import('../centralizedLogging');
    expect(centralizedLogging.info).toHaveBeenCalledWith(
      'bug-reporting',
      'system',
      'Bug report created successfully',
      expect.objectContaining({
        bugId: 'test-bug-id',
        trackingNumber: 'BUG-25-12345678'
      })
    );
  });

  it('handles network errors gracefully', async () => {
    const { bugReportOperations } = await import('../supabase');
    vi.mocked(bugReportOperations.createBugReport).mockRejectedValueOnce(
      new Error('Network error')
    );

    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Network error');
    
    // Should log the error
    const { centralizedLogging } = await import('../centralizedLogging');
    expect(centralizedLogging.error).toHaveBeenCalledWith(
      'bug-reporting',
      'system',
      'Failed to create bug report',
      expect.objectContaining({
        error: expect.stringContaining('Network error')
      })
    );
  });

  it('collects comprehensive monitoring data', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);
    
    // Verify monitoring data collection
    const { bugReportOperations } = await import('../supabase');
    const createCall = vi.mocked(bugReportOperations.createBugReport).mock.calls[0][0];
    
    expect(createCall.monitoringData).toBeDefined();
    expect(createCall.monitoringData.timestamp).toBeDefined();
    expect(createCall.monitoringData.performanceMetrics).toBeDefined();
    expect(createCall.monitoringData.systemResources).toBeDefined();
  });
});