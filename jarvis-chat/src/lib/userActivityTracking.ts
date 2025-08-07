/**
 * Real-Time User Activity Tracking System
 * Live user activity monitoring with WebSocket integration and session tracking
 */

import { centralizedLogging } from './centralizedLogging';
import { getCurrentSession } from './sessionTracking';

// User activity interfaces
export interface UserActivityEvent {
  eventId: string;
  sessionId: string;
  userId?: string;
  eventType: 'page_view' | 'chat_message' | 'form_submit' | 'navigation' | 'error' | 'user_action' | 'feature_usage';
  timestamp: string;
  metadata: Record<string, unknown>;
  userAgent: string;
  ipAddress?: string;
  url: string;
  referrer?: string;
  duration?: number;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: string;
  lastActivity: string;
  isActive: boolean;
  deviceInfo: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
    screenResolution: string;
    timezone: string;
  };
  location: {
    url: string;
    path: string;
    referrer?: string;
  };
  activities: UserActivityEvent[];
  totalEvents: number;
  totalDuration: number;
}

export interface ActivityHeatmap {
  timestamp: string;
  intervals: ActivityInterval[];
  totalUsers: number;
  peakConcurrency: number;
}

export interface ActivityInterval {
  timeSlot: string;
  concurrentUsers: number;
  totalEvents: number;
  eventTypes: Record<string, number>;
  popularPages: Array<{ url: string; count: number }>;
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  steps: JourneyStep[];
  totalDuration: number;
  conversionEvents: string[];
  dropOffPoint?: string;
  status: 'active' | 'completed' | 'abandoned';
}

export interface JourneyStep {
  stepId: string;
  timestamp: string;
  eventType: string;
  url: string;
  duration: number;
  metadata: Record<string, unknown>;
}

// WebSocket connection interface
interface ActivityWebSocket {
  connection: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

// Activity tracking configuration
export interface ActivityTrackingConfig {
  enabled: boolean;
  websocketUrl?: string;
  trackingLevel: 'minimal' | 'standard' | 'detailed';
  sessionTimeout: number; // minutes
  batchSize: number;
  flushInterval: number; // milliseconds
  enableHeatmap: boolean;
  enableJourneyTracking: boolean;
  privacyMode: boolean;
  excludeUrls: string[];
  trackingWhitelist?: string[];
}

// Real-time user activity tracking service
class UserActivityTrackingService {
  private config: ActivityTrackingConfig;
  private websocket: ActivityWebSocket;
  private sessions: Map<string, UserSession> = new Map();
  private activityQueue: UserActivityEvent[] = [];
  private heatmapData: ActivityHeatmap[] = [];
  private userJourneys: Map<string, UserJourney> = new Map();
  private flushTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private currentSessionId: string;

  constructor() {
    this.config = this.loadConfiguration();
    this.currentSessionId = this.generateSessionId();
    this.websocket = {
      connection: null,
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000
    };

    if (this.config.enabled) {
      this.initialize();
    }
  }

  private loadConfiguration(): ActivityTrackingConfig {
    return {
      enabled: import.meta.env.VITE_ACTIVITY_TRACKING_ENABLED === 'true',
      websocketUrl: import.meta.env.VITE_ACTIVITY_WEBSOCKET_URL,
      trackingLevel: (import.meta.env.VITE_ACTIVITY_TRACKING_LEVEL as string) || 'standard',
      sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '30'),
      batchSize: parseInt(import.meta.env.VITE_ACTIVITY_BATCH_SIZE || '10'),
      flushInterval: parseInt(import.meta.env.VITE_ACTIVITY_FLUSH_INTERVAL || '5000'),
      enableHeatmap: import.meta.env.VITE_ENABLE_ACTIVITY_HEATMAP === 'true',
      enableJourneyTracking: import.meta.env.VITE_ENABLE_JOURNEY_TRACKING === 'true',
      privacyMode: import.meta.env.VITE_PRIVACY_MODE === 'true',
      excludeUrls: import.meta.env.VITE_ACTIVITY_EXCLUDE_URLS?.split(',') || ['/health', '/metrics'],
      trackingWhitelist: import.meta.env.VITE_ACTIVITY_WHITELIST?.split(',')
    };
  }

  private initialize(): void {
    this.setupWebSocket();
    this.setupEventListeners();
    this.startFlushTimer();
    this.startHeartbeat();
    this.initializeSession();
    this.setupCleanupTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupWebSocket(): void {
    if (!this.config.websocketUrl) return;

    try {
      this.websocket.connection = new WebSocket(this.config.websocketUrl);

      this.websocket.connection.onopen = () => {
        this.websocket.isConnected = true;
        this.websocket.reconnectAttempts = 0;
        
        centralizedLogging.info(
          'activity-tracking',
          'system',
          'WebSocket connection established for activity tracking',
          { sessionId: this.currentSessionId }
        );

        // Send session initialization
        this.sendWebSocketMessage({
          type: 'session_init',
          sessionId: this.currentSessionId,
          timestamp: new Date().toISOString()
        });
      };

      this.websocket.connection.onclose = () => {
        this.websocket.isConnected = false;
        this.handleWebSocketReconnect();
      };

      this.websocket.connection.onerror = (error) => {
        centralizedLogging.error(
          'activity-tracking',
          'system',
          'WebSocket error in activity tracking',
          { error, sessionId: this.currentSessionId }
        );
      };

      this.websocket.connection.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };

    } catch (error) {
      centralizedLogging.error(
        'activity-tracking',
        'system',
        'Failed to setup WebSocket connection',
        { error }
      );
    }
  }

  private handleWebSocketReconnect(): void {
    if (this.websocket.reconnectAttempts >= this.websocket.maxReconnectAttempts) {
      centralizedLogging.error(
        'activity-tracking',
        'system',
        'Max WebSocket reconnection attempts exceeded',
        { attempts: this.websocket.reconnectAttempts }
      );
      return;
    }

    this.websocket.reconnectAttempts++;
    const delay = this.websocket.reconnectDelay * Math.pow(2, this.websocket.reconnectAttempts - 1);

    setTimeout(() => {
      centralizedLogging.info(
        'activity-tracking',
        'system',
        `Attempting WebSocket reconnection (${this.websocket.reconnectAttempts}/${this.websocket.maxReconnectAttempts})`,
        { delay }
      );
      this.setupWebSocket();
    }, delay);
  }

  private sendWebSocketMessage(data: Record<string, unknown>): void {
    if (this.websocket.isConnected && this.websocket.connection) {
      try {
        this.websocket.connection.send(JSON.stringify(data));
      } catch (error) {
        centralizedLogging.warn(
          'activity-tracking',
          'system',
          'Failed to send WebSocket message',
          { data, error }
        );
      }
    }
  }

  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'activity_broadcast':
          // Handle activity updates from other users
          this.handleActivityBroadcast(message.data);
          break;
        case 'session_update':
          // Handle session updates
          this.handleSessionUpdate(message.data);
          break;
        default:
          centralizedLogging.debug(
            'activity-tracking',
            'system',
            'Unknown WebSocket message type',
            { messageType: message.type }
          );
      }
    } catch (error) {
      centralizedLogging.warn(
        'activity-tracking',
        'system',
        'Failed to parse WebSocket message',
        { data, error }
      );
    }
  }

  private setupEventListeners(): void {
    // Page visibility change
    document.addEventListener("visibilitychange", () => {
      this.trackEvent('page_view', {
        visibility: document.visibilityState,
        hidden: document.hidden
      });
    });

    // Navigation events
    window.addEventListener("beforeunload", () => {
      this.trackEvent('navigation', {
        eventType: 'page_unload',
        url: window.location.href
      });
      this.flushActivities();
    });

    // User interaction events
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, (event) {
        this.handleUserInteraction(eventType, event);
      }, { passive: true });
    });

    // Performance API events
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObserver();
    }
  }

  private handleUserInteraction(eventType: string, event: Event): void {
    if (this.config.trackingLevel === 'minimal') return;

    const target = event.target as HTMLElement;
    const metadata: Record<string, unknown> = {
      eventType,
      targetTag: target?.tagName,
      targetId: target?.id,
      targetClass: target?.className,
      timestamp: Date.now()
    };

    // Add specific metadata based on event type
    if (eventType === 'click') {
      metadata.coordinates = {
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY
      };
      metadata.button = (event as MouseEvent).button;
    } else if (eventType === 'scroll') {
      metadata.scrollPosition = {
        x: window.scrollX,
        y: window.scrollY
      };
    }

    this.trackEvent('user_action', metadata);
  }

  private setupPerformanceObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navigationEntry = entry as PerformanceNavigationTiming;
            this.trackEvent('page_view', {
              performanceMetrics: {
                domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
                loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
                totalTime: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
                networkTime: navigationEntry.responseEnd - navigationEntry.fetchStart,
                renderTime: navigationEntry.domComplete - navigationEntry.domLoading
              }
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
    } catch (error) {
      centralizedLogging.warn(
        'activity-tracking',
        'system',
        'Failed to setup performance observer',
        { error }
      );
    }
  }

  private initializeSession(): void {
    const session = getCurrentSession();
    const deviceInfo = this.getDeviceInfo();
    const locationInfo = this.getLocationInfo();

    const userSession: UserSession = {
      sessionId: this.currentSessionId,
      userId: session?.userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
      deviceInfo,
      location: locationInfo,
      activities: [],
      totalEvents: 0,
      totalDuration: 0
    };

    this.sessions.set(this.currentSessionId, userSession);

    // Track session start
    this.trackEvent('page_view', {
      eventType: 'session_start',
      deviceInfo,
      locationInfo
    });

    // Initialize user journey if enabled
    if (this.config.enableJourneyTracking) {
      this.initializeUserJourney();
    }
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  private getLocationInfo() {
    return {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer || undefined
    };
  }

  private initializeUserJourney(): void {
    const journey: UserJourney = {
      sessionId: this.currentSessionId,
      userId: this.sessions.get(this.currentSessionId)?.userId,
      steps: [],
      totalDuration: 0,
      conversionEvents: [],
      status: 'active'
    };

    this.userJourneys.set(this.currentSessionId, journey);
  }

  // Main tracking method
  trackEvent(
    eventType: UserActivityEvent['eventType'],
    metadata: Record<string, unknown> = {},
    userId?: string
  ): void  => {
    if (!this.config.enabled) return;

    // Check if URL should be excluded
    const currentUrl = window.location.pathname;
    if (this.config.excludeUrls.some(url => currentUrl.includes(url))) {
      return;
    }

    // Check whitelist if configured
    if (this.config.trackingWhitelist && 
        !this.config.trackingWhitelist.some(url => currentUrl.includes(url))) {
      return;
    }

    const event: UserActivityEvent = {
      eventId: this.generateEventId(),
      sessionId: this.currentSessionId,
      userId: userId || this.sessions.get(this.currentSessionId)?.userId,
      eventType,
      timestamp: new Date().toISOString(),
      metadata: this.sanitizeMetadata(metadata),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || undefined,
      duration: this.calculateEventDuration(eventType)
    };

    // Add to activity queue
    this.activityQueue.push(event);

    // Update session
    this.updateSession(event);

    // Update journey if enabled
    if (this.config.enableJourneyTracking) {
      this.updateUserJourney(event);
    }

    // Update heatmap if enabled
    if (this.config.enableHeatmap) {
      this.updateHeatmap(event);
    }

    // Send via WebSocket for real-time updates
    this.sendWebSocketMessage({
      type: 'activity_event',
      event
    });

    // Log to centralized logging
    centralizedLogging.debug(
      'activity-tracking',
      'user',
      `User activity: ${eventType}`,
      {
        eventId: event.eventId,
        sessionId: event.sessionId,
        eventType,
        url: event.url,
        metadata: event.metadata
      }
    );
  }

  private calculateEventDuration(): number | undefined {
    const session = this.sessions.get(this.currentSessionId);
    if (!session || session.activities.length === 0) return undefined;

    const lastActivity = session.activities[session.activities.length - 1];
    return Date.now() - new Date(lastActivity.timestamp).getTime();
  }

  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    if (!this.config.privacyMode) return metadata;

    const sanitized = { ...metadata };
    const sensitiveKeys = ['password', 'token', 'email', 'phone', 'ssn', 'creditcard'];

    const sanitizeValue = (value: unknown): unknown  =>  => {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (sensitiveKeys.some(key => lowerValue.includes(key))) {
          return '[REDACTED]';
        }
      } else if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        const sanitizedObj: Record<string, unknown> = {};
        
        Object.entries(obj).forEach(([key, val]) => {
          const lowerKey = key.toLowerCase();
          if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
            sanitizedObj[key] = '[REDACTED]';
          } else {
            sanitizedObj[key] = sanitizeValue(val);
          }
        });
        
        return sanitizedObj;
      }
      
      return value;
    };

    Object.entries(sanitized).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeValue(value);
      }
    });

    return sanitized;
  }

  private updateSession(event: UserActivityEvent): void {
    const session = this.sessions.get(this.currentSessionId);
    if (!session) return;

    session.lastActivity = event.timestamp;
    session.activities.push(event);
    session.totalEvents++;
    session.totalDuration = Date.now() - new Date(session.startTime).getTime();
    session.location = this.getLocationInfo();

    this.sessions.set(this.currentSessionId, session);
  }

  private updateUserJourney(event: UserActivityEvent): void {
    const journey = this.userJourneys.get(this.currentSessionId);
    if (!journey) return;

    const step: JourneyStep = {
      stepId: `step_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: event.timestamp,
      eventType: event.eventType,
      url: event.url,
      duration: event.duration || 0,
      metadata: event.metadata
    };

    journey.steps.push(step);
    journey.totalDuration = Date.now() - new Date(journey.steps[0]?.timestamp || Date.now()).getTime();

    // Check for conversion events
    if (this.isConversionEvent(event)) {
      journey.conversionEvents.push(event.eventType);
    }

    this.userJourneys.set(this.currentSessionId, journey);
  }

  private isConversionEvent(event: UserActivityEvent): boolean {
    const conversionEventTypes = ['form_submit', 'chat_message'];
    const conversionUrls = ['/chat', '/submit', '/purchase'];
    
    return conversionEventTypes.includes(event.eventType) ||
           conversionUrls.some(url => event.url.includes(url));
  }

  private updateHeatmap(event: UserActivityEvent): void {
    const now = new Date();
    const timeSlot = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    
    let heatmap = this.heatmapData.find(h => h.timestamp.startsWith(timeSlot.slice(0, 13))); // hourly
    
    if (!heatmap) {
      heatmap = {
        timestamp: timeSlot,
        intervals: [],
        totalUsers: 0,
        peakConcurrency: 0
      };
      this.heatmapData.push(heatmap);
    }

    let interval = heatmap.intervals.find(i => i.timeSlot === timeSlot);
    
    if (!interval) {
      interval = {
        timeSlot,
        concurrentUsers: this.getActiveSessions().length,
        totalEvents: 0,
        eventTypes: {},
        popularPages: []
      };
      heatmap.intervals.push(interval);
    }

    interval.totalEvents++;
    interval.eventTypes[event.eventType] = (interval.eventTypes[event.eventType] || 0) + 1;
    interval.concurrentUsers = Math.max(interval.concurrentUsers, this.getActiveSessions().length);

    // Update popular pages
    const pageEntry = interval.popularPages.find(p => p.url === event.url);
    if (pageEntry) {
      pageEntry.count++;
    } else {
      interval.popularPages.push({ url: event.url, count: 1 });
    }

    // Sort popular pages
    interval.popularPages.sort((a, b) => b.count - a.count);
    interval.popularPages = interval.popularPages.slice(0, 10); // Keep top 10

    // Update heatmap totals
    heatmap.totalUsers = new Set(this.getActiveSessions().map(s => s.userId).filter(Boolean)).size;
    heatmap.peakConcurrency = Math.max(heatmap.peakConcurrency, interval.concurrentUsers);
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushActivities();
    }, this.config.flushInterval);
  }

  private flushActivities(): void {
    if (this.activityQueue.length === 0) return;

    const batch = this.activityQueue.splice(0, this.config.batchSize);

    // Send to centralized logging
    centralizedLogging.info(
      'activity-tracking',
      'system',
      `Flushing ${batch.length} activity events`,
      {
        batchSize: batch.length,
        sessionId: this.currentSessionId,
        events: batch.map(e => ({ eventId: e.eventId, eventType: e.eventType }))
      }
    );

    // Send via WebSocket if connected
    this.sendWebSocketMessage({
      type: 'activity_batch',
      batch
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.websocket.isConnected) {
        this.sendWebSocketMessage({
          type: 'heartbeat',
          sessionId: this.currentSessionId,
          timestamp: new Date().toISOString(),
          activeSessions: this.getActiveSessions().length
        });
      }
    }, 30000); // 30 seconds
  }

  private setupCleanupTimer(): void {
    // Clean up inactive sessions every 5 minutes
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;

    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivity = new Date(session.lastActivity).getTime();
      
      if (now - lastActivity > timeoutMs) {
        session.isActive = false;
        
        // Mark journey as abandoned if applicable
        const journey = this.userJourneys.get(sessionId);
        if (journey && journey.status === 'active') {
          journey.status = 'abandoned';
          journey.dropOffPoint = session.location.url;
        }

        centralizedLogging.info(
          'activity-tracking',
          'system',
          'Session timeout - marking as inactive',
          {
            sessionId,
            lastActivity: session.lastActivity,
            totalDuration: session.totalDuration,
            totalEvents: session.totalEvents
          }
        );
      }
    }

    // Clean up old heatmap data (keep last 24 hours)
    const cutoffTime = now - (24 * 60 * 60 * 1000);
    this.heatmapData = this.heatmapData.filter(h => 
      new Date(h.timestamp).getTime() > cutoffTime
    );
  }

  private handleActivityBroadcast(data: Record<string, unknown>): void {
    // Handle activity updates from other users for real-time dashboard
    centralizedLogging.debug(
      'activity-tracking',
      'system',
      'Received activity broadcast',
      { data }
    );
  }

  private handleSessionUpdate(data: Record<string, unknown>): void {
    // Handle session updates from server
    centralizedLogging.debug(
      'activity-tracking',
      'system',
      'Received session update',
      { data }
    );
  }

  // Query methods
  getActiveSessions(): UserSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive);
  }

  getCurrentSession(): UserSession | undefined {
    return this.sessions.get(this.currentSessionId);
  }

  getSessionById(sessionId: string): UserSession | undefined {
    return this.sessions.get(sessionId);
  }

  getUserJourney(sessionId: string): UserJourney | undefined {
    return this.userJourneys.get(sessionId);
  }

  getHeatmapData(timeRange?: number): ActivityHeatmap[] {
    if (!timeRange) return this.heatmapData;

    const cutoff = Date.now() - (timeRange * 60 * 60 * 1000);
    return this.heatmapData.filter(h => 
      new Date(h.timestamp).getTime() > cutoff
    );
  }

  getActivityStatistics(timeRange: number = 1):   {
    totalEvents: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    topEventTypes: Array<{ eventType: string; count: number }>;
    topPages: Array<{ url: string; count: number }>;
    concurrentUsers: number;
  } {
    const cutoff = Date.now() - (timeRange * 60 * 60 * 1000);
    const recentActivities = this.activityQueue.filter(a => 
      new Date(a.timestamp).getTime() > cutoff
    );

    const eventTypeCounts = recentActivities.reduce((acc, activity) => {
      acc[activity.eventType] = (acc[activity.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pageCounts = recentActivities.reduce((acc, activity) => {
      acc[activity.url] = (acc[activity.url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeSessions = this.getActiveSessions();
    const averageSessionDuration = activeSessions.length > 0
      ? activeSessions.reduce((sum, s) => sum + s.totalDuration, 0) / activeSessions.length
      : 0;

    return {
      totalEvents: recentActivities.length,
      uniqueUsers: new Set(recentActivities.map(a => a.userId).filter(Boolean)).size,
      averageSessionDuration,
      topEventTypes: Object.entries(eventTypeCounts)
        .map(([eventType, count]) => ({ eventType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topPages: Object.entries(pageCounts)
        .map(([url, count]) => ({ url, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      concurrentUsers: activeSessions.length
    };
  }

  // Configuration methods
  updateConfig(updates: Partial<ActivityTrackingConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.flushInterval && this.flushTimer) {
      clearInterval(this.flushTimer);
      this.startFlushTimer();
    }
  }

  getConfig(): ActivityTrackingConfig {
    return { ...this.config };
  }

  // Cleanup method
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    if (this.websocket.connection) {
      this.websocket.connection.close();
    }

    // Final flush
    this.flushActivities();
  }
}

// Singleton instance
export const userActivityTracking = new UserActivityTrackingService();

// Convenience functions
export const trackUserActivity = (
  eventType: UserActivityEvent['eventType'],
  metadata?: Record<string, unknown>,
  userId?: string
) => userActivityTracking.trackEvent(eventType, metadata, userId);

export const getCurrentUserSession = () => userActivityTracking.getCurrentSession();
export const getActiveUserSessions = () => userActivityTracking.getActiveSessions();
export const getUserActivityStatistics = (timeRange?: number) => userActivityTracking.getActivityStatistics(timeRange);
export const getActivityHeatmap = (timeRange?: number) => userActivityTracking.getHeatmapData(timeRange);
export const getUserJourneyData = (sessionId: string) => userActivityTracking.getUserJourney(sessionId);