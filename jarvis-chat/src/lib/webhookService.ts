/**
 * Enhanced Webhook Service with Circuit Breaker, Retry Logic, and Monitoring
 * This service provides robust n8n webhook integration with comprehensive error handling
 */

import { 
  makeMonitoredCall, 
  registerService
} from './serviceMonitoring';

export interface WebhookPayload {
  type: 'Text' | 'Voice' | 'Photo' | 'Video' | 'Document';
  message: string;
  sessionId: string;
  source: string;
  chatId: number;
  timestamp: string;
  requestId?: string;
  UUID?: string;
  selected_tools?: string[];
}

export interface WebhookResponse {
  response: string;
  success: boolean;
  error?: string;
  requestId?: string;
  processingTime?: number;
}

export interface WebhookMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  circuitBreakerState: 'closed' | 'open' | 'half-open';
  lastRequestTime?: Date;
  errorRate: number;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringWindow: number;
}

export interface WebhookServiceConfig {
  webhookUrl: string;
  backupWebhookUrl?: string;
  timeout: number;
  retryConfig: RetryConfig;
  circuitBreakerOptions: CircuitBreakerOptions;
  enableMetrics: boolean;
  failoverConfig?: FailoverConfig;
}

export interface FailoverConfig {
  enabled: boolean;
  primaryUrl: string;
  backupUrls: string[];
  healthCheckInterval: number;
  failoverThreshold: number;
  recoveryThreshold: number;
  verificationEnabled: boolean;
}

export interface DeliveryVerification {
  requestId: string;
  timestamp: Date;
  verified: boolean;
  verificationTime?: number;
  deploymentTriggered?: boolean;
}

// Circuit Breaker States
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open',
}

// Error Classification
export enum WebhookErrorType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  HTTP_ERROR = 'http_error',
  VALIDATION_ERROR = 'validation_error',
  CIRCUIT_BREAKER_OPEN = 'circuit_breaker_open',
  UNKNOWN_ERROR = 'unknown_error',
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public type: WebhookErrorType,
    public statusCode?: number,
    public isRetryable: boolean = true,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

export class WebhookService {
  private config: WebhookServiceConfig;
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private metrics: WebhookMetrics;
  private responseTimes: number[] = [];
  private readonly maxResponseTimeSamples = 100;

  constructor(config: Partial<WebhookServiceConfig> = {}) {
    this.config = {
      webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
      timeout: parseInt(import.meta.env.WEBHOOK_TIMEOUT || '15000'),
      retryConfig: {
        maxAttempts: parseInt(import.meta.env.WEBHOOK_RETRY_ATTEMPTS || '3'),
        baseDelay: 1000,
        maxDelay: 8000,
        backoffFactor: 2.0,
        jitter: true,
      },
      circuitBreakerOptions: {
        failureThreshold: parseInt(
          import.meta.env.WEBHOOK_CIRCUIT_BREAKER_THRESHOLD || '5'
        ),
        recoveryTimeout: 30000, // 30 seconds
        monitoringWindow: 60000, // 1 minute
      },
      enableMetrics: import.meta.env.WEBHOOK_MONITORING_ENABLED === 'true',
      ...config,
    };

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      circuitBreakerState: this.circuitState,
      errorRate: 0,
    };

    // Register service for monitoring
    if (this.config.webhookUrl) {
      registerService('n8n-webhook', 'webhook', [this.config.webhookUrl]);
      if (this.config.backupWebhookUrl) {
        registerService('n8n-webhook-backup', 'webhook', [this.config.backupWebhookUrl]);
      }
    }

    // Check circuit breaker recovery on initialization
    this.checkCircuitBreakerRecovery();
  }

  /**
   * Send message to webhook with comprehensive error handling and retry logic
   */
  async sendMessage(payload: WebhookPayload): Promise<WebhookResponse>  {
    return makeMonitoredCall(
      'n8n-webhook',
      'webhook',
      this.config.webhookUrl,
      'POST',
      async () => {
        // Check circuit breaker state
        if (this.circuitState === CircuitState.OPEN) {
          if (!this.shouldAttemptRecovery()) {
            throw new WebhookError(
              'Circuit breaker is open - webhook temporarily unavailable',
              WebhookErrorType.CIRCUIT_BREAKER_OPEN,
              503,
              false
            );
          }
          // Attempt recovery
          this.circuitState = CircuitState.HALF_OPEN;
        }

        const startTime = Date.now();
        let lastError: WebhookError;

        for (
          let attempt = 1;
          attempt <= this.config.retryConfig.maxAttempts;
          attempt++
        ) {
          try {
            const response = await this.makeWebhookRequest(payload);

            // Success - update metrics and circuit breaker
            this.recordSuccess(Date.now() - startTime);

            return response;
          } catch () {
            lastError =
              error instanceof WebhookError ? error : this.classifyError(error);

            // Don't retry for non-retryable errors
            if (!lastError.isRetryable) {
              this.recordFailure();
              throw lastError;
            }

            // Don't retry on last attempt
            if (attempt === this.config.retryConfig.maxAttempts) {
              this.recordFailure();
              throw lastError;
            }

            // Calculate delay with exponential backoff and jitter
            const delay = this.calculateRetryDelay(attempt);
            await this.sleep(delay);

            console.warn(
              `Webhook attempt ${attempt} failed, retrying in ${delay}ms:`,
              lastError.message
            );
          }
        }

        throw lastError!;
      },
      {
        timeout: this.config.timeout,
        metadata: {
          payloadType: payload.type,
          sessionId: payload.sessionId,
          messageLength: payload.message.length
        }
      }
    );
  }

  /**
   * Make the actual HTTP request to the webhook
   */
  private async makeWebhookRequest(
    payload: WebhookPayload
  ): Promise<WebhookResponse>  => {
    if (!this.config.webhookUrl) {
      throw new WebhookError(
        'Webhook URL not configured',
        WebhookErrorType.VALIDATION_ERROR,
        undefined,
        false
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'JARVIS-Chat/1.0',
          ...(import.meta.env.N8N_WEBHOOK_SECRET && {
            Authorization: `Bearer ${import.meta.env.N8N_WEBHOOK_SECRET}`,
          }),
        },
        body: JSON.stringify({
          ...payload,
          requestId: this.generateRequestId(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Check for n8n-specific error messages
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.clone().json();
          if (errorData.message && errorData.code === 404) {
            // n8n test webhook not registered
            if (errorData.message.includes('not registered')) {
              errorMessage = `n8n Webhook Error: ${errorData.message}. ${errorData.hint || ''}`;
            }
          }
        } catch () {
          // If we can't parse the error response, use the original message
        }

        throw new WebhookError(
          errorMessage,
          WebhookErrorType.HTTP_ERROR,
          response.status,
          this.isRetryableHttpStatus(response.status)
        );
      }

      // Get response text first to handle empty responses
      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new WebhookError(
          'Webhook returned empty response. Check that your n8n workflow has a "Respond to Webhook" node configured to return JSON.',
          WebhookErrorType.VALIDATION_ERROR,
          200,
          false
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch () {
        throw new WebhookError(
          `Webhook returned invalid JSON: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`,
          WebhookErrorType.VALIDATION_ERROR,
          200,
          false
        );
      }

      // Validate response format
      if (!this.isValidWebhookResponse(data)) {
        throw new WebhookError(
          'Invalid response format from webhook. Expected: { success: boolean, response: string }',
          WebhookErrorType.VALIDATION_ERROR,
          200,
          false
        );
      }

      if (!data.success) {
        throw new WebhookError(
          data.error || 'Webhook returned success: false',
          WebhookErrorType.HTTP_ERROR,
          200,
          true
        );
      }

      return data;
    } catch () {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new WebhookError(
          `Request timeout after ${this.config.timeout}ms`,
          WebhookErrorType.TIMEOUT_ERROR,
          408,
          true
        );
      }

      if (error instanceof WebhookError) {
        throw error;
      }

      throw new WebhookError(
        `Network error: ${error.message}`,
        WebhookErrorType.NETWORK_ERROR,
        undefined,
        true,
        error
      );
    }
  }

  /**
   * Health check for the webhook endpoint
   */
  async healthCheck(): Promise< => {
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();

      // Use a simple ping payload for health check
      await this.sendMessage({
        type: 'Text',
        message: '__health_check__',
        sessionId: 'health_check_session',
        source: 'system',
        chatId: 0,
        timestamp: new Date().toISOString(),
      });

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
      };
    } catch () {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebhookMetrics {
    return {
      ...this.metrics,
      circuitBreakerState: this.circuitState,
    };
  }

  /**
   * Configure circuit breaker options
   */
  configureCircuitBreaker(options: Partial<CircuitBreakerOptions>): void {
    this.config.circuitBreakerOptions = {
      ...this.config.circuitBreakerOptions,
      ...options,
    };
  }

  /**
   * Reset circuit breaker state (for testing/recovery)
   */
  resetCircuitBreaker(): void {
    this.circuitState = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = undefined;
  }

  /**
   * Get current configuration
   */
  getConfig(): WebhookServiceConfig {
    return { ...this.config };
  }

  // Private helper methods

  private recordSuccess(responseTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.lastRequestTime = new Date();

    // Update response times
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimeSamples) {
      this.responseTimes.shift();
    }

    // Calculate metrics
    this.updateMetrics();

    // Reset circuit breaker on success
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.circuitState = CircuitState.CLOSED;
      this.failureCount = 0;
    }
  }

  private recordFailure(): void {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.metrics.lastRequestTime = new Date();
    this.failureCount++;
    this.lastFailureTime = new Date();

    this.updateMetrics();

    // Check if circuit breaker should open
    if (
      this.failureCount >= this.config.circuitBreakerOptions.failureThreshold
    ) {
      this.circuitState = CircuitState.OPEN;
    }
  }

  private updateMetrics(): void {
    // Calculate average response time
    if (this.responseTimes.length > 0) {
      this.metrics.averageResponseTime =
        this.responseTimes.reduce((sum, time) => sum + time, 0) /
        this.responseTimes.length;

      // Calculate P95 response time
      const sorted = [...this.responseTimes].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      this.metrics.p95ResponseTime = sorted[p95Index] || 0;
    }

    // Calculate error rate
    this.metrics.errorRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100
        : 0;
  }

  private shouldAttemptRecovery(): boolean {
    if (!this.lastFailureTime) return true;

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return (
      timeSinceLastFailure >= this.config.circuitBreakerOptions.recoveryTimeout
    );
  }

  private checkCircuitBreakerRecovery(): void {
    setInterval(() => {
      if (
        this.circuitState === CircuitState.OPEN &&
        this.shouldAttemptRecovery()
      ) {
        console.log('Circuit breaker recovery attempt available');
      }
    }, this.config.circuitBreakerOptions.recoveryTimeout);
  }

  private calculateRetryDelay(attempt: number): number {
    const baseDelay = this.config.retryConfig.baseDelay;
    const backoffFactor = this.config.retryConfig.backoffFactor;
    const maxDelay = this.config.retryConfig.maxDelay;

    let delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
    delay = Math.min(delay, maxDelay);

    // Add jitter to prevent thundering herd
    if (this.config.retryConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  private classifyError(error: unknown): WebhookError {
    const errorObj = error as Error;
    
    if (errorObj.name === 'AbortError') {
      return new WebhookError(
        'Request timeout',
        WebhookErrorType.TIMEOUT_ERROR,
        408,
        true,
        errorObj
      );
    }

    if (errorObj.name === 'TypeError' && errorObj.message?.includes('fetch')) {
      return new WebhookError(
        'Network connection failed',
        WebhookErrorType.NETWORK_ERROR,
        undefined,
        true,
        errorObj
      );
    }

    return new WebhookError(
      errorObj.message || 'Unknown error',
      WebhookErrorType.UNKNOWN_ERROR,
      undefined,
      true,
      errorObj
    );
  }

  private isRetryableHttpStatus(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 408;
  }

  private isValidWebhookResponse(data: unknown): data is WebhookResponse {
    const obj = data as Record<string, unknown>;
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof obj.success === 'boolean' &&
      (obj.success === false || typeof obj.response === 'string')
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void>  => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default webhook service instance
export const webhookService = new WebhookService();
