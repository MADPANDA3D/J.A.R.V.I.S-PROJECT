// Simple error tracking and logging system
// Can be extended with external services like Sentry

export interface ErrorReport {
  id: string;
  errorId: string; // Added for bug report compatibility
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  source?: string; // Added for bug report compatibility
  line?: number; // Added for bug report compatibility
  column?: number; // Added for bug report compatibility
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string; // Added for bug report compatibility
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical'; // Added for bug report compatibility
  category: 'api' | 'database' | 'auth' | 'webhook' | 'external' | 'system' | 'javascript' | 'network' | 'resource' | 'security' | 'performance'; // Added for bug report compatibility
  metadata?: Record<string, unknown>; // Added for bug report compatibility
}

// Enhanced error report with additional context
export interface EnhancedErrorReport extends ErrorReport {
  sessionId: string;
  breadcrumbs: ErrorBreadcrumb[];
  tags: Record<string, string>;
  fingerprint: string[];
  release: string;
  environment: string;
  component?: string;
  apiEndpoint?: string;
  retryCount?: number;
}

export interface ErrorBreadcrumb {
  timestamp: string;
  category: 'navigation' | 'user_action' | 'http' | 'error' | 'info';
  message: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, unknown>;
}

export interface APIFailureContext {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  retryAttempt: number;
  requestId?: string;
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
}

export interface AuthErrorContext {
  authEvent: 'sign_in' | 'sign_up' | 'sign_out' | 'token_refresh' | 'password_reset';
  supabaseError: string;
  userId?: string;
  sessionId?: string;
}

export interface UserActionContext {
  actionType: 'chat_message' | 'form_submit' | 'navigation' | 'button_click' | 'file_upload';
  elementId?: string;
  elementText?: string;
  formData?: Record<string, unknown>;
  navigationFrom?: string;
  navigationTo?: string;
}

class ErrorTracker {
  private errors: EnhancedErrorReport[] = [];
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxErrors = 100; // Keep only last 100 errors in memory
  private maxBreadcrumbs = 50; // Keep only last 50 breadcrumbs
  private sessionId: string;
  private userId?: string;
  private currentTags: Record<string, string> = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.addBreadcrumb('info', 'session', 'Error tracking initialized', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.addBreadcrumb('error', 'error', `Unhandled Promise Rejection: ${event.reason}`, {
        reason: event.reason
      });
      
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        'error',
        { 
          type: 'unhandledrejection',
          reason: event.reason
        }
      );
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.addBreadcrumb('error', 'error', `Global JS Error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      this.captureError(new Error(event.message), 'error', {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }

  captureError(
    error: Error | string,
    level: 'error' | 'warning' | 'info' = 'error',
    context: Record<string, unknown> = {}
  ): string {
    const errorReport: EnhancedErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      breadcrumbs: [...this.breadcrumbs],
      tags: { ...this.currentTags },
      fingerprint: this.generateFingerprint(error, context),
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
      environment: import.meta.env.MODE || 'development',
      component: context.component as string,
      apiEndpoint: context.apiEndpoint as string,
      retryCount: context.retryCount as number
    };

    // Add breadcrumb for this error
    this.addBreadcrumb('error', 'error', errorReport.message, {
      errorId: errorReport.id,
      level,
      stack: errorReport.stack
    });

    // Add to in-memory storage
    this.errors.push(errorReport);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence
    this.persistError(errorReport);

    // Increment session error count and send to external monitoring (async import to avoid circular dependency)
    setTimeout(async () => {
      try {
        const { incrementSessionErrors } = await import('./sessionTracking');
        incrementSessionErrors();
        
        const { captureExternalError } = await import('./externalMonitoring');
        captureExternalError(errorReport);
      } catch {
        // External services not available
      }
    }, 0);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🔴 Error Tracked [${level.toUpperCase()}]`);
      console.error('Message:', errorReport.message);
      console.error('Context:', errorReport.context);
      console.error('Session ID:', errorReport.sessionId);
      console.error('Breadcrumbs:', errorReport.breadcrumbs.slice(-5));
      if (errorReport.stack) {
        console.error('Stack:', errorReport.stack);
      }
      console.groupEnd();
    }

    return errorReport.id;
  }

  private generateFingerprint(error: Error | string, context: Record<string, unknown>): string[] {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;
    
    const fingerprint = [message];
    
    if (stack) {
      // Extract the first few lines of stack trace for fingerprinting
      const stackLines = stack.split('\n').slice(0, 3);
      fingerprint.push(...stackLines.map(line => line.trim()));
    }
    
    if (context.component) {
      fingerprint.push(`component:${context.component}`);
    }
    
    if (context.apiEndpoint) {
      fingerprint.push(`endpoint:${context.apiEndpoint}`);
    }
    
    return fingerprint;
  }

  captureMessage(
    message: string,
    level: 'error' | 'warning' | 'info' = 'info',
    context: Record<string, unknown> = {}
  ): string {
    return this.captureError(message, level, context);
  }

  setUser(userId: string, metadata?: Record<string, unknown>) {
    this.userId = userId;
    this.addBreadcrumb('info', 'user_action', 'User identified', {
      userId,
      ...metadata
    });
    
    // Update existing errors with user ID
    this.errors.forEach(error => {
      if (!error.userId) {
        error.userId = userId;
      }
    });
  }

  addBreadcrumb(
    level: 'error' | 'warning' | 'info' | 'debug',
    category: 'navigation' | 'user_action' | 'http' | 'error' | 'info',
    message: string,
    data?: Record<string, unknown>
  ): void {
    const breadcrumb: ErrorBreadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      level,
      data
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the last maxBreadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    // Send breadcrumb to external monitoring (async to not block)
    setTimeout(async () => {
      try {
        const { captureExternalBreadcrumb } = await import('./externalMonitoring');
        captureExternalBreadcrumb(breadcrumb);
      } catch {
        // External monitoring not available
      }
    }, 0);
  }

  setTags(tags: Record<string, string>): void {
    this.currentTags = { ...this.currentTags, ...tags };
  }

  clearTags(): void {
    this.currentTags = {};
  }

  getErrors(level?: 'error' | 'warning' | 'info'): EnhancedErrorReport[] {
    if (level) {
      return this.errors.filter(error => error.level === level);
    }
    return [...this.errors];
  }

  getRecentErrors(count: number = 10): EnhancedErrorReport[] {
    return this.errors.slice(-count);
  }

  getBreadcrumbs(): ErrorBreadcrumb[] {
    return [...this.breadcrumbs];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getCurrentTags(): Record<string, string> {
    return { ...this.currentTags };
  }

  clearErrors(): void {
    this.errors = [];
    this.breadcrumbs = [];
    localStorage.removeItem('jarvis_errors');
    localStorage.removeItem('jarvis_breadcrumbs');
  }

  private persistError(error: EnhancedErrorReport): void {
    try {
      const stored = localStorage.getItem('jarvis_errors');
      const errors: EnhancedErrorReport[] = stored ? JSON.parse(stored) : [];

      errors.push(error);

      // Keep only last 50 errors in localStorage
      const recentErrors = errors.slice(-50);

      localStorage.setItem('jarvis_errors', JSON.stringify(recentErrors));
      
      // Also persist breadcrumbs
      localStorage.setItem('jarvis_breadcrumbs', JSON.stringify(this.breadcrumbs));
    } catch (e) {
      // Ignore localStorage errors
      console.warn('Failed to persist error to localStorage:', e);
    }
  }

  loadPersistedErrors(): void {
    try {
      const stored = localStorage.getItem('jarvis_errors');
      if (stored) {
        const errors: EnhancedErrorReport[] = JSON.parse(stored);
        this.errors = [...this.errors, ...errors];

        // Remove duplicates and keep only recent ones
        const uniqueErrors = this.errors.filter(
          (error, index, self) =>
            self.findIndex(e => e.id === error.id) === index
        );

        this.errors = uniqueErrors.slice(-this.maxErrors);
      }
      
      // Load persisted breadcrumbs
      const storedBreadcrumbs = localStorage.getItem('jarvis_breadcrumbs');
      if (storedBreadcrumbs) {
        const breadcrumbs: ErrorBreadcrumb[] = JSON.parse(storedBreadcrumbs);
        this.breadcrumbs = [...this.breadcrumbs, ...breadcrumbs];
        this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
      }
    } catch (e) {
      console.warn('Failed to load persisted data:', e);
    }
  }

  // Method to export errors for external monitoring services
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  // Bug report integration methods
  getRecentErrorsForBugReport(limit: number = 10): ErrorReport[] {
    return this.errors.slice(-limit).map(error => ({
      id: error.id,
      errorId: error.id, // Use id as errorId for compatibility
      timestamp: error.timestamp,
      level: error.level,
      message: error.message,
      stack: error.stack,
      source: this.extractSourceFromStack(error.stack),
      line: this.extractLineFromStack(error.stack),
      column: this.extractColumnFromStack(error.stack),
      context: error.context,
      userId: error.userId,
      sessionId: error.sessionId,
      userAgent: error.userAgent,
      url: error.url,
      severity: this.mapLevelToSeverity(error.level),
      category: this.mapContextToCategory(error.context),
      metadata: {
        ...error.context,
        tags: error.tags,
        component: error.component,
        apiEndpoint: error.apiEndpoint,
        retryCount: error.retryCount,
        breadcrumbs: error.breadcrumbs.slice(-5) // Include last 5 breadcrumbs
      }
    }));
  }

  addCorrelation(errorId: string, correlation: { type: string; id: string; timestamp: string }): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      if (!error.context) error.context = {};
      if (!error.context.correlations) error.context.correlations = [];
      (error.context.correlations as unknown[]).push(correlation);
    }
  }

  private extractSourceFromStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    const lines = stack.split('\n');
    for (const line of lines) {
      const match = line.match(/at .* \((.+):\d+:\d+\)/);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractLineFromStack(stack?: string): number | undefined {
    if (!stack) return undefined;
    const lines = stack.split('\n');
    for (const line of lines) {
      const match = line.match(/:(\d+):\d+\)?$/);
      if (match) return parseInt(match[1], 10);
    }
    return undefined;
  }

  private extractColumnFromStack(stack?: string): number | undefined {
    if (!stack) return undefined;
    const lines = stack.split('\n');
    for (const line of lines) {
      const match = line.match(/:(\d+)\)?$/);
      if (match) return parseInt(match[1], 10);
    }
    return undefined;
  }

  private mapLevelToSeverity(level: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (level) {
      case 'info': return 'low';
      case 'warning': return 'medium';
      case 'error': return 'high';
      default: return 'medium';
    }
  }

  private mapContextToCategory(context?: Record<string, unknown>): 'api' | 'database' | 'auth' | 'webhook' | 'external' | 'system' | 'javascript' | 'network' | 'resource' | 'security' | 'performance' {
    if (!context) return 'system';
    
    if (context.type === 'api_failure') return 'api';
    if (context.type === 'auth_error') return 'auth';
    if (context.type === 'react_error') return 'javascript';
    if (context.apiEndpoint) return 'api';
    if (context.component) return 'javascript';
    
    return 'system';
  }

  // React Error Boundary integration
  captureReactError(
    error: Error,
    errorInfo: { componentStack: string }
  ): string {
    this.addBreadcrumb('error', 'error', `React Error: ${error.message}`, {
      componentStack: errorInfo.componentStack
    });
    
    return this.captureError(error, 'error', {
      type: 'react_error',
      componentStack: errorInfo.componentStack,
      component: this.extractComponentFromStack(errorInfo.componentStack)
    });
  }

  private extractComponentFromStack(componentStack: string): string {
    const lines = componentStack.split('\n');
    const firstComponent = lines.find(line => line.trim().startsWith('in '));
    if (firstComponent) {
      const match = firstComponent.match(/in (\w+)/);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  }

  // API failure tracking
  captureAPIFailure(
    context: APIFailureContext,
    error?: Error
  ): string {
    this.addBreadcrumb('error', 'http', `API Failure: ${context.method} ${context.endpoint}`, {
      statusCode: context.statusCode,
      responseTime: context.responseTime,
      retryAttempt: context.retryAttempt
    });

    const errorMessage = error?.message || `API request failed: ${context.statusCode} ${context.endpoint}`;
    
    return this.captureError(error || new Error(errorMessage), 'error', {
      type: 'api_failure',
      apiEndpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode,
      responseTime: context.responseTime,
      retryCount: context.retryAttempt,
      requestId: context.requestId,
      payload: context.payload,
      response: context.response
    });
  }

  // Authentication error tracking
  captureAuthError(
    context: AuthErrorContext,
    error?: Error
  ): string {
    this.addBreadcrumb('error', 'user_action', `Auth Error: ${context.authEvent}`, {
      supabaseError: context.supabaseError,
      userId: context.userId
    });

    const errorMessage = error?.message || `Authentication failed: ${context.authEvent}`;
    
    return this.captureError(error || new Error(errorMessage), 'error', {
      type: 'auth_error',
      authEvent: context.authEvent,
      supabaseError: context.supabaseError,
      userId: context.userId,
      sessionId: context.sessionId
    });
  }

  // User action tracking
  trackUserAction(
    context: UserActionContext
  ): void {
    this.addBreadcrumb('info', 'user_action', `User Action: ${context.actionType}`, {
      elementId: context.elementId,
      elementText: context.elementText,
      formData: context.formData,
      navigationFrom: context.navigationFrom,
      navigationTo: context.navigationTo
    });
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// Load persisted errors on initialization
errorTracker.loadPersistedErrors();

// Utility functions for common use cases
export const captureError = (
  error: Error | string,
  context?: Record<string, unknown>
) => errorTracker.captureError(error, 'error', context);

export const captureWarning = (
  message: string,
  context?: Record<string, unknown>
) => errorTracker.captureMessage(message, 'warning', context);

export const captureInfo = (
  message: string,
  context?: Record<string, unknown>
) => errorTracker.captureMessage(message, 'info', context);

// Authentication integration
export const setErrorTrackingUser = (userId: string, metadata?: Record<string, unknown>) =>
  errorTracker.setUser(userId, metadata);

// React Error Boundary helper
export const captureReactError = (
  error: Error,
  errorInfo: { componentStack: string }
) => errorTracker.captureReactError(error, errorInfo);

// API failure tracking
export const captureAPIFailure = (
  context: APIFailureContext,
  error?: Error
) => errorTracker.captureAPIFailure(context, error);

// Authentication error tracking
export const captureAuthError = (
  context: AuthErrorContext,
  error?: Error
) => errorTracker.captureAuthError(context, error);

// User action tracking
export const trackUserAction = (
  context: UserActionContext
) => errorTracker.trackUserAction(context);

// Breadcrumb management
export const addBreadcrumb = (
  level: 'error' | 'warning' | 'info' | 'debug',
  category: 'navigation' | 'user_action' | 'http' | 'error' | 'info',
  message: string,
  data?: Record<string, unknown>
) => errorTracker.addBreadcrumb(level, category, message, data);

// Tags management
export const setErrorTags = (tags: Record<string, string>) => errorTracker.setTags(tags);
export const clearErrorTags = () => errorTracker.clearTags();

// Data access
export const getBreadcrumbs = () => errorTracker.getBreadcrumbs();
export const getSessionId = () => errorTracker.getSessionId();
export const getCurrentTags = () => errorTracker.getCurrentTags();
