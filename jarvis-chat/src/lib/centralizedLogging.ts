/**
 * Centralized Logging Service
 * Unified logging infrastructure with structured format and external service integration
 */

// Centralized log entry interface
export interface LogEntry {
  logId: string;
  correlationId: string;
  traceId: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  service: string;
  category: 'api' | 'database' | 'auth' | 'webhook' | 'external' | 'system';
  message: string;
  metadata: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  environment: string;
  release?: string;
  fingerprint?: string[];
}

// Log storage and routing configuration
export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  destinations: LogDestination[];
  retentionDays: number;
  batchSize: number;
  flushInterval: number; // milliseconds
  maxRetries: number;
}

export interface LogDestination {
  type: 'console' | 'localStorage' | 'webhook' | 'elasticsearch' | 'custom';
  enabled: boolean;
  config: {
    endpoint?: string;
    apiKey?: string;
    index?: string;
    headers?: Record<string, string>;
    formatter?: (log: LogEntry) => unknown;
  };
}

// Service monitoring log interface
export interface ServiceMonitoringLog {
  serviceId: string;
  serviceName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  error?: string;
  retryCount?: number;
  correlationId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Centralized logging service implementation
class CentralizedLoggingService {
  private logs: LogEntry[] = [];
  private logQueue: LogEntry[] = [];
  private config: LoggingConfig;
  private flushTimer?: NodeJS.Timeout;
  private traceId: string;
  private isProcessing = false;

  constructor() {
    this.traceId = this.generateTraceId();
    this.config = this.loadConfiguration();
    this.startFlushTimer();
    this.setupErrorHandlers();
  }

  private loadConfiguration(): LoggingConfig {
    return {
      enabled: true,
      level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
      retentionDays: parseInt(import.meta.env.VITE_LOG_RETENTION_DAYS || '7'),
      batchSize: parseInt(import.meta.env.VITE_LOG_BATCH_SIZE || '10'),
      flushInterval: parseInt(import.meta.env.VITE_LOG_FLUSH_INTERVAL || '5000'),
      maxRetries: parseInt(import.meta.env.VITE_LOG_MAX_RETRIES || '3'),
      destinations: [
        {
          type: 'console',
          enabled: import.meta.env.DEV || import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true',
          config: {}
        },
        {
          type: 'localStorage',
          enabled: true,
          config: {}
        },
        ...(import.meta.env.VITE_LOG_WEBHOOK_URL ? [{
          type: 'webhook' as const,
          enabled: true,
          config: {
            endpoint: import.meta.env.VITE_LOG_WEBHOOK_URL,
            apiKey: import.meta.env.VITE_LOG_WEBHOOK_KEY,
            headers: import.meta.env.VITE_LOG_WEBHOOK_HEADERS ? 
              JSON.parse(import.meta.env.VITE_LOG_WEBHOOK_HEADERS) : undefined
          }
        }] : []),
        ...(import.meta.env.VITE_ELASTICSEARCH_ENDPOINT ? [{
          type: 'elasticsearch' as const,
          enabled: true,
          config: {
            endpoint: import.meta.env.VITE_ELASTICSEARCH_ENDPOINT,
            apiKey: import.meta.env.VITE_ELASTICSEARCH_API_KEY,
            index: import.meta.env.VITE_ELASTICSEARCH_INDEX || 'jarvis-logs'
          }
        }] : [])
      ]
    };
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandlers(): void {
    // Handle unhandled promise rejections in logging
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.message?.includes('logging')) {
        // Prevent infinite loops in logging system
        console.warn('Logging system error:', event.reason);
        event.preventDefault();
      }
    });
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  // Main logging method
  log = (
    level: LogEntry['level'],
    service: string,
    category: LogEntry['category'],
    message: string,
    metadata: Record<string, unknown> = {},
    correlationId?: string
  ): string => {
    if (!this.config.enabled || !this.shouldLog(level)) {
      return '';
    }

    const logEntry: LogEntry = {
      logId: this.generateLogId(),
      correlationId: correlationId || this.generateCorrelationId(),
      traceId: this.traceId,
      timestamp: new Date().toISOString(),
      level,
      service,
      category,
      message,
      metadata: this.sanitizeMetadata(metadata),
      userId: this.extractUserId(metadata),
      sessionId: this.extractSessionId(metadata),
      environment: import.meta.env.MODE || 'development',
      release: import.meta.env.VITE_APP_VERSION,
      fingerprint: this.generateFingerprint(message, metadata)
    };

    // Add to queue for batched processing
    this.logQueue.push(logEntry);

    // Also store in memory for immediate access
    this.logs.push(logEntry);
    this.limitInMemoryLogs();

    // Flush immediately for critical errors
    if (level === 'critical' || level === 'error') {
      this.flushLogs();
    }

    return logEntry.logId;
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }

  private extractUserId(metadata: Record<string, unknown>): string | undefined {
    return metadata.userId as string || metadata.user?.id as string;
  }

  private extractSessionId(metadata: Record<string, unknown>): string | undefined {
    return metadata.sessionId as string || metadata.session?.id as string;
  }

  private generateFingerprint(message: string, metadata: Record<string, unknown>): string[] {
    const fingerprint = [message.substring(0, 100)];
    
    if (metadata.service) {
      fingerprint.push(`service:${metadata.service}`);
    }
    
    if (metadata.endpoint) {
      fingerprint.push(`endpoint:${metadata.endpoint}`);
    }
    
    if (metadata.table) {
      fingerprint.push(`table:${metadata.table}`);
    }
    
    return fingerprint;
  }

  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...metadata };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential', 'apikey'];

    const sanitizeValue = (value: unknown): unknown => {
      if (typeof value === 'string') {
        // Check if the key or value contains sensitive data
        const lowerValue = value.toLowerCase();
        if (sensitiveKeys.some(key => lowerValue.includes(key))) {
          return '[REDACTED]';
        }
        // Truncate very long strings
        return value.length > 2000 ? value.substring(0, 2000) + '... [TRUNCATED]' : value;
      } else if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        const sanitizedObj: Record<string, unknown> = {};
        
        Object.entries(obj).forEach(([key, val]) => {
          const lowerKey = key.toLowerCase();
          if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
            sanitizedObj[key] = '[REDACTED]';
          } else {
            sanitizedObj[key] = sanitizeValue(val);
          }
        });
        
        return sanitizedObj;
      }
      
      return value;
    };

    Object.entries(sanitized).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeValue(value);
      }
    });

    return sanitized;
  }

  private limitInMemoryLogs(): void {
    const maxLogs = 1000;
    if (this.logs.length > maxLogs) {
      this.logs = this.logs.slice(-maxLogs);
    }
  }

  // Flush queued logs to destinations
  private async flushLogs(): Promise<void>  {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batch = this.logQueue.splice(0, this.config.batchSize);

    try {
      await Promise.allSettled(
        this.config.destinations.map(destination =>
          this.sendToDestination(destination, batch)
        )
      );
    } catch (error) {
      console.warn('Error flushing logs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendToDestination(destination: LogDestination, logs: LogEntry[]): Promise<void>  {
    if (!destination.enabled) return;

    let retries = 0;
    const maxRetries = this.config.maxRetries;

    while (retries <= maxRetries) {
      try {
        switch (destination.type) {
          case 'console':
            this.sendToConsole(logs);
            break;
          case 'localStorage':
            this.sendToLocalStorage(logs);
            break;
          case 'webhook':
            await this.sendToWebhook(destination, logs);
            break;
          case 'elasticsearch':
            await this.sendToElasticsearch(destination, logs);
            break;
          case 'custom':
            if (destination.config.formatter) {
              const formatted = logs.map(destination.config.formatter);
              console.log('Custom formatted logs:', formatted);
            }
            break;
        }
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          console.warn(`Failed to send logs to ${destination.type} after ${maxRetries} retries:`, error);
        } else {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }
    }
  }

  private sendToConsole(logs: LogEntry[]): void {
    logs.forEach(log => {
      const style = this.getConsoleStyle(log.level);
      const prefix = `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.service}/${log.category}]`;
      
      console.log(
        `%c${prefix} ${log.message}`,
        style,
        log.metadata
      );
    });
  }

  private getConsoleStyle(level: LogEntry['level']): string {
    switch (level) {
      case 'critical':
        return 'background: #ff0000; color: white; font-weight: bold; padding: 2px 4px;';
      case 'error':
        return 'background: #ff4444; color: white; font-weight: bold; padding: 2px 4px;';
      case 'warn':
        return 'background: #ffaa00; color: black; font-weight: bold; padding: 2px 4px;';
      case 'info':
        return 'background: #0088ff; color: white; padding: 2px 4px;';
      case 'debug':
        return 'background: #888888; color: white; padding: 2px 4px;';
      default:
        return 'padding: 2px 4px;';
    }
  }

  private sendToLocalStorage(logs: LogEntry[]): void {
    try {
      const existingLogs = localStorage.getItem('jarvis_centralized_logs');
      const storedLogs: LogEntry[] = existingLogs ? JSON.parse(existingLogs) : [];
      
      storedLogs.push(...logs);
      
      // Keep only recent logs
      const maxStoredLogs = 500;
      const recentLogs = storedLogs.slice(-maxStoredLogs);
      
      localStorage.setItem('jarvis_centralized_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to store logs in localStorage:', error);
    }
  }

  private async sendToWebhook(destination: LogDestination, logs: LogEntry[]): Promise<void>  {
    if (!destination.config.endpoint) {
      throw new Error('Webhook endpoint not configured');
    }

    const payload = {
      logs,
      batch: {
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        count: logs.length
      },
      service: 'jarvis-chat',
      environment: import.meta.env.MODE
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...destination.config.headers
    };

    if (destination.config.apiKey) {
      headers['Authorization'] = `Bearer ${destination.config.apiKey}`;
    }

    const response = await fetch(destination.config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}: ${response.statusText}`);
    }
  }

  private async sendToElasticsearch(destination: LogDestination, logs: LogEntry[]): Promise<void>  {
    if (!destination.config.endpoint || !destination.config.index) {
      throw new Error('Elasticsearch endpoint or index not configured');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-ndjson'
    };

    if (destination.config.apiKey) {
      headers['Authorization'] = `ApiKey ${destination.config.apiKey}`;
    }

    // Create bulk index payload
    const bulkBody = logs.flatMap(log => [
      {
        index: {
          _index: destination.config.index,
          _id: log.logId
        }
      },
      log
    ]);

    const ndjson = bulkBody.map(item => JSON.stringify(item)).join('\n') + '\n';

    const response = await fetch(`${destination.config.endpoint}/_bulk`, {
      method: 'POST',
      headers,
      body: ndjson
    });

    if (!response.ok) {
      throw new Error(`Elasticsearch responded with ${response.status}: ${response.statusText}`);
    }
  }

  // Convenience methods for different log levels
  debug(service: string, category: LogEntry['category'], message: string, metadata?: Record<string, unknown>, correlationId?: string): string {
    return this.log('debug', service, category, message, metadata, correlationId);
  }

  info(service: string, category: LogEntry['category'], message: string, metadata?: Record<string, unknown>, correlationId?: string): string {
    return this.log('info', service, category, message, metadata, correlationId);
  }

  warn(service: string, category: LogEntry['category'], message: string, metadata?: Record<string, unknown>, correlationId?: string): string {
    return this.log('warn', service, category, message, metadata, correlationId);
  }

  error(service: string, category: LogEntry['category'], message: string, metadata?: Record<string, unknown>, correlationId?: string): string {
    return this.log('error', service, category, message, metadata, correlationId);
  }

  critical(service: string, category: LogEntry['category'], message: string, metadata?: Record<string, unknown>, correlationId?: string): string {
    return this.log('critical', service, category, message, metadata, correlationId);
  }

  // Query logs
  getLogs(filter?: {
    level?: LogEntry['level'];
    service?: string;
    category?: LogEntry['category'];
    correlationId?: string;
    traceId?: string;
    timeRange?: number; // hours
    limit?: number;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter) {
      if (filter.level) {
        filtered = filtered.filter(log => log.level === filter.level);
      }
      if (filter.service) {
        filtered = filtered.filter(log => log.service === filter.service);
      }
      if (filter.category) {
        filtered = filtered.filter(log => log.category === filter.category);
      }
      if (filter.correlationId) {
        filtered = filtered.filter(log => log.correlationId === filter.correlationId);
      }
      if (filter.traceId) {
        filtered = filtered.filter(log => log.traceId === filter.traceId);
      }
      if (filter.timeRange) {
        const cutoff = new Date(Date.now() - (filter.timeRange * 60 * 60 * 1000)).toISOString();
        filtered = filtered.filter(log => log.timestamp > cutoff);
      }
      if (filter.limit) {
        filtered = filtered.slice(-filter.limit);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get logs from localStorage (for persistence across sessions)
  getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('jarvis_centralized_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
      return [];
    }
  }

  // Update configuration
  updateConfig(updates: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.flushInterval) {
      this.startFlushTimer();
    }
  }

  // Get current configuration
  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  // Clean up resources
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Final flush
    this.flushLogs();
  }

  // Get trace ID for current session
  getTraceId(): string {
    return this.traceId;
  }

  // Export logs for analysis
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs();
    
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'service', 'category', 'message', 'correlationId', 'userId'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp,
          log.level,
          log.service,
          log.category,
          `"${log.message.replace(/"/g, '""')}"`,
          log.correlationId,
          log.userId || ''
        ].join(','))
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(logs, null, 2);
  }
}

// Singleton instance
export const centralizedLogging = new CentralizedLoggingService();

// Utility functions
export const sendToCentralizedLogging = async (type: string, data: unknown) => {
  centralizedLogging.info('system', 'external', `External data: ${type}`, { 
    type, 
    data,
    source: 'external_integration'
  });
};

export const logToService = (
  level: LogEntry['level'],
  service: string,
  category: LogEntry['category'],
  message: string,
  metadata?: Record<string, unknown>,
  correlationId?: string
) => centralizedLogging.log(level, service, category, message, metadata, correlationId);

export const getServiceLogs = (filter?: Parameters<typeof centralizedLogging.getLogs>[0]) =>
  centralizedLogging.getLogs(filter);

export const exportServiceLogs = (format?: 'json' | 'csv') =>
  centralizedLogging.exportLogs(format);