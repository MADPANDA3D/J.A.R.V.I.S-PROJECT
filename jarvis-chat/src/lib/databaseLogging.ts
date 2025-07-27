/**
 * Database Query Logging and Performance Tracking
 * Comprehensive logging for Supabase database operations with performance metrics
 */

import { addBreadcrumb } from './errorTracking';

// Database logging interfaces
export interface DatabaseQueryLog {
  queryId: string;
  correlationId: string;
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc' | 'auth';
  query: string; // Sanitized query
  parameters?: Record<string, unknown>; // Sanitized parameters
  executionTime: number;
  rowCount?: number;
  statusCode: number;
  success: boolean;
  error?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface DatabaseConnectionLog {
  connectionId: string;
  event: 'connect' | 'disconnect' | 'error' | 'timeout';
  timestamp: string;
  duration?: number;
  error?: string;
  poolStats?: {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  };
}

export interface QueryPerformanceMetrics {
  queryId: string;
  table: string;
  operation: string;
  executionTime: number;
  timestamp: string;
  slowQuery: boolean;
  queryPlan?: string;
  indexUsage?: string[];
  resourceUsage?: {
    cpuTime: number;
    memoryUsage: number;
    diskReads: number;
  };
}

// Database logging service
class DatabaseLoggingService {
  private queryLogs: DatabaseQueryLog[] = [];
  private connectionLogs: DatabaseConnectionLog[] = [];
  private performanceMetrics: QueryPerformanceMetrics[] = [];
  private maxLogs = 1000;
  private slowQueryThreshold = 1000; // 1 second
  private correlationIdGenerator = () => `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  constructor() {
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring(): void {
    // Clean up old logs every 5 minutes
    setInterval(() {
      this.cleanupOldLogs();
    }, 5 * 60 * 1000);
  }

  private cleanupOldLogs(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    const cutoffISO = new Date(cutoffTime).toISOString();

    this.queryLogs = this.queryLogs.filter(log => log.timestamp > cutoffISO);
    this.connectionLogs = this.connectionLogs.filter(log => log.timestamp > cutoffISO);
    this.performanceMetrics = this.performanceMetrics.filter(metric => metric.timestamp > cutoffISO);

    // Also enforce max limits
    if (this.queryLogs.length > this.maxLogs) {
      this.queryLogs = this.queryLogs.slice(-this.maxLogs);
    }
    if (this.connectionLogs.length > this.maxLogs) {
      this.connectionLogs = this.connectionLogs.slice(-this.maxLogs);
    }
    if (this.performanceMetrics.length > this.maxLogs) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxLogs);
    }
  }

  // Generate correlation ID for request tracking
  generateCorrelationId(): string {
    return this.correlationIdGenerator();
  }

  // Log database query with performance metrics
  logDatabaseQuery(log: Omit<DatabaseQueryLog, 'queryId' | 'timestamp'>): string {
    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queryLog: DatabaseQueryLog = {
      queryId,
      timestamp: new Date().toISOString(),
      ...log
    };

    this.queryLogs.push(queryLog);

    // Add breadcrumb for query
    addBreadcrumb(
      log.success ? 'info' : 'error',
      'http',
      `Database ${log.operation}: ${log.table}`,
      {
        queryId,
        correlationId: log.correlationId,
        executionTime: log.executionTime,
        success: log.success,
        rowCount: log.rowCount
      }
    );

    // Check if this is a slow query
    if (log.executionTime > this.slowQueryThreshold) {
      this.logSlowQuery(queryLog);
    }

    // Log performance metrics
    this.logQueryPerformance({
      queryId,
      table: log.table,
      operation: log.operation,
      executionTime: log.executionTime,
      timestamp: queryLog.timestamp,
      slowQuery: log.executionTime > this.slowQueryThreshold
    });

    // Send to external logging if configured
    this.sendToExternalLogging('database_query', queryLog);

    return queryId;
  }

  // Log connection events
  logConnectionEvent(log: Omit<DatabaseConnectionLog, 'connectionId' | 'timestamp'>): string {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const connectionLog: DatabaseConnectionLog = {
      connectionId,
      timestamp: new Date().toISOString(),
      ...log
    };

    this.connectionLogs.push(connectionLog);

    // Add breadcrumb for connection events
    addBreadcrumb(
      log.event === 'error' ? 'error' : 'info',
      'info',
      `Database connection: ${log.event}`,
      {
        connectionId,
        duration: log.duration,
        poolStats: log.poolStats
      }
    );

    this.sendToExternalLogging('database_connection', connectionLog);

    return connectionId;
  }

  // Log slow query with additional analysis
  private logSlowQuery(queryLog: DatabaseQueryLog): void {
    addBreadcrumb(
      'warning',
      'http',
      `Slow query detected: ${queryLog.table} (${queryLog.executionTime}ms)`,
      {
        queryId: queryLog.queryId,
        operation: queryLog.operation,
        table: queryLog.table,
        executionTime: queryLog.executionTime,
        threshold: this.slowQueryThreshold
      }
    );

    // Additional slow query analysis could be added here
    console.warn(`🐌 Slow Query Detected:`, {
      queryId: queryLog.queryId,
      table: queryLog.table,
      operation: queryLog.operation,
      executionTime: queryLog.executionTime,
      query: queryLog.query
    });
  }

  // Log query performance metrics
  private logQueryPerformance(metrics: QueryPerformanceMetrics): void {
    this.performanceMetrics.push(metrics);

    // Send performance data to monitoring system
    this.sendToExternalLogging('query_performance', metrics);
  }

  // Sanitize query parameters to remove sensitive data
  sanitizeParameters(params: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 1000) {
        // Truncate very long strings
        sanitized[key] = value.substring(0, 1000) + '... [TRUNCATED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Sanitize SQL query to remove sensitive data
  sanitizeQuery(query: string): string {
    // Remove potential password/token values from queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password = '[REDACTED]'")
      .replace(/token\s*=\s*'[^']*'/gi, "token = '[REDACTED]'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret = '[REDACTED]'")
      .replace(/key\s*=\s*'[^']*'/gi, "key = '[REDACTED]'");
  }

  // Get query logs with filtering
  getQueryLogs(filter?: {
    table?: string;
    operation?: string;
    success?: boolean;
    slowQueriesOnly?: boolean;
    timeRange?: number; // hours
    correlationId?: string;
  }): DatabaseQueryLog[] {
    let filtered = this.queryLogs;

    if (filter) {
      if (filter.table) {
        filtered = filtered.filter(log => log.table === filter.table);
      }
      if (filter.operation) {
        filtered = filtered.filter(log => log.operation === filter.operation);
      }
      if (filter.success !== undefined) {
        filtered = filtered.filter(log => log.success === filter.success);
      }
      if (filter.slowQueriesOnly) {
        filtered = filtered.filter(log => log.executionTime > this.slowQueryThreshold);
      }
      if (filter.correlationId) {
        filtered = filtered.filter(log => log.correlationId === filter.correlationId);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        filtered = filtered.filter(log => log.timestamp > cutoff);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get connection logs
  getConnectionLogs(filter?: {
    event?: string;
    timeRange?: number; // hours
  }): DatabaseConnectionLog[] {
    let filtered = this.connectionLogs;

    if (filter) {
      if (filter.event) {
        filtered = filtered.filter(log => log.event === filter.event);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        filtered = filtered.filter(log => log.timestamp > cutoff);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get performance metrics
  getPerformanceMetrics(filter?: {
    table?: string;
    slowQueriesOnly?: boolean;
    timeRange?: number; // hours
  }): QueryPerformanceMetrics[] {
    let filtered = this.performanceMetrics;

    if (filter) {
      if (filter.table) {
        filtered = filtered.filter(metric => metric.table === filter.table);
      }
      if (filter.slowQueriesOnly) {
        filtered = filtered.filter(metric => metric.slowQuery);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        filtered = filtered.filter(metric => metric.timestamp > cutoff);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get performance analytics
  getPerformanceAnalytics(timeRange: number = 24): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    errorRate: number;
    topSlowTables: Array<{ table: string; avgTime: number; count: number }>;
    queryDistribution: Record<string, number>;
  } {
    const cutoff = new Date(Date.now() - (timeRange * 60 * 60 * 1000)).toISOString();
    const recentLogs = this.queryLogs.filter(log => log.timestamp > cutoff);

    const totalQueries = recentLogs.length;
    const totalExecutionTime = recentLogs.reduce((sum, log) => sum + log.executionTime, 0);
    const averageExecutionTime = totalQueries > 0 ? totalExecutionTime / totalQueries : 0;
    const slowQueries = recentLogs.filter(log => log.executionTime > this.slowQueryThreshold).length;
    const errorQueries = recentLogs.filter(log => !log.success).length;
    const errorRate = totalQueries > 0 ? (errorQueries / totalQueries) * 100 : 0;

    // Calculate top slow tables
    const tablePerformance = recentLogs.reduce((acc, log) {
      if (!acc[log.table]) {
        acc[log.table] = { totalTime: 0, count: 0 };
      }
      acc[log.table].totalTime += log.executionTime;
      acc[log.table].count += 1;
      return acc;
    }, {} as Record<string, { totalTime: number; count: number }>);

    const topSlowTables = Object.entries(tablePerformance)
      .map(([table, stats]) => ({
        table,
        avgTime: stats.totalTime / stats.count,
        count: stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    // Calculate query distribution
    const queryDistribution = recentLogs.reduce((acc, log) {
      acc[log.operation] = (acc[log.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      errorRate,
      topSlowTables,
      queryDistribution
    };
  }

  // Send to external logging service
  private async sendToExternalLogging(type: string, data: unknown): Promise<void> {
    try {
      // Send to centralized logging service
      const { sendToCentralizedLogging } = await import('./centralizedLogging');
      await sendToCentralizedLogging(type, data);
    } catch {
      // Fail silently to not break database operations
      console.warn('Failed to send to external logging:', error);
    }
  }

  // Export data for analysis
  exportData(): {
    queryLogs: DatabaseQueryLog[];
    connectionLogs: DatabaseConnectionLog[];
    performanceMetrics: QueryPerformanceMetrics[];
    analytics: ReturnType<typeof this.getPerformanceAnalytics>;
  } {
    return {
      queryLogs: this.queryLogs,
      connectionLogs: this.connectionLogs,
      performanceMetrics: this.performanceMetrics,
      analytics: this.getPerformanceAnalytics()
    };
  }

  // Clear all logs (for testing or maintenance)
  clearLogs(): void {
    this.queryLogs = [];
    this.connectionLogs = [];
    this.performanceMetrics = [];
  }
}

// Singleton instance
export const databaseLogging = new DatabaseLoggingService();

// Utility functions
export const logDatabaseQuery = (log: Omit<DatabaseQueryLog, 'queryId' | 'timestamp'>) =>
  databaseLogging.logDatabaseQuery(log);

export const logConnectionEvent = (log: Omit<DatabaseConnectionLog, 'connectionId' | 'timestamp'>) =>
  databaseLogging.logConnectionEvent(log);

export const generateCorrelationId = () => databaseLogging.generateCorrelationId();

export const getQueryLogs = (filter?: Parameters<typeof databaseLogging.getQueryLogs>[0]) =>
  databaseLogging.getQueryLogs(filter);

export const getConnectionLogs = (filter?: Parameters<typeof databaseLogging.getConnectionLogs>[0]) =>
  databaseLogging.getConnectionLogs(filter);

export const getPerformanceMetrics = (filter?: Parameters<typeof databaseLogging.getPerformanceMetrics>[0]) =>
  databaseLogging.getPerformanceMetrics(filter);

export const getPerformanceAnalytics = (timeRange?: number) =>
  databaseLogging.getPerformanceAnalytics(timeRange);

export const sanitizeParameters = (params: Record<string, unknown>) =>
  databaseLogging.sanitizeParameters(params);

export const sanitizeQuery = (query: string) => databaseLogging.sanitizeQuery(query);