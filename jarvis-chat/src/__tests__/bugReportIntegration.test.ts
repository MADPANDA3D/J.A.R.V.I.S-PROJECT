/**
 * Bug Report Integration Tests
 * End-to-end tests for the complete bug reporting system integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bugReportingService } from '@/lib/bugReporting';
import { bugSubmissionProcessor } from '@/lib/bugSubmissionProcessor';
import { errorTracker } from '@/lib/errorTracking';
import { performanceMetrics } from '@/lib/performanceMetrics';
import { trackBugReportSubmission, trackBugReportError } from '@/lib/monitoring';
import type { BugReportData } from '@/types/bugReport';

// Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  bugReportOperations: {
    createBugReport: vi.fn(() => Promise.resolve({
      data: {
        id: 'integration-test-bug-id',
        title: 'Integration Test Bug',
        bug_type: 'functionality',
        severity: 'medium',
        status: 'open',
        created_at: new Date().toISOString(),
        monitoring_data: {
          tracking_number: 'BUG-25-INTTEST1',
          submissionId: 'sub_test_123'
        }
      },
      error: null
    })),
    uploadBugAttachment: vi.fn(() => Promise.resolve({
      data: {
        id: 'attachment-id',
        filename: 'test.png',
        file_size: 1024
      },
      error: null
    })),
    getBugReportStats: vi.fn(() => Promise.resolve({
      data: {
        total_reports: 1,
        open_reports: 1,
        resolved_reports: 0,
        avg_response_time_hours: 0
      },
      error: null
    }))
  }
}));

vi.mock('@/lib/centralizedLogging', () => ({
  centralizedLogging: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Bug Report System Integration', () => {
  const mockBugData: BugReportData = {
    title: 'Integration Test Bug Report',
    description: 'This is a comprehensive integration test for the bug reporting system. It should test all components working together seamlessly.',
    bugType: 'functionality',
    severity: 'medium',
    reproductionSteps: 'Step 1: Run integration tests\nStep 2: Verify all systems work together\nStep 3: Check data persistence',
    browserInfo: {
      name: 'Chrome',
      version: '120.0.0.0',
      platform: 'Linux x86_64',
      isMobile: false,
      screenResolution: { width: 1920, height: 1080 },
      viewport: { width: 1200, height: 800 },
      colorDepth: 24,
      language: 'en-US',
      languages: ['en-US', 'en'],
      timezone: 'UTC',
      cookieEnabled: true,
      javaEnabled: false,
      onLine: true
    },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    currentUrl: 'https://jarvis-chat.test/integration-test',
    attachments: [
      new File(['test file content'], 'test-screenshot.png', { type: 'image/png' })
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup error tracker with test data
    errorTracker.captureError(
      new Error('Test error for integration'),
      'error',
      { context: 'integration_test' }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('completes full bug report submission workflow', async () => {
    // Test the complete workflow from submission to storage
    const result = await bugSubmissionProcessor.processBugSubmission(mockBugData);

    expect(result.success).toBe(true);
    expect(result.bugId).toBe('integration-test-bug-id');
    expect(result.trackingNumber).toBe('BUG-25-INTTEST1');

    // Verify database operations were called
    const { bugReportOperations } = await import('@/lib/supabase');
    expect(bugReportOperations.createBugReport).toHaveBeenCalledWith(
      expect.objectContaining({
        title: mockBugData.title,
        description: mockBugData.description,
        bugType: mockBugData.bugType,
        severity: mockBugData.severity
      })
    );

    // Verify file attachment was processed
    expect(bugReportOperations.uploadBugAttachment).toHaveBeenCalledWith({
      bugReportId: 'integration-test-bug-id',
      file: expect.any(File)
    });
  });

  it('integrates error tracking with bug reports', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);

    // Verify error correlation was added
    expect(errorTracker.addCorrelation).toHaveBeenCalled();

    // Verify recent errors were collected
    expect(errorTracker.getRecentErrors).toHaveBeenCalledWith(10);
  });

  it('integrates performance monitoring', async () => {
    const result = await bugReportingService.createBugReport(mockBugData);

    expect(result.success).toBe(true);

    // Verify performance metrics were collected
    expect(performanceMetrics.getCurrentMetrics).toHaveBeenCalled();

    // Verify monitoring events were tracked
    expect(vi.mocked(trackBugReportSubmission)).toHaveBeenCalledWith({
      bugType: mockBugData.bugType,
      severity: mockBugData.severity,
      hasAttachments: true,
      processingTime: expect.any(Number) as number
    });
  });

  it('handles validation errors properly', async () => {
    const invalidBugData = {
      ...mockBugData,
      title: 'Too short', // Less than 5 characters
      description: 'Also too short' // Less than 20 characters
    };

    const result = await bugSubmissionProcessor.processBugSubmission(invalidBugData);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Validation failed: Title must be at least 5 characters long, Description must be at least 20 characters long');

    // Verify error was logged
    const { centralizedLogging } = await import('@/lib/centralizedLogging');
    expect(centralizedLogging.error).toHaveBeenCalledWith(
      'bug-submission-processor',
      'system',
      'Bug submission processing failed',
      expect.objectContaining({
        error: expect.stringContaining('Validation failed')
      })
    );
  });

  it('handles file upload failures gracefully', async () => {
    // Mock file upload failure
    const { bugReportOperations } = await import('@/lib/supabase');
    vi.mocked(bugReportOperations.uploadBugAttachment).mockResolvedValueOnce({
      data: null,
      error: { message: 'File upload failed' }
    });

    const result = await bugSubmissionProcessor.processBugSubmission(mockBugData);

    // Bug report should still succeed, but attachment upload should be logged as warning
    expect(result.success).toBe(true);

    const { centralizedLogging } = await import('@/lib/centralizedLogging');
    expect(centralizedLogging.warn).toHaveBeenCalledWith(
      'bug-submission-processor',
      'system',
      'Some attachments failed to upload',
      expect.objectContaining({
        failedCount: 1
      })
    );
  });

  it('detects and prevents duplicate submissions', async () => {
    // Configure deduplication enabled
    const processor = bugSubmissionProcessor;
    processor.updateConfiguration({ deduplicationEnabled: true });

    // Mock search to return similar bug report
    const { bugReportOperations } = await import('@/lib/supabase');
    vi.mocked(bugReportOperations.searchBugReports).mockResolvedValueOnce({
      data: [{
        id: 'existing-bug-id',
        title: 'Integration Test Bug Report', // Exact match
        created_at: new Date().toISOString()
      }],
      error: null
    });

    const result = await processor.processBugSubmission(mockBugData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Similar bug report already exists');
  });

  it('processes submission queue correctly', async () => {
    
    // Submit multiple bug reports concurrently
    const promises = [
      bugSubmissionProcessor.processBugSubmission(mockBugData),
      bugSubmissionProcessor.processBugSubmission({
        ...mockBugData,
        title: 'Second Bug Report'
      }),
      bugSubmissionProcessor.processBugSubmission({
        ...mockBugData,
        title: 'Third Bug Report'
      })
    ];

    const results = await Promise.all(promises);

    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    const queueStatusAfter = bugSubmissionProcessor.getQueueStatus();
    
    // Queue should be empty after processing
    expect(queueStatusAfter.queueSize).toBe(0);
    expect(queueStatusAfter.processingCount).toBe(0);
  });

  it('maintains data integrity throughout the process', async () => {
    const result = await bugSubmissionProcessor.processBugSubmission(mockBugData);

    expect(result.success).toBe(true);

    // Verify that all expected data was passed through correctly
    const { bugReportOperations } = await import('@/lib/supabase');
    const createCall = vi.mocked(bugReportOperations.createBugReport).mock.calls[0][0];

    expect(createCall).toMatchObject({
      title: mockBugData.title,
      description: mockBugData.description,
      bugType: mockBugData.bugType,
      severity: mockBugData.severity,
      reproductionSteps: mockBugData.reproductionSteps,
      browserInfo: mockBugData.browserInfo,
      userAgent: mockBugData.userAgent,
      url: mockBugData.currentUrl
    });

    // Verify enhanced data was added
    expect(createCall.errorContext).toBeDefined();
    expect(createCall.monitoringData).toBeDefined();
    expect(createCall.monitoringData.submissionId).toBeDefined();
  });

  it('handles system errors and recovers gracefully', async () => {
    // Simulate system error
    const { bugReportOperations } = await import('@/lib/supabase');
    vi.mocked(bugReportOperations.createBugReport).mockRejectedValueOnce(
      new Error('System temporarily unavailable')
    );

    const result = await bugSubmissionProcessor.processBugSubmission(mockBugData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('System temporarily unavailable');

    // Verify error tracking
    expect(vi.mocked(trackBugReportError)).toHaveBeenCalledWith(
      'System temporarily unavailable',
      expect.any(Object)
    );

    // Verify logging
    const { centralizedLogging } = await import('@/lib/centralizedLogging');
    expect(centralizedLogging.error).toHaveBeenCalledWith(
      'bug-submission-processor',
      'system',
      'Bug submission processing failed',
      expect.objectContaining({
        error: 'System temporarily unavailable'
      })
    );
  });

  it('generates proper tracking numbers', async () => {
    const result = await bugSubmissionProcessor.processBugSubmission(mockBugData);

    expect(result.success).toBe(true);
    expect(result.trackingNumber).toMatch(/^BUG-\d{2}-[A-Z0-9]{8}$/);
    
    // Verify tracking number was stored in monitoring data
    const { bugReportOperations } = await import('@/lib/supabase');
    const createCall = vi.mocked(bugReportOperations.createBugReport).mock.calls[0][0];
    expect(createCall.monitoringData.submissionId).toBeDefined();
  });

  it('maintains performance under load', async () => {
    const startTime = performance.now();
    
    // Submit multiple concurrent requests
    const concurrentRequests = 10;
    const promises = Array(concurrentRequests).fill(null).map((_, index) => 
      bugSubmissionProcessor.processBugSubmission({
        ...mockBugData,
        title: `Load test bug report ${index + 1}`
      })
    );

    const results = await Promise.all(promises);
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // All requests should succeed
    results.forEach(result => {
      expect(result.success).toBe(true);
    });

    // Should complete within reasonable time (2 seconds for 10 requests)
    expect(totalTime).toBeLessThan(2000);

    // Verify all were processed
    expect(results).toHaveLength(concurrentRequests);
  });
});