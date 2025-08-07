/**
 * Advanced Error Tracking and Alerting System
 * Enhances the existing error tracking with real-time alerting, pattern detection, and recovery
 */

import { errorTracker, ErrorReport } from './errorTracking';
import { monitoringService } from './monitoring';
import { captureError, captureWarning } from './errorTracking';

// Enhanced error interfaces
export interface ErrorPattern {
  id: string;
  pattern: string;
  frequency: number;
  firstSeen: number;
  lastSeen: number;
  affectedUsers: Set<string>;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'ignored';
  resolution?: string;
}

export interface ErrorAlert {
  id: string;
  type: 'immediate' | 'threshold' | 'pattern' | 'escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  errorId?: string;
  patternId?: string;
  timestamp: number;
  sent: boolean;
  acknowledged: boolean;
  escalated: boolean;
  metadata?: Record<string, unknown>;
}

export interface ErrorThreshold {
  name: string;
  metric: 'count' | 'rate' | 'unique_users' | 'pattern_frequency';
  timeWindow: number; // milliseconds
  warningLevel: number;
  criticalLevel: number;
  enabled: boolean;
}

export interface ErrorRecovery {
  errorType: string;
  recoveryAction: () => Promise<boolean>;
  retryCount: number;
  maxRetries: number;
  backoffMultiplier: number;
  lastAttempt?: number;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByLevel: Record<'error' | 'warning' | 'info', number>;
  errorsByType: Record<string, number>;
  errorsByUser: Record<string, number>;
  topErrors: Array<{
    message: string;
    count: number;
    impact: number;
  }>;
  errorTrends: Array<{
    timestamp: number;
    count: number;
    level: string;
  }>;
  mttr: number; // Mean Time To Resolution
  mtbf: number; // Mean Time Between Failures
}

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: number;
  resolvedAt?: number;
  assignee?: string;
  errors: string[];
  patterns: string[];
  affectedUsers: number;
  timeline: Array<{
    timestamp: number;
    action: string;
    user?: string;
    details?: string;
  }>;
  postMortem?: {
    rootCause: string;
    solution: string;
    preventionMeasures: string[];
    lessonsLearned: string[];
  };
}

class AdvancedErrorTracker {
  private patterns: Map<string, ErrorPattern> = new Map();
  private alerts: ErrorAlert[] = [];
  private thresholds: ErrorThreshold[] = [];
  private recoveryStrategies: Map<string, ErrorRecovery> = new Map();
  private incidents: Map<string, IncidentReport> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: number;

  constructor() {
    this.initializeThresholds();
    this.initializeRecoveryStrategies();
    this.startMonitoring();
  }

  private initializeThresholds(): void {
    // Error count thresholds
    this.thresholds.push({
      name: 'error_count_5min',
      metric: 'count',
      timeWindow: 5 * 60 * 1000, // 5 minutes
      warningLevel: 10,
      criticalLevel: 25,
      enabled: true,
    });

    // Error rate thresholds
    this.thresholds.push({
      name: 'error_rate_1min',
      metric: 'rate',
      timeWindow: 1 * 60 * 1000, // 1 minute
      warningLevel: 5, // 5% error rate
      criticalLevel: 10, // 10% error rate
      enabled: true,
    });

    // Unique users affected threshold
    this.thresholds.push({
      name: 'users_affected_10min',
      metric: 'unique_users',
      timeWindow: 10 * 60 * 1000, // 10 minutes
      warningLevel: 5,
      criticalLevel: 15,
      enabled: true,
    });

    // Pattern frequency threshold
    this.thresholds.push({
      name: 'pattern_frequency_1hour',
      metric: 'pattern_frequency',
      timeWindow: 60 * 60 * 1000, // 1 hour
      warningLevel: 5,
      criticalLevel: 10,
      enabled: true,
    });
  }

  private initializeRecoveryStrategies(): void {
    // Network error recovery
    this.recoveryStrategies.set('NetworkError', {
      errorType: 'NetworkError',
      recoveryAction: async () {
        // Attempt to reconnect or switch to offline mode
        try {
          const response = await fetch('/api/health');
          return response.ok;
        } catch (error) {
          // Enable offline mode
          this.enableOfflineMode();
          return false;
        }
      },
      retryCount: 0,
      maxRetries: 3,
      backoffMultiplier: 2,
    });

    // Database connection recovery
    this.recoveryStrategies.set('DatabaseError', {
      errorType: 'DatabaseError',
      recoveryAction: async () {
        // Clear connection pools and retry
        try {
          // This would typically involve reconnecting to Supabase
          const { error } = await import('./supabase').then(m =>
            m.supabase.from('messages').select('id').limit(1).single()
          );
          return !error || error.code === 'PGRST116';
        } catch (error) {
          return false;
        }
      },
      retryCount: 0,
      maxRetries: 2,
      backoffMultiplier: 3,
    });

    // Authentication error recovery
    this.recoveryStrategies.set('AuthenticationError', {
      errorType: 'AuthenticationError',
      recoveryAction: async () {
        // Attempt to refresh authentication
        try {
          const { error } = await import('./supabase').then(m =>
            m.supabase.auth.refreshSession()
          );
          return !error;
        } catch (error) {
          return false;
        }
      },
      retryCount: 0,
      maxRetries: 1,
      backoffMultiplier: 1,
    });
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Check thresholds every 30 seconds
    this.monitoringInterval = window.setInterval(() => {
      this.checkThresholds();
      this.detectPatterns();
      this.attemptRecoveries();
      this.updateIncidents();
    }, 30000);

    // Enhanced error event listener
    this.setupEnhancedErrorCapture();
  }

  private setupEnhancedErrorCapture(): void {
    // Intercept and enhance existing error tracking
    const originalCaptureError = errorTracker.captureError.bind(errorTracker);

    errorTracker.captureError = (error, level = 'error', context = {}) {
      const errorId = originalCaptureError(error, level, context);

      // Enhanced error processing
      this.processEnhancedError(errorId, error, level, context);

      return errorId;
    };
  }

  private processEnhancedError(
    errorId: string,
    error: Error | string,
    level: 'error' | 'warning' | 'info',
    context: Record<string, unknown>
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;

    // Pattern detection
    this.updatePatterns(errorMessage, errorStack, context);

    // Immediate critical error alerting
    if (level === 'error' && this.isCriticalError(errorMessage, context)) {
      this.createAlert(
        'immediate',
        'critical',
        'Critical Error Detected',
        `Critical error: ${errorMessage}`,
        errorId,
        undefined,
        { error, context }
      );
    }

    // User impact tracking
    const userId = context.userId as string;
    if (userId) {
      this.trackUserImpact(userId, errorMessage, level);
    }

    // Automatic recovery attempt
    this.attemptErrorRecovery(errorMessage);

    // Track in monitoring service
    monitoringService.trackCustomMetric('error.advanced.captured', 1, {
      level,
      type: this.categorizeError(errorMessage),
      userId,
      context: JSON.stringify(context),
    });
  }

  private isCriticalError(
    message: string,
    context: Record<string, unknown>
  ): boolean {
    const criticalPatterns = [
      /database.*connection.*failed/i,
      /authentication.*failed/i,
      /payment.*failed/i,
      /security.*violation/i,
      /data.*corruption/i,
      /service.*unavailable/i,
    ];

    return (
      criticalPatterns.some(pattern => pattern.test(message)) ||
      context.severity === 'critical' ||
      context.impact === 'high'
    );
  }

  private categorizeError(message: string): string {
    if (/network|fetch|connection/i.test(message)) return 'network';
    if (/database|sql|query/i.test(message)) return 'database';
    if (/auth|login|permission/i.test(message)) return 'authentication';
    if (/validation|format|parse/i.test(message)) return 'validation';
    if (/memory|heap|stack/i.test(message)) return 'memory';
    if (/react|component|render/i.test(message)) return 'ui';
    return 'unknown';
  }

  private updatePatterns(
    message: string,
    stack?: string,
    context?: Record<string, unknown>
  ): void {
    // Create pattern signature from error message and stack
    const signature = this.createErrorSignature(message, stack);

    let pattern = this.patterns.get(signature);

    if (!pattern) {
      pattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern: signature,
        frequency: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        affectedUsers: new Set(),
        impact: 'low',
        status: 'active',
      };
      this.patterns.set(signature, pattern);
    }

    pattern.frequency++;
    pattern.lastSeen = Date.now();

    // Track affected user
    const userId = context?.userId as string;
    if (userId) {
      pattern.affectedUsers.add(userId);
    }

    // Update impact level based on frequency and user count
    pattern.impact = this.calculatePatternImpact(pattern);

    // Create pattern alert if frequency exceeds threshold
    if (pattern.frequency >= 5 && pattern.status === 'active') {
      this.createAlert(
        'pattern',
        pattern.impact === 'critical' ? 'critical' : 'medium',
        'Error Pattern Detected',
        `Pattern "${signature}" occurred ${pattern.frequency} times affecting ${pattern.affectedUsers.size} users`,
        undefined,
        pattern.id,
        { pattern: pattern.pattern, frequency: pattern.frequency }
      );
    }
  }

  private createErrorSignature(message: string, stack?: string): string {
    // Normalize error message by removing specific values
    let normalized = message
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(
        /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
        'UUID'
      ) // Replace UUIDs
      .replace(/https?:\/\/[^\s]+/g, 'URL') // Replace URLs
      .replace(/\/[^\s]+/g, 'PATH'); // Replace file paths

    // Include first line of stack trace for more specific patterns
    if (stack) {
      const stackLines = stack.split('\n');
      if (stackLines.length > 1) {
        const firstStackLine = stackLines[1].replace(/:\d+:\d+/g, ':N:N');
        normalized += ` | ${firstStackLine}`;
      }
    }

    return normalized;
  }

  private calculatePatternImpact(
    pattern: ErrorPattern
  ): 'low' | 'medium' | 'high' | 'critical' {
    const frequency = pattern.frequency;
    const userCount = pattern.affectedUsers.size;
    const timeSpan = pattern.lastSeen - pattern.firstSeen;
    const rate = frequency / (timeSpan / (60 * 1000)); // errors per minute

    if (frequency >= 50 || userCount >= 20 || rate >= 10) return 'critical';
    if (frequency >= 20 || userCount >= 10 || rate >= 5) return 'high';
    if (frequency >= 10 || userCount >= 5 || rate >= 2) return 'medium';
    return 'low';
  }

  private checkThresholds(): void {
    const errors = errorTracker.getErrors();

    this.thresholds.forEach(threshold => {
      if (!threshold.enabled) return;

      const cutoff = Date.now() - threshold.timeWindow;
      const recentErrors = errors.filter(
        error => new Date(error.timestamp).getTime() >= cutoff
      );

      let value = 0;

      switch (threshold.metric) {
        case 'count':
          value = recentErrors.length;
          break;
        case 'rate': {
          // Calculate error rate as percentage of total interactions
          const totalInteractions = this.getTotalInteractions(cutoff);
          value =
            totalInteractions > 0
              ? (recentErrors.length / totalInteractions) * 100
              : 0;
          break;
        }
        case 'unique_users': {
          const uniqueUsers = new Set(
            recentErrors.map(e => e.userId).filter(Boolean)
          );
          value = uniqueUsers.size;
          break;
        }
        case 'pattern_frequency':
          value = Math.max(
            ...Array.from(this.patterns.values())
              .filter(p => p.lastSeen >= cutoff)
              .map(p => p.frequency)
          );
          break;
      }

      // Check thresholds and create alerts
      if (value >= threshold.criticalLevel) {
        this.createAlert(
          'threshold',
          'critical',
          'Critical Threshold Exceeded',
          `${threshold.name}: ${value} >= ${threshold.criticalLevel}`,
          undefined,
          undefined,
          { threshold: threshold.name, value, level: 'critical' }
        );
      } else if (value >= threshold.warningLevel) {
        this.createAlert(
          'threshold',
          'medium',
          'Warning Threshold Exceeded',
          `${threshold.name}: ${value} >= ${threshold.warningLevel}`,
          undefined,
          undefined,
          { threshold: threshold.name, value, level: 'warning' }
        );
      }
    });
  }

  private getTotalInteractions(since: number): number {
    // This would integrate with the metrics service to get total user interactions
    // For now, return a reasonable estimate
    const timeSpan = Date.now() - since;
    const hours = timeSpan / (60 * 60 * 1000);
    return Math.floor(hours * 100); // Assume 100 interactions per hour
  }

  private detectPatterns(): void {
    // Detect anomalous patterns in error frequency
    const activePatterns = Array.from(this.patterns.values()).filter(
      p => p.status === 'active'
    );

    activePatterns.forEach(pattern => {
      const recentFrequency = this.getRecentPatternFrequency(
        pattern.id,
        10 * 60 * 1000
      ); // 10 minutes

      if (recentFrequency > pattern.frequency * 0.5) {
        this.createAlert(
          'pattern',
          'high',
          'Error Pattern Spike',
          `Error pattern "${pattern.pattern}" showing unusual spike in frequency`,
          undefined,
          pattern.id,
          { pattern: pattern.pattern, recentFrequency }
        );
      }
    });
  }

  private getRecentPatternFrequency(
    patternId: string,
    timeWindow: number
  ): number {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return 0;

    const cutoff = Date.now() - timeWindow;
    const errors = errorTracker.getErrors();

    return errors.filter(
      error =>
        new Date(error.timestamp).getTime() >= cutoff &&
        this.createErrorSignature(error.message, error.stack) ===
          pattern.pattern
    ).length;
  }

  private attemptRecoveries(): void {
    this.recoveryStrategies.forEach(async (recovery, errorType) => {
      if (recovery.retryCount >= recovery.maxRetries) return;

      const lastAttempt = recovery.lastAttempt || 0;
      const backoffDelay =
        Math.pow(recovery.backoffMultiplier, recovery.retryCount) * 1000;

      if (Date.now() - lastAttempt < backoffDelay) return;

      try {
        recovery.lastAttempt = Date.now();
        const success = await recovery.recoveryAction();

        if (success) {
          recovery.retryCount = 0; // Reset on success
          this.createAlert(
            'immediate',
            'low',
            'Recovery Successful',
            `Automatic recovery for ${errorType} was successful`,
            undefined,
            undefined,
            { errorType, retryCount: recovery.retryCount }
          );
        } else {
          recovery.retryCount++;
          if (recovery.retryCount >= recovery.maxRetries) {
            this.createAlert(
              'escalation',
              'critical',
              'Recovery Failed',
              `Automatic recovery for ${errorType} failed after ${recovery.maxRetries} attempts`,
              undefined,
              undefined,
              { errorType, maxRetries: recovery.maxRetries }
            );
          }
        }
      } catch (error) {
        recovery.retryCount++;
        captureError(
          error instanceof Error
            ? error
            : new Error(`Recovery failed for ${errorType}`),
          {
            errorType,
            retryCount: recovery.retryCount,
          }
        );
      }
    });
  }

  private attemptErrorRecovery(
    message: string
  ): void {
    const errorType = this.categorizeError(message);
    const recovery = this.recoveryStrategies.get(errorType);

    if (recovery && recovery.retryCount < recovery.maxRetries) {
      // Trigger recovery attempt in next monitoring cycle
      recovery.lastAttempt = 0; // Force immediate attempt
    }
  }

  private enableOfflineMode(): void {
    // Implement offline mode functionality
    monitoringService.trackBusinessEvent('system.offline_mode_enabled', {
      timestamp: Date.now(),
      reason: 'network_error_recovery',
    });
  }

  private trackUserImpact(
    userId: string,
    errorMessage: string,
    level: string
  ): void {
    monitoringService.trackCustomMetric('error.user_impact', 1, {
      userId,
      errorType: this.categorizeError(errorMessage),
      level,
    });
  }

  private updateIncidents(): void {
    // Check if any patterns or alerts should trigger incident creation
    const criticalAlerts = this.alerts.filter(
      alert =>
        alert.severity === 'critical' &&
        !alert.acknowledged &&
        Date.now() - alert.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    if (criticalAlerts.length >= 3) {
      this.createIncident(
        'Multiple Critical Alerts',
        `${criticalAlerts.length} critical alerts detected in the last 5 minutes`,
        'critical',
        criticalAlerts.map(a => a.id)
      );
    }
  }

  private createAlert(
    type: ErrorAlert['type'],
    severity: ErrorAlert['severity'],
    title: string,
    message: string,
    errorId?: string,
    patternId?: string,
    metadata?: Record<string, unknown>
  ): void {
    // Check for duplicate alerts
    const recentSimilar = this.alerts.filter(
      alert =>
        alert.title === title &&
        alert.severity === severity &&
        Date.now() - alert.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    if (recentSimilar.length > 0) return;

    const alert: ErrorAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      errorId,
      patternId,
      timestamp: Date.now(),
      sent: false,
      acknowledged: false,
      escalated: false,
      metadata,
    };

    this.alerts.push(alert);

    // Keep only last 200 alerts
    if (this.alerts.length > 200) {
      this.alerts = this.alerts.slice(-200);
    }

    // Send alert immediately for critical issues
    if (severity === 'critical') {
      this.sendAlert(alert);
    }

    // Track alert creation
    monitoringService.trackBusinessEvent('error.alert_created', {
      alertId: alert.id,
      type,
      severity,
      title,
    });
  }

  private async sendAlert(alert: ErrorAlert): Promise<void>  {
    try {
      // Send to external alerting systems
      const alertWebhook = import.meta.env.VITE_ERROR_ALERT_WEBHOOK_URL;
      if (alertWebhook) {
        await fetch(alertWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'error_alert',
            alert,
            timestamp: Date.now(),
            source: 'jarvis_error_tracking',
          }),
        });
      }

      alert.sent = true;

      // Log critical alerts
      if (alert.severity === 'critical') {
        captureError(`Critical Error Alert: ${alert.title}`, {
          alert_id: alert.id,
          message: alert.message,
          metadata: alert.metadata,
        });
      }
    } catch (error) {
      captureWarning('Failed to send error alert', {
        alert_id: alert.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private createIncident(
    title: string,
    description: string,
    severity: IncidentReport['severity'],
    alertIds: string[]
  ): void {
    const incident: IncidentReport = {
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      severity,
      status: 'open',
      createdAt: Date.now(),
      errors: [],
      patterns: [],
      affectedUsers: 0,
      timeline: [
        {
          timestamp: Date.now(),
          action: 'incident_created',
          details: description,
        },
      ],
    };

    this.incidents.set(incident.id, incident);

    // Create escalation alert
    this.createAlert(
      'escalation',
      severity,
      'Incident Created',
      `New ${severity} incident: ${title}`,
      undefined,
      undefined,
      { incidentId: incident.id, alertIds }
    );

    monitoringService.trackBusinessEvent('error.incident_created', {
      incidentId: incident.id,
      severity,
      alertCount: alertIds.length,
    });
  }

  // Public API methods
  public getErrorAnalytics(timeRange?: number): ErrorAnalytics {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const errors = errorTracker
      .getErrors()
      .filter(error => new Date(error.timestamp).getTime() >= cutoff);

    const errorsByLevel = errors.reduce((acc, error) => {
        acc[error.level] = (acc[error.level] || 0) + 1;
        return acc;
      },
      {} as Record<'error' | 'warning' | 'info', number>
    );

    const errorsByType = errors.reduce((acc, error) => {
        const type = this.categorizeError(error.message);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const errorsByUser = errors.reduce((acc, error) => {
        if (error.userId) {
          acc[error.userId] = (acc[error.userId] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const errorCounts = new Map<string, number>();
    errors.forEach(error => {
      const count = errorCounts.get(error.message) || 0;
      errorCounts.set(error.message, count + 1);
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({
        message,
        count,
        impact:
          count * (errorsByLevel.error || 0) +
          count * 0.5 * (errorsByLevel.warning || 0),
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 10);

    // Calculate trends (simplified)
    const errorTrends = this.calculateErrorTrends(
      errors,
      timeRange || 24 * 60 * 60 * 1000
    );

    return {
      totalErrors: errors.length,
      errorsByLevel,
      errorsByType,
      errorsByUser,
      topErrors,
      errorTrends,
      mttr: this.calculateMTTR(),
      mtbf: this.calculateMTBF(),
    };
  }

  private calculateErrorTrends(
    errors: ErrorReport[],
    timeRange: number
  ): ErrorAnalytics['errorTrends'] {
    const bucketSize = Math.max(timeRange / 20, 60 * 1000); // At least 1 minute buckets
    const buckets = new Map<number, { count: number; level: string }>();

    errors.forEach(error => {
      const bucket =
        Math.floor(new Date(error.timestamp).getTime() / bucketSize) *
        bucketSize;
      const existing = buckets.get(bucket) || { count: 0, level: 'info' };
      existing.count++;
      if (
        error.level === 'error' ||
        (error.level === 'warning' && existing.level === 'info')
      ) {
        existing.level = error.level;
      }
      buckets.set(bucket, existing);
    });

    return Array.from(buckets.entries())
      .map(([timestamp, data]) => ({
        timestamp,
        count: data.count,
        level: data.level,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  private calculateMTTR(): number {
    const resolvedIncidents = Array.from(this.incidents.values()).filter(
      incident => incident.status === 'resolved' && incident.resolvedAt
    );

    if (resolvedIncidents.length === 0) return 0;

    const totalResolutionTime = resolvedIncidents.reduce(
      (sum, incident) => sum + (incident.resolvedAt! - incident.createdAt),
      0
    );

    return totalResolutionTime / resolvedIncidents.length / (60 * 1000); // Return in minutes
  }

  private calculateMTBF(): number {
    const incidents = Array.from(this.incidents.values()).sort(
      (a, b) => a.createdAt - b.createdAt
    );

    if (incidents.length < 2) return 0;

    const timeBetweenFailures = incidents
      .slice(1)
      .map(
        (incident, index) => incident.createdAt - incidents[index].createdAt
      );

    const averageTimeBetweenFailures =
      timeBetweenFailures.reduce((sum, time) => sum + time, 0) /
      timeBetweenFailures.length;

    return averageTimeBetweenFailures / (60 * 60 * 1000); // Return in hours
  }

  public getErrorPatterns(filter?: {
    status?: ErrorPattern['status'];
    impact?: ErrorPattern['impact'];
  }): ErrorPattern[] {
    let patterns = Array.from(this.patterns.values());

    if (filter?.status) {
      patterns = patterns.filter(p => p.status === filter.status);
    }

    if (filter?.impact) {
      patterns = patterns.filter(p => p.impact === filter.impact);
    }

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  public getAlerts(filter?: {
    type?: ErrorAlert['type'];
    severity?: ErrorAlert['severity'];
    acknowledged?: boolean;
  }): ErrorAlert[] {
    let alerts = [...this.alerts];

    if (filter?.type) {
      alerts = alerts.filter(a => a.type === filter.type);
    }

    if (filter?.severity) {
      alerts = alerts.filter(a => a.severity === filter.severity);
    }

    if (filter?.acknowledged !== undefined) {
      alerts = alerts.filter(a => a.acknowledged === filter.acknowledged);
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      monitoringService.trackBusinessEvent('error.alert_acknowledged', {
        alertId,
        severity: alert.severity,
      });
    }
  }

  public resolvePattern(patternId: string, resolution: string): void {
    const pattern = this.patterns.get(patternId);
    if (pattern) {
      pattern.status = 'resolved';
      pattern.resolution = resolution;
      monitoringService.trackBusinessEvent('error.pattern_resolved', {
        patternId,
        frequency: pattern.frequency,
        affectedUsers: pattern.affectedUsers.size,
      });
    }
  }

  public getIncidents(): IncidentReport[] {
    return Array.from(this.incidents.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  public updateIncidentStatus(
    incidentId: string,
    status: IncidentReport['status'],
    assignee?: string
  ): void {
    const incident = this.incidents.get(incidentId);
    if (incident) {
      incident.status = status;
      if (assignee) incident.assignee = assignee;
      if (status === 'resolved') incident.resolvedAt = Date.now();

      incident.timeline.push({
        timestamp: Date.now(),
        action: `status_changed_to_${status}`,
        user: assignee,
        details: `Incident status changed to ${status}`,
      });

      monitoringService.trackBusinessEvent('error.incident_updated', {
        incidentId,
        status,
        assignee,
      });
    }
  }

  // Health check for error tracking service
  public getErrorTrackingHealth():   {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      isMonitoring: boolean;
      totalPatterns: number;
      activePatterns: number;
      totalAlerts: number;
      unacknowledgedAlerts: number;
      activeIncidents: number;
      recoveryStrategies: number;
    };
  } {
    const activePatterns = Array.from(this.patterns.values()).filter(
      p => p.status === 'active'
    ).length;
    const unacknowledgedAlerts = this.alerts.filter(
      a => !a.acknowledged
    ).length;
    const activeIncidents = Array.from(this.incidents.values()).filter(
      i => i.status === 'open' || i.status === 'investigating'
    ).length;

    const status = !this.isMonitoring
      ? 'unhealthy'
      : activeIncidents > 0 || unacknowledgedAlerts > 10
        ? 'degraded'
        : 'healthy';

    return {
      status,
      metrics: {
        isMonitoring: this.isMonitoring,
        totalPatterns: this.patterns.size,
        activePatterns,
        totalAlerts: this.alerts.length,
        unacknowledgedAlerts,
        activeIncidents,
        recoveryStrategies: this.recoveryStrategies.size,
      },
    };
  }
}

// Singleton instance
export const advancedErrorTracker = new AdvancedErrorTracker();

// Utility functions
export const getErrorAnalytics = (timeRange?: number) =>
  advancedErrorTracker.getErrorAnalytics(timeRange);
export const getErrorPatterns = (
  filter?: Parameters<typeof advancedErrorTracker.getErrorPatterns>[0]
) => advancedErrorTracker.getErrorPatterns(filter);
export const getErrorAlerts = (
  filter?: Parameters<typeof advancedErrorTracker.getAlerts>[0]
) => advancedErrorTracker.getAlerts(filter);
export const acknowledgeErrorAlert = (alertId: string) =>
  advancedErrorTracker.acknowledgeAlert(alertId);
export const resolveErrorPattern = (patternId: string, resolution: string) =>
  advancedErrorTracker.resolvePattern(patternId, resolution);
export const getIncidents = () => advancedErrorTracker.getIncidents();
export const updateIncidentStatus = (
  incidentId: string,
  status: IncidentReport['status'],
  assignee?: string
) => advancedErrorTracker.updateIncidentStatus(incidentId, status, assignee);
