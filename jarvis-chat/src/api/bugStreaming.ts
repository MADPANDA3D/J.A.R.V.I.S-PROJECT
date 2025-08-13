/**
 * Bug Streaming API
 * WebSocket-based real-time streaming for live bug updates and notifications
 */

import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import { centralizedLogging } from '@/lib/centralizedLogging';
import { validateAPIKey } from '@/lib/apiSecurity';
import { trackBugReportEvent } from '@/lib/monitoring';
import type { BugDetailResponse, BugFilters } from './bugDashboard';

// Streaming types and interfaces
export interface StreamSubscription {
  id: string;
  connectionId: string;
  type: StreamType;
  filters: StreamFilters;
  format: StreamFormat;
  createdAt: string;
  lastActivity: string;
}

export type StreamType = 
  | 'bug_updates'
  | 'new_bugs'
  | 'status_changes'
  | 'assignments'
  | 'comments'
  | 'resolutions'
  | 'analytics'
  | 'error_patterns'
  | 'user_actions';

export type StreamFormat = 'json' | 'compact' | 'detailed';

export interface StreamFilters extends BugFilters {
  includeResolved?: boolean;
  includeArchived?: boolean;
  realTimeOnly?: boolean;
  priority?: string[];
}

export interface WebSocketConnection {
  id: string;
  ws: WebSocket;
  userId: string;
  apiKey: string;
  subscriptions: Map<string, StreamSubscription>;
  isAuthenticated: boolean;
  connectedAt: string;
  lastActivity: string;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    connectionSource?: string;
  };
}

export interface StreamMessage {
  messageId: string;
  type: 'subscription_success' | 'subscription_error' | 'event' | 'heartbeat' | 'error';
  subscriptionId?: string;
  data?: unknown;
  timestamp: string;
  metadata?: {
    correlationId?: string;
    sequenceNumber?: number;
  };
}

export interface BugUpdateEvent {
  eventId: string;
  eventType: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'resolved' | 'reopened';
  bugId: string;
  bug: BugDetailResponse;
  changes?: {
    field: string;
    previousValue: unknown;
    newValue: unknown;
    changedBy: string;
    reason?: string;
  }[];
  timestamp: string;
  metadata: {
    triggeredBy: string;
    source: string;
    correlationId: string;
  };
}

export interface AnalyticsUpdateEvent {
  eventId: string;
  analyticsType: 'summary' | 'trends' | 'patterns' | 'performance';
  data: {
    metrics: Record<string, number>;
    trends: Array<{ date: string; value: number }>;
    patterns?: Array<{ pattern: string; count: number }>;
  };
  timeRange: {
    start: string;
    end: string;
  };
  timestamp: string;
}

export interface SubscriptionRequest {
  action: 'subscribe' | 'unsubscribe' | 'heartbeat' | 'authenticate';
  subscriptionId?: string;
  type?: StreamType;
  filters?: StreamFilters;
  format?: StreamFormat;
  authToken?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  error?: string;
  message?: string;
}

class BugStreamingService {
  private static instance: BugStreamingService;
  private wss: WebSocketServer | null = null;
  private connections: Map<string, WebSocketConnection> = new Map();
  private eventQueue: BugUpdateEvent[] = [];
  private analyticsQueue: AnalyticsUpdateEvent[] = [];
  private processingQueue: Set<string> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly MAX_CONNECTIONS = 1000;
  private readonly MAX_SUBSCRIPTIONS_PER_CONNECTION = 50;

  private constructor() {}

  static getInstance(): BugStreamingService {
    if (!BugStreamingService.instance) {
      BugStreamingService.instance = new BugStreamingService();
    }
    return BugStreamingService.instance;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: unknown, path: string = '/api/stream') {
    this.wss = new WebSocketServer({ 
      server, 
      path,
      maxPayload: 1024 * 1024 // 1MB max payload
    });

    this.wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    this.startEventProcessor();
    this.startHeartbeat();

    centralizedLogging.info(
      'bug-streaming',
      'system',
      'WebSocket streaming service initialized',
      { path, maxConnections: this.MAX_CONNECTIONS }
    );
  }

  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(ws: WebSocket, request: IncomingMessage) {
    const connectionId = this.generateConnectionId();
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const authToken = url.searchParams.get('token') || request.headers.authorization;

    centralizedLogging.info(
      'bug-streaming',
      'system',
      'New WebSocket connection',
      { 
        connectionId, 
        ip: request.socket.remoteAddress,
        userAgent: request.headers['user-agent']
      }
    );

    // Check connection limits
    if (this.connections.size >= this.MAX_CONNECTIONS) {
      ws.close(1013, 'Server overloaded - maximum connections reached');
      return;
    }

    // Create connection object
    const connection: WebSocketConnection = {
      id: connectionId,
      ws,
      userId: '',
      apiKey: '',
      subscriptions: new Map(),
      isAuthenticated: false,
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      metadata: {
        userAgent: request.headers['user-agent'],
        ipAddress: request.socket.remoteAddress,
        connectionSource: 'websocket'
      }
    };

    // Attempt authentication if token provided
    if (authToken) {
      await this.authenticateConnection(connection, authToken);
    }

    // Store connection
    this.connections.set(connectionId, connection);

    // Set up message handlers
    ws.on("message", async (data: Buffer) => {
      await this.handleMessage(connectionId, data);
    });

    ws.on("close", (code: number, reason: Buffer) => {
      this.handleDisconnection(connectionId, code, reason.toString());
    });

    ws.on("error", (error: Error) => {
      this.handleConnectionError(connectionId, error);
    });

    // Send welcome message
    this.sendMessage(connection, {
      messageId: this.generateMessageId(),
      type: 'heartbeat',
      data: {
        connectionId,
        authenticated: connection.isAuthenticated,
        serverTime: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

    // Track connection
    trackBugReportEvent('websocket_connected', {
      connectionId,
      authenticated: connection.isAuthenticated,
      ip: connection.metadata.ipAddress
    });
  }

  /**
   * Authenticate WebSocket connection
   */
  private async authenticateConnection(connection: WebSocketConnection, authToken: string) {
    try {
      const validation = await validateAPIKey(authToken);
      
      if (validation.valid) {
        connection.isAuthenticated = true;
        connection.apiKey = validation.apiKey!;
        connection.userId = validation.userId!;
        
        centralizedLogging.info(
          'bug-streaming',
          'system',
          'WebSocket connection authenticated',
          { connectionId: connection.id, userId: connection.userId }
        );
      }
    } catch (error) {
      centralizedLogging.warn(
        'bug-streaming',
        'system',
        'WebSocket authentication failed',
        { 
          connectionId: connection.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      );
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(connectionId: string, data: Buffer) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      const message: SubscriptionRequest = JSON.parse(data.toString());
      connection.lastActivity = new Date().toISOString();

      centralizedLogging.debug(
        'bug-streaming',
        'system',
        'WebSocket message received',
        { connectionId, action: message.action, type: message.type }
      );

      switch (message.action) {
        case 'authenticate':
          if (message.authToken) {
            await this.authenticateConnection(connection, message.authToken);
            this.sendMessage(connection, {
              messageId: this.generateMessageId(),
              type: connection.isAuthenticated ? 'subscription_success' : 'subscription_error',
              data: {
                authenticated: connection.isAuthenticated,
                userId: connection.userId
              },
              timestamp: new Date().toISOString()
            });
          }
          break;

        case 'subscribe':
          await this.handleSubscription(connection, message);
          break;

        case 'unsubscribe':
          await this.handleUnsubscription(connection, message);
          break;

        case 'heartbeat':
          this.sendMessage(connection, {
            messageId: this.generateMessageId(),
            type: 'heartbeat',
            data: { serverTime: new Date().toISOString() },
            timestamp: new Date().toISOString()
          });
          break;

        default:
          this.sendMessage(connection, {
            messageId: this.generateMessageId(),
            type: 'error',
            data: { error: 'Unknown action' },
            timestamp: new Date().toISOString()
          });
      }

    } catch (error) {
      this.sendMessage(connection, {
        messageId: this.generateMessageId(),
        type: 'error',
        data: { 
          error: 'Invalid message format',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle subscription request
   */
  private async handleSubscription(connection: WebSocketConnection, message: SubscriptionRequest) {
    // Check authentication for sensitive streams
    const sensitiveStreams: StreamType[] = ['analytics', 'error_patterns', 'user_actions'];
    if (sensitiveStreams.includes(message.type!) && !connection.isAuthenticated) {
      this.sendMessage(connection, {
        messageId: this.generateMessageId(),
        type: 'subscription_error',
        data: { error: 'Authentication required for this stream type' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check subscription limits
    if (connection.subscriptions.size >= this.MAX_SUBSCRIPTIONS_PER_CONNECTION) {
      this.sendMessage(connection, {
        messageId: this.generateMessageId(),
        type: 'subscription_error',
        data: { error: 'Maximum subscriptions per connection reached' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Create subscription
    const subscriptionId = this.generateSubscriptionId();
    const subscription: StreamSubscription = {
      id: subscriptionId,
      connectionId: connection.id,
      type: message.type!,
      filters: message.filters || {},
      format: message.format || 'json',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    // Store subscription
    connection.subscriptions.set(subscriptionId, subscription);

    // Send success response
    this.sendMessage(connection, {
      messageId: this.generateMessageId(),
      type: 'subscription_success',
      subscriptionId,
      data: {
        type: subscription.type,
        filters: subscription.filters,
        format: subscription.format
      },
      timestamp: new Date().toISOString()
    });

    // Track subscription
    trackBugReportEvent('websocket_subscribed', {
      connectionId: connection.id,
      subscriptionId,
      type: subscription.type,
      userId: connection.userId
    });

    centralizedLogging.info(
      'bug-streaming',
      'system',
      'WebSocket subscription created',
      { 
        connectionId: connection.id, 
        subscriptionId, 
        type: subscription.type,
        userId: connection.userId
      }
    );
  }

  /**
   * Handle unsubscription request
   */
  private async handleUnsubscription(connection: WebSocketConnection, message: SubscriptionRequest) {
    const subscriptionId = message.subscriptionId;
    if (!subscriptionId) {
      this.sendMessage(connection, {
        messageId: this.generateMessageId(),
        type: 'subscription_error',
        data: { error: 'Subscription ID required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const subscription = connection.subscriptions.get(subscriptionId);
    if (!subscription) {
      this.sendMessage(connection, {
        messageId: this.generateMessageId(),
        type: 'subscription_error',
        data: { error: 'Subscription not found' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Remove subscription
    connection.subscriptions.delete(subscriptionId);

    // Send success response
    this.sendMessage(connection, {
      messageId: this.generateMessageId(),
      type: 'subscription_success',
      subscriptionId,
      data: { message: 'Subscription removed' },
      timestamp: new Date().toISOString()
    });

    // Track unsubscription
    trackBugReportEvent('websocket_unsubscribed', {
      connectionId: connection.id,
      subscriptionId,
      userId: connection.userId
    });
  }

  /**
   * Handle connection disconnection
   */
  private handleDisconnection(connectionId: string, code: number, reason: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    centralizedLogging.info(
      'bug-streaming',
      'system',
      'WebSocket connection closed',
      { connectionId, code, reason, userId: connection.userId }
    );

    // Track disconnection
    trackBugReportEvent('websocket_disconnected', {
      connectionId,
      code,
      reason,
      userId: connection.userId,
      duration: Date.now() - new Date(connection.connectedAt).getTime()
    });

    // Remove connection
    this.connections.delete(connectionId);
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(connectionId: string, error: Error) {
    const connection = this.connections.get(connectionId);
    
    centralizedLogging.error(
      'bug-streaming',
      'system',
      'WebSocket connection error',
      { 
        connectionId, 
        error: error.message,
        userId: connection?.userId
      }
    );

    // Close connection on error
    if (connection) {
      connection.ws.close(1011, 'Internal server error');
      this.connections.delete(connectionId);
    }
  }

  /**
   * Send message to WebSocket connection
   */
  private sendMessage(connection: WebSocketConnection, message: StreamMessage) {
    if (connection.ws.readyState === WebSocket.OPEN) {
      try {
        connection.ws.send(JSON.stringify(message));
        connection.lastActivity = new Date().toISOString();
      } catch (error) {
        centralizedLogging.error(
          'bug-streaming',
          'system',
          'Failed to send WebSocket message',
          { 
            connectionId: connection.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    }
  }

  /**
   * Broadcast bug update event to subscribers
   */
  broadcastBugUpdate(event: BugUpdateEvent) {
    this.eventQueue.push(event);
    
    centralizedLogging.debug(
      'bug-streaming',
      'system',
      'Bug update event queued for broadcast',
      { eventId: event.eventId, eventType: event.eventType, bugId: event.bugId }
    );
  }

  /**
   * Broadcast analytics update event
   */
  broadcastAnalyticsUpdate(event: AnalyticsUpdateEvent) {
    this.analyticsQueue.push(event);
    
    centralizedLogging.debug(
      'bug-streaming',
      'system',
      'Analytics update event queued for broadcast',
      { eventId: event.eventId, analyticsType: event.analyticsType }
    );
  }

  /**
   * Get streaming statistics
   */
  getStreamingStats() {
    const connections = Array.from(this.connections.values());
    const totalSubscriptions = connections.reduce((sum, conn) => sum + conn.subscriptions.size, 0);
    
    return {
      totalConnections: connections.length,
      authenticatedConnections: connections.filter(c => c.isAuthenticated).length,
      totalSubscriptions,
      subscriptionsByType: this.getSubscriptionsByType(),
      queuedEvents: this.eventQueue.length,
      queuedAnalytics: this.analyticsQueue.length,
      averageConnectionDuration: this.calculateAverageConnectionDuration(connections)
    };
  }

  // Private helper methods

  private startEventProcessor() {
    // Process events every 1 second
    setInterval(() => {
      this.processEventQueue();
      this.processAnalyticsQueue();
    }, 1000);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeats();
    }, this.HEARTBEAT_INTERVAL);
  }

  private processEventQueue() {
    if (this.eventQueue.length === 0) return;

    const events = this.eventQueue.splice(0, 100); // Process up to 100 events at once
    
    for (const event of events) {
      this.deliverEventToSubscribers(event);
    }
  }

  private processAnalyticsQueue() {
    if (this.analyticsQueue.length === 0) return;

    const events = this.analyticsQueue.splice(0, 50); // Process up to 50 analytics events at once
    
    for (const event of events) {
      this.deliverAnalyticsToSubscribers(event);
    }
  }

  private deliverEventToSubscribers(event: BugUpdateEvent) {
    for (const connection of this.connections.values()) {
      for (const subscription of connection.subscriptions.values()) {
        if (this.eventMatchesSubscription(event, subscription)) {
          const formattedEvent = this.formatEventForSubscription(event, subscription);
          
          this.sendMessage(connection, {
            messageId: this.generateMessageId(),
            type: 'event',
            subscriptionId: subscription.id,
            data: formattedEvent,
            timestamp: new Date().toISOString(),
            metadata: {
              correlationId: event.metadata.correlationId
            }
          });
        }
      }
    }
  }

  private deliverAnalyticsToSubscribers(event: AnalyticsUpdateEvent) {
    for (const connection of this.connections.values()) {
      for (const subscription of connection.subscriptions.values()) {
        if (subscription.type === 'analytics') {
          const formattedEvent = this.formatAnalyticsForSubscription(event, subscription);
          
          this.sendMessage(connection, {
            messageId: this.generateMessageId(),
            type: 'event',
            subscriptionId: subscription.id,
            data: formattedEvent,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  private eventMatchesSubscription(event: BugUpdateEvent, subscription: StreamSubscription): boolean {
    // Check stream type match
    const typeMatches = {
      'bug_updates': true,
      'new_bugs': event.eventType === 'created',
      'status_changes': event.eventType === 'status_changed',
      'assignments': event.eventType === 'assigned',
      'comments': event.eventType === 'commented',
      'resolutions': event.eventType === 'resolved'
    };

    if (!typeMatches[subscription.type as keyof typeof typeMatches]) {
      return false;
    }

    // Apply filters
    const filters = subscription.filters;
    const bug = event.bug;

    if (filters.status && !filters.status.includes(bug.status as string)) {
      return false;
    }

    if (filters.severity && !filters.severity.includes(bug.severity)) {
      return false;
    }

    if (filters.assignedTo && bug.assigned_to && !filters.assignedTo.includes(bug.assigned_to)) {
      return false;
    }

    return true;
  }

  private formatEventForSubscription(event: BugUpdateEvent, subscription: StreamSubscription) {
    switch (subscription.format) {
      case 'compact':
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          bugId: event.bugId,
          timestamp: event.timestamp
        };
      
      case 'detailed':
        return event;
      
      default: // json
        return {
          eventId: event.eventId,
          eventType: event.eventType,
          bugId: event.bugId,
          bug: {
            id: event.bug.id,
            title: event.bug.title,
            status: event.bug.status,
            severity: event.bug.severity,
            assigned_to: event.bug.assigned_to
          },
          changes: event.changes,
          timestamp: event.timestamp
        };
    }
  }

  private formatAnalyticsForSubscription(event: AnalyticsUpdateEvent, subscription: StreamSubscription) {
    switch (subscription.format) {
      case 'compact':
        return {
          eventId: event.eventId,
          type: event.analyticsType,
          timestamp: event.timestamp
        };
      
      case 'detailed':
        return event;
      
      default: // json
        return {
          eventId: event.eventId,
          analyticsType: event.analyticsType,
          data: event.data,
          timestamp: event.timestamp
        };
    }
  }

  private sendHeartbeats() {
    const now = Date.now();
    const staleThreshold = now - this.HEARTBEAT_INTERVAL * 2; // 2x heartbeat interval

    for (const connection of this.connections.values()) {
      const lastActivity = new Date(connection.lastActivity).getTime();
      
      if (lastActivity < staleThreshold) {
        // Connection is stale, close it
        connection.ws.close(1000, 'Connection timeout');
        this.connections.delete(connection.id);
      } else if (connection.ws.readyState === WebSocket.OPEN) {
        // Send heartbeat
        this.sendMessage(connection, {
          messageId: this.generateMessageId(),
          type: 'heartbeat',
          data: { serverTime: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private getSubscriptionsByType(): Record<string, number> {
    const subscriptionsByType: Record<string, number> = {};
    
    for (const connection of this.connections.values()) {
      for (const subscription of connection.subscriptions.values()) {
        subscriptionsByType[subscription.type] = (subscriptionsByType[subscription.type] || 0) + 1;
      }
    }
    
    return subscriptionsByType;
  }

  private calculateAverageConnectionDuration(connections: WebSocketConnection[]): number {
    if (connections.length === 0) return 0;
    
    const now = Date.now();
    const totalDuration = connections.reduce((sum, conn) => {
      return sum + (now - new Date(conn.connectedAt).getTime());
    }, 0);
    
    return Math.round(totalDuration / connections.length / 1000); // Convert to seconds
  }

  // ID generators
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    // Close all connections
    for (const connection of this.connections.values()) {
      connection.ws.close(1001, 'Server shutting down');
    }

    this.connections.clear();

    centralizedLogging.info(
      'bug-streaming',
      'system',
      'Bug streaming service shutdown complete',
      {}
    );
  }
}

// Export singleton instance
export const bugStreamingService = BugStreamingService.getInstance();

export default bugStreamingService;