/**
 * Log Aggregation and Analysis System
 * Provides centralized logging, pattern analysis, and operational insights
 */

import { monitoringService } from './monitoring';
import { captureError, captureWarning } from './errorTracking';

// Log interfaces
export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  source: string;
  category: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  environment: string;
  version?: string;
}

export interface LogPattern {
  id: string;
  pattern: RegExp;
  description: string;
  category: 'performance' | 'security' | 'error' | 'business' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  lastMatched: number;
  examples: string[];
  alertThreshold?: number;
  enabled: boolean;
}

export interface LogAlert {
  id: string;
  patternId: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  matchedEntries: string[];
  timestamp: number;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

export interface LogAnalytics {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsBySource: Record<string, number>;
  logsByCategory: Record<string, number>;
  logsByHour: Array<{ hour: number; count: number; errors: number }>;
  topErrors: Array<{ message: string; count: number; lastSeen: number }>;
  performanceInsights: {
    slowOperations: Array<{
      operation: string;
      avgDuration: number;
      count: number;
    }>;
    resourceUsage: Array<{
      resource: string;
      avgUsage: number;
      peakUsage: number;
    }>;
  };
  securityEvents: Array<{ event: string; count: number; severity: string }>;
  businessInsights: Array<{
    metric: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface LogQuery {
  level?: LogEntry['level'][];
  source?: string[];
  category?: string[];
  timeRange?: { start: number; end: number };
  search?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface LogRetentionPolicy {
  level: LogEntry['level'];
  retentionDays: number;
  compressionEnabled: boolean;
  archiveLocation?: string;
}

class LogAggregationService {
  private logs: LogEntry[] = [];
  private patterns: Map<string, LogPattern> = new Map();
  private alerts: LogAlert[] = [];
  private retentionPolicies: LogRetentionPolicy[] = [];
  private isAggregating = false;
  private aggregationInterval?: number;
  private maxLogsInMemory = 10000;

  constructor() {
    this.initializePatterns();
    this.initializeRetentionPolicies();
    this.setupConsoleInterception();
    this.startAggregation();
  }

  private initializePatterns(): void {
    // Performance patterns
    this.addPattern({
      id: 'slow_api_response',
      pattern: /API response time: (\d+)ms.*endpoint: (.+)/i,
      description: 'Slow API response detected',
      category: 'performance',
      severity: 'medium',
      alertThreshold: 5,
      enabled: true,
    });

    this.addPattern({
      id: 'high_memory_usage',
      pattern: /memory usage: (\d+)%/i,
      description: 'High memory usage detected',
      category: 'performance',
      severity: 'high',
      alertThreshold: 3,
      enabled: true,
    });

    // Security patterns
    this.addPattern({
      id: 'failed_authentication',
      pattern: /authentication failed.*user: (.+)/i,
      description: 'Authentication failure detected',
      category: 'security',
      severity: 'medium',
      alertThreshold: 5,
      enabled: true,
    });

    this.addPattern({
      id: 'suspicious_activity',
      pattern: /suspicious.*activity|potential.*attack|security.*violation/i,
      description: 'Suspicious security activity detected',
      category: 'security',
      severity: 'critical',
      alertThreshold: 1,
      enabled: true,
    });

    // Error patterns
    this.addPattern({
      id: 'database_connection_error',
      pattern: /database.*connection.*failed|connection.*timeout.*database/i,
      description: 'Database connection issue detected',
      category: 'error',
      severity: 'critical',
      alertThreshold: 2,
      enabled: true,
    });

    this.addPattern({
      id: 'unhandled_exception',
      pattern: /unhandled.*exception|uncaught.*error/i,
      description: 'Unhandled exception detected',
      category: 'error',
      severity: 'high',
      alertThreshold: 3,
      enabled: true,
    });

    // Business patterns
    this.addPattern({
      id: 'payment_failure',
      pattern: /payment.*failed|transaction.*declined/i,
      description: 'Payment processing failure detected',
      category: 'business',
      severity: 'high',
      alertThreshold: 2,
      enabled: true,
    });

    this.addPattern({
      id: 'user_signup',
      pattern: /user.*signup|new.*user.*registered/i,
      description: 'New user signup detected',
      category: 'business',
      severity: 'low',
      enabled: true,
    });

    // System patterns
    this.addPattern({
      id: 'service_restart',
      pattern: /service.*restart|application.*startup/i,
      description: 'Service restart detected',
      category: 'system',
      severity: 'medium',
      alertThreshold: 3,
      enabled: true,
    });

    this.addPattern({
      id: 'configuration_change',
      pattern: /configuration.*changed|config.*updated/i,
      description: 'Configuration change detected',
      category: 'system',
      severity: 'medium',
      enabled: true,
    });
  }

  private initializeRetentionPolicies(): void {
    this.retentionPolicies = [
      { level: 'debug', retentionDays: 1, compressionEnabled: true },
      { level: 'info', retentionDays: 7, compressionEnabled: true },
      { level: 'warn', retentionDays: 30, compressionEnabled: false },
      { level: 'error', retentionDays: 90, compressionEnabled: false },
      { level: 'fatal', retentionDays: 365, compressionEnabled: false },
    ];
  }

  private setupConsoleInterception(): void {
    // Intercept console methods to capture logs
    const originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };

    console.log = (...args) => {
      this.logEntry('info', args.join(' '), 'console', 'general');
      originalConsole.log(...args);
    };

    console.info = (...args) => {
      this.logEntry('info', args.join(' '), 'console', 'general');
      originalConsole.info(...args);
    };

    console.warn = (...args) => {
      this.logEntry('warn', args.join(' '), 'console', 'general');
      originalConsole.warn(...args);
    };

    console.error = (...args) => {
      this.logEntry('error', args.join(' '), 'console', 'general');
      originalConsole.error(...args);
    };

    console.debug = (...args) {
      this.logEntry('debug', args.join(' '), 'console', 'general');
      originalConsole.debug(...args);
    };
  }

  private startAggregation(): void {
    if (this.isAggregating) return;

    this.isAggregating = true;

    // Process logs every 10 seconds
    this.aggregationInterval = window.setInterval(() {
      this.processLogs();
      this.enforceRetentionPolicies();
      this.performAnalysis();
    }, 10000);
  }

  public stopAggregation(): void {
    this.isAggregating = false;
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
      this.aggregationInterval = undefined;
    }
  }

  private processLogs(): void {
    try {
      // Process recent logs for pattern matching
      const recentLogs = this.logs.filter(
        log => Date.now() - log.timestamp < 60000 // Last minute
      );

      recentLogs.forEach(log => {
        this.checkLogPatterns(log);
      });

      // Send logs to external systems if configured
      this.sendToExternalSystems(recentLogs);
    } catch {
      captureError(
        error instanceof Error ? error : new Error('Log processing failed'),
        {
          service: 'log_aggregation',
        }
      );
    }
  }

  private checkLogPatterns(log: LogEntry): void {
    this.patterns.forEach(pattern => {
      if (!pattern.enabled) return;

      const match = pattern.pattern.exec(log.message);
      if (match) {
        pattern.frequency++;
        pattern.lastMatched = log.timestamp;

        // Add to examples if not already present
        if (!pattern.examples.includes(log.message)) {
          pattern.examples.push(log.message);
          if (pattern.examples.length > 10) {
            pattern.examples = pattern.examples.slice(-10);
          }
        }

        // Check if alert threshold is reached
        if (pattern.alertThreshold && this.shouldCreateAlert(pattern)) {
          this.createLogAlert(pattern, [log.id], match);
        }

        // Track pattern match in monitoring
        monitoringService.trackCustomMetric('log.pattern_matched', 1, {
          patternId: pattern.id,
          category: pattern.category,
          severity: pattern.severity,
        });
      }
    });
  }

  private shouldCreateAlert(pattern: LogPattern): boolean {
    if (!pattern.alertThreshold) return false;

    // Check frequency in the last 5 minutes
    const recentMatches = this.logs.filter(
      log =>
        Date.now() - log.timestamp < 5 * 60 * 1000 &&
        pattern.pattern.test(log.message)
    ).length;

    return recentMatches >= pattern.alertThreshold;
  }

  private createLogAlert(
    pattern: LogPattern,
    matchedEntries: string[],
    match: RegExpExecArray
  ): void {
    // Check for duplicate alerts in the last 10 minutes
    const recentAlerts = this.alerts.filter(
      alert =>
        alert.patternId === pattern.id &&
        Date.now() - alert.timestamp < 10 * 60 * 1000
    );

    if (recentAlerts.length > 0) return;

    const alert: LogAlert = {
      id: `log_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patternId: pattern.id,
      level:
        pattern.severity === 'critical'
          ? 'critical'
          : pattern.severity === 'high'
            ? 'warning'
            : 'info',
      title: `Log Pattern Alert: ${pattern.description}`,
      message: `Pattern "${pattern.description}" triggered ${pattern.frequency} times. Latest match: ${match[0]}`,
      matchedEntries,
      timestamp: Date.now(),
      acknowledged: false,
      metadata: {
        pattern: pattern.pattern.source,
        category: pattern.category,
        frequency: pattern.frequency,
        match: match[0],
        groups: match.slice(1),
      },
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Send critical alerts immediately
    if (alert.level === 'critical') {
      this.sendLogAlert(alert);
    }

    // Track alert creation
    monitoringService.trackBusinessEvent('log.alert_created', {
      alertId: alert.id,
      patternId: pattern.id,
      level: alert.level,
      category: pattern.category,
    });
  }

  private async sendLogAlert(alert: LogAlert): Promise<void> {
    try {
      const alertWebhook = import.meta.env.VITE_LOG_ALERT_WEBHOOK_URL;
      if (alertWebhook) {
        await fetch(alertWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'log_alert',
            alert,
            timestamp: Date.now(),
            source: 'jarvis_log_aggregation',
          }),
        });
      }

      // Log critical alerts to error tracking
      if (alert.level === 'critical') {
        captureError(`Critical Log Alert: ${alert.title}`, {
          alert_id: alert.id,
          pattern_id: alert.patternId,
          message: alert.message,
          metadata: alert.metadata,
        });
      }
    } catch {
      captureWarning('Failed to send log alert', {
        alert_id: alert.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private enforceRetentionPolicies(): void {
    try {
      this.retentionPolicies.forEach(policy => {
        const cutoff = Date.now() - policy.retentionDays * 24 * 60 * 60 * 1000;

        // Remove logs older than retention period
        this.logs = this.logs.filter(
          log => log.level !== policy.level || log.timestamp >= cutoff
        );
      });

      // Enforce memory limits
      if (this.logs.length > this.maxLogsInMemory) {
        // Keep most recent logs and preserve errors/warnings
        const importantLogs = this.logs.filter(
          log =>
            log.level === 'error' ||
            log.level === 'fatal' ||
            log.level === 'warn'
        );
        const recentLogs = this.logs
          .filter(
            log =>
              log.level !== 'error' &&
              log.level !== 'fatal' &&
              log.level !== 'warn'
          )
          .slice(-Math.max(0, this.maxLogsInMemory - importantLogs.length));

        this.logs = [...importantLogs, ...recentLogs].sort(
          (a, b) => a.timestamp - b.timestamp
        );
      }
    } catch {
      captureWarning('Failed to enforce log retention policies', { error });
    }
  }

  private performAnalysis(): void {
    try {
      // Analyze recent logs for insights
      const recentLogs = this.logs.filter(
        log => Date.now() - log.timestamp < 60 * 60 * 1000 // Last hour
      );

      // Performance analysis
      this.analyzePerformance(recentLogs);

      // Security analysis
      this.analyzeSecurity(recentLogs);

      // Business insights
      this.analyzeBusinessMetrics(recentLogs);
    } catch {
      captureWarning('Failed to perform log analysis', { error });
    }
  }

  private analyzePerformance(logs: LogEntry[]): void {
    const performanceLogs = logs.filter(log => log.category === 'performance');

    // Extract response times from logs
    const responseTimes: Array<{ operation: string; duration: number }> = [];

    performanceLogs.forEach(log => {
      const match = log.message.match(/(\w+).*time: (\d+)ms/i);
      if (match) {
        responseTimes.push({
          operation: match[1],
          duration: parseInt(match[2], 10),
        });
      }
    });

    // Find slow operations
    const slowOperations = responseTimes.filter(rt => rt.duration > 1000);
    if (slowOperations.length > 0) {
      monitoringService.trackCustomMetric(
        'log.slow_operations_detected',
        slowOperations.length,
        {
          operations: slowOperations.map(op => op.operation).join(','),
          avgDuration:
            slowOperations.reduce((sum, op) => sum + op.duration, 0) /
            slowOperations.length,
        }
      );
    }
  }

  private analyzeSecurity(logs: LogEntry[]): void {
    const securityLogs = logs.filter(log => log.category === 'security');

    // Group security events by type
    const securityEvents = new Map<string, number>();

    securityLogs.forEach(log => {
      let eventType = 'unknown';

      if (/authentication.*failed/i.test(log.message))
        eventType = 'auth_failure';
      else if (/unauthorized.*access/i.test(log.message))
        eventType = 'unauthorized_access';
      else if (/suspicious.*activity/i.test(log.message))
        eventType = 'suspicious_activity';
      else if (/rate.*limit/i.test(log.message))
        eventType = 'rate_limit_exceeded';

      securityEvents.set(eventType, (securityEvents.get(eventType) || 0) + 1);
    });

    // Track security metrics
    securityEvents.forEach((count, eventType) {
      monitoringService.trackCustomMetric(
        `log.security_event.${eventType}`,
        count,
        {
          timeRange: '1hour',
        }
      );
    });
  }

  private analyzeBusinessMetrics(logs: LogEntry[]): void {
    const businessLogs = logs.filter(log => log.category === 'business');

    // Extract business events
    const businessEvents = new Map<string, number>();

    businessLogs.forEach(log => {
      if (/user.*signup/i.test(log.message)) {
        businessEvents.set(
          'user_signups',
          (businessEvents.get('user_signups') || 0) + 1
        );
      } else if (/message.*sent/i.test(log.message)) {
        businessEvents.set(
          'messages_sent',
          (businessEvents.get('messages_sent') || 0) + 1
        );
      } else if (/payment.*completed/i.test(log.message)) {
        businessEvents.set(
          'payments_completed',
          (businessEvents.get('payments_completed') || 0) + 1
        );
      } else if (/feature.*used/i.test(log.message)) {
        businessEvents.set(
          'feature_usage',
          (businessEvents.get('feature_usage') || 0) + 1
        );
      }
    });

    // Track business metrics
    businessEvents.forEach((count, eventType) {
      monitoringService.trackCustomMetric(
        `log.business_metric.${eventType}`,
        count,
        {
          timeRange: '1hour',
        }
      );
    });
  }

  private async sendToExternalSystems(logs: LogEntry[]): Promise<void> {
    try {
      // Send to external log aggregation service if configured
      const logEndpoint = import.meta.env.VITE_LOG_AGGREGATION_ENDPOINT;
      if (logEndpoint && logs.length > 0) {
        await fetch(logEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'jarvis_frontend',
            logs: logs.map(log => ({
              ...log,
              metadata: JSON.stringify(log.metadata),
            })),
          }),
        });
      }
    } catch {
      // Silently fail external log shipping
    }
  }

  // Public API methods
  public logEntry(
    level: LogEntry['level'],
    message: string,
    source: string,
    category: string,
    metadata?: Record<string, unknown>,
    tags?: string[]
  ): string {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      source,
      category,
      metadata,
      tags,
      environment: import.meta.env.VITE_APP_ENV || 'development',
      version: import.meta.env.VITE_APP_VERSION,
    };

    this.logs.push(entry);

    // Track log entry in monitoring
    monitoringService.trackCustomMetric('log.entry_created', 1, {
      level,
      source,
      category,
    });

    return entry.id;
  }

  public queryLogs(query: LogQuery): LogEntry[] {
    let filtered = this.logs;

    if (query.level && query.level.length > 0) {
      filtered = filtered.filter(log => query.level!.includes(log.level));
    }

    if (query.source && query.source.length > 0) {
      filtered = filtered.filter(log => query.source!.includes(log.source));
    }

    if (query.category && query.category.length > 0) {
      filtered = filtered.filter(log => query.category!.includes(log.category));
    }

    if (query.timeRange) {
      filtered = filtered.filter(
        log =>
          log.timestamp >= query.timeRange!.start &&
          log.timestamp <= query.timeRange!.end
      );
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filtered = filtered.filter(log => searchRegex.test(log.message));
    }

    if (query.userId) {
      filtered = filtered.filter(log => log.userId === query.userId);
    }

    if (query.sessionId) {
      filtered = filtered.filter(log => log.sessionId === query.sessionId);
    }

    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter(
        log => log.tags && query.tags!.some(tag => log.tags!.includes(tag))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return filtered.slice(offset, offset + limit);
  }

  public getLogAnalytics(timeRange?: number): LogAnalytics {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const logs = this.logs.filter(log => log.timestamp >= cutoff);

    const logsByLevel = logs.reduce(
      (acc, log) {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const logsBySource = logs.reduce(
      (acc, log) {
        acc[log.source] = (acc[log.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const logsByCategory = logs.reduce(
      (acc, log) {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group logs by hour
    const logsByHour = this.groupLogsByHour(logs);

    // Find top errors
    const errorLogs = logs.filter(
      log => log.level === 'error' || log.level === 'fatal'
    );
    const errorCounts = new Map<string, { count: number; lastSeen: number }>();

    errorLogs.forEach(log => {
      const existing = errorCounts.get(log.message) || {
        count: 0,
        lastSeen: 0,
      };
      existing.count++;
      existing.lastSeen = Math.max(existing.lastSeen, log.timestamp);
      errorCounts.set(log.message, existing);
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({
        message,
        count: data.count,
        lastSeen: data.lastSeen,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalLogs: logs.length,
      logsByLevel,
      logsBySource,
      logsByCategory,
      logsByHour,
      topErrors,
      performanceInsights: this.getPerformanceInsights(logs),
      securityEvents: this.getSecurityEvents(logs),
      businessInsights: this.getBusinessInsights(logs),
    };
  }

  private groupLogsByHour(logs: LogEntry[]): LogAnalytics['logsByHour'] {
    const hourlyData = new Map<number, { count: number; errors: number }>();

    logs.forEach(log => {
      const hour =
        Math.floor(log.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      const existing = hourlyData.get(hour) || { count: 0, errors: 0 };
      existing.count++;
      if (log.level === 'error' || log.level === 'fatal') {
        existing.errors++;
      }
      hourlyData.set(hour, existing);
    });

    return Array.from(hourlyData.entries())
      .map(([hour, data]) => ({ hour, count: data.count, errors: data.errors }))
      .sort((a, b) => a.hour - b.hour);
  }

  private getPerformanceInsights(
    logs: LogEntry[]
  ): LogAnalytics['performanceInsights'] {
    const performanceLogs = logs.filter(
      log =>
        log.category === 'performance' ||
        log.message.includes('duration') ||
        log.message.includes('time:')
    );

    const operations = new Map<
      string,
      { durations: number[]; count: number }
    >();
    const resources = new Map<string, { usage: number[]; peak: number }>();

    performanceLogs.forEach(log => {
      // Extract operation timing
      const timingMatch = log.message.match(/(\w+).*time: (\d+)ms/i);
      if (timingMatch) {
        const operation = timingMatch[1];
        const duration = parseInt(timingMatch[2], 10);

        if (!operations.has(operation)) {
          operations.set(operation, { durations: [], count: 0 });
        }

        const opData = operations.get(operation)!;
        opData.durations.push(duration);
        opData.count++;
      }

      // Extract resource usage
      const resourceMatch = log.message.match(/(\w+) usage: (\d+)%/i);
      if (resourceMatch) {
        const resource = resourceMatch[1];
        const usage = parseInt(resourceMatch[2], 10);

        if (!resources.has(resource)) {
          resources.set(resource, { usage: [], peak: 0 });
        }

        const resData = resources.get(resource)!;
        resData.usage.push(usage);
        resData.peak = Math.max(resData.peak, usage);
      }
    });

    const slowOperations = Array.from(operations.entries())
      .map(([operation, data]) => ({
        operation,
        avgDuration:
          data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length,
        count: data.count,
      }))
      .filter(op => op.avgDuration > 100) // Only show operations slower than 100ms
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    const resourceUsage = Array.from(resources.entries())
      .map(([resource, data]) => ({
        resource,
        avgUsage: data.usage.reduce((sum, u) => sum + u, 0) / data.usage.length,
        peakUsage: data.peak,
      }))
      .sort((a, b) => b.peakUsage - a.peakUsage);

    return { slowOperations, resourceUsage };
  }

  private getSecurityEvents(logs: LogEntry[]): LogAnalytics['securityEvents'] {
    const securityLogs = logs.filter(
      log =>
        log.category === 'security' ||
        /security|auth|login|unauthorized/i.test(log.message)
    );

    const events = new Map<string, { count: number; severity: string }>();

    securityLogs.forEach(log => {
      let eventType = 'unknown';
      let severity = 'low';

      if (/authentication.*failed|login.*failed/i.test(log.message)) {
        eventType = 'Authentication Failure';
        severity = 'medium';
      } else if (/unauthorized.*access/i.test(log.message)) {
        eventType = 'Unauthorized Access';
        severity = 'high';
      } else if (/rate.*limit.*exceeded/i.test(log.message)) {
        eventType = 'Rate Limit Exceeded';
        severity = 'medium';
      } else if (/suspicious.*activity/i.test(log.message)) {
        eventType = 'Suspicious Activity';
        severity = 'critical';
      } else if (/security.*violation/i.test(log.message)) {
        eventType = 'Security Violation';
        severity = 'critical';
      }

      const existing = events.get(eventType) || { count: 0, severity };
      existing.count++;
      // Keep highest severity
      if (
        severity === 'critical' ||
        (severity === 'high' && existing.severity !== 'critical')
      ) {
        existing.severity = severity;
      }
      events.set(eventType, existing);
    });

    return Array.from(events.entries())
      .map(([event, data]) => ({
        event,
        count: data.count,
        severity: data.severity,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getBusinessInsights(
    logs: LogEntry[]
  ): LogAnalytics['businessInsights'] {
    const businessLogs = logs.filter(
      log =>
        log.category === 'business' ||
        /user|message|payment|signup/i.test(log.message)
    );

    const metrics = new Map<string, number>();

    businessLogs.forEach(log => {
      if (/user.*signup|new.*user/i.test(log.message)) {
        metrics.set('User Signups', (metrics.get('User Signups') || 0) + 1);
      } else if (/message.*sent/i.test(log.message)) {
        metrics.set('Messages Sent', (metrics.get('Messages Sent') || 0) + 1);
      } else if (/payment.*completed/i.test(log.message)) {
        metrics.set(
          'Payments Completed',
          (metrics.get('Payments Completed') || 0) + 1
        );
      } else if (/feature.*used/i.test(log.message)) {
        metrics.set('Feature Usage', (metrics.get('Feature Usage') || 0) + 1);
      }
    });

    return Array.from(metrics.entries()).map(([metric, value]) => ({
      metric,
      value,
      trend: 'stable' as const, // Would need historical comparison for real trends
    }));
  }

  public addPattern(
    pattern: Omit<LogPattern, 'frequency' | 'lastMatched' | 'examples'>
  ): void {
    const fullPattern: LogPattern = {
      ...pattern,
      frequency: 0,
      lastMatched: 0,
      examples: [],
    };

    this.patterns.set(pattern.id, fullPattern);
  }

  public getPatterns(): LogPattern[] {
    return Array.from(this.patterns.values());
  }

  public getAlerts(filter?: {
    level?: LogAlert['level'];
    acknowledged?: boolean;
  }): LogAlert[] {
    let alerts = [...this.alerts];

    if (filter?.level) {
      alerts = alerts.filter(alert => alert.level === filter.level);
    }

    if (filter?.acknowledged !== undefined) {
      alerts = alerts.filter(
        alert => alert.acknowledged === filter.acknowledged
      );
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      monitoringService.trackBusinessEvent('log.alert_acknowledged', {
        alertId,
        level: alert.level,
        patternId: alert.patternId,
      });
    }
  }

  // Health check for log aggregation service
  public getLogAggregationHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      isAggregating: boolean;
      totalLogs: number;
      totalPatterns: number;
      activePatterns: number;
      totalAlerts: number;
      unacknowledgedAlerts: number;
      recentLogRate: number;
    };
  } {
    const activePatterns = Array.from(this.patterns.values()).filter(
      p => p.enabled && p.frequency > 0
    ).length;

    const unacknowledgedAlerts = this.alerts.filter(
      a => !a.acknowledged
    ).length;

    const recentLogs = this.logs.filter(
      log => Date.now() - log.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );
    const recentLogRate = recentLogs.length / 5; // Logs per minute

    const status = !this.isAggregating
      ? 'unhealthy'
      : unacknowledgedAlerts > 10 || recentLogRate > 100
        ? 'degraded'
        : 'healthy';

    return {
      status,
      metrics: {
        isAggregating: this.isAggregating,
        totalLogs: this.logs.length,
        totalPatterns: this.patterns.size,
        activePatterns,
        totalAlerts: this.alerts.length,
        unacknowledgedAlerts,
        recentLogRate,
      },
    };
  }
}

// Singleton instance
export const logAggregationService = new LogAggregationService();

// Utility functions
export const logInfo = (
  message: string,
  source: string,
  category: string = 'general',
  metadata?: Record<string, unknown>,
  tags?: string[]
) =>
  logAggregationService.logEntry(
    'info',
    message,
    source,
    category,
    metadata,
    tags
  );

export const logWarn = (
  message: string,
  source: string,
  category: string = 'general',
  metadata?: Record<string, unknown>,
  tags?: string[]
) =>
  logAggregationService.logEntry(
    'warn',
    message,
    source,
    category,
    metadata,
    tags
  );

export const logError = (
  message: string,
  source: string,
  category: string = 'general',
  metadata?: Record<string, unknown>,
  tags?: string[]
) =>
  logAggregationService.logEntry(
    'error',
    message,
    source,
    category,
    metadata,
    tags
  );

export const logDebug = (
  message: string,
  source: string,
  category: string = 'general',
  metadata?: Record<string, unknown>,
  tags?: string[]
) =>
  logAggregationService.logEntry(
    'debug',
    message,
    source,
    category,
    metadata,
    tags
  );

export const queryLogs = (query: LogQuery) =>
  logAggregationService.queryLogs(query);
export const getLogAnalytics = (timeRange?: number) =>
  logAggregationService.getLogAnalytics(timeRange);
export const getLogPatterns = () => logAggregationService.getPatterns();
export const getLogAlerts = (
  filter?: Parameters<typeof logAggregationService.getAlerts>[0]
) => logAggregationService.getAlerts(filter);
export const acknowledgeLogAlert = (alertId: string) =>
  logAggregationService.acknowledgeAlert(alertId);
