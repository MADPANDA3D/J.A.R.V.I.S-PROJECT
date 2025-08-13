/**
 * Bug Lifecycle Management Hook
 * React hook for managing bug lifecycle operations and state
 */

import { useState, useEffect, useCallback } from 'react';
import { bugLifecycleService, BugStatus, BugPriority, type StatusChange } from '@/lib/bugLifecycle';
import { bugAssignmentSystem, type AssignmentRecommendation, type WorkloadMetrics } from '@/lib/assignmentSystem';
import { notificationService } from '@/lib/notificationService';
import { bugReportOperations } from '@/lib/supabase';
import type { BugReport } from '@/types/bugReport';

interface UseBugLifecycleOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface BugLifecycleState {
  bugReport: BugReport | null;
  statusHistory: StatusChange[];
  availableTransitions: BugStatus[];
  assignmentRecommendations: AssignmentRecommendation[];
  workloadMetrics: WorkloadMetrics[];
  loading: boolean;
  error: string | null;
}

interface BugLifecycleActions {
  refreshBugReport: () => Promise<void>;
  changeStatus: (newStatus: BugStatus, reason?: string, notes?: string) => Promise<boolean>;
  assignBug: (assigneeId: string, reason?: string) => Promise<boolean>;
  autoAssign: () => Promise<string | null>;
  escalatePriority: (reason: string) => Promise<boolean>;
  getRecommendations: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
}

export const useBugLifecycle = (
  bugId: string, 
  options: UseBugLifecycleOptions = {}
): BugLifecycleState & BugLifecycleActions  => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [state, setState] = useState<BugLifecycleState>({
    bugReport: null,
    statusHistory: [],
    availableTransitions: [],
    assignmentRecommendations: [],
    workloadMetrics: [],
    loading: true,
    error: null
  });

  // Refresh bug report data
  const refreshBugReport = useCallback(async () => {
    if (!bugId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch bug report
      const { data: bugReport, error: fetchError } = await bugReportOperations.getBugReportById(bugId);
      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!bugReport) {
        throw new Error('Bug report not found');
      }

      // Get status history
      const statusHistory = bugLifecycleService.getStatusHistory(bugId);

      // Get available transitions
      const currentStatus = bugReport.status as BugStatus;
      const availableTransitions = bugLifecycleService.getAvailableTransitions(currentStatus);

      // Get assignment recommendations
      const assignmentRecommendations = await bugAssignmentSystem.getAssignmentRecommendations(bugReport);

      // Get workload metrics
      const workloadMetrics = bugAssignmentSystem.getWorkloadMetrics();

      setState(prev => ({
        ...prev,
        bugReport,
        statusHistory,
        availableTransitions,
        assignmentRecommendations,
        workloadMetrics,
        loading: false,
        error: null
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load bug report'
      }));
    }
  }, [bugId]);

  // Change bug status
  const changeStatus = useCallback(async (
    newStatus: BugStatus, 
    reason?: string, 
    notes?: string
  ): Promise<boolean>  => {
    if (!bugId) return false;

    try {
      const result = await bugLifecycleService.changeStatus(
        bugId,
        newStatus,
        'current_user', // In a real app, this would be the current user ID
        reason,
        notes
      );

      if (result.success) {
        // Refresh data to get updated state
        await refreshBugReport();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to change status'
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to change status'
      }));
      return false;
    }
  }, [bugId, refreshBugReport]);

  // Assign bug to user
  const assignBug = useCallback(async (
    assigneeId: string, 
    reason?: string
  ): Promise<boolean>  => {
    if (!bugId) return false;

    try {
      const result = await bugAssignmentSystem.assignBug(
        bugId,
        assigneeId,
        'current_user', // In a real app, this would be the current user ID
        'manual',
        reason
      );

      if (result.success) {
        // Refresh data to get updated state
        await refreshBugReport();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to assign bug'
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assign bug'
      }));
      return false;
    }
  }, [bugId, refreshBugReport]);

  // Auto-assign bug
  const autoAssign = useCallback(async (): Promise<string | null>  => {
    if (!bugId) return null;

    try {
      const assignedTo = await bugAssignmentSystem.autoAssignBug(bugId);
      
      if (assignedTo) {
        // Refresh data to get updated state
        await refreshBugReport();
      }
      
      return assignedTo;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to auto-assign bug'
      }));
      return null;
    }
  }, [bugId, refreshBugReport]);

  // Escalate bug priority
  const escalatePriority = useCallback(async (reason: string): Promise<boolean>  => {
    if (!bugId) return false;

    try {
      const result = await bugAssignmentSystem.escalateBugPriority(bugId, reason);

      if (result.success) {
        // Refresh data to get updated state
        await refreshBugReport();
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to escalate priority'
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to escalate priority'
      }));
      return false;
    }
  }, [bugId, refreshBugReport]);

  // Get fresh assignment recommendations
  const getRecommendations = useCallback(async (): Promise<void>  => {
    if (!state.bugReport) return;

    try {
      const recommendations = await bugAssignmentSystem.getAssignmentRecommendations(state.bugReport);
      setState(prev => ({
        ...prev,
        assignmentRecommendations: recommendations
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get recommendations'
      }));
    }
  }, [state.bugReport]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<boolean>  => {
    try {
      const result = await notificationService.markNotificationAsRead(
        notificationId,
        'current_user' // In a real app, this would be the current user ID
      );
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      }));
      return false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (bugId) {
      refreshBugReport();
    }
  }, [bugId, refreshBugReport]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !bugId) return;

    const interval = setInterval(() => {
      refreshBugReport();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, bugId, refreshBugReport]);

  // Clear error after a delay
  useEffect(() => {
    if (state.error) {
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [state.error]);

  return {
    ...state,
    refreshBugReport,
    changeStatus,
    assignBug,
    autoAssign,
    escalatePriority,
    getRecommendations,
    markNotificationAsRead
  };
}

// Hook for managing multiple bugs (for dashboard views)
export function useBugList(filters?: {
  status?: BugStatus | BugStatus[];
  assignedTo?: string;
  priority?: BugPriority[];
  limit?: number;
  offset?: number;
}) {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBugs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await bugLifecycleService.getBugsByStatus(
        filters?.status || [BugStatus.OPEN, BugStatus.TRIAGED, BugStatus.IN_PROGRESS],
        {
          assignedTo: filters?.assignedTo,
          priority: filters?.priority,
          limit: filters?.limit,
          offset: filters?.offset
        }
      );

      if (result.error) {
        throw new Error(result.error);
      }

      setBugs(result.data || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bugs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  return {
    bugs,
    totalCount,
    loading,
    error,
    refreshBugs: loadBugs
  };
}

// Hook for lifecycle statistics
export function useBugLifecycleStats() {
  const [stats, setStats] = useState<{
    statusDistribution: Record<BugStatus, number>;
    averageResolutionTime: number;
    totalStatusChanges: number;
    recentActivity: StatusChange[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      try {
        const statistics = bugLifecycleService.getLifecycleStatistics();
        setStats(statistics);
      } catch (error) {
        console.error('Failed to load lifecycle statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Refresh stats every minute
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
}

export default useBugLifecycle;