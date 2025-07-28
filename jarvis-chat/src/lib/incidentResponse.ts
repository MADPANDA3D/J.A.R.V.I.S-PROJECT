/**
 * Automated Incident Response Workflows
 * Provides incident detection, classification, escalation, and automated response
 */

import { monitoringService } from './monitoring';
import { advancedErrorTracker } from './advancedErrorTracking';
import { healthMonitoringService } from './healthMonitoring';
import { logAggregationService } from './logAggregation';
import { captureError, captureWarning, captureInfo } from './errorTracking';

// Incident interfaces
export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status:
    | 'detected'
    | 'investigating'
    | 'identified'
    | 'monitoring'
    | 'resolved'
    | 'closed';
  source:
    | 'health_monitoring'
    | 'error_tracking'
    | 'log_analysis'
    | 'performance'
    | 'manual';
  detectedAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  closedAt?: number;
  assignee?: string;
  affectedSystems: string[];
  affectedUsers: number;
  businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  timeline: IncidentTimelineEntry[];
  relatedAlerts: string[];
  relatedErrors: string[];
  relatedLogs: string[];
  automatedActions: AutomatedAction[];
  communications: IncidentCommunication[];
  postMortem?: PostMortem;
  metrics: IncidentMetrics;
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: number;
  type:
    | 'detection'
    | 'escalation'
    | 'action'
    | 'communication'
    | 'status_change'
    | 'resolution';
  actor: 'system' | 'user';
  actorId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AutomatedAction {
  id: string;
  type:
    | 'restart_service'
    | 'scale_resources'
    | 'failover'
    | 'notification'
    | 'diagnostic'
    | 'mitigation';
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  triggeredAt: number;
  completedAt?: number;
  result?: string;
  metadata?: Record<string, unknown>;
}

export interface IncidentCommunication {
  id: string;
  type: 'email' | 'slack' | 'sms' | 'webhook' | 'status_page';
  recipient: string;
  subject: string;
  message: string;
  sentAt: number;
  status: 'sent' | 'failed' | 'pending';
  metadata?: Record<string, unknown>;
}

export interface PostMortem {
  id: string;
  incidentId: string;
  conductedAt: number;
  facilitator: string;
  participants: string[];
  timeline: PostMortemTimelineEntry[];
  rootCause: {
    primary: string;
    contributing: string[];
    category: 'technical' | 'process' | 'human' | 'external';
  };
  impact: {
    duration: number; // minutes
    affectedUsers: number;
    businessLoss?: number;
    reputationImpact?: 'none' | 'low' | 'medium' | 'high';
  };
  response: {
    detectionTime: number; // minutes
    responseTime: number; // minutes
    resolutionTime: number; // minutes
    communicationEffectiveness: 'poor' | 'fair' | 'good' | 'excellent';
  };
  actionItems: PostMortemActionItem[];
  lessonsLearned: string[];
  documentation: string[];
}

export interface PostMortemTimelineEntry {
  timestamp: number;
  event: string;
  details: string;
  source: string;
}

export interface PostMortemActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  category:
    | 'monitoring'
    | 'alerting'
    | 'process'
    | 'training'
    | 'infrastructure'
    | 'documentation';
}

export interface IncidentMetrics {
  detectionTime?: number; // Time from issue occurrence to detection
  responseTime?: number; // Time from detection to first response
  resolutionTime?: number; // Time from detection to resolution
  mttr: number; // Mean Time To Resolution
  mtbf: number; // Mean Time Between Failures
  customerImpactScore: number; // 0-100
  automatedActionsTriggered: number;
  manualInterventionsRequired: number;
}

export interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  enabled: boolean;
  priority: number;
}

export interface EscalationCondition {
  type:
    | 'severity'
    | 'duration'
    | 'system'
    | 'user_impact'
    | 'business_impact'
    | 'no_acknowledgment';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
  value: string | number;
  timeWindow?: number; // milliseconds
}

export interface EscalationAction {
  type:
    | 'notify'
    | 'assign'
    | 'execute_runbook'
    | 'create_war_room'
    | 'update_status_page';
  target: string;
  parameters?: Record<string, unknown>;
  delay?: number; // milliseconds
}

export interface ResponsePlaybook {
  id: string;
  name: string;
  description: string;
  triggers: PlaybookTrigger[];
  steps: PlaybookStep[];
  enabled: boolean;
  lastUpdated: number;
  version: string;
}

export interface PlaybookTrigger {
  type:
    | 'error_pattern'
    | 'health_check_failure'
    | 'performance_degradation'
    | 'security_event';
  conditions: Record<string, unknown>;
}

export interface PlaybookStep {
  id: string;
  name: string;
  type:
    | 'diagnostic'
    | 'mitigation'
    | 'communication'
    | 'escalation'
    | 'manual_action';
  action: string;
  parameters?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
  continueOnFailure?: boolean;
  requires?: string[]; // Prerequisites step IDs
}

class IncidentResponseService {
  private incidents: Map<string, Incident> = new Map();
  private escalationRules: EscalationRule[] = [];
  private playbooks: Map<string, ResponsePlaybook> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: number;
  private escalationInterval?: number;

  constructor() {
    this.initializeEscalationRules();
    this.initializePlaybooks();
    this.startMonitoring();
  }

  private initializeEscalationRules(): void {
    // Critical severity immediate escalation
    this.escalationRules.push({
      id: 'critical_immediate',
      name: 'Critical Severity Immediate Escalation',
      conditions: [{ type: 'severity', operator: 'equals', value: 'critical' }],
      actions: [
        { type: 'notify', target: 'on_call_engineer' },
        { type: 'notify', target: 'incident_commander' },
        { type: 'create_war_room', target: 'critical_incidents' },
        { type: 'update_status_page', target: 'investigating' },
      ],
      enabled: true,
      priority: 1,
    });

    // No acknowledgment escalation
    this.escalationRules.push({
      id: 'no_ack_escalation',
      name: 'No Acknowledgment Escalation',
      conditions: [
        {
          type: 'no_acknowledgment',
          operator: 'greater_than',
          value: 15,
          timeWindow: 15 * 60 * 1000,
        }, // 15 minutes
        { type: 'severity', operator: 'equals', value: 'high' },
      ],
      actions: [
        { type: 'notify', target: 'escalation_manager' },
        { type: 'assign', target: 'senior_engineer' },
      ],
      enabled: true,
      priority: 2,
    });

    // Duration-based escalation
    this.escalationRules.push({
      id: 'duration_escalation',
      name: 'Long Duration Escalation',
      conditions: [
        {
          type: 'duration',
          operator: 'greater_than',
          value: 60,
          timeWindow: 60 * 60 * 1000,
        }, // 1 hour
        { type: 'severity', operator: 'equals', value: 'medium' },
      ],
      actions: [
        { type: 'notify', target: 'team_lead' },
        { type: 'execute_runbook', target: 'extended_incident_procedures' },
      ],
      enabled: true,
      priority: 3,
    });

    // User impact escalation
    this.escalationRules.push({
      id: 'user_impact_escalation',
      name: 'High User Impact Escalation',
      conditions: [
        { type: 'user_impact', operator: 'greater_than', value: 100 },
      ],
      actions: [
        { type: 'notify', target: 'product_manager' },
        { type: 'notify', target: 'customer_success' },
        { type: 'update_status_page', target: 'service_disruption' },
      ],
      enabled: true,
      priority: 4,
    });
  }

  private initializePlaybooks(): void {
    // Database connection failure playbook
    this.playbooks.set('database_failure', {
      id: 'database_failure',
      name: 'Database Connection Failure Response',
      description: 'Automated response for database connectivity issues',
      triggers: [
        {
          type: 'error_pattern',
          conditions: { pattern: 'database.*connection.*failed' },
        },
        {
          type: 'health_check_failure',
          conditions: { service: 'database', consecutive_failures: 3 },
        },
      ],
      steps: [
        {
          id: 'diagnose_connection',
          name: 'Diagnose Connection',
          type: 'diagnostic',
          action: 'check_database_connectivity',
          timeout: 30000,
        },
        {
          id: 'restart_connection_pool',
          name: 'Restart Connection Pool',
          type: 'mitigation',
          action: 'restart_database_pool',
          timeout: 60000,
          requires: ['diagnose_connection'],
        },
        {
          id: 'notify_team',
          name: 'Notify Database Team',
          type: 'communication',
          action: 'send_notification',
          parameters: { team: 'database', severity: 'high' },
        },
        {
          id: 'enable_readonly_mode',
          name: 'Enable Read-Only Mode',
          type: 'mitigation',
          action: 'enable_readonly_mode',
          continueOnFailure: true,
        },
      ],
      enabled: true,
      lastUpdated: Date.now(),
      version: '1.0',
    });

    // Performance degradation playbook
    this.playbooks.set('performance_degradation', {
      id: 'performance_degradation',
      name: 'Performance Degradation Response',
      description: 'Automated response for performance issues',
      triggers: [
        {
          type: 'performance_degradation',
          conditions: {
            metric: 'response_time',
            threshold: 1000,
            duration: 300000,
          },
        },
      ],
      steps: [
        {
          id: 'collect_metrics',
          name: 'Collect Performance Metrics',
          type: 'diagnostic',
          action: 'collect_performance_data',
          timeout: 30000,
        },
        {
          id: 'check_resource_usage',
          name: 'Check Resource Usage',
          type: 'diagnostic',
          action: 'check_system_resources',
          timeout: 30000,
        },
        {
          id: 'scale_resources',
          name: 'Scale Resources',
          type: 'mitigation',
          action: 'auto_scale_resources',
          timeout: 120000,
          requires: ['check_resource_usage'],
        },
        {
          id: 'alert_performance_team',
          name: 'Alert Performance Team',
          type: 'communication',
          action: 'send_notification',
          parameters: { team: 'performance', severity: 'medium' },
        },
      ],
      enabled: true,
      lastUpdated: Date.now(),
      version: '1.0',
    });

    // Security incident playbook
    this.playbooks.set('security_incident', {
      id: 'security_incident',
      name: 'Security Incident Response',
      description: 'Automated response for security events',
      triggers: [
        {
          type: 'security_event',
          conditions: { type: 'suspicious_activity', severity: 'high' },
        },
      ],
      steps: [
        {
          id: 'isolate_threat',
          name: 'Isolate Potential Threat',
          type: 'mitigation',
          action: 'isolate_security_threat',
          timeout: 60000,
        },
        {
          id: 'collect_forensics',
          name: 'Collect Forensic Data',
          type: 'diagnostic',
          action: 'collect_security_logs',
          timeout: 120000,
        },
        {
          id: 'notify_security_team',
          name: 'Notify Security Team',
          type: 'communication',
          action: 'send_urgent_notification',
          parameters: { team: 'security', severity: 'critical' },
        },
        {
          id: 'escalate_to_ciso',
          name: 'Escalate to CISO',
          type: 'escalation',
          action: 'escalate_security_incident',
          delay: 15 * 60 * 1000, // 15 minutes delay
        },
      ],
      enabled: true,
      lastUpdated: Date.now(),
      version: '1.0',
    });
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor for incidents every 30 seconds
    this.monitoringInterval = window.setInterval(() => {
      this.detectIncidents();
      this.executeAutomatedActions();
    }, 30000);

    // Check escalation rules every minute
    this.escalationInterval = window.setInterval(() {
      this.checkEscalationRules();
    }, 60000);
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    if (this.escalationInterval) {
      clearInterval(this.escalationInterval);
      this.escalationInterval = undefined;
    }
  }

  private async detectIncidents(): Promise<void> {
    try {
      // Check health monitoring for incidents
      await this.checkHealthMonitoringIncidents();

      // Check error tracking for incidents
      await this.checkErrorTrackingIncidents();

      // Check log analysis for incidents
      await this.checkLogAnalysisIncidents();

      // Check performance monitoring for incidents
      await this.checkPerformanceIncidents();
    } catch {
      captureError(
        error instanceof Error ? error : new Error('Incident detection failed'),
        {
          service: 'incident_response',
        }
      );
    }
  }

  private async checkHealthMonitoringIncidents(): Promise<void> {
    const healthAlerts = healthMonitoringService.getAlerts({
      type: 'error',
      acknowledged: false,
    });

    healthAlerts.forEach(alert => {
      if (!this.isIncidentAlreadyCreated('health_alert', alert.id)) {
        this.createIncident({
          title: `Health Alert: ${alert.title}`,
          description: alert.message,
          severity: this.mapHealthAlertSeverity(alert.type),
          source: 'health_monitoring',
          affectedSystems: [alert.service || 'unknown'],
          relatedAlerts: [alert.id],
          tags: ['health', 'automated'],
        });
      }
    });
  }

  private async checkErrorTrackingIncidents(): Promise<void> {
    const errorAlerts = advancedErrorTracker.getAlerts({
      severity: 'critical',
      acknowledged: false,
    });

    errorAlerts.forEach(alert => {
      if (!this.isIncidentAlreadyCreated('error_alert', alert.id)) {
        this.createIncident({
          title: `Critical Error: ${alert.title}`,
          description: alert.message,
          severity: 'critical',
          source: 'error_tracking',
          affectedSystems: this.extractAffectedSystems(alert.metadata),
          relatedAlerts: [alert.id],
          relatedErrors: alert.errorId ? [alert.errorId] : [],
          tags: ['error', 'automated', 'critical'],
        });
      }
    });

    // Check for error patterns that indicate incidents
    const errorPatterns = advancedErrorTracker.getErrorPatterns({
      status: 'active',
      impact: 'critical',
    });

    errorPatterns.forEach(pattern => {
      if (!this.isIncidentAlreadyCreated('error_pattern', pattern.id)) {
        this.createIncident({
          title: `Error Pattern: ${pattern.pattern}`,
          description: `Critical error pattern detected with ${pattern.frequency} occurrences affecting ${pattern.affectedUsers.size} users`,
          severity: 'high',
          source: 'error_tracking',
          affectedSystems: ['application'],
          tags: ['error_pattern', 'automated'],
        });
      }
    });
  }

  private async checkLogAnalysisIncidents(): Promise<void> {
    const logAlerts = logAggregationService.getAlerts({
      level: 'critical',
      acknowledged: false,
    });

    logAlerts.forEach(alert => {
      if (!this.isIncidentAlreadyCreated('log_alert', alert.id)) {
        this.createIncident({
          title: `Log Alert: ${alert.title}`,
          description: alert.message,
          severity: 'high',
          source: 'log_analysis',
          affectedSystems: ['logging', 'application'],
          relatedAlerts: [alert.id],
          relatedLogs: alert.matchedEntries,
          tags: ['log_analysis', 'automated'],
        });
      }
    });
  }

  private async checkPerformanceIncidents(): Promise<void> {
    const monitoringHealth = monitoringService.getMonitoringHealth();

    if (
      monitoringHealth.status === 'unhealthy' &&
      !this.isIncidentAlreadyCreated(
        'monitoring_health',
        'performance_degradation'
      )
    ) {
      this.createIncident({
        title: 'Performance Degradation Detected',
        description: `Monitoring system reports unhealthy status with ${monitoringHealth.metrics.recentErrors} recent errors`,
        severity: 'medium',
        source: 'performance',
        affectedSystems: ['monitoring', 'application'],
        tags: ['performance', 'automated'],
      });
    }
  }

  private isIncidentAlreadyCreated(
    sourceType: string,
    sourceId: string
  ): boolean {
    return Array.from(this.incidents.values()).some(
      incident =>
        incident.status !== 'closed' &&
        incident.timeline.some(
          entry =>
            entry.metadata?.sourceType === sourceType &&
            entry.metadata?.sourceId === sourceId
        )
    );
  }

  private mapHealthAlertSeverity(alertType: string): Incident['severity'] {
    switch (alertType) {
      case 'error':
        return 'high';
      case 'warning':
        return 'medium';
      default:
        return 'low';
    }
  }

  private extractAffectedSystems(metadata?: Record<string, unknown>): string[] {
    if (!metadata) return ['unknown'];

    const systems: string[] = [];

    if (metadata.service) systems.push(metadata.service as string);
    if (metadata.component) systems.push(metadata.component as string);
    if (metadata.system) systems.push(metadata.system as string);

    return systems.length > 0 ? systems : ['application'];
  }

  private createIncident(params: {
    title: string;
    description: string;
    severity: Incident['severity'];
    source: Incident['source'];
    affectedSystems: string[];
    relatedAlerts?: string[];
    relatedErrors?: string[];
    relatedLogs?: string[];
    tags: string[];
  }): Incident {
    const incident: Incident = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: params.title,
      description: params.description,
      severity: params.severity,
      priority: this.mapSeverityToPriority(params.severity),
      status: 'detected',
      source: params.source,
      detectedAt: Date.now(),
      affectedSystems: params.affectedSystems,
      affectedUsers: this.estimateAffectedUsers(
        params.severity,
        params.affectedSystems
      ),
      businessImpact: this.assessBusinessImpact(
        params.severity,
        params.affectedSystems
      ),
      tags: params.tags,
      timeline: [],
      relatedAlerts: params.relatedAlerts || [],
      relatedErrors: params.relatedErrors || [],
      relatedLogs: params.relatedLogs || [],
      automatedActions: [],
      communications: [],
      metrics: this.initializeIncidentMetrics(),
    };

    // Add detection timeline entry
    this.addTimelineEntry(incident, {
      type: 'detection',
      actor: 'system',
      description: `Incident detected from ${params.source}`,
      metadata: { source: params.source, automated: true },
    });

    this.incidents.set(incident.id, incident);

    // Trigger automated response
    this.triggerAutomatedResponse(incident);

    // Track incident creation
    monitoringService.trackBusinessEvent('incident.created', {
      incidentId: incident.id,
      severity: incident.severity,
      source: incident.source,
      affectedSystems: incident.affectedSystems,
    });

    captureInfo(`Incident created: ${incident.title}`, {
      incidentId: incident.id,
      severity: incident.severity,
      source: incident.source,
    });

    return incident;
  }

  private mapSeverityToPriority(
    severity: Incident['severity']
  ): Incident['priority'] {
    switch (severity) {
      case 'critical':
        return 'P1';
      case 'high':
        return 'P2';
      case 'medium':
        return 'P3';
      case 'low':
        return 'P4';
    }
  }

  private estimateAffectedUsers(
    severity: Incident['severity'],
    systems: string[]
  ): number {
    // Simple estimation based on severity and affected systems
    let baseUsers = 0;

    if (systems.includes('database')) baseUsers += 1000;
    if (systems.includes('authentication')) baseUsers += 800;
    if (systems.includes('api')) baseUsers += 600;
    if (systems.includes('frontend')) baseUsers += 400;

    const severityMultiplier = {
      critical: 1.0,
      high: 0.7,
      medium: 0.4,
      low: 0.1,
    };

    return Math.floor(baseUsers * severityMultiplier[severity]);
  }

  private assessBusinessImpact(
    severity: Incident['severity'],
    systems: string[]
  ): Incident['businessImpact'] {
    if (severity === 'critical') return 'critical';

    const criticalSystems = ['database', 'authentication', 'payment'];
    const hasCriticalSystem = systems.some(sys =>
      criticalSystems.includes(sys)
    );

    if (hasCriticalSystem && (severity === 'high' || severity === 'medium')) {
      return severity === 'high' ? 'high' : 'medium';
    }

    return severity === 'high' ? 'medium' : 'low';
  }

  private initializeIncidentMetrics(): IncidentMetrics {
    return {
      mttr: 0,
      mtbf: 0,
      customerImpactScore: 0,
      automatedActionsTriggered: 0,
      manualInterventionsRequired: 0,
    };
  }

  private addTimelineEntry(
    incident: Incident,
    entry: Omit<IncidentTimelineEntry, 'id' | 'timestamp'>
  ): void {
    const timelineEntry: IncidentTimelineEntry = {
      id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...entry,
    };

    incident.timeline.push(timelineEntry);
  }

  private async triggerAutomatedResponse(incident: Incident): Promise<void> {
    try {
      // Find matching playbooks
      const matchingPlaybooks = this.findMatchingPlaybooks(incident);

      for (const playbook of matchingPlaybooks) {
        await this.executePlaybook(incident, playbook);
      }

      // Trigger immediate escalation for critical incidents
      if (incident.severity === 'critical') {
        this.triggerEscalation(incident, 'critical_immediate');
      }
    } catch {
      captureError(
        error instanceof Error ? error : new Error('Automated response failed'),
        {
          incidentId: incident.id,
          service: 'incident_response',
        }
      );
    }
  }

  private findMatchingPlaybooks(incident: Incident): ResponsePlaybook[] {
    const matchingPlaybooks: ResponsePlaybook[] = [];

    this.playbooks.forEach(playbook => {
      if (!playbook.enabled) return;

      const matches = playbook.triggers.some(trigger => {
        switch (trigger.type) {
          case 'error_pattern':
            return (
              incident.source === 'error_tracking' &&
              incident.description.includes('pattern')
            );
          case 'health_check_failure':
            return incident.source === 'health_monitoring';
          case 'performance_degradation':
            return incident.source === 'performance';
          case 'security_event':
            return incident.tags.includes('security');
          default:
            return false;
        }
      });

      if (matches) {
        matchingPlaybooks.push(playbook);
      }
    });

    return matchingPlaybooks;
  }

  private async executePlaybook(
    incident: Incident,
    playbook: ResponsePlaybook
  ): Promise<void> {
    this.addTimelineEntry(incident, {
      type: 'action',
      actor: 'system',
      description: `Executing playbook: ${playbook.name}`,
      metadata: { playbookId: playbook.id, automated: true },
    });

    for (const step of playbook.steps) {
      if (step.requires && !this.arePrerequisitesMet(incident, step.requires)) {
        continue;
      }

      const action = await this.executePlaybookStep(incident, step);
      incident.automatedActions.push(action);
      incident.metrics.automatedActionsTriggered++;
    }
  }

  private arePrerequisitesMet(
    incident: Incident,
    prerequisites: string[]
  ): boolean {
    return prerequisites.every(prereq =>
      incident.automatedActions.some(
        action =>
          action.metadata?.stepId === prereq && action.status === 'completed'
      )
    );
  }

  private async executePlaybookStep(
    incident: Incident,
    step: PlaybookStep
  ): Promise<AutomatedAction> {
    const action: AutomatedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.mapStepTypeToActionType(step.type),
      name: step.name,
      description: `Executing: ${step.action}`,
      status: 'running',
      triggeredAt: Date.now(),
      metadata: { stepId: step.id, playbookStep: true },
    };

    try {
      const result = await this.executeAction(step.action, step.parameters);
      action.status = 'completed';
      action.result = result;
      action.completedAt = Date.now();

      this.addTimelineEntry(incident, {
        type: 'action',
        actor: 'system',
        description: `Completed automated action: ${step.name}`,
        metadata: { actionId: action.id, result },
      });
    } catch {
      action.status = 'failed';
      action.result = error instanceof Error ? error.message : 'Unknown error';
      action.completedAt = Date.now();

      if (!step.continueOnFailure) {
        throw error;
      }
    }

    return action;
  }

  private mapStepTypeToActionType(
    stepType: PlaybookStep['type']
  ): AutomatedAction['type'] {
    switch (stepType) {
      case 'diagnostic':
        return 'diagnostic';
      case 'mitigation':
        return 'mitigation';
      case 'communication':
        return 'notification';
      case 'escalation':
        return 'notification';
      default:
        return 'diagnostic';
    }
  }

  private async executeAction(
    action: string,
    parameters?: Record<string, unknown>
  ): Promise<string> {
    // Simulate action execution - in real implementation, these would call actual services
    switch (action) {
      case 'check_database_connectivity':
        return this.checkDatabaseConnectivity();
      case 'restart_database_pool':
        return this.restartDatabasePool();
      case 'send_notification':
        return this.sendNotification(parameters);
      case 'collect_performance_data':
        return this.collectPerformanceData();
      case 'auto_scale_resources':
        return this.autoScaleResources();
      case 'isolate_security_threat':
        return this.isolateSecurityThreat();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async checkDatabaseConnectivity(): Promise<string> {
    // Simulate database connectivity check
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'Database connectivity verified';
  }

  private async restartDatabasePool(): Promise<string> {
    // Simulate database pool restart
    await new Promise(resolve => setTimeout(resolve, 3000));
    return 'Database connection pool restarted successfully';
  }

  private async sendNotification(
    parameters?: Record<string, unknown>
  ): Promise<string> {
    // Simulate notification sending
    const team = parameters?.team || 'default';
    const severity = parameters?.severity || 'medium';

    await new Promise(resolve => setTimeout(resolve, 500));
    return `Notification sent to ${team} team with ${severity} severity`;
  }

  private async collectPerformanceData(): Promise<string> {
    // Simulate performance data collection
    await new Promise(resolve => setTimeout(resolve, 2000));
    return 'Performance metrics collected and analyzed';
  }

  private async autoScaleResources(): Promise<string> {
    // Simulate auto-scaling
    await new Promise(resolve => setTimeout(resolve, 5000));
    return 'Resources scaled up automatically';
  }

  private async isolateSecurityThreat(): Promise<string> {
    // Simulate threat isolation
    await new Promise(resolve => setTimeout(resolve, 1500));
    return 'Potential security threat isolated';
  }

  private checkEscalationRules(): void {
    this.incidents.forEach(incident => {
      if (incident.status === 'closed' || incident.status === 'resolved')
        return;

      this.escalationRules.forEach(rule => {
        if (!rule.enabled) return;

        if (this.shouldEscalate(incident, rule)) {
          this.triggerEscalation(incident, rule.id);
        }
      });
    });
  }

  private shouldEscalate(incident: Incident, rule: EscalationRule): boolean {
    return rule.conditions.every(condition => {
      switch (condition.type) {
        case 'severity':
          return this.evaluateCondition(
            incident.severity,
            condition.operator,
            condition.value
          );
        case 'duration': {
          const duration = Date.now() - incident.detectedAt;
          return this.evaluateCondition(
            duration / (60 * 1000),
            condition.operator,
            condition.value
          ); // minutes
        }
        case 'no_acknowledgment':
          return (
            !incident.acknowledgedAt &&
            Date.now() - incident.detectedAt >
              (condition.value as number) * 60 * 1000
          );
        case 'user_impact':
          return this.evaluateCondition(
            incident.affectedUsers,
            condition.operator,
            condition.value
          );
        case 'business_impact': {
          const impactScore = this.getBusinessImpactScore(
            incident.businessImpact
          );
          return this.evaluateCondition(
            impactScore,
            condition.operator,
            condition.value
          );
        }
        default:
          return false;
      }
    });
  }

  private evaluateCondition(
    actual: string | number,
    operator: EscalationCondition['operator'],
    expected: string | number
  ): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'contains':
        return String(actual).includes(String(expected));
      default:
        return false;
    }
  }

  private getBusinessImpactScore(impact: Incident['businessImpact']): number {
    switch (impact) {
      case 'critical':
        return 5;
      case 'high':
        return 4;
      case 'medium':
        return 3;
      case 'low':
        return 2;
      case 'none':
        return 1;
    }
  }

  private triggerEscalation(incident: Incident, ruleId: string): void {
    const rule = this.escalationRules.find(r => r.id === ruleId);
    if (!rule) return;

    // Check if this rule was already triggered for this incident
    const alreadyTriggered = incident.timeline.some(
      entry => entry.type === 'escalation' && entry.metadata?.ruleId === ruleId
    );

    if (alreadyTriggered) return;

    this.addTimelineEntry(incident, {
      type: 'escalation',
      actor: 'system',
      description: `Escalation triggered: ${rule.name}`,
      metadata: { ruleId, escalationRule: rule.name, automated: true },
    });

    // Execute escalation actions
    rule.actions.forEach(async action => {
      if (action.delay) {
        setTimeout(
          () => this.executeEscalationAction(incident, action),
          action.delay
        );
      } else {
        await this.executeEscalationAction(incident, action);
      }
    });

    monitoringService.trackBusinessEvent('incident.escalated', {
      incidentId: incident.id,
      ruleId,
      ruleName: rule.name,
    });
  }

  private async executeEscalationAction(
    incident: Incident,
    action: EscalationAction
  ): Promise<void> {
    try {
      switch (action.type) {
        case 'notify':
          await this.sendEscalationNotification(incident, action.target);
          break;
        case 'assign':
          this.assignIncident(incident, action.target);
          break;
        case 'create_war_room':
          await this.createWarRoom(incident, action.target);
          break;
        case 'update_status_page':
          await this.updateStatusPage(incident, action.target);
          break;
        case 'execute_runbook':
          await this.executeRunbook(incident, action.target);
          break;
      }
    } catch {
      captureWarning('Escalation action failed', {
        incidentId: incident.id,
        actionType: action.type,
        target: action.target,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async sendEscalationNotification(
    incident: Incident,
    target: string
  ): Promise<void> {
    const communication: IncidentCommunication = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'slack', // or email, sms based on target
      recipient: target,
      subject: `Incident Escalation: ${incident.title}`,
      message: `Incident ${incident.id} has been escalated. Severity: ${incident.severity}, Status: ${incident.status}`,
      sentAt: Date.now(),
      status: 'sent',
    };

    incident.communications.push(communication);

    this.addTimelineEntry(incident, {
      type: 'communication',
      actor: 'system',
      description: `Escalation notification sent to ${target}`,
      metadata: { communicationId: communication.id },
    });
  }

  private assignIncident(incident: Incident, assignee: string): void {
    incident.assignee = assignee;

    this.addTimelineEntry(incident, {
      type: 'action',
      actor: 'system',
      description: `Incident assigned to ${assignee}`,
      metadata: { assignee, automated: true },
    });
  }

  private async createWarRoom(
    incident: Incident,
    roomName: string
  ): Promise<void> {
    // Simulate war room creation
    this.addTimelineEntry(incident, {
      type: 'action',
      actor: 'system',
      description: `War room created: ${roomName}`,
      metadata: { warRoom: roomName, automated: true },
    });
  }

  private async updateStatusPage(
    incident: Incident,
    status: string
  ): Promise<void> {
    // Simulate status page update
    this.addTimelineEntry(incident, {
      type: 'communication',
      actor: 'system',
      description: `Status page updated: ${status}`,
      metadata: { statusPageUpdate: status, automated: true },
    });
  }

  private async executeRunbook(
    incident: Incident,
    runbookId: string
  ): Promise<void> {
    // Simulate runbook execution
    this.addTimelineEntry(incident, {
      type: 'action',
      actor: 'system',
      description: `Runbook executed: ${runbookId}`,
      metadata: { runbookId, automated: true },
    });
  }

  private executeAutomatedActions(): void {
    this.incidents.forEach(incident => {
      if (incident.status === 'closed' || incident.status === 'resolved')
        return;

      // Execute pending automated actions
      incident.automatedActions
        .filter(action => action.status === 'pending')
        .forEach(async action => {
          action.status = 'running';
          try {
            const result = await this.executeAction(action.name);
            action.status = 'completed';
            action.result = result;
            action.completedAt = Date.now();
          } catch {
            action.status = 'failed';
            action.result =
              error instanceof Error ? error.message : 'Unknown error';
            action.completedAt = Date.now();
          }
        });
    });
  }

  // Public API methods
  public getIncidents(filter?: {
    status?: Incident['status'];
    severity?: Incident['severity'];
    assignee?: string;
    timeRange?: number;
  }): Incident[] {
    let incidents = Array.from(this.incidents.values());

    if (filter?.status) {
      incidents = incidents.filter(i => i.status === filter.status);
    }

    if (filter?.severity) {
      incidents = incidents.filter(i => i.severity === filter.severity);
    }

    if (filter?.assignee) {
      incidents = incidents.filter(i => i.assignee === filter.assignee);
    }

    if (filter?.timeRange) {
      const cutoff = Date.now() - filter.timeRange;
      incidents = incidents.filter(i => i.detectedAt >= cutoff);
    }

    return incidents.sort((a, b) => b.detectedAt - a.detectedAt);
  }

  public getIncident(incidentId: string): Incident | undefined {
    return this.incidents.get(incidentId);
  }

  public acknowledgeIncident(incidentId: string, userId?: string): void {
    const incident = this.incidents.get(incidentId);
    if (incident && !incident.acknowledgedAt) {
      incident.acknowledgedAt = Date.now();
      if (userId) incident.assignee = userId;

      this.addTimelineEntry(incident, {
        type: 'status_change',
        actor: 'user',
        actorId: userId,
        description: `Incident acknowledged${userId ? ` by ${userId}` : ''}`,
        metadata: { acknowledgedBy: userId },
      });

      monitoringService.trackBusinessEvent('incident.acknowledged', {
        incidentId,
        userId,
        responseTime: Date.now() - incident.detectedAt,
      });
    }
  }

  public updateIncidentStatus(
    incidentId: string,
    status: Incident['status'],
    userId?: string
  ): void {
    const incident = this.incidents.get(incidentId);
    if (incident) {
      const oldStatus = incident.status;
      incident.status = status;

      if (status === 'resolved') {
        incident.resolvedAt = Date.now();
        incident.metrics.resolutionTime = Date.now() - incident.detectedAt;
      } else if (status === 'closed') {
        incident.closedAt = Date.now();
      }

      this.addTimelineEntry(incident, {
        type: 'status_change',
        actor: 'user',
        actorId: userId,
        description: `Status changed from ${oldStatus} to ${status}`,
        metadata: { oldStatus, newStatus: status, changedBy: userId },
      });

      monitoringService.trackBusinessEvent('incident.status_changed', {
        incidentId,
        oldStatus,
        newStatus: status,
        userId,
      });
    }
  }

  public addIncidentComment(
    incidentId: string,
    comment: string,
    userId?: string
  ): void {
    const incident = this.incidents.get(incidentId);
    if (incident) {
      this.addTimelineEntry(incident, {
        type: 'action',
        actor: 'user',
        actorId: userId,
        description: comment,
        metadata: { isComment: true, userId },
      });
    }
  }

  public createManualIncident(params: {
    title: string;
    description: string;
    severity: Incident['severity'];
    affectedSystems: string[];
    userId?: string;
  }): Incident {
    const incident = this.createIncident({
      title: params.title,
      description: params.description,
      severity: params.severity,
      source: 'manual',
      affectedSystems: params.affectedSystems,
      tags: ['manual'],
    });

    if (params.userId) {
      this.assignIncident(incident, params.userId);
      this.acknowledgeIncident(incident.id, params.userId);
    }

    return incident;
  }

  // Health check for incident response service
  public getIncidentResponseHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      isMonitoring: boolean;
      totalIncidents: number;
      openIncidents: number;
      criticalIncidents: number;
      averageResponseTime: number;
      averageResolutionTime: number;
      escalationRulesEnabled: number;
      playbooksEnabled: number;
    };
  } {
    const incidents = Array.from(this.incidents.values());
    const openIncidents = incidents.filter(
      i => i.status !== 'closed' && i.status !== 'resolved'
    ).length;
    const criticalIncidents = incidents.filter(
      i => i.severity === 'critical' && i.status !== 'closed'
    ).length;

    const acknowledgedIncidents = incidents.filter(i => i.acknowledgedAt);
    const averageResponseTime =
      acknowledgedIncidents.length > 0
        ? acknowledgedIncidents.reduce(
            (sum, i) => sum + (i.acknowledgedAt! - i.detectedAt),
            0
          ) / acknowledgedIncidents.length
        : 0;

    const resolvedIncidents = incidents.filter(i => i.resolvedAt);
    const averageResolutionTime =
      resolvedIncidents.length > 0
        ? resolvedIncidents.reduce(
            (sum, i) => sum + (i.resolvedAt! - i.detectedAt),
            0
          ) / resolvedIncidents.length
        : 0;

    const status = !this.isMonitoring
      ? 'unhealthy'
      : criticalIncidents > 2 || openIncidents > 10
        ? 'degraded'
        : 'healthy';

    return {
      status,
      metrics: {
        isMonitoring: this.isMonitoring,
        totalIncidents: incidents.length,
        openIncidents,
        criticalIncidents,
        averageResponseTime: averageResponseTime / (60 * 1000), // Convert to minutes
        averageResolutionTime: averageResolutionTime / (60 * 1000), // Convert to minutes
        escalationRulesEnabled: this.escalationRules.filter(r => r.enabled)
          .length,
        playbooksEnabled: Array.from(this.playbooks.values()).filter(
          p => p.enabled
        ).length,
      },
    };
  }
}

// Singleton instance
export const incidentResponseService = new IncidentResponseService();

// Utility functions
export const getIncidents = (
  filter?: Parameters<typeof incidentResponseService.getIncidents>[0]
) => incidentResponseService.getIncidents(filter);
export const getIncident = (incidentId: string) =>
  incidentResponseService.getIncident(incidentId);
export const acknowledgeIncident = (incidentId: string, userId?: string) =>
  incidentResponseService.acknowledgeIncident(incidentId, userId);
export const updateIncidentStatus = (
  incidentId: string,
  status: Incident['status'],
  userId?: string
) => incidentResponseService.updateIncidentStatus(incidentId, status, userId);
export const addIncidentComment = (
  incidentId: string,
  comment: string,
  userId?: string
) => incidentResponseService.addIncidentComment(incidentId, comment, userId);
export const createManualIncident = (
  params: Parameters<typeof incidentResponseService.createManualIncident>[0]
) => incidentResponseService.createManualIncident(params);
