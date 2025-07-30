/**
 * Multi-Channel Notification Service
 * Comprehensive notification system with email, in-app, and webhook delivery
 */

import { centralizedLogging } from './centralizedLogging';
import { bugReportOperations } from './supabase';
import { trackBugReportEvent } from './monitoring';
import type { BugStatus, BugPriority } from './bugLifecycle';

// Notification types
export type NotificationType = 
  | 'bug_status_update'
  | 'bug_assignment'
  | 'feedback_request'
  | 'escalation_alert'
  | 'comment_mention'
  | 'resolution_verification';

// Notification channels
export type NotificationChannel = 'email' | 'in_app' | 'webhook' | 'sms';

// Notification priority
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Base notification interface
export interface BaseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  createdAt: string;
  scheduledFor?: string;
  expiresAt?: string;
}

// In-app notification
export interface InAppNotification extends BaseNotification {
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
}

// Email notification
export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  template: string;
  variables: Record<string, unknown>;
  priority: NotificationPriority;
  scheduled?: boolean;
  scheduledFor?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bounced?: boolean;
  error?: string;
}

// User notification preferences
export interface UserNotificationPreferences {
  userId: string;
  bugStatusUpdates: {
    enabled: boolean;
    channels: NotificationChannel[];
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  assignmentNotifications: {
    enabled: boolean;
    channels: NotificationChannel[];
    includeComments: boolean;
  };
  feedbackRequests: {
    enabled: boolean;
    channels: NotificationChannel[];
    reminderFrequency: 'none' | 'daily' | 'weekly';
  };
  escalationAlerts: {
    enabled: boolean;
    channels: NotificationChannel[];
    minimumPriority: BugPriority;
  };
  mentions: {
    enabled: boolean;
    channels: NotificationChannel[];
    immediateOnly: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;
    timezone: string;
  };
}

// Email template
export interface EmailTemplate {
  type: NotificationType;
  subject: string;
  template: string;
  variables: string[];
  isDefault: boolean;
}

// Notification delivery result
export interface NotificationDeliveryResult {
  notificationId: string;
  channel: NotificationChannel;
  success: boolean;
  deliveredAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Webhook notification payload
export interface WebhookNotificationPayload {
  event: NotificationType;
  timestamp: string;
  data: {
    bugId: string;
    userId: string;
    title: string;
    message: string;
    metadata: Record<string, unknown>;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private inAppNotifications: Map<string, InAppNotification[]> = new Map();
  private emailQueue: EmailNotification[] = [];
  private webhookEndpoints: Map<string, string> = new Map();
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private emailTemplates: Map<NotificationType, EmailTemplate> = new Map();
  private deliveryHistory: NotificationDeliveryResult[] = [];
  private processingInterval?: NodeJS.Timeout;

  private constructor() {
    this.initializeDefaultTemplates();
    this.startEmailProcessor();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send bug status update notification
   */
  async sendBugStatusUpdate(
    bugId: string,
    userId: string,
    oldStatus: BugStatus,
    newStatus: BugStatus,
    changedBy: string,
    notes?: string
  ): Promise<NotificationDeliveryResult[]> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'notification-service',
        'system',
        'Sending bug status update notification',
        { correlationId, bugId, userId, oldStatus, newStatus }
      );

      // Get bug details
      const { data: bugReport } = await bugReportOperations.getBugReportById(bugId);
      if (!bugReport) {
        throw new Error('Bug report not found');
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.bugStatusUpdates.enabled) {
        return [];
      }

      // Create notification
      const notification: BaseNotification = {
        id: this.generateNotificationId(),
        userId,
        type: 'bug_status_update',
        title: `Bug Status Updated: ${bugReport.title}`,
        message: `Your bug report status changed from "${oldStatus}" to "${newStatus}"${changedBy ? ` by ${changedBy}` : ''}.${notes ? ` Note: ${notes}` : ''}`,
        data: {
          bugId,
          bugTitle: bugReport.title,
          oldStatus,
          newStatus,
          changedBy,
          notes,
          trackingNumber: bugReport.monitoring_data?.tracking_number
        },
        priority: this.determinePriority(newStatus),
        channels: this.filterChannelsByPreferences(preferences.bugStatusUpdates.channels, preferences.quietHours),
        createdAt: new Date().toISOString()
      };

      // Deliver notification through all enabled channels
      const deliveryResults = await this.deliverNotification(notification, preferences);

      // Track notification event
      trackBugReportEvent('notification_sent', {
        type: 'bug_status_update',
        bugId,
        userId,
        channels: notification.channels,
        deliveryCount: deliveryResults.filter(r => r.success).length
      });

      return deliveryResults;

    } catch (error) {
      centralizedLogging.error(
        'notification-service',
        'system',
        'Failed to send bug status update notification',
        { correlationId, bugId, userId, error }
      );
      return [];
    }
  }

  /**
   * Send bug assignment notification
   */
  async sendAssignmentNotification(
    bugId: string,
    assignedTo: string,
    assignedBy: string,
    notes?: string
  ): Promise<NotificationDeliveryResult[]> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'notification-service',
        'system',
        'Sending bug assignment notification',
        { correlationId, bugId, assignedTo, assignedBy }
      );

      // Get bug details
      const { data: bugReport } = await bugReportOperations.getBugReportById(bugId);
      if (!bugReport) {
        throw new Error('Bug report not found');
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(assignedTo);
      if (!preferences.assignmentNotifications.enabled) {
        return [];
      }

      // Create notification
      const notification: BaseNotification = {
        id: this.generateNotificationId(),
        userId: assignedTo,
        type: 'bug_assignment',
        title: `Bug Assigned: ${bugReport.title}`,
        message: `You have been assigned a ${bugReport.severity} priority ${bugReport.bug_type} bug${assignedBy ? ` by ${assignedBy}` : ''}.${notes ? ` Note: ${notes}` : ''}`,
        data: {
          bugId,
          bugTitle: bugReport.title,
          bugType: bugReport.bug_type,
          severity: bugReport.severity,
          assignedBy,
          notes,
          trackingNumber: bugReport.monitoring_data?.tracking_number
        },
        priority: this.mapSeverityToPriority(bugReport.severity),
        channels: this.filterChannelsByPreferences(preferences.assignmentNotifications.channels, preferences.quietHours),
        createdAt: new Date().toISOString()
      };

      const deliveryResults = await this.deliverNotification(notification, preferences);

      trackBugReportEvent('notification_sent', {
        type: 'bug_assignment',
        bugId,
        userId: assignedTo,
        channels: notification.channels,
        deliveryCount: deliveryResults.filter(r => r.success).length
      });

      return deliveryResults;

    } catch (error) {
      centralizedLogging.error(
        'notification-service',
        'system',
        'Failed to send assignment notification',
        { correlationId, bugId, assignedTo, error }
      );
      return [];
    }
  }

  /**
   * Send feedback request notification
   */
  async sendFeedbackRequest(
    bugId: string,
    userId: string,
    requestType: 'verification' | 'satisfaction' | 'more_info'
  ): Promise<NotificationDeliveryResult[]> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'notification-service',
        'system',
        'Sending feedback request notification',
        { correlationId, bugId, userId, requestType }
      );

      // Get bug details
      const { data: bugReport } = await bugReportOperations.getBugReportById(bugId);
      if (!bugReport) {
        throw new Error('Bug report not found');
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences.feedbackRequests.enabled) {
        return [];
      }

      // Create notification based on request type
      let title: string;
      let message: string;
      let actionText: string;

      switch (requestType) {
        case 'verification':
          title = `Please Verify Bug Fix: ${bugReport.title}`;
          message = 'We believe this bug has been resolved. Please verify that the issue is fixed.';
          actionText = 'Verify Resolution';
          break;
        case 'satisfaction':
          title = `Rate Your Experience: ${bugReport.title}`;
          message = 'Your bug has been resolved. Please rate your experience with our support.';
          actionText = 'Rate Experience';
          break;
        case 'more_info':
          title = `Additional Information Needed: ${bugReport.title}`;
          message = 'We need more information to resolve your bug report.';
          actionText = 'Provide Information';
          break;
      }

      const notification: BaseNotification = {
        id: this.generateNotificationId(),
        userId,
        type: 'feedback_request',
        title,
        message,
        data: {
          bugId,
          bugTitle: bugReport.title,
          requestType,
          trackingNumber: bugReport.monitoring_data?.tracking_number,
          actionUrl: `/bugs/${bugId}/feedback`,
          actionText
        },
        priority: 'normal',
        channels: this.filterChannelsByPreferences(preferences.feedbackRequests.channels, preferences.quietHours),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      const deliveryResults = await this.deliverNotification(notification, preferences);

      trackBugReportEvent('notification_sent', {
        type: 'feedback_request',
        requestType,
        bugId,
        userId,
        channels: notification.channels,
        deliveryCount: deliveryResults.filter(r => r.success).length
      });

      return deliveryResults;

    } catch (error) {
      centralizedLogging.error(
        'notification-service',
        'system',
        'Failed to send feedback request notification',
        { correlationId, bugId, userId, requestType, error }
      );
      return [];
    }
  }

  /**
   * Send escalation alert
   */
  async sendEscalationAlert(
    bugId: string,
    priority: BugPriority,
    reason: string,
    recipientIds: string[]
  ): Promise<NotificationDeliveryResult[]> {
    const allResults: NotificationDeliveryResult[] = [];

    for (const userId of recipientIds) {
      try {
        const preferences = await this.getUserPreferences(userId);
        if (!preferences.escalationAlerts.enabled || 
            this.comparePriority(priority, preferences.escalationAlerts.minimumPriority) < 0) {
          continue;
        }

        const { data: bugReport } = await bugReportOperations.getBugReportById(bugId);
        if (!bugReport) continue;

        const notification: BaseNotification = {
          id: this.generateNotificationId(),
          userId,
          type: 'escalation_alert',
          title: `High Priority Bug Alert: ${bugReport.title}`,
          message: `A bug has been escalated to ${priority} priority. Reason: ${reason}`,
          data: {
            bugId,
            bugTitle: bugReport.title,
            priority,
            reason,
            trackingNumber: bugReport.monitoring_data?.tracking_number
          },
          priority: 'urgent',
          channels: preferences.escalationAlerts.channels,
          createdAt: new Date().toISOString()
        };

        const results = await this.deliverNotification(notification, preferences);
        allResults.push(...results);

      } catch (error) {
        centralizedLogging.warn(
          'notification-service',
          'system',
          'Failed to send escalation alert to user',
          { bugId, userId, error }
        );
      }
    }

    return allResults;
  }

  /**
   * Get user's in-app notifications
   */
  getInAppNotifications(userId: string): InAppNotification[] {
    return this.inAppNotifications.get(userId) || [];
  }

  /**
   * Mark in-app notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    const userNotifications = this.inAppNotifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      
      trackBugReportEvent('notification_read', {
        notificationId,
        userId,
        type: notification.type
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Get or create user notification preferences
   */
  async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    let preferences = this.userPreferences.get(userId);
    
    if (!preferences) {
      preferences = this.createDefaultPreferences(userId);
      this.userPreferences.set(userId, preferences);
    }
    
    return preferences;
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string, 
    updates: Partial<UserNotificationPreferences>
  ): Promise<UserNotificationPreferences> {
    const currentPreferences = await this.getUserPreferences(userId);
    const updatedPreferences = { ...currentPreferences, ...updates };
    
    this.userPreferences.set(userId, updatedPreferences);
    
    centralizedLogging.info(
      'notification-service',
      'system',
      'User notification preferences updated',
      { userId, updates }
    );
    
    return updatedPreferences;
  }

  // Private helper methods
  private async deliverNotification(
    notification: BaseNotification
  ): Promise<NotificationDeliveryResult[]> {
    const results: NotificationDeliveryResult[] = [];

    for (const channel of notification.channels) {
      try {
        let deliveryResult: NotificationDeliveryResult;

        switch (channel) {
          case 'in_app':
            deliveryResult = await this.deliverInAppNotification(notification);
            break;
          case 'email':
            deliveryResult = await this.deliverEmailNotification(notification);
            break;
          case 'webhook':
            deliveryResult = await this.deliverWebhookNotification(notification);
            break;
          case 'sms':
            deliveryResult = await this.deliverSMSNotification(notification);
            break;
          default:
            deliveryResult = {
              notificationId: notification.id,
              channel,
              success: false,
              error: 'Unsupported channel'
            };
        }

        results.push(deliveryResult);
        this.deliveryHistory.push(deliveryResult);

      } catch (error) {
        const deliveryResult: NotificationDeliveryResult = {
          notificationId: notification.id,
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(deliveryResult);
        this.deliveryHistory.push(deliveryResult);
      }
    }

    // Cleanup old delivery history
    if (this.deliveryHistory.length > 10000) {
      this.deliveryHistory = this.deliveryHistory.slice(-5000);
    }

    return results;
  }

  private async deliverInAppNotification(notification: BaseNotification): Promise<NotificationDeliveryResult> {
    const inAppNotification: InAppNotification = {
      ...notification,
      read: false,
      actionUrl: notification.data.actionUrl as string,
      actionText: notification.data.actionText as string
    };

    const userNotifications = this.inAppNotifications.get(notification.userId) || [];
    userNotifications.unshift(inAppNotification);

    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    this.inAppNotifications.set(notification.userId, userNotifications);

    // TODO: In a real implementation, this would send via WebSocket
    
    return {
      notificationId: notification.id,
      channel: 'in_app',
      success: true,
      deliveredAt: new Date().toISOString()
    };
  }

  private async deliverEmailNotification(notification: BaseNotification): Promise<NotificationDeliveryResult> {
    const template = this.emailTemplates.get(notification.type);
    if (!template) {
      throw new Error(`No email template found for notification type: ${notification.type}`);
    }

    const emailNotification: EmailNotification = {
      id: this.generateNotificationId(),
      to: `user_${notification.userId}@example.com`, // TODO: Get real email from user profile
      subject: this.renderTemplate(template.subject, notification.data),
      template: template.template,
      variables: notification.data,
      priority: notification.priority,
      scheduled: false
    };

    this.emailQueue.push(emailNotification);

    return {
      notificationId: notification.id,
      channel: 'email',
      success: true,
      deliveredAt: new Date().toISOString(),
      metadata: { emailId: emailNotification.id }
    };
  }

  private async deliverWebhookNotification(notification: BaseNotification): Promise<NotificationDeliveryResult> {
    const webhookUrl = this.webhookEndpoints.get(notification.userId);
    if (!webhookUrl) {
      throw new Error('No webhook endpoint configured for user');
    }

    const payload: WebhookNotificationPayload = {
      event: notification.type,
      timestamp: notification.createdAt,
      data: {
        bugId: notification.data.bugId as string,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        metadata: notification.data
      }
    };

    // TODO: In a real implementation, this would make an HTTP request
    // For now, we'll simulate success

    return {
      notificationId: notification.id,
      channel: 'webhook',
      success: true,
      deliveredAt: new Date().toISOString(),
      metadata: { webhookUrl, payload }
    };
  }

  private async deliverSMSNotification(notification: BaseNotification): Promise<NotificationDeliveryResult> {
    // SMS delivery would be implemented here
    // For now, we'll simulate the delivery

    return {
      notificationId: notification.id,
      channel: 'sms',
      success: true,
      deliveredAt: new Date().toISOString()
    };
  }

  private createDefaultPreferences(userId: string): UserNotificationPreferences {
    return {
      userId,
      bugStatusUpdates: {
        enabled: true,
        channels: ['in_app', 'email'],
        frequency: 'immediate'
      },
      assignmentNotifications: {
        enabled: true,
        channels: ['in_app', 'email'],
        includeComments: true
      },
      feedbackRequests: {
        enabled: true,
        channels: ['in_app', 'email'],
        reminderFrequency: 'daily'
      },
      escalationAlerts: {
        enabled: true,
        channels: ['in_app', 'email'],
        minimumPriority: BugPriority.HIGH
      },
      mentions: {
        enabled: true,
        channels: ['in_app'],
        immediateOnly: true
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      }
    };
  }

  private initializeDefaultTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        type: 'bug_status_update',
        subject: 'Bug Update: {{bugTitle}} - Status Changed to {{newStatus}}',
        template: `
          <h2>Bug Status Update</h2>
          <p>Your bug report "<strong>{{bugTitle}}</strong>" ({{trackingNumber}}) has been updated.</p>
          <p><strong>Status changed from:</strong> {{oldStatus}} → {{newStatus}}</p>
          {{#if changedBy}}<p><strong>Changed by:</strong> {{changedBy}}</p>{{/if}}
          {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
          <p><a href="{{bugUrl}}">View Bug Report</a></p>
        `,
        variables: ['bugTitle', 'trackingNumber', 'oldStatus', 'newStatus', 'changedBy', 'notes', 'bugUrl'],
        isDefault: true
      },
      {
        type: 'bug_assignment',
        subject: 'Bug Assigned: {{bugTitle}}',
        template: `
          <h2>Bug Assignment</h2>
          <p>You have been assigned a new bug report:</p>
          <p><strong>Title:</strong> {{bugTitle}} ({{trackingNumber}})</p>
          <p><strong>Type:</strong> {{bugType}}</p>
          <p><strong>Severity:</strong> {{severity}}</p>
          {{#if assignedBy}}<p><strong>Assigned by:</strong> {{assignedBy}}</p>{{/if}}
          {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
          <p><a href="{{bugUrl}}">View Bug Report</a></p>
        `,
        variables: ['bugTitle', 'trackingNumber', 'bugType', 'severity', 'assignedBy', 'notes', 'bugUrl'],
        isDefault: true
      },
      {
        type: 'feedback_request',
        subject: 'Feedback Requested: {{bugTitle}}',
        template: `
          <h2>Your Feedback is Requested</h2>
          <p>We need your feedback on bug report "<strong>{{bugTitle}}</strong>" ({{trackingNumber}}).</p>
          <p>{{message}}</p>
          <p><a href="{{actionUrl}}">{{actionText}}</a></p>
          <p><em>This request expires in 7 days.</em></p>
        `,
        variables: ['bugTitle', 'trackingNumber', 'message', 'actionUrl', 'actionText'],
        isDefault: true
      }
    ];

    templates.forEach(template => {
      this.emailTemplates.set(template.type, template);
    });
  }

  private startEmailProcessor(): void {
    this.processingInterval = setInterval(() => {
      this.processEmailQueue();
    }, 30000); // Process every 30 seconds
  }

  private async processEmailQueue(): Promise<void> {
    if (this.emailQueue.length === 0) return;

    const batch = this.emailQueue.splice(0, 10); // Process 10 emails at a time

    for (const email of batch) {
      try {
        // TODO: Implement actual email sending
        email.sentAt = new Date().toISOString();
        
        centralizedLogging.debug(
          'notification-service',
          'system',
          'Email notification sent',
          { emailId: email.id, to: email.to, subject: email.subject }
        );
      } catch (error) {
        email.error = error instanceof Error ? error.message : 'Unknown error';
        
        centralizedLogging.error(
          'notification-service',
          'system',
          'Failed to send email notification',
          { emailId: email.id, to: email.to, error: email.error }
        );
      }
    }
  }

  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    quietHours: UserNotificationPreferences['quietHours']
  ): NotificationChannel[] {
    if (!quietHours.enabled) {
      return channels;
    }

    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

    // Simple quiet hours check (doesn't handle timezone properly - would need more sophisticated logic)
    if (currentTime >= quietHours.startTime || currentTime <= quietHours.endTime) {
      // During quiet hours, filter out non-urgent channels
      return channels.filter(channel => channel === 'in_app');
    }

    return channels;
  }

  private determinePriority(status: BugStatus): NotificationPriority {
    switch (status) {
      case BugStatus.RESOLVED:
      case BugStatus.CLOSED:
        return 'normal';
      case BugStatus.REOPENED:
        return 'high';
      default:
        return 'normal';
    }
  }

  private mapSeverityToPriority(severity: string): NotificationPriority {
    switch (severity) {
      case 'critical':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'normal';
      case 'low':
        return 'low';
      default:
        return 'normal';
    }
  }

  private comparePriority(priority1: BugPriority, priority2: BugPriority): number {
    const priorityOrder = {
      [BugPriority.LOW]: 1,
      [BugPriority.MEDIUM]: 2,
      [BugPriority.HIGH]: 3,
      [BugPriority.CRITICAL]: 4,
      [BugPriority.URGENT]: 5
    };

    return priorityOrder[priority1] - priorityOrder[priority2];
  }

  private renderTemplate(template: string, variables: Record<string, unknown>): string {
    let rendered = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    });

    return rendered;
  }

  private generateCorrelationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export convenience functions
export const sendBugStatusUpdate = (
  bugId: string,
  userId: string,
  oldStatus: BugStatus,
  newStatus: BugStatus,
  changedBy: string,
  notes?: string
) => notificationService.sendBugStatusUpdate(bugId, userId, oldStatus, newStatus, changedBy, notes);

export const sendAssignmentNotification = (
  bugId: string,
  assignedTo: string,
  assignedBy: string,
  notes?: string
) => notificationService.sendAssignmentNotification(bugId, assignedTo, assignedBy, notes);

export const sendFeedbackRequest = (
  bugId: string,
  userId: string,
  requestType: 'verification' | 'satisfaction' | 'more_info'
) => notificationService.sendFeedbackRequest(bugId, userId, requestType);

export default notificationService;