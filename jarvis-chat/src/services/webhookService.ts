/**
 * Webhook Service
 * External webhook delivery system with retry logic, authentication, and monitoring
 */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { createHmac } from 'crypto';
import { centralizedLogging } from '@/lib/centralizedLogging';
import { trackBugReportEvent } from '@/lib/monitoring';
import type { WebhookConfig, WebhookPayload, SentryIssueData, DataDogEventData } from '@/api/externalIntegration';
import type { BugDetailResponse } from '@/api/bugDashboard';

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  responseTime: number;
  error?: string;
  retryCount: number;
  deliveredAt: string;
}

export interface WebhookDeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  statusCode?: number;
  error?: string;
  responseTime: number;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  payload: WebhookPayload;
  attempts: WebhookDeliveryAttempt[];
  finalResult: WebhookDeliveryResult;
  createdAt: string;
  completedAt?: string;
}

export interface SlackMessageData {
  channel?: string;
  text: string;
  attachments: Array<{
    color: string;
    title: string;
    title_link?: string;
    text: string;
    fields: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
    footer: string;
    ts: number;
  }>;
}

class WebhookDeliveryService {
  private static instance: WebhookDeliveryService;
  private deliveryLogs: Map<string, WebhookDeliveryLog> = new Map();
  private deliveryQueue: Array<{ config: WebhookConfig; payload: WebhookPayload }> = [];
  private processingQueue: Set<string> = new Set();
  private readonly MAX_CONCURRENT_DELIVERIES = 20;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRY_DELAY = 300000; // 5 minutes

  private constructor() {
    this.startDeliveryProcessor();
    this.startLogCleanup();
  }

  static getInstance(): WebhookDeliveryService {
    if (!WebhookDeliveryService.instance) {
      WebhookDeliveryService.instance = new WebhookDeliveryService();
    }
    return WebhookDeliveryService.instance;
  }

  /**
   * Queue webhook for delivery
   */
  async queueWebhookDelivery(config: WebhookConfig, payload: WebhookPayload): Promise<string>  {
    const deliveryId = this.generateDeliveryId();
    
    // Create delivery log
    const deliveryLog: WebhookDeliveryLog = {
      id: deliveryId,
      webhookId: config.id,
      payload,
      attempts: [],
      finalResult: {
        success: false,
        responseTime: 0,
        retryCount: 0,
        deliveredAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    this.deliveryLogs.set(deliveryId, deliveryLog);

    // Add to queue
    this.deliveryQueue.push({ config, payload });

    centralizedLogging.info(
      'webhook-service',
      'system',
      'Webhook queued for delivery',
      { 
        deliveryId, 
        webhookId: config.id, 
        eventType: payload.eventType,
        bugId: payload.bugId
      }
    );

    return deliveryId;
  }

  /**
   * Deliver webhook with retry logic
   */
  async deliverWebhook(config: WebhookConfig, payload: WebhookPayload): Promise<WebhookDeliveryResult>  {
    const startTime = performance.now();
    const deliveryId = this.generateDeliveryId();
    const correlationId = payload.data.metadata.correlationId;

    centralizedLogging.info(
      'webhook-service',
      'system',
      'Starting webhook delivery',
      { 
        deliveryId,
        webhookId: config.id,
        url: config.url,
        eventType: payload.eventType,
        correlationId
      }
    );

    const deliveryLog = this.deliveryLogs.get(deliveryId) || {
      id: deliveryId,
      webhookId: config.id,
      payload,
      attempts: [],
      finalResult: {
        success: false,
        responseTime: 0,
        retryCount: 0,
        deliveredAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    let lastError: string | undefined;
    let attempt = 0;
    const maxRetries = config.retryPolicy.maxRetries;

    while (attempt <= maxRetries) {
      const attemptStartTime = performance.now();
      
      try {
        const result = await this.sendWebhookRequest(config, payload, attempt);
        
        const attemptLog: WebhookDeliveryAttempt = {
          attemptNumber: attempt + 1,
          timestamp: new Date().toISOString(),
          statusCode: result.status,
          responseTime: performance.now() - attemptStartTime
        };

        deliveryLog.attempts.push(attemptLog);

        if (result.status >= 200 && result.status < 300) {
          // Success
          const finalResult: WebhookDeliveryResult = {
            success: true,
            statusCode: result.status,
            responseTime: performance.now() - startTime,
            retryCount: attempt,
            deliveredAt: new Date().toISOString()
          };

          deliveryLog.finalResult = finalResult;
          deliveryLog.completedAt = new Date().toISOString();
          this.deliveryLogs.set(deliveryId, deliveryLog);

          // Track successful delivery
          trackBugReportEvent('webhook_delivered', {
            deliveryId,
            webhookId: config.id,
            eventType: payload.eventType,
            statusCode: result.status,
            retryCount: attempt,
            responseTime: finalResult.responseTime
          });

          centralizedLogging.info(
            'webhook-service',
            'system',
            'Webhook delivered successfully',
            {
              deliveryId,
              webhookId: config.id,
              statusCode: result.status,
              retryCount: attempt,
              responseTime: finalResult.responseTime
            }
          );

          return finalResult;
        } else {
          // HTTP error status
          lastError = `HTTP ${result.status}: ${result.statusText}`;
          attemptLog.error = lastError;
        }

      } catch (error) {
        const attemptLog: WebhookDeliveryAttempt = {
          attemptNumber: attempt + 1,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: performance.now() - attemptStartTime
        };

        deliveryLog.attempts.push(attemptLog);
        lastError = attemptLog.error;

        centralizedLogging.warn(
          'webhook-service',
          'system',
          'Webhook delivery attempt failed',
          {
            deliveryId,
            webhookId: config.id,
            attempt: attempt + 1,
            error: lastError
          }
        );
      }

      attempt++;

      // Wait before retry (exponential backoff)
      if (attempt <= maxRetries) {
        const delay = Math.min(
          Math.pow(config.retryPolicy.backoffMultiplier, attempt) * 1000,
          this.MAX_RETRY_DELAY
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All attempts failed
    const finalResult: WebhookDeliveryResult = {
      success: false,
      responseTime: performance.now() - startTime,
      error: lastError,
      retryCount: maxRetries,
      deliveredAt: new Date().toISOString()
    };

    deliveryLog.finalResult = finalResult;
    deliveryLog.completedAt = new Date().toISOString();
    this.deliveryLogs.set(deliveryId, deliveryLog);

    // Track failed delivery
    trackBugReportEvent('webhook_failed', {
      deliveryId,
      webhookId: config.id,
      eventType: payload.eventType,
      error: lastError,
      retryCount: maxRetries,
      responseTime: finalResult.responseTime
    });

    centralizedLogging.error(
      'webhook-service',
      'system',
      'Webhook delivery failed after all retries',
      {
        deliveryId,
        webhookId: config.id,
        error: lastError,
        retryCount: maxRetries
      }
    );

    return finalResult;
  }

  /**
   * Send individual webhook request
   */
  private async sendWebhookRequest(
    config: WebhookConfig, 
    payload: WebhookPayload, 
    attempt: number
  ): Promise<AxiosResponse>  => {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Jarvis-Chat-Webhook/1.0',
      'X-Webhook-Attempt': (attempt + 1).toString(),
      'X-Webhook-Event': payload.eventType,
      'X-Webhook-Delivery': this.generateDeliveryId(),
      ...config.headers
    };

    // Add authentication headers
    if (config.authentication.type !== 'none' && config.authentication.credentials) {
      switch (config.authentication.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${config.authentication.credentials.token}`;
          break;
        case 'basic': {
          const basicAuth = Buffer.from(
            `${config.authentication.credentials.username}:${config.authentication.credentials.password}`
          ).toString('base64');
          headers['Authorization'] = `Basic ${basicAuth}`;
          break;
        }
        case 'api_key': {
          const headerName = config.authentication.credentials.headerName || 'X-API-Key';
          headers[headerName] = config.authentication.credentials.apiKey!;
          break;
        }
      }
    }

    // Add webhook signature for security
    const signature = this.generateWebhookSignature(payload, config.id);
    headers['X-Webhook-Signature'] = signature;

    // Prepare request config
    const requestConfig: AxiosRequestConfig = {
      method: 'POST',
      url: config.url,
      headers,
      data: payload,
      timeout: this.DEFAULT_TIMEOUT,
      validateStatus: () => true // Don't throw on HTTP error status
    };

    return await axios(requestConfig);
  }

  /**
   * Format bug data for Sentry
   */
  formatForSentry(bug: BugDetailResponse): SentryIssueData {
    return {
      title: bug.title,
      message: bug.description,
      level: this.mapSeverityToSentryLevel(bug.severity),
      platform: 'javascript',
      tags: {
        bug_id: bug.id,
        status: bug.status,
        priority: bug.priority || 'medium',
        bug_type: bug.bug_type || 'unknown',
        component: bug.component || 'unknown'
      },
      extra: {
        reproduction_steps: bug.reproduction_steps,
        expected_behavior: bug.expected_behavior,
        actual_behavior: bug.actual_behavior,
        browser_info: bug.browser_info,
        attachments: bug.attachments?.map(a => ({ name: a.filename, size: a.size })),
        created_at: bug.created_at,
        updated_at: bug.updated_at
      },
      fingerprint: [bug.id, bug.title.toLowerCase().replace(/\s+/g, '_')],
      contexts: {
        bug_report: {
          id: bug.id,
          status: bug.status,
          priority: bug.priority || 'medium',
          assigned_to: bug.assigned_to
        },
        user: bug.user_id ? {
          id: bug.user_id,
          email: bug.user_email
        } : undefined,
        runtime: {
          name: 'jarvis-chat',
          version: '1.0.0'
        }
      }
    };
  }

  /**
   * Format bug data for DataDog
   */
  formatForDataDog(bug: BugDetailResponse): DataDogEventData {
    return {
      title: `Bug Report: ${bug.title}`,
      text: `${bug.description}\n\nReproduction Steps:\n${bug.reproduction_steps || 'Not provided'}`,
      date_happened: Math.floor(new Date(bug.created_at).getTime() / 1000),
      priority: this.mapSeverityToDataDogPriority(bug.severity),
      tags: [
        `bug_id:${bug.id}`,
        `status:${bug.status}`,
        `priority:${bug.priority || 'medium'}`,
        `bug_type:${bug.bug_type || 'unknown'}`,
        `component:${bug.component || 'unknown'}`,
        `assigned_to:${bug.assigned_to || 'unassigned'}`
      ],
      alert_type: this.mapSeverityToDataDogAlertType(bug.severity),
      source_type_name: 'jarvis-chat',
      aggregation_key: `bug_${bug.id}`
    };
  }

  /**
   * Format bug data for Slack
   */
  formatForSlack(bug: BugDetailResponse): SlackMessageData {
    const color = this.mapSeverityToSlackColor(bug.severity);
    const statusEmoji = this.getStatusEmoji(bug.status);
    const priorityEmoji = this.getPriorityEmoji(bug.priority);

    return {
      text: `${statusEmoji} New Bug Report: ${bug.title}`,
      attachments: [
        {
          color,
          title: bug.title,
          title_link: `${process.env.FRONTEND_URL}/bugs/${bug.id}`,
          text: bug.description,
          fields: [
            {
              title: 'Status',
              value: `${statusEmoji} ${bug.status}`,
              short: true
            },
            {
              title: 'Priority',
              value: `${priorityEmoji} ${bug.priority || 'Medium'}`,
              short: true
            },
            {
              title: 'Severity',
              value: bug.severity,
              short: true
            },
            {
              title: 'Component',
              value: bug.component || 'Unknown',
              short: true
            },
            {
              title: 'Assigned To',
              value: bug.assigned_to || 'Unassigned',
              short: true
            },
            {
              title: 'Reporter',
              value: bug.user_email || 'Anonymous',
              short: true
            }
          ],
          footer: 'Jarvis Chat Bug Tracking',
          ts: Math.floor(new Date(bug.created_at).getTime() / 1000)
        }
      ]
    };
  }

  /**
   * Get webhook delivery logs
   */
  getDeliveryLogs(filters: {
    webhookId?: string;
    eventType?: string;
    success?: boolean;
    dateRange?: { start: string; end: string };
    limit?: number;
  } = {}): WebhookDeliveryLog[]  => {
    let logs = Array.from(this.deliveryLogs.values());

    // Apply filters
    if (filters.webhookId) {
      logs = logs.filter(log => log.webhookId === filters.webhookId);
    }

    if (filters.eventType) {
      logs = logs.filter(log => log.payload.eventType === filters.eventType);
    }

    if (filters.success !== undefined) {
      logs = logs.filter(log => log.finalResult.success === filters.success);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      logs = logs.filter(log => {
        const logTime = new Date(log.createdAt).getTime();
        return logTime >= start && logTime <= end;
      });
    }

    // Sort by creation time (newest first)
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    if (filters.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * Get webhook delivery statistics
   */
  getDeliveryStats(webhookId?: string):   {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
    successRate: number;
    deliveriesByEventType: Record<string, number>;
    recentErrors: string[];
  } {
    let logs = Array.from(this.deliveryLogs.values());
    
    if (webhookId) {
      logs = logs.filter(log => log.webhookId === webhookId);
    }

    const successful = logs.filter(log => log.finalResult.success);
    const failed = logs.filter(log => !log.finalResult.success);
    
    const totalResponseTime = logs.reduce((sum, log) => sum + log.finalResult.responseTime, 0);
    const averageResponseTime = logs.length > 0 ? totalResponseTime / logs.length : 0;

    const deliveriesByEventType = logs.reduce((acc, log) => {
      const eventType = log.payload.eventType;
      acc[eventType] = (acc[eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = failed
      .slice(0, 10)
      .map(log => log.finalResult.error || 'Unknown error')
      .filter((error, index, arr) => arr.indexOf(error) === index); // Unique errors

    return {
      totalDeliveries: logs.length,
      successfulDeliveries: successful.length,
      failedDeliveries: failed.length,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: logs.length > 0 ? (successful.length / logs.length) * 100 : 0,
      deliveriesByEventType,
      recentErrors
    };
  }

  // Private helper methods

  private startDeliveryProcessor() {
    // Process delivery queue every 2 seconds
    setInterval(() => {
      this.processDeliveryQueue();
    }, 2000);
  }

  private startLogCleanup() {
    // Clean up old logs every hour
    setInterval(() => {
      this.cleanupOldLogs();
    }, 60 * 60 * 1000);
  }

  private async processDeliveryQueue() {
    if (this.deliveryQueue.length === 0 || this.processingQueue.size >= this.MAX_CONCURRENT_DELIVERIES) {
      return;
    }

    const queueItem = this.deliveryQueue.shift();
    if (!queueItem) return;

    const processingId = `${queueItem.config.id}_${queueItem.payload.bugId}`;
    this.processingQueue.add(processingId);

    try {
      await this.deliverWebhook(queueItem.config, queueItem.payload);
    } finally {
      this.processingQueue.delete(processingId);
    }
  }

  private cleanupOldLogs() {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    const logsToDelete: string[] = [];

    for (const [id, log] of this.deliveryLogs.entries()) {
      if (new Date(log.createdAt).getTime() < cutoffTime) {
        logsToDelete.push(id);
      }
    }

    logsToDelete.forEach(id => this.deliveryLogs.delete(id));

    if (logsToDelete.length > 0) {
      centralizedLogging.info(
        'webhook-service',
        'system',
        'Cleaned up old webhook delivery logs',
        { deletedCount: logsToDelete.length }
      );
    }
  }

  private generateWebhookSignature(payload: WebhookPayload, webhookId: string): string {
    const secret = `webhook_${webhookId}_${process.env.WEBHOOK_SECRET || 'default_secret'}`;
    const payloadString = JSON.stringify(payload);
    return createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  private generateDeliveryId(): string {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mapping helper methods
  private mapSeverityToSentryLevel(severity: string): SentryIssueData['level'] {
    const mapping: Record<string, SentryIssueData['level']> = {
      'low': 'info',
      'medium': 'warning',
      'high': 'error',
      'critical': 'error'
    };
    return mapping[severity] || 'warning';
  }

  private mapSeverityToDataDogPriority(severity: string): DataDogEventData['priority'] {
    return ['high', 'critical'].includes(severity) ? 'normal' : 'low';
  }

  private mapSeverityToDataDogAlertType(severity: string): DataDogEventData['alert_type'] {
    const mapping: Record<string, DataDogEventData['alert_type']> = {
      'low': 'info',
      'medium': 'warning',
      'high': 'error',
      'critical': 'error'
    };
    return mapping[severity] || 'warning';
  }

  private mapSeverityToSlackColor(severity: string): string {
    const mapping: Record<string, string> = {
      'low': '#36a64f',
      'medium': '#ff9500',
      'high': '#ff0000',
      'critical': '#8b0000'
    };
    return mapping[severity] || '#ff9500';
  }

  private getStatusEmoji(status: string): string {
    const mapping: Record<string, string> = {
      'open': '🔴',
      'triaged': '🔶',
      'in_progress': '🔵',
      'pending_verification': '🟡',
      'resolved': '✅',
      'closed': '⚪',
      'reopened': '🔄'
    };
    return mapping[status] || '❓';
  }

  private getPriorityEmoji(priority?: string): string {
    const mapping: Record<string, string> = {
      'low': '🟢',
      'medium': '🟡',
      'high': '🟠',
      'critical': '🔴',
      'urgent': '🆘'
    };
    return mapping[priority || 'medium'] || '🟡';
  }
}

// Export singleton instance
export const webhookDeliveryService = WebhookDeliveryService.getInstance();

export default webhookDeliveryService;