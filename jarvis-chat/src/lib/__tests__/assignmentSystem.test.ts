/**
 * Assignment System Tests
 * Tests for bug assignment, workload management, and priority escalation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bugAssignmentSystem, type TeamMember, type AssignmentMethod, BugPriority } from '../assignmentSystem';
import type { BugReport } from '@/types/bugReport';

// Mock dependencies
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
        id: 'test-bug-id',
        title: 'Test Bug',
        description: 'Test bug description',
        bug_type: 'functionality',
        severity: 'medium',
        status: 'open',
        priority: 'medium',
        assigned_to: null,
        created_at: new Date().toISOString()
      },
      error: null
    })),
    updateBugReport: vi.fn(() => Promise.resolve({ error: null })),
    searchBugReports: vi.fn(() => Promise.resolve({
      data: [],
      error: null
    }))
  }
}));

vi.mock('../monitoring', () => ({
  trackBugReportEvent: vi.fn()
}));

vi.mock('../notificationService', () => ({
  sendAssignmentNotification: vi.fn(() => Promise.resolve([])),
  sendEscalationAlert: vi.fn(() => Promise.resolve([]))
}));

vi.mock('../bugLifecycle', () => ({
  changeBugStatus: vi.fn(() => Promise.resolve({ success: true })),
  BugStatus: {
    OPEN: 'open',
    TRIAGED: 'triaged',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  },
  BugPriority: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
    URGENT: 'urgent'
  }
}));

describe('BugAssignmentSystem', () => {
  const mockBugReport: Partial<BugReport> = {
    id: 'test-bug-id',
    title: 'Test Bug Report',
    description: 'This is a test bug report for assignment testing',
    bug_type: 'functionality',
    severity: 'medium',
    status: 'open',
    priority: 'medium',
    assigned_to: null,
    created_at: new Date().toISOString()
  };

  beforeEach(() {
    vi.clearAllMocks();
  });

  afterEach(() {
    vi.clearAllMocks();
  });

  describe('Manual Assignment', () {
    it('assigns bug to team member successfully', async () {
      const result = await bugAssignmentSystem.assignBug(
        'test-bug-id',
        'user_1',
        'admin_user',
        'manual',
        'Assigned for testing'
      );

      expect(result.success).toBe(true);
      expect(result.assignment).toBeDefined();
      expect(result.assignment?.toUserId).toBe('user_1');
      expect(result.assignment?.method).toBe('manual');

      // Verify database update was called
      const { bugReportOperations } = await import('../supabase');
      expect(bugReportOperations.updateBugReport).toHaveBeenCalledWith(
        'test-bug-id',
        expect.objectContaining({
          assigned_to: 'user_1',
          assigned_at: expect.any(String)
        })
      );
    });

    it('handles assignment to non-existent user', async () {
      const result = await bugAssignmentSystem.assignBug(
        'test-bug-id',
        'non_existent_user',
        'admin_user',
        'manual'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Assignee not found');
    });

    it('handles database update failures', async () {
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.updateBugReport).mockResolvedValueOnce({
        error: { message: 'Database error' }
      });

      const result = await bugAssignmentSystem.assignBug(
        'test-bug-id',
        'user_1',
        'admin_user',
        'manual'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('tracks assignment history', async () {
      await bugAssignmentSystem.assignBug(
        'test-bug-id',
        'user_1',
        'admin_user',
        'manual',
        'Initial assignment'
      );

      const history = bugAssignmentSystem.getAssignmentHistory('test-bug-id');
      expect(history).toHaveLength(1);
      expect(history[0].toUserId).toBe('user_1');
      expect(history[0].assignedBy).toBe('admin_user');
      expect(history[0].reason).toBe('Initial assignment');
    });

    it('handles reassignment correctly', async () {
      // First assignment
      await bugAssignmentSystem.assignBug(
        'test-bug-id',
        'user_1',
        'admin_user',
        'manual'
      );

      // Mock bug report with assigned user
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: {
          ...mockBugReport,
          assigned_to: 'user_1'
        } as any,
        error: null
      });

      // Reassignment
      const result = await bugAssignmentSystem.assignBug(
        'test-bug-id',
        'user_2',
        'admin_user',
        'manual',
        'Reassigned to different team member'
      );

      expect(result.success).toBe(true);
      expect(result.assignment?.fromUserId).toBe('user_1');
      expect(result.assignment?.toUserId).toBe('user_2');

      const history = bugAssignmentSystem.getAssignmentHistory('test-bug-id');
      expect(history).toHaveLength(2);
    });
  });

  describe('Auto Assignment', () {
    it('auto-assigns bug successfully', async () {
      const assignedTo = await bugAssignmentSystem.autoAssignBug('test-bug-id');

      expect(assignedTo).toBeDefined();
      expect(typeof assignedTo).toBe('string');

      // Verify assignment was made
      const history = bugAssignmentSystem.getAssignmentHistory('test-bug-id');
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].method).toBe('auto');
    });

    it('returns null when no suitable assignee found', async () {
      // Mock all team members as unavailable
      const teamMembers = (bugAssignmentSystem as any).teamMembers;
      const originalMembers = new Map(teamMembers);
      
      teamMembers.forEach((member: TeamMember) {
        member.availability = 'unavailable';
        member.currentWorkload = member.workloadCapacity;
      });

      const assignedTo = await bugAssignmentSystem.autoAssignBug('test-bug-id');

      expect(assignedTo).toBeNull();

      // Restore original team members
      (bugAssignmentSystem as any).teamMembers = originalMembers;
    });

    it('considers workload when auto-assigning', async () {
      // Set one team member with lower workload
      const teamMembers = (bugAssignmentSystem as any).teamMembers;
      const user1 = teamMembers.get('user_1');
      const user2 = teamMembers.get('user_2');
      
      if (user1 && user2) {
        user1.currentWorkload = 1;
        user2.currentWorkload = 5;
      }

      const assignedTo = await bugAssignmentSystem.autoAssignBug('test-bug-id');

      // Should prefer user with lower workload
      expect(assignedTo).toBe('user_1');
    });
  });

  describe('Assignment Recommendations', () {
    it('generates assignment recommendations', async () {
      const recommendations = await bugAssignmentSystem.getAssignmentRecommendations(mockBugReport);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      
      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(rec.userId).toBeDefined();
        expect(rec.userName).toBeDefined();
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
        expect(Array.isArray(rec.reasons)).toBe(true);
        expect(typeof rec.estimatedResolutionTime).toBe('number');
      }
    });

    it('sorts recommendations by confidence', async () {
      const recommendations = await bugAssignmentSystem.getAssignmentRecommendations(mockBugReport);

      if (recommendations.length > 1) {
        for (let i = 1; i < recommendations.length; i++) {
          expect(recommendations[i - 1].confidence).toBeGreaterThanOrEqual(
            recommendations[i].confidence
          );
        }
      }
    });

    it('considers skill matching in recommendations', async () {
      const frontendBug = {
        ...mockBugReport,
        bug_type: 'ui_ux',
        description: 'Frontend React component issue'
      };

      const recommendations = await bugAssignmentSystem.getAssignmentRecommendations(frontendBug);
      
      // Should recommend Alice (user_1) who specializes in frontend/React
      const aliceRecommendation = recommendations.find(rec => rec.userId === 'user_1');
      expect(aliceRecommendation).toBeDefined();
      
      if (aliceRecommendation) {
        expect(aliceRecommendation.skillMatch).toBeGreaterThan(0);
        expect(aliceRecommendation.reasons.some(reason => 
          reason.toLowerCase().includes('skill')
        )).toBe(true);
      }
    });
  });

  describe('Priority Escalation', () {
    it('escalates bug priority successfully', async () {
      const result = await bugAssignmentSystem.escalateBugPriority(
        'test-bug-id',
        'Bug has been open too long',
        'system'
      );

      expect(result.success).toBe(true);
      expect(result.newPriority).toBeDefined();

      // Verify database update
      const { bugReportOperations } = await import('../supabase');
      expect(bugReportOperations.updateBugReport).toHaveBeenCalledWith(
        'test-bug-id',
        expect.objectContaining({
          priority: result.newPriority,
          escalated_at: expect.any(String),
          escalation_reason: 'Bug has been open too long'
        })
      );
    });

    it('prevents escalation beyond maximum priority', async () {
      // Mock bug with urgent priority
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: {
          ...mockBugReport,
          priority: 'urgent'
        } as any,
        error: null
      });

      const result = await bugAssignmentSystem.escalateBugPriority(
        'test-bug-id',
        'Trying to escalate urgent bug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('maximum priority level');
    });

    it('sends escalation alerts to managers', async () {
      await bugAssignmentSystem.escalateBugPriority(
        'test-bug-id',
        'Critical issue requiring attention'
      );

      const { sendEscalationAlert } = await import('../notificationService');
      expect(sendEscalationAlert).toHaveBeenCalled();
    });
  });

  describe('Workload Management', () {
    it('calculates workload metrics correctly', () {
      const metrics = bugAssignmentSystem.getWorkloadMetrics();

      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);

      const metric = metrics[0];
      expect(metric.userId).toBeDefined();
      expect(metric.userName).toBeDefined();
      expect(typeof metric.totalAssigned).toBe('number');
      expect(typeof metric.workloadPercentage).toBe('number');
      expect(typeof metric.averageResolutionTime).toBe('number');
      expect(metric.recentActivity).toBeDefined();
    });

    it('identifies workload imbalances', async () {
      // Set up imbalanced workload
      const teamMembers = (bugAssignmentSystem as any).teamMembers;
      const user1 = teamMembers.get('user_1');
      const user2 = teamMembers.get('user_2');
      
      if (user1 && user2) {
        user1.currentWorkload = 1; // Under-utilized
        user2.currentWorkload = user2.workloadCapacity; // Over-utilized
      }

      const recommendations = await bugAssignmentSystem.balanceWorkload();
      
      expect(Array.isArray(recommendations)).toBe(true);
      
      // Recommendations should favor under-utilized team member
      if (recommendations.length > 0) {
        const hasUser1Recommendation = recommendations.some(rec => rec.userId === 'user_1');
        expect(hasUser1Recommendation).toBe(true);
      }
    });

    it('updates team member information', () {
      const result = bugAssignmentSystem.updateTeamMember('user_1', {
        availability: 'busy',
        currentWorkload: 5
      });

      expect(result).toBe(true);

      const metrics = bugAssignmentSystem.getWorkloadMetrics();
      const user1Metrics = metrics.find(m => m.userId === 'user_1');
      
      expect(user1Metrics?.totalAssigned).toBe(5);
    });

    it('handles update of non-existent team member', () {
      const result = bugAssignmentSystem.updateTeamMember('non_existent_user', {
        availability: 'available'
      });

      expect(result).toBe(false);
    });
  });

  describe('Assignment Rules', () {
    it('applies assignment rules correctly', async () {
      // Create a frontend bug that should match rule
      const frontendBug = {
        ...mockBugReport,
        bug_type: 'ui_ux',
        description: 'Frontend issue with component rendering'
      };

      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: frontendBug as any,
        error: null
      });

      const assignedTo = await bugAssignmentSystem.autoAssignBug('test-bug-id');

      // Should assign to user_1 (Alice) based on frontend rule
      expect(assignedTo).toBe('user_1');
    });

    it('falls back to recommendations when no rules match', async () {
      const genericBug = {
        ...mockBugReport,
        bug_type: 'other',
        description: 'Generic bug that does not match any rules'
      };

      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: genericBug as any,
        error: null
      });

      const assignedTo = await bugAssignmentSystem.autoAssignBug('test-bug-id');

      // Should still assign someone based on recommendations
      expect(assignedTo).toBeDefined();
      expect(typeof assignedTo).toBe('string');
    });
  });

  describe('Error Handling', () {
    it('handles bug fetch errors gracefully', async () {
      const { bugReportOperations } = await import('../supabase');
      vi.mocked(bugReportOperations.getBugReportById).mockResolvedValueOnce({
        data: null,
        error: { message: 'Bug not found' }
      });

      const result = await bugAssignmentSystem.assignBug(
        'non-existent-bug',
        'user_1',
        'admin_user'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bug not found');
    });

    it('handles notification failures gracefully', async () {
      const { sendAssignmentNotification } = await import('../notificationService');
      vi.mocked(sendAssignmentNotification).mockRejectedValueOnce(
        new Error('Notification service unavailable')
      );

      // Assignment should still succeed even if notification fails
      const result = await bugAssignmentSystem.assignBug(
        'test-bug-id',
        'user_1',
        'admin_user',
        'manual'
      );

      expect(result.success).toBe(true);

      const { centralizedLogging } = await import('../centralizedLogging');
      expect(centralizedLogging.info).toHaveBeenCalledWith(
        'assignment-system',
        'system',
        'Bug assigned successfully',
        expect.any(Object)
      );
    });
  });

  describe('Performance', () {
    it('handles concurrent assignments without conflicts', async () {
      const promises = [
        bugAssignmentSystem.assignBug('bug-1', 'user_1', 'admin_user'),
        bugAssignmentSystem.assignBug('bug-2', 'user_2', 'admin_user'),
        bugAssignmentSystem.assignBug('bug-3', 'user_3', 'admin_user')
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('maintains reasonable performance with large workload', async () {
      const startTime = performance.now();

      // Generate multiple recommendations
      const promises = Array(10).fill(null).map(() =>
        bugAssignmentSystem.getAssignmentRecommendations(mockBugReport)
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});