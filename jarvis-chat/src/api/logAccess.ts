/**
 * Secure Log Access API
 * Authentication-protected REST API for log access with role-based permissions
 */

import type { LogEntry } from '@/lib/centralizedLogging';
import { centralizedLogging } from '@/lib/centralizedLogging';

// API interfaces
export interface LogQuery {
  startTime?: string;
  endTime?: string;
  levels?: string[];
  services?: string[];
  categories?: string[];
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  traceId?: string;
  searchText?: string;
  metadata?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'level' | 'service';
  sortOrder?: 'asc' | 'desc';
}

export interface LogSearchResult {
  logs: LogEntry[];
  totalCount: number;
  aggregations: {
    levels: Record<string, number>;
    services: Record<string, number>;
    categories: Record<string, number>;
    errorTypes: Record<string, number>;
    timeDistribution: Array<{ timestamp: string; count: number }>;
  };
  searchTime: number;
  query: LogQuery;
}

export interface LogExportRequest {
  query: LogQuery;
  format: 'json' | 'csv' | 'excel' | 'xml';
  compression?: 'gzip' | 'zip';
  includeMetadata: boolean;
  batchSize?: number;
}

export interface LogStreamRequest {
  query: Omit<LogQuery, 'limit' | 'offset'>;
  bufferSize?: number;
  heartbeatInterval?: number;
}

export interface ApiKey {
  keyId: string;
  key: string;
  name: string;
  permissions: LogAccessPermission[];
  userId: string;
  expiresAt?: string;
  lastUsed?: string;
  isActive: boolean;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    dataLimitMB: number;
  };
  ipWhitelist?: string[];
  metadata: Record<string, unknown>;
}

export interface LogAccessPermission {
  permission: 'read_logs' | 'export_logs' | 'stream_logs' | 'admin_logs';
  scope: {
    services?: string[];
    levels?: string[];
    categories?: string[];
    timeRange?: number; // hours
  };
}

export interface AuditLogEntry {
  auditId: string;
  timestamp: string;
  userId: string;
  apiKeyId?: string;
  action: 'search' | 'export' | 'stream' | 'admin';
  query: LogQuery;
  resultCount: number;
  dataSize: number;
  duration: number;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  error?: string;
}

// Rate limiting interface
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Secure log access service
class LogAccessService {
  private apiKeys: Map<string, ApiKey> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private rateLimitBuckets: Map<string, { count: number; resetTime: number }> = new Map();
  private activeStreams: Map<string, WebSocket> = new Map();

  constructor() {
    this.setupDefaultApiKeys();
    this.setupCleanupTimer();
  }

  private setupDefaultApiKeys(): void {
    // Create default admin API key if configured
    if (import.meta.env.VITE_LOG_ACCESS_ADMIN_KEY) {
      const adminKey: ApiKey = {
        keyId: 'admin_key',
        key: import.meta.env.VITE_LOG_ACCESS_ADMIN_KEY,
        name: 'Default Admin Key',
        permissions: [
          {
            permission: 'admin_logs',
            scope: {}
          }
        ],
        userId: 'system_admin',
        isActive: true,
        rateLimits: {
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          dataLimitMB: 100
        },
        metadata: { created: new Date().toISOString() }
      };

      this.apiKeys.set(adminKey.key, adminKey);
    }
  }

  // Authentication and authorization
  async authenticateApiKey(apiKey: string): Promise<ApiKey | null> {
    const key = this.apiKeys.get(apiKey);
    
    if (!key || !key.isActive) {
      return null;
    }

    // Check expiration
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return null;
    }

    // Update last used
    key.lastUsed = new Date().toISOString();

    return key;
  }

  async authorizeAction(
    apiKey: ApiKey, 
    action: LogAccessPermission['permission'], 
    query: LogQuery
  ): Promise<boolean> {
    const permission = apiKey.permissions.find(p => p.permission === action || p.permission === 'admin_logs');
    
    if (!permission) {
      return false;
    }

    // Check scope restrictions
    if (permission.scope.services && query.services) {
      const allowedServices = permission.scope.services;
      const requestedServices = query.services;
      if (!requestedServices.every(service => allowedServices.includes(service))) {
        return false;
      }
    }

    if (permission.scope.levels && query.levels) {
      const allowedLevels = permission.scope.levels;
      const requestedLevels = query.levels;
      if (!requestedLevels.every(level => allowedLevels.includes(level))) {
        return false;
      }
    }

    if (permission.scope.categories && query.categories) {
      const allowedCategories = permission.scope.categories;
      const requestedCategories = query.categories;
      if (!requestedCategories.every(category => allowedCategories.includes(category))) {
        return false;
      }
    }

    // Check time range restrictions
    if (permission.scope.timeRange && query.startTime) {
      const maxTimeRange = permission.scope.timeRange * 60 * 60 * 1000; // hours to ms
      const requestedTimeRange = new Date().getTime() - new Date(query.startTime).getTime();
      if (requestedTimeRange > maxTimeRange) {
        return false;
      }
    }

    return true;
  }

  // Rate limiting
  async checkRateLimit(apiKey: ApiKey, ipAddress: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const bucketKey = `${apiKey.keyId}_${ipAddress}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute

    let bucket = this.rateLimitBuckets.get(bucketKey);
    
    if (!bucket || now >= bucket.resetTime) {
      bucket = {
        count: 0,
        resetTime: now + windowMs
      };
      this.rateLimitBuckets.set(bucketKey, bucket);
    }

    const allowed = bucket.count < apiKey.rateLimits.requestsPerMinute;
    
    if (allowed) {
      bucket.count++;
    }

    const info: RateLimitInfo = {
      limit: apiKey.rateLimits.requestsPerMinute,
      remaining: Math.max(0, apiKey.rateLimits.requestsPerMinute - bucket.count),
      resetTime: bucket.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((bucket.resetTime - now) / 1000)
    };

    return { allowed, info };
  }

  // Main API methods
  async searchLogs(
    query: LogQuery,
    apiKey: ApiKey,
    ipAddress: string,
    userAgent: string
  ): Promise<LogSearchResult> {
    const startTime = performance.now();
    
    try {
      // Validate and sanitize query
      const sanitizedQuery = this.sanitizeQuery(query);
      
      // Apply scope restrictions
      const scopedQuery = this.applyScopeRestrictions(sanitizedQuery, apiKey);
      
      // Execute search
      const logs = this.executeLogSearch(scopedQuery);
      const totalCount = logs.length;
      
      // Apply pagination
      const paginatedLogs = this.applyPagination(logs, scopedQuery);
      
      // Generate aggregations
      const aggregations = this.generateAggregations(logs);
      
      // Generate time distribution
      const timeDistribution = this.generateTimeDistribution(logs, scopedQuery);
      
      const searchTime = performance.now() - startTime;
      
      // Audit log
      await this.auditLogAccess({
        userId: apiKey.userId,
        apiKeyId: apiKey.keyId,
        action: 'search',
        query: scopedQuery,
        resultCount: totalCount,
        dataSize: this.calculateDataSize(paginatedLogs),
        duration: searchTime,
        ipAddress,
        userAgent,
        success: true
      });

      return {
        logs: paginatedLogs,
        totalCount,
        aggregations: {
          ...aggregations,
          timeDistribution
        },
        searchTime,
        query: scopedQuery
      };

    } catch {
      const searchTime = performance.now() - startTime;
      
      // Audit failed request
      await this.auditLogAccess({
        userId: apiKey.userId,
        apiKeyId: apiKey.keyId,
        action: 'search',
        query,
        resultCount: 0,
        dataSize: 0,
        duration: searchTime,
        ipAddress,
        userAgent,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private sanitizeQuery(query: LogQuery): LogQuery {
    const sanitized: LogQuery = {};

    // Sanitize time range
    if (query.startTime) {
      sanitized.startTime = new Date(query.startTime).toISOString();
    }
    if (query.endTime) {
      sanitized.endTime = new Date(query.endTime).toISOString();
    }

    // Sanitize arrays
    if (query.levels) {
      sanitized.levels = query.levels.filter(level => 
        ['debug', 'info', 'warn', 'error', 'critical'].includes(level)
      );
    }

    if (query.services) {
      sanitized.services = query.services.filter(service => 
        typeof service === 'string' && service.length <= 100
      );
    }

    if (query.categories) {
      sanitized.categories = query.categories.filter(category => 
        ['api', 'database', 'auth', 'webhook', 'external', 'system'].includes(category)
      );
    }

    // Sanitize strings
    if (query.userId) {
      sanitized.userId = query.userId.substring(0, 100);
    }
    if (query.sessionId) {
      sanitized.sessionId = query.sessionId.substring(0, 100);
    }
    if (query.correlationId) {
      sanitized.correlationId = query.correlationId.substring(0, 100);
    }
    if (query.traceId) {
      sanitized.traceId = query.traceId.substring(0, 100);
    }
    if (query.searchText) {
      sanitized.searchText = query.searchText.substring(0, 500);
    }

    // Sanitize pagination
    sanitized.limit = Math.min(Math.max(query.limit || 100, 1), 1000);
    sanitized.offset = Math.max(query.offset || 0, 0);

    // Sanitize sorting
    if (query.sortBy && ['timestamp', 'level', 'service'].includes(query.sortBy)) {
      sanitized.sortBy = query.sortBy;
    }
    if (query.sortOrder && ['asc', 'desc'].includes(query.sortOrder)) {
      sanitized.sortOrder = query.sortOrder;
    }

    return sanitized;
  }

  private applyScopeRestrictions(query: LogQuery, apiKey: ApiKey): LogQuery {
    const adminPermission = apiKey.permissions.find(p => p.permission === 'admin_logs');
    if (adminPermission) {
      return query; // Admin has full access
    }

    const restricted = { ...query };

    // Apply service restrictions
    const readPermission = apiKey.permissions.find(p => p.permission === 'read_logs');
    if (readPermission?.scope.services) {
      if (restricted.services) {
        restricted.services = restricted.services.filter(service => 
          readPermission.scope.services!.includes(service)
        );
      } else {
        restricted.services = readPermission.scope.services;
      }
    }

    // Apply level restrictions
    if (readPermission?.scope.levels) {
      if (restricted.levels) {
        restricted.levels = restricted.levels.filter(level => 
          readPermission.scope.levels!.includes(level)
        );
      } else {
        restricted.levels = readPermission.scope.levels;
      }
    }

    // Apply category restrictions
    if (readPermission?.scope.categories) {
      if (restricted.categories) {
        restricted.categories = restricted.categories.filter(category => 
          readPermission.scope.categories!.includes(category)
        );
      } else {
        restricted.categories = readPermission.scope.categories;
      }
    }

    // Apply time range restrictions
    if (readPermission?.scope.timeRange) {
      const maxTimeRange = readPermission.scope.timeRange * 60 * 60 * 1000; // hours to ms
      const earliestAllowed = new Date(Date.now() - maxTimeRange).toISOString();
      
      if (!restricted.startTime || restricted.startTime < earliestAllowed) {
        restricted.startTime = earliestAllowed;
      }
    }

    return restricted;
  }

  private executeLogSearch(query: LogQuery): LogEntry[] {
    // Search centralized logs
    const centralizedLogs = centralizedLogging.getLogs({
      level: query.levels?.[0] as 'debug' | 'info' | 'warn' | 'error' | 'critical',
      service: query.services?.[0],
      category: query.categories?.[0] as 'system' | 'user' | 'api' | 'database' | 'auth',
      correlationId: query.correlationId,
      traceId: query.traceId,
      timeRange: query.startTime ? 
        (Date.now() - new Date(query.startTime).getTime()) / (1000 * 60 * 60) : undefined,
      limit: query.limit
    });

    let logs = [...centralizedLogs];

    // Apply additional filters
    if (query.userId) {
      logs = logs.filter(log => log.userId === query.userId);
    }

    if (query.sessionId) {
      logs = logs.filter(log => log.sessionId === query.sessionId);
    }

    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.service.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.metadata).toLowerCase().includes(searchLower)
      );
    }

    // Apply time range filtering
    if (query.startTime || query.endTime) {
      logs = logs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const startTime = query.startTime ? new Date(query.startTime).getTime() : 0;
        const endTime = query.endTime ? new Date(query.endTime).getTime() : Date.now();
        
        return logTime >= startTime && logTime <= endTime;
      });
    }

    // Apply multiple service/level/category filters
    if (query.services && query.services.length > 1) {
      logs = logs.filter(log => query.services!.includes(log.service));
    }

    if (query.levels && query.levels.length > 1) {
      logs = logs.filter(log => query.levels!.includes(log.level));
    }

    if (query.categories && query.categories.length > 1) {
      logs = logs.filter(log => query.categories!.includes(log.category));
    }

    // Apply sorting
    logs.sort((a, b) {
      let aValue: string | number, bValue: string | number;
      
      switch (query.sortBy) {
        case 'level': {
          const levelOrder = ['debug', 'info', 'warn', 'error', 'critical'];
          aValue = levelOrder.indexOf(a.level);
          bValue = levelOrder.indexOf(b.level);
          break;
        }
        case 'service':
          aValue = a.service;
          bValue = b.service;
          break;
        case 'timestamp':
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
      }

      if (query.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return logs;
  }

  private applyPagination(logs: LogEntry[], query: LogQuery): LogEntry[] {
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return logs.slice(offset, offset + limit);
  }

  private generateAggregations(logs: LogEntry[]): Omit<LogSearchResult['aggregations'], 'timeDistribution'> {
    const levels: Record<string, number> = {};
    const services: Record<string, number> = {};
    const categories: Record<string, number> = {};
    const errorTypes: Record<string, number> = {};

    logs.forEach(log => {
      // Level aggregation
      levels[log.level] = (levels[log.level] || 0) + 1;
      
      // Service aggregation
      services[log.service] = (services[log.service] || 0) + 1;
      
      // Category aggregation
      categories[log.category] = (categories[log.category] || 0) + 1;
      
      // Error type aggregation (for error and critical logs)
      if (log.level === 'error' || log.level === 'critical') {
        const errorType = this.extractErrorType(log);
        if (errorType) {
          errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
        }
      }
    });

    return {
      levels,
      services,
      categories,
      errorTypes
    };
  }

  private extractErrorType(log: LogEntry): string | null {
    // Extract error type from message or metadata
    const message = log.message.toLowerCase();
    
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('connection')) return 'connection';
    if (message.includes('authentication') || message.includes('auth')) return 'authentication';
    if (message.includes('permission') || message.includes('authorization')) return 'authorization';
    if (message.includes('validation')) return 'validation';
    if (message.includes('not found') || message.includes('404')) return 'not_found';
    if (message.includes('server error') || message.includes('500')) return 'server_error';
    if (message.includes('rate limit')) return 'rate_limit';
    
    return 'other';
  }

  private generateTimeDistribution(logs: LogEntry[], query: LogQuery): Array<{ timestamp: string; count: number }> {
    if (logs.length === 0) return [];

    // Determine time bucket size based on time range
    const startTime = query.startTime ? new Date(query.startTime) : new Date(logs[logs.length - 1].timestamp);
    const endTime = query.endTime ? new Date(query.endTime) : new Date(logs[0].timestamp);
    const timeRange = endTime.getTime() - startTime.getTime();
    
    let bucketSize: number; // milliseconds
    if (timeRange <= 60 * 60 * 1000) { // 1 hour
      bucketSize = 5 * 60 * 1000; // 5 minutes
    } else if (timeRange <= 24 * 60 * 60 * 1000) { // 1 day
      bucketSize = 60 * 60 * 1000; // 1 hour
    } else {
      bucketSize = 24 * 60 * 60 * 1000; // 1 day
    }

    const buckets: Record<string, number> = {};
    
    logs.forEach(log => {
      const logTime = new Date(log.timestamp).getTime();
      const bucketTime = Math.floor(logTime / bucketSize) * bucketSize;
      const bucketKey = new Date(bucketTime).toISOString();
      
      buckets[bucketKey] = (buckets[bucketKey] || 0) + 1;
    });

    return Object.entries(buckets)
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private calculateDataSize(logs: LogEntry[]): number {
    return JSON.stringify(logs).length;
  }

  // Log export functionality
  async exportLogs(
    request: LogExportRequest,
    apiKey: ApiKey,
    ipAddress: string,
    userAgent: string
  ): Promise<{ data: string; contentType: string; filename: string }> {
    const startTime = performance.now();
    
    try {
      // Search logs first
      const searchResult = await this.searchLogs(
        { ...request.query, limit: undefined, offset: undefined },
        apiKey,
        ipAddress,
        userAgent
      );

      let data: string;
      let contentType: string;
      let filename: string;

      switch (request.format) {
        case 'json':
          data = JSON.stringify(searchResult.logs, null, 2);
          contentType = 'application/json';
          filename = `logs_${new Date().toISOString().split('T')[0]}.json`;
          break;
        
        case 'csv':
          data = this.convertToCSV(searchResult.logs, request.includeMetadata);
          contentType = 'text/csv';
          filename = `logs_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        
        case 'excel':
          data = this.convertToExcel(searchResult.logs, request.includeMetadata);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          filename = `logs_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        
        case 'xml':
          data = this.convertToXML(searchResult.logs, request.includeMetadata);
          contentType = 'application/xml';
          filename = `logs_${new Date().toISOString().split('T')[0]}.xml`;
          break;
        
        default:
          throw new Error(`Unsupported export format: ${request.format}`);
      }

      // Apply compression if requested
      if (request.compression) {
        // Compression would be implemented here
        // For now, we'll just return the uncompressed data
      }

      const duration = performance.now() - startTime;

      // Audit log
      await this.auditLogAccess({
        userId: apiKey.userId,
        apiKeyId: apiKey.keyId,
        action: 'export',
        query: request.query,
        resultCount: searchResult.logs.length,
        dataSize: data.length,
        duration,
        ipAddress,
        userAgent,
        success: true
      });

      return { data, contentType, filename };

    } catch {
      const duration = performance.now() - startTime;
      
      await this.auditLogAccess({
        userId: apiKey.userId,
        apiKeyId: apiKey.keyId,
        action: 'export',
        query: request.query,
        resultCount: 0,
        dataSize: 0,
        duration,
        ipAddress,
        userAgent,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private convertToCSV(logs: LogEntry[], includeMetadata: boolean): string {
    if (logs.length === 0) return '';

    const headers = [
      'timestamp',
      'level',
      'service',
      'category',
      'message',
      'correlationId',
      'traceId',
      'userId',
      'sessionId',
      'environment'
    ];

    if (includeMetadata) {
      headers.push('metadata');
    }

    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.level,
        log.service,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`,
        log.correlationId,
        log.traceId,
        log.userId || '',
        log.sessionId || '',
        log.environment
      ];

      if (includeMetadata) {
        row.push(`"${JSON.stringify(log.metadata).replace(/"/g, '""')}"`);
      }

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private convertToExcel(logs: LogEntry[], includeMetadata: boolean): string {
    // Excel conversion would require a library like ExcelJS
    // For now, return CSV format with Excel MIME type
    return this.convertToCSV(logs, includeMetadata);
  }

  private convertToXML(logs: LogEntry[], includeMetadata: boolean): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<logs>\n';
    
    logs.forEach(log => {
      xml += '  <log>\n';
      xml += `    <timestamp>${log.timestamp}</timestamp>\n`;
      xml += `    <level>${log.level}</level>\n`;
      xml += `    <service>${log.service}</service>\n`;
      xml += `    <category>${log.category}</category>\n`;
      xml += `    <message><![CDATA[${log.message}]]></message>\n`;
      xml += `    <correlationId>${log.correlationId}</correlationId>\n`;
      xml += `    <traceId>${log.traceId}</traceId>\n`;
      if (log.userId) xml += `    <userId>${log.userId}</userId>\n`;
      if (log.sessionId) xml += `    <sessionId>${log.sessionId}</sessionId>\n`;
      xml += `    <environment>${log.environment}</environment>\n`;
      
      if (includeMetadata && log.metadata) {
        xml += '    <metadata>\n';
        Object.entries(log.metadata).forEach(([key, value]) {
          xml += `      <${key}><![CDATA[${JSON.stringify(value)}]]></${key}>\n`;
        });
        xml += '    </metadata>\n';
      }
      
      xml += '  </log>\n';
    });
    
    xml += '</logs>';
    return xml;
  }

  // Real-time log streaming
  async createLogStream(
    request: LogStreamRequest,
    apiKey: ApiKey,
    websocket: WebSocket
  ): Promise<string> {
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeStreams.set(streamId, websocket);

    // Setup stream configuration
    const bufferSize = request.bufferSize || 100;
    const heartbeatInterval = request.heartbeatInterval || 30000; // 30 seconds
    
    let buffer: LogEntry[] = [];
    let lastHeartbeat = Date.now();

    // Setup heartbeat
    const heartbeatTimer = setInterval(() {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
          streamId
        }));
        lastHeartbeat = Date.now();
      } else {
        clearInterval(heartbeatTimer);
        this.activeStreams.delete(streamId);
      }
    }, heartbeatInterval);

    // Setup log streaming
    const streamLogs = () {
      if (buffer.length === 0) return;

      const logsToSend = buffer.splice(0, Math.min(buffer.length, bufferSize));
      
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'logs',
          data: logsToSend,
          timestamp: new Date().toISOString(),
          streamId
        }));
      }
    };

    // Stream timer
    const streamTimer = setInterval(streamLogs, 1000); // Send every second

    // Listen for new logs (simplified - in real implementation, this would be event-driven)
    const logListener = setInterval(() {
      try {
        // Get recent logs that match the query
        const recentLogs = this.executeLogSearch({
          ...request.query,
          startTime: new Date(lastHeartbeat - 5000).toISOString(), // Last 5 seconds
          limit: bufferSize
        });

        buffer.push(...recentLogs);
        
        // Limit buffer size
        if (buffer.length > bufferSize * 2) {
          buffer = buffer.slice(-bufferSize);
        }
      } catch {
        console.warn('Error in log stream listener:', error);
      }
    }, 2000); // Check every 2 seconds

    // Cleanup on connection close
    websocket.onclose = () {
      clearInterval(heartbeatTimer);
      clearInterval(streamTimer);
      clearInterval(logListener);
      this.activeStreams.delete(streamId);
    };

    // Send initial message
    websocket.send(JSON.stringify({
      type: 'stream_started',
      streamId,
      query: request.query,
      timestamp: new Date().toISOString()
    }));

    return streamId;
  }

  // API key management
  async createApiKey(
    name: string,
    permissions: LogAccessPermission[],
    userId: string,
    options: {
      expiresIn?: number; // days
      rateLimits?: Partial<ApiKey['rateLimits']>;
      ipWhitelist?: string[];
    } = {}
  ): Promise<ApiKey> {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const key = `lak_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;

    const apiKey: ApiKey = {
      keyId,
      key,
      name,
      permissions,
      userId,
      expiresAt: options.expiresIn ? 
        new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000).toISOString() : 
        undefined,
      isActive: true,
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        dataLimitMB: 10,
        ...options.rateLimits
      },
      ipWhitelist: options.ipWhitelist,
      metadata: {
        created: new Date().toISOString(),
        createdBy: userId
      }
    };

    this.apiKeys.set(key, apiKey);

    centralizedLogging.info(
      'log-access-api',
      'system',
      `API key created: ${name}`,
      { keyId, userId, permissions: permissions.map(p => p.permission) }
    );

    return apiKey;
  }

  async revokeApiKey(keyId: string, revokedBy: string): Promise<boolean> {
    const apiKey = Array.from(this.apiKeys.values()).find(key => key.keyId === keyId);
    
    if (!apiKey) {
      return false;
    }

    apiKey.isActive = false;
    apiKey.metadata.revokedAt = new Date().toISOString();
    apiKey.metadata.revokedBy = revokedBy;

    centralizedLogging.info(
      'log-access-api',
      'system',
      `API key revoked: ${apiKey.name}`,
      { keyId, revokedBy }
    );

    return true;
  }

  // Audit logging
  private async auditLogAccess(entry: Omit<AuditLogEntry, 'auditId' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    this.auditLog.push(auditEntry);

    // Log to centralized logging
    centralizedLogging.info(
      'log-access-api',
      'system',
      `Log access audit: ${entry.action}`,
      {
        auditId: auditEntry.auditId,
        userId: entry.userId,
        action: entry.action,
        resultCount: entry.resultCount,
        success: entry.success,
        duration: entry.duration
      }
    );
  }

  // Query methods
  getApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  getAuditLog(limit?: number): AuditLogEntry[] {
    const sorted = this.auditLog.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getActiveStreams(): Array<{ streamId: string; connected: boolean }> {
    return Array.from(this.activeStreams.entries()).map(([streamId, ws]) => ({
      streamId,
      connected: ws.readyState === WebSocket.OPEN
    }));
  }

  // Cleanup
  private setupCleanupTimer(): void {
    setInterval(() {
      this.cleanupOldData();
    }, 60 * 60 * 1000); // Every hour
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Clean up old audit logs
    this.auditLog = this.auditLog.filter(entry => 
      new Date(entry.timestamp).getTime() > cutoff
    );

    // Clean up old rate limit buckets
    for (const [key, bucket] of this.rateLimitBuckets.entries()) {
      if (Date.now() >= bucket.resetTime) {
        this.rateLimitBuckets.delete(key);
      }
    }

    // Clean up inactive API keys
    for (const [key, apiKey] of this.apiKeys.entries()) {
      if (!apiKey.isActive && apiKey.metadata.revokedAt) {
        const revokedTime = new Date(apiKey.metadata.revokedAt as string).getTime();
        if (Date.now() - revokedTime > cutoff) {
          this.apiKeys.delete(key);
        }
      }
    }
  }
}

// Singleton instance for API endpoints
export const logAccessService = new LogAccessService();

// Express-style middleware functions (for reference - would be implemented in actual API routes)
export const authenticateApiKeyMiddleware = async (apiKey: string) {
  return await logAccessService.authenticateApiKey(apiKey);
};

export const checkRateLimitMiddleware = async (apiKey: ApiKey, ipAddress: string) {
  return await logAccessService.checkRateLimit(apiKey, ipAddress);
};

// API endpoint functions
export const searchLogsEndpoint = async (
  query: LogQuery,
  apiKey: ApiKey,
  ipAddress: string,
  userAgent: string
) {
  // Check authorization
  const authorized = await logAccessService.authorizeAction(apiKey, 'read_logs', query);
  if (!authorized) {
    throw new Error('Insufficient permissions for log search');
  }

  return await logAccessService.searchLogs(query, apiKey, ipAddress, userAgent);
};

export const exportLogsEndpoint = async (
  request: LogExportRequest,
  apiKey: ApiKey,
  ipAddress: string,
  userAgent: string
) {
  // Check authorization
  const authorized = await logAccessService.authorizeAction(apiKey, 'export_logs', request.query);
  if (!authorized) {
    throw new Error('Insufficient permissions for log export');
  }

  return await logAccessService.exportLogs(request, apiKey, ipAddress, userAgent);
};

export const createLogStreamEndpoint = async (
  request: LogStreamRequest,
  apiKey: ApiKey,
  websocket: WebSocket
) {
  // Check authorization
  const authorized = await logAccessService.authorizeAction(apiKey, 'stream_logs', request.query);
  if (!authorized) {
    throw new Error('Insufficient permissions for log streaming');
  }

  return await logAccessService.createLogStream(request, apiKey, websocket);
};