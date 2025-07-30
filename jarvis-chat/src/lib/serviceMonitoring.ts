/**
 * Third-Party Service Monitoring System
 * Comprehensive monitoring for N8N webhooks, external APIs, and service dependencies
 */

import { centralizedLogging } from './centralizedLogging';

// Service monitoring interfaces
export interface ServiceCall {
  callId: string;
  correlationId: string;
  serviceName: string;
  serviceType: 'webhook' | 'api' | 'n8n' | 'external' | 'database';
  endpoint: string;
  method: string;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  success: boolean;
  error?: string;
  retryCount: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceHealth {
  serviceId: string;
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  uptime: number; // percentage
  averageResponseTime: number;
  errorRate: number; // percentage
  lastChecked: string;
  endpoints: ServiceEndpointHealth[];
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface ServiceEndpointHealth {
  endpoint: string;
  method: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  lastSuccess: string;
  lastFailure?: string;
  consecutiveFailures: number;
}

export interface ServiceDependency {
  dependencyId: string;
  serviceName: string;
  dependsOn: string;
  required: boolean;
  healthCheck: () => Promise<boolean>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

export interface RetryAttempt {
  attemptId: string;
  correlationId: string;
  serviceName: string;
  endpoint: string;
  attemptNumber: number;
  delay: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

// Service monitoring configuration
export interface ServiceMonitoringConfig {
  enabled: boolean;
  healthCheckInterval: number; // milliseconds
  retryPolicy: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
  };
  alerting: {
    errorRateThreshold: number; // percentage
    responseTimeThreshold: number; // milliseconds
    consecutiveFailureThreshold: number;
  };
}

// Circuit breaker state
interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
}

// Service monitoring implementation
class ServiceMonitoringService {
  private serviceCalls: ServiceCall[] = [];
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private serviceDependencies: Map<string, ServiceDependency> = new Map();
  private retryAttempts: RetryAttempt[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private config: ServiceMonitoringConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private maxStoredCalls = 1000;

  constructor() {
    this.config = this.loadConfiguration();
    this.startHealthCheckTimer();
    this.setupCleanupTimer();
  }

  private loadConfiguration(): ServiceMonitoringConfig {
    return {
      enabled: true,
      healthCheckInterval: parseInt(import.meta.env.VITE_SERVICE_HEALTH_CHECK_INTERVAL || '60000'), // 1 minute
      retryPolicy: {
        maxRetries: parseInt(import.meta.env.VITE_SERVICE_MAX_RETRIES || '3'),
        baseDelay: parseInt(import.meta.env.VITE_SERVICE_BASE_DELAY || '1000'),
        maxDelay: parseInt(import.meta.env.VITE_SERVICE_MAX_DELAY || '30000'),
        backoffMultiplier: parseFloat(import.meta.env.VITE_SERVICE_BACKOFF_MULTIPLIER || '2')
      },
      circuitBreaker: {
        failureThreshold: parseInt(import.meta.env.VITE_CIRCUIT_BREAKER_THRESHOLD || '5'),
        resetTimeout: parseInt(import.meta.env.VITE_CIRCUIT_BREAKER_RESET || '60000'),
        monitoringPeriod: parseInt(import.meta.env.VITE_CIRCUIT_BREAKER_MONITORING || '300000') // 5 minutes
      },
      alerting: {
        errorRateThreshold: parseFloat(import.meta.env.VITE_ERROR_RATE_THRESHOLD || '10'), // 10%
        responseTimeThreshold: parseInt(import.meta.env.VITE_RESPONSE_TIME_THRESHOLD || '5000'), // 5 seconds
        consecutiveFailureThreshold: parseInt(import.meta.env.VITE_CONSECUTIVE_FAILURE_THRESHOLD || '3')
      }
    };
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Register a service for monitoring
  registerService(serviceName: string, serviceType: ServiceCall['serviceType'], endpoints: string[]): void {
    const serviceId = `${serviceType}_${serviceName}`;
    
    const health: ServiceHealth = {
      serviceId,
      serviceName,
      status: 'unknown',
      uptime: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastChecked: new Date().toISOString(),
      endpoints: endpoints.map(endpoint => ({
        endpoint,
        method: 'GET',
        status: 'unknown' as const,
        responseTime: 0,
        errorRate: 0,
        lastSuccess: new Date().toISOString(),
        consecutiveFailures: 0
      }))
    };

    this.serviceHealth.set(serviceId, health);
    
    // Initialize circuit breaker
    this.circuitBreakers.set(serviceId, {
      state: 'closed',
      failureCount: 0
    });

    centralizedLogging.info(
      'service-monitoring',
      'system',
      `Registered service for monitoring: ${serviceName}`,
      { serviceId, serviceType, endpoints }
    );
  }

  // Register service dependency
  registerDependency(dependency: ServiceDependency): void {
    this.serviceDependencies.set(dependency.dependencyId, dependency);
    
    centralizedLogging.info(
      'service-monitoring',
      'system',
      `Registered service dependency: ${dependency.serviceName} -> ${dependency.dependsOn}`,
      { dependencyId: dependency.dependencyId, required: dependency.required }
    );
  }

  // Log service call
  logServiceCall(call: Omit<ServiceCall, 'callId' | 'timestamp'>): string {
    const callId = this.generateCallId();
    
    const serviceCall: ServiceCall = {
      callId,
      timestamp: new Date().toISOString(),
      ...call
    };

    this.serviceCalls.push(serviceCall);
    this.limitStoredCalls();

    // Update service health
    this.updateServiceHealth(serviceCall);

    // Check circuit breaker
    this.updateCircuitBreaker(serviceCall);

    // Log to centralized logging
    centralizedLogging.log(
      serviceCall.success ? 'info' : 'error',
      'service-monitoring',
      'external',
      `Service call: ${serviceCall.serviceName} (${serviceCall.responseTime}ms)`,
      {
        callId,
        serviceName: serviceCall.serviceName,
        endpoint: serviceCall.endpoint,
        method: serviceCall.method,
        statusCode: serviceCall.statusCode,
        responseTime: serviceCall.responseTime,
        success: serviceCall.success,
        retryCount: serviceCall.retryCount,
        error: serviceCall.error
      },
      serviceCall.correlationId
    );

    // Check for alerting conditions
    this.checkAlertingConditions(serviceCall);

    return callId;
  }

  // Make monitored service call with retry logic
  async makeMonitoredCall<T>(
    serviceName: string,
    serviceType: ServiceCall['serviceType'],
    endpoint: string,
    method: string,
    operation: () => Promise<T>,
    options: {
      correlationId?: string;
      timeout?: number;
      retryPolicy?: Partial<ServiceMonitoringConfig['retryPolicy']>;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const correlationId = options.correlationId || this.generateCorrelationId();
    const serviceId = `${serviceType}_${serviceName}`;

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(serviceId)) {
      const error = new Error(`Circuit breaker is open for service: ${serviceName}`);
      
      this.logServiceCall({
        correlationId,
        serviceName,
        serviceType,
        endpoint,
        method,
        statusCode: 503,
        responseTime: 0,
        requestSize: 0,
        responseSize: 0,
        success: false,
        error: error.message,
        retryCount: 0,
        metadata: { ...options.metadata, circuitBreakerOpen: true }
      });

      throw error;
    }

    const retryPolicy = { ...this.config.retryPolicy, ...options.retryPolicy };
    let lastError: Error | undefined;
    let retryCount = 0;

    while (retryCount <= retryPolicy.maxRetries) {
      const startTime = performance.now();
      
      try {
        const result = await Promise.race([
          operation(),
          ...(options.timeout ? [this.timeoutPromise(options.timeout)] : [])
        ]);

        const responseTime = performance.now() - startTime;

        // Log successful call
        this.logServiceCall({
          correlationId,
          serviceName,
          serviceType,
          endpoint,
          method,
          statusCode: 200,
          responseTime,
          requestSize: 0, // Could be calculated if needed
          responseSize: 0, // Could be calculated if needed
          success: true,
          retryCount,
          metadata: options.metadata
        });

        return result;

      } catch (error) {
        const responseTime = performance.now() - startTime;
        lastError = error instanceof Error ? error : new Error(String(error));

        // Log retry attempt
        if (retryCount < retryPolicy.maxRetries) {
          const delay = Math.min(
            retryPolicy.baseDelay * Math.pow(retryPolicy.backoffMultiplier, retryCount),
            retryPolicy.maxDelay
          );

          this.logRetryAttempt({
            correlationId,
            serviceName,
            endpoint,
            attemptNumber: retryCount + 1,
            delay,
            success: false,
            error: lastError.message
          });

          await this.delay(delay);
          retryCount++;
        } else {
          // Final failure
          this.logServiceCall({
            correlationId,
            serviceName,
            serviceType,
            endpoint,
            method,
            statusCode: this.extractStatusCode(lastError),
            responseTime,
            requestSize: 0,
            responseSize: 0,
            success: false,
            error: lastError.message,
            retryCount,
            metadata: options.metadata
          });

          throw lastError;
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private timeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) {
      setTimeout(() => reject(new Error('Operation timeout')), timeout);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractStatusCode(error: Error): number {
    // Try to extract status code from common error patterns
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) return 408;
    if (message.includes('network')) return 0;
    if (message.includes('unauthorized')) return 401;
    if (message.includes('forbidden')) return 403;
    if (message.includes('not found')) return 404;
    return 500;
  }

  private logRetryAttempt(attempt: Omit<RetryAttempt, 'attemptId' | 'timestamp'>): void {
    const retryAttempt: RetryAttempt = {
      attemptId: `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...attempt
    };

    this.retryAttempts.push(retryAttempt);

    centralizedLogging.warn(
      'service-monitoring',
      'external',
      `Retrying service call: ${attempt.serviceName} (attempt ${attempt.attemptNumber})`,
      {
        attemptId: retryAttempt.attemptId,
        correlationId: attempt.correlationId,
        delay: attempt.delay,
        error: attempt.error
      }
    );
  }

  private updateServiceHealth(call: ServiceCall): void {
    const serviceId = `${call.serviceType}_${call.serviceName}`;
    const health = this.serviceHealth.get(serviceId);
    
    if (!health) return;

    // Update endpoint health
    const endpoint = health.endpoints.find(ep => ep.endpoint === call.endpoint && ep.method === call.method);
    if (endpoint) {
      endpoint.responseTime = call.responseTime;
      
      if (call.success) {
        endpoint.lastSuccess = call.timestamp;
        endpoint.consecutiveFailures = 0;
        endpoint.status = call.responseTime > this.config.alerting.responseTimeThreshold ? 'degraded' : 'healthy';
      } else {
        endpoint.lastFailure = call.timestamp;
        endpoint.consecutiveFailures++;
        endpoint.status = 'down';
      }

      // Calculate error rate for endpoint
      const recentCalls = this.getRecentServiceCalls(call.serviceName, call.endpoint, 1); // 1 hour
      const errorCount = recentCalls.filter(c => !c.success).length;
      endpoint.errorRate = recentCalls.length > 0 ? (errorCount / recentCalls.length) * 100 : 0;
    }

    // Update overall service health
    const recentCalls = this.getRecentServiceCalls(call.serviceName, undefined, 1); // 1 hour
    if (recentCalls.length > 0) {
      const successCount = recentCalls.filter(c => c.success).length;
      health.uptime = (successCount / recentCalls.length) * 100;
      health.errorRate = ((recentCalls.length - successCount) / recentCalls.length) * 100;
      health.averageResponseTime = recentCalls.reduce((sum, c) => sum + c.responseTime, 0) / recentCalls.length;
    }

    // Determine overall status
    const healthyEndpoints = health.endpoints.filter(ep => ep.status === 'healthy').length;
    const totalEndpoints = health.endpoints.length;
    
    if (healthyEndpoints === totalEndpoints) {
      health.status = 'healthy';
    } else if (healthyEndpoints > 0) {
      health.status = 'degraded';
    } else {
      health.status = 'down';
    }

    health.lastChecked = call.timestamp;
    this.serviceHealth.set(serviceId, health);
  }

  private updateCircuitBreaker(call: ServiceCall): void {
    const serviceId = `${call.serviceType}_${call.serviceName}`;
    const breaker = this.circuitBreakers.get(serviceId);
    
    if (!breaker) return;

    if (call.success) {
      // Reset failure count on success
      breaker.failureCount = 0;
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        centralizedLogging.info(
          'service-monitoring',
          'system',
          `Circuit breaker closed for service: ${call.serviceName}`,
          { serviceId }
        );
      }
    } else {
      breaker.failureCount++;
      breaker.lastFailureTime = Date.now();

      if (breaker.state === 'closed' && breaker.failureCount >= this.config.circuitBreaker.failureThreshold) {
        breaker.state = 'open';
        breaker.nextAttemptTime = Date.now() + this.config.circuitBreaker.resetTimeout;
        
        centralizedLogging.error(
          'service-monitoring',
          'system',
          `Circuit breaker opened for service: ${call.serviceName}`,
          { serviceId, failureCount: breaker.failureCount }
        );
      }
    }

    this.circuitBreakers.set(serviceId, breaker);
  }

  private isCircuitBreakerOpen(serviceId: string): boolean {
    const breaker = this.circuitBreakers.get(serviceId);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      if (breaker.nextAttemptTime && Date.now() >= breaker.nextAttemptTime) {
        breaker.state = 'half-open';
        this.circuitBreakers.set(serviceId, breaker);
        return false;
      }
      return true;
    }

    return false;
  }

  private checkAlertingConditions(call: ServiceCall): void {
    const health = this.serviceHealth.get(`${call.serviceType}_${call.serviceName}`);
    if (!health) return;

    // Check error rate threshold
    if (health.errorRate > this.config.alerting.errorRateThreshold) {
      centralizedLogging.critical(
        'service-monitoring',
        'system',
        `High error rate detected for service: ${call.serviceName} (${health.errorRate.toFixed(1)}%)`,
        {
          serviceName: call.serviceName,
          errorRate: health.errorRate,
          threshold: this.config.alerting.errorRateThreshold
        }
      );
    }

    // Check response time threshold
    if (call.responseTime > this.config.alerting.responseTimeThreshold) {
      centralizedLogging.warn(
        'service-monitoring',
        'external',
        `Slow response from service: ${call.serviceName} (${call.responseTime}ms)`,
        {
          serviceName: call.serviceName,
          responseTime: call.responseTime,
          threshold: this.config.alerting.responseTimeThreshold,
          endpoint: call.endpoint
        }
      );
    }

    // Check consecutive failures
    const endpoint = health.endpoints.find(ep => ep.endpoint === call.endpoint);
    if (endpoint && endpoint.consecutiveFailures >= this.config.alerting.consecutiveFailureThreshold) {
      centralizedLogging.error(
        'service-monitoring',
        'external',
        `Multiple consecutive failures for service: ${call.serviceName}`,
        {
          serviceName: call.serviceName,
          endpoint: call.endpoint,
          consecutiveFailures: endpoint.consecutiveFailures,
          threshold: this.config.alerting.consecutiveFailureThreshold
        }
      );
    }
  }

  private startHealthCheckTimer(): void {
    if (!this.config.enabled) return;

    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    const dependencies = Array.from(this.serviceDependencies.values());
    
    for (const dependency of dependencies) {
      try {
        const isHealthy = await dependency.healthCheck();
        
        centralizedLogging.debug(
          'service-monitoring',
          'system',
          `Health check for ${dependency.serviceName}: ${isHealthy ? 'PASS' : 'FAIL'}`,
          {
            dependencyId: dependency.dependencyId,
            serviceName: dependency.serviceName,
            healthy: isHealthy,
            required: dependency.required
          }
        );

        if (!isHealthy && dependency.required) {
          centralizedLogging.error(
            'service-monitoring',
            'system',
            `Required service dependency is unhealthy: ${dependency.serviceName}`,
            { dependencyId: dependency.dependencyId }
          );
        }
      } catch (error) {
        centralizedLogging.error(
          'service-monitoring',
          'system',
          `Health check failed for ${dependency.serviceName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { dependencyId: dependency.dependencyId, error }
        );
      }
    }
  }

  private setupCleanupTimer(): void {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    const cutoffISO = new Date(cutoffTime).toISOString();

    this.serviceCalls = this.serviceCalls.filter(call => call.timestamp > cutoffISO);
    this.retryAttempts = this.retryAttempts.filter(attempt => attempt.timestamp > cutoffISO);
  }

  private limitStoredCalls(): void {
    if (this.serviceCalls.length > this.maxStoredCalls) {
      this.serviceCalls = this.serviceCalls.slice(-this.maxStoredCalls);
    }
  }

  // Query methods
  getServiceCalls(filter?: {
    serviceName?: string;
    serviceType?: ServiceCall['serviceType'];
    endpoint?: string;
    success?: boolean;
    timeRange?: number; // hours
    correlationId?: string;
  }): ServiceCall[] {
    let filtered = [...this.serviceCalls];

    if (filter) {
      if (filter.serviceName) {
        filtered = filtered.filter(call => call.serviceName === filter.serviceName);
      }
      if (filter.serviceType) {
        filtered = filtered.filter(call => call.serviceType === filter.serviceType);
      }
      if (filter.endpoint) {
        filtered = filtered.filter(call => call.endpoint === filter.endpoint);
      }
      if (filter.success !== undefined) {
        filtered = filtered.filter(call => call.success === filter.success);
      }
      if (filter.correlationId) {
        filtered = filtered.filter(call => call.correlationId === filter.correlationId);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        filtered = filtered.filter(call => call.timestamp > cutoff);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private getRecentServiceCalls(serviceName: string, endpoint?: string, hours: number = 1): ServiceCall[] {
    return this.getServiceCalls({
      serviceName,
      endpoint,
      timeRange: hours
    });
  }

  getServiceHealth(serviceName?: string): ServiceHealth[] {
    const healthArray = Array.from(this.serviceHealth.values());
    
    if (serviceName) {
      return healthArray.filter(health => health.serviceName === serviceName);
    }
    
    return healthArray;
  }

  getRetryAttempts(filter?: {
    serviceName?: string;
    correlationId?: string;
    timeRange?: number; // hours
  }): RetryAttempt[] {
    let filtered = [...this.retryAttempts];

    if (filter) {
      if (filter.serviceName) {
        filtered = filtered.filter(attempt => attempt.serviceName === filter.serviceName);
      }
      if (filter.correlationId) {
        filtered = filtered.filter(attempt => attempt.correlationId === filter.correlationId);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        filtered = filtered.filter(attempt => attempt.timestamp > cutoff);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get service analytics
  getServiceAnalytics(serviceName?: string, timeRange: number = 24): {
    totalCalls: number;
    successRate: number;
    averageResponseTime: number;
    totalRetries: number;
    slowCalls: number;
    topErrors: Array<{ error: string; count: number }>;
    responseTimeDistribution: Record<string, number>;
  } {
    const calls = this.getServiceCalls({
      serviceName,
      timeRange
    });

    const totalCalls = calls.length;
    const successfulCalls = calls.filter(call => call.success).length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
    const averageResponseTime = totalCalls > 0 ? calls.reduce((sum, call) => sum + call.responseTime, 0) / totalCalls : 0;
    const totalRetries = calls.reduce((sum, call) => sum + call.retryCount, 0);
    const slowCalls = calls.filter(call => call.responseTime > this.config.alerting.responseTimeThreshold).length;

    // Top errors
    const errorCounts = calls.filter(call => !call.success && call.error).reduce((acc, call) => {
      const error = call.error!;
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrors = Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Response time distribution
    const responseTimeDistribution = calls.reduce((acc, call) => {
      const bucket = call.responseTime < 100 ? '<100ms' :
                    call.responseTime < 500 ? '100-500ms' :
                    call.responseTime < 1000 ? '500ms-1s' :
                    call.responseTime < 5000 ? '1-5s' : '>5s';
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCalls,
      successRate,
      averageResponseTime,
      totalRetries,
      slowCalls,
      topErrors,
      responseTimeDistribution
    };
  }

  // Update configuration
  updateConfig(updates: Partial<ServiceMonitoringConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.healthCheckInterval && this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.startHealthCheckTimer();
    }
  }

  // Get current configuration
  getConfig(): ServiceMonitoringConfig {
    return { ...this.config };
  }

  // Export data for analysis
  exportData(): {
    serviceCalls: ServiceCall[];
    serviceHealth: ServiceHealth[];
    retryAttempts: RetryAttempt[];
    circuitBreakers: Array<{ serviceId: string; state: CircuitBreakerState }>;
    analytics: ReturnType<typeof this.getServiceAnalytics>;
  } {
    return {
      serviceCalls: this.serviceCalls,
      serviceHealth: Array.from(this.serviceHealth.values()),
      retryAttempts: this.retryAttempts,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([serviceId, state]) => ({ serviceId, state })),
      analytics: this.getServiceAnalytics()
    };
  }

  // Clean up resources
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

// Singleton instance
export const serviceMonitoring = new ServiceMonitoringService();

// Utility functions
export const registerService = (serviceName: string, serviceType: ServiceCall['serviceType'], endpoints: string[]) =>
  serviceMonitoring.registerService(serviceName, serviceType, endpoints);

export const registerDependency = (dependency: ServiceDependency) =>
  serviceMonitoring.registerDependency(dependency);

export const logServiceCall = (call: Omit<ServiceCall, 'callId' | 'timestamp'>) =>
  serviceMonitoring.logServiceCall(call);

export const makeMonitoredCall = <T>(
  serviceName: string,
  serviceType: ServiceCall['serviceType'],
  endpoint: string,
  method: string,
  operation: () => Promise<T>,
  options?: Parameters<typeof serviceMonitoring.makeMonitoredCall>[5]
) => serviceMonitoring.makeMonitoredCall(serviceName, serviceType, endpoint, method, operation, options);

export const getServiceCalls = (filter?: Parameters<typeof serviceMonitoring.getServiceCalls>[0]) =>
  serviceMonitoring.getServiceCalls(filter);

export const getServiceHealth = (serviceName?: string) =>
  serviceMonitoring.getServiceHealth(serviceName);

export const getRetryAttempts = (filter?: Parameters<typeof serviceMonitoring.getRetryAttempts>[0]) =>
  serviceMonitoring.getRetryAttempts(filter);

export const getServiceAnalytics = (serviceName?: string, timeRange?: number) =>
  serviceMonitoring.getServiceAnalytics(serviceName, timeRange);

export const updateServiceMonitoringConfig = (updates: Partial<ServiceMonitoringConfig>) =>
  serviceMonitoring.updateConfig(updates);

export const exportServiceMonitoringData = () => 
  serviceMonitoring.exportData();