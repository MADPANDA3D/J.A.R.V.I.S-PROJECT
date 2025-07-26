/**
 * Comprehensive Application Performance Monitoring (APM) System
 * Provides real-time monitoring, alerting, and analytics capabilities
 */

import { captureError, captureWarning, captureInfo } from './errorTracking';

// APM Service Interface
export interface APMService {
  // Performance monitoring
  trackPageLoad(
    url: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void;
  trackAPIResponse(
    endpoint: string,
    duration: number,
    status: number,
    metadata?: Record<string, unknown>
  ): void;
  trackUserInteraction(
    action: string,
    metadata?: Record<string, unknown>
  ): void;

  // Error tracking
  captureException(error: Error, context?: Record<string, unknown>): void;
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: Record<string, unknown>
  ): void;

  // Custom metrics
  trackCustomMetric(
    name: string,
    value: number,
    tags?: Record<string, unknown>
  ): void;
  trackBusinessEvent(event: string, properties?: Record<string, unknown>): void;

  // User tracking
  setUser(userId: string, properties?: Record<string, unknown>): void;

  // Transaction tracking
  startTransaction(name: string, operation: string): Transaction;
}

// Transaction interface for performance tracking
export interface Transaction {
  name: string;
  operation: string;
  startTime: number;
  endTime?: number;
  status?: 'ok' | 'error' | 'cancelled';
  metadata?: Record<string, unknown>;

  setStatus(status: 'ok' | 'error' | 'cancelled'): void;
  setMetadata(metadata: Record<string, unknown>): void;
  finish(): void;
}

// Performance metrics interface
export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  connectionType?: string;
  networkRTT?: number;
  networkDownlink?: number;
}

// Core Web Vitals interface
export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
}

// Transaction implementation
class TransactionImpl implements Transaction {
  name: string;
  operation: string;
  startTime: number;
  endTime?: number;
  status?: 'ok' | 'error' | 'cancelled';
  metadata?: Record<string, unknown>;

  constructor(name: string, operation: string) {
    this.name = name;
    this.operation = operation;
    this.startTime = performance.now();
  }

  setStatus(status: 'ok' | 'error' | 'cancelled'): void {
    this.status = status;
  }

  setMetadata(metadata: Record<string, unknown>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  finish(): void {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;

    // Track transaction completion
    monitoringService.trackCustomMetric('transaction.duration', duration, {
      name: this.name,
      operation: this.operation,
      status: this.status || 'ok',
      ...this.metadata,
    });
  }
}

// Comprehensive APM Service Implementation
class MonitoringService implements APMService {
  private isInitialized = false;
  private currentUser?: { id: string; properties?: Record<string, unknown> };
  private metrics: Array<{
    timestamp: number;
    type: string;
    name: string;
    value: number;
    tags: Record<string, unknown>;
  }> = [];
  private events: Array<{
    timestamp: number;
    type: string;
    name: string;
    properties: Record<string, unknown>;
  }> = [];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // Initialize Core Web Vitals monitoring
      this.initializeCoreWebVitals();

      // Initialize performance monitoring
      this.initializePerformanceMonitoring();

      // Initialize error boundary integration
      this.initializeErrorTracking();

      // Initialize resource monitoring
      this.initializeResourceMonitoring();

      this.isInitialized = true;
      this.trackBusinessEvent('monitoring.initialized', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    } catch {
      captureError(
        error instanceof Error
          ? error
          : new Error('Failed to initialize monitoring'),
        {
          service: 'monitoring',
          method: 'initialize',
        }
      );
    }
  }

  private initializeCoreWebVitals(): void {
    try {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver(entryList => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackCustomMetric('core_web_vitals.lcp', lastEntry.startTime, {
            element: lastEntry.element?.tagName,
            url: lastEntry.url,
          });
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver(entryList => {
          entryList.getEntries().forEach(entry => {
            this.trackCustomMetric(
              'core_web_vitals.fid',
              entry.processingStart - entry.startTime,
              {
                eventType: entry.name,
              }
            );
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(entryList => {
          entryList.getEntries().forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value || 0;
            }
          });
          this.trackCustomMetric('core_web_vitals.cls', clsValue);
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    } catch {
      captureWarning('Failed to initialize Core Web Vitals monitoring', {
        error,
      });
    }
  }

  private initializePerformanceMonitoring(): void {
    try {
      // Monitor navigation timing
      if ('performance' in window && performance.timing) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const timing = performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            const domContentLoaded =
              timing.domContentLoadedEventEnd - timing.navigationStart;
            const ttfb = timing.responseStart - timing.navigationStart;

            this.trackCustomMetric('performance.page_load_time', pageLoadTime);
            this.trackCustomMetric(
              'performance.dom_content_loaded',
              domContentLoaded
            );
            this.trackCustomMetric('performance.ttfb', ttfb);

            // Track network information if available
            if ('connection' in navigator) {
              const connection = (navigator as unknown as { connection: { rtt: number; effectiveType: string; downlink: number } }).connection;
              this.trackCustomMetric('network.rtt', connection.rtt || 0, {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
              });
            }
          }, 0);
        });
      }

      // Monitor paint timing
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver(entryList => {
          entryList.getEntries().forEach(entry => {
            this.trackCustomMetric(
              `performance.${entry.name}`,
              entry.startTime
            );
          });
        });

        paintObserver.observe({ entryTypes: ['paint'] });
      }
    } catch {
      captureWarning('Failed to initialize performance monitoring', { error });
    }
  }

  private initializeErrorTracking(): void {
    try {
      // Enhanced global error handling
      const originalConsoleError = console.error;
      console.error = (...args) => {
        this.captureMessage(`Console Error: ${args.join(' ')}`, 'error', {
          source: 'console',
          args: args.map(arg =>
            typeof arg === 'string' ? arg : JSON.stringify(arg)
          ),
        });
        originalConsoleError.apply(console, args);
      };

      // Track uncaught promise rejections
      window.addEventListener('unhandledrejection', event => {
        this.captureException(
          new Error(`Unhandled Promise Rejection: ${event.reason}`),
          {
            type: 'unhandledrejection',
            reason: event.reason,
            promise: event.promise,
          }
        );
      });
    } catch {
      captureWarning('Failed to initialize error tracking enhancements', {
        error,
      });
    }
  }

  private initializeResourceMonitoring(): void {
    try {
      if ('PerformanceObserver' in window) {
        const resourceObserver = new PerformanceObserver(entryList => {
          entryList.getEntries().forEach((entry: PerformanceResourceTiming) => {
            this.trackCustomMetric('resource.load_time', entry.duration, {
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize || 0,
              cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
            });
          });
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
      }
    } catch {
      captureWarning('Failed to initialize resource monitoring', { error });
    }
  }

  // APM Service Interface Implementation
  trackPageLoad(
    url: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    this.trackCustomMetric('page.load_time', duration, {
      url,
      ...metadata,
    });

    this.trackBusinessEvent('page.loaded', {
      url,
      duration,
      timestamp: Date.now(),
      ...metadata,
    });
  }

  trackAPIResponse(
    endpoint: string,
    duration: number,
    status: number,
    metadata?: Record<string, unknown>
  ): void {
    this.trackCustomMetric('api.response_time', duration, {
      endpoint,
      status,
      success: status >= 200 && status < 300,
      ...metadata,
    });

    // Track API errors
    if (status >= 400) {
      this.captureMessage(
        `API Error: ${status} ${endpoint}`,
        status >= 500 ? 'error' : 'warning',
        {
          endpoint,
          status,
          duration,
          ...metadata,
        }
      );
    }
  }

  trackUserInteraction(
    action: string,
    metadata?: Record<string, unknown>
  ): void {
    this.trackBusinessEvent('user.interaction', {
      action,
      timestamp: Date.now(),
      url: window.location.href,
      ...metadata,
    });
  }

  captureException(error: Error, context?: Record<string, unknown>): void {
    captureError(error, {
      source: 'apm',
      ...context,
    });

    this.trackCustomMetric('error.count', 1, {
      type: error.name,
      message: error.message,
      ...context,
    });
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: Record<string, unknown>
  ): void {
    switch (level) {
      case 'error':
        captureError(message, context);
        break;
      case 'warning':
        captureWarning(message, context);
        break;
      case 'info':
        captureInfo(message, context);
        break;
    }

    this.trackCustomMetric(`message.${level}`, 1, context);
  }

  trackCustomMetric(
    name: string,
    value: number,
    tags?: Record<string, unknown>
  ): void {
    const metric = {
      timestamp: Date.now(),
      type: 'metric',
      name,
      value,
      tags: tags || {},
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Send to external APM service if configured
    this.sendToExternalAPM('metric', metric);
  }

  trackBusinessEvent(
    event: string,
    properties?: Record<string, unknown>
  ): void {
    const eventData = {
      timestamp: Date.now(),
      type: 'event',
      name: event,
      properties: properties || {},
    };

    this.events.push(eventData);

    // Keep only last 500 events in memory
    if (this.events.length > 500) {
      this.events = this.events.slice(-500);
    }

    // Send to external APM service if configured
    this.sendToExternalAPM('event', eventData);
  }

  setUser(userId: string, properties?: Record<string, unknown>): void {
    this.currentUser = { id: userId, properties };

    this.trackBusinessEvent('user.identified', {
      userId,
      ...properties,
    });
  }

  startTransaction(name: string, operation: string): Transaction {
    return new TransactionImpl(name, operation);
  }

  // Utility methods
  getMetrics(filter?: {
    name?: string;
    timeRange?: number;
  }): typeof this.metrics {
    let filtered = this.metrics;

    if (filter?.name) {
      filtered = filtered.filter(m => m.name.includes(filter.name!));
    }

    if (filter?.timeRange) {
      const cutoff = Date.now() - filter.timeRange;
      filtered = filtered.filter(m => m.timestamp >= cutoff);
    }

    return filtered;
  }

  getEvents(filter?: {
    name?: string;
    timeRange?: number;
  }): typeof this.events {
    let filtered = this.events;

    if (filter?.name) {
      filtered = filtered.filter(e => e.name.includes(filter.name!));
    }

    if (filter?.timeRange) {
      const cutoff = Date.now() - filter.timeRange;
      filtered = filtered.filter(e => e.timestamp >= cutoff);
    }

    return filtered;
  }

  getCurrentUser(): typeof this.currentUser {
    return this.currentUser;
  }

  // Core Web Vitals getter
  getCoreWebVitals(): Promise<CoreWebVitals> {
    return new Promise(resolve => {
      const vitals: Partial<CoreWebVitals> = {};

      // Get LCP
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver(entryList => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
            lcpObserver.disconnect();
            checkComplete();
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch {
          vitals.lcp = 0;
        }
      }

      // Get navigation timing for other metrics
      if (performance.timing) {
        vitals.ttfb =
          performance.timing.responseStart - performance.timing.navigationStart;
      }

      // Get paint timing
      if (performance.getEntriesByType) {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(
          entry => entry.name === 'first-contentful-paint'
        );
        if (fcpEntry) {
          vitals.fcp = fcpEntry.startTime;
        }
      }

      const checkComplete = () => {
        if (
          vitals.lcp !== undefined ||
          Date.now() - performance.timing.navigationStart > 5000
        ) {
          resolve({
            lcp: vitals.lcp || 0,
            fid: vitals.fid || 0,
            cls: vitals.cls || 0,
            ttfb: vitals.ttfb || 0,
            fcp: vitals.fcp || 0,
          });
        }
      };

      // Fallback timeout
      setTimeout(checkComplete, 5000);
    });
  }

  // External APM integration
  private sendToExternalAPM(type: string, data: unknown): void {
    try {
      // DataDog integration
      if (window.DD_RUM && typeof window.DD_RUM.addAction === 'function') {
        window.DD_RUM.addAction(type, data);
      }

      // Sentry integration
      if (window.Sentry && typeof window.Sentry.addBreadcrumb === 'function') {
        window.Sentry.addBreadcrumb({
          category: 'monitoring',
          message: `${type}: ${data.name || data.type}`,
          data: data,
          level: 'info',
        });
      }

      // Custom webhook integration
      this.sendToCustomEndpoint(type, data);
    } catch {
      // Silently fail external integrations
    }
  }

  private sendToCustomEndpoint(type: string, data: unknown): void {
    const webhookUrl = import.meta.env.VITE_MONITORING_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          user: this.currentUser,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail webhook calls
      });
    } catch {
      // Silently fail
    }
  }

  // Health check integration
  getMonitoringHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      totalMetrics: number;
      totalEvents: number;
      recentErrors: number;
      avgResponseTime: number;
    };
  } {
    const recentTimeRange = 5 * 60 * 1000; // 5 minutes
    const recentMetrics = this.getMetrics({ timeRange: recentTimeRange });

    const errorMetrics = recentMetrics.filter(m => m.name.includes('error'));
    const responseTimeMetrics = recentMetrics.filter(
      m => m.name.includes('response_time') || m.name.includes('load_time')
    );

    const avgResponseTime =
      responseTimeMetrics.length > 0
        ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) /
          responseTimeMetrics.length
        : 0;

    const status =
      errorMetrics.length > 10
        ? 'unhealthy'
        : errorMetrics.length > 5
          ? 'degraded'
          : 'healthy';

    return {
      status,
      metrics: {
        totalMetrics: this.metrics.length,
        totalEvents: this.events.length,
        recentErrors: errorMetrics.length,
        avgResponseTime,
      },
    };
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();

// Utility functions for easy access
export const trackPageLoad = (
  url: string,
  duration: number,
  metadata?: Record<string, unknown>
) => monitoringService.trackPageLoad(url, duration, metadata);

export const trackAPIResponse = (
  endpoint: string,
  duration: number,
  status: number,
  metadata?: Record<string, unknown>
) => monitoringService.trackAPIResponse(endpoint, duration, status, metadata);

export const trackUserInteraction = (
  action: string,
  metadata?: Record<string, unknown>
) => monitoringService.trackUserInteraction(action, metadata);

export const trackCustomMetric = (
  name: string,
  value: number,
  tags?: Record<string, unknown>
) => monitoringService.trackCustomMetric(name, value, tags);

export const trackBusinessEvent = (
  event: string,
  properties?: Record<string, unknown>
) => monitoringService.trackBusinessEvent(event, properties);

export const setMonitoringUser = (
  userId: string,
  properties?: Record<string, unknown>
) => monitoringService.setUser(userId, properties);

export const startTransaction = (name: string, operation: string) =>
  monitoringService.startTransaction(name, operation);

// React integration helpers
export const withMonitoring = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  name: string,
  operation: string = 'function'
): T => {
  return ((...args: unknown[]) => {
    const transaction = startTransaction(name, operation);
    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result
          .then(value => {
            transaction.setStatus('ok');
            transaction.finish();
            return value;
          })
          .catch(error => {
            transaction.setStatus('error');
            transaction.setMetadata({ error: error.message });
            transaction.finish();
            monitoringService.captureException(error, { function: name });
            throw error;
          });
      } else {
        transaction.setStatus('ok');
        transaction.finish();
        return result;
      }
    } catch {
      transaction.setStatus('error');
      transaction.setMetadata({
        error: error instanceof Error ? error.message : String(error),
      });
      transaction.finish();
      monitoringService.captureException(
        error instanceof Error ? error : new Error(String(error)),
        { function: name }
      );
      throw error;
    }
  }) as T;
};

// Type definitions for window extensions
declare global {
  interface Window {
    DD_RUM?: {
      addAction: (name: string, context: unknown) => void;
    };
    Sentry?: {
      addBreadcrumb: (breadcrumb: unknown) => void;
    };
  }
}
