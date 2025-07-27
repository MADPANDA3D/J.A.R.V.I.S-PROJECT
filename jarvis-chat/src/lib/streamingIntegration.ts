/**
 * Streaming Integration Service
 * Connects bug lifecycle events to real-time streaming and webhook delivery
 */

import { bugStreamingService } from '@/api/bugStreaming';
import { webhookDeliveryService } from '@/services/webhookService';
import { centralizedLogging } from './centralizedLogging';
import { trackBugReportEvent } from './monitoring';
import type { BugUpdateEvent, AnalyticsUpdateEvent } from '@/api/bugStreaming';
import type { WebhookPayload, WebhookEvent } from '@/api/externalIntegration';
import type { BugDetailResponse } from '@/api/bugDashboard';
import type { BugStatus } from './bugLifecycle';

export interface StreamingEventContext {
  triggeredBy: string;
  source: 'api' | 'ui' | 'system' | 'webhook';
  correlationId: string;
  metadata?: Record<string, unknown>;
}

class StreamingIntegrationService {
  private static instance: StreamingIntegrationService;
  private eventBuffer: BugUpdateEvent[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly BUFFER_FLUSH_INTERVAL = 2000; // 2 seconds

  private constructor() {
    this.startBufferFlush();
  }

  static getInstance(): StreamingIntegrationService {
    if (!StreamingIntegrationService.instance) {
      StreamingIntegrationService.instance = new StreamingIntegrationService();
    }
    return StreamingIntegrationService.instance;
  }

  /**
   * Handle bug creation event
   */
  async onBugCreated(bug: BugDetailResponse, context: StreamingEventContext) {
    const correlationId = context.correlationId || this.generateCorrelationId();

    centralizedLogging.info(
      'streaming-integration',
      'system',
      'Processing bug creation event',
      { bugId: bug.id, triggeredBy: context.triggeredBy, correlationId }
    );

    // Create streaming event
    const streamingEvent: BugUpdateEvent = {
      eventId: this.generateEventId(),
      eventType: 'created',
      bugId: bug.id,
      bug,
      timestamp: new Date().toISOString(),
      metadata: {
        triggeredBy: context.triggeredBy,
        source: context.source,
        correlationId
      }
    };

    // Buffer event for streaming
    this.bufferEvent(streamingEvent);

    // Create webhook payload
    const webhookPayload: WebhookPayload = {
      eventType: 'bug.created',
      timestamp: streamingEvent.timestamp,
      bugId: bug.id,
      data: {
        bug,
        metadata: streamingEvent.metadata
      }
    };

    // Queue webhook delivery
    await this.queueWebhookDelivery(webhookPayload);

    // Track event
    trackBugReportEvent('bug_created_streamed', {
      bugId: bug.id,
      eventId: streamingEvent.eventId,
      triggeredBy: context.triggeredBy,
      correlationId
    });
  }

  /**
   * Handle bug update event
   */
  async onBugUpdated(
    bug: BugDetailResponse,
    changes: Array<{ field: string; previousValue: unknown; newValue: unknown }>,
    context: StreamingEventContext
  ) {
    const correlationId = context.correlationId || this.generateCorrelationId();

    centralizedLogging.info(
      'streaming-integration',
      'system',
      'Processing bug update event',
      { 
        bugId: bug.id, 
        changedFields: changes.map(c => c.field).join(', '),
        triggeredBy: context.triggeredBy, 
        correlationId 
      }
    );

    // Create streaming event
    const streamingEvent: BugUpdateEvent = {
      eventId: this.generateEventId(),
      eventType: 'updated',
      bugId: bug.id,
      bug,
      changes: changes.map(change => ({
        ...change,
        changedBy: context.triggeredBy
      })),
      timestamp: new Date().toISOString(),
      metadata: {
        triggeredBy: context.triggeredBy,
        source: context.source,
        correlationId
      }
    };

    // Buffer event for streaming
    this.bufferEvent(streamingEvent);

    // Create webhook payload
    const webhookPayload: WebhookPayload = {
      eventType: 'bug.updated',
      timestamp: streamingEvent.timestamp,
      bugId: bug.id,
      data: {
        bug,
        changes: streamingEvent.changes,
        metadata: streamingEvent.metadata
      }
    };

    // Queue webhook delivery
    await this.queueWebhookDelivery(webhookPayload);

    // Track event
    trackBugReportEvent('bug_updated_streamed', {
      bugId: bug.id,
      eventId: streamingEvent.eventId,
      changedFields: changes.length,
      triggeredBy: context.triggeredBy,
      correlationId
    });
  }

  /**
   * Handle bug status change event
   */
  async onBugStatusChanged(
    bug: BugDetailResponse,
    previousStatus: BugStatus,
    newStatus: BugStatus,
    reason: string | undefined,
    context: StreamingEventContext
  ) {
    const correlationId = context.correlationId || this.generateCorrelationId();

    centralizedLogging.info(
      'streaming-integration',
      'system',
      'Processing bug status change event',
      { 
        bugId: bug.id, 
        previousStatus,
        newStatus,
        reason,
        triggeredBy: context.triggeredBy, 
        correlationId 
      }
    );

    // Create streaming event
    const streamingEvent: BugUpdateEvent = {
      eventId: this.generateEventId(),
      eventType: 'status_changed',
      bugId: bug.id,
      bug,
      changes: [{
        field: 'status',
        previousValue: previousStatus,
        newValue: newStatus,
        changedBy: context.triggeredBy,
        reason
      }],
      timestamp: new Date().toISOString(),
      metadata: {
        triggeredBy: context.triggeredBy,
        source: context.source,
        correlationId
      }
    };

    // Buffer event for streaming
    this.bufferEvent(streamingEvent);

    // Determine webhook event type based on status
    let webhookEventType: WebhookEvent = 'bug.status_changed';
    if (newStatus === 'resolved') {
      webhookEventType = 'bug.resolved';
    } else if (newStatus === 'reopened') {
      webhookEventType = 'bug.reopened';
    }

    // Create webhook payload
    const webhookPayload: WebhookPayload = {
      eventType: webhookEventType,
      timestamp: streamingEvent.timestamp,
      bugId: bug.id,
      data: {
        bug,
        changes: streamingEvent.changes,
        metadata: streamingEvent.metadata
      }
    };

    // Queue webhook delivery
    await this.queueWebhookDelivery(webhookPayload);

    // Track event
    trackBugReportEvent('bug_status_changed_streamed', {
      bugId: bug.id,
      eventId: streamingEvent.eventId,
      previousStatus,
      newStatus,
      reason,
      triggeredBy: context.triggeredBy,
      correlationId
    });
  }

  /**
   * Handle bug assignment event
   */
  async onBugAssigned(
    bug: BugDetailResponse,
    previousAssignee: string | null,
    newAssignee: string,
    reason: string | undefined,
    context: StreamingEventContext
  ) {
    const correlationId = context.correlationId || this.generateCorrelationId();

    centralizedLogging.info(
      'streaming-integration',
      'system',
      'Processing bug assignment event',
      { 
        bugId: bug.id, 
        previousAssignee,
        newAssignee,
        reason,
        triggeredBy: context.triggeredBy, 
        correlationId 
      }
    );

    // Create streaming event
    const streamingEvent: BugUpdateEvent = {
      eventId: this.generateEventId(),
      eventType: 'assigned',
      bugId: bug.id,
      bug,
      changes: [{
        field: 'assigned_to',
        previousValue: previousAssignee,
        newValue: newAssignee,
        changedBy: context.triggeredBy,
        reason
      }],
      timestamp: new Date().toISOString(),
      metadata: {
        triggeredBy: context.triggeredBy,
        source: context.source,
        correlationId
      }
    };

    // Buffer event for streaming
    this.bufferEvent(streamingEvent);

    // Create webhook payload
    const webhookPayload: WebhookPayload = {
      eventType: 'bug.assigned',
      timestamp: streamingEvent.timestamp,
      bugId: bug.id,
      data: {
        bug,
        changes: streamingEvent.changes,
        metadata: streamingEvent.metadata
      }
    };

    // Queue webhook delivery
    await this.queueWebhookDelivery(webhookPayload);

    // Track event
    trackBugReportEvent('bug_assigned_streamed', {
      bugId: bug.id,
      eventId: streamingEvent.eventId,
      previousAssignee,
      newAssignee,
      reason,
      triggeredBy: context.triggeredBy,
      correlationId
    });
  }

  /**
   * Handle bug comment event
   */
  async onBugCommented(
    bug: BugDetailResponse,
    comment: { id: string; content: string; author: string },
    context: StreamingEventContext
  ) {
    const correlationId = context.correlationId || this.generateCorrelationId();

    centralizedLogging.info(
      'streaming-integration',
      'system',
      'Processing bug comment event',
      { 
        bugId: bug.id, 
        commentId: comment.id,
        author: comment.author,
        triggeredBy: context.triggeredBy, 
        correlationId 
      }
    );

    // Create streaming event
    const streamingEvent: BugUpdateEvent = {
      eventId: this.generateEventId(),
      eventType: 'commented',
      bugId: bug.id,
      bug,
      changes: [{
        field: 'comments',
        previousValue: null,
        newValue: comment,
        changedBy: context.triggeredBy
      }],
      timestamp: new Date().toISOString(),
      metadata: {
        triggeredBy: context.triggeredBy,
        source: context.source,
        correlationId
      }
    };

    // Buffer event for streaming
    this.bufferEvent(streamingEvent);

    // Create webhook payload
    const webhookPayload: WebhookPayload = {
      eventType: 'bug.commented',
      timestamp: streamingEvent.timestamp,
      bugId: bug.id,
      data: {
        bug,
        changes: streamingEvent.changes,
        metadata: streamingEvent.metadata
      }
    };

    // Queue webhook delivery
    await this.queueWebhookDelivery(webhookPayload);

    // Track event
    trackBugReportEvent('bug_commented_streamed', {
      bugId: bug.id,
      eventId: streamingEvent.eventId,
      commentId: comment.id,
      author: comment.author,
      triggeredBy: context.triggeredBy,
      correlationId
    });
  }

  /**
   * Handle analytics update event
   */
  async onAnalyticsUpdated(
    analyticsType: 'summary' | 'trends' | 'patterns' | 'performance',
    data: unknown,
    timeRange: { start: string; end: string },
    context: StreamingEventContext
  ) {
    const correlationId = context.correlationId || this.generateCorrelationId();

    centralizedLogging.info(
      'streaming-integration',
      'system',
      'Processing analytics update event',
      { 
        analyticsType,
        timeRange,
        triggeredBy: context.triggeredBy, 
        correlationId 
      }
    );

    // Create analytics event
    const analyticsEvent: AnalyticsUpdateEvent = {
      eventId: this.generateEventId(),
      analyticsType,
      data,
      timeRange,
      timestamp: new Date().toISOString()
    };

    // Send to streaming service
    bugStreamingService.broadcastAnalyticsUpdate(analyticsEvent);

    // Track event
    trackBugReportEvent('analytics_updated_streamed', {
      eventId: analyticsEvent.eventId,
      analyticsType,
      triggeredBy: context.triggeredBy,
      correlationId
    });
  }

  /**
   * Get streaming statistics
   */
  getStreamingStats() {
    const bugStreamingStats = bugStreamingService.getStreamingStats();
    const webhookStats = webhookDeliveryService.getDeliveryStats();

    return {
      streaming: bugStreamingStats,
      webhooks: webhookStats,
      integration: {
        bufferedEvents: this.eventBuffer.length,
        bufferSize: this.BUFFER_SIZE,
        flushInterval: this.BUFFER_FLUSH_INTERVAL
      }
    };
  }

  // Private helper methods

  private bufferEvent(event: BugUpdateEvent) {
    this.eventBuffer.push(event);

    // Flush buffer if it's full
    if (this.eventBuffer.length >= this.BUFFER_SIZE) {
      this.flushEventBuffer();
    }
  }

  private flushEventBuffer() {
    if (this.eventBuffer.length === 0) return;

    const events = this.eventBuffer.splice(0, this.BUFFER_SIZE);
    
    centralizedLogging.debug(
      'streaming-integration',
      'system',
      'Flushing event buffer to streaming service',
      { eventCount: events.length }
    );

    // Send all events to streaming service
    events.forEach(event => {
      bugStreamingService.broadcastBugUpdate(event);
    });
  }

  private startBufferFlush() {
    // Flush buffer periodically
    setInterval(() {
      this.flushEventBuffer();
    }, this.BUFFER_FLUSH_INTERVAL);
  }

  private async queueWebhookDelivery(payload: WebhookPayload) {
    try {
      // In a real implementation, this would get webhook configurations
      // and queue delivery to matching webhooks
      centralizedLogging.debug(
        'streaming-integration',
        'system',
        'Webhook payload queued for delivery',
        { eventType: payload.eventType, bugId: payload.bugId }
      );
    } catch {
      centralizedLogging.error(
        'streaming-integration',
        'system',
        'Failed to queue webhook delivery',
        { 
          eventType: payload.eventType, 
          bugId: payload.bugId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );
    }
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const streamingIntegrationService = StreamingIntegrationService.getInstance();

export default streamingIntegrationService;