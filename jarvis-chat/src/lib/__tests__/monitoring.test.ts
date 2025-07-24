/**
 * Comprehensive tests for the monitoring service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { monitoringService } from '../monitoring';

// Mock dependencies
vi.mock('../errorTracking', () => ({
  captureError: vi.fn(),
  captureWarning: vi.fn(),
  captureInfo: vi.fn(),
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    timing: {
      navigationStart: Date.now() - 1000,
      loadEventEnd: Date.now(),
      domContentLoadedEventEnd: Date.now() - 200,
      responseStart: Date.now() - 800,
    },
    getEntriesByType: vi.fn(() => [
      { name: 'first-contentful-paint', startTime: 150 },
    ]),
  },
});

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation(callback => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock navigator.connection
Object.defineProperty(navigator, 'connection', {
  value: {
    rtt: 50,
    effectiveType: '4g',
    downlink: 10,
  },
});

describe('MonitoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Performance Tracking', () => {
    it('should track page load time', () => {
      const url = '/test-page';
      const duration = 1200;
      const metadata = { component: 'TestComponent' };

      monitoringService.trackPageLoad(url, duration, metadata);

      // Verify the metric was tracked
      const metrics = monitoringService.getMetrics({ name: 'page.load_time' });
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('page.load_time');
      expect(metrics[0].value).toBe(duration);
      expect(metrics[0].tags).toMatchObject({ url, ...metadata });
    });

    it('should track API response times', () => {
      const endpoint = '/api/messages';
      const duration = 250;
      const status = 200;

      monitoringService.trackAPIResponse(endpoint, duration, status);

      const metrics = monitoringService.getMetrics({
        name: 'api.response_time',
      });
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(duration);
      expect(metrics[0].tags).toMatchObject({
        endpoint,
        status,
        success: true,
      });
    });

    it('should track API errors for 4xx/5xx status codes', () => {
      const endpoint = '/api/messages';
      const duration = 500;
      const status = 500;

      monitoringService.trackAPIResponse(endpoint, duration, status);

      const metrics = monitoringService.getMetrics({
        name: 'api.response_time',
      });
      expect(metrics).toHaveLength(1);
      expect(metrics[0].tags).toMatchObject({
        endpoint,
        status,
        success: false,
      });
    });

    it('should track user interactions', () => {
      const action = 'button_click';
      const metadata = { buttonId: 'send-message' };

      monitoringService.trackUserInteraction(action, metadata);

      const events = monitoringService.getEvents({ name: 'user.interaction' });
      expect(events).toHaveLength(1);
      expect(events[0].properties).toMatchObject({
        action,
        ...metadata,
      });
    });
  });

  describe('Custom Metrics', () => {
    it('should track custom metrics with tags', () => {
      const name = 'custom.metric';
      const value = 42;
      const tags = { category: 'business', type: 'counter' };

      monitoringService.trackCustomMetric(name, value, tags);

      const metrics = monitoringService.getMetrics({ name });
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe(name);
      expect(metrics[0].value).toBe(value);
      expect(metrics[0].tags).toMatchObject(tags);
    });

    it('should track business events', () => {
      const event = 'user.signup';
      const properties = { plan: 'premium', source: 'web' };

      monitoringService.trackBusinessEvent(event, properties);

      const events = monitoringService.getEvents({ name: event });
      expect(events).toHaveLength(1);
      expect(events[0].properties).toMatchObject(properties);
    });
  });

  describe('User Tracking', () => {
    it('should set user information', () => {
      const userId = 'user123';
      const properties = { email: 'test@example.com', plan: 'premium' };

      monitoringService.setUser(userId, properties);

      const currentUser = monitoringService.getCurrentUser();
      expect(currentUser).toEqual({ id: userId, properties });
    });
  });

  describe('Transactions', () => {
    it('should create and finish transactions', () => {
      const name = 'message_send';
      const operation = 'api_call';

      const transaction = monitoringService.startTransaction(name, operation);
      expect(transaction.name).toBe(name);
      expect(transaction.operation).toBe(operation);
      expect(transaction.startTime).toBeGreaterThan(0);

      transaction.setStatus('ok');
      transaction.setMetadata({ messageId: '123' });
      transaction.finish();

      expect(transaction.status).toBe('ok');
      expect(transaction.metadata).toMatchObject({ messageId: '123' });
      expect(transaction.endTime).toBeGreaterThan(transaction.startTime);
    });

    it('should track transaction duration as metric', () => {
      const transaction = monitoringService.startTransaction(
        'test_transaction',
        'test'
      );

      // Simulate some processing time
      vi.advanceTimersByTime(100);

      transaction.finish();

      const metrics = monitoringService.getMetrics({
        name: 'transaction.duration',
      });
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].tags).toMatchObject({
        name: 'test_transaction',
        operation: 'test',
      });
    });
  });

  describe('Error Tracking', () => {
    it('should capture exceptions', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent' };

      monitoringService.captureException(error, context);

      const metrics = monitoringService.getMetrics({ name: 'error.count' });
      expect(metrics).toHaveLength(1);
      expect(metrics[0].tags).toMatchObject({
        type: error.name,
        message: error.message,
        ...context,
      });
    });

    it('should capture messages with different levels', () => {
      const message = 'Test warning message';
      const level = 'warning';
      const context = { category: 'validation' };

      monitoringService.captureMessage(message, level, context);

      const metrics = monitoringService.getMetrics({ name: 'message.warning' });
      expect(metrics).toHaveLength(1);
    });
  });

  describe('Core Web Vitals', () => {
    it('should collect Core Web Vitals', async () => {
      const vitals = await monitoringService.getCoreWebVitals();

      expect(vitals).toHaveProperty('lcp');
      expect(vitals).toHaveProperty('fid');
      expect(vitals).toHaveProperty('cls');
      expect(vitals).toHaveProperty('ttfb');
      expect(vitals).toHaveProperty('fcp');
    });
  });

  describe('Metrics Filtering', () => {
    beforeEach(() => {
      // Add some test metrics
      monitoringService.trackCustomMetric('test.metric1', 10, {
        category: 'A',
      });
      monitoringService.trackCustomMetric('test.metric2', 20, {
        category: 'B',
      });
      monitoringService.trackCustomMetric('different.metric', 30, {
        category: 'A',
      });
    });

    it('should filter metrics by name', () => {
      const metrics = monitoringService.getMetrics({ name: 'test' });
      expect(metrics).toHaveLength(2);
      expect(metrics.every(m => m.name.includes('test'))).toBe(true);
    });

    it('should filter metrics by time range', () => {
      const timeRange = 1000; // 1 second
      const metrics = monitoringService.getMetrics({ timeRange });

      // All metrics should be within the time range since they were just created
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.every(m => Date.now() - m.timestamp <= timeRange)).toBe(
        true
      );
    });
  });

  describe('Health Monitoring', () => {
    it('should report monitoring health status', () => {
      const health = monitoringService.getMonitoringHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('metrics');
      expect(health.metrics).toHaveProperty('totalMetrics');
      expect(health.metrics).toHaveProperty('totalEvents');
      expect(health.metrics).toHaveProperty('recentErrors');
      expect(health.metrics).toHaveProperty('avgResponseTime');

      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });

    it('should report degraded status with many errors', () => {
      // Generate many error metrics
      for (let i = 0; i < 15; i++) {
        monitoringService.trackCustomMetric('error.count', 1);
      }

      const health = monitoringService.getMonitoringHealth();
      expect(['degraded', 'unhealthy']).toContain(health.status);
    });
  });

  describe('External Integration', () => {
    it('should handle missing external APM services gracefully', () => {
      // Ensure no external services are available
      delete (window as any).DD_RUM;
      delete (window as any).Sentry;

      expect(() => {
        monitoringService.trackCustomMetric('test.metric', 1);
      }).not.toThrow();
    });

    it('should send to external services when available', () => {
      const mockAddAction = vi.fn();
      const mockAddBreadcrumb = vi.fn();

      (window as any).DD_RUM = { addAction: mockAddAction };
      (window as any).Sentry = { addBreadcrumb: mockAddBreadcrumb };

      monitoringService.trackCustomMetric('test.metric', 1);

      expect(mockAddAction).toHaveBeenCalled();
      expect(mockAddBreadcrumb).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should limit metrics storage to prevent memory leaks', () => {
      const initialCount = monitoringService.getMetrics().length;

      // Add more metrics than the limit
      for (let i = 0; i < 1100; i++) {
        monitoringService.trackCustomMetric(`test.metric${i}`, i);
      }

      const finalCount = monitoringService.getMetrics().length;
      expect(finalCount).toBeLessThanOrEqual(1000 + initialCount);
    });

    it('should limit events storage to prevent memory leaks', () => {
      const initialCount = monitoringService.getEvents().length;

      // Add more events than the limit
      for (let i = 0; i < 600; i++) {
        monitoringService.trackBusinessEvent(`test.event${i}`, { value: i });
      }

      const finalCount = monitoringService.getEvents().length;
      expect(finalCount).toBeLessThanOrEqual(500 + initialCount);
    });
  });

  describe('Performance Wrapper', () => {
    it('should wrap functions with monitoring', async () => {
      const testFunction = vi.fn().mockResolvedValue('success');
      const wrappedFunction = monitoringService.withMonitoring(
        testFunction,
        'test_function',
        'async_operation'
      );

      const result = await wrappedFunction('arg1', 'arg2');

      expect(result).toBe('success');
      expect(testFunction).toHaveBeenCalledWith('arg1', 'arg2');

      // Should have created a transaction metric
      const metrics = monitoringService.getMetrics({
        name: 'transaction.duration',
      });
      expect(metrics.some(m => m.tags?.name === 'test_function')).toBe(true);
    });

    it('should handle function errors and track them', async () => {
      const error = new Error('Test error');
      const testFunction = vi.fn().mockRejectedValue(error);
      const wrappedFunction = monitoringService.withMonitoring(
        testFunction,
        'failing_function'
      );

      await expect(wrappedFunction()).rejects.toThrow('Test error');

      // Should have tracked the error
      const metrics = monitoringService.getMetrics({
        name: 'transaction.duration',
      });
      const errorTransaction = metrics.find(
        m => m.tags?.name === 'failing_function' && m.tags?.status === 'error'
      );
      expect(errorTransaction).toBeDefined();
    });
  });
});
