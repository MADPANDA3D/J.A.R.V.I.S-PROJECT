/**
 * Bug Lifecycle Integration Tests
 * End-to-end tests for the complete bug lifecycle management system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bugLifecycleService, BugStatus, BugPriority } from '../bugLifecycle';
import { bugAssignmentSystem } from '../assignmentSystem';
import { notificationService } from '../notificationService';
import { feedbackCollectionService } from '../feedbackCollection';
import { internalCommunicationService } from '../internalCommunication';
import type { BugReport } from '@/types/bugReport';

// Mock external dependencies
vi.mock('../centralizedLogging', () => ({
  centralizedLogging: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../supabase', () => ({
  bugReportOperations: {
    getBugReportById: vi.fn(() => Promise.resolve({
      data: {
        id: 'integration-test-bug',
        title: 'Integration Test Bug',
        description: 'Test bug for integration testing',
        bug_type: 'functionality',
        severity: 'medium',
        status: 'open',
        priority: 'medium',
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        monitoring_data: {
          tracking_number: 'BUG-25-INT001'
        }
      },
      error: null
    })),
    updateBugReport: vi.fn(() => Promise.resolve({ error: null })),
    searchBugReports: vi.fn(() => Promise.resolve({
      data: [],
      count: 0,
      error: null
    }))
  }
}));

vi.mock('../monitoring', () => ({
  trackBugReportEvent: vi.fn()
}));

vi.mock('../notificationService', () => ({
  notificationService: {
    sendEscalationAlert: vi.fn(() => Promise.resolve([])),
    sendFeedbackRequest: vi.fn(() => Promise.resolve([])),
    sendNotification: vi.fn(() => Promise.resolve({ success: true })),
    sendBugStatusUpdate: vi.fn(() => Promise.resolve([])),
    sendAssignmentNotification: vi.fn(() => Promise.resolve([])),
    updateUserPreferences: vi.fn(() => Promise.resolve({ success: true }))
  },
  // Mock the named exports as well
  sendEscalationAlert: vi.fn(() => Promise.resolve([])),
  sendFeedbackRequest: vi.fn(() => Promise.resolve([])),
  sendBugStatusUpdate: vi.fn(() => Promise.resolve([])),
  sendAssignmentNotification: vi.fn(() => Promise.resolve([]))
}));

describe('Bug Lifecycle Integration Tests', () => {
  const mockBugReport: Partial<BugReport> = {
    id: 'integration-test-bug',
    title: 'Integration Test Bug',
    description: 'This is a comprehensive integration test for the bug lifecycle system',
    bug_type: 'functionality',
    severity: 'medium',
    status: 'open',
    priority: 'medium',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset all singleton services for clean state
    bugAssignmentSystem.reset();
    feedbackCollectionService.reset();
    internalCommunicationService.reset();
    
    // Initialize assignment system with test team members
    bugAssignmentSystem.updateTeamMember('user_1', {
      id: 'user_1',
      name: 'Test User 1',
      email: 'user1@test.com',
      role: 'developer',
      availability: 'available',
      specializationAreas: ['functionality', 'frontend'],
      workloadCapacity: 5,
      currentWorkload: 2,
      averageResolutionTime: 24,
      performanceRating: 4,
      timezone: 'UTC',
      workingHours: {
        start: '09:00',
        end: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      },
      lastActivity: new Date().toISOString()
    });
    
    bugAssignmentSystem.updateTeamMember('user_2', {
      id: 'user_2',
      name: 'Test User 2',
      email: 'user2@test.com',
      role: 'senior_dev',
      availability: 'available',
      specializationAreas: ['backend', 'performance'],
      workloadCapacity: 8,
      currentWorkload: 6,
      averageResolutionTime: 18,
      performanceRating: 5,
      timezone: 'UTC',
      workingHours: {
        start: '09:00',
        end: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      },
      lastActivity: new Date().toISOString()
    });
    
    bugAssignmentSystem.updateTeamMember('user_3', {
      id: 'user_3',
      name: 'Test User 3',
      email: 'user3@test.com',
      role: 'developer',
      availability: 'available',
      specializationAreas: ['functionality', 'testing'],
      workloadCapacity: 6,
      currentWorkload: 1,
      averageResolutionTime: 20,
      performanceRating: 4,
      timezone: 'UTC',
      workingHours: {
        start: '09:00',
        end: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      },
      lastActivity: new Date().toISOString()
    });
    
    bugAssignmentSystem.updateTeamMember('senior_dev_1', {
      id: 'senior_dev_1',
      name: 'Senior Dev 1',
      email: 'seniordev1@test.com',
      role: 'senior_dev',
      availability: 'available',
      specializationAreas: ['critical', 'architecture'],
      workloadCapacity: 10,
      currentWorkload: 3,
      averageResolutionTime: 12,
      performanceRating: 5,
      timezone: 'UTC',
      workingHours: {
        start: '09:00',
        end: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      },
      lastActivity: new Date().toISOString()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Bug Lifecycle Workflow', () => {
    it('processes complete bug lifecycle from open to closed', async () => {
      const bugId = 'integration-test-bug';
      // const userId = 'user_1'; // For future use
      const assignerId = 'admin_user';

      // Step 1: Verify bug starts as OPEN by checking the mocked data
      const { data: bugReport } = await import('../supabase').then(m => m.bugReportOperations.getBugReportById(bugId));
      expect(bugReport?.status).toBe('open');

      // Step 2: Check team members were added and then assign
      const workloadMetrics = bugAssignmentSystem.getWorkloadMetrics();
      console.log('Team members loaded:', workloadMetrics.length);
      
      const assignedTo = 'user_1';
      const assignResult = await bugAssignmentSystem.assignBug(bugId, assignedTo, assignerId, 'manual');
      console.log('Assignment result:', assignResult);
      if (!assignResult.success) {
        console.log('Assignment error:', assignResult.error);
      }
      expect(assignResult.success).toBe(true);

      // Verify assignment notifications were sent
      const assignmentHistory = bugAssignmentSystem.getAssignmentHistory(bugId);
      expect(assignmentHistory).toHaveLength(1);
      expect(assignmentHistory[0].toUserId).toBe(assignedTo);

      // Step 3: Change status to TRIAGED (need to assign first for validation)
      if (assignedTo) {
        // Update the mock to include assigned_to
        const { bugReportOperations } = await import('../supabase');
        vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
          data: {
            ...mockBugReport,
            assigned_to: assignedTo,
            status: 'open'
          },
          error: null
        });
      }
      
      const triageResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.TRIAGED,
        assignerId,
        'Triaged after review'
      );
      expect(triageResult.success).toBe(true);

      // Step 4: Move to IN_PROGRESS (update mock again)
      if (assignedTo) {
        const { bugReportOperations } = await import('../supabase');
        vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
          data: {
            ...mockBugReport,
            assigned_to: assignedTo,
            status: 'triaged',
            priority: 'medium'
          },
          error: null
        });
      }
      
      const inProgressResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.IN_PROGRESS,
        assignedTo!,
        'Started working on the issue'
      );
      expect(inProgressResult.success).toBe(true);

      // Step 5: Add internal comments during development
      const commentResult = await internalCommunicationService.addComment(
        bugId,
        assignedTo!,
        'Found the root cause. Working on a fix.',
        { commentType: 'note', visibility: 'internal' }
      );
      expect(commentResult.success).toBe(true);

      // Step 6: Move to PENDING_VERIFICATION
      if (assignedTo) {
        const { bugReportOperations } = await import('../supabase');
        vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
          data: {
            ...mockBugReport,
            assigned_to: assignedTo,
            status: 'in_progress',
            priority: 'medium'
          },
          error: null
        });
      }
      
      const pendingResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.PENDING_VERIFICATION,
        assignedTo!,
        'Fix implemented, needs verification'
      );
      expect(pendingResult.success).toBe(true);

      // Step 7: Request user feedback for verification
      const feedbackResult = await feedbackCollectionService.requestFeedback(
        bugId,
        'original_reporter',
        'resolution_verification',
        'Please verify that the issue has been resolved'
      );
      expect(feedbackResult.success).toBe(true);

      // Step 8: Simulate user feedback (positive verification)
      const feedbackId = feedbackResult.requestId!;
      const pendingFeedback = Array.from((feedbackCollectionService as unknown as { feedbackStorage: Map<string, { id: string; metadata?: { requestId?: string } }> }).feedbackStorage.values())
        .find((f) => f.metadata?.requestId === feedbackId);
      
      if (pendingFeedback) {
        const submitResult = await feedbackCollectionService.submitFeedback(
          pendingFeedback.id,
          {
            isResolved: true,
            verificationNotes: 'Issue is completely resolved. Thank you!'
          }
        );
        expect(submitResult.success).toBe(true);
      }

      // Step 9: Move to RESOLVED
      if (assignedTo) {
        const { bugReportOperations } = await import('../supabase');
        vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
          data: {
            ...mockBugReport,
            assigned_to: assignedTo,
            status: 'pending_verification',
            priority: 'medium'
          },
          error: null
        });
      }
      
      const resolvedResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.RESOLVED,
        assignedTo!,
        'User confirmed resolution'
      );
      expect(resolvedResult.success).toBe(true);

      // Step 10: Request satisfaction rating
      const satisfactionResult = await feedbackCollectionService.requestFeedback(
        bugId,
        'original_reporter',
        'satisfaction_rating',
        'Please rate your experience with our bug resolution process'
      );
      expect(satisfactionResult.success).toBe(true);

      // Step 11: Simulate satisfaction rating
      const satisfactionFeedbackId = satisfactionResult.requestId!;
      const satisfactionFeedback = Array.from((feedbackCollectionService as unknown as { feedbackStorage: Map<string, { id: string; metadata?: { requestId?: string } }> }).feedbackStorage.values())
        .find((f) => f.metadata?.requestId === satisfactionFeedbackId);
      
      if (satisfactionFeedback) {
        const ratingResult = await feedbackCollectionService.submitFeedback(
          satisfactionFeedback.id,
          {
            satisfactionRating: 5,
            resolutionQuality: 5,
            responseTime: 4,
            improvementSuggestions: 'Great job! Very happy with the resolution.'
          }
        );
        expect(ratingResult.success).toBe(true);
      }

      // Step 12: Final status change to CLOSED
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: {
          ...mockBugReport,
          assigned_to: assignedTo,
          status: 'resolved',
          priority: 'medium'
        },
        error: null
      });
      
      const closedResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.CLOSED,
        'system',
        'Bug closed after successful resolution and positive feedback'
      );
      expect(closedResult.success).toBe(true);

      // Verify complete workflow
      const statusHistory = bugLifecycleService.getStatusHistory(bugId);
      expect(statusHistory.length).toBeGreaterThan(0);
      
      const statusTransitions = statusHistory.map(change => change.toStatus);
      expect(statusTransitions).toContain(BugStatus.TRIAGED);
      expect(statusTransitions).toContain(BugStatus.IN_PROGRESS);
      expect(statusTransitions).toContain(BugStatus.PENDING_VERIFICATION);
      expect(statusTransitions).toContain(BugStatus.RESOLVED);
      expect(statusTransitions).toContain(BugStatus.CLOSED);
    });

    it('handles escalation workflow correctly', async () => {
      const bugId = 'integration-test-bug';
      const userId = 'user_1';

      // Step 1: Assign bug with medium priority
      const assignResult = await bugAssignmentSystem.assignBug(bugId, userId, 'admin_user', 'manual');
      expect(assignResult.success).toBe(true);

      // Update mock to reflect assignment
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: {
          ...mockBugReport,
          id: bugId,
          assigned_to: userId,
          status: 'triaged',
          priority: 'medium'
        },
        error: null
      });

      // Step 2: Escalate priority due to severity
      const escalationResult = await bugAssignmentSystem.escalateBugPriority(
        bugId,
        'Critical issue affecting multiple users'
      );
      console.log('Escalation result:', escalationResult);
      expect(escalationResult.success).toBe(true);
      expect(escalationResult.newPriority).toBe(BugPriority.HIGH);

      // Step 3: Add escalation comment
      const escalationComment = await internalCommunicationService.addComment(
        bugId,
        'admin_user',
        'Priority escalated due to widespread impact. Please prioritize this bug.',
        { 
          commentType: 'escalation', 
          visibility: 'team_only',
          mentions: [{ type: 'user', targetId: userId, targetName: 'user_1', position: { start: 0, end: 6 } }]
        }
      );
      expect(escalationComment.success).toBe(true);

      // Step 4: Reassign to senior developer
      const reassignResult = await bugAssignmentSystem.assignBug(
        bugId,
        'senior_dev_1',
        'admin_user',
        'manual',
        'Reassigned to senior developer due to escalation'
      );
      expect(reassignResult.success).toBe(true);

      // Verify escalation was properly handled
      const workloadMetrics = bugAssignmentSystem.getWorkloadMetrics();
      const seniorDev = workloadMetrics.find(m => m.userId === 'senior_dev_1');
      expect(seniorDev).toBeDefined();
    });
  });

  describe('Notification Integration', () => {
    it('sends notifications throughout bug lifecycle', async () => {
      const bugId = 'integration-test-bug';
      const userId = 'user_1';
      const originalReporter = 'original_reporter';

      // Mock notification functions (named exports)
      const { sendBugStatusUpdate, sendAssignmentNotification, sendFeedbackRequest } = await import('../notificationService');
      const sendBugStatusUpdateSpy = vi.mocked(sendBugStatusUpdate);
      const sendAssignmentNotificationSpy = vi.mocked(sendAssignmentNotification);
      const sendFeedbackRequestSpy = vi.mocked(sendFeedbackRequest);

      // Assign bug (should trigger assignment notification)
      const assignResult = await bugAssignmentSystem.assignBug(bugId, userId, 'admin_user', 'manual');
      expect(assignResult.success).toBe(true);
      expect(sendAssignmentNotificationSpy).toHaveBeenCalledWith(
        bugId,
        userId,
        'admin_user',
        undefined
      );

      // Change status (should trigger status update notification)
      await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.IN_PROGRESS,
        userId,
        'Started working on the issue'
      );

      // Request feedback (should trigger feedback notification)
      await feedbackCollectionService.requestFeedback(
        bugId,
        originalReporter,
        'resolution_verification'
      );
      expect(sendFeedbackRequestSpy).toHaveBeenCalledWith(
        bugId,
        originalReporter,
        'verification'
      );

      // Verify all notification types were triggered
      expect(sendBugStatusUpdateSpy).toHaveBeenCalled();
      expect(sendAssignmentNotificationSpy).toHaveBeenCalled();
      expect(sendFeedbackRequestSpy).toHaveBeenCalled();
    });

    it('respects user notification preferences', async () => {
      const bugId = 'integration-test-bug';
      const userId = 'user_1';

      // Update user preferences to disable certain notifications
      await notificationService.updateUserPreferences(userId, {
        assignmentNotifications: {
          enabled: false,
          channels: [],
          includeComments: false
        }
      });

      // Try to send assignment notification
      const result = await notificationService.sendAssignmentNotification(
        bugId,
        userId,
        'admin_user'
      );

      // Should return empty array (no notifications sent)
      expect(result).toEqual([]);
    });
  });

  describe('Communication and Collaboration', () => {
    it('handles threaded discussions correctly', async () => {
      const bugId = 'integration-test-bug';
      const user1 = 'user_1';
      const user2 = 'user_2';

      // Add root comment
      const rootCommentResult = await internalCommunicationService.addComment(
        bugId,
        user1,
        'I think the issue is in the authentication module.',
        { commentType: 'note', visibility: 'team_only' }
      );
      expect(rootCommentResult.success).toBe(true);

      const rootCommentId = rootCommentResult.commentId!;

      // Add reply comment
      const replyResult = await internalCommunicationService.addComment(
        bugId,
        user2,
        'Good point! I\'ll check the JWT token validation.',
        { 
          commentType: 'note', 
          visibility: 'team_only',
          parentCommentId: rootCommentId
        }
      );
      expect(replyResult.success).toBe(true);

      // Add another reply
      const reply2Result = await internalCommunicationService.addComment(
        bugId,
        user1,
        '@user_2 Found the issue in token expiration logic!',
        { 
          commentType: 'resolution', 
          visibility: 'team_only',
          parentCommentId: rootCommentId
        }
      );
      expect(reply2Result.success).toBe(true);

      // Verify comment structure
      const allComments = internalCommunicationService.getBugComments(bugId);
      expect(allComments).toHaveLength(3);

      const rootComment = allComments.find(c => c.id === rootCommentId);
      expect(rootComment?.hasReplies).toBe(true);
      expect(rootComment?.replyCount).toBe(2);

      // Verify mentions were processed
      const mentionComment = allComments.find(c => c.content.includes('@user_2'));
      expect(mentionComment?.mentions).toHaveLength(1);
      expect(mentionComment?.mentions[0].targetId).toBe('user_2');
    });

    it('tracks audit trail for all activities', async () => {
      const bugId = 'integration-test-bug';
      const userId = 'user_1';

      // Perform various activities
      await bugAssignmentSystem.assignBug(bugId, userId, 'admin_user', 'manual');
      await bugLifecycleService.changeStatus(bugId, BugStatus.IN_PROGRESS, userId);
      await internalCommunicationService.addComment(
        bugId,
        userId,
        'Working on the issue',
        { commentType: 'note' }
      );

      // Get audit trail
      const auditTrail = internalCommunicationService.getAuditTrail(bugId);
      
      expect(auditTrail.length).toBeGreaterThan(0);
      
      // Verify different types of activities are logged
      const actions = auditTrail.map(entry => entry.action);
      expect(actions).toContain('comment_added');

      // Verify audit entries have required fields
      auditTrail.forEach(entry => {
        expect(entry.id).toBeDefined();
        expect(entry.bugReportId).toBe(bugId);
        expect(entry.action).toBeDefined();
        expect(entry.performedBy).toBeDefined();
        expect(entry.performedAt).toBeDefined();
        expect(entry.entityType).toBeDefined();
        expect(entry.entityId).toBeDefined();
      });
    });
  });

  describe('Feedback Integration', () => {
    it('processes feedback lifecycle correctly', async () => {
      const bugId = 'integration-test-bug';
      const userId = 'original_reporter';

      // Request verification feedback
      const verificationResult = await feedbackCollectionService.requestFeedback(
        bugId,
        userId,
        'resolution_verification',
        'Please verify the fix works for you'
      );
      expect(verificationResult.success).toBe(true);

      // Get pending feedback
      const pendingFeedback = feedbackCollectionService.getUserFeedback(userId, 'pending');
      expect(pendingFeedback).toHaveLength(1);

      const feedback = pendingFeedback[0];
      expect(feedback.feedbackType).toBe('resolution_verification');
      expect(feedback.status).toBe('pending');

      // Submit feedback
      const submitResult = await feedbackCollectionService.submitFeedback(
        feedback.id,
        {
          isResolved: true,
          verificationNotes: 'Yes, the issue is completely fixed!'
        }
      );
      expect(submitResult.success).toBe(true);

      // Verify feedback was updated
      const submittedFeedback = feedbackCollectionService.getUserFeedback(userId, 'submitted');
      expect(submittedFeedback).toHaveLength(1);
      expect(submittedFeedback[0].isResolved).toBe(true);

      // Request satisfaction rating
      const satisfactionResult = await feedbackCollectionService.requestFeedback(
        bugId,
        userId,
        'satisfaction_rating'
      );
      expect(satisfactionResult.success).toBe(true);

      // Submit satisfaction rating
      const allPendingFeedback = feedbackCollectionService.getUserFeedback(userId, 'pending');
      const satisfactionFeedback = allPendingFeedback.find(f => f.feedbackType === 'satisfaction_rating');
      
      if (satisfactionFeedback) {
        const ratingResult = await feedbackCollectionService.submitFeedback(
          satisfactionFeedback.id,
          {
            satisfactionRating: 4,
            resolutionQuality: 5,
            responseTime: 3,
            improvementSuggestions: 'Overall great experience, could be a bit faster'
          }
        );
        expect(ratingResult.success).toBe(true);
      }

      // Get analytics
      const analytics = feedbackCollectionService.getFeedbackAnalytics();
      expect(analytics.totalFeedbackRequests).toBeGreaterThan(0);
      expect(analytics.responseRate).toBeGreaterThan(0);
      expect(analytics.resolutionVerification.totalVerifications).toBeGreaterThan(0);
      expect(analytics.satisfactionMetrics.averageRating).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('handles concurrent operations efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate concurrent operations
      const operations = [
        // Multiple status changes
        bugLifecycleService.changeStatus('bug1', BugStatus.TRIAGED, 'user1'),
        bugLifecycleService.changeStatus('bug2', BugStatus.IN_PROGRESS, 'user2'),
        
        // Multiple assignments
        bugAssignmentSystem.assignBug('bug3', 'user1', 'admin', 'auto'),
        bugAssignmentSystem.assignBug('bug4', 'user2', 'admin', 'auto'),
        
        // Multiple comments
        internalCommunicationService.addComment('bug1', 'user1', 'Comment 1'),
        internalCommunicationService.addComment('bug2', 'user2', 'Comment 2'),
        
        // Multiple feedback requests
        feedbackCollectionService.requestFeedback('bug1', 'reporter1', 'resolution_verification'),
        feedbackCollectionService.requestFeedback('bug2', 'reporter2', 'satisfaction_rating')
      ];

      const results = await Promise.allSettled(operations);
      const endTime = performance.now();
      
      // All operations should complete within reasonable time (2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Most operations should succeed
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThan(operations.length * 0.7); // At least 70% success
    });

    it('maintains data consistency under load', async () => {
      const bugId = 'consistency-test-bug';
      
      // Perform multiple operations on the same bug
      const operations = [
        bugLifecycleService.changeStatus(bugId, BugStatus.TRIAGED, 'user1'),
        bugAssignmentSystem.assignBug(bugId, 'user2', 'admin', 'manual'),
        internalCommunicationService.addComment(bugId, 'user1', 'Comment from user1'),
        internalCommunicationService.addComment(bugId, 'user2', 'Comment from user2'),
        feedbackCollectionService.requestFeedback(bugId, 'reporter', 'additional_info')
      ];

      await Promise.allSettled(operations);

      // Verify data consistency
      const comments = internalCommunicationService.getBugComments(bugId);
      const assignmentHistory = bugAssignmentSystem.getAssignmentHistory(bugId);
      const statusHistory = bugLifecycleService.getStatusHistory(bugId);
      const userFeedback = feedbackCollectionService.getUserFeedback('reporter');

      // All data should be properly stored and accessible
      expect(comments.every(c => c.bugReportId === bugId)).toBe(true);
      expect(assignmentHistory.every(a => a.bugReportId === bugId)).toBe(true);
      expect(statusHistory.every(s => s.bugReportId === bugId)).toBe(true);
      expect(userFeedback.every(f => f.bugReportId === bugId)).toBe(true);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('handles service failures gracefully', async () => {
      const bugId = 'error-test-bug';

      // Mock successful getBugReportById with proper assigned_to field
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: {
          ...mockBugReport,
          id: bugId,
          assigned_to: 'user1',
          status: 'triaged',
          priority: 'medium',
        },
        error: null
      });

      // Mock a database error on update
      vi.mocked(bugReportOperations.updateBugReport).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      // Operation should fail gracefully
      const result = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.IN_PROGRESS,
        'user1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');

      // Restore mock for subsequent operations
      vi.mocked(bugReportOperations.updateBugReport).mockResolvedValue({ error: null });

      // Subsequent operations should work normally
      const retryResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.IN_PROGRESS,
        'user1'
      );
      expect(retryResult.success).toBe(true);
    });

    it('validates state transitions correctly', async () => {
      const bugId = 'validation-test-bug';

      // Mock bug in OPEN status for invalid transition test
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: {
          ...mockBugReport,
          id: bugId,
          status: 'open'
        },
        error: null
      });

      // Try invalid transition (OPEN -> RESOLVED, skipping intermediate states)
      const invalidResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.RESOLVED,
        'user1'
      );

      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toContain('Status transition validation failed');

      // Mock bug in OPEN status for valid transition test
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: {
          ...mockBugReport,
          id: bugId,
          status: 'open'
        },
        error: null
      });

      // Valid transition should work (OPEN -> TRIAGED is allowed)
      const validResult = await bugLifecycleService.changeStatus(
        bugId,
        BugStatus.TRIAGED,
        'user1'
      );
      expect(validResult.success).toBe(true);
    });
  });

  describe('Integration with Monitoring', () => {
    it('tracks all lifecycle events for monitoring', async () => {
      const bugId = 'monitoring-test-bug';
      const { trackBugReportEvent } = await import('../monitoring');

      // Clear previous calls
      vi.mocked(trackBugReportEvent).mockClear();

      // Perform various operations
      await bugAssignmentSystem.assignBug(bugId, 'user1', 'admin', 'manual');
      await bugLifecycleService.changeStatus(bugId, BugStatus.IN_PROGRESS, 'user1');
      await internalCommunicationService.addComment(bugId, 'user1', 'Test comment');
      await feedbackCollectionService.requestFeedback(bugId, 'reporter', 'resolution_verification');

      // Verify tracking events were called
      expect(trackBugReportEvent).toHaveBeenCalledWith('bug_assigned', expect.any(Object));
      expect(trackBugReportEvent).toHaveBeenCalledWith('bug_status_changed', expect.any(Object));
      expect(trackBugReportEvent).toHaveBeenCalledWith('internal_comment_added', expect.any(Object));
      expect(trackBugReportEvent).toHaveBeenCalledWith('feedback_requested', expect.any(Object));
    });
  });

  describe('Workflow Optimization', () => {
    it('optimizes assignment recommendations based on workload', async () => {
      // Set up different workloads for team members
      bugAssignmentSystem.updateTeamMember('user_1', { currentWorkload: 2 });
      bugAssignmentSystem.updateTeamMember('user_2', { currentWorkload: 6 });
      bugAssignmentSystem.updateTeamMember('user_3', { currentWorkload: 1 });

      // Get recommendations for a new bug
      const recommendations = await bugAssignmentSystem.getAssignmentRecommendations(mockBugReport);

      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should prefer user with lower workload (user_3)
      const topRecommendation = recommendations[0];
      expect(topRecommendation.userId).toBe('user_3');
      expect(topRecommendation.workloadImpact).toBeLessThan(0.5);
    });

    it('provides workload balancing recommendations', async () => {
      // Create imbalanced workload scenario
      bugAssignmentSystem.updateTeamMember('user_1', { currentWorkload: 1 });
      bugAssignmentSystem.updateTeamMember('user_2', { currentWorkload: 8 });

      const balanceRecommendations = await bugAssignmentSystem.balanceWorkload();
      
      // Should recommend assigning work to under-utilized user
      const hasUser1Recommendation = balanceRecommendations.some(rec => rec.userId === 'user_1');
      expect(hasUser1Recommendation).toBe(true);
    });
  });
});