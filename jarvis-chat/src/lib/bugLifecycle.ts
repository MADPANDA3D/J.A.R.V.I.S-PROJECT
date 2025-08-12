/**
 * Bug Lifecycle Management Service
 * Comprehensive bug status lifecycle with state machine, automated transitions, and workflow management
 */

import { centralizedLogging } from './centralizedLogging';
import { bugReportOperations } from './supabase';
import { trackBugReportEvent } from './monitoring';

// Bug status enumeration
export enum BugStatus {
  OPEN = 'open',
  TRIAGED = 'triaged',
  IN_PROGRESS = 'in_progress',
  PENDING_VERIFICATION = 'pending_verification',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened'
}

// Priority levels
export enum BugPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent'
}

// Bug lifecycle state configuration
export interface BugLifecycleState {
  current: BugStatus;
  allowedTransitions: BugStatus[];
  requiredFields?: string[];
  requiredRoles?: string[];
  automaticTransitions?: {
    condition: string;
    targetStatus: BugStatus;
    delay?: number; // milliseconds
    priority?: BugPriority;
  }[];
}

// Status change record
export interface StatusChange {
  id: string;
  bugReportId: string;
  fromStatus: BugStatus;
  toStatus: BugStatus;
  changedBy: string;
  reason?: string;
  notes?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Bulk status update
export interface BulkStatusUpdate {
  bugIds: string[];
  newStatus: BugStatus;
  reason: string;
  changedBy: string;
  notes?: string;
}

export interface BulkUpdateResult {
  successful: string[];
  failed: Array<{
    bugId: string;
    error: string;
  }>;
  totalProcessed: number;
}

// Lifecycle validation result
export interface LifecycleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
}

// Bug lifecycle configuration
const BUG_LIFECYCLE_RULES: Record<BugStatus, BugLifecycleState> = {
  [BugStatus.OPEN]: {
    current: BugStatus.OPEN,
    allowedTransitions: [BugStatus.TRIAGED, BugStatus.IN_PROGRESS, BugStatus.CLOSED],
    automaticTransitions: [{
      condition: 'no_activity_7_days',
      targetStatus: BugStatus.CLOSED,
      delay: 7 * 24 * 60 * 60 * 1000 // 7 days
    }]
  },
  [BugStatus.TRIAGED]: {
    current: BugStatus.TRIAGED,
    allowedTransitions: [BugStatus.IN_PROGRESS, BugStatus.OPEN, BugStatus.CLOSED],
    requiredFields: ['assigned_to', 'priority']
  },
  [BugStatus.IN_PROGRESS]: {
    current: BugStatus.IN_PROGRESS,
    allowedTransitions: [BugStatus.PENDING_VERIFICATION, BugStatus.RESOLVED, BugStatus.OPEN],
    requiredFields: ['assigned_to', 'priority'],
    automaticTransitions: [{
      condition: 'no_activity_14_days',
      targetStatus: BugStatus.OPEN,
      delay: 14 * 24 * 60 * 60 * 1000 // 14 days
    }]
  },
  [BugStatus.PENDING_VERIFICATION]: {
    current: BugStatus.PENDING_VERIFICATION,
    allowedTransitions: [BugStatus.RESOLVED, BugStatus.REOPENED, BugStatus.IN_PROGRESS],
    automaticTransitions: [{
      condition: 'no_feedback_3_days',
      targetStatus: BugStatus.RESOLVED,
      delay: 3 * 24 * 60 * 60 * 1000 // 3 days
    }]
  },
  [BugStatus.RESOLVED]: {
    current: BugStatus.RESOLVED,
    allowedTransitions: [BugStatus.CLOSED, BugStatus.REOPENED],
    automaticTransitions: [{
      condition: 'no_activity_30_days',
      targetStatus: BugStatus.CLOSED,
      delay: 30 * 24 * 60 * 60 * 1000 // 30 days
    }]
  },
  [BugStatus.CLOSED]: {
    current: BugStatus.CLOSED,
    allowedTransitions: [BugStatus.REOPENED]
  },
  [BugStatus.REOPENED]: {
    current: BugStatus.REOPENED,
    allowedTransitions: [BugStatus.TRIAGED, BugStatus.IN_PROGRESS, BugStatus.CLOSED],
    automaticTransitions: [{
      condition: 'reopened_priority_escalation',
      targetStatus: BugStatus.TRIAGED,
      delay: 0,
      priority: BugPriority.HIGH
    }]
  }
};

class BugLifecycleService {
  private static instance: BugLifecycleService;
  private statusChangeHistory: Map<string, StatusChange[]> = new Map();
  private automaticTransitionTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeAutomaticTransitions();
  }

  static getInstance(): BugLifecycleService {
    if (!BugLifecycleService.instance) {
      BugLifecycleService.instance = new BugLifecycleService();
    }
    return BugLifecycleService.instance;
  }

  /**
   * Change bug status with validation and workflow management
   */
  async changeStatus(
    bugId: string,
    newStatus: BugStatus,
    changedBy: string,
    reason?: string,
    notes?: string,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string; statusChange?: StatusChange }> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'bug-lifecycle',
        'system',
        'Initiating bug status change',
        { 
          correlationId,
          bugId, 
          newStatus, 
          changedBy, 
          reason 
        }
      );

      // Get current bug report
      const { data: bugReport, error: fetchError } = await bugReportOperations.getBugReportById(bugId);
      if (fetchError || !bugReport) {
        throw new Error(`Failed to fetch bug report: ${fetchError?.message || 'Bug not found'}`);
      }

      const currentStatus = bugReport.status as BugStatus;

      // Validate status transition
      const validation = this.validateStatusTransition(currentStatus, newStatus, bugReport);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Status transition validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Create status change record
      const statusChange: StatusChange = {
        id: this.generateStatusChangeId(),
        bugReportId: bugId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedBy,
        reason,
        notes,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          correlationId,
          validationWarnings: validation.warnings
        }
      };

      // Update bug status in database
      const { error: updateError } = await bugReportOperations.updateBugReport(bugId, {
        status: newStatus,
        ...(newStatus === BugStatus.RESOLVED && { resolved_at: new Date().toISOString() }),
        ...(newStatus === BugStatus.CLOSED && { closed_at: new Date().toISOString() })
      });

      if (updateError) {
        throw new Error(`Failed to update bug status: ${updateError.message}`);
      }

      // Store status change history
      this.addStatusChangeToHistory(statusChange);

      // Clear any existing automatic transition timers for this bug
      this.clearAutomaticTransition(bugId);

      // Setup new automatic transitions if applicable
      this.setupAutomaticTransitions(bugId, newStatus);

      // Apply side effects based on new status
      await this.applyStatusSideEffects(bugReport, newStatus, statusChange);

      // Track status change event
      trackBugReportEvent('bug_status_changed', {
        bugId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedBy,
        reason,
        processingTime: performance.now()
      });

      centralizedLogging.info(
        'bug-lifecycle',
        'system',
        'Bug status changed successfully',
        { 
          correlationId,
          bugId, 
          fromStatus: currentStatus, 
          toStatus: newStatus,
          statusChangeId: statusChange.id
        }
      );

      return {
        success: true,
        statusChange
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'bug-lifecycle',
        'system',
        'Failed to change bug status',
        { 
          correlationId,
          bugId, 
          newStatus, 
          error: errorMessage 
        }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Bulk status update for multiple bugs
   */
  async bulkUpdateStatus(bulkUpdate: BulkStatusUpdate): Promise<BulkUpdateResult>  {
    const result: BulkUpdateResult = {
      successful: [],
      failed: [],
      totalProcessed: 0
    };

    centralizedLogging.info(
      'bug-lifecycle',
      'system',
      'Starting bulk status update',
      { 
        bugCount: bulkUpdate.bugIds.length, 
        newStatus: bulkUpdate.newStatus,
        changedBy: bulkUpdate.changedBy
      }
    );

    for (const bugId of bulkUpdate.bugIds) {
      result.totalProcessed++;

      try {
        const statusResult = await this.changeStatus(
          bugId,
          bulkUpdate.newStatus,
          bulkUpdate.changedBy,
          bulkUpdate.reason,
          bulkUpdate.notes,
          { bulkUpdate: true }
        );

        if (statusResult.success) {
          result.successful.push(bugId);
        } else {
          result.failed.push({
            bugId,
            error: statusResult.error || 'Unknown error'
          });
        }
      } catch (error) {
        result.failed.push({
          bugId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    centralizedLogging.info(
      'bug-lifecycle',
      'system',
      'Bulk status update completed',
      { 
        totalProcessed: result.totalProcessed,
        successful: result.successful.length,
        failed: result.failed.length
      }
    );

    return result;
  }

  /**
   * Get bug status history
   */
  getStatusHistory(bugId: string): StatusChange[] {
    return this.statusChangeHistory.get(bugId) || [];
  }

  /**
   * Get all status changes for reporting
   */
  getAllStatusChanges(): StatusChange[] {
    const allChanges: StatusChange[] = [];
    this.statusChangeHistory.forEach(changes => {
      allChanges.push(...changes);
    });
    return allChanges.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Validate status transition
   */
  validateStatusTransition(
    currentStatus: BugStatus, 
    newStatus: BugStatus, 
    bugReport?: any
  ): LifecycleValidation {
    const validation: LifecycleValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      requiredFields: []
    };

    // Check if transition is allowed
    const currentState = BUG_LIFECYCLE_RULES[currentStatus];
    if (!currentState.allowedTransitions.includes(newStatus)) {
      validation.isValid = false;
      validation.errors.push(
        `Invalid transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${currentState.allowedTransitions.join(', ')}`
      );
    }

    // Check required fields for new status
    const newState = BUG_LIFECYCLE_RULES[newStatus];
    if (newState.requiredFields && bugReport) {
      for (const field of newState.requiredFields) {
        if (!bugReport[field] || bugReport[field] === null) {
          validation.isValid = false;
          validation.errors.push(`Required field '${field}' is missing for status '${newStatus}'`);
          validation.requiredFields.push(field);
        }
      }
    }

    // Add warnings for potential issues
    if (currentStatus === BugStatus.RESOLVED && newStatus === BugStatus.REOPENED) {
      validation.warnings.push('Bug is being reopened after resolution - consider escalating priority');
    }

    if (currentStatus === BugStatus.CLOSED && newStatus === BugStatus.REOPENED) {
      validation.warnings.push('Bug is being reopened after closure - this may indicate a regression');
    }

    return validation;
  }

  /**
   * Get available status transitions for a bug
   */
  getAvailableTransitions(currentStatus: BugStatus): BugStatus[] {
    const state = BUG_LIFECYCLE_RULES[currentStatus];
    return state.allowedTransitions;
  }

  /**
   * Get bugs by status with filtering options
   */
  async getBugsByStatus(
    status: BugStatus | BugStatus[],
    options: {
      assignedTo?: string;
      priority?: BugPriority[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise< => { data: unknown[]; count: number; error?: any }> {
    try {
      const statusArray = Array.isArray(status) ? status : [status];
      
      const result = await bugReportOperations.searchBugReports({
        status: statusArray,
        userId: options.assignedTo,
        limit: options.limit,
        offset: options.offset
      });

      return {
        data: result.data || [],
        count: result.count || 0,
        error: result.error
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get lifecycle statistics
   */
  getLifecycleStatistics():   {
    statusDistribution: Record<BugStatus, number>;
    averageResolutionTime: number;
    totalStatusChanges: number;
    recentActivity: StatusChange[];
  } {
    const allChanges = this.getAllStatusChanges();
    const statusDistribution = {} as Record<BugStatus, number>;
    
    // Initialize status counts
    Object.values(BugStatus).forEach(status => {
      statusDistribution[status] = 0;
    });

    // Count current statuses (latest change per bug)
    const latestStatuses = new Map<string, BugStatus>();
    allChanges.forEach(change => {
      if (!latestStatuses.has(change.bugReportId) || 
          new Date(change.timestamp) > new Date(latestStatuses.get(change.bugReportId)!)) {
        latestStatuses.set(change.bugReportId, change.toStatus);
      }
    });

    latestStatuses.forEach(status => {
      statusDistribution[status]++;
    });

    // Calculate average resolution time
    const resolutionTimes: number[] = [];
    const bugResolutions = new Map<string, { opened: Date; resolved: Date }>();

    allChanges.forEach(change => {
      if (change.toStatus === BugStatus.OPEN) {
        bugResolutions.set(change.bugReportId, { 
          opened: new Date(change.timestamp), 
          resolved: new Date(0) 
        });
      } else if (change.toStatus === BugStatus.RESOLVED || change.toStatus === BugStatus.CLOSED) {
        const bug = bugResolutions.get(change.bugReportId);
        if (bug && bug.opened.getTime() > 0) {
          bug.resolved = new Date(change.timestamp);
          const resolutionTime = bug.resolved.getTime() - bug.opened.getTime();
          resolutionTimes.push(resolutionTime);
        }
      }
    });

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    return {
      statusDistribution,
      averageResolutionTime: averageResolutionTime / (1000 * 60 * 60), // Convert to hours
      totalStatusChanges: allChanges.length,
      recentActivity: allChanges.slice(0, 10) // Last 10 status changes
    };
  }

  // Private helper methods
  private initializeAutomaticTransitions(): void {
    // This would load existing bugs and setup automatic transitions
    // In a real implementation, this would query the database for active bugs
  }

  private setupAutomaticTransitions(bugId: string, status: BugStatus): void {
    const state = BUG_LIFECYCLE_RULES[status];
    
    if (!state.automaticTransitions) return;

    state.automaticTransitions.forEach(transition => {
      if (transition.delay && transition.delay > 0) {
        const timer = setTimeout(() => {
          this.handleAutomaticTransition(bugId, transition);
        }, transition.delay);

        this.automaticTransitionTimers.set(`${bugId}_${transition.condition}`, timer);
      }
    });
  }

  private clearAutomaticTransition(bugId: string): void {
    // Clear all timers for this bug
    for (const [key, timer] of this.automaticTransitionTimers.entries()) {
      if (key.startsWith(bugId + '_')) {
        clearTimeout(timer);
        this.automaticTransitionTimers.delete(key);
      }
    }
  }

  private async handleAutomaticTransition(
    bugId: string, 
    transition: NonNullable<BugLifecycleState['automaticTransitions']>[0]
  ): Promise<void>  => {
    try {
      const result = await this.changeStatus(
        bugId,
        transition.targetStatus,
        'system',
        `Automatic transition: ${transition.condition}`,
        undefined,
        { automaticTransition: true, condition: transition.condition }
      );

      if (result.success) {
        centralizedLogging.info(
          'bug-lifecycle',
          'system',
          'Automatic status transition completed',
          { bugId, condition: transition.condition, newStatus: transition.targetStatus }
        );
      }
    } catch (error) {
      centralizedLogging.error(
        'bug-lifecycle',
        'system',
        'Automatic transition failed',
        { bugId, condition: transition.condition, error }
      );
    }
  }

  private addStatusChangeToHistory(statusChange: StatusChange): void {
    const history = this.statusChangeHistory.get(statusChange.bugReportId) || [];
    history.push(statusChange);
    
    // Keep only last 50 status changes per bug
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.statusChangeHistory.set(statusChange.bugReportId, history);
  }

  private async applyStatusSideEffects(
    bugReport: any, 
    newStatus: BugStatus, 
    statusChange: StatusChange
  ): Promise<void>  => {
    // statusChange parameter available for future side effect logic
    void statusChange;
    try {
      // Side effects based on new status
      switch (newStatus) {
        case BugStatus.TRIAGED:
          // Auto-assign if no assignee
          if (!bugReport.assigned_to) {
            // This would integrate with assignment system
            centralizedLogging.info(
              'bug-lifecycle',
              'system',
              'Bug triaged but no assignee - consider auto-assignment',
              { bugId: bugReport.id }
            );
          }
          break;

        case BugStatus.RESOLVED:
          // Request user feedback
          centralizedLogging.info(
            'bug-lifecycle',
            'system',
            'Bug resolved - feedback request should be sent',
            { bugId: bugReport.id }
          );
          break;

        case BugStatus.REOPENED:
          // Escalate priority if not already high
          if (bugReport.priority !== BugPriority.HIGH && bugReport.priority !== BugPriority.CRITICAL) {
            centralizedLogging.info(
              'bug-lifecycle',
              'system',
              'Bug reopened - consider priority escalation',
              { bugId: bugReport.id, currentPriority: bugReport.priority }
            );
          }
          break;
      }
    } catch (error) {
      centralizedLogging.warn(
        'bug-lifecycle',
        'system',
        'Failed to apply status side effects',
        { bugId: bugReport.id, newStatus, error }
      );
    }
  }

  private generateCorrelationId(): string {
    return `lifecycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStatusChangeId(): string {
    return `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  destroy(): void {
    // Clear all automatic transition timers
    this.automaticTransitionTimers.forEach(timer => clearTimeout(timer));
    this.automaticTransitionTimers.clear();
  }
}

// Export singleton instance
export const bugLifecycleService = BugLifecycleService.getInstance();

// Export convenience functions
export const changeBugStatus = (
  bugId: string,
  newStatus: BugStatus,
  changedBy: string,
  reason?: string,
  notes?: string
) => bugLifecycleService.changeStatus(bugId, newStatus, changedBy, reason, notes);

export const getBugStatusHistory = (bugId: string) => bugLifecycleService.getStatusHistory(bugId);

export const validateStatusTransition = (currentStatus: BugStatus, newStatus: BugStatus, bugReport?: any) =>
  bugLifecycleService.validateStatusTransition(currentStatus, newStatus, bugReport);

export const getAvailableTransitions = (currentStatus: BugStatus) =>
  bugLifecycleService.getAvailableTransitions(currentStatus);

export default bugLifecycleService;