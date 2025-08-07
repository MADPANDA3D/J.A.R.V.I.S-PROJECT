/**
 * External API Client with Service Monitoring Integration
 * Provides monitored HTTP client for external service calls with comprehensive logging
 */

import { 
  makeMonitoredCall, 
  registerService, 
  registerDependency,
  type ServiceDependency 
} from './serviceMonitoring';

// API Client interfaces
export interface APIRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  metadata?: Record<string, unknown>;
}

export interface APIResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
}

export interface APIError extends Error {
  status?: number;
  statusText?: string;
  response?: unknown;
  isRetryable: boolean;
}

export interface ExternalServiceConfig {
  serviceName: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  healthCheck?: {
    endpoint: string;
    method: 'GET' | 'POST';
    expectedStatus: number;
    timeout: number;
  };
  authentication?: {
    type: 'bearer' | 'apikey' | 'basic' | 'custom';
    token?: string;
    username?: string;
    password?: string;
    customHeader?: string;
    customValue?: string;
  };
}

// External API Client implementation
export class ExternalAPIClient {
  private config: ExternalServiceConfig;
  private baseHeaders: Record<string, string>;

  constructor(config: ExternalServiceConfig) {
    this.config = {
      timeout: 10000,
      retryPolicy: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2
      },
      ...config
    };

    this.baseHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'JARVIS-Chat-Client/1.0',
      ...config.defaultHeaders
    };

    // Add authentication headers
    if (config.authentication) {
      this.addAuthenticationHeaders();
    }

    // Register service for monitoring
    registerService(
      config.serviceName, 
      'external', 
      [config.baseUrl]
    );

    // Register health check dependency if configured
    if (config.healthCheck) {
      this.registerHealthCheckDependency();
    }
  }

  private addAuthenticationHeaders(): void {
    const auth = this.config.authentication!;
    
    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          this.baseHeaders['Authorization'] = `Bearer ${auth.token}`;
        }
        break;
      case 'apikey':
        if (auth.token) {
          this.baseHeaders['X-API-Key'] = auth.token;
        }
        break;
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = btoa(`${auth.username}:${auth.password}`);
          this.baseHeaders['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'custom':
        if (auth.customHeader && auth.customValue) {
          this.baseHeaders[auth.customHeader] = auth.customValue;
        }
        break;
    }
  }

  private registerHealthCheckDependency(): void {
    const healthCheck = this.config.healthCheck!;
    
    const dependency: ServiceDependency = {
      dependencyId: `${this.config.serviceName}_health`,
      serviceName: this.config.serviceName,
      dependsOn: 'external_service',
      required: true,
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2
      },
      healthCheck: async (): Promise<boolean>  => {
        try {
          const response = await this.makeRequest({
            method: healthCheck.method,
            endpoint: healthCheck.endpoint,
            timeout: healthCheck.timeout
          });
          return response.status === healthCheck.expectedStatus;
        } catch (error) {
          return false;
        }
      }
    };

    registerDependency(dependency);
  }

  // Main request method with monitoring
  async makeRequest<T = unknown>(requestConfig: APIRequestConfig): Promise<APIResponse<T>>  => {
    const fullUrl = this.buildUrl(requestConfig.endpoint);
    
    return makeMonitoredCall(
      this.config.serviceName,
      'external',
      fullUrl,
      requestConfig.method,
      async () {
        return this.executeRequest<T>(requestConfig, fullUrl);
      },
      {
        timeout: requestConfig.timeout || this.config.timeout,
        retryPolicy: requestConfig.retryPolicy || this.config.retryPolicy,
        metadata: {
          endpoint: requestConfig.endpoint,
          method: requestConfig.method,
          hasBody: !!requestConfig.body,
          ...requestConfig.metadata
        }
      }
    );
  }

  private async executeRequest<T = unknown>(
    requestConfig: APIRequestConfig, 
    fullUrl: string
  ): Promise<APIResponse<T>>  => {
    const startTime = performance.now();
    
    const headers = {
      ...this.baseHeaders,
      ...requestConfig.headers
    };

    const fetchOptions: RequestInit = {
      method: requestConfig.method,
      headers,
      signal: AbortSignal.timeout(requestConfig.timeout || this.config.timeout!)
    };

    // Add body for non-GET requests
    if (requestConfig.body && requestConfig.method !== 'GET') {
      fetchOptions.body = typeof requestConfig.body === 'string' 
        ? requestConfig.body 
        : JSON.stringify(requestConfig.body);
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);
      const endTime = performance.now();

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json() as T;
      } else if (contentType.includes('text/')) {
        data = await response.text() as unknown as T;
      } else {
        data = await response.blob() as unknown as T;
      }

      const timing = {
        start: startTime,
        end: endTime,
        duration: endTime - startTime
      };

      // Convert headers to object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (!response.ok) {
        const apiError: APIError = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        ) as APIError;
        apiError.status = response.status;
        apiError.statusText = response.statusText;
        apiError.response = data;
        apiError.isRetryable = this.isRetryableStatus(response.status);
        throw apiError;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        timing
      };

    } catch (error) {
      // const endTime = performance.now(); // For future timing use
      
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        const timeoutError: APIError = new Error(
          `Request timeout after ${requestConfig.timeout || this.config.timeout}ms`
        ) as APIError;
        timeoutError.status = 408;
        timeoutError.statusText = 'Request Timeout';
        timeoutError.isRetryable = true;
        throw timeoutError;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError: APIError = new Error(
          'Network error: Unable to connect to service'
        ) as APIError;
        networkError.status = 0;
        networkError.statusText = 'Network Error';
        networkError.isRetryable = true;
        throw networkError;
      }

      // Re-throw API errors as-is
      if ((error as APIError).status !== undefined) {
        throw error;
      }

      // Wrap unknown errors
      const unknownError: APIError = new Error(
        `Unknown error: ${error instanceof Error ? error.message : 'Unknown'}`
      ) as APIError;
      unknownError.isRetryable = false;
      throw unknownError;
    }
  }

  private buildUrl(endpoint: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${baseUrl}/${cleanEndpoint}`;
  }

  private isRetryableStatus(status: number): boolean {
    return status >= 500 || status === 429 || status === 408;
  }

  // Convenience methods for common HTTP verbs
  async get<T = unknown>(
    endpoint: string, 
    options: Omit<APIRequestConfig, 'method' | 'endpoint'> = {}
  ): Promise<APIResponse<T>>  => {
    return this.makeRequest<T>({
      method: 'GET',
      endpoint,
      ...options
    });
  }

  async post<T = unknown>(
    endpoint: string, 
    body?: unknown,
    options: Omit<APIRequestConfig, 'method' | 'endpoint' | 'body'> = {}
  ): Promise<APIResponse<T>>  => {
    return this.makeRequest<T>({
      method: 'POST',
      endpoint,
      body,
      ...options
    });
  }

  async put<T = unknown>(
    endpoint: string, 
    body?: unknown,
    options: Omit<APIRequestConfig, 'method' | 'endpoint' | 'body'> = {}
  ): Promise<APIResponse<T>>  => {
    return this.makeRequest<T>({
      method: 'PUT',
      endpoint,
      body,
      ...options
    });
  }

  async patch<T = unknown>(
    endpoint: string, 
    body?: unknown,
    options: Omit<APIRequestConfig, 'method' | 'endpoint' | 'body'> = {}
  ): Promise<APIResponse<T>>  => {
    return this.makeRequest<T>({
      method: 'PATCH',
      endpoint,
      body,
      ...options
    });
  }

  async delete<T = unknown>(
    endpoint: string, 
    options: Omit<APIRequestConfig, 'method' | 'endpoint'> = {}
  ): Promise<APIResponse<T>>  => {
    return this.makeRequest<T>({
      method: 'DELETE',
      endpoint,
      ...options
    });
  }

  // Health check method
  async checkHealth(): Promise< => {
    healthy: boolean;
    responseTime?: number;
    error?: string;
  }> {
    if (!this.config.healthCheck) {
      return { healthy: true }; // No health check configured
    }

    try {
      const startTime = performance.now();
      const response = await this.makeRequest({
        method: this.config.healthCheck.method,
        endpoint: this.config.healthCheck.endpoint,
        timeout: this.config.healthCheck.timeout
      });
      
      const responseTime = performance.now() - startTime;
      const healthy = response.status === this.config.healthCheck.expectedStatus;

      return {
        healthy,
        responseTime
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get service configuration
  getConfig(): ExternalServiceConfig {
    return { ...this.config };
  }

  // Update authentication
  updateAuthentication(authentication: ExternalServiceConfig['authentication']): void {
    this.config.authentication = authentication;
    
    // Remove old auth headers
    delete this.baseHeaders['Authorization'];
    delete this.baseHeaders['X-API-Key'];
    
    // Add new auth headers
    if (authentication) {
      this.addAuthenticationHeaders();
    }
  }

  // Update configuration
  updateConfig(updates: Partial<ExternalServiceConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.defaultHeaders) {
      this.baseHeaders = {
        ...this.baseHeaders,
        ...updates.defaultHeaders
      };
    }

    if (updates.authentication) {
      this.updateAuthentication(updates.authentication);
    }
  }
}

// Pre-configured clients for common services
export const createOpenAIClient = (apiKey: string): ExternalAPIClient  =>  => {
  return new ExternalAPIClient({
    serviceName: 'openai-api',
    baseUrl: 'https://api.openai.com/v1',
    authentication: {
      type: 'bearer',
      token: apiKey
    },
    healthCheck: {
      endpoint: '/models',
      method: 'GET',
      expectedStatus: 200,
      timeout: 5000
    },
    timeout: 30000 // 30 seconds for AI requests
  });
};

export const createAnthropicClient = (apiKey: string): ExternalAPIClient  =>  => {
  return new ExternalAPIClient({
    serviceName: 'anthropic-api',
    baseUrl: 'https://api.anthropic.com/v1',
    authentication: {
      type: 'custom',
      customHeader: 'x-api-key',
      customValue: apiKey
    },
    defaultHeaders: {
      'anthropic-version': '2023-06-01'
    },
    timeout: 30000
  });
};

export const createGitHubClient = (token: string): ExternalAPIClient  =>  => {
  return new ExternalAPIClient({
    serviceName: 'github-api',
    baseUrl: 'https://api.github.com',
    authentication: {
      type: 'bearer',
      token: token
    },
    healthCheck: {
      endpoint: '/user',
      method: 'GET',
      expectedStatus: 200,
      timeout: 5000
    },
    timeout: 15000
  });
};

export const createSlackClient = (token: string): ExternalAPIClient  =>  => {
  return new ExternalAPIClient({
    serviceName: 'slack-api',
    baseUrl: 'https://slack.com/api',
    authentication: {
      type: 'bearer',
      token: token
    },
    healthCheck: {
      endpoint: '/auth.test',
      method: 'POST',
      expectedStatus: 200,
      timeout: 5000
    }
  });
};

export const createN8NClient = (baseUrl: string, token?: string): ExternalAPIClient  =>  => {
  return new ExternalAPIClient({
    serviceName: 'n8n-api',
    baseUrl: baseUrl,
    authentication: token ? {
      type: 'bearer',
      token: token
    } : undefined,
    healthCheck: {
      endpoint: '/healthz',
      method: 'GET',
      expectedStatus: 200,
      timeout: 5000
    }
  });
};