// Simple error tracking and logging system
// Can be extended with external services like Sentry

export interface ErrorReport {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  userAgent: string;
  url: string;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors = 100; // Keep only last 100 errors in memory

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        'error',
        { type: 'unhandledrejection' }
      );
    });

    // Handle global JavaScript errors
    window.addEventListener('error', event => {
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
    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Add to in-memory storage
    this.errors.push(errorReport);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence
    this.persistError(errorReport);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🔴 Error Tracked [${level.toUpperCase()}]`);
      console.error('Message:', errorReport.message);
      console.error('Context:', errorReport.context);
      if (errorReport.stack) {
        console.error('Stack:', errorReport.stack);
      }
      console.groupEnd();
    }

    return errorReport.id;
  }

  captureMessage(
    message: string,
    level: 'error' | 'warning' | 'info' = 'info',
    context: Record<string, unknown> = {}
  ): string {
    return this.captureError(message, level, context);
  }

  setUser(userId: string) {
    this.errors.forEach(error => {
      if (!error.userId) {
        error.userId = userId;
      }
    });
  }

  getErrors(level?: 'error' | 'warning' | 'info'): ErrorReport[] {
    if (level) {
      return this.errors.filter(error => error.level === level);
    }
    return [...this.errors];
  }

  getRecentErrors(count: number = 10): ErrorReport[] {
    return this.errors.slice(-count);
  }

  clearErrors(): void {
    this.errors = [];
    localStorage.removeItem('jarvis_errors');
  }

  private persistError(error: ErrorReport): void {
    try {
      const stored = localStorage.getItem('jarvis_errors');
      const errors: ErrorReport[] = stored ? JSON.parse(stored) : [];

      errors.push(error);

      // Keep only last 50 errors in localStorage
      const recentErrors = errors.slice(-50);

      localStorage.setItem('jarvis_errors', JSON.stringify(recentErrors));
    } catch (e) {
      // Ignore localStorage errors
      console.warn('Failed to persist error to localStorage:', e);
    }
  }

  loadPersistedErrors(): void {
    try {
      const stored = localStorage.getItem('jarvis_errors');
      if (stored) {
        const errors: ErrorReport[] = JSON.parse(stored);
        this.errors = [...this.errors, ...errors];

        // Remove duplicates and keep only recent ones
        const uniqueErrors = this.errors.filter(
          (error, index, self) =>
            self.findIndex(e => e.id === error.id) === index
        );

        this.errors = uniqueErrors.slice(-this.maxErrors);
      }
    } catch (e) {
      console.warn('Failed to load persisted errors:', e);
    }
  }

  // Method to export errors for external monitoring services
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  // React Error Boundary integration
  captureReactError(
    error: Error,
    errorInfo: { componentStack: string }
  ): string {
    return this.captureError(error, 'error', {
      type: 'react_error',
      componentStack: errorInfo.componentStack,
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
export const setErrorTrackingUser = (userId: string) =>
  errorTracker.setUser(userId);

// React Error Boundary helper
export const captureReactError = (
  error: Error,
  errorInfo: { componentStack: string }
) => errorTracker.captureReactError(error, errorInfo);
