/**
 * Intelligent Alerting System
 * Multi-channel alerting with smart aggregation, escalation, and incident management
 */

import { centralizedLogging } from './centralizedLogging';
import { performanceMetrics } from './performanceMetrics';

// Alerting interfaces
export interface AlertRule {
  ruleId: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  severity: AlertSeverity;
  channels: NotificationChannel[];
  throttle: number; // minutes
  escalation?: EscalationPolicy;
  metadata: Record<string, unknown>;
}

export interface AlertCondition {
  conditionId: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'not_contains';
  threshold: number | string;
  timeWindow: number; // minutes
  dataPoints: number; // minimum data points to evaluate
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

export interface NotificationChannel {
  channelId: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'in_app' | 'discord' | 'teams';
  enabled: boolean;
  configuration: ChannelConfiguration;
  failover?: NotificationChannel;
}

export interface ChannelConfiguration {
  email?: {
    recipients: string[];
    subject: string;
    template?: string;
  };
  slack?: {
    webhookUrl: string;
    channel: string;
    username?: string;
    iconEmoji?: string;
  };
  webhook?: {
    url: string;
    method: 'POST' | 'PUT';
    headers: Record<string, string>;
    payload: Record<string, unknown>;
  };
  sms?: {
    provider: 'twilio' | 'aws_sns';
    phoneNumbers: string[];
    apiKey: string;
    apiSecret?: string;
  };
  discord?: {
    webhookUrl: string;
    username?: string;
    avatarUrl?: string;
  };
  teams?: {
    webhookUrl: string;
  };
}

export interface EscalationPolicy {
  policyId: string;
  name: string;
  escalationLevels: EscalationLevel[];
  autoResolve: boolean;
  autoResolveTimeout: number; // minutes
}

export interface EscalationLevel {
  level: number;
  delay: number; // minutes from previous level
  channels: string[]; // channel IDs
  requiresAcknowledgment: boolean;
}

export interface AlertInstance {
  alertId: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  description: string;
  conditions: AlertCondition[];
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  escalationLevel: number;
  notificationsSent: NotificationAttempt[];
  suppressedUntil?: string;
  correlationId: string;
  fingerprint: string;
  metadata: Record<string, unknown>;
}

export interface NotificationAttempt {
  attemptId: string;
  channelId: string;
  channelType: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  timestamp: string;
  response?: string;
  error?: string;
  retryCount: number;
}

export interface AlertAggregation {
  aggregationId: string;
  fingerprint: string;
  alertIds: string[];
  count: number;
  firstAlert: string;
  lastAlert: string;
  severity: AlertSeverity;
  status: 'active' | 'suppressed' | 'resolved';
  suppressionReason?: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertStatus = 'triggered' | 'acknowledged' | 'escalated' | 'resolved' | 'suppressed';

// Alerting configuration
export interface AlertingConfig {
  enabled: boolean;
  evaluationInterval: number; // milliseconds
  maxActiveAlerts: number;
  defaultThrottle: number; // minutes
  aggregation: {
    enabled: boolean;
    timeWindow: number; // minutes
    maxAggregationSize: number;
  };
  suppression: {
    enabled: boolean;
    maintenanceWindows: MaintenanceWindow[];
  };
  retention: {
    resolvedAlerts: number; // days
    acknowledgedAlerts: number; // days
  };
}

export interface MaintenanceWindow {
  windowId: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  recurringPattern?: string; // cron expression
  affectedServices: string[];
  suppressionLevel: 'all' | 'non_critical' | 'warning_and_below';
}

// Intelligent alerting service implementation
class AlertingSystemService {
  private config: AlertingConfig;
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, AlertInstance> = new Map();
  private alertHistory: AlertInstance[] = [];
  private aggregations: Map<string, AlertAggregation> = new Map();
  private evaluationTimer?: NodeJS.Timeout;
  private escalationTimer?: NodeJS.Timeout;
  private maintenanceWindows: Map<string, MaintenanceWindow> = new Map();

  constructor() {
    this.config = this.loadConfiguration();
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  private loadConfiguration(): AlertingConfig {
    return {
      enabled: import.meta.env.VITE_ALERTING_ENABLED === 'true',
      evaluationInterval: parseInt(import.meta.env.VITE_ALERT_EVALUATION_INTERVAL || '30000'), // 30 seconds
      maxActiveAlerts: parseInt(import.meta.env.VITE_MAX_ACTIVE_ALERTS || '100'),
      defaultThrottle: parseInt(import.meta.env.VITE_DEFAULT_ALERT_THROTTLE || '15'), // 15 minutes
      aggregation: {
        enabled: import.meta.env.VITE_ALERT_AGGREGATION_ENABLED === 'true',
        timeWindow: parseInt(import.meta.env.VITE_AGGREGATION_WINDOW || '5'), // 5 minutes
        maxAggregationSize: parseInt(import.meta.env.VITE_MAX_AGGREGATION_SIZE || '10')
      },
      suppression: {
        enabled: import.meta.env.VITE_ALERT_SUPPRESSION_ENABLED === 'true',
        maintenanceWindows: []
      },
      retention: {
        resolvedAlerts: parseInt(import.meta.env.VITE_RESOLVED_ALERTS_RETENTION || '30'), // 30 days
        acknowledgedAlerts: parseInt(import.meta.env.VITE_ACKNOWLEDGED_ALERTS_RETENTION || '7') // 7 days
      }
    };
  }

  private initialize(): void {
    this.setupDefaultRules();
    this.startEvaluation();
    this.startEscalationProcessor();
    this.setupCleanupTimer();
  }

  private setupDefaultRules(): void {
    // Default performance alert rules
    const defaultRules: Omit<AlertRule, 'ruleId'>[] = [
      {
        name: 'High API Response Time',
        description: 'API response time is above acceptable threshold',
        enabled: true,
        conditions: [{
          conditionId: 'api_response_time',
          metric: 'apiResponseTimes.avg',
          operator: 'gt',
          threshold: 2000, // 2 seconds
          timeWindow: 5,
          dataPoints: 3,
          aggregation: 'avg'
        }],
        severity: 'warning',
        channels: this.getDefaultChannels(),
        throttle: 15,
        metadata: { category: 'performance' }
      },
      {
        name: 'Critical Error Rate',
        description: 'Error rate has exceeded critical threshold',
        enabled: true,
        conditions: [{
          conditionId: 'error_rate',
          metric: 'errorRates.totalErrors',
          operator: 'gt',
          threshold: 10, // 10 errors
          timeWindow: 5,
          dataPoints: 2,
          aggregation: 'sum'
        }],
        severity: 'critical',
        channels: this.getDefaultChannels(),
        throttle: 10,
        escalation: this.createDefaultEscalationPolicy(),
        metadata: { category: 'errors' }
      },
      {
        name: 'High CPU Usage',
        description: 'System CPU usage is critically high',
        enabled: true,
        conditions: [{
          conditionId: 'cpu_usage',
          metric: 'systemResources.cpuUsage',
          operator: 'gt',
          threshold: 85, // 85%
          timeWindow: 10,
          dataPoints: 3,
          aggregation: 'avg'
        }],
        severity: 'warning',
        channels: this.getDefaultChannels(),
        throttle: 20,
        metadata: { category: 'system' }
      },
      {
        name: 'Memory Usage Critical',
        description: 'System memory usage is at critical levels',
        enabled: true,
        conditions: [{
          conditionId: 'memory_usage',
          metric: 'systemResources.memoryUsage',
          operator: 'gt',
          threshold: 90, // 90%
          timeWindow: 5,
          dataPoints: 2,
          aggregation: 'avg'
        }],
        severity: 'critical',
        channels: this.getDefaultChannels(),
        throttle: 10,
        escalation: this.createDefaultEscalationPolicy(),
        metadata: { category: 'system' }
      }
    ];

    defaultRules.forEach(rule => {
      this.addAlertRule(rule);
    });
  }

  private getDefaultChannels(): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    // Email channel
    if (import.meta.env.VITE_ALERT_EMAIL_RECIPIENTS) {
      channels.push({
        channelId: 'default_email',
        type: 'email',
        enabled: true,
        configuration: {
          email: {
            recipients: import.meta.env.VITE_ALERT_EMAIL_RECIPIENTS.split(','),
            subject: 'JARVIS Chat Alert: {{alert.ruleName}}',
            template: 'default_email_template'
          }
        }
      });
    }

    // Slack channel
    if (import.meta.env.VITE_ALERT_SLACK_WEBHOOK) {
      channels.push({
        channelId: 'default_slack',
        type: 'slack',
        enabled: true,
        configuration: {
          slack: {
            webhookUrl: import.meta.env.VITE_ALERT_SLACK_WEBHOOK,
            channel: import.meta.env.VITE_ALERT_SLACK_CHANNEL || '#alerts',
            username: 'JARVIS Alerts',
            iconEmoji: ':warning:'
          }
        }
      });
    }

    // Webhook channel
    if (import.meta.env.VITE_ALERT_WEBHOOK_URL) {
      channels.push({
        channelId: 'default_webhook',
        type: 'webhook',
        enabled: true,
        configuration: {
          webhook: {
            url: import.meta.env.VITE_ALERT_WEBHOOK_URL,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_ALERT_WEBHOOK_TOKEN || ''}`
            },
            payload: {
              alert: '{{alert}}',
              timestamp: '{{timestamp}}',
              source: 'jarvis-chat'
            }
          }
        }
      });
    }

    // In-app channel (always enabled)
    channels.push({
      channelId: 'in_app',
      type: 'in_app',
      enabled: true,
      configuration: {}
    });

    return channels;
  }

  private createDefaultEscalationPolicy(): EscalationPolicy {
    return {
      policyId: 'default_escalation',
      name: 'Default Escalation',
      escalationLevels: [
        {
          level: 1,
          delay: 0,
          channels: ['default_slack', 'in_app'],
          requiresAcknowledgment: false
        },
        {
          level: 2,
          delay: 15, // 15 minutes
          channels: ['default_email'],
          requiresAcknowledgment: true
        },
        {
          level: 3,
          delay: 30, // 30 minutes
          channels: ['default_webhook'],
          requiresAcknowledgment: true
        }
      ],
      autoResolve: true,
      autoResolveTimeout: 60 // 1 hour
    };
  }

  private startEvaluation(): void {
    this.evaluationTimer = setInterval(() => {
      this.evaluateRules();
    }, this.config.evaluationInterval);

    // Initial evaluation
    this.evaluateRules();
  }

  private async evaluateRules(): Promise<void> {
    if (this.isInMaintenanceWindow()) {
      return;
    }

    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      try {
        await this.evaluateRule(rule);
      } catch (error) {
        centralizedLogging.error(
          'alerting-system',
          'system',
          `Failed to evaluate alert rule: ${rule.name}`,
          { ruleId: rule.ruleId, error }
        );
      }
    }
  }

  private async evaluateRule(rule: AlertRule): Promise<void> {
    const conditionResults = await Promise.all(
      rule.conditions.map(condition => this.evaluateCondition(condition))
    );

    const allConditionsMet = conditionResults.every(result => result);

    if (allConditionsMet) {
      const existingAlert = this.findActiveAlert(rule.ruleId);
      
      if (!existingAlert && !this.isThrottled(rule)) {
        await this.triggerAlert(rule);
      }
    } else {
      // Check if we should auto-resolve
      const existingAlert = this.findActiveAlert(rule.ruleId);
      if (existingAlert && existingAlert.status === 'triggered') {
        this.autoResolveAlert(existingAlert);
      }
    }
  }

  private async evaluateCondition(condition: AlertCondition): Promise<boolean> {
    try {
      // Get recent performance metrics
      const recentMetrics = performanceMetrics.getMetricsHistory(condition.timeWindow / 60);
      
      if (recentMetrics.length < condition.dataPoints) {
        return false; // Not enough data points
      }

      // Extract metric values
      const values = recentMetrics.map(metrics => 
        this.getMetricValue(condition.metric, metrics)
      ).filter(value => value !== undefined) as number[];

      if (values.length < condition.dataPoints) {
        return false;
      }

      // Apply aggregation
      let aggregatedValue: number;
      switch (condition.aggregation) {
        case 'avg':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'sum':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        default:
          aggregatedValue = values[values.length - 1]; // latest value
      }

      // Evaluate condition
      const threshold = typeof condition.threshold === 'string' 
        ? parseFloat(condition.threshold) 
        : condition.threshold;

      switch (condition.operator) {
        case 'gt': return aggregatedValue > threshold;
        case 'gte': return aggregatedValue >= threshold;
        case 'lt': return aggregatedValue < threshold;
        case 'lte': return aggregatedValue <= threshold;
        case 'eq': return aggregatedValue === threshold;
        case 'contains':
          return String(aggregatedValue).includes(String(condition.threshold));
        case 'not_contains':
          return !String(aggregatedValue).includes(String(condition.threshold));
        default:
          return false;
      }
    } catch (error) {
      centralizedLogging.warn(
        'alerting-system',
        'system',
        `Failed to evaluate condition: ${condition.conditionId}`,
        { condition, error }
      );
      return false;
    }
  }

  private getMetricValue(metricPath: string, metrics: Record<string, unknown>): number | undefined {
    const parts = metricPath.split('.');
    let value = metrics;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return typeof value === 'number' ? value : undefined;
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const alertId = this.generateAlertId();
    const correlationId = this.generateCorrelationId();
    const fingerprint = this.generateFingerprint(rule);

    const alert: AlertInstance = {
      alertId,
      ruleId: rule.ruleId,
      ruleName: rule.name,
      severity: rule.severity,
      status: 'triggered',
      message: this.generateAlertMessage(rule),
      description: rule.description,
      conditions: rule.conditions,
      triggeredAt: new Date().toISOString(),
      escalationLevel: 0,
      notificationsSent: [],
      correlationId,
      fingerprint,
      metadata: { ...rule.metadata }
    };

    // Check for aggregation
    if (this.config.aggregation.enabled) {
      const aggregation = this.findOrCreateAggregation(fingerprint, alert);
      if (aggregation && this.shouldSuppressAlert(aggregation)) {
        alert.status = 'suppressed';
        alert.suppressedUntil = new Date(Date.now() + this.config.aggregation.timeWindow * 60 * 1000).toISOString();
      }
    }

    this.activeAlerts.set(alertId, alert);

    // Send notifications if not suppressed
    if (alert.status !== 'suppressed') {
      await this.sendNotifications(alert, rule.channels);
    }

    // Log alert
    centralizedLogging.warn(
      'alerting-system',
      'system',
      `Alert triggered: ${rule.name}`,
      {
        alertId,
        ruleId: rule.ruleId,
        severity: rule.severity,
        status: alert.status,
        fingerprint
      },
      correlationId
    );
  }

  private generateAlertMessage(rule: AlertRule): string {
    const currentMetrics = performanceMetrics.getCurrentMetrics();
    if (!currentMetrics) return rule.description;

    let message = rule.description;

    // Add current metric values to message
    rule.conditions.forEach(condition => {
      const value = this.getMetricValue(condition.metric, currentMetrics);
      if (value !== undefined) {
        message += ` Current ${condition.metric}: ${value}`;
        if (condition.metric.includes('time')) message += 'ms';
        if (condition.metric.includes('Usage')) message += '%';
        message += ` (threshold: ${condition.threshold})`;
      }
    });

    return message;
  }

  private generateFingerprint(rule: AlertRule): string {
    const fingerprintData = {
      ruleName: rule.name,
      conditions: rule.conditions.map(c => ({ metric: c.metric, operator: c.operator })),
      severity: rule.severity
    };
    
    return btoa(JSON.stringify(fingerprintData)).slice(0, 16);
  }

  private findOrCreateAggregation(fingerprint: string, alert: AlertInstance): AlertAggregation | null {
    let aggregation = this.aggregations.get(fingerprint);
    
    if (!aggregation) {
      aggregation = {
        aggregationId: `agg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fingerprint,
        alertIds: [],
        count: 0,
        firstAlert: alert.alertId,
        lastAlert: alert.alertId,
        severity: alert.severity,
        status: 'active'
      };
      this.aggregations.set(fingerprint, aggregation);
    }

    aggregation.alertIds.push(alert.alertId);
    aggregation.count++;
    aggregation.lastAlert = alert.alertId;
    aggregation.severity = this.getHighestSeverity([aggregation.severity, alert.severity]);

    return aggregation;
  }

  private shouldSuppressAlert(aggregation: AlertAggregation): boolean {
    return aggregation.count > this.config.aggregation.maxAggregationSize;
  }

  private getHighestSeverity(severities: AlertSeverity[]): AlertSeverity {
    const severityOrder: AlertSeverity[] = ['info', 'warning', 'critical', 'emergency'];
    return severities.reduce((highest, current) {
      return severityOrder.indexOf(current) > severityOrder.indexOf(highest) ? current : highest;
    });
  }

  private async sendNotifications(alert: AlertInstance, channels: NotificationChannel[]): Promise<void> {
    for (const channel of channels) {
      if (!channel.enabled) continue;

      try {
        await this.sendNotification(alert, channel);
      } catch (error) {
        centralizedLogging.error(
          'alerting-system',
          'system',
          `Failed to send notification via ${channel.type}`,
          { alertId: alert.alertId, channelId: channel.channelId, error }
        );

        // Try failover channel if configured
        if (channel.failover) {
          try {
            await this.sendNotification(alert, channel.failover);
          } catch (failoverError) {
            centralizedLogging.error(
              'alerting-system',
              'system',
              `Failover notification also failed for ${channel.failover.type}`,
              { alertId: alert.alertId, error: failoverError }
            );
          }
        }
      }
    }
  }

  private async sendNotification(alert: AlertInstance, channel: NotificationChannel): Promise<void> {
    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const attempt: NotificationAttempt = {
      attemptId,
      channelId: channel.channelId,
      channelType: channel.type,
      status: 'pending',
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    alert.notificationsSent.push(attempt);

    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailNotification(alert, channel.configuration.email!);
          break;
        case 'slack':
          await this.sendSlackNotification(alert, channel.configuration.slack!);
          break;
        case 'webhook':
          await this.sendWebhookNotification(alert, channel.configuration.webhook!);
          break;
        case 'discord':
          await this.sendDiscordNotification(alert, channel.configuration.discord!);
          break;
        case 'teams':
          await this.sendTeamsNotification(alert, channel.configuration.teams!);
          break;
        case 'in_app':
          await this.sendInAppNotification(alert);
          break;
        default:
          throw new Error(`Unsupported notification channel type: ${channel.type}`);
      }

      attempt.status = 'sent';
      
      centralizedLogging.info(
        'alerting-system',
        'system',
        `Alert notification sent via ${channel.type}`,
        { alertId: alert.alertId, channelId: channel.channelId, attemptId }
      );

    } catch (error) {
      attempt.status = 'failed';
      attempt.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async sendEmailNotification(alert: AlertInstance, config: NonNullable<ChannelConfiguration['email']>): Promise<void> {
    // Email sending would be implemented with a service like SendGrid, AWS SES, etc.
    // For now, we'll simulate the call
    
    const subject = this.renderTemplate(config.subject, { alert });
    const body = this.renderEmailTemplate(alert, config.template);

    centralizedLogging.info(
      'alerting-system',
      'system',
      `Email notification prepared`,
      {
        alertId: alert.alertId,
        recipients: config.recipients,
        subject
      }
    );

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendSlackNotification(alert: AlertInstance, config: NonNullable<ChannelConfiguration['slack']>): Promise<void> {
    const payload = {
      channel: config.channel,
      username: config.username || 'JARVIS Alerts',
      icon_emoji: config.iconEmoji || ':warning:',
      attachments: [
        {
          color: this.getSeverityColor(alert.severity),
          title: `Alert: ${alert.ruleName}`,
          text: alert.message,
          fields: [
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Status',
              value: alert.status.toUpperCase(),
              short: true
            },
            {
              title: 'Triggered At',
              value: new Date(alert.triggeredAt).toLocaleString(),
              short: true
            }
          ],
          footer: 'JARVIS Chat Monitoring',
          ts: Math.floor(new Date(alert.triggeredAt).getTime() / 1000)
        }
      ]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack API responded with ${response.status}: ${response.statusText}`);
    }
  }

  private async sendWebhookNotification(alert: AlertInstance, config: NonNullable<ChannelConfiguration['webhook']>): Promise<void> {
    const payload = this.renderWebhookPayload(config.payload, { alert, timestamp: new Date().toISOString() });

    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}: ${response.statusText}`);
    }
  }

  private async sendDiscordNotification(alert: AlertInstance, config: NonNullable<ChannelConfiguration['discord']>): Promise<void> {
    const payload = {
      username: config.username || 'JARVIS Alerts',
      avatar_url: config.avatarUrl,
      embeds: [
        {
          title: `Alert: ${alert.ruleName}`,
          description: alert.message,
          color: parseInt(this.getSeverityColor(alert.severity).slice(1), 16),
          fields: [
            {
              name: 'Severity',
              value: alert.severity.toUpperCase(),
              inline: true
            },
            {
              name: 'Status',
              value: alert.status.toUpperCase(),
              inline: true
            }
          ],
          timestamp: alert.triggeredAt,
          footer: {
            text: 'JARVIS Chat Monitoring'
          }
        }
      ]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with ${response.status}: ${response.statusText}`);
    }
  }

  private async sendTeamsNotification(alert: AlertInstance, config: NonNullable<ChannelConfiguration['teams']>): Promise<void> {
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: this.getSeverityColor(alert.severity),
      summary: `Alert: ${alert.ruleName}`,
      sections: [
        {
          activityTitle: `Alert: ${alert.ruleName}`,
          activitySubtitle: alert.message,
          facts: [
            {
              name: 'Severity',
              value: alert.severity.toUpperCase()
            },
            {
              name: 'Status',
              value: alert.status.toUpperCase()
            },
            {
              name: 'Triggered At',
              value: new Date(alert.triggeredAt).toLocaleString()
            }
          ]
        }
      ]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Teams API responded with ${response.status}: ${response.statusText}`);
    }
  }

  private async sendInAppNotification(alert: AlertInstance): Promise<void> {
    // Store in-app notification
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      alertId: alert.alertId,
      title: alert.ruleName,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.triggeredAt,
      read: false
    };

    // Store in localStorage for in-app display
    const existing = JSON.parse(localStorage.getItem('jarvis_alert_notifications') || '[]');
    existing.unshift(notification);
    localStorage.setItem('jarvis_alert_notifications', JSON.stringify(existing.slice(0, 50))); // Keep latest 50

    // Broadcast via centralized logging for real-time updates
    centralizedLogging.info(
      'alerting-system',
      'system',
      'In-app alert notification created',
      { notification }
    );
  }

  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case 'emergency': return '#8B0000'; // Dark red
      case 'critical': return '#DC143C'; // Crimson
      case 'warning': return '#FFA500'; // Orange
      case 'info': return '#1E90FF'; // Dodger blue
      default: return '#808080'; // Gray
    }
  }

  private renderTemplate(template: string, context: Record<string, unknown>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) {
      const keys = key.trim().split('.');
      let value = context;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value !== undefined ? String(value) : match;
    });
  }

  private renderEmailTemplate(alert: AlertInstance, template?: string): string {
    // Default email template
    const defaultTemplate = `
    <h2>Alert: {{alert.ruleName}}</h2>
    <p><strong>Severity:</strong> {{alert.severity}}</p>
    <p><strong>Description:</strong> {{alert.description}}</p>
    <p><strong>Message:</strong> {{alert.message}}</p>
    <p><strong>Triggered At:</strong> {{alert.triggeredAt}}</p>
    <p><strong>Alert ID:</strong> {{alert.alertId}}</p>
    `;

    return this.renderTemplate(template || defaultTemplate, { alert });
  }

  private renderWebhookPayload(payload: Record<string, unknown>, context: Record<string, unknown>): Record<string, unknown> {
    const rendered: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string') {
        rendered[key] = this.renderTemplate(value, context);
      } else {
        rendered[key] = value;
      }
    }
    
    return rendered;
  }

  private startEscalationProcessor(): void {
    this.escalationTimer = setInterval(() {
      this.processEscalations();
    }, 60000); // Check every minute
  }

  private async processEscalations(): Promise<void> {
    for (const alert of this.activeAlerts.values()) {
      if (alert.status !== 'triggered' && alert.status !== 'escalated') continue;

      const rule = this.alertRules.get(alert.ruleId);
      if (!rule?.escalation) continue;

      const nextLevel = alert.escalationLevel + 1;
      const escalationLevel = rule.escalation.escalationLevels.find(level => level.level === nextLevel);
      
      if (!escalationLevel) continue;

      const alertAge = Date.now() - new Date(alert.triggeredAt).getTime();
      const shouldEscalate = alertAge >= (escalationLevel.delay * 60 * 1000);

      if (shouldEscalate && (!escalationLevel.requiresAcknowledgment || !alert.acknowledgedAt)) {
        await this.escalateAlert(alert, escalationLevel, rule);
      }

      // Check for auto-resolve
      if (rule.escalation.autoResolve) {
        const autoResolveTime = rule.escalation.autoResolveTimeout * 60 * 1000;
        if (alertAge >= autoResolveTime && alert.status !== 'resolved') {
          this.autoResolveAlert(alert);
        }
      }
    }
  }

  private async escalateAlert(alert: AlertInstance, escalationLevel: EscalationLevel, rule: AlertRule): Promise<void> {
    alert.escalationLevel = escalationLevel.level;
    alert.status = 'escalated';

    // Send notifications to escalation channels
    const escalationChannels = rule.channels.filter(channel => 
      escalationLevel.channels.includes(channel.channelId)
    );

    await this.sendNotifications(alert, escalationChannels);

    centralizedLogging.warn(
      'alerting-system',
      'system',
      `Alert escalated to level ${escalationLevel.level}`,
      {
        alertId: alert.alertId,
        ruleName: alert.ruleName,
        escalationLevel: escalationLevel.level
      }
    );
  }

  private isThrottled(rule: AlertRule): boolean {
    const throttleTime = (rule.throttle || this.config.defaultThrottle) * 60 * 1000;
    const lastAlert = this.alertHistory
      .filter(alert => alert.ruleId === rule.ruleId)
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())[0];

    if (!lastAlert) return false;

    const timeSinceLastAlert = Date.now() - new Date(lastAlert.triggeredAt).getTime();
    return timeSinceLastAlert < throttleTime;
  }

  private findActiveAlert(ruleId: string): AlertInstance | undefined {
    return Array.from(this.activeAlerts.values()).find(alert => 
      alert.ruleId === ruleId && alert.status !== 'resolved'
    );
  }

  private autoResolveAlert(alert: AlertInstance): void {
    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = 'system_auto_resolve';

    this.alertHistory.push(alert);
    this.activeAlerts.delete(alert.alertId);

    centralizedLogging.info(
      'alerting-system',
      'system',
      `Alert auto-resolved: ${alert.ruleName}`,
      { alertId: alert.alertId }
    );
  }

  private isInMaintenanceWindow(): boolean {
    if (!this.config.suppression.enabled) return false;

    const now = new Date();
    
    for (const window of this.maintenanceWindows.values()) {
      const startTime = new Date(window.startTime);
      const endTime = new Date(window.endTime);
      
      if (now >= startTime && now <= endTime) {
        return true;
      }
    }
    
    return false;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupCleanupTimer(): void {
    // Clean up old data every hour
    setInterval(() {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  private cleanupOldData(): void {
    const now = Date.now();
    
    // Clean up resolved alerts
    const resolvedCutoff = now - (this.config.retention.resolvedAlerts * 24 * 60 * 60 * 1000);
    this.alertHistory = this.alertHistory.filter(alert => 
      alert.status !== 'resolved' || new Date(alert.resolvedAt || alert.triggeredAt).getTime() > resolvedCutoff
    );

    // Clean up acknowledged alerts
    const acknowledgedCutoff = now - (this.config.retention.acknowledgedAlerts * 24 * 60 * 60 * 1000);
    this.alertHistory = this.alertHistory.filter(alert => 
      alert.status !== 'acknowledged' || new Date(alert.acknowledgedAt || alert.triggeredAt).getTime() > acknowledgedCutoff
    );

    // Clean up old aggregations
    const aggregationCutoff = now - (this.config.aggregation.timeWindow * 60 * 1000);
    for (const [fingerprint, aggregation] of this.aggregations.entries()) {
      if (aggregation.status === 'resolved' && 
          new Date(aggregation.lastAlert).getTime() < aggregationCutoff) {
        this.aggregations.delete(fingerprint);
      }
    }
  }

  // Public API methods
  addAlertRule(rule: Omit<AlertRule, 'ruleId'>): string {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: AlertRule = { ruleId, ...rule };
    
    this.alertRules.set(ruleId, fullRule);
    
    centralizedLogging.info(
      'alerting-system',
      'system',
      `Alert rule added: ${rule.name}`,
      { ruleId, ruleName: rule.name }
    );
    
    return ruleId;
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates, ruleId };
    this.alertRules.set(ruleId, updatedRule);
    
    centralizedLogging.info(
      'alerting-system',
      'system',
      `Alert rule updated: ${updatedRule.name}`,
      { ruleId }
    );
    
    return true;
  }

  deleteAlertRule(ruleId: string): boolean {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;

    this.alertRules.delete(ruleId);
    
    centralizedLogging.info(
      'alerting-system',
      'system',
      `Alert rule deleted: ${rule.name}`,
      { ruleId }
    );
    
    return true;
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = acknowledgedBy;

    centralizedLogging.info(
      'alerting-system',
      'system',
      `Alert acknowledged: ${alert.ruleName}`,
      { alertId, acknowledgedBy }
    );

    return true;
  }

  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy;

    this.alertHistory.push(alert);
    this.activeAlerts.delete(alertId);

    centralizedLogging.info(
      'alerting-system',
      'system',
      `Alert resolved: ${alert.ruleName}`,
      { alertId, resolvedBy }
    );

    return true;
  }

  addMaintenanceWindow(window: Omit<MaintenanceWindow, 'windowId'>): string {
    const windowId = `maint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullWindow: MaintenanceWindow = { windowId, ...window };
    
    this.maintenanceWindows.set(windowId, fullWindow);
    
    centralizedLogging.info(
      'alerting-system',
      'system',
      `Maintenance window added: ${window.name}`,
      { windowId, startTime: window.startTime, endTime: window.endTime }
    );
    
    return windowId;
  }

  // Query methods
  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  getActiveAlerts(): AlertInstance[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(limit?: number): AlertInstance[] {
    const sorted = this.alertHistory.sort((a, b) => 
      new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    );
    
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getAlertById(alertId: string): AlertInstance | undefined {
    return this.activeAlerts.get(alertId) || 
           this.alertHistory.find(alert => alert.alertId === alertId);
  }

  getMaintenanceWindows(): MaintenanceWindow[] {
    return Array.from(this.maintenanceWindows.values());
  }

  // Configuration methods
  updateConfig(updates: Partial<AlertingConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.evaluationInterval && this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.startEvaluation();
    }
  }

  getConfig(): AlertingConfig {
    return { ...this.config };
  }

  // Export data for analysis
  exportAlertingData(): {
    rules: AlertRule[];
    activeAlerts: AlertInstance[];
    alertHistory: AlertInstance[];
    aggregations: AlertAggregation[];
    maintenanceWindows: MaintenanceWindow[];
  } {
    return {
      rules: this.getAlertRules(),
      activeAlerts: this.getActiveAlerts(),
      alertHistory: this.getAlertHistory(),
      aggregations: Array.from(this.aggregations.values()),
      maintenanceWindows: this.getMaintenanceWindows()
    };
  }

  // Cleanup method
  destroy(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
    }
    
    if (this.escalationTimer) {
      clearInterval(this.escalationTimer);
    }
  }
}

// Singleton instance
export const alertingSystem = new AlertingSystemService();

// Convenience functions
export const addAlertRule = (rule: Omit<AlertRule, 'ruleId'>) => alertingSystem.addAlertRule(rule);
export const getActiveAlerts = () => alertingSystem.getActiveAlerts();
export const acknowledgeAlert = (alertId: string, acknowledgedBy: string) => alertingSystem.acknowledgeAlert(alertId, acknowledgedBy);
export const resolveAlert = (alertId: string, resolvedBy: string) => alertingSystem.resolveAlert(alertId, resolvedBy);
export const getAlertHistory = (limit?: number) => alertingSystem.getAlertHistory(limit);
export const addMaintenanceWindow = (window: Omit<MaintenanceWindow, 'windowId'>) => alertingSystem.addMaintenanceWindow(window);