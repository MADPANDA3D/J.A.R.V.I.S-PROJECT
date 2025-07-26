/**
 * Webhook Monitoring Service Test Suite
 * Tests monitoring, alerting, and analytics functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  WebhookMonitoringService,
  webhookMonitoringService,
  AlertRule,
  AlertEvent,
  WebhookMonitoringMetrics,
} from '../webhookMonitoring';

describe('WebhookMonitoringService', () => {
  let monitoringService: WebhookMonitoringService;
  let alertCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    monitoringService = new WebhookMonitoringService();
    alertCallback = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    monitoringService.clearHistory();
  });

  describe('Performance Metrics Collection', () => {
    it('should record successful requests correctly', () => {
      monitoringService.recordRequest(150, true);
      monitoringService.recordRequest(200, true);
      monitoringService.recordRequest(120, true);

      const metrics = monitoringService.getCurrentMetrics();

      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(3);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBeCloseTo(156.67, 1);
    });

    it('should record failed requests correctly', () => {
      monitoringService.recordRequest(100, true);
      monitoringService.recordRequest(150, false, 500, 'Server error');
      monitoringService.recordRequest(200, false, 429, 'Rate limited');

      const metrics = monitoringService.getCurrentMetrics();

      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(2);
      expect(metrics.errorRate).toBeCloseTo(66.67, 1);
    });

    it('should calculate percentiles correctly', () => {
      // Record a range of response times for percentile calculation
      const responseTimes = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

      responseTimes.forEach(time => {
        monitoringService.recordRequest(time, true);
      });

      const metrics = monitoringService.getCurrentMetrics();

      expect(metrics.p95ResponseTime).toBeGreaterThan(
        metrics.averageResponseTime
      );
      expect(metrics.p99ResponseTime).toBeGreaterThan(metrics.p95ResponseTime);
      expect(metrics.averageResponseTime).toBe(275); // (50+500)/2 * 10 / 10
    });

    it('should track requests per minute and hour', () => {
      // const now = new Date();

      // Mock requests in the last minute
      for (let i = 0; i < 5; i++) {
        monitoringService.recordRequest(100, true);
      }

      const metrics = monitoringService.getCurrentMetrics();
      expect(metrics.requestsPerMinute).toBe(5);
      expect(metrics.requestsPerHour).toBe(5);
    });

    it('should determine health status based on metrics', () => {
      // Healthy scenario
      monitoringService.recordRequest(100, true);
      let metrics = monitoringService.getCurrentMetrics();
      expect(metrics.healthStatus).toBe('healthy');

      // Clear and test degraded scenario (high response time)
      monitoringService.clearHistory();
      monitoringService.recordRequest(1200, true); // Slow but successful
      metrics = monitoringService.getCurrentMetrics();
      expect(metrics.healthStatus).toBe('degraded');

      // Clear and test unhealthy scenario (high error rate)
      monitoringService.clearHistory();
      monitoringService.recordRequest(100, false);
      monitoringService.recordRequest(100, false);
      monitoringService.recordRequest(100, false); // 100% error rate
      metrics = monitoringService.getCurrentMetrics();
      expect(metrics.healthStatus).toBe('unhealthy');
    });

    it('should handle empty metrics gracefully', () => {
      const metrics = monitoringService.getCurrentMetrics();

      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.healthStatus).toBe('healthy');
    });

    it('should maintain performance history size limit', () => {
      // Record more than the max history size (1000)
      for (let i = 0; i < 1200; i++) {
        monitoringService.recordRequest(100 + i, true);
      }

      const metrics = monitoringService.getCurrentMetrics();

      // Should only track the last 1000 requests
      expect(metrics.totalRequests).toBe(1000);
    });
  });

  describe('Alert System', () => {
    it('should initialize with default alert rules', () => {
      const alertRules = monitoringService['alertRules'];

      expect(alertRules.length).toBeGreaterThan(0);
      expect(alertRules.some(rule => rule.id === 'high_error_rate')).toBe(true);
      expect(alertRules.some(rule => rule.id === 'slow_response_time')).toBe(
        true
      );
      expect(alertRules.some(rule => rule.id === 'circuit_breaker_open')).toBe(
        true
      );
    });

    it('should trigger high error rate alert', () => {
      const unsubscribe = monitoringService.subscribeToAlerts(alertCallback);

      // Generate high error rate (>10%)
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, i < 8); // 20% error rate
      }

      expect(alertCallback).toHaveBeenCalled();
      const alertEvent = alertCallback.mock.calls[0][0] as AlertEvent;
      expect(alertEvent.ruleName).toBe('Elevated Error Rate');
      expect(alertEvent.severity).toBe('high');

      unsubscribe();
    });

    it('should trigger slow response time alert', () => {
      const unsubscribe = monitoringService.subscribeToAlerts(alertCallback);

      // Generate slow response times
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(1500, true); // >1000ms response time
      }

      expect(alertCallback).toHaveBeenCalled();
      const alertEvent = alertCallback.mock.calls[0][0] as AlertEvent;
      expect(alertEvent.ruleName).toBe('Slow Response Time');
      expect(alertEvent.severity).toBe('medium');

      unsubscribe();
    });

    it('should respect alert cooldown periods', () => {
      const unsubscribe = monitoringService.subscribeToAlerts(alertCallback);

      // Generate high error rate to trigger alert
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, i < 8); // 20% error rate
      }

      expect(alertCallback).toHaveBeenCalledTimes(1);

      // Generate more errors immediately - should not trigger due to cooldown
      for (let i = 0; i < 5; i++) {
        monitoringService.recordRequest(100, false);
      }

      expect(alertCallback).toHaveBeenCalledTimes(1); // Still only 1 call

      unsubscribe();
    });

    it('should allow custom alert rules', () => {
      const customRule: Omit<AlertRule, 'id'> = {
        name: 'Custom High Volume Alert',
        condition: metrics => metrics.requestsPerMinute > 50,
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 5,
      };

      const ruleId = monitoringService.addAlertRule(customRule);
      expect(ruleId).toMatch(/^alert_\d+_[a-z0-9]+$/);

      const unsubscribe = monitoringService.subscribeToAlerts(alertCallback);

      // Simulate high volume (would need to manipulate time or request patterns)
      // For this test, we'll just verify the rule was added
      const rules = monitoringService['alertRules'];
      expect(rules.some(rule => rule.name === 'Custom High Volume Alert')).toBe(
        true
      );

      unsubscribe();
    });

    it('should allow alert resolution', () => {
      const unsubscribe = monitoringService.subscribeToAlerts(alertCallback);

      // Trigger an alert
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, false); // 100% error rate
      }

      expect(alertCallback).toHaveBeenCalled();
      const alertEvent = alertCallback.mock.calls[0][0] as AlertEvent;

      // Resolve the alert
      const resolved = monitoringService.resolveAlert(alertEvent.id);
      expect(resolved).toBe(true);

      const activeAlerts = monitoringService.getActiveAlerts();
      expect(activeAlerts.length).toBe(0);

      unsubscribe();
    });

    it('should generate descriptive alert messages', () => {
      const unsubscribe = monitoringService.subscribeToAlerts(alertCallback);

      // Generate circuit breaker scenario
      const circuitBreakerMetrics: WebhookMonitoringMetrics = {
        totalRequests: 10,
        successfulRequests: 2,
        failedRequests: 8,
        averageResponseTime: 200,
        p95ResponseTime: 300,
        p99ResponseTime: 400,
        errorRate: 80,
        circuitBreakerState: 'open',
        healthStatus: 'unhealthy',
        requestsPerMinute: 5,
        requestsPerHour: 25,
      };

      // Manually trigger alert check with specific metrics
      const rule = monitoringService['alertRules'].find(
        r => r.id === 'circuit_breaker_open'
      )!;
      if (rule.condition(circuitBreakerMetrics)) {
        const message = monitoringService['generateAlertMessage'](
          rule,
          circuitBreakerMetrics
        );
        expect(message).toContain('circuit breaker is open');
        expect(message).toContain('temporarily unavailable');
      }

      unsubscribe();
    });
  });

  describe('Dashboard Data', () => {
    it('should generate comprehensive dashboard data', () => {
      // Record some test data
      monitoringService.recordRequest(100, true);
      monitoringService.recordRequest(200, false, 500, 'Server error');
      monitoringService.recordRequest(150, true);

      const dashboardData = monitoringService.getDashboardData();

      expect(dashboardData).toHaveProperty('currentMetrics');
      expect(dashboardData).toHaveProperty('recentAlerts');
      expect(dashboardData).toHaveProperty('performanceTrends');
      expect(dashboardData).toHaveProperty('requestHistory');

      expect(dashboardData.currentMetrics.totalRequests).toBe(3);
      expect(dashboardData.requestHistory.length).toBe(3);
      expect(dashboardData.requestHistory[0]).toHaveProperty('timestamp');
      expect(dashboardData.requestHistory[0]).toHaveProperty('success');
      expect(dashboardData.requestHistory[0]).toHaveProperty('responseTime');
    });

    it('should include performance trends in dashboard data', () => {
      // Record requests spread over time intervals
      for (let i = 0; i < 20; i++) {
        monitoringService.recordRequest(100 + i * 10, i % 4 !== 0); // 75% success rate
      }

      const dashboardData = monitoringService.getDashboardData();

      expect(dashboardData.performanceTrends).toBeDefined();
      expect(Array.isArray(dashboardData.performanceTrends)).toBe(true);

      if (dashboardData.performanceTrends.length > 0) {
        const trend = dashboardData.performanceTrends[0];
        expect(trend).toHaveProperty('timestamp');
        expect(trend).toHaveProperty('responseTime');
        expect(trend).toHaveProperty('requestCount');
        expect(trend).toHaveProperty('errorRate');
      }
    });

    it('should limit recent alerts in dashboard data', () => {
      const unsubscribe = monitoringService.subscribeToAlerts(() => {});

      // Generate multiple alerts
      for (let batch = 0; batch < 15; batch++) {
        monitoringService.clearHistory();
        for (let i = 0; i < 10; i++) {
          monitoringService.recordRequest(100, false); // Trigger error rate alert
        }
        // Advance time to avoid cooldown (in real implementation)
        monitoringService['alertRules'].forEach(rule => {
          rule.lastTriggered = undefined;
        });
      }

      const dashboardData = monitoringService.getDashboardData();

      // Should limit to last 10 alerts
      expect(dashboardData.recentAlerts.length).toBeLessThanOrEqual(10);

      unsubscribe();
    });
  });

  describe('Alert Subscription Management', () => {
    it('should allow multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = monitoringService.subscribeToAlerts(callback1);
      const unsubscribe2 = monitoringService.subscribeToAlerts(callback2);

      // Trigger an alert
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, false);
      }

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });

    it('should handle subscriber errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Subscriber error');
      });
      const normalCallback = vi.fn();

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      monitoringService.subscribeToAlerts(errorCallback);
      monitoringService.subscribeToAlerts(normalCallback);

      // Trigger an alert
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, false);
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error notifying alert subscriber:',
        expect.any(Error)
      );
      expect(normalCallback).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should properly unsubscribe callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = monitoringService.subscribeToAlerts(callback);

      // Trigger alert before unsubscribe
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, false);
      }

      expect(callback).toHaveBeenCalled();
      callback.mockClear();

      // Unsubscribe and trigger again
      unsubscribe();

      // Clear history and reset cooldowns
      monitoringService.clearHistory();
      monitoringService['alertRules'].forEach(rule => {
        rule.lastTriggered = undefined;
      });

      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, false);
      }

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Circuit Breaker Integration', () => {
    it('should infer circuit breaker state from error patterns', () => {
      // Simulate pattern that would indicate open circuit breaker
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, false); // All failures
      }

      const metrics = monitoringService.getCurrentMetrics();

      // The circuit breaker state inference should detect this pattern
      expect(metrics.circuitBreakerState).toBe('open');
    });

    it('should detect half-open circuit breaker state', () => {
      // Simulate mixed success/failure pattern indicating half-open state
      monitoringService.recordRequest(100, false);
      monitoringService.recordRequest(100, false);
      monitoringService.recordRequest(100, true);
      monitoringService.recordRequest(100, false);
      monitoringService.recordRequest(100, true);

      const metrics = monitoringService.getCurrentMetrics();

      // Should detect partial recovery pattern
      expect(['half-open', 'open']).toContain(metrics.circuitBreakerState);
    });

    it('should show closed circuit breaker for healthy patterns', () => {
      // Simulate healthy request pattern
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, true);
      }

      const metrics = monitoringService.getCurrentMetrics();
      expect(metrics.circuitBreakerState).toBe('closed');
    });
  });

  describe('Data Cleanup and Management', () => {
    it('should clear history and alerts properly', () => {
      // Generate some data
      monitoringService.recordRequest(100, true);
      monitoringService.recordRequest(100, false);

      const unsubscribe = monitoringService.subscribeToAlerts(() => {});

      // Trigger an alert
      for (let i = 0; i < 10; i++) {
        monitoringService.recordRequest(100, false);
      }

      // Verify data exists
      expect(
        monitoringService.getCurrentMetrics().totalRequests
      ).toBeGreaterThan(0);
      expect(monitoringService.getActiveAlerts().length).toBeGreaterThan(0);

      // Clear and verify
      monitoringService.clearHistory();

      expect(monitoringService.getCurrentMetrics().totalRequests).toBe(0);
      expect(monitoringService.getActiveAlerts().length).toBe(0);

      unsubscribe();
    });

    it('should handle concurrent request recording safely', () => {
      // Simulate concurrent request recording
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            monitoringService.recordRequest(100 + i, i % 10 !== 0);
          })
        );
      }

      return Promise.all(promises).then(() => {
        const metrics = monitoringService.getCurrentMetrics();
        expect(metrics.totalRequests).toBe(100);
        expect(metrics.successfulRequests).toBe(90); // 90% success rate
        expect(metrics.failedRequests).toBe(10);
      });
    });
  });

  describe('Singleton Instance', () => {
    it('should provide working singleton instance', () => {
      expect(webhookMonitoringService).toBeInstanceOf(WebhookMonitoringService);

      webhookMonitoringService.recordRequest(100, true);
      const metrics = webhookMonitoringService.getCurrentMetrics();

      expect(metrics.totalRequests).toBe(1);

      webhookMonitoringService.clearHistory();
    });

    it('should maintain state across singleton access', () => {
      webhookMonitoringService.recordRequest(150, true);

      // Access singleton again
      const metrics1 = webhookMonitoringService.getCurrentMetrics();
      const metrics2 = webhookMonitoringService.getCurrentMetrics();

      expect(metrics1.totalRequests).toBe(metrics2.totalRequests);
      expect(metrics1.averageResponseTime).toBe(metrics2.averageResponseTime);

      webhookMonitoringService.clearHistory();
    });
  });
});
