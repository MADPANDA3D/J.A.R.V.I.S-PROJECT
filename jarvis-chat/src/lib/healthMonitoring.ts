/**
 * System Health Monitoring Dashboard
 * Provides comprehensive health monitoring, alerting, and dashboard capabilities
 */

import { performHealthCheck, HealthCheckResult } from './healthCheck';
import { monitoringService } from './monitoring';
import { metricsService } from './metrics';
import { captureError, captureWarning } from './errorTracking';
import { supabase } from './supabase';

// Health monitoring interfaces
export interface HealthDashboard {
  overview: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastUpdated: number;
  };
  services: {
    database: ServiceHealth;
    api: ServiceHealth;
    monitoring: ServiceHealth;
    external: ServiceHealth;
  };
  metrics: {
    performance: PerformanceHealth;
    business: BusinessHealth;
    infrastructure: InfrastructureHealth;
  };
  alerts: HealthAlert[];
  trends: HealthTrend[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  errorRate: number;
  lastCheck: number;
  dependencies: string[];
  metadata?: Record<string, unknown>;
}

export interface PerformanceHealth {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage?: number;
}

export interface BusinessHealth {
  activeUsers: number;
  messageVolume: number;
  conversionRate: number;
  userSatisfaction?: number;
  featureAdoption: Record<string, number>;
}

export interface InfrastructureHealth {
  uptime: number;
  networkLatency: number;
  diskUsage: number;
  connectionPoolHealth: number;
  cachingEfficiency: number;
}

export interface HealthAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  service?: string;
  metadata?: Record<string, unknown>;
}

export interface HealthTrend {
  metric: string;
  timeframe: '1h' | '24h' | '7d' | '30d';
  dataPoints: Array<{
    timestamp: number;
    value: number;
  }>;
  trend: 'improving' | 'stable' | 'degrading';
  changePercentage: number;
}

export interface HealthThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
  comparison: 'greater' | 'less' | 'equal';
}

class HealthMonitoringService {
  private healthHistory: HealthCheckResult[] = [];
  private alerts: HealthAlert[] = [];
  private thresholds: Map<string, HealthThreshold> = new Map();
  private isMonitoring = false;
  private monitoringInterval?: number;
  private dependencies: Map<string, () => Promise<ServiceHealth>> = new Map();

  constructor() {
    this.initializeThresholds();
    this.initializeDependencies();
    this.startMonitoring();
  }

  private initializeThresholds(): void {
    // Performance thresholds
    this.setThreshold('response_time', 500, 1000, 'ms', 'greater');
    this.setThreshold('error_rate', 5, 10, '%', 'greater');
    this.setThreshold('memory_usage', 80, 90, '%', 'greater');
    this.setThreshold('cpu_usage', 70, 85, '%', 'greater');

    // Business thresholds
    this.setThreshold('message_volume', 1000, 500, 'messages/hour', 'less');
    this.setThreshold('active_users', 100, 50, 'users', 'less');
    this.setThreshold('conversion_rate', 50, 25, '%', 'less');

    // Infrastructure thresholds
    this.setThreshold('uptime', 99, 95, '%', 'less');
    this.setThreshold('network_latency', 100, 200, 'ms', 'greater');
    this.setThreshold('disk_usage', 80, 90, '%', 'greater');
  }

  private initializeDependencies(): void {
    // Database dependency
    this.dependencies.set('database', async () => {
      const startTime = Date.now();
      try {
        const { error } = await supabase
          .from('messages')
          .select('id')
          .limit(1)
          .single();

        const responseTime = Date.now() - startTime;

        return {
          name: 'database',
          status: error && error.code !== 'PGRST116' ? 'down' : 'up',
          responseTime,
          errorRate: 0,
          lastCheck: Date.now(),
          dependencies: ['supabase'],
          metadata: { error: error?.message },
        };
      } catch (dbError) {
        return {
          name: 'database',
          status: 'down',
          responseTime: Date.now() - startTime,
          errorRate: 100,
          lastCheck: Date.now(),
          dependencies: ['supabase'],
          metadata: {
            error:
              dbError instanceof Error
                ? dbError.message
                : 'Unknown database error',
          },
        };
      }
    });

    // API dependency
    this.dependencies.set('api', async () => {
      const startTime = Date.now();
      try {
        const response = await fetch('/api/health', { method: 'GET' });
        const responseTime = Date.now() - startTime;

        return {
          name: 'api',
          status: response.ok ? 'up' : 'degraded',
          responseTime,
          errorRate: response.ok ? 0 : 50,
          lastCheck: Date.now(),
          dependencies: ['server'],
          metadata: { status: response.status },
        };
      } catch (apiError) {
        return {
          name: 'api',
          status: 'down',
          responseTime: Date.now() - startTime,
          errorRate: 100,
          lastCheck: Date.now(),
          dependencies: ['server'],
          metadata: {
            error:
              apiError instanceof Error
                ? apiError.message
                : 'Unknown API error',
          },
        };
      }
    });

    // N8N webhook dependency
    this.dependencies.set('webhook', async () => {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        return {
          name: 'webhook',
          status: 'down',
          errorRate: 100,
          lastCheck: Date.now(),
          dependencies: ['n8n'],
          metadata: { error: 'Webhook URL not configured' },
        };
      }

      const startTime = Date.now();
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'health_check', timestamp: Date.now() }),
        });

        const responseTime = Date.now() - startTime;

        return {
          name: 'webhook',
          status: response.ok ? 'up' : 'degraded',
          responseTime,
          errorRate: response.ok ? 0 : 50,
          lastCheck: Date.now(),
          dependencies: ['n8n'],
          metadata: { status: response.status },
        };
      } catch (webhookError) {
        return {
          name: 'webhook',
          status: 'down',
          responseTime: Date.now() - startTime,
          errorRate: 100,
          lastCheck: Date.now(),
          dependencies: ['n8n'],
          metadata: {
            error:
              webhookError instanceof Error
                ? webhookError.message
                : 'Unknown webhook error',
          },
        };
      }
    });

    // Monitoring service dependency
    this.dependencies.set('monitoring', async () => {
      try {
        const monitoringHealth = monitoringService.getMonitoringHealth();

        return {
          name: 'monitoring',
          status:
            monitoringHealth.status === 'healthy'
              ? 'up'
              : monitoringHealth.status === 'degraded'
                ? 'degraded'
                : 'down',
          errorRate: monitoringHealth.status === 'healthy' ? 0 : 25,
          lastCheck: Date.now(),
          dependencies: [],
          metadata: monitoringHealth.metrics,
        };
      } catch (error) {
        return {
          name: 'monitoring',
          status: 'down',
          errorRate: 100,
          lastCheck: Date.now(),
          dependencies: [],
          metadata: {
            error:
              error instanceof Error
                ? error.message
                : 'Unknown monitoring error',
          },
        };
      }
    });
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Perform health checks every 30 seconds
    this.monitoringInterval = window.setInterval(() => {
      this.performComprehensiveHealthCheck();
    }, 30000);

    // Perform initial health check
    this.performComprehensiveHealthCheck();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  public setThreshold(
    metric: string,
    warning: number,
    critical: number,
    unit: string,
    comparison: 'greater' | 'less' | 'equal'
  ): void {
    this.thresholds.set(metric, {
      metric,
      warning,
      critical,
      unit,
      comparison,
    });
  }

  private async performComprehensiveHealthCheck(): Promise<void> {
    try {
      // Perform basic health check
      const basicHealth = await performHealthCheck();
      this.healthHistory.push(basicHealth);

      // Keep only last 100 health checks in memory
      if (this.healthHistory.length > 100) {
        this.healthHistory = this.healthHistory.slice(-100);
      }

      // Check all dependencies
      const serviceChecks = await Promise.allSettled(
        Array.from(this.dependencies.entries()).map(async ([name, checker]) => {
          try {
            return await checker();
          } catch (error) {
            return {
              name,
              status: 'down' as const,
              errorRate: 100,
              lastCheck: Date.now(),
              dependencies: [],
              metadata: {
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            };
          }
        })
      );

      // Process service results and generate alerts
      serviceChecks.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const service = result.value;
          this.checkServiceThresholds(service);
        } else {
          const serviceName = Array.from(this.dependencies.keys())[index];
          this.createAlert(
            'error',
            'Service Check Failed',
            `Failed to check ${serviceName}: ${result.reason}`,
            { service: serviceName }
          );
        }
      });

      // Check overall system health
      this.checkSystemThresholds();
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error('Health monitoring failed'),
        {
          service: 'health_monitoring',
        }
      );
    }
  }

  private checkServiceThresholds(service: ServiceHealth): void {
    // Check response time threshold
    if (service.responseTime) {
      this.checkThreshold('response_time', service.responseTime, {
        service: service.name,
        value: service.responseTime,
      });
    }

    // Check error rate threshold
    this.checkThreshold('error_rate', service.errorRate, {
      service: service.name,
      value: service.errorRate,
    });

    // Generate service-specific alerts
    if (service.status === 'down') {
      this.createAlert(
        'error',
        'Service Down',
        `${service.name} service is not responding`,
        { service: service.name }
      );
    } else if (service.status === 'degraded') {
      this.createAlert(
        'warning',
        'Service Degraded',
        `${service.name} service is experiencing issues`,
        { service: service.name }
      );
    }
  }

  private checkSystemThresholds(): void {
    try {
      // Get recent metrics for threshold checking
      const metrics = metricsService.getBusinessMetrics(5 * 60 * 1000); // 5 minutes
      // const kpis = metricsService.getKPIs({ timeRange: 5 * 60 * 1000 });

      // Check business metrics
      if (metrics.messagesSentPerDay !== undefined) {
        this.checkThreshold('message_volume', metrics.messagesSentPerDay, {
          metric: 'message_volume',
          value: metrics.messagesSentPerDay,
        });
      }

      if (metrics.averageResponseTime !== undefined) {
        this.checkThreshold('response_time', metrics.averageResponseTime, {
          metric: 'avg_response_time',
          value: metrics.averageResponseTime,
        });
      }

      // Check performance metrics from monitoring service
      const monitoringHealth = monitoringService.getMonitoringHealth();
      if (monitoringHealth.metrics.avgResponseTime > 0) {
        this.checkThreshold(
          'response_time',
          monitoringHealth.metrics.avgResponseTime,
          {
            metric: 'monitoring_response_time',
            value: monitoringHealth.metrics.avgResponseTime,
          }
        );
      }
    } catch (error) {
      captureWarning('Failed to check system thresholds', { error });
    }
  }

  private checkThreshold(
    metricName: string,
    value: number,
    metadata: Record<string, unknown>
  ): void {
    const threshold = this.thresholds.get(metricName);
    if (!threshold) return;

    const { warning, critical, comparison } = threshold;

    let exceedsWarning = false;
    let exceedsCritical = false;

    switch (comparison) {
      case 'greater':
        exceedsWarning = value > warning;
        exceedsCritical = value > critical;
        break;
      case 'less':
        exceedsWarning = value < warning;
        exceedsCritical = value < critical;
        break;
      case 'equal':
        exceedsWarning = value === warning;
        exceedsCritical = value === critical;
        break;
    }

    if (exceedsCritical) {
      this.createAlert(
        'error',
        'Critical Threshold Exceeded',
        `${metricName} (${value}${threshold.unit}) exceeds critical threshold (${critical}${threshold.unit})`,
        { metric: metricName, value, threshold: critical, ...metadata }
      );
    } else if (exceedsWarning) {
      this.createAlert(
        'warning',
        'Warning Threshold Exceeded',
        `${metricName} (${value}${threshold.unit}) exceeds warning threshold (${warning}${threshold.unit})`,
        { metric: metricName, value, threshold: warning, ...metadata }
      );
    }
  }

  private createAlert(
    type: HealthAlert['type'],
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    // Check for duplicate alerts in the last 5 minutes
    const recentAlerts = this.alerts.filter(
      alert =>
        Date.now() - alert.timestamp < 5 * 60 * 1000 &&
        alert.title === title &&
        alert.type === type
    );

    if (recentAlerts.length > 0) {
      return; // Don't create duplicate alerts
    }

    const alert: HealthAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      acknowledged: false,
      metadata,
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Track alert in monitoring
    monitoringService.trackBusinessEvent('health.alert_created', {
      type,
      title,
      message,
      metadata,
    });

    // Send to external alerting if critical
    if (type === 'error') {
      this.sendCriticalAlert(alert);
    }
  }

  private async sendCriticalAlert(alert: HealthAlert): Promise<void> {
    try {
      // Send to webhook if configured
      const alertWebhook = import.meta.env.VITE_ALERT_WEBHOOK_URL;
      if (alertWebhook) {
        await fetch(alertWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'critical_alert',
            alert,
            timestamp: Date.now(),
            source: 'jarvis_health_monitoring',
          }),
        });
      }

      // Log critical alerts
      captureError(`Critical Health Alert: ${alert.title}`, {
        alert_id: alert.id,
        message: alert.message,
        metadata: alert.metadata,
      });
    } catch (error) {
      captureWarning('Failed to send critical alert', {
        alert_id: alert.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Public API methods
  public async getDashboard(): Promise<HealthDashboard> {
    const latestHealth = this.healthHistory[this.healthHistory.length - 1];
    const uptime = this.calculateUptime();
    const recentKPIs = metricsService.getKPIs({ timeRange: 5 * 60 * 1000 });

    // Calculate metrics
    const responseTimeKPIs = recentKPIs.filter(kpi =>
      kpi.name.includes('response_time')
    );
    const errorKPIs = recentKPIs.filter(kpi => kpi.name.includes('error'));

    const avgResponseTime =
      responseTimeKPIs.length > 0
        ? responseTimeKPIs.reduce((sum, kpi) => sum + kpi.value, 0) /
          responseTimeKPIs.length
        : 0;

    const errorRate =
      recentKPIs.length > 0 ? (errorKPIs.length / recentKPIs.length) * 100 : 0;

    // Get service health
    const serviceHealth = await this.getAllServiceHealth();

    // Get business metrics
    const businessMetrics = metricsService.getBusinessMetrics(60 * 60 * 1000); // 1 hour
    const sessionAnalytics = metricsService.getSessionAnalytics(60 * 60 * 1000);

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      serviceHealth,
      errorRate,
      avgResponseTime
    );

    return {
      overview: {
        status: overallStatus,
        uptime,
        responseTime: avgResponseTime,
        errorRate,
        lastUpdated: Date.now(),
      },
      services: {
        database:
          serviceHealth.find(s => s.name === 'database') ||
          this.createDefaultService('database'),
        api:
          serviceHealth.find(s => s.name === 'api') ||
          this.createDefaultService('api'),
        monitoring:
          serviceHealth.find(s => s.name === 'monitoring') ||
          this.createDefaultService('monitoring'),
        external:
          serviceHealth.find(s => s.name === 'webhook') ||
          this.createDefaultService('webhook'),
      },
      metrics: {
        performance: {
          averageResponseTime: avgResponseTime,
          p95ResponseTime: this.calculatePercentile(
            responseTimeKPIs.map(kpi => kpi.value),
            95
          ),
          p99ResponseTime: this.calculatePercentile(
            responseTimeKPIs.map(kpi => kpi.value),
            99
          ),
          throughput: businessMetrics.messagesSentPerDay || 0,
          errorRate,
          memoryUsage: this.getMemoryUsage(),
        },
        business: {
          activeUsers: sessionAnalytics.totalSessions,
          messageVolume: businessMetrics.messagesSentPerDay || 0,
          conversionRate: businessMetrics.chatCompletionRate || 0,
          featureAdoption: businessMetrics.featureAdoptionRate || {},
        },
        infrastructure: {
          uptime,
          networkLatency: this.getNetworkLatency(),
          diskUsage: 0, // Would need server-side implementation
          connectionPoolHealth:
            latestHealth?.checks.database.status === 'up' ? 100 : 0,
          cachingEfficiency: this.getCachingEfficiency(),
        },
      },
      alerts: this.getRecentAlerts(),
      trends: this.calculateTrends(),
    };
  }

  private async getAllServiceHealth(): Promise<ServiceHealth[]> {
    const results = await Promise.allSettled(
      Array.from(this.dependencies.values()).map(checker => checker())
    );

    return results
      .filter(
        (result): result is PromiseFulfilledResult<ServiceHealth> =>
          result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  private createDefaultService(name: string): ServiceHealth {
    return {
      name,
      status: 'down',
      errorRate: 100,
      lastCheck: Date.now(),
      dependencies: [],
      metadata: { error: 'Service check not available' },
    };
  }

  private calculateOverallStatus(
    services: ServiceHealth[],
    errorRate: number,
    responseTime: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const downServices = services.filter(s => s.status === 'down').length;
    const degradedServices = services.filter(
      s => s.status === 'degraded'
    ).length;

    if (downServices > 0 || errorRate > 10 || responseTime > 1000) {
      return 'unhealthy';
    }

    if (degradedServices > 0 || errorRate > 5 || responseTime > 500) {
      return 'degraded';
    }

    return 'healthy';
  }

  private calculateUptime(): number {
    if (this.healthHistory.length === 0) return 100;

    const recentChecks = this.healthHistory.slice(-20); // Last 20 checks
    const healthyChecks = recentChecks.filter(
      check => check.status === 'healthy'
    ).length;

    return (healthyChecks / recentChecks.length) * 100;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;

    return sorted[Math.max(0, index)];
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as typeof performance & {
        memory: {
          usedJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  private getNetworkLatency(): number {
    if ('connection' in navigator) {
      const connection = (navigator as typeof navigator & {
        connection: {
          rtt?: number;
        };
      }).connection;
      return connection.rtt || 0;
    }
    return 0;
  }

  private getCachingEfficiency(): number {
    // This would need to be implemented based on actual caching metrics
    // For now, return a placeholder
    return 85; // 85% cache hit rate
  }

  private getRecentAlerts(limit: number = 10): HealthAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  private calculateTrends(): HealthTrend[] {
    // This would calculate trends from historical data
    // For now, return basic trends
    return [
      {
        metric: 'response_time',
        timeframe: '24h',
        dataPoints: [],
        trend: 'stable',
        changePercentage: 0,
      },
      {
        metric: 'error_rate',
        timeframe: '24h',
        dataPoints: [],
        trend: 'improving',
        changePercentage: -15,
      },
    ];
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      monitoringService.trackBusinessEvent('health.alert_acknowledged', {
        alert_id: alertId,
        alert_type: alert.type,
      });
    }
  }

  public getAlerts(filter?: {
    type?: HealthAlert['type'];
    acknowledged?: boolean;
  }): HealthAlert[] {
    let filtered = this.alerts;

    if (filter?.type) {
      filtered = filtered.filter(alert => alert.type === filter.type);
    }

    if (filter?.acknowledged !== undefined) {
      filtered = filtered.filter(
        alert => alert.acknowledged === filter.acknowledged
      );
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getHealthHistory(limit?: number): HealthCheckResult[] {
    const history = [...this.healthHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  // Health check for the health monitoring service itself
  public getHealthMonitoringStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      isMonitoring: boolean;
      totalChecks: number;
      totalAlerts: number;
      unacknowledgedAlerts: number;
      servicesTracked: number;
    };
  } {
    const unacknowledgedAlerts = this.alerts.filter(
      a => !a.acknowledged
    ).length;

    const status = !this.isMonitoring
      ? 'unhealthy'
      : unacknowledgedAlerts > 5
        ? 'degraded'
        : 'healthy';

    return {
      status,
      metrics: {
        isMonitoring: this.isMonitoring,
        totalChecks: this.healthHistory.length,
        totalAlerts: this.alerts.length,
        unacknowledgedAlerts,
        servicesTracked: this.dependencies.size,
      },
    };
  }
}

// Singleton instance
export const healthMonitoringService = new HealthMonitoringService();

// Utility functions
export const getDashboard = () => healthMonitoringService.getDashboard();
export const acknowledgeAlert = (alertId: string) =>
  healthMonitoringService.acknowledgeAlert(alertId);
export const getAlerts = (
  filter?: Parameters<typeof healthMonitoringService.getAlerts>[0]
) => healthMonitoringService.getAlerts(filter);
export const getHealthHistory = (limit?: number) =>
  healthMonitoringService.getHealthHistory(limit);
export const setHealthThreshold = (
  metric: string,
  warning: number,
  critical: number,
  unit: string,
  comparison: 'greater' | 'less' | 'equal'
) =>
  healthMonitoringService.setThreshold(
    metric,
    warning,
    critical,
    unit,
    comparison
  );
