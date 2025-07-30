/**
 * Comprehensive Application Performance Monitoring (APM) System
 * Provides real-time monitoring, alerting, and analytics capabilities
 */

import { captureError, captureWarning, captureInfo, addBreadcrumb } from './errorTracking';

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

  constructor(name: string, operation: string) => {
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

// Real-time alerting configuration
export interface AlertRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    threshold: number;
    timeWindow: number; // minutes
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // minutes
  lastTriggered?: number;
}

export interface AlertNotification {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  metadata: Record<string, unknown>;
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
  private alertRules: AlertRule[] = [];
  private notifications: AlertNotification[] = [];
  private errorRateThreshold = 10; // errors per minute
  private performanceThreshold = 3000; // 3 seconds

  constructor() => {
    this.initialize();
    this.setupDefaultAlertRules();
    this.startRealTimeMonitoring();
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
    } catch (error) => {
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
    } catch (error) => {
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
    } catch (error) => {
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
    } catch (error) => {
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
    } catch (error) => {
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
    const isSuccess = status >= 200 && status < 300;
    const isError = status >= 400;
    
    // Add breadcrumb for API call
    addBreadcrumb(
      isError ? 'error' : 'info', 
      'http', 
      `API ${isSuccess ? 'success' : 'error'}: ${status} ${endpoint}`,
      {
        endpoint,
        duration,
        status,
        ...metadata
      }
    );
    
    this.trackCustomMetric('api.response_time', duration, {
      endpoint,
      status,
      success: isSuccess,
      ...metadata,
    });

    // Track API errors with enhanced context
    if (isError) {
      const errorLevel = status >= 500 ? 'error' : 'warning';
      const errorMessage = `API Error: ${status} ${endpoint}`;
      
      this.captureMessage(errorMessage, errorLevel, {
        endpoint,
        status,
        duration,
        apiError: true,
        ...metadata,
      });
      
      // Send real-time alert for server errors
      if (status >= 500) {
        this.sendToExternalAPM('api_server_error', {
          endpoint,
          status,
          duration,
          message: errorMessage,
          ...metadata
        });
      }
    }
    
    // Track slow API responses
    const slowThreshold = 5000; // 5 seconds
    if (duration > slowThreshold) {
      this.captureMessage(
        `Slow API Response: ${endpoint} took ${duration}ms`,
        'warning',
        {
          endpoint,
          duration,
          status,
          slowResponse: true,
          ...metadata
        }
      );
    }
  }

  trackUserInteraction(
    action: string,
    metadata?: Record<string, unknown>
  ): void {
    // Add breadcrumb for user interaction
    addBreadcrumb('info', 'user_action', `User interaction: ${action}`, {
      action,
      ...metadata
    });
    
    this.trackBusinessEvent('user.interaction', {
      action,
      timestamp: Date.now(),
      url: window.location.href,
      ...metadata,
    });
    
    // Track interaction patterns for UX insights
    this.trackCustomMetric('user.interaction_count', 1, {
      action,
      component: metadata?.component,
      ...metadata
    });
  }

  captureException(error: Error, context?: Record<string, unknown>): void {
    // Add breadcrumb for the exception
    addBreadcrumb('error', 'error', `Exception captured: ${error.message}`, {
      errorName: error.name,
      stack: error.stack,
      ...context
    });
    
    captureError(error, {
      source: 'apm',
      ...context,
    });

    this.trackCustomMetric('error.count', 1, {
      type: error.name,
      message: error.message,
      ...context,
    });
    
    // Send critical errors immediately to external services
    if (this.isCriticalError(error, context)) {
      this.sendCriticalErrorAlert(error, context);
    }
  }
  
  private isCriticalError(error: Error, context?: Record<string, unknown>): boolean {
    const criticalErrorTypes = ['TypeError', 'ReferenceError', 'SyntaxError'];
    const criticalContexts = ['auth', 'payment', 'data_loss'];
    
    // Check error type
    if (criticalErrorTypes.includes(error.name)) {
      return true;
    }
    
    // Check context indicators
    if (context) {
      if (context.critical === true) return true;
      if (criticalContexts.some(ctx => JSON.stringify(context).includes(ctx))) {
        return true;
      }
    }
    
    // Check error message patterns
    const criticalPatterns = ['network error', 'failed to fetch', 'authentication failed'];
    return criticalPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }
  
  private async sendCriticalErrorAlert(error: Error, context?: Record<string, unknown>): Promise<void> {
    const criticalData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      user: this.currentUser,
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity: 'critical'
    };
    
    // Send immediately to external monitoring
    await this.sendToExternalAPM('critical_error', criticalData);
    
    // Track as high-priority metric
    this.trackCustomMetric('critical_error.count', 1, {
      errorName: error.name,
      component: context?.component,
      ...context
    });
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: Record<string, unknown>
  ): void {
    switch (level) => {
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
        } catch (error) => {
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

  // Enhanced real-time error reporting
  private async sendToExternalAPM(type: string, data: unknown): Promise<void> {
    try {
      // Send to external monitoring services
      const promises = [];
      
      // DataDog integration
      if (window.DD_RUM && typeof window.DD_RUM.addAction === 'function') {
        promises.push(this.sendToDatadog(type, data));
      }

      // Sentry integration
      if ((window as unknown as { __SENTRY__?: unknown }).__SENTRY__) {
        promises.push(this.sendToSentry(type, data));
      }
      
      // LogRocket integration
      if ((window as unknown as { __LOGROCKET__?: unknown }).__LOGROCKET__) {
        promises.push(this.sendToLogRocket(type, data));
      }

      // Custom webhook integration
      promises.push(this.sendToCustomEndpoint(type, data));
      
      // Send to all services concurrently
      await Promise.allSettled(promises);
      
    } catch (error) => {
      // Log but don't throw - monitoring failures shouldn't break the app
      console.warn('External APM integration failed:', error);
    }
  }
  
  private async sendToDatadog(type: string, data: unknown): Promise<void> {
    try {
      if (window.DD_RUM) {
        if (type === 'error' || type === 'critical_error') {
          window.DD_RUM.addError((data as { message?: string }).message || 'Unknown error', data);
        } else {
          window.DD_RUM.addAction(type, data);
        }
      }
    } catch (error) => {
      console.warn('DataDog integration failed:', error);
    }
  }
  
  private async sendToSentry(type: string, data: unknown): Promise<void> {
    try {
      const Sentry = (window as unknown as { __SENTRY__?: unknown }).__SENTRY__;
      if (Sentry) {
        if (type === 'error' || type === 'critical_error') {
          Sentry.captureException(new Error((data as { message?: string }).message || 'Unknown error'), {
            extra: data,
            tags: { source: 'apm_monitoring' }
          });
        } else {
          Sentry.addBreadcrumb({
            category: 'monitoring',
            message: `${type}: ${(data as { name?: string; type?: string }).name || (data as { name?: string; type?: string }).type}`,
            data: data,
            level: this.getSentryLevel(type),
          });
        }
      }
    } catch (error) => {
      console.warn('Sentry integration failed:', error);
    }
  }
  
  private async sendToLogRocket(type: string, data: unknown): Promise<void> {
    try {
      const LogRocket = (window as any).__LOGROCKET__;
      if (LogRocket) {
        if (type === 'error' || type === 'critical_error') {
          LogRocket.captureException(new Error((data as any).message || 'Unknown error'), {
            extra: data,
            tags: { source: 'apm_monitoring' }
          });
        } else {
          LogRocket.track(type, data);
        }
      }
    } catch (error) => {
      console.warn('LogRocket integration failed:', error);
    }
  }
  
  private getSentryLevel(type: string): 'error' | 'warning' | 'info' | 'debug' {
    if (type.includes('error')) return 'error';
    if (type.includes('warning')) return 'warning';
    if (type.includes('debug')) return 'debug';
    return 'info';
  }

  private async sendToCustomEndpoint(type: string, data: unknown): Promise<void> {
    const webhookUrl = import.meta.env.VITE_MONITORING_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      const payload = {
        type,
        data,
        user: this.currentUser,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        severity: this.determineSeverity(type, data),
        environment: import.meta.env.MODE || 'development',
        release: import.meta.env.VITE_APP_VERSION || 'unknown'
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': import.meta.env.VITE_MONITORING_WEBHOOK_KEY ? 
            `Bearer ${import.meta.env.VITE_MONITORING_WEBHOOK_KEY}` : '',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.warn(`Webhook failed with status: ${response.status}`);
      }
    } catch (error) => {
      console.warn('Custom webhook integration failed:', error);
    }
  }
  
  private determineSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
    if (type.includes('critical') || type.includes('fatal')) return 'critical';
    if (type.includes('error')) return 'high';
    if (type.includes('warning')) return 'medium';
    return 'low';
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

  // Real-time monitoring and alerting methods
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: {
          metric: 'error.count',
          operator: '>',
          threshold: this.errorRateThreshold,
          timeWindow: 1
        },
        severity: 'high',
        enabled: true,
        cooldown: 5
      },
      {
        id: 'critical_error',
        name: 'Critical Error Detected',
        condition: {
          metric: 'critical_error.count',
          operator: '>',
          threshold: 0,
          timeWindow: 1
        },
        severity: 'critical',
        enabled: true,
        cooldown: 1
      },
      {
        id: 'slow_api_response',
        name: 'Slow API Response',
        condition: {
          metric: 'api.response_time',
          operator: '>',
          threshold: this.performanceThreshold,
          timeWindow: 1
        },
        severity: 'medium',
        enabled: true,
        cooldown: 10
      }
    ];
  }

  private startRealTimeMonitoring(): void {
    // Check alert rules every 30 seconds
    setInterval(() => {
      this.checkAlertRules();
    }, 30000);

    // Monitor memory usage every minute
    setInterval(() => {
      this.trackMemoryUsage();
    }, 60000);

    // Clean up old data every 5 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, 300000);
  }

  private checkAlertRules(): void {
    const now = Date.now();

    for (const rule of this.alertRules) => {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered && (now - rule.lastTriggered) < (rule.cooldown * 60 * 1000)) {
        continue;
      }

      // Check condition
      if (this.evaluateAlertCondition(rule)) {
        this.triggerAlert(rule);
        rule.lastTriggered = now;
      }
    }
  }

  private evaluateAlertCondition(rule: AlertRule): boolean {
    const { metric, operator, threshold, timeWindow } = rule.condition;
    const timeStart = Date.now() - (timeWindow * 60 * 1000);

    // Get relevant metrics within time window
    const relevantMetrics = this.metrics.filter(m => 
      m.name === metric && m.timestamp >= timeStart
    );

    if (relevantMetrics.length === 0) return false;

    // Calculate aggregate value based on metric type
    let value: number;
    if (metric.includes('count')) {
      value = relevantMetrics.reduce((sum, m) => sum + m.value, 0);
    } else if (metric.includes('time') || metric.includes('usage')) {
      value = relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;
    } else {
      value = Math.max(...relevantMetrics.map(m => m.value));
    }

    // Evaluate condition
    switch (operator) => {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '=':
        return Math.abs(value - threshold) < 0.01;
      default:
        return false;
    }
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const notification: AlertNotification = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      severity: rule.severity,
      message: `Alert: ${rule.name} - Threshold exceeded`,
      timestamp: Date.now(),
      acknowledged: false,
      metadata: {
        ruleName: rule.name,
        condition: rule.condition,
        user: this.currentUser,
        url: window.location.href
      }
    };

    this.notifications.push(notification);

    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(-100);
    }

    // Send to external monitoring
    await this.sendToExternalAPM('alert_triggered', {
      alert: notification,
      rule: rule,
      severity: rule.severity
    });

    // Add breadcrumb
    addBreadcrumb('error', 'error', `Alert triggered: ${rule.name}`, {
      ruleId: rule.id,
      severity: rule.severity,
      condition: rule.condition
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn(`🚨 Alert Triggered: ${rule.name}`, notification);
    }
  }

  private trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      this.trackCustomMetric('performance.memory_usage', memoryUsage, {
        usedHeapSize: memory.usedJSHeapSize,
        totalHeapSize: memory.totalJSHeapSize,
        heapSizeLimit: memory.jsHeapSizeLimit
      });
    }
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    // Clean old metrics
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    
    // Clean old events
    this.events = this.events.filter(e => e.timestamp > cutoffTime);
    
    // Clean old notifications
    this.notifications = this.notifications.filter(n => n.timestamp > cutoffTime);
  }

  // Public methods for alert management
  getActiveAlerts(): AlertNotification[] {
    return this.notifications.filter(n => !n.acknowledged);
  }

  getAllAlerts(): AlertNotification[] {
    return [...this.notifications];
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.notifications.find(n => n.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex(r => r.id === ruleId);
    if (ruleIndex >= 0) {
      this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  removeAlertRule(ruleId: string): boolean {
    const initialLength = this.alertRules.length;
    this.alertRules = this.alertRules.filter(r => r.id !== ruleId);
    return this.alertRules.length < initialLength;
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

// Real-time alerting utility functions
export const getActiveAlerts = () => monitoringService.getActiveAlerts();
export const getAllAlerts = () => monitoringService.getAllAlerts();
export const acknowledgeAlert = (alertId: string) => monitoringService.acknowledgeAlert(alertId);
export const getAlertRules = () => monitoringService.getAlertRules();
export const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>) =>
  monitoringService.updateAlertRule(ruleId, updates);
export const addAlertRule = (rule: AlertRule) => monitoringService.addAlertRule(rule);
export const removeAlertRule = (ruleId: string) => monitoringService.removeAlertRule(ruleId);

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
    } catch (error) => {
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

// Bug report integration
export const trackBugReportEvent = (event: string, data: Record<string, unknown>) => {
  monitoringService.trackBusinessEvent(event, data);
};

export const trackBugReportSubmission = (bugData: {
  bugType: string;
  severity: string;
  hasAttachments: boolean;
  processingTime: number;
}) {
  monitoringService.trackBusinessEvent('bug_report_submitted', {
    bug_type: bugData.bugType,
    severity: bugData.severity,
    has_attachments: bugData.hasAttachments,
    processing_time_ms: bugData.processingTime
  });

  // Track as custom metric
  monitoringService.trackCustomMetric('bug_report_submission', 1, {
    type: bugData.bugType,
    severity: bugData.severity
  });
};

export const trackBugReportError = (error: string, context: Record<string, unknown>): void => {
  monitoringService.trackBusinessEvent('bug_report_error', {
    error,
    context
  });
};

export const trackBugReportValidationError = (field: string, error: string): void => {
  monitoringService.trackBusinessEvent('bug_report_validation_error', {
    field,
    error
  });
};

export const trackBugReportFileUpload = (fileName: string, fileSize: number, success: boolean): void => {
  monitoringService.trackBusinessEvent('bug_report_file_upload', {
    file_name: fileName,
    file_size: fileSize,
    success
  });
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
