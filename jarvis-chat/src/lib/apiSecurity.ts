/**
 * API Security and Authentication System
 * Comprehensive security layer for API access with key management, rate limiting, and audit logging
 */

import { createHash, randomBytes } from 'crypto';
import { centralizedLogging } from './centralizedLogging';
import { trackBugReportEvent } from './monitoring';

// Security types and interfaces
export interface APIKey {
  id: string;
  key: string;
  hashedKey: string;
  userId: string;
  name: string;
  permissions: APIPermissions;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  ipWhitelist?: string[];
  metadata: Record<string, unknown>;
}

export interface APIPermissions {
  read: boolean;
  write: boolean;
  export: boolean;
  admin: boolean;
  endpoints: string[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export interface APIKeyValidation {
  valid: boolean;
  apiKey?: string;
  userId?: string;
  permissions?: APIPermissions;
  error?: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

export interface AuditLogEntry {
  id: string;
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  requestSize: number;
  responseStatus: number;
  responseTime: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RateLimitBucket {
  count: number;
  resetTime: number;
  window: 'minute' | 'hour' | 'day';
}

class APISecurityService {
  private static instance: APISecurityService;
  private apiKeys: Map<string, APIKey> = new Map();
  private rateLimitBuckets: Map<string, Map<string, RateLimitBucket>> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private blockedIPs: Set<string> = new Set();
  private suspiciousActivity: Map<string, number> = new Map();

  private constructor() {
    this.initializeDefaultKeys();
    this.startCleanupTasks();
  }

  static getInstance(): APISecurityService {
    if (!APISecurityService.instance) {
      APISecurityService.instance = new APISecurityService();
    }
    return APISecurityService.instance;
  }

  /**
   * Create new API key
   */
  async createAPIKey(
    userId: string,
    name: string,
    permissions: APIPermissions,
    expiresIn?: number // days
  ): Promise<{ success: boolean; apiKey?: APIKey; error?: string }> {
    const correlationId = this.generateCorrelationId();

    try {
      centralizedLogging.info(
        'api-security',
        'system',
        'Creating new API key',
        { correlationId, userId, name, permissions }
      );

      // Generate secure API key
      const keyId = this.generateKeyId();
      const rawKey = this.generateRawKey();
      const hashedKey = this.hashKey(rawKey);

      const apiKey: APIKey = {
        id: keyId,
        key: `jc_${keyId}_${rawKey}`, // Prefix for identification
        hashedKey,
        userId,
        name,
        permissions,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString() : undefined,
        metadata: {
          createdBy: userId,
          correlationId
        }
      };

      // Store API key
      this.apiKeys.set(hashedKey, apiKey);

      // Initialize rate limit buckets
      this.initializeRateLimits(hashedKey, permissions.rateLimits);

      // Log API key creation
      this.logAuditEvent({
        apiKeyId: keyId,
        userId,
        endpoint: 'createAPIKey',
        method: 'POST',
        ipAddress: 'system',
        userAgent: 'system',
        requestSize: 0,
        responseStatus: 201,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        metadata: { action: 'api_key_created', keyName: name }
      });

      // Track event
      trackBugReportEvent('api_key_created', {
        keyId,
        userId,
        permissions: Object.keys(permissions).filter(p => (permissions as Record<string, boolean>)[p] === true)
      });

      centralizedLogging.info(
        'api-security',
        'system',
        'API key created successfully',
        { correlationId, keyId, userId }
      );

      return {
        success: true,
        apiKey
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      centralizedLogging.error(
        'api-security',
        'system',
        'Failed to create API key',
        { correlationId, userId, error: errorMessage }
      );

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate API key
   */
  async validateAPIKey(authHeader?: string): Promise<APIKeyValidation> {
    if (!authHeader) {
      return { valid: false, error: 'No authorization header provided' };
    }

    // Extract API key from header
    const apiKey = this.extractAPIKey(authHeader);
    if (!apiKey) {
      return { valid: false, error: 'Invalid authorization format' };
    }

    try {
      // Hash the provided key to lookup
      const hashedKey = this.hashKey(this.extractRawKey(apiKey));
      const storedKey = this.apiKeys.get(hashedKey);

      if (!storedKey) {
        // Log potential brute force attempt
        this.recordSuspiciousActivity(apiKey);
        return { valid: false, error: 'Invalid API key' };
      }

      // Check if key is active
      if (!storedKey.isActive) {
        return { valid: false, error: 'API key is inactive' };
      }

      // Check expiration
      if (storedKey.expiresAt && new Date() > new Date(storedKey.expiresAt)) {
        return { valid: false, error: 'API key has expired' };
      }

      // Update last used timestamp
      storedKey.lastUsedAt = new Date().toISOString();
      this.apiKeys.set(hashedKey, storedKey);

      return {
        valid: true,
        apiKey: hashedKey,
        userId: storedKey.userId,
        permissions: storedKey.permissions
      };

    } catch (error) {
      centralizedLogging.error(
        'api-security',
        'system',
        'Error validating API key',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      return { valid: false, error: 'Validation error' };
    }
  }

  /**
   * Check rate limits
   */
  async checkRateLimit(apiKey: string, endpoint: string): Promise<RateLimitStatus> {
    const storedKey = this.apiKeys.get(apiKey);
    if (!storedKey) {
      return { allowed: false, remaining: 0, resetTime: new Date().toISOString() };
    }

    const limits = storedKey.permissions.rateLimits;
    const now = Date.now();

    // Get or create rate limit buckets for this API key
    let keyBuckets = this.rateLimitBuckets.get(apiKey);
    if (!keyBuckets) {
      keyBuckets = new Map();
      this.rateLimitBuckets.set(apiKey, keyBuckets);
    }

    // Check each time window
    const windows = [
      { name: 'minute', limit: limits.requestsPerMinute, duration: 60 * 1000 },
      { name: 'hour', limit: limits.requestsPerHour, duration: 60 * 60 * 1000 },
      { name: 'day', limit: limits.requestsPerDay, duration: 24 * 60 * 60 * 1000 }
    ];

    for (const window of windows) {
      const bucketKey = `${endpoint}:${window.name}`;
      let bucket = keyBuckets.get(bucketKey);

      if (!bucket || now > bucket.resetTime) {
        // Create new bucket or reset expired one
        bucket = {
          count: 0,
          resetTime: now + window.duration,
          window: window.name as RateLimitBucket['window']
        };
        keyBuckets.set(bucketKey, bucket);
      }

      // Check if limit exceeded
      if (bucket.count >= window.limit) {
        const retryAfter = Math.ceil((bucket.resetTime - now) / 1000);
        
        // Log rate limit violation
        centralizedLogging.warn(
          'api-security',
          'system',
          'Rate limit exceeded',
          {
            apiKeyId: storedKey.id,
            endpoint,
            window: window.name,
            count: bucket.count,
            limit: window.limit
          }
        );

        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(bucket.resetTime).toISOString(),
          retryAfter
        };
      }
    }

    return {
      allowed: true,
      remaining: limits.requestsPerMinute - (keyBuckets.get(`${endpoint}:minute`)?.count || 0),
      resetTime: new Date(keyBuckets.get(`${endpoint}:minute`)?.resetTime || now).toISOString()
    };
  }

  /**
   * Apply rate limit (increment counters)
   */
  async applyRateLimit(apiKey: string, endpoint: string): Promise<void> {
    const keyBuckets = this.rateLimitBuckets.get(apiKey);
    if (!keyBuckets) return;

    const windows = ['minute', 'hour', 'day'];
    for (const window of windows) {
      const bucketKey = `${endpoint}:${window}`;
      const bucket = keyBuckets.get(bucketKey);
      if (bucket) {
        bucket.count++;
        keyBuckets.set(bucketKey, bucket);
      }
    }
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(keyId: string, revokedBy: string): Promise<boolean> {
    try {
      // Find API key by ID
      let targetKey: APIKey | undefined;
      let hashedKey: string | undefined;

      for (const [hash, key] of this.apiKeys.entries()) {
        if (key.id === keyId) {
          targetKey = key;
          hashedKey = hash;
          break;
        }
      }

      if (!targetKey || !hashedKey) {
        return false;
      }

      // Deactivate key
      targetKey.isActive = false;
      targetKey.metadata = {
        ...targetKey.metadata,
        revokedAt: new Date().toISOString(),
        revokedBy
      };

      this.apiKeys.set(hashedKey, targetKey);

      // Clean up rate limits
      this.rateLimitBuckets.delete(hashedKey);

      // Log revocation
      this.logAuditEvent({
        apiKeyId: keyId,
        userId: targetKey.userId,
        endpoint: 'revokeAPIKey',
        method: 'DELETE',
        ipAddress: 'system',
        userAgent: 'system',
        requestSize: 0,
        responseStatus: 200,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        metadata: { action: 'api_key_revoked', revokedBy }
      });

      centralizedLogging.info(
        'api-security',
        'system',
        'API key revoked',
        { keyId, revokedBy }
      );

      return true;

    } catch (error) {
      centralizedLogging.error(
        'api-security',
        'system',
        'Failed to revoke API key',
        { keyId, error: error instanceof Error ? error.message : 'Unknown error' }
      );

      return false;
    }
  }

  /**
   * Log API access for audit trail
   */
  logAPIAccess(
    apiKeyId: string,
    userId: string,
    endpoint: string,
    method: string,
    ipAddress: string,
    userAgent: string,
    requestSize: number,
    responseStatus: number,
    responseTime: number,
    metadata?: Record<string, unknown>
  ): void {
    const auditEntry: AuditLogEntry = {
      id: this.generateAuditId(),
      apiKeyId,
      userId,
      endpoint,
      method,
      ipAddress,
      userAgent,
      requestSize,
      responseStatus,
      responseTime,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.logAuditEvent(auditEntry);
  }

  /**
   * Get audit logs with filtering
   */
  getAuditLogs(filters: {
    apiKeyId?: string;
    userId?: string;
    endpoint?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
    offset?: number;
  } = {}): { logs: AuditLogEntry[]; total: number } {
    let filteredLogs = [...this.auditLogs];

    // Apply filters
    if (filters.apiKeyId) {
      filteredLogs = filteredLogs.filter(log => log.apiKeyId === filters.apiKeyId);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.endpoint) {
      filteredLogs = filteredLogs.filter(log => log.endpoint.includes(filters.endpoint!));
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      filteredLogs = filteredLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime >= start && logTime <= end;
      });
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = filteredLogs.length;

    // Apply pagination
    if (filters.offset) {
      filteredLogs = filteredLogs.slice(filters.offset);
    }
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return { logs: filteredLogs, total };
  }

  /**
   * Get API keys for a user
   */
  getUserAPIKeys(userId: string): APIKey[] {
    return Array.from(this.apiKeys.values())
      .filter(key => key.userId === userId)
      .map(key => ({
        ...key,
        key: this.maskAPIKey(key.key), // Never return raw key
        hashedKey: '[REDACTED]'
      }));
  }

  /**
   * Block IP address
   */
  blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress);
    
    centralizedLogging.warn(
      'api-security',
      'system',
      'IP address blocked',
      { ipAddress, reason }
    );
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress);
  }

  // Private helper methods
  private initializeDefaultKeys(): void {
    // Create a default admin key for system use
    const adminPermissions: APIPermissions = {
      read: true,
      write: true,
      export: true,
      admin: true,
      endpoints: ['*'],
      rateLimits: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000
      }
    };

    this.createAPIKey('system', 'Default Admin Key', adminPermissions);
  }

  private initializeRateLimits(apiKey: string, limits: APIPermissions['rateLimits']): void {
    const keyBuckets = new Map<string, RateLimitBucket>();
    this.rateLimitBuckets.set(apiKey, keyBuckets);
  }

  private generateKeyId(): string {
    return randomBytes(16).toString('hex');
  }

  private generateRawKey(): string {
    return randomBytes(32).toString('hex');
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  private extractAPIKey(authHeader: string): string | null {
    // Support both "Bearer" and "ApiKey" formats
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const apiKeyMatch = authHeader.match(/^ApiKey\s+(.+)$/i);
    
    return bearerMatch?.[1] || apiKeyMatch?.[1] || null;
  }

  private extractRawKey(apiKey: string): string {
    // Extract raw key from formatted key (jc_keyId_rawKey)
    const parts = apiKey.split('_');
    return parts.length >= 3 ? parts.slice(2).join('_') : apiKey;
  }

  private maskAPIKey(key: string): string {
    if (key.length <= 8) return '****';
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  }

  private recordSuspiciousActivity(identifier: string): void {
    const count = this.suspiciousActivity.get(identifier) || 0;
    this.suspiciousActivity.set(identifier, count + 1);

    // Block after multiple failed attempts
    if (count + 1 >= 5) {
      this.blockIP(identifier, 'Multiple invalid API key attempts');
    }
  }

  private logAuditEvent(entry: AuditLogEntry): void {
    this.auditLogs.push(entry);

    // Keep only last 10000 audit entries
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-5000);
    }

    // Log to centralized logging system
    centralizedLogging.info(
      'api-security',
      'audit',
      'API access logged',
      {
        apiKeyId: entry.apiKeyId,
        endpoint: entry.endpoint,
        status: entry.responseStatus,
        responseTime: entry.responseTime
      }
    );
  }

  private startCleanupTasks(): void {
    // Clean up expired rate limit buckets every 5 minutes
    setInterval(() => {
      this.cleanupExpiredBuckets();
    }, 5 * 60 * 1000);

    // Clean up suspicious activity records every hour
    setInterval(() => {
      this.suspiciousActivity.clear();
    }, 60 * 60 * 1000);
  }

  private cleanupExpiredBuckets(): void {
    const now = Date.now();
    
    for (const [apiKey, buckets] of this.rateLimitBuckets.entries()) {
      for (const [bucketKey, bucket] of buckets.entries()) {
        if (now > bucket.resetTime) {
          buckets.delete(bucketKey);
        }
      }
      
      // Remove empty bucket maps
      if (buckets.size === 0) {
        this.rateLimitBuckets.delete(apiKey);
      }
    }
  }

  private generateCorrelationId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const apiSecurityService = APISecurityService.getInstance();

// Export convenience functions
export const createAPIKey = (
  userId: string,
  name: string,
  permissions: APIPermissions,
  expiresIn?: number
) => apiSecurityService.createAPIKey(userId, name, permissions, expiresIn);

export const validateAPIKey = (authHeader?: string) =>
  apiSecurityService.validateAPIKey(authHeader);

export const checkRateLimit = (apiKey: string, endpoint: string) =>
  apiSecurityService.checkRateLimit(apiKey, endpoint);

export const applyRateLimit = (apiKey: string, endpoint: string) =>
  apiSecurityService.applyRateLimit(apiKey, endpoint);

export const revokeAPIKey = (keyId: string, revokedBy: string) =>
  apiSecurityService.revokeAPIKey(keyId, revokedBy);

export const logAPIAccess = (
  apiKeyId: string,
  userId: string,
  endpoint: string,
  method: string,
  ipAddress: string,
  userAgent: string,
  requestSize: number,
  responseStatus: number,
  responseTime: number,
  metadata?: Record<string, unknown>
) => apiSecurityService.logAPIAccess(
  apiKeyId, userId, endpoint, method, ipAddress, userAgent,
  requestSize, responseStatus, responseTime, metadata
);

export default apiSecurityService;