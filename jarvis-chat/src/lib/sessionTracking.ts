/**
 * Comprehensive User Session Management and Logging System
 * Tracks user sessions, authentication events, and user journey analytics
 */

import { addBreadcrumb, setErrorTags } from './errorTracking';

// Session tracking interfaces
export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: string;
  lastActivity: string;
  endTime?: string;
  pageViews: PageView[];
  authEvents: AuthEvent[];
  userActions: UserAction[];
  errorCount: number;
  deviceInfo: DeviceInfo;
  metadata: Record<string, unknown>;
}

export interface PageView {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  referrer?: string;
  duration?: number;
  scrollDepth?: number;
  interactions: number;
}

export interface AuthEvent {
  id: string;
  type: 'sign_in' | 'sign_up' | 'sign_out' | 'token_refresh' | 'password_reset' | 'session_start' | 'session_end';
  timestamp: string;
  userId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface UserAction {
  id: string;
  type: 'chat_message' | 'form_submit' | 'navigation' | 'button_click' | 'file_upload' | 'search' | 'scroll';
  timestamp: string;
  elementId?: string;
  elementText?: string;
  url: string;
  metadata?: Record<string, unknown>;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browserName: string;
  browserVersion: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  connectionType?: string;
  hardwareConcurrency?: number;
  memoryGB?: number;
}

// Session lifecycle management
class SessionTracker {
  private currentSession: UserSession | null = null;
  private sessionStorage: UserSession[] = [];
  private maxSessions = 10; // Keep last 10 sessions in memory
  private activityTimeout = 30 * 60 * 1000; // 30 minutes inactivity timeout
  private activityTimer?: NodeJS.Timeout;
  private pageStartTime?: number;
  private currentPageView?: PageView;

  constructor() {
    this.initializeSession();
    this.setupActivityTracking();
    this.setupNavigationTracking();
    this.setupUserActionTracking();
  }

  private initializeSession(): void {
    // Load existing sessions from localStorage
    this.loadPersistedSessions();

    // Create new session
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      pageViews: [],
      authEvents: [],
      userActions: [],
      errorCount: 0,
      deviceInfo: this.collectDeviceInfo(),
      metadata: {}
    };

    // Add session start breadcrumb
    addBreadcrumb('info', 'info', 'User session started', {
      sessionId: this.currentSession.sessionId,
      deviceInfo: this.currentSession.deviceInfo
    });

    // Log session start auth event
    this.logAuthEvent('session_start', true);

    // Track initial page view
    this.trackPageView();

    // Persist session
    this.persistSessions();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private collectDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Parse browser info
    const browserInfo = this.parseBrowserInfo(userAgent);
    
    return {
      userAgent,
      platform,
      browserName: browserInfo.name,
      browserVersion: browserInfo.version,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      connectionType: this.getConnectionType(),
      hardwareConcurrency: navigator.hardwareConcurrency,
      memoryGB: this.getMemoryInfo()
    };
  }

  private parseBrowserInfo(userAgent: string): { name: string; version: string } {
    const browsers = [
      { name: 'Chrome', regex: /Chrome\/(\d+)/ },
      { name: 'Firefox', regex: /Firefox\/(\d+)/ },
      { name: 'Safari', regex: /Version\/(\d+).*Safari/ },
      { name: 'Edge', regex: /Edg\/(\d+)/ },
      { name: 'Opera', regex: /OPR\/(\d+)/ }
    ];

    for (const browser of browsers) {
      const match = userAgent.match(browser.regex);
      if (match) {
        return { name: browser.name, version: match[1] };
      }
    }

    return { name: 'Unknown', version: 'Unknown' };
  }

  private getConnectionType(): string | undefined {
    const connection = (navigator as unknown as { connection?: { effectiveType?: string; type?: string } }).connection;
    return connection?.effectiveType || connection?.type;
  }

  private getMemoryInfo(): number | undefined {
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    return memory ? Math.round(memory) : undefined;
  }

  private setupActivityTracking(): void {
    // Track user activity to update session
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => this.updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Set up inactivity timer
    this.resetActivityTimer();

    // Track when user leaves/returns to page
    document.addEventListener('visibilitychange', () {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () {
      this.endSession();
    });
  }

  private setupNavigationTracking(): void {
    // Track page navigation
    const trackNavigation = () {
      this.trackPageView();
    };

    // Listen for URL changes (SPA navigation)
    window.addEventListener('popstate', trackNavigation);
    
    // Override pushState and replaceState for SPA tracking
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) {
      originalPushState.apply(history, args);
      setTimeout(trackNavigation, 0);
    };

    history.replaceState = (...args) {
      originalReplaceState.apply(history, args);
      setTimeout(trackNavigation, 0);
    };
  }

  private setupUserActionTracking(): void {
    // Track form submissions
    document.addEventListener('submit', (event) {
      const form = event.target as HTMLFormElement;
      this.trackUserAction('form_submit', {
        elementId: form.id,
        action: form.action,
        method: form.method
      });
    });

    // Track button clicks
    document.addEventListener('click', (event) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.type === 'button' || target.type === 'submit') {
        this.trackUserAction('button_click', {
          elementId: target.id,
          elementText: target.textContent?.trim() || target.getAttribute('aria-label'),
          className: target.className
        });
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    document.addEventListener('scroll', () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Update current page view
        if (this.currentPageView) {
          this.currentPageView.scrollDepth = scrollDepth;
        }

        // Track significant scroll milestones
        if (scrollDepth >= 25 && scrollDepth % 25 === 0 && scrollDepth <= 100) {
          this.trackUserAction('scroll', {
            scrollDepth,
            milestone: true
          });
        }
      }
    });
  }

  private updateActivity(): void {
    if (!this.currentSession) return;

    this.currentSession.lastActivity = new Date().toISOString();
    
    // Update current page view interaction count
    if (this.currentPageView) {
      this.currentPageView.interactions++;
    }

    this.resetActivityTimer();
    this.persistSessions();
  }

  private resetActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    this.activityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.activityTimeout);
  }

  private handleInactivityTimeout(): void {
    if (!this.currentSession) return;

    addBreadcrumb('info', 'info', 'Session inactive timeout', {
      sessionId: this.currentSession.sessionId,
      lastActivity: this.currentSession.lastActivity
    });

    this.endSession();
  }

  private handlePageHidden(): void {
    if (this.currentPageView) {
      this.finalizePageView();
    }
    
    addBreadcrumb('info', 'navigation', 'Page hidden', {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  private handlePageVisible(): void {
    this.trackPageView();
    
    addBreadcrumb('info', 'navigation', 'Page visible', {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  private trackPageView(): void {
    // Finalize previous page view
    if (this.currentPageView) {
      this.finalizePageView();
    }

    // Create new page view
    this.currentPageView = {
      id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || undefined,
      interactions: 0
    };

    this.pageStartTime = Date.now();

    // Add to current session
    if (this.currentSession) {
      this.currentSession.pageViews.push(this.currentPageView);
    }

    // Add breadcrumb
    addBreadcrumb('info', 'navigation', `Page view: ${this.currentPageView.title}`, {
      url: this.currentPageView.url,
      referrer: this.currentPageView.referrer
    });

    this.persistSessions();
  }

  private finalizePageView(): void {
    if (!this.currentPageView || !this.pageStartTime) return;

    this.currentPageView.duration = Date.now() - this.pageStartTime;
    
    addBreadcrumb('info', 'navigation', `Page view ended: ${this.currentPageView.title}`, {
      url: this.currentPageView.url,
      duration: this.currentPageView.duration,
      interactions: this.currentPageView.interactions,
      scrollDepth: this.currentPageView.scrollDepth
    });
  }

  private trackUserAction(type: UserAction['type'], metadata?: Record<string, unknown>): void {
    if (!this.currentSession) return;

    const action: UserAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metadata
    };

    this.currentSession.userActions.push(action);
    
    // Add breadcrumb
    addBreadcrumb('info', 'user_action', `User action: ${type}`, metadata);

    this.updateActivity();
  }

  // Public methods for session management
  setUserId(userId: string, metadata?: Record<string, unknown>): void {
    if (!this.currentSession) return;

    this.currentSession.userId = userId;
    this.currentSession.metadata = { ...this.currentSession.metadata, ...metadata };

    // Update error tracking tags
    setErrorTags({
      sessionId: this.currentSession.sessionId,
      userId
    });

    addBreadcrumb('info', 'user_action', 'User identified in session', {
      userId,
      sessionId: this.currentSession.sessionId,
      ...metadata
    });

    this.persistSessions();
  }

  logAuthEvent(
    type: AuthEvent['type'], 
    success: boolean, 
    errorMessage?: string, 
    metadata?: Record<string, unknown>
  ): void {
    if (!this.currentSession) return;

    const authEvent: AuthEvent = {
      id: `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      userId: this.currentSession.userId,
      success,
      errorMessage,
      metadata
    };

    this.currentSession.authEvents.push(authEvent);

    addBreadcrumb(
      success ? 'info' : 'error', 
      'user_action', 
      `Auth event: ${type} ${success ? 'success' : 'failed'}`,
      {
        userId: this.currentSession.userId,
        errorMessage,
        ...metadata
      }
    );

    this.persistSessions();
  }

  incrementErrorCount(): void {
    if (!this.currentSession) return;
    
    this.currentSession.errorCount++;
    this.persistSessions();
  }

  endSession(): void {
    if (!this.currentSession) return;

    // Finalize current page view
    if (this.currentPageView) {
      this.finalizePageView();
    }

    // Set session end time
    this.currentSession.endTime = new Date().toISOString();

    // Log session end event
    this.logAuthEvent('session_end', true);

    addBreadcrumb('info', 'info', 'User session ended', {
      sessionId: this.currentSession.sessionId,
      duration: Date.now() - new Date(this.currentSession.startTime).getTime(),
      pageViews: this.currentSession.pageViews.length,
      userActions: this.currentSession.userActions.length,
      errorCount: this.currentSession.errorCount
    });

    // Move to session storage
    this.sessionStorage.push(this.currentSession);
    
    // Keep only recent sessions
    if (this.sessionStorage.length > this.maxSessions) {
      this.sessionStorage = this.sessionStorage.slice(-this.maxSessions);
    }

    this.currentSession = null;
    this.currentPageView = undefined;

    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    this.persistSessions();
  }

  // Data access methods
  getCurrentSession(): UserSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  getSessionHistory(): UserSession[] {
    return [...this.sessionStorage, ...(this.currentSession ? [this.currentSession] : [])];
  }

  getSessionAnalytics(): {
    totalSessions: number;
    averageSessionDuration: number;
    totalPageViews: number;
    totalUserActions: number;
    totalErrors: number;
    mostVisitedPages: Array<{ url: string; count: number }>;
    averageScrollDepth: number;
  } {
    const allSessions = this.getSessionHistory();
    
    if (allSessions.length === 0) {
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        totalPageViews: 0,
        totalUserActions: 0,
        totalErrors: 0,
        mostVisitedPages: [],
        averageScrollDepth: 0
      };
    }

    const sessionDurations = allSessions
      .filter(s => s.endTime)
      .map(s => new Date(s.endTime!).getTime() - new Date(s.startTime).getTime());

    const pageViews = allSessions.flatMap(s => s.pageViews);
    const pageViewCounts = pageViews.reduce((acc, pv) => {
      acc[pv.url] = (acc[pv.url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const scrollDepths = pageViews
      .filter(pv => pv.scrollDepth)
      .map(pv => pv.scrollDepth!);

    return {
      totalSessions: allSessions.length,
      averageSessionDuration: sessionDurations.length > 0 
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
        : 0,
      totalPageViews: pageViews.length,
      totalUserActions: allSessions.reduce((sum, s) => sum + s.userActions.length, 0),
      totalErrors: allSessions.reduce((sum, s) => sum + s.errorCount, 0),
      mostVisitedPages: Object.entries(pageViewCounts)
        .map(([url, count]) => ({ url, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      averageScrollDepth: scrollDepths.length > 0
        ? scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length
        : 0
    };
  }

  // Persistence methods
  private persistSessions(): void {
    try {
      const data = {
        currentSession: this.currentSession,
        sessionStorage: this.sessionStorage
      };
      
      localStorage.setItem('jarvis_sessions', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist sessions:', error);
    }
  }

  private loadPersistedSessions(): void {
    try {
      const stored = localStorage.getItem('jarvis_sessions');
      if (stored) {
        const data = JSON.parse(stored);
        
        if (data.sessionStorage) {
          this.sessionStorage = data.sessionStorage;
        }

        // Check if there's an existing session that should be continued
        if (data.currentSession && !data.currentSession.endTime) {
          const lastActivity = new Date(data.currentSession.lastActivity);
          const now = new Date();
          
          // Continue session if last activity was within timeout period
          if (now.getTime() - lastActivity.getTime() < this.activityTimeout) {
            this.currentSession = data.currentSession;
            this.updateActivity(); // Update activity and restart timer
            return;
          } else {
            // Session timed out, move to storage
            data.currentSession.endTime = lastActivity.toISOString();
            this.sessionStorage.push(data.currentSession);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted sessions:', error);
    }
  }

  clearSessions(): void {
    this.endSession();
    this.sessionStorage = [];
    localStorage.removeItem('jarvis_sessions');
  }
}

// Singleton instance
export const sessionTracker = new SessionTracker();

// Utility functions
export const setSessionUser = (userId: string, metadata?: Record<string, unknown>) =>
  sessionTracker.setUserId(userId, metadata);

export const logSessionAuthEvent = (
  type: AuthEvent['type'], 
  success: boolean, 
  errorMessage?: string, 
  metadata?: Record<string, unknown>
) => sessionTracker.logAuthEvent(type, success, errorMessage, metadata);

export const incrementSessionErrors = () => sessionTracker.incrementErrorCount();

export const getCurrentSession = () => sessionTracker.getCurrentSession();

export const getSessionHistory = () => sessionTracker.getSessionHistory();

export const getSessionAnalytics = () => sessionTracker.getSessionAnalytics();

export const endCurrentSession = () => sessionTracker.endSession();

export const clearAllSessions = () => sessionTracker.clearSessions();