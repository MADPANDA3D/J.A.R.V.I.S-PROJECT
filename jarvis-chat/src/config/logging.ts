/**
 * Centralized Logging Configuration
 * Environment-specific logging configuration and deployment settings
 */

import type { LoggingConfig, LogDestination } from '../lib/centralizedLogging';

// Environment configuration interface
export interface EnvironmentLoggingConfig {
  development: LoggingConfig;
  staging: LoggingConfig;
  production: LoggingConfig;
}

// Logging destination configurations
export interface LoggingDestinations {
  console: LogDestination;
  localStorage: LogDestination;
  webhook?: LogDestination;
  elasticsearch?: LogDestination;
  datadog?: LogDestination;
  cloudwatch?: LogDestination;
  customEndpoints?: LogDestination[];
}

// Get current environment
const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  const mode = import.meta.env.MODE || 'development';
  
  if (mode === 'production') return 'production';
  if (mode === 'staging') return 'staging';
  return 'development';
};

// Build logging destinations based on environment
const buildLoggingDestinations = (env: string): LogDestination[] => {
  const destinations: LogDestination[] = [];

  // Console logging (always enabled in development)
  destinations.push({
    type: 'console',
    enabled: env === 'development' || import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true',
    config: {}
  });

  // Local storage (enabled for client-side debugging)
  destinations.push({
    type: 'localStorage',
    enabled: true,
    config: {}
  });

  // Webhook destination (N8N or custom webhook)
  if (import.meta.env.VITE_LOG_WEBHOOK_URL) {
    destinations.push({
      type: 'webhook',
      enabled: true,
      config: {
        endpoint: import.meta.env.VITE_LOG_WEBHOOK_URL,
        apiKey: import.meta.env.VITE_LOG_WEBHOOK_KEY,
        headers: import.meta.env.VITE_LOG_WEBHOOK_HEADERS ? 
          JSON.parse(import.meta.env.VITE_LOG_WEBHOOK_HEADERS) : {
            'Content-Type': 'application/json',
            'User-Agent': 'JARVIS-Chat-Logger/1.0'
          }
      }
    });
  }

  // Elasticsearch destination
  if (import.meta.env.VITE_ELASTICSEARCH_ENDPOINT) {
    destinations.push({
      type: 'elasticsearch',
      enabled: true,
      config: {
        endpoint: import.meta.env.VITE_ELASTICSEARCH_ENDPOINT,
        apiKey: import.meta.env.VITE_ELASTICSEARCH_API_KEY,
        index: import.meta.env.VITE_ELASTICSEARCH_INDEX || `jarvis-logs-${env}`,
        headers: {
          'Content-Type': 'application/x-ndjson'
        }
      }
    });
  }

  // Datadog destination
  if (import.meta.env.VITE_DATADOG_API_KEY) {
    destinations.push({
      type: 'custom',
      enabled: true,
      config: {
        endpoint: import.meta.env.VITE_DATADOG_ENDPOINT || 'https://http-intake.logs.datadoghq.com/v1/input',
        apiKey: import.meta.env.VITE_DATADOG_API_KEY,
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': import.meta.env.VITE_DATADOG_API_KEY
        },
        formatter: (log) => ({
          message: log.message,
          level: log.level,
          service: log.service,
          timestamp: log.timestamp,
          attributes: {
            ...log.metadata,
            correlationId: log.correlationId,
            traceId: log.traceId,
            environment: log.environment,
            userId: log.userId,
            sessionId: log.sessionId
          }
        })
      }
    });
  }

  // AWS CloudWatch destination
  if (import.meta.env.VITE_AWS_CLOUDWATCH_REGION) {
    destinations.push({
      type: 'custom',
      enabled: true,
      config: {
        endpoint: `https://logs.${import.meta.env.VITE_AWS_CLOUDWATCH_REGION}.amazonaws.com/`,
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'Logs_20140328.PutLogEvents'
        },
        formatter: (log) => ({
          logGroupName: import.meta.env.VITE_AWS_LOG_GROUP || `jarvis-chat-${env}`,
          logStreamName: import.meta.env.VITE_AWS_LOG_STREAM || `jarvis-${new Date().toISOString().split('T')[0]}`,
          logEvents: [{
            timestamp: new Date(log.timestamp).getTime(),
            message: JSON.stringify({
              message: log.message,
              level: log.level,
              service: log.service,
              metadata: log.metadata,
              correlationId: log.correlationId,
              traceId: log.traceId
            })
          }]
        })
      }
    });
  }

  return destinations;
};

// Environment-specific configurations
const environmentConfigs: EnvironmentLoggingConfig = {
  development: {
    enabled: true,
    level: 'debug',
    retentionDays: 3,
    batchSize: 5,
    flushInterval: 2000, // 2 seconds
    maxRetries: 2,
    destinations: buildLoggingDestinations('development')
  },

  staging: {
    enabled: true,
    level: 'info',
    retentionDays: 7,
    batchSize: 10,
    flushInterval: 5000, // 5 seconds
    maxRetries: 3,
    destinations: buildLoggingDestinations('staging')
  },

  production: {
    enabled: true,
    level: import.meta.env.VITE_LOG_LEVEL as LoggingConfig['level'] || 'warn',
    retentionDays: parseInt(import.meta.env.VITE_LOG_RETENTION_DAYS || '30'),
    batchSize: parseInt(import.meta.env.VITE_LOG_BATCH_SIZE || '20'),
    flushInterval: parseInt(import.meta.env.VITE_LOG_FLUSH_INTERVAL || '10000'), // 10 seconds
    maxRetries: parseInt(import.meta.env.VITE_LOG_MAX_RETRIES || '5'),
    destinations: buildLoggingDestinations('production')
  }
};

// Get logging configuration for current environment
export const getLoggingConfig = (): LoggingConfig => {
  const env = getCurrentEnvironment();
  return environmentConfigs[env];
};

// Validate logging configuration
export const validateLoggingConfig = (config: LoggingConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!config.enabled && config.enabled !== false) {
    errors.push('enabled field is required');
  }

  if (!config.level) {
    errors.push('level field is required');
  } else if (!['debug', 'info', 'warn', 'error', 'critical'].includes(config.level)) {
    errors.push('level must be one of: debug, info, warn, error, critical');
  }

  if (!config.destinations || config.destinations.length === 0) {
    errors.push('at least one destination must be configured');
  }

  // Check destination configurations
  config.destinations?.forEach((destination, index) => {
    if (!destination.type) {
      errors.push(`destination[${index}]: type is required`);
    }

    if (!['console', 'localStorage', 'webhook', 'elasticsearch', 'custom'].includes(destination.type)) {
      errors.push(`destination[${index}]: invalid type ${destination.type}`);
    }

    if (destination.type === 'webhook' && !destination.config.endpoint) {
      errors.push(`destination[${index}]: webhook endpoint is required`);
    }

    if (destination.type === 'elasticsearch') {
      if (!destination.config.endpoint) {
        errors.push(`destination[${index}]: elasticsearch endpoint is required`);
      }
      if (!destination.config.index) {
        errors.push(`destination[${index}]: elasticsearch index is required`);
      }
    }
  });

  // Check batch and timing configurations
  if (config.batchSize && config.batchSize < 1) {
    warnings.push('batchSize should be at least 1');
  }

  if (config.flushInterval && config.flushInterval < 1000) {
    warnings.push('flushInterval should be at least 1000ms to avoid excessive API calls');
  }

  if (config.retentionDays && config.retentionDays < 1) {
    warnings.push('retentionDays should be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// Test logging configuration
export const testLoggingConfiguration = async (): Promise<{
  success: boolean;
  results: Array<{
    destination: string;
    success: boolean;
    responseTime?: number;
    error?: string;
  }>;
}> => {
  const config = getLoggingConfig();
  const results: Array<{
    destination: string;
    success: boolean;
    responseTime?: number;
    error?: string;
  }> = [];

  for (const destination of config.destinations) {
    if (!destination.enabled) {
      results.push({
        destination: destination.type,
        success: true, // Disabled destinations are considered successful
      });
      continue;
    }

    const startTime = performance.now();
    
    try {
      switch (destination.type) {
        case 'console':
          // Console always works
          console.log('🧪 Testing console logging destination');
          results.push({
            destination: destination.type,
            success: true,
            responseTime: performance.now() - startTime
          });
          break;

        case 'localStorage': {
          // Test localStorage availability
          const testKey = 'jarvis_logging_test';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          results.push({
            destination: destination.type,
            success: true,
            responseTime: performance.now() - startTime
          });
          break;
        }

        case 'webhook':
          if (destination.config.endpoint) {
            const response = await fetch(destination.config.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...destination.config.headers
              },
              body: JSON.stringify({
                test: true,
                message: 'Logging configuration test',
                timestamp: new Date().toISOString()
              })
            });

            results.push({
              destination: destination.type,
              success: response.ok,
              responseTime: performance.now() - startTime,
              error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
            });
          }
          break;

        case 'elasticsearch':
          if (destination.config.endpoint && destination.config.index) {
            const testDoc = {
              message: 'Logging configuration test',
              level: 'info',
              timestamp: new Date().toISOString(),
              service: 'config-test',
              category: 'system'
            };

            const response = await fetch(`${destination.config.endpoint}/${destination.config.index}/_doc`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(destination.config.apiKey && {
                  'Authorization': `ApiKey ${destination.config.apiKey}`
                }),
                ...destination.config.headers
              },
              body: JSON.stringify(testDoc)
            });

            results.push({
              destination: destination.type,
              success: response.ok,
              responseTime: performance.now() - startTime,
              error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
            });
          }
          break;

        case 'custom':
          if (destination.config.endpoint) {
            const testLog = {
              message: 'Logging configuration test',
              level: 'info',
              timestamp: new Date().toISOString(),
              service: 'config-test'
            };

            const body = destination.config.formatter 
              ? destination.config.formatter(testLog as any)
              : testLog;

            const response = await fetch(destination.config.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...destination.config.headers
              },
              body: JSON.stringify(body)
            });

            results.push({
              destination: destination.type,
              success: response.ok,
              responseTime: performance.now() - startTime,
              error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
            });
          }
          break;

        default:
          results.push({
            destination: destination.type,
            success: false,
            error: 'Unknown destination type'
          });
      }
    } catch {
      results.push({
        destination: destination.type,
        success: false,
        responseTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  const allSuccessful = results.every(result => result.success);

  return {
    success: allSuccessful,
    results
  };
};

// Get deployment information
export const getDeploymentInfo = () => {
  const env = getCurrentEnvironment();
  const config = getLoggingConfig();
  
  return {
    environment: env,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
    enabledDestinations: config.destinations.filter(d => d.enabled).map(d => d.type),
    logLevel: config.level,
    retentionDays: config.retentionDays,
    batchSize: config.batchSize,
    flushInterval: config.flushInterval
  };
};

// Export environment configs for testing
export { environmentConfigs };

// Default export for easy import
export default {
  getLoggingConfig,
  validateLoggingConfig,
  testLoggingConfiguration,
  getDeploymentInfo,
  getCurrentEnvironment
};