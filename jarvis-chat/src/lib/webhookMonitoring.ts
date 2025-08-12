/**
 * Webhook Monitoring Service
 * Provides real-time monitoring, alerting, and analytics for webhook performance
 */

export interface WebhookMonitoringMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  lastRequestTime?: Date;
  circuitBreakerState: 'closed' | 'open' | 'half-open';
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  requestsPerMinute: number;
  requestsPerHour: number;
  // Failover-specific metrics
  activeServer: 'primary' | 'backup' | 'unknown';
  failoverCount: number;
  lastFailover?: Date;
  failoverResponseTime?: number;
  primaryServerHealth: boolean;
  backupServerHealth: boolean;
  deliveryVerificationRate: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: WebhookMonitoringMetrics) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metrics: WebhookMonitoringMetrics;
  resolved?: boolean;
  resolvedAt?: Date;
}

export interface MonitoringDashboardData {
  currentMetrics: WebhookMonitoringMetrics;
  recentAlerts: AlertEvent[];
  performanceTrends: {
    timestamp: Date;
    responseTime: number;
    requestCount: number;
    errorRate: number;
  }[];
  requestHistory: {
    timestamp: Date;
    success: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }[];
}

class WebhookMonitoringService {
  private performanceHistory: Array<{
    timestamp: Date;
    responseTime: number;
    success: boolean;
    statusCode?: number;
    error?: string;
  }> = [];

  private alertRules: AlertRule[] = [];
  private activeAlerts: Map<string, AlertEvent> = new Map();
  private alertSubscribers: Array<(alert: AlertEvent) => void> = [];

  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly TREND_WINDOW_MINUTES = 60;

  constructor() {
    this.initializeDefaultAlertRules();
  }

  /**
   * Record a webhook request for monitoring
   */
  recordRequest(
    responseTime: number,
    success: boolean,
    statusCode?: number,
    error?: string
  ): void {
    const entry = {
      timestamp: new Date(),
      responseTime,
      success,
      statusCode,
      error,
    };

    this.performanceHistory.push(entry);

    // Keep history size manageable
    if (this.performanceHistory.length > this.MAX_HISTORY_SIZE) {
      this.performanceHistory.shift();
    }

    // Check alerts
    this.checkAlertRules();
  }

  /**
   * Get current monitoring metrics
   */
  getCurrentMetrics(): WebhookMonitoringMetrics {
    if (this.performanceHistory.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        circuitBreakerState: 'closed',
        healthStatus: 'healthy',
        requestsPerMinute: 0,
        requestsPerHour: 0,
      };
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentRequests = this.performanceHistory.filter(
      r => r.timestamp >= oneMinuteAgo
    );
    const hourlyRequests = this.performanceHistory.filter(
      r => r.timestamp >= oneHourAgo
    );

    const totalRequests = this.performanceHistory.length;
    const successfulRequests = this.performanceHistory.filter(
      r => r.success
    ).length;
    const failedRequests = totalRequests - successfulRequests;
    const errorRate =
      totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    // Calculate percentiles
    const responseTimes = this.performanceHistory
      .map(r => r.responseTime)
      .sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    // Determine health status
    let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errorRate > 10) {
      healthStatus = 'unhealthy';
    } else if (errorRate > 5 || averageResponseTime > 1000) {
      healthStatus = 'degraded';
    }

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      errorRate,
      lastRequestTime:
        this.performanceHistory[this.performanceHistory.length - 1]?.timestamp,
      circuitBreakerState: this.getCircuitBreakerState(),
      healthStatus,
      requestsPerMinute: recentRequests.length,
      requestsPerHour: hourlyRequests.length,
    };
  }

  /**
   * Get dashboard data for monitoring UI
   */
  getDashboardData(): MonitoringDashboardData {
    const currentMetrics = this.getCurrentMetrics();
    const recentAlerts = Array.from(this.activeAlerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Generate performance trends (last hour, 5-minute intervals)
    const now = new Date();
    const performanceTrends = [];

    for (let i = 12; i >= 0; i--) {
      const intervalStart = new Date(now.getTime() - i * 5 * 60 * 1000);
      const intervalEnd = new Date(now.getTime() - (i - 1) * 5 * 60 * 1000);

      const intervalRequests = this.performanceHistory.filter(
        r => r.timestamp >= intervalStart && r.timestamp < intervalEnd
      );

      if (intervalRequests.length > 0) {
        const avgResponseTime =
          intervalRequests.reduce((sum, r) => sum + r.responseTime, 0) /
          intervalRequests.length;
        const errorCount = intervalRequests.filter(r => !r.success).length;
        const errorRate = (errorCount / intervalRequests.length) * 100;

        performanceTrends.push({
          timestamp: intervalStart,
          responseTime: Math.round(avgResponseTime),
          requestCount: intervalRequests.length,
          errorRate: Math.round(errorRate * 100) / 100,
        });
      }
    }

    // Get recent request history (last 50 requests)
    const requestHistory = this.performanceHistory.slice(-50).map(r => ({
      timestamp: r.timestamp,
      success: r.success,
      responseTime: r.responseTime,
      statusCode: r.statusCode,
      error: r.error,
    }));

    return {
      currentMetrics,
      recentAlerts,
      performanceTrends,
      requestHistory,
    };
  }

  /**
   * Add a custom alert rule
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const alertRule: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.alertRules.push(alertRule);
    return alertRule.id;
  }

  /**
   * Subscribe to alert notifications
   */
  subscribeToAlerts(callback: (alert: AlertEvent) => void): () => void {
    this.alertSubscribers.push(callback);

    return () => {
      const index = this.alertSubscribers.indexOf(callback);
      if (index > -1) {
        this.alertSubscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Clear performance history (useful for testing)
   */
  clearHistory(): void {
    this.performanceHistory = [];
    this.activeAlerts.clear();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: metrics => metrics.errorRate > 10,
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        id: 'elevated_error_rate',
        name: 'Elevated Error Rate',
        condition: metrics => metrics.errorRate > 5 && metrics.errorRate <= 10,
        severity: 'high',
        enabled: true,
        cooldownMinutes: 10,
      },
      {
        id: 'slow_response_time',
        name: 'Slow Response Time',
        condition: metrics => metrics.p95ResponseTime > 1000,
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        id: 'very_slow_response_time',
        name: 'Very Slow Response Time',
        condition: metrics => metrics.p95ResponseTime > 2000,
        severity: 'high',
        enabled: true,
        cooldownMinutes: 3,
      },
      {
        id: 'circuit_breaker_open',
        name: 'Circuit Breaker Open',
        condition: metrics => metrics.circuitBreakerState === 'open',
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 1,
      },
      {
        id: 'low_request_volume',
        name: 'Low Request Volume',
        condition: metrics =>
          metrics.requestsPerMinute === 0 && metrics.totalRequests > 0,
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 15,
      },
    ];
  }

  /**
   * Check alert rules and trigger alerts if necessary
   */
  private checkAlertRules(): void {
    const currentMetrics = this.getCurrentMetrics();
    const now = new Date();

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check cooldown period
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        if (now.getTime() - rule.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      // Check if rule condition is met
      if (rule.condition(currentMetrics)) {
        const alertEvent: AlertEvent = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: this.generateAlertMessage(rule, currentMetrics),
          timestamp: now,
          metrics: { ...currentMetrics },
          resolved: false,
        };

        this.activeAlerts.set(alertEvent.id, alertEvent);
        rule.lastTriggered = now;

        // Notify subscribers
        this.alertSubscribers.forEach(subscriber => {
          try {
            subscriber(alertEvent);
          } catch (error) {
            console.error('Error notifying alert subscriber:', error);
          }
        });
      }
    }
  }

  /**
   * Generate a descriptive alert message
   */
  private generateAlertMessage(
    rule: AlertRule,
    metrics: WebhookMonitoringMetrics
  ): string {
    switch (rule.id) {
      case 'high_error_rate':
        return `Webhook error rate is critically high at ${metrics.errorRate.toFixed(1)}% (${metrics.failedRequests}/${metrics.totalRequests} requests failed)`;
      case 'elevated_error_rate':
        return `Webhook error rate is elevated at ${metrics.errorRate.toFixed(1)}% (${metrics.failedRequests}/${metrics.totalRequests} requests failed)`;
      case 'slow_response_time':
        return `Webhook response time is slow - P95: ${metrics.p95ResponseTime}ms, Average: ${metrics.averageResponseTime.toFixed(0)}ms`;
      case 'very_slow_response_time':
        return `Webhook response time is very slow - P95: ${metrics.p95ResponseTime}ms, Average: ${metrics.averageResponseTime.toFixed(0)}ms`;
      case 'circuit_breaker_open':
        return `Webhook circuit breaker is open - service is temporarily unavailable due to repeated failures`;
      case 'low_request_volume':
        return `No webhook requests received in the last minute - service may be down or not receiving traffic`;
      default:
        return `Alert condition met for rule: ${rule.name}`;
    }
  }

  /**
   * Get circuit breaker state (would integrate with actual webhook service)
   */
  private getCircuitBreakerState(): 'closed' | 'open' | 'half-open' {
    // This would integrate with the actual webhook service circuit breaker
    // For now, infer from recent error patterns
    const recentRequests = this.performanceHistory.slice(-10);
    if (recentRequests.length >= 5) {
      const recentFailures = recentRequests.filter(r => !r.success).length;
      if (recentFailures >= 4) {
        return 'open';
      } else if (recentFailures >= 2) {
        return 'half-open';
      }
    }
    return 'closed';
  }
}

// Export singleton instance
export const webhookMonitoringService = new WebhookMonitoringService();

// Export types and service class for testing
export { WebhookMonitoringService };
