/**
 * Bug Assignment and Priority Management System
 * Comprehensive system for assigning bugs to team members with workload balancing and priority escalation
 */

import { centralizedLogging } from './centralizedLogging';
import { bugReportOperations } from './supabase';
import { trackBugReportEvent } from './monitoring';
import { sendAssignmentNotification, sendEscalationAlert } from './notificationService';
import { BugStatus, BugPriority } from './bugLifecycle';
import { BugReport } from '@/types/bugReport';

// Assignment types
export type AssignmentMethod = 'manual' | 'auto' | 'round_robin' | 'skill_based' | 'workload_balanced';
export type UserRole = 'admin' | 'senior_dev' | 'developer' | 'support' | 'qa';
export type UserAvailability = 'available' | 'busy' | 'unavailable' | 'on_leave';

// Team member profile
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  availability: UserAvailability;
  specializationAreas: string[];
  workloadCapacity: number; // Max concurrent bugs
  currentWorkload: number;
  averageResolutionTime: number; // in hours
  performanceRating: number; // 1-5 scale
  timezone: string;
  workingHours: {
    start: string; // HH:MM format
    end: string;
    daysOfWeek: number[]; // 0-6, Sunday = 0
  };
  lastActivity: string;
}

// Assignment rule configuration
export interface AssignmentRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: AssignmentCondition[];
  action: AssignmentAction;
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
}

export interface AssignmentCondition {
  field: 'bug_type' | 'severity' | 'priority' | 'keywords' | 'user_id' | 'time_of_day';
  operator: 'equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface AssignmentAction {
  assignTo: string | 'auto' | 'round_robin' | 'skill_based';
  setPriority?: BugPriority;
  setStatus?: BugStatus;
  addTags?: string[];
  notifyAdditional?: string[];
}

// Assignment recommendation
export interface AssignmentRecommendation {
  userId: string;
  userName: string;
  confidence: number; // 0-1 scale
  reasons: string[];
  workloadImpact: number;
  estimatedResolutionTime: number;
  skillMatch: number;
}

// Workload metrics
export interface WorkloadMetrics {
  userId: string;
  userName: string;
  openBugs: number;
  inProgressBugs: number;
  totalAssigned: number;
  averageResolutionTime: number;
  completionRate: number;
  workloadPercentage: number;
  recentActivity: {
    bugsResolved: number;
    bugsAssigned: number;
    avgResponseTime: number;
  };
}

// Priority escalation rule
export interface EscalationRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  cooldownPeriod: number; // minutes
  maxEscalations: number;
  notifyRoles: UserRole[];
}

export interface EscalationCondition {
  type: 'time_since_creation' | 'time_since_assignment' | 'time_in_status' | 'priority_level';
  threshold: number; // minutes for time conditions
  priority?: BugPriority;
  status?: BugStatus;
}

export interface EscalationAction {
  type: 'increase_priority' | 'reassign' | 'notify_manager' | 'add_comment';
  parameters: Record<string, unknown>;
}

// Assignment history record
export interface AssignmentHistory {
  id: string;
  bugReportId: string;
  fromUserId?: string;
  toUserId: string;
  assignedBy: string;
  method: AssignmentMethod;
  reason: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class BugAssignmentSystem {
  private static instance: BugAssignmentSystem;
  private teamMembers: Map<string, TeamMember> = new Map();
  private assignmentRules: AssignmentRule[] = [];
  private escalationRules: EscalationRule[] = [];
  private assignmentHistory: Map<string, AssignmentHistory[]> = new Map();
  private roundRobinIndex: number = 0;
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeTeamMembers();
    this.initializeAssignmentRules();
    this.initializeEscalationRules();
  }

  static getInstance(): BugAssignmentSystem {
    if (!BugAssignmentSystem.instance) {
      BugAssignmentSystem.instance = new BugAssignmentSystem();
    }
    return BugAssignmentSystem.instance;
  }

  /**
   * Assign bug to a team member
   */
  assignBug = async (
    bugId: string,
    assigneeId: string,
    assignerId: string,
    method: AssignmentMethod = 'manual',
    reason?: string,
    notify: boolean = true
  ): Promise<{ success: boolean; error?: string; assignment?: AssignmentHistory }> => {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'assignment-system',
        'system',
        'Starting bug assignment',
        { correlationId, bugId, assigneeId, assignerId, method }
      );

      // Get bug report
      const { data: bugReport, error: fetchError } = await bugReportOperations.getBugReportById(bugId);
      if (fetchError || !bugReport) {
        throw new Error(`Failed to fetch bug report: ${fetchError?.message || 'Bug not found'}`);
      }

      // Validate assignee
      const assignee = this.teamMembers.get(assigneeId);
      if (!assignee) {
        throw new Error(`Assignee not found: ${assigneeId}`);
      }

      // Check assignee availability and workload
      const validation = this.validateAssignment(assignee, bugReport);
      if (!validation.isValid) {
        centralizedLogging.warn(
          'assignment-system',
          'system',
          'Assignment validation warnings',
          { correlationId, bugId, assigneeId, warnings: validation.warnings }
        );
      }

      // Create assignment record
      const assignment: AssignmentHistory = {
        id: this.generateAssignmentId(),
        bugReportId: bugId,
        fromUserId: bugReport.assigned_to || undefined,
        toUserId: assigneeId,
        assignedBy: assignerId,
        method,
        reason: reason || `${method} assignment`,
        timestamp: new Date().toISOString(),
        metadata: {
          correlationId,
          previousAssignee: bugReport.assigned_to,
          assigneeWorkload: assignee.currentWorkload,
          validationWarnings: validation.warnings
        }
      };

      // Update bug report in database
      const { error: updateError } = await bugReportOperations.updateBugReport(bugId, {
        assigned_to: assigneeId,
        assigned_at: new Date().toISOString(),
        status: bugReport.status === BugStatus.OPEN ? BugStatus.TRIAGED : bugReport.status
      });

      if (updateError) {
        throw new Error(`Failed to update bug assignment: ${updateError.message}`);
      }

      // Update team member workload
      assignee.currentWorkload += 1;
      assignee.lastActivity = new Date().toISOString();

      // Reduce previous assignee's workload if reassignment
      if (assignment.fromUserId && assignment.fromUserId !== assigneeId) {
        const previousAssignee = this.teamMembers.get(assignment.fromUserId);
        if (previousAssignee && previousAssignee.currentWorkload > 0) {
          previousAssignee.currentWorkload -= 1;
        }
      }

      // Store assignment history
      this.addAssignmentToHistory(assignment);

      // Setup escalation monitoring
      this.setupEscalationMonitoring(bugId, assigneeId);

      // Send notification (non-blocking)
      if (notify) {
        try {
          await sendAssignmentNotification(bugId, assigneeId, assignerId, reason);
          // Track assignment event after notification
          trackBugReportEvent('bug_assigned', {
            bugId,
            assigneeId,
            assignerId,
            method,
            previousAssignee: assignment.fromUserId,
            workloadAfter: assignee.currentWorkload
          });
        } catch (notifyError) {
          centralizedLogging.warn(
            'assignment-system',
            'system',
            'Failed to send assignment notification',
            {
              correlationId,
              bugId,
              assigneeId,
              error: notifyError instanceof Error ? notifyError.message : notifyError,
            }
          );
        }
      } else {
        // Track assignment event even if notification is disabled
        trackBugReportEvent('bug_assigned', {
          bugId,
          assigneeId,
          assignerId,
          method,
          previousAssignee: assignment.fromUserId,
          workloadAfter: assignee.currentWorkload
        });
      }

      centralizedLogging.info(
        'assignment-system',
        'system',
        'Bug assigned successfully',
        {
          correlationId,
          bugId,
          assigneeId,
          assignmentId: assignment.id,
          method
        }
      );

      return {
        success: true,
        assignment
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'assignment-system',
        'system',
        'Failed to assign bug',
        { correlationId, bugId, assigneeId, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Auto-assign bug using rules and algorithms
   */
  async autoAssignBug(bugId: string, assignerId: string = 'system'): Promise<string | null>  {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'assignment-system',
        'system',
        'Starting auto-assignment',
        { correlationId, bugId }
      );

      // Get bug report
      const { data: bugReport, error: fetchError } = await bugReportOperations.getBugReportById(bugId);
      if (fetchError || !bugReport) {
        throw new Error(`Failed to fetch bug report: ${fetchError?.message || 'Bug not found'}`);
      }

      // Check assignment rules first
      const ruleAssignee = await this.applyAssignmentRules(bugReport);
      if (ruleAssignee) {
        const result = await this.assignBug(bugId, ruleAssignee, assignerId, 'auto', 'Assignment rule match');
        return result.success ? ruleAssignee : null;
      }

      // Get assignment recommendations
      const recommendations = await this.getAssignmentRecommendations(bugReport);
      if (recommendations.length === 0) {
        centralizedLogging.warn(
          'assignment-system',
          'system',
          'No assignment recommendations available',
          { correlationId, bugId }
        );
        return null;
      }

      // Select best recommendation
      const bestRecommendation = recommendations[0];
      const result = await this.assignBug(
        bugId,
        bestRecommendation.userId,
        assignerId,
        'auto',
        `Auto-assigned: ${bestRecommendation.reasons.join(', ')}`
      );

      return result.success ? bestRecommendation.userId : null;

    } catch (error) {
      centralizedLogging.error(
        'assignment-system',
        'system',
        'Auto-assignment failed',
        { correlationId, bugId, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      return null;
    }
  }

  /**
   * Get assignment recommendations for a bug
   */
  async getAssignmentRecommendations(bugReport: BugReport): Promise<AssignmentRecommendation[]>  {
    const availableMembers = Array.from(this.teamMembers.values())
      .filter(member => member.availability === 'available' && member.currentWorkload < member.workloadCapacity);

    if (availableMembers.length === 0) {
      return [];
    }

    const recommendations: AssignmentRecommendation[] = [];

    for (const member of availableMembers) {
      const skillMatch = this.calculateSkillMatch(member, bugReport);
      const normalizedWorkload = member.currentWorkload / member.workloadCapacity;
      const recentAssignments = this.getRecentAssignments(member.id, 7);
      const recentAssignmentsRatio = recentAssignments.length / 10; // Normalize to 0-1 range
      const reasons: string[] = [];
      
      // Calculate composite score: 60% skill match + 30% inverse workload + 10% inverse recent assignments
      const score = 
        0.6 * skillMatch +
        0.3 * (1 - normalizedWorkload) +
        0.1 * (1 - recentAssignmentsRatio);

      // Add reasoning
      if (skillMatch > 0.7) {
        reasons.push(`High skill match (${(skillMatch * 100).toFixed(0)}%)`);
      } else if (skillMatch > 0.4) {
        reasons.push(`Moderate skill match (${(skillMatch * 100).toFixed(0)}%)`);
      }

      if (normalizedWorkload < 0.5) {
        reasons.push('Low current workload');
      } else if (normalizedWorkload < 0.8) {
        reasons.push('Moderate workload');
      } else {
        reasons.push('High workload');
      }

      if (member.performanceRating >= 4) {
        reasons.push('High performer');
      }

      const hoursSinceActivity = (Date.now() - new Date(member.lastActivity).getTime()) / (1000 * 60 * 60);
      if (hoursSinceActivity < 4) {
        reasons.push('Recently active');
      }

      recommendations.push({
        userId: member.id,
        userName: member.name,
        confidence: Math.min(score, 1),
        reasons,
        workloadImpact: normalizedWorkload,
        estimatedResolutionTime: member.averageResolutionTime,
        skillMatch
      });
    }

    // Sort by score (higher is better)
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Escalate bug priority based on rules
   */
  async escalateBugPriority(
    bugId: string,
    reason: string,
    escalatedBy: string = 'system'
  ): Promise<{ success: boolean; newPriority?: BugPriority; error?: string }> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'assignment-system',
        'system',
        'Starting priority escalation',
        { correlationId, bugId, reason, escalatedBy }
      );

      // Get bug report
      const { data: bugReport, error: fetchError } = await bugReportOperations.getBugReportById(bugId);
      if (fetchError || !bugReport) {
        throw new Error(`Failed to fetch bug report: ${fetchError?.message || 'Bug not found'}`);
      }

      const currentPriority = bugReport.priority as BugPriority;
      
      // Check if escalation is allowed from current status
      const currentStatus = bugReport.status as BugStatus;
      const allowedStatuses = [BugStatus.OPEN, BugStatus.IN_PROGRESS, BugStatus.REOPENED];
      
      if (!allowedStatuses.includes(currentStatus)) {
        return {
          success: false,
          error: `Cannot escalate bug from status: ${currentStatus}. Allowed statuses: ${allowedStatuses.join(', ')}`
        };
      }

      const newPriority = this.getNextPriorityLevel(currentPriority);

      if (!newPriority) {
        return {
          success: false,
          error: 'Bug is already at maximum priority level'
        };
      }

      // Update bug priority
      const { error: updateError } = await bugReportOperations.updateBugReport(bugId, {
        priority: newPriority,
        escalated_at: new Date().toISOString(),
        escalation_reason: reason
      });

      if (updateError) {
        throw new Error(`Failed to update bug priority: ${updateError.message}`);
      }

      // Create audit trail entry for escalation
      const auditEntry = {
        bugId,
        action: 'priority_escalated',
        performedBy: escalatedBy,
        fromPriority: currentPriority,
        toPriority: newPriority,
        reason,
        timestamp: new Date().toISOString()
      };

      // Send escalation alerts
      const managerIds = this.getManagerIds();
      if (managerIds.length > 0) {
        await sendEscalationAlert(bugId, newPriority, reason, managerIds);
      }

      // Track escalation event
      trackBugReportEvent('bug_escalated', {
        bugId,
        fromPriority: currentPriority,
        toPriority: newPriority,
        reason,
        escalatedBy,
        auditEntry
      });

      centralizedLogging.info(
        'assignment-system',
        'system',
        'Bug priority escalated successfully',
        {
          correlationId,
          bugId,
          fromPriority: currentPriority,
          toPriority: newPriority,
          reason
        }
      );

      return {
        success: true,
        newPriority
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'assignment-system',
        'system',
        'Failed to escalate bug priority',
        { correlationId, bugId, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get workload metrics for all team members
   */
  getWorkloadMetrics(): WorkloadMetrics[] {
    return Array.from(this.teamMembers.values()).map(member => {
      const recentAssignments = this.getRecentAssignments(member.id, 7); // Last 7 days
      const completionRate = this.calculateCompletionRate(member.id);

      return {
        userId: member.id,
        userName: member.name,
        openBugs: this.getOpenBugCount(member.id),
        inProgressBugs: this.getInProgressBugCount(member.id),
        totalAssigned: member.currentWorkload,
        averageResolutionTime: member.averageResolutionTime,
        completionRate,
        workloadPercentage: (member.currentWorkload / member.workloadCapacity) * 100,
        recentActivity: {
          bugsResolved: this.getResolvedBugCount(member.id, 7),
          bugsAssigned: recentAssignments.length,
          avgResponseTime: this.getAverageResponseTime(member.id)
        }
      };
    });
  }

  /**
   * Balance workload across team members
   */
  async balanceWorkload(): Promise<AssignmentRecommendation[]>  {
    const workloadMetrics = this.getWorkloadMetrics();
    const recommendations: AssignmentRecommendation[] = [];

    // Find overloaded and underloaded team members
    const overloaded = workloadMetrics.filter(m => m.workloadPercentage > 80);
    const underloaded = workloadMetrics.filter(m => m.workloadPercentage < 50);

    if (overloaded.length === 0 || underloaded.length === 0) {
      return recommendations;
    }

    // Get unassigned bugs or bugs from overloaded members
    const unassignedBugs = await this.getUnassignedBugs();
    
    for (const bug of unassignedBugs.slice(0, 5)) { // Limit to 5 recommendations
      const bugRecommendations = await this.getAssignmentRecommendations(bug);
      const bestUnderloaded = bugRecommendations.find(rec => 
        underloaded.some(ul => ul.userId === rec.userId)
      );

      if (bestUnderloaded) {
        recommendations.push(bestUnderloaded);
      }
    }

    return recommendations;
  }

  /**
   * Get assignment history for a bug
   */
  getAssignmentHistory(bugId: string): AssignmentHistory[] {
    return this.assignmentHistory.get(bugId) || [];
  }

  /**
   * Update team member information
   */
  updateTeamMember(userId: string, updates: Partial<TeamMember>): boolean {
    const member = this.teamMembers.get(userId);
    if (!member) {
      return false;
    }

    Object.assign(member, updates);
    this.teamMembers.set(userId, member);

    centralizedLogging.info(
      'assignment-system',
      'system',
      'Team member updated',
      { userId, updates }
    );

    return true;
  }

  // Private helper methods
  private initializeTeamMembers(): void {
    // Initialize with sample team members
    const sampleMembers: TeamMember[] = [
      {
        id: 'user_1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'senior_dev',
        availability: 'available',
        specializationAreas: ['frontend', 'react', 'typescript'],
        workloadCapacity: 8,
        currentWorkload: 3,
        averageResolutionTime: 24,
        performanceRating: 4.5,
        timezone: 'UTC',
        workingHours: {
          start: '09:00',
          end: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5]
        },
        lastActivity: new Date().toISOString()
      },
      {
        id: 'user_2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'developer',
        availability: 'available',
        specializationAreas: ['backend', 'api', 'database'],
        workloadCapacity: 6,
        currentWorkload: 2,
        averageResolutionTime: 36,
        performanceRating: 4.0,
        timezone: 'UTC',
        workingHours: {
          start: '10:00',
          end: '18:00',
          daysOfWeek: [1, 2, 3, 4, 5]
        },
        lastActivity: new Date().toISOString()
      },
      {
        id: 'user_3',
        name: 'Carol Davis',
        email: 'carol@example.com',
        role: 'qa',
        availability: 'available',
        specializationAreas: ['testing', 'automation', 'quality_assurance'],
        workloadCapacity: 10,
        currentWorkload: 5,
        averageResolutionTime: 18,
        performanceRating: 4.2,
        timezone: 'UTC',
        workingHours: {
          start: '08:00',
          end: '16:00',
          daysOfWeek: [1, 2, 3, 4, 5]
        },
        lastActivity: new Date().toISOString()
      }
    ];

    sampleMembers.forEach(member => {
      this.teamMembers.set(member.id, member);
    });
  }

  private initializeAssignmentRules(): void {
    this.assignmentRules = [
      {
        id: 'rule_1',
        name: 'Frontend bugs to Alice',
        enabled: true,
        priority: 1,
        conditions: [
          { field: 'bug_type', operator: 'equals', value: 'ui_ux' },
          { field: 'keywords', operator: 'contains', value: 'frontend' }
        ],
        action: {
          assignTo: 'user_1',
          setPriority: BugPriority.MEDIUM
        },
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rule_2',
        name: 'Critical bugs auto-escalate',
        enabled: true,
        priority: 2,
        conditions: [
          { field: 'severity', operator: 'equals', value: 'critical' }
        ],
        action: {
          assignTo: 'skill_based',
          setPriority: BugPriority.URGENT,
          notifyAdditional: ['manager']
        },
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
  }

  private initializeEscalationRules(): void {
    this.escalationRules = [
      {
        id: 'escalation_1',
        name: 'Escalate after 24 hours',
        enabled: true,
        conditions: [
          { type: 'time_since_assignment', threshold: 24 * 60 } // 24 hours
        ],
        actions: [
          { type: 'increase_priority', parameters: {} },
          { type: 'notify_manager', parameters: {} }
        ],
        cooldownPeriod: 12 * 60, // 12 hours
        maxEscalations: 3,
        notifyRoles: ['admin', 'senior_dev']
      }
    ];
  }

  private async applyAssignmentRules(bugReport: BugReport): Promise<string | null>  {
    const sortedRules = this.assignmentRules
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (this.evaluateRuleConditions(rule.conditions, bugReport)) {
        if (rule.action.assignTo && rule.action.assignTo !== 'auto' && rule.action.assignTo !== 'round_robin') {
          rule.lastUsed = new Date().toISOString();
          return rule.action.assignTo;
        }
      }
    }

    return null;
  }

  private evaluateRuleConditions(conditions: AssignmentCondition[], bugReport: BugReport): boolean {
    return conditions.every(condition => {
      const fieldValue = bugReport[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }

  private calculateSkillMatch(member: TeamMember, bugReport: BugReport): number {
    const bugKeywords = [
      bugReport.bug_type,
      bugReport.severity,
      ...(bugReport.description?.toLowerCase().split(' ') || [])
    ];

    const matches = member.specializationAreas.filter(skill =>
      bugKeywords.some(keyword => 
        keyword && String(keyword).toLowerCase().includes(skill.toLowerCase())
      )
    );

    return matches.length > 0 ? matches.length / member.specializationAreas.length : 0.1;
  }

  private calculateWorkloadImpact(member: TeamMember): number {
    return member.currentWorkload / member.workloadCapacity;
  }

  private validateAssignment(assignee: TeamMember, bugReport: BugReport): { isValid: boolean; warnings: string[] } {
    // bugReport parameter available for future validation logic
    void bugReport;
    const warnings: string[] = [];
    const isValid = true;

    if (assignee.availability !== 'available') {
      warnings.push(`Assignee is ${assignee.availability}`);
    }

    if (assignee.currentWorkload >= assignee.workloadCapacity) {
      warnings.push('Assignee is at maximum workload capacity');
    }

    const workloadPercentage = (assignee.currentWorkload / assignee.workloadCapacity) * 100;
    if (workloadPercentage > 80) {
      warnings.push(`Assignee has high workload (${workloadPercentage.toFixed(0)}%)`);
    }

    return { isValid, warnings };
  }

  private setupEscalationMonitoring(bugId: string, assigneeId: string): void {
    // assigneeId parameter available for future escalation logic
    void assigneeId;
    // Clear existing escalation timers for this bug
    this.clearEscalationTimers(bugId);

    // Setup new escalation timers based on rules
    this.escalationRules.forEach(rule => {
      if (!rule.enabled) return;

      rule.conditions.forEach(condition => {
        if (condition.type === 'time_since_assignment') {
          const timer = setTimeout(() => {
            this.handleEscalation(bugId, rule);
          }, condition.threshold * 60 * 1000); // Convert minutes to milliseconds

          this.escalationTimers.set(`${bugId}_${rule.id}_${condition.type}`, timer);
        }
      });
    });
  }

  private clearEscalationTimers(bugId: string): void {
    for (const [key, timer] of this.escalationTimers.entries()) {
      if (key.startsWith(bugId + '_')) {
        clearTimeout(timer);
        this.escalationTimers.delete(key);
      }
    }
  }

  private async handleEscalation(bugId: string, rule: EscalationRule): Promise<void>  {
    try {
      for (const action of rule.actions) {
        switch (action.type) {
          case 'increase_priority':
            await this.escalateBugPriority(bugId, `Auto-escalation: ${rule.name}`);
            break;
          case 'notify_manager': {
            const managerIds = this.getManagerIds();
            await sendEscalationAlert(bugId, BugPriority.HIGH, `Escalation rule: ${rule.name}`, managerIds);
            break;
          }
        }
      }
    } catch (error) {
      centralizedLogging.error(
        'assignment-system',
        'system',
        'Escalation handling failed',
        { bugId, ruleId: rule.id, error }
      );
    }
  }

  private getNextPriorityLevel(currentPriority: BugPriority): BugPriority | null {
    const priorityLevels = [BugPriority.LOW, BugPriority.MEDIUM, BugPriority.HIGH, BugPriority.CRITICAL, BugPriority.URGENT];
    const currentIndex = priorityLevels.indexOf(currentPriority);
    
    return currentIndex < priorityLevels.length - 1 ? priorityLevels[currentIndex + 1] : null;
  }

  private getManagerIds(): string[] {
    return Array.from(this.teamMembers.values())
      .filter(member => member.role === 'admin' || member.role === 'senior_dev')
      .map(member => member.id);
  }

  private addAssignmentToHistory(assignment: AssignmentHistory): void {
    const history = this.assignmentHistory.get(assignment.bugReportId) || [];
    history.push(assignment);
    
    // Keep only last 20 assignments per bug
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.assignmentHistory.set(assignment.bugReportId, history);
  }

  private getRecentAssignments(userId: string, days: number): AssignmentHistory[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const allAssignments: AssignmentHistory[] = [];
    
    this.assignmentHistory.forEach(assignments => {
      allAssignments.push(...assignments.filter(a => 
        a.toUserId === userId && new Date(a.timestamp) > cutoff
      ));
    });
    
    return allAssignments;
  }

  private calculateCompletionRate(userId: string): number {
    // This would typically query the database for actual completion statistics
    // For now, return a calculated value based on performance rating
    const member = this.teamMembers.get(userId);
    return member ? (member.performanceRating / 5) * 100 : 0;
  }

  private getOpenBugCount(userId: string): number {
    // This would query the database for actual open bug counts
    const member = this.teamMembers.get(userId);
    return member ? Math.floor(member.currentWorkload * 0.6) : 0;
  }

  private getInProgressBugCount(userId: string): number {
    // This would query the database for actual in-progress bug counts
    const member = this.teamMembers.get(userId);
    return member ? Math.floor(member.currentWorkload * 0.4) : 0;
  }

  private getResolvedBugCount(userId: string, days: number): number {
    // This would query the database for actual resolved bug counts
    const member = this.teamMembers.get(userId);
    return member ? Math.floor((member.performanceRating * days) / 5) : 0;
  }

  private getAverageResponseTime(userId: string): number {
    // This would calculate from actual response time data
    const member = this.teamMembers.get(userId);
    return member ? member.averageResolutionTime / 4 : 0; // Rough estimate
  }

  private async getUnassignedBugs(): Promise<BugReport[]> {
    // This would query the database for unassigned bugs
    // For now, return empty array as placeholder
    return [];
  }

  private generateCorrelationId(): string {
    return `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAssignmentId(): string {
    return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  destroy(): void {
    // Clear all escalation timers
    this.escalationTimers.forEach(timer => clearTimeout(timer));
    this.escalationTimers.clear();
  }
}

// Export singleton instance
export const bugAssignmentSystem = BugAssignmentSystem.getInstance();

// Export convenience functions
export const assignBug = (
  bugId: string,
  assigneeId: string,
  assignerId: string,
  method: AssignmentMethod = 'manual',
  reason?: string
) => bugAssignmentSystem.assignBug(bugId, assigneeId, assignerId, method, reason);

export const autoAssignBug = (bugId: string, assignerId?: string) =>
  bugAssignmentSystem.autoAssignBug(bugId, assignerId);

export const getAssignmentRecommendations = (bugReport: BugReport) =>
  bugAssignmentSystem.getAssignmentRecommendations(bugReport);

export const escalateBugPriority = (bugId: string, reason: string, escalatedBy?: string) =>
  bugAssignmentSystem.escalateBugPriority(bugId, reason, escalatedBy);

export const getWorkloadMetrics = () => bugAssignmentSystem.getWorkloadMetrics();

export const balanceWorkload = () => bugAssignmentSystem.balanceWorkload();

export default bugAssignmentSystem;