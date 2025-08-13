/**
 * Enhanced Webhook Service with Circuit Breaker, Retry Logic, and Monitoring
 * This service provides robust n8n webhook integration with comprehensive error handling
 * 
 * CHANGELOG:
 * - Fixed timeout utility to preserve return values and types
 * - Loosened response guard to accept Response-like objects
 * - Fixed error classification order to match test expectations
 * - Added safeSetTimeout for timer overflow prevention
 * - Improved error serialization to prevent OOM issues
 * - Added fetch injection for clean testing
 * - Made retry/backoff cancelable with AbortSignal
 * - Replaced custom utilities with centralized time/logger modules
 */

import { 
  makeMonitoredCall, 
  registerService
} from './serviceMonitoring';
import { sleep, safeSetTimeout, clampDelay } from './time';
import { minimalError, isTestEnvironment } from './logger';

// Response-like interface for broader compatibility
interface ResponseLike {
  ok?: boolean;
  status?: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
  headers?: Record<string, string>;
  clone?: () => ResponseLike;
  statusText?: string;
}

// Fetch function type for dependency injection
type FetchFunction = typeof fetch;

// Dependencies interface for testing
interface WebhookServiceDependencies {
  fetch: FetchFunction;
}

/**
 * Timeout wrapper that preserves return values and handles AbortController properly
 * Now supports parent AbortSignal for cancellation chains
 */
async function timeout<T>(
  fn: (signal?: AbortSignal) => Promise<T>, 
  ms: number, 
  label?: string,
  parentSignal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  const clampedMs = clampDelay(ms);
  const timeoutId = safeSetTimeout(() => {
    controller.abort();
  }, clampedMs);

  // Chain parent signal if provided
  const onParentAbort = () => {
    clearTimeout(timeoutId);
    controller.abort();
  };
  if (parentSignal?.aborted) {
    clearTimeout(timeoutId);
    throw new DOMException('Parent operation was aborted', 'AbortError');
  }
  parentSignal?.addEventListener('abort', onParentAbort, { once: true });

  try {
    // Always await and return the function result
    const result = await fn(controller.signal);
    clearTimeout(timeoutId);
    parentSignal?.removeEventListener('abort', onParentAbort);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    parentSignal?.removeEventListener('abort', onParentAbort);
    
    // If it's an abort error and we caused it, throw timeout error
    if ((error as Error)?.name === 'AbortError') {
      // Create a basic timeout error object that will be reclassified later
      const timeoutError = new Error(`Request timed out after ${clampedMs}ms${label ? ` (${label})` : ''}`);
      (timeoutError as unknown as { name: string; isTimeout: boolean }).name = 'TimeoutError';
      (timeoutError as unknown as { name: string; isTimeout: boolean }).isTimeout = true;
      throw timeoutError;
    }
    throw error;
  }
}

export interface WebhookPayload {
  message: string;
  timestamp: string;
  // Make fields more flexible for test compatibility
  userId?: string;
  sessionId?: string;
  conversationId?: string;
  source?: string;
  chatId?: number;
  type?: 'Text' | 'Voice' | 'Photo' | 'Video' | 'Document';
  requestId?: string;
  UUID?: string;
  selected_tools?: string[];
  metadata?: Record<string, unknown>;
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
  MALFORMED_RESPONSE = 'malformed_response',
  UNKNOWN_ERROR = 'unknown_error',
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public type: WebhookErrorType,
    public statusCode?: number,
    public isRetryable: boolean = true,
    public originalError?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WebhookError';
  }

  // Helper to check if error is WebhookError
  static isWebhookError(err: unknown): err is WebhookError {
    return err instanceof WebhookError;
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
  private readonly fetch: FetchFunction;
  private _recoveryCheckInterval?: ReturnType<typeof setTimeout>;

  constructor(config: Partial<WebhookServiceConfig> = {}, dependencies: WebhookServiceDependencies = { fetch: globalThis.fetch }) {
    // Constructor guard (dev/test only): warn if globalThis.fetch would be used by accident
    if (isTestEnvironment() && !dependencies?.fetch) {
      console.warn('TEST: WebhookService created without fetch injection - this may cause test timeouts');
      // In tests, use a mock fetch that always fails to prevent hanging
      this.fetch = (async () => {
        throw new Error('WebhookService: Mock fetch - real requests not allowed in tests');
      }) as typeof fetch;
    } else {
      this.fetch = dependencies.fetch;
    }
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
   * Now supports AbortSignal for cancellation
   */
  async sendMessage(payload: WebhookPayload, signal?: AbortSignal): Promise<WebhookResponse>  {
    // IMMEDIATE VALIDATION FIRST - prevent double retry logic
    if (!this.config.webhookUrl) {
      throw new WebhookError(
        'Webhook URL not configured',
        WebhookErrorType.VALIDATION_ERROR,
        undefined,
        false
      );
    }

    return makeMonitoredCall(
      'n8n-webhook',
      'webhook',
      this.config.webhookUrl,
      'POST',
      async () => {

        // Check if operation was already aborted
        if (signal?.aborted) {
          throw new DOMException('Operation was aborted', 'AbortError');
        }

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
            const response = await this.makeWebhookRequest(payload, signal);

            // Success - update metrics and circuit breaker
            this.recordSuccess(Date.now() - startTime);

            return response;
          } catch (error) {
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
            
            // Use cancelable sleep that respects AbortSignal
            await sleep(delay, signal);

            if (!isTestEnvironment()) {
              console.warn(
                `Webhook attempt ${attempt} failed, retrying in ${delay}ms:`,
                lastError.message
              );
            }
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
   * Now supports parent AbortSignal for cancellation chains
   */
  private async makeWebhookRequest(
    payload: WebhookPayload,
    parentSignal?: AbortSignal
  ): Promise<WebhookResponse> {
    // URL validation now happens at the top level

    try {
      const response = await timeout(
        async (signal) => {
          return await this.fetch(this.config.webhookUrl, {
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
              clientVersion: '1.0.0',
            }),
            signal,
          });
        },
        this.config.timeout,
        'webhook-request',
        parentSignal
      ) as ResponseLike;

      // Improved response guard - accept Response-like objects
      const hasOk = typeof response?.ok === 'boolean';
      const hasStatus = typeof response?.status === 'number';

      // Determine if response is ok
      const ok = hasOk ? response.ok
               : hasStatus ? (response.status >= 200 && response.status < 300)
               : undefined;

      // Only throw MALFORMED_RESPONSE for truly unusable responses
      if (ok === undefined && !hasStatus) {
        throw new WebhookError(
          'Malformed response from fetch',
          WebhookErrorType.MALFORMED_RESPONSE,
          undefined,
          true
        );
      }

      // Handle HTTP errors
      if (ok === false || (hasStatus && response.status >= 400)) {
        const status = response.status ?? 500;
        let errorMessage = `HTTP ${status}`;
        
        if (response.statusText) {
          errorMessage += `: ${response.statusText}`;
        }

        // Try to get error details from response body
        try {
          if (typeof response.json === 'function') {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
              if (errorData.code === 404 && errorData.message.includes('not registered')) {
                errorMessage = `n8n Webhook Error: ${errorData.message}. ${errorData.hint || ''}`;
              }
            } else if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } else if (typeof response.text === 'function') {
            const textData = await response.text();
            if (textData && textData.length < 5000) {
              errorMessage = textData;
            }
          }
        } catch {
          // Swallow parsing errors, use original message
        }

        throw new WebhookError(
          errorMessage,
          WebhookErrorType.HTTP_ERROR,
          status,
          this.isRetryableHttpStatus(status)
        );
      }

      // ok === true, parse response
      let data: unknown;
      if (typeof response.json === 'function') {
        try {
          data = await response.json();
        } catch {
          throw new WebhookError(
            'Webhook returned invalid JSON response',
            WebhookErrorType.VALIDATION_ERROR,
            200,
            false
          );
        }
      } else if (typeof response.text === 'function') {
        try {
          const responseText = await response.text();
          if (!responseText.trim()) {
            throw new WebhookError(
              'Webhook returned empty response. Check that your n8n workflow has a "Respond to Webhook" node configured to return JSON.',
              WebhookErrorType.VALIDATION_ERROR,
              200,
              false
            );
          }
          data = JSON.parse(responseText);
        } catch (parseError) {
          if (parseError instanceof WebhookError) throw parseError;
          throw new WebhookError(
            'Webhook returned invalid JSON response',
            WebhookErrorType.VALIDATION_ERROR,
            200,
            false
          );
        }
      } else {
        // Assume data is already parsed
        data = response;
      }

      // Validate response format
      if (!this.isValidWebhookResponse(data)) {
        throw new WebhookError(
          'Invalid response format from webhook',
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
          false  // Don't retry on explicit failure
        );
      }

      return data;
    } catch (err) {
      // Re-throw WebhookErrors as-is
      if (WebhookError.isWebhookError(err)) {
        throw err;
      }

      // Handle timeout errors (from our timeout wrapper or AbortError)
      if ((err as Error)?.name === 'AbortError' || (err as { isTimeout?: boolean })?.isTimeout || (err as Error)?.name === 'TimeoutError') {
        throw new WebhookError(
          (err as Error).message || 'Request timed out',
          WebhookErrorType.TIMEOUT_ERROR,
          408,
          true,
          minimalError(err)
        );
      }

      // Handle network errors
      if (err instanceof TypeError || (err as { code?: string })?.code === 'ECONNRESET' || (err as { code?: string })?.code === 'ENOTFOUND') {
        throw new WebhookError(
          'Network error',
          WebhookErrorType.NETWORK_ERROR,
          undefined,
          true,
          minimalError(err)
        );
      }

      // Unknown errors
      throw new WebhookError(
        'Unknown error during webhook call',
        WebhookErrorType.UNKNOWN_ERROR,
        undefined,
        true,
        minimalError(err)
      );
    }
  }

  /**
   * Health check for the webhook endpoint
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();

      // Use a simple ping payload for health check
      await this.sendMessage({
        message: '__health_check__',
        userId: 'system',
        timestamp: new Date().toISOString(),
      });

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
      };
    } catch (error) {
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
    // Clear any existing interval
    if (this._recoveryCheckInterval) {
      clearTimeout(this._recoveryCheckInterval);
    }
    
    // Use clamped timeout to prevent overflow
    const recoveryTimeout = clampDelay(this.config.circuitBreakerOptions.recoveryTimeout);
    this._recoveryCheckInterval = safeSetTimeout(() => {
      if (
        this.circuitState === CircuitState.OPEN &&
        this.shouldAttemptRecovery()
      ) {
        if (!isTestEnvironment()) {
          console.log('Circuit breaker recovery attempt available');
        }
      }
      // Schedule next check
      this.checkCircuitBreakerRecovery();
    }, recoveryTimeout);
  }

  /**
   * Clean up resources (for testing and proper shutdown)
   */
  destroy(): void {
    if (this._recoveryCheckInterval) {
      clearTimeout(this._recoveryCheckInterval);
      this._recoveryCheckInterval = undefined;
    }
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
    if (WebhookError.isWebhookError(error)) {
      return error;
    }

    const errorObj = error as Error;
    
    if (errorObj?.name === 'AbortError' || (errorObj as { isTimeout?: boolean })?.isTimeout || errorObj?.name === 'TimeoutError') {
      return new WebhookError(
        errorObj?.message || 'Request timeout',
        WebhookErrorType.TIMEOUT_ERROR,
        408,
        true,
        minimalError(errorObj)
      );
    }

    if (errorObj instanceof TypeError || errorObj?.message?.includes('fetch') || errorObj?.message?.includes('network')) {
      return new WebhookError(
        'Network connection failed',
        WebhookErrorType.NETWORK_ERROR,
        undefined,
        true,
        minimalError(errorObj)
      );
    }

    return new WebhookError(
      errorObj?.message || 'Unknown error',
      WebhookErrorType.UNKNOWN_ERROR,
      undefined,
      true,
      minimalError(errorObj)
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

  // Remove old sleep method - now using imported sleep function from time.ts
}

// Default webhook service instance
export const webhookService = new WebhookService();
