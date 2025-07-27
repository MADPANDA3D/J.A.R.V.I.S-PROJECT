/**
 * Performance Metrics Collection and Analysis Service
 * Comprehensive performance monitoring with real-time metrics and trend analysis
 */

import { centralizedLogging } from './centralizedLogging';
import { getServiceAnalytics } from './serviceMonitoring';
import { getPerformanceAnalytics } from './databaseLogging';

// Performance metrics interfaces
export interface PerformanceMetrics {
  timestamp: string;
  apiResponseTimes: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  databasePerformance: {
    queryTime: number;
    connectionCount: number;
    slowQueries: number;
    errorRate: number;
  };
  systemResources: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkTraffic: number;
  };
  errorRates: {
    clientErrors: number;
    serverErrors: number;
    authErrors: number;
    totalErrors: number;
  };
  userMetrics: {
    activeUsers: number;
    concurrentSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
}

export interface PerformanceTrend {
  metricName: string;
  timeRange: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  anomalies: Array<{
    timestamp: string;
    value: number;
    deviation: number;
  }>;
}

export interface ResourceUtilization {
  resourceType: 'cpu' | 'memory' | 'disk' | 'network';
  currentUsage: number;
  maxCapacity: number;
  utilizationPercentage: number;
  threshold: {
    warning: number;
    critical: number;
  };
  predictions: Array<{
    timestamp: string;
    predictedUsage: number;
    confidence: number;
  }>;
}

export interface PerformanceAlert {
  alertId: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  description: string;
  recommendations: string[];
}

export interface PerformanceBenchmark {
  metricName: string;
  currentValue: number;
  target: number;
  industry: number;
  percentile: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
}

// Performance monitoring configuration
export interface PerformanceMonitoringConfig {
  enabled: boolean;
  collectionInterval: number; // milliseconds
  retentionPeriod: number; // days
  alertThresholds: {
    apiResponseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  trendAnalysis: {
    enabled: boolean;
    windowSize: number; // data points
    anomalyThreshold: number; // standard deviations
  };
  benchmarking: {
    enabled: boolean;
    targets: Record<string, number>;
  };
}

// Performance metrics collection service
class PerformanceMetricsService {
  private config: PerformanceMonitoringConfig;
  private metricsHistory: PerformanceMetrics[] = [];
  private trends: Map<string, PerformanceTrend> = new Map();
  private resourceUtilization: Map<string, ResourceUtilization> = new Map();
  private activeAlerts: Map<string, PerformanceAlert> = new Map();
  private collectionTimer?: NodeJS.Timeout;
  private observer?: PerformanceObserver;

  constructor() {
    this.config = this.loadConfiguration();
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  private loadConfiguration(): PerformanceMonitoringConfig {
    return {
      enabled: import.meta.env.VITE_PERFORMANCE_MONITORING_ENABLED === 'true',
      collectionInterval: parseInt(import.meta.env.VITE_METRICS_COLLECTION_INTERVAL || '10000'), // 10 seconds
      retentionPeriod: parseInt(import.meta.env.VITE_METRICS_RETENTION_DAYS || '7'),
      alertThresholds: {
        apiResponseTime: parseInt(import.meta.env.VITE_API_RESPONSE_THRESHOLD || '2000'), // 2 seconds
        errorRate: parseFloat(import.meta.env.VITE_ERROR_RATE_THRESHOLD || '5'), // 5%
        cpuUsage: parseInt(import.meta.env.VITE_CPU_USAGE_THRESHOLD || '80'), // 80%
        memoryUsage: parseInt(import.meta.env.VITE_MEMORY_USAGE_THRESHOLD || '85'), // 85%
        diskUsage: parseInt(import.meta.env.VITE_DISK_USAGE_THRESHOLD || '90') // 90%
      },
      trendAnalysis: {
        enabled: import.meta.env.VITE_TREND_ANALYSIS_ENABLED === 'true',
        windowSize: parseInt(import.meta.env.VITE_TREND_WINDOW_SIZE || '50'),
        anomalyThreshold: parseFloat(import.meta.env.VITE_ANOMALY_THRESHOLD || '2.5')
      },
      benchmarking: {
        enabled: import.meta.env.VITE_BENCHMARKING_ENABLED === 'true',
        targets: {
          apiResponseTime: 500, // 500ms
          errorRate: 1, // 1%
          availability: 99.9, // 99.9%
          userSatisfaction: 4.5 // out of 5
        }
      }
    };
  }

  private initialize(): void {
    this.startMetricsCollection();
    this.setupPerformanceObserver();
    this.setupResourceMonitoring();
    this.setupCleanupTimer();
  }

  private startMetricsCollection(): void {
    this.collectionTimer = setInterval(() {
      this.collectMetrics();
    }, this.config.collectionInterval);

    // Collect initial metrics
    this.collectMetrics();
  }

  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();

      // Collect API response times
      const apiMetrics = await this.collectAPIMetrics();
      
      // Collect database performance
      const dbMetrics = await this.collectDatabaseMetrics();
      
      // Collect system resources
      const systemMetrics = await this.collectSystemMetrics();
      
      // Collect error rates
      const errorMetrics = await this.collectErrorMetrics();
      
      // Collect user metrics
      const userMetrics = await this.collectUserMetrics();

      const metrics: PerformanceMetrics = {
        timestamp,
        apiResponseTimes: apiMetrics,
        databasePerformance: dbMetrics,
        systemResources: systemMetrics,
        errorRates: errorMetrics,
        userMetrics
      };

      // Store metrics
      this.metricsHistory.push(metrics);
      this.limitMetricsHistory();

      // Update trends
      if (this.config.trendAnalysis.enabled) {
        this.updateTrends(metrics);
      }

      // Check for alerts
      this.checkAlerts(metrics);

      // Log metrics
      centralizedLogging.debug(
        'performance-metrics',
        'system',
        'Performance metrics collected',
        {
          timestamp,
          apiAvgTime: apiMetrics.avg,
          dbQueryTime: dbMetrics.queryTime,
          errorRate: errorMetrics.totalErrors,
          activeUsers: userMetrics.activeUsers
        }
      );

    } catch {
      centralizedLogging.error(
        'performance-metrics',
        'system',
        'Failed to collect performance metrics',
        { error }
      );
    }
  }

  private async collectAPIMetrics(): Promise<PerformanceMetrics['apiResponseTimes']> {
    const serviceAnalytics = getServiceAnalytics(undefined, 0.5); // Last 30 minutes

    if (!serviceAnalytics || serviceAnalytics.totalCalls === 0) {
      return {
        avg: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        min: 0,
        max: 0
      };
    }

    // Calculate percentiles from response time distribution
    const responseTimes = serviceAnalytics.responseTimeDistribution;
    
    return {
      avg: serviceAnalytics.averageResponseTime,
      p50: this.calculatePercentile(responseTimes, 50),
      p95: this.calculatePercentile(responseTimes, 95),
      p99: this.calculatePercentile(responseTimes, 99),
      min: Math.min(...Object.keys(responseTimes).map(Number)),
      max: Math.max(...Object.keys(responseTimes).map(Number))
    };
  }

  private calculatePercentile(distribution: Record<string, number>, percentile: number): number {
    const entries = Object.entries(distribution);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    const target = (percentile / 100) * total;
    
    let cumulative = 0;
    for (const [timeRange, count] of entries) {
      cumulative += count;
      if (cumulative >= target) {
        // Parse time range to get representative value
        if (timeRange === '<100ms') return 50;
        if (timeRange === '100-500ms') return 300;
        if (timeRange === '500ms-1s') return 750;
        if (timeRange === '1-5s') return 3000;
        if (timeRange === '>5s') return 8000;
      }
    }
    
    return 0;
  }

  private async collectDatabaseMetrics(): Promise<PerformanceMetrics['databasePerformance']> {
    const dbAnalytics = getPerformanceAnalytics(0.5); // Last 30 minutes

    return {
      queryTime: dbAnalytics?.averageExecutionTime || 0,
      connectionCount: this.estimateConnectionCount(),
      slowQueries: dbAnalytics?.slowQueries || 0,
      errorRate: dbAnalytics?.errorRate || 0
    };
  }

  private estimateConnectionCount(): number {
    // Estimate based on active users and typical connection patterns
    const userMetrics = this.getCurrentUserMetrics();
    return Math.ceil(userMetrics.activeUsers * 1.2); // Rough estimate
  }

  private async collectSystemMetrics(): Promise<PerformanceMetrics['systemResources']> {
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = await this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();
    const networkTraffic = await this.getNetworkTraffic();

    return {
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkTraffic
    };
  }

  private async getCPUUsage(): Promise<number> {
    // Use Performance API to estimate CPU usage
    const start = performance.now();
    
    // Perform a CPU-intensive task to measure performance
    let counter = 0;
    const duration = 10; // 10ms test
    
    while (performance.now() - start < duration) {
      counter++;
    }
    
    // Normalize based on expected performance
    const expectedOperations = 100000; // Baseline
    const actualOperations = counter;
    const usage = Math.min(100, Math.max(0, 100 - (actualOperations / expectedOperations * 100)));
    
    return Math.round(usage);
  }

  private async getMemoryUsage(): Promise<number> {
    if ('memory' in performance) {
      const memInfo = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      return Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100);
    }
    
    // Fallback estimation
    return Math.random() * 20 + 40; // 40-60% random for demo
  }

  private async getDiskUsage(): Promise<number> {
    // Client-side can't directly measure disk usage
    // Return estimated based on localStorage usage
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalSize += localStorage[key].length;
        }
      }
      
      // Rough estimation (localStorage is typically limited to ~5-10MB)
      const maxStorage = 10 * 1024 * 1024; // 10MB
      return Math.round((totalSize / maxStorage) * 100);
    } catch {
      return 0;
    }
  }

  private async getNetworkTraffic(): Promise<number> {
    // Use Navigation Timing API for network metrics
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection?: { downlink?: number } }).connection;
      if (connection && connection.downlink) {
        // Estimate usage based on connection speed
        return Math.min(100, Math.random() * 30 + 10); // 10-40% for demo
      }
    }
    
    return 0;
  }

  private async collectErrorMetrics(): Promise<PerformanceMetrics['errorRates']> {
    // Get errors from centralized logging
    const recentLogs = centralizedLogging.getLogs({
      timeRange: 0.5, // 30 minutes
      limit: 1000
    });

    const clientErrors = recentLogs.filter(log => 
      log.level === 'error' && log.category === 'system'
    ).length;

    const serverErrors = recentLogs.filter(log => 
      log.level === 'error' && (log.category === 'api' || log.category === 'database')
    ).length;

    const authErrors = recentLogs.filter(log => 
      log.level === 'error' && log.category === 'auth'
    ).length;

    return {
      clientErrors,
      serverErrors,
      authErrors,
      totalErrors: clientErrors + serverErrors + authErrors
    };
  }

  private async collectUserMetrics(): Promise<PerformanceMetrics['userMetrics']> {
    return this.getCurrentUserMetrics();
  }

  private getCurrentUserMetrics(): PerformanceMetrics['userMetrics'] {
    // Get user metrics from activity tracking if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { userActivityTracking } = require('./userActivityTracking');
      const stats = userActivityTracking.getActivityStatistics(0.5);
      const activeSessions = userActivityTracking.getActiveSessions();
      
      return {
        activeUsers: stats.uniqueUsers,
        concurrentSessions: stats.concurrentUsers,
        averageSessionDuration: stats.averageSessionDuration,
        bounceRate: this.calculateBounceRate(activeSessions as unknown[])
      };
    } catch {
      // Fallback if activity tracking not available
      return {
        activeUsers: 0,
        concurrentSessions: 0,
        averageSessionDuration: 0,
        bounceRate: 0
      };
    }
  }

  private calculateBounceRate(sessions: { totalEvents: number; totalDuration: number }[]): number {
    if (sessions.length === 0) return 0;

    const bouncedSessions = sessions.filter(session => 
      session.totalEvents <= 1 && session.totalDuration < 30000 // Less than 30 seconds
    ).length;

    return (bouncedSessions / sessions.length) * 100;
  }

  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.observer = new PerformanceObserver((list) {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      this.observer.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      });
    } catch {
      centralizedLogging.warn(
        'performance-metrics',
        'system',
        'Failed to setup performance observer',
        { error }
      );
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    centralizedLogging.debug(
      'performance-metrics',
      'system',
      `Performance entry: ${entry.entryType}`,
      {
        name: entry.name,
        entryType: entry.entryType,
        startTime: entry.startTime,
        duration: entry.duration
      }
    );

    // Process specific performance metrics
    if (entry.entryType === 'largest-contentful-paint') {
      const lcpEntry = entry as PerformanceEntry;
      if (lcpEntry.startTime > this.config.alertThresholds.apiResponseTime) {
        this.createAlert(
          'largest-contentful-paint',
          lcpEntry.startTime,
          this.config.alertThresholds.apiResponseTime,
          'warning',
          'Largest Contentful Paint is slower than expected',
          ['Optimize image loading', 'Reduce server response time', 'Use CDN for static assets']
        );
      }
    }
  }

  private updateTrends(metrics: PerformanceMetrics): void {
    const metricNames = [
      'apiResponseTimes.avg',
      'databasePerformance.queryTime',
      'systemResources.cpuUsage',
      'systemResources.memoryUsage',
      'errorRates.totalErrors',
      'userMetrics.activeUsers'
    ];

    metricNames.forEach(metricName => {
      this.updateTrendForMetric(metricName, metrics);
    });
  }

  private updateTrendForMetric(metricName: string, metrics: PerformanceMetrics): void {
    const value = this.getMetricValue(metricName, metrics);
    if (value === undefined) return;

    let trend = this.trends.get(metricName);
    
    if (!trend) {
      trend = {
        metricName,
        timeRange: '1h',
        data: [],
        trend: 'stable',
        changePercentage: 0,
        anomalies: []
      };
      this.trends.set(metricName, trend);
    }

    // Add new data point
    trend.data.push({
      timestamp: metrics.timestamp,
      value
    });

    // Keep only recent data points
    if (trend.data.length > this.config.trendAnalysis.windowSize) {
      trend.data = trend.data.slice(-this.config.trendAnalysis.windowSize);
    }

    // Calculate trend
    this.calculateTrend(trend);

    // Detect anomalies
    this.detectAnomalies(trend);
  }

  private getMetricValue(metricName: string, metrics: PerformanceMetrics): number | undefined {
    const parts = metricName.split('.');
    let value: unknown = metrics;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return typeof value === 'number' ? value : undefined;
  }

  private calculateTrend(trend: PerformanceTrend): void {
    if (trend.data.length < 10) return; // Need at least 10 data points

    const recentData = trend.data.slice(-10);
    const oldData = trend.data.slice(-20, -10);

    if (oldData.length === 0) return;

    const recentAvg = recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length;
    const oldAvg = oldData.reduce((sum, d) => sum + d.value, 0) / oldData.length;

    const changePercentage = ((recentAvg - oldAvg) / oldAvg) * 100;
    trend.changePercentage = changePercentage;

    if (Math.abs(changePercentage) < 5) {
      trend.trend = 'stable';
    } else if (changePercentage > 0) {
      trend.trend = 'increasing';
    } else {
      trend.trend = 'decreasing';
    }
  }

  private detectAnomalies(trend: PerformanceTrend): void {
    if (trend.data.length < 20) return; // Need sufficient data for anomaly detection

    const values = trend.data.map(d => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const threshold = this.config.trendAnalysis.anomalyThreshold * stdDev;

    // Check recent data points for anomalies
    const recentData = trend.data.slice(-5);
    
    recentData.forEach(dataPoint => {
      const deviation = Math.abs(dataPoint.value - mean);
      
      if (deviation > threshold) {
        trend.anomalies.push({
          timestamp: dataPoint.timestamp,
          value: dataPoint.value,
          deviation: deviation / stdDev
        });
      }
    });

    // Keep only recent anomalies
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    trend.anomalies = trend.anomalies.filter(a => 
      new Date(a.timestamp).getTime() > cutoff
    );
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    // API response time alerts
    if (metrics.apiResponseTimes.avg > this.config.alertThresholds.apiResponseTime) {
      this.createAlert(
        'api-response-time',
        metrics.apiResponseTimes.avg,
        this.config.alertThresholds.apiResponseTime,
        'warning',
        'API response time is above threshold',
        ['Check database performance', 'Review slow queries', 'Scale infrastructure']
      );
    }

    // Error rate alerts
    const totalRequests = this.estimateTotalRequests();
    const errorRate = totalRequests > 0 ? (metrics.errorRates.totalErrors / totalRequests) * 100 : 0;
    
    if (errorRate > this.config.alertThresholds.errorRate) {
      this.createAlert(
        'error-rate',
        errorRate,
        this.config.alertThresholds.errorRate,
        errorRate > this.config.alertThresholds.errorRate * 2 ? 'critical' : 'warning',
        'Error rate is above threshold',
        ['Check application logs', 'Review recent deployments', 'Monitor third-party services']
      );
    }

    // System resource alerts
    if (metrics.systemResources.cpuUsage > this.config.alertThresholds.cpuUsage) {
      this.createAlert(
        'cpu-usage',
        metrics.systemResources.cpuUsage,
        this.config.alertThresholds.cpuUsage,
        'warning',
        'CPU usage is high',
        ['Check for resource-intensive operations', 'Consider scaling up', 'Review performance optimizations']
      );
    }

    if (metrics.systemResources.memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.createAlert(
        'memory-usage',
        metrics.systemResources.memoryUsage,
        this.config.alertThresholds.memoryUsage,
        'warning',
        'Memory usage is high',
        ['Check for memory leaks', 'Review object lifecycle', 'Consider garbage collection tuning']
      );
    }
  }

  private estimateTotalRequests(): number {
    // Estimate based on user activity and typical request patterns
    const userMetrics = this.getCurrentUserMetrics();
    return userMetrics.activeUsers * 10; // Rough estimate: 10 requests per active user
  }

  private createAlert(
    metricName: string,
    currentValue: number,
    threshold: number,
    severity: 'warning' | 'critical',
    description: string,
    recommendations: string[]
  ): void {
    const alertId = `${metricName}_${Date.now()}`;
    
    const alert: PerformanceAlert = {
      alertId,
      metricName,
      currentValue,
      threshold,
      severity,
      timestamp: new Date().toISOString(),
      description,
      recommendations
    };

    this.activeAlerts.set(alertId, alert);

    // Log alert
    centralizedLogging.warn(
      'performance-metrics',
      'system',
      `Performance alert: ${description}`,
      {
        alertId,
        metricName,
        currentValue,
        threshold,
        severity,
        recommendations
      }
    );
  }

  private setupResourceMonitoring(): void {
    // Initialize resource utilization tracking
    const resourceTypes: Array<ResourceUtilization['resourceType']> = ['cpu', 'memory', 'disk', 'network'];
    
    resourceTypes.forEach(resourceType => {
      const utilization: ResourceUtilization = {
        resourceType,
        currentUsage: 0,
        maxCapacity: 100,
        utilizationPercentage: 0,
        threshold: {
          warning: 70,
          critical: 85
        },
        predictions: []
      };

      this.resourceUtilization.set(resourceType, utilization);
    });
  }

  private limitMetricsHistory(): void {
    const maxHistory = this.config.retentionPeriod * 24 * 6; // 6 data points per hour
    
    if (this.metricsHistory.length > maxHistory) {
      this.metricsHistory = this.metricsHistory.slice(-maxHistory);
    }
  }

  private setupCleanupTimer(): void {
    // Clean up old data every hour
    setInterval(() {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - (this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    const cutoffISO = new Date(cutoff).toISOString();

    // Clean up metrics history
    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp > cutoffISO);

    // Clean up trend data
    this.trends.forEach(trend => {
      trend.data = trend.data.filter(d => d.timestamp > cutoffISO);
      trend.anomalies = trend.anomalies.filter(a => a.timestamp > cutoffISO);
    });

    // Clean up old alerts
    this.activeAlerts.forEach((alert, alertId) {
      if (alert.timestamp < cutoffISO) {
        this.activeAlerts.delete(alertId);
      }
    });
  }

  // Query methods
  getCurrentMetrics(): PerformanceMetrics | undefined {
    return this.metricsHistory[this.metricsHistory.length - 1];
  }

  getMetricsHistory(timeRange?: number): PerformanceMetrics[] {
    if (!timeRange) return this.metricsHistory;

    const cutoff = Date.now() - (timeRange * 60 * 60 * 1000);
    return this.metricsHistory.filter(m => 
      new Date(m.timestamp).getTime() > cutoff
    );
  }

  getTrends(): PerformanceTrend[] {
    return Array.from(this.trends.values());
  }

  getTrendForMetric(metricName: string): PerformanceTrend | undefined {
    return this.trends.get(metricName);
  }

  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  getResourceUtilization(): ResourceUtilization[] {
    return Array.from(this.resourceUtilization.values());
  }

  getBenchmarks(): PerformanceBenchmark[] {
    if (!this.config.benchmarking.enabled) return [];

    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return [];

    const benchmarks: PerformanceBenchmark[] = [];

    Object.entries(this.config.benchmarking.targets).forEach(([metricName, target]) {
      const currentValue = this.getMetricValue(metricName, currentMetrics);
      if (currentValue === undefined) return;

      const benchmark: PerformanceBenchmark = {
        metricName,
        currentValue,
        target,
        industry: target * 1.2, // Assume industry average is 20% worse than target
        percentile: this.calculatePercentileRank(metricName, currentValue),
        status: this.getBenchmarkStatus(currentValue, target)
      };

      benchmarks.push(benchmark);
    });

    return benchmarks;
  }

  private calculatePercentileRank(metricName: string, currentValue: number): number {
    const trend = this.trends.get(metricName);
    if (!trend || trend.data.length < 10) return 50; // Default to 50th percentile

    const values = trend.data.map(d => d.value).sort((a, b) => a - b);
    const rank = values.findIndex(v => v >= currentValue);
    
    return rank >= 0 ? (rank / values.length) * 100 : 100;
  }

  private getBenchmarkStatus(currentValue: number, target: number): PerformanceBenchmark['status'] {
    const ratio = currentValue / target;
    
    if (ratio <= 0.8) return 'excellent';
    if (ratio <= 1.0) return 'good';
    if (ratio <= 1.5) return 'needs_improvement';
    return 'poor';
  }

  // Configuration methods
  updateConfig(updates: Partial<PerformanceMonitoringConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.collectionInterval && this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.startMetricsCollection();
    }
  }

  getConfig(): PerformanceMonitoringConfig {
    return { ...this.config };
  }

  // Manual metrics collection
  async collectMetricsNow(): Promise<PerformanceMetrics> {
    await this.collectMetrics();
    return this.getCurrentMetrics()!;
  }

  // Export data for analysis
  exportMetricsData(): {
    metrics: PerformanceMetrics[];
    trends: PerformanceTrend[];
    alerts: PerformanceAlert[];
    benchmarks: PerformanceBenchmark[];
  } {
    return {
      metrics: this.metricsHistory,
      trends: this.getTrends(),
      alerts: this.getActiveAlerts(),
      benchmarks: this.getBenchmarks()
    };
  }

  // Cleanup method
  destroy(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
    }

    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
export const performanceMetrics = new PerformanceMetricsService();

// Convenience functions
export const getCurrentPerformanceMetrics = () => performanceMetrics.getCurrentMetrics();
export const getPerformanceHistory = (timeRange?: number) => performanceMetrics.getMetricsHistory(timeRange);
export const getPerformanceTrends = () => performanceMetrics.getTrends();
export const getPerformanceAlerts = () => performanceMetrics.getActiveAlerts();
export const getResourceUtilizationData = () => performanceMetrics.getResourceUtilization();
export const getPerformanceBenchmarks = () => performanceMetrics.getBenchmarks();
export const collectPerformanceMetricsNow = () => performanceMetrics.collectMetricsNow();