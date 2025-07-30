/**
 * External Monitoring Service Integration
 * Provides integration with Sentry, LogRocket, and other monitoring services
 */

import { EnhancedErrorReport, ErrorBreadcrumb } from './errorTracking';
import { UserSession } from './sessionTracking';

// External monitoring service types
export type ExternalMonitoringService = 'sentry' | 'logrocket' | 'datadog' | 'custom';

export interface ExternalMonitoringConfig {
  service: ExternalMonitoringService;
  enabled: boolean;
  dsn?: string;
  apiKey?: string;
  projectId?: string;
  environment: string;
  release?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
  customEndpoint?: string;
}

export interface SentryConfig extends ExternalMonitoringConfig {
  service: 'sentry';
  dsn: string;
  beforeSend?: (event: any) => any;
  beforeBreadcrumb?: (breadcrumb: any) => any;
  integrations?: unknown[];
}

export interface LogRocketConfig extends ExternalMonitoringConfig {
  service: 'logrocket';
  appId: string;
  shouldCaptureRequest?: (request: any) => boolean;
  shouldCaptureResponse?: (response: any) => boolean;
}

export interface DatadogConfig extends ExternalMonitoringConfig {
  service: 'datadog';
  clientToken: string;
  applicationId: string;
  site?: string;
  version?: string;
  env?: string;
}

export interface CustomConfig extends ExternalMonitoringConfig {
  service: 'custom';
  customEndpoint: string;
  headers?: Record<string, string>;
  formatPayload?: (data: any) => any;
}

// External monitoring integration class
class ExternalMonitoringService {
  private configs: Map<ExternalMonitoringService, ExternalMonitoringConfig> = new Map();
  private initialized: Map<ExternalMonitoringService, boolean> = new Map();
  private currentUser?: { id: string; email?: string; metadata?: Record<string, unknown> };

  constructor() {
    // Load configuration from environment variables
    this.loadConfiguration();
    
    // Initialize enabled services
    this.initializeServices();
  }

  private loadConfiguration(): void {
    // Sentry configuration
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    if (sentryDsn) {
      this.configs.set('sentry', {
        service: 'sentry',
        enabled: true,
        dsn: sentryDsn,
        environment: import.meta.env.MODE || 'development',
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
        sampleRate: parseFloat(import.meta.env.VITE_SENTRY_SAMPLE_RATE || '1.0'),
        tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1')
      } as SentryConfig);
    }

    // LogRocket configuration
    const logRocketAppId = import.meta.env.VITE_LOGROCKET_APP_ID;
    if (logRocketAppId) {
      this.configs.set('logrocket', {
        service: 'logrocket',
        enabled: true,
        projectId: logRocketAppId,
        environment: import.meta.env.MODE || 'development'
      } as LogRocketConfig);
    }

    // DataDog configuration
    const datadogClientToken = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
    const datadogApplicationId = import.meta.env.VITE_DATADOG_APPLICATION_ID;
    if (datadogClientToken && datadogApplicationId) {
      this.configs.set('datadog', {
        service: 'datadog',
        enabled: true,
        apiKey: datadogClientToken,
        projectId: datadogApplicationId,
        environment: import.meta.env.MODE || 'development',
        customEndpoint: import.meta.env.VITE_DATADOG_SITE || 'datadoghq.com'
      } as DatadogConfig);
    }

    // Custom webhook configuration
    const customEndpoint = import.meta.env.VITE_MONITORING_WEBHOOK_URL;
    if (customEndpoint) {
      this.configs.set('custom', {
        service: 'custom',
        enabled: true,
        customEndpoint,
        environment: import.meta.env.MODE || 'development',
        apiKey: import.meta.env.VITE_MONITORING_WEBHOOK_KEY
      } as CustomConfig);
    }
  }

  private async initializeServices(): Promise<void> {
    for (const [service, config] of this.configs) {
      if (config.enabled) {
        try {
          await this.initializeService(service, config);
          this.initialized.set(service, true);
          console.log(`✅ External monitoring service initialized: ${service}`);
        } catch (error) {
          console.warn(`⚠️ Failed to initialize monitoring service ${service}:`, error);
          this.initialized.set(service, false);
        }
      }
    }
  }

  private async initializeService(service: ExternalMonitoringService, config: ExternalMonitoringConfig): Promise<void> {
    switch (service) {
      case 'sentry':
        await this.initializeSentry(config as SentryConfig);
        break;
      case 'logrocket':
        await this.initializeLogRocket(config as LogRocketConfig);
        break;
      case 'datadog':
        await this.initializeDatadog(config as DatadogConfig);
        break;
      case 'custom':
        await this.initializeCustom(config as CustomConfig);
        break;
    }
  }

  private async initializeSentry(config: SentryConfig): Promise<void> {
    try {
      // Dynamically import Sentry to avoid bundle size impact if not used
      const Sentry = await import('@sentry/react');
      
      const integrations = [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ];

      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        sampleRate: config.sampleRate || 1.0,
        tracesSampleRate: config.tracesSampleRate || 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        integrations,
        beforeSend: (event) {
          // Apply custom data sanitization
          return this.sanitizeSentryEvent(event);
        },
        beforeBreadcrumb: (breadcrumb) {
          // Filter sensitive breadcrumbs
          return this.sanitizeSentryBreadcrumb(breadcrumb);
        }
      });

      // Set global context
      Sentry.setContext('app', {
        name: 'Jarvis Chat',
        version: config.release,
        environment: config.environment
      });

      // Store Sentry reference for later use
      (window as any).__SENTRY__ = Sentry;
    } catch (error) {
      console.warn('Sentry initialization failed:', error);
      throw error;
    }
  }

  private async initializeLogRocket(config: LogRocketConfig): Promise<void> {
    try {
      const LogRocket = await import('logrocket');
      
      LogRocket.init(config.projectId!, {
        shouldCaptureRequest: (request) {
          // Don't capture authentication requests
          return !request.url.includes('/auth/');
        },
        shouldCaptureResponse: (response) {
          // Capture all responses except sensitive ones
          return !response.url.includes('/auth/');
        }
      });

      // Store LogRocket reference
      (window as any).__LOGROCKET__ = LogRocket;
    } catch (error) {
      console.warn('LogRocket initialization failed:', error);
      throw error;
    }
  }

  private async initializeDatadog(config: DatadogConfig): Promise<void> {
    try {
      const { datadogRum } = await import('@datadog/browser-rum');
      
      datadogRum.init({
        applicationId: config.projectId!,
        clientToken: config.apiKey!,
        site: (config as any).site || 'datadoghq.com',
        service: 'jarvis-chat',
        env: config.environment,
        version: (config as any).version || config.release,
        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input'
      });

      // Store DataDog reference
      (window as any).__DATADOG_RUM__ = datadogRum;
    } catch (error) {
      console.warn('DataDog RUM initialization failed:', error);
      throw error;
    }
  }

  private async initializeCustom(config: CustomConfig): Promise<void> {
    // Custom monitoring service just needs endpoint validation
    if (!config.customEndpoint) {
      throw new Error('Custom monitoring service requires endpoint URL');
    }

    // Test endpoint connectivity
    try {
      const response = await fetch(config.customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
          ...((config as CustomConfig).headers || {})
        },
        body: JSON.stringify({
          type: 'health_check',
          timestamp: new Date().toISOString(),
          environment: config.environment
        })
      });

      if (!response.ok) {
        throw new Error(`Custom endpoint health check failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('Custom monitoring endpoint test failed:', error);
      // Don't throw here as the endpoint might not support health checks
    }
  }

  // Public methods for sending data to external services
  async captureError(errorReport: EnhancedErrorReport): Promise<void> {
    const promises = [];

    for (const [service, initialized] of this.initialized) {
      if (initialized) {
        promises.push(this.sendErrorToService(service, errorReport));
      }
    }

    await Promise.allSettled(promises);
  }

  async captureSession(session: UserSession): Promise<void> {
    const promises = [];

    for (const [service, initialized] of this.initialized) {
      if (initialized) {
        promises.push(this.sendSessionToService(service, session));
      }
    }

    await Promise.allSettled(promises);
  }

  async captureBreadcrumb(breadcrumb: ErrorBreadcrumb): Promise<void> {
    const promises = [];

    for (const [service, initialized] of this.initialized) {
      if (initialized) {
        promises.push(this.sendBreadcrumbToService(service, breadcrumb));
      }
    }

    await Promise.allSettled(promises);
  }

  setUser(userId: string, email?: string, metadata?: Record<string, unknown>): void {
    this.currentUser = { id: userId, email, metadata };

    // Update user context in all services
    for (const [service, initialized] of this.initialized) {
      if (initialized) {
        this.setUserInService(service, this.currentUser);
      }
    }
  }

  // Private methods for service-specific implementations
  private async sendErrorToService(service: ExternalMonitoringService, errorReport: EnhancedErrorReport): Promise<void> {
    try {
      switch (service) {
        case 'sentry':
          await this.sendErrorToSentry(errorReport);
          break;
        case 'logrocket':
          await this.sendErrorToLogRocket(errorReport);
          break;
        case 'datadog':
          await this.sendErrorToDatadog(errorReport);
          break;
        case 'custom':
          await this.sendErrorToCustom(errorReport);
          break;
      }
    } catch (error) {
      console.warn(`Failed to send error to ${service}:`, error);
    }
  }

  private async sendErrorToSentry(errorReport: EnhancedErrorReport): Promise<void> {
    const Sentry = (window as any).__SENTRY__;
    if (!Sentry) return;

    // Set user context
    if (this.currentUser) {
      Sentry.setUser({
        id: this.currentUser.id,
        email: this.currentUser.email,
        ...this.currentUser.metadata
      });
    }

    // Set tags
    Sentry.setTags(errorReport.tags);

    // Add fingerprint for grouping
    Sentry.withScope((scope: any) {
      scope.setFingerprint(errorReport.fingerprint);
      
      // Add breadcrumbs
      errorReport.breadcrumbs.forEach(breadcrumb => {
        scope.addBreadcrumb({
          message: breadcrumb.message,
          category: breadcrumb.category,
          level: breadcrumb.level,
          timestamp: new Date(breadcrumb.timestamp).getTime() / 1000,
          data: breadcrumb.data
        });
      });

      // Add context
      scope.setContext('error_details', {
        sessionId: errorReport.sessionId,
        component: errorReport.component,
        apiEndpoint: errorReport.apiEndpoint,
        retryCount: errorReport.retryCount,
        ...errorReport.context
      });

      // Capture the error
      if (errorReport.stack) {
        const error = new Error(errorReport.message);
        error.stack = errorReport.stack;
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(errorReport.message, errorReport.level);
      }
    });
  }

  private async sendErrorToLogRocket(errorReport: EnhancedErrorReport): Promise<void> {
    const LogRocket = (window as any).__LOGROCKET__;
    if (!LogRocket) return;

    // Identify user
    if (this.currentUser) {
      LogRocket.identify(this.currentUser.id, {
        email: this.currentUser.email,
        ...this.currentUser.metadata
      });
    }

    // Log the error
    LogRocket.captureException(new Error(errorReport.message), {
      tags: errorReport.tags,
      extra: {
        sessionId: errorReport.sessionId,
        breadcrumbs: errorReport.breadcrumbs,
        component: errorReport.component,
        ...errorReport.context
      }
    });
  }

  private async sendErrorToDatadog(errorReport: EnhancedErrorReport): Promise<void> {
    const datadogRum = (window as any).__DATADOG_RUM__;
    if (!datadogRum) return;

    // Set user
    if (this.currentUser) {
      datadogRum.setUser({
        id: this.currentUser.id,
        email: this.currentUser.email,
        ...this.currentUser.metadata
      });
    }

    // Add error
    datadogRum.addError(errorReport.message, {
      fingerprint: errorReport.fingerprint.join('-'),
      ...errorReport.context,
      sessionId: errorReport.sessionId,
      component: errorReport.component,
      breadcrumbs: errorReport.breadcrumbs
    });
  }

  private async sendErrorToCustom(errorReport: EnhancedErrorReport): Promise<void> {
    const config = this.configs.get('custom') as CustomConfig;
    if (!config) return;

    const payload = config.formatPayload ? 
      config.formatPayload(errorReport) : 
      {
        type: 'error',
        data: errorReport,
        user: this.currentUser,
        timestamp: new Date().toISOString()
      };

    await fetch(config.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        ...config.headers
      },
      body: JSON.stringify(payload)
    });
  }

  private async sendSessionToService(service: ExternalMonitoringService, session: UserSession): Promise<void> {
    try {
      switch (service) {
        case 'custom':
          await this.sendSessionToCustom(session);
          break;
        // Other services handle sessions automatically through their SDKs
      }
    } catch (error) {
      console.warn(`Failed to send session to ${service}:`, error);
    }
  }

  private async sendSessionToCustom(session: UserSession): Promise<void> {
    const config = this.configs.get('custom') as CustomConfig;
    if (!config) return;

    const payload = config.formatPayload ? 
      config.formatPayload(session) : 
      {
        type: 'session',
        data: session,
        timestamp: new Date().toISOString()
      };

    await fetch(config.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        ...config.headers
      },
      body: JSON.stringify(payload)
    });
  }

  private async sendBreadcrumbToService(service: ExternalMonitoringService, breadcrumb: ErrorBreadcrumb): Promise<void> {
    try {
      switch (service) {
        case 'sentry':
          await this.sendBreadcrumbToSentry(breadcrumb);
          break;
        case 'custom':
          await this.sendBreadcrumbToCustom(breadcrumb);
          break;
        // LogRocket and DataDog handle breadcrumbs automatically
      }
    } catch (error) {
      console.warn(`Failed to send breadcrumb to ${service}:`, error);
    }
  }

  private async sendBreadcrumbToSentry(breadcrumb: ErrorBreadcrumb): Promise<void> {
    const Sentry = (window as any).__SENTRY__;
    if (!Sentry) return;

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level,
      timestamp: new Date(breadcrumb.timestamp).getTime() / 1000,
      data: breadcrumb.data
    });
  }

  private async sendBreadcrumbToCustom(breadcrumb: ErrorBreadcrumb): Promise<void> {
    const config = this.configs.get('custom') as CustomConfig;
    if (!config) return;

    const payload = config.formatPayload ? 
      config.formatPayload(breadcrumb) : 
      {
        type: 'breadcrumb',
        data: breadcrumb,
        user: this.currentUser,
        timestamp: new Date().toISOString()
      };

    await fetch(config.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        ...config.headers
      },
      body: JSON.stringify(payload)
    });
  }

  private setUserInService(service: ExternalMonitoringService, user: { id: string; email?: string; metadata?: Record<string, unknown> }): void {
    try {
      switch (service) {
        case 'sentry': {
          const Sentry = (window as unknown as { __SENTRY__?: unknown }).__SENTRY__;
          if (Sentry) {
            Sentry.setUser({
              id: user.id,
              email: user.email,
              ...user.metadata
            });
          }
          break;
        }
        case 'logrocket': {
          const LogRocket = (window as unknown as { __LOGROCKET__?: unknown }).__LOGROCKET__;
          if (LogRocket) {
            LogRocket.identify(user.id, {
              email: user.email,
              ...user.metadata
            });
          }
          break;
        }
        case 'datadog': {
          const datadogRum = (window as unknown as { __DATADOG_RUM__?: unknown }).__DATADOG_RUM__;
          if (datadogRum) {
            datadogRum.setUser({
              id: user.id,
              email: user.email,
              ...user.metadata
            });
          }
          break;
        }
      }
    } catch (error) {
      console.warn(`Failed to set user in ${service}:`, error);
    }
  }

  // Data sanitization methods
  private sanitizeSentryEvent(event: any): any {
    // Remove sensitive data from error events
    if (event.request?.data) {
      event.request.data = this.sanitizeObject(event.request.data);
    }

    if (event.extra) {
      event.extra = this.sanitizeObject(event.extra);
    }

    return event;
  }

  private sanitizeSentryBreadcrumb(breadcrumb: any): any {
    // Remove sensitive data from breadcrumbs
    if (breadcrumb.data) {
      breadcrumb.data = this.sanitizeObject(breadcrumb.data);
    }

    return breadcrumb;
  }

  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'auth', 'credit_card', 'ssn'];
    const sanitized = { ...obj };

    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    });

    return sanitized;
  }

  // Health check and status methods
  getServiceStatus(): Record<ExternalMonitoringService, boolean> {
    const status: Record<string, boolean> = {};
    
    for (const [service, initialized] of this.initialized) {
      status[service] = initialized;
    }

    return status as Record<ExternalMonitoringService, boolean>;
  }

  getEnabledServices(): ExternalMonitoringService[] {
    return Array.from(this.configs.keys()).filter(service => 
      this.configs.get(service)?.enabled && this.initialized.get(service)
    );
  }

  async testConnectivity(): Promise<Record<ExternalMonitoringService, boolean>> {
    const results: Record<string, boolean> = {};

    for (const service of this.getEnabledServices()) {
      try {
        await this.testServiceConnectivity(service);
        results[service] = true;
      } catch (error) {
        results[service] = false;
        console.warn(`Service ${service} connectivity test failed:`, error);
      }
    }

    return results as Record<ExternalMonitoringService, boolean>;
  }

  private async testServiceConnectivity(service: ExternalMonitoringService): Promise<void> {
    switch (service) {
      case 'custom': {
        const config = this.configs.get('custom') as CustomConfig;
        if (config) {
          const response = await fetch(config.customEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
              ...config.headers
            },
            body: JSON.stringify({
              type: 'connectivity_test',
              timestamp: new Date().toISOString()
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        }
        break;
      }
      // Other services are tested during initialization
      default:
        if (!this.initialized.get(service)) {
          throw new Error('Service not initialized');
        }
    }
  }
}

// Singleton instance
export const externalMonitoring = new ExternalMonitoringService();

// Utility functions
export const captureExternalError = (errorReport: EnhancedErrorReport) =>
  externalMonitoring.captureError(errorReport);

export const captureExternalSession = (session: UserSession) =>
  externalMonitoring.captureSession(session);

export const captureExternalBreadcrumb = (breadcrumb: ErrorBreadcrumb) =>
  externalMonitoring.captureBreadcrumb(breadcrumb);

export const setExternalMonitoringUser = (userId: string, email?: string, metadata?: Record<string, unknown>) =>
  externalMonitoring.setUser(userId, email, metadata);

export const getMonitoringServiceStatus = () => externalMonitoring.getServiceStatus();

export const getEnabledMonitoringServices = () => externalMonitoring.getEnabledServices();

export const testMonitoringConnectivity = () => externalMonitoring.testConnectivity();