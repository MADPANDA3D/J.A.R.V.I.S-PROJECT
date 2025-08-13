/**
 * Enhanced Environment Variable Validation System
 * Provides comprehensive validation, monitoring, and health checks
 */

interface EnvConfig {
  // Application Configuration
  VITE_APP_ENV: 'development' | 'staging' | 'production';
  VITE_APP_VERSION?: string;
  VITE_APP_DOMAIN?: string;
  VITE_CDN_URL?: string;

  // Database & Authentication
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // External Integrations
  VITE_N8N_WEBHOOK_URL?: string;
  N8N_WEBHOOK_SECRET?: string;
  N8N_API_KEY?: string;

  // Monitoring & Logging
  VITE_SENTRY_DSN?: string;
  DATADOG_API_KEY?: string;
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  ENABLE_ANALYTICS?: boolean;

  // Performance & Security
  ENABLE_CACHING?: boolean;
  CACHE_TTL?: number;
  COMPRESSION_ENABLED?: boolean;
  RATE_LIMIT_WINDOW?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;
  CSP_ENABLED?: boolean;

  // Feature Flags
  ENABLE_DEBUG_TOOLS?: boolean;
  ENABLE_EXPERIMENTAL_FEATURES?: boolean;
  MOCK_N8N_RESPONSES?: boolean;
  BYPASS_AUTH?: boolean;

  // Webhook Configuration
  WEBHOOK_TIMEOUT?: number;
  WEBHOOK_RETRY_ATTEMPTS?: number;
  WEBHOOK_CIRCUIT_BREAKER_THRESHOLD?: number;
  WEBHOOK_MONITORING_ENABLED?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  config: Partial<EnvConfig>;
  environment: string;
  timestamp: Date;
  summary: ValidationSummary;
}

interface ValidationError {
  variable: string;
  message: string;
  severity: 'error' | 'critical';
  category: 'required' | 'format' | 'security' | 'dependency';
}

interface ValidationWarning {
  variable: string;
  message: string;
  recommendation: string;
  category: 'performance' | 'security' | 'best-practice';
}

interface ValidationSummary {
  totalVariables: number;
  validVariables: number;
  missingRequired: number;
  securityIssues: number;
  performanceWarnings: number;
  recommendationsCount: number;
}

/**
 * Validates required environment variables with comprehensive error reporting
 */
export function validateEnvironment(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const config: Partial<EnvConfig> = {};
  const environment = import.meta.env.VITE_APP_ENV || 'development';
  const timestamp = new Date();

  // Validate application configuration
  validateApplicationConfig(config, errors, warnings);

  // Validate database configuration
  validateDatabaseConfig(config, errors, warnings);

  // Validate external integrations
  validateIntegrationsConfig(config, errors, warnings);

  // Validate monitoring configuration
  validateMonitoringConfig(config, errors, warnings);

  // Validate performance configuration
  validatePerformanceConfig(config, errors, warnings);

  // Validate security configuration
  validateSecurityConfig(config, errors, warnings);

  // Validate feature flags
  validateFeatureFlags(config, errors, warnings);

  // Validate webhook configuration
  validateWebhookConfig(config, errors, warnings);

  // Generate summary
  const totalVariables = Object.keys(config).length;
  const validVariables = totalVariables - errors.length;
  const missingRequired = errors.filter(e => e.category === 'required').length;
  const securityIssues =
    errors.filter(e => e.category === 'security').length +
    warnings.filter(w => w.category === 'security').length;
  const performanceWarnings = warnings.filter(
    w => w.category === 'performance'
  ).length;
  const recommendationsCount = warnings.length;

  const summary: ValidationSummary = {
    totalVariables,
    validVariables,
    missingRequired,
    securityIssues,
    performanceWarnings,
    recommendationsCount,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
    environment,
    timestamp,
    summary,
  };
}

/**
 * Validates application configuration variables
 */
function validateApplicationConfig(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const appEnv = import.meta.env.VITE_APP_ENV;
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const appDomain = import.meta.env.VITE_APP_DOMAIN;
  const cdnUrl = import.meta.env.VITE_CDN_URL;

  // Validate application environment
  if (!appEnv) {
    errors.push({
      variable: 'VITE_APP_ENV',
      message: 'Application environment is required',
      severity: 'critical',
      category: 'required',
    });
  } else if (!['development', 'staging', 'production'].includes(appEnv)) {
    errors.push({
      variable: 'VITE_APP_ENV',
      message:
        'Invalid environment value. Must be: development, staging, or production',
      severity: 'error',
      category: 'format',
    });
  } else {
    config.VITE_APP_ENV = appEnv as EnvConfig['VITE_APP_ENV'];

    // Environment-specific validation
    if (appEnv === 'production' && !appVersion) {
      warnings.push({
        variable: 'VITE_APP_VERSION',
        message: 'Version should be specified in production',
        recommendation: 'Set VITE_APP_VERSION for production deployments',
        category: 'best-practice',
      });
    }
  }

  // Validate application version
  if (appVersion) {
    config.VITE_APP_VERSION = appVersion;
  }

  // Validate application domain
  if (appDomain) {
    if (!isValidDomain(appDomain)) {
      warnings.push({
        variable: 'VITE_APP_DOMAIN',
        message: 'Domain format appears invalid',
        recommendation:
          'Verify domain format (e.g., example.com or localhost:3000)',
        category: 'best-practice',
      });
    } else {
      config.VITE_APP_DOMAIN = appDomain;
    }
  }

  // Validate CDN URL
  if (cdnUrl) {
    if (!isValidUrl(cdnUrl)) {
      warnings.push({
        variable: 'VITE_CDN_URL',
        message: 'CDN URL format is invalid',
        recommendation: 'Ensure CDN URL is a valid HTTPS URL',
        category: 'best-practice',
      });
    } else {
      config.VITE_CDN_URL = cdnUrl;
    }
  }
}

/**
 * Validates database and authentication configuration
 */
function validateDatabaseConfig(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate Supabase URL
  if (!supabaseUrl) {
    errors.push({
      variable: 'VITE_SUPABASE_URL',
      message: 'Supabase URL is required for database connectivity',
      severity: 'critical',
      category: 'required',
    });
  } else if (!isValidUrl(supabaseUrl)) {
    errors.push({
      variable: 'VITE_SUPABASE_URL',
      message: 'Supabase URL format is invalid',
      severity: 'error',
      category: 'format',
    });
  } else if (
    !supabaseUrl.includes('supabase.co') &&
    !supabaseUrl.includes('localhost')
  ) {
    warnings.push({
      variable: 'VITE_SUPABASE_URL',
      message: 'URL does not appear to be a Supabase endpoint',
      recommendation: 'Verify this is a valid Supabase project URL',
      category: 'best-practice',
    });
  } else {
    config.VITE_SUPABASE_URL = supabaseUrl;
  }

  // Validate Supabase anonymous key
  if (!supabaseKey) {
    errors.push({
      variable: 'VITE_SUPABASE_ANON_KEY',
      message: 'Supabase anonymous key is required for authentication',
      severity: 'critical',
      category: 'required',
    });
  } else if (supabaseKey.length < 100) {
    warnings.push({
      variable: 'VITE_SUPABASE_ANON_KEY',
      message: 'Anonymous key appears unusually short',
      recommendation: 'Verify key is copied correctly from Supabase dashboard',
      category: 'security',
    });
  } else {
    config.VITE_SUPABASE_ANON_KEY = supabaseKey;
  }

  // Validate service role key (if present)
  if (serviceRoleKey) {
    if (serviceRoleKey.length < 100) {
      warnings.push({
        variable: 'SUPABASE_SERVICE_ROLE_KEY',
        message: 'Service role key appears unusually short',
        recommendation: 'Verify key is copied correctly and stored securely',
        category: 'security',
      });
    } else {
      config.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;
      warnings.push({
        variable: 'SUPABASE_SERVICE_ROLE_KEY',
        message: 'Service role key detected',
        recommendation: 'Ensure this key is never exposed to client-side code',
        category: 'security',
      });
    }
  }
}

/**
 * Validates external integrations configuration
 */
function validateIntegrationsConfig(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const n8nWebhookSecret = import.meta.env.N8N_WEBHOOK_SECRET;
  const n8nApiKey = import.meta.env.N8N_API_KEY;

  // Validate N8N webhook URL
  if (!n8nWebhookUrl) {
    warnings.push({
      variable: 'VITE_N8N_WEBHOOK_URL',
      message: 'N8N webhook URL not configured',
      recommendation:
        'Configure webhook URL for AI processing or enable mock responses',
      category: 'best-practice',
    });
  } else if (!isValidUrl(n8nWebhookUrl)) {
    errors.push({
      variable: 'VITE_N8N_WEBHOOK_URL',
      message: 'N8N webhook URL format is invalid',
      severity: 'error',
      category: 'format',
    });
  } else {
    config.VITE_N8N_WEBHOOK_URL = n8nWebhookUrl;

    // Check for secure webhook URL in production
    const appEnv = import.meta.env.VITE_APP_ENV;
    if (appEnv === 'production' && !n8nWebhookUrl.startsWith('https://')) {
      errors.push({
        variable: 'VITE_N8N_WEBHOOK_URL',
        message: 'Webhook URL must use HTTPS in production',
        severity: 'error',
        category: 'security',
      });
    }
  }

  // Validate webhook secret
  if (n8nWebhookUrl && !n8nWebhookSecret) {
    warnings.push({
      variable: 'N8N_WEBHOOK_SECRET',
      message: 'Webhook secret not configured',
      recommendation: 'Set webhook secret for secure communication',
      category: 'security',
    });
  } else if (n8nWebhookSecret) {
    if (n8nWebhookSecret.length < 16) {
      warnings.push({
        variable: 'N8N_WEBHOOK_SECRET',
        message: 'Webhook secret is too short',
        recommendation: 'Use a secret with at least 16 characters',
        category: 'security',
      });
    }
    config.N8N_WEBHOOK_SECRET = n8nWebhookSecret;
  }

  // Validate API key
  if (n8nApiKey) {
    config.N8N_API_KEY = n8nApiKey;
  }
}

/**
 * Validates monitoring and logging configuration
 */
function validateMonitoringConfig(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const datadogApiKey = import.meta.env.DATADOG_API_KEY;
  const logLevel = import.meta.env.LOG_LEVEL;
  const enableAnalytics = import.meta.env.ENABLE_ANALYTICS;

  // Validate Sentry DSN
  if (sentryDsn) {
    if (!isValidUrl(sentryDsn)) {
      warnings.push({
        variable: 'VITE_SENTRY_DSN',
        message: 'Sentry DSN format appears invalid',
        recommendation: 'Verify DSN is copied correctly from Sentry dashboard',
        category: 'best-practice',
      });
    } else {
      config.VITE_SENTRY_DSN = sentryDsn;
    }
  } else {
    const appEnv = import.meta.env.VITE_APP_ENV;
    if (appEnv === 'production') {
      warnings.push({
        variable: 'VITE_SENTRY_DSN',
        message: 'Error tracking not configured in production',
        recommendation: 'Configure Sentry for production error monitoring',
        category: 'best-practice',
      });
    }
  }

  // Validate DataDog API key
  if (datadogApiKey) {
    config.DATADOG_API_KEY = datadogApiKey;
  }

  // Validate log level
  if (logLevel) {
    if (!['debug', 'info', 'warn', 'error'].includes(logLevel)) {
      warnings.push({
        variable: 'LOG_LEVEL',
        message: 'Invalid log level',
        recommendation: 'Use: debug, info, warn, or error',
        category: 'best-practice',
      });
    } else {
      config.LOG_LEVEL = logLevel as EnvConfig['LOG_LEVEL'];
    }
  }

  // Validate analytics setting
  if (enableAnalytics !== undefined) {
    config.ENABLE_ANALYTICS = enableAnalytics === 'true';
  }
}

/**
 * Validates performance configuration
 */
function validatePerformanceConfig(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const enableCaching = import.meta.env.ENABLE_CACHING;
  const cacheTtl = import.meta.env.CACHE_TTL;
  const compressionEnabled = import.meta.env.COMPRESSION_ENABLED;
  const rateLimitWindow = import.meta.env.RATE_LIMIT_WINDOW;
  const rateLimitMax = import.meta.env.RATE_LIMIT_MAX_REQUESTS;

  // Validate caching settings
  if (enableCaching !== undefined) {
    config.ENABLE_CACHING = enableCaching === 'true';

    if (config.ENABLE_CACHING && cacheTtl) {
      const ttl = parseInt(cacheTtl, 10);
      if (isNaN(ttl) || ttl < 0) {
        warnings.push({
          variable: 'CACHE_TTL',
          message: 'Invalid cache TTL value',
          recommendation: 'Use a positive number for cache TTL in seconds',
          category: 'performance',
        });
      } else {
        config.CACHE_TTL = ttl;
      }
    }
  }

  // Validate compression
  if (compressionEnabled !== undefined) {
    config.COMPRESSION_ENABLED = compressionEnabled === 'true';
  }

  // Validate rate limiting
  if (rateLimitWindow) {
    const window = parseInt(rateLimitWindow, 10);
    if (isNaN(window) || window <= 0) {
      warnings.push({
        variable: 'RATE_LIMIT_WINDOW',
        message: 'Invalid rate limit window',
        recommendation:
          'Use a positive number for rate limit window in seconds',
        category: 'performance',
      });
    } else {
      config.RATE_LIMIT_WINDOW = window;
    }
  }

  if (rateLimitMax) {
    const max = parseInt(rateLimitMax, 10);
    if (isNaN(max) || max <= 0) {
      warnings.push({
        variable: 'RATE_LIMIT_MAX_REQUESTS',
        message: 'Invalid rate limit maximum',
        recommendation: 'Use a positive number for maximum requests',
        category: 'performance',
      });
    } else {
      config.RATE_LIMIT_MAX_REQUESTS = max;
    }
  }
}

/**
 * Validates security configuration
 */
function validateSecurityConfig(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const cspEnabled = import.meta.env.CSP_ENABLED;
  const appEnv = import.meta.env.VITE_APP_ENV;

  // Validate CSP settings
  if (cspEnabled !== undefined) {
    config.CSP_ENABLED = cspEnabled === 'true';

    if (appEnv === 'production' && !config.CSP_ENABLED) {
      warnings.push({
        variable: 'CSP_ENABLED',
        message: 'Content Security Policy is disabled in production',
        recommendation: 'Enable CSP for enhanced security in production',
        category: 'security',
      });
    }
  }
}

/**
 * Validates feature flags configuration
 */
function validateFeatureFlags(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const enableDebugTools = import.meta.env.ENABLE_DEBUG_TOOLS;
  const enableExperimental = import.meta.env.ENABLE_EXPERIMENTAL_FEATURES;
  const mockN8nResponses = import.meta.env.MOCK_N8N_RESPONSES;
  const bypassAuth = import.meta.env.BYPASS_AUTH;
  const appEnv = import.meta.env.VITE_APP_ENV;

  // Validate debug tools
  if (enableDebugTools !== undefined) {
    config.ENABLE_DEBUG_TOOLS = enableDebugTools === 'true';

    if (appEnv === 'production' && config.ENABLE_DEBUG_TOOLS) {
      errors.push({
        variable: 'ENABLE_DEBUG_TOOLS',
        message: 'Debug tools must be disabled in production',
        severity: 'error',
        category: 'security',
      });
    }
  }

  // Validate experimental features
  if (enableExperimental !== undefined) {
    config.ENABLE_EXPERIMENTAL_FEATURES = enableExperimental === 'true';

    if (appEnv === 'production' && config.ENABLE_EXPERIMENTAL_FEATURES) {
      warnings.push({
        variable: 'ENABLE_EXPERIMENTAL_FEATURES',
        message: 'Experimental features enabled in production',
        recommendation:
          'Disable experimental features in production for stability',
        category: 'best-practice',
      });
    }
  }

  // Validate mock responses
  if (mockN8nResponses !== undefined) {
    config.MOCK_N8N_RESPONSES = mockN8nResponses === 'true';

    if (appEnv === 'production' && config.MOCK_N8N_RESPONSES) {
      errors.push({
        variable: 'MOCK_N8N_RESPONSES',
        message: 'Mock responses must be disabled in production',
        severity: 'error',
        category: 'security',
      });
    }
  }

  // Validate auth bypass
  if (bypassAuth !== undefined) {
    config.BYPASS_AUTH = bypassAuth === 'true';

    if (config.BYPASS_AUTH && appEnv !== 'development') {
      errors.push({
        variable: 'BYPASS_AUTH',
        message: 'Authentication bypass must only be used in development',
        severity: 'critical',
        category: 'security',
      });
    }
  }
}

/**
 * Validates webhook configuration
 */
function validateWebhookConfig(
  config: Partial<EnvConfig>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const webhookTimeout = import.meta.env.WEBHOOK_TIMEOUT;
  const webhookRetryAttempts = import.meta.env.WEBHOOK_RETRY_ATTEMPTS;
  const circuitBreakerThreshold = import.meta.env
    .WEBHOOK_CIRCUIT_BREAKER_THRESHOLD;
  const webhookMonitoring = import.meta.env.WEBHOOK_MONITORING_ENABLED;

  // Validate webhook timeout
  if (webhookTimeout) {
    const timeout = parseInt(webhookTimeout, 10);
    if (isNaN(timeout) || timeout <= 0) {
      warnings.push({
        variable: 'WEBHOOK_TIMEOUT',
        message: 'Invalid webhook timeout value',
        recommendation: 'Use a positive number for timeout in milliseconds',
        category: 'performance',
      });
    } else {
      config.WEBHOOK_TIMEOUT = timeout;
    }
  }

  // Validate retry attempts
  if (webhookRetryAttempts) {
    const attempts = parseInt(webhookRetryAttempts, 10);
    if (isNaN(attempts) || attempts < 0) {
      warnings.push({
        variable: 'WEBHOOK_RETRY_ATTEMPTS',
        message: 'Invalid webhook retry attempts',
        recommendation: 'Use a non-negative number for retry attempts',
        category: 'performance',
      });
    } else {
      config.WEBHOOK_RETRY_ATTEMPTS = attempts;
    }
  }

  // Validate circuit breaker threshold
  if (circuitBreakerThreshold) {
    const threshold = parseInt(circuitBreakerThreshold, 10);
    if (isNaN(threshold) || threshold <= 0) {
      warnings.push({
        variable: 'WEBHOOK_CIRCUIT_BREAKER_THRESHOLD',
        message: 'Invalid circuit breaker threshold',
        recommendation: 'Use a positive number for circuit breaker threshold',
        category: 'performance',
      });
    } else {
      config.WEBHOOK_CIRCUIT_BREAKER_THRESHOLD = threshold;
    }
  }

  // Validate webhook monitoring
  if (webhookMonitoring !== undefined) {
    config.WEBHOOK_MONITORING_ENABLED = webhookMonitoring === 'true';
  }
}

/**
 * Simple URL validation
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Domain validation (supports domain:port format)
 */
function isValidDomain(domain: string): boolean {
  // Allow localhost:port format
  if (domain.startsWith('localhost:')) {
    const port = domain.split(':')[1];
    return (
      /^\d+$/.test(port) &&
      parseInt(port, 10) > 0 &&
      parseInt(port, 10) <= 65535
    );
  }

  // Check if it's a valid URL with protocol
  if (isValidUrl(`https://${domain}`) || isValidUrl(domain)) {
    return true;
  }

  // Basic domain format validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-._]*[a-zA-Z0-9]$/;
  return domainRegex.test(domain);
}

/**
 * Logs environment validation results with enhanced formatting
 */
export function logEnvironmentStatus(result: ValidationResult): void {
  console.log('🔧 Environment Configuration Status:');
  console.log('=====================================');
  console.log(`Environment: ${result.environment}`);
  console.log(`Validated at: ${result.timestamp.toISOString()}`);
  console.log('');

  if (result.isValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.log('❌ Environment validation failed');
  }

  // Log summary
  console.log('\n📊 Validation Summary:');
  console.log(`• Total Variables: ${result.summary.totalVariables}`);
  console.log(`• Valid Variables: ${result.summary.validVariables}`);
  console.log(`• Missing Required: ${result.summary.missingRequired}`);
  console.log(`• Security Issues: ${result.summary.securityIssues}`);
  console.log(`• Performance Warnings: ${result.summary.performanceWarnings}`);
  console.log(`• Recommendations: ${result.summary.recommendationsCount}`);

  // Log configuration status by category
  console.log('\n📋 Configuration Status:');

  // Application config
  console.log('\n🔧 Application:');
  console.log(
    `  • Environment: ${result.config.VITE_APP_ENV ? '✅ ' + result.config.VITE_APP_ENV : '❌ Missing'}`
  );
  console.log(
    `  • Version: ${result.config.VITE_APP_VERSION ? '✅ ' + result.config.VITE_APP_VERSION : '⚠️ Not set'}`
  );
  console.log(
    `  • Domain: ${result.config.VITE_APP_DOMAIN ? '✅ ' + result.config.VITE_APP_DOMAIN : '⚠️ Not set'}`
  );

  // Database config
  console.log('\n🗄️ Database:');
  console.log(
    `  • Supabase URL: ${result.config.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`
  );
  console.log(
    `  • Supabase Key: ${result.config.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}`
  );
  console.log(
    `  • Service Role: ${result.config.SUPABASE_SERVICE_ROLE_KEY ? '⚠️ Configured (secure)' : '➖ Not set'}`
  );

  // Integrations config
  console.log('\n🔗 Integrations:');
  console.log(
    `  • N8N Webhook: ${result.config.VITE_N8N_WEBHOOK_URL ? '✅ Configured' : '⚠️ Using fallback'}`
  );
  console.log(
    `  • Webhook Secret: ${result.config.N8N_WEBHOOK_SECRET ? '✅ Configured' : '⚠️ Not secure'}`
  );
  console.log(
    `  • N8N API: ${result.config.N8N_API_KEY ? '✅ Configured' : '➖ Not set'}`
  );

  // Monitoring config
  console.log('\n📊 Monitoring:');
  console.log(
    `  • Error Tracking: ${result.config.VITE_SENTRY_DSN ? '✅ Configured' : '⚠️ Not set'}`
  );
  console.log(
    `  • Analytics: ${result.config.ENABLE_ANALYTICS ? '✅ Enabled' : '➖ Disabled'}`
  );
  console.log(
    `  • Log Level: ${result.config.LOG_LEVEL ? '✅ ' + result.config.LOG_LEVEL : '➖ Default'}`
  );

  // Log errors with categorization
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    const criticalErrors = result.errors.filter(e => e.severity === 'critical');
    const regularErrors = result.errors.filter(e => e.severity === 'error');

    if (criticalErrors.length > 0) {
      console.log('\n  🚨 Critical Issues:');
      criticalErrors.forEach(error => {
        console.log(`    • ${error.variable}: ${error.message}`);
      });
    }

    if (regularErrors.length > 0) {
      console.log('\n  ⚠️ Configuration Issues:');
      regularErrors.forEach(error => {
        console.log(`    • ${error.variable}: ${error.message}`);
      });
    }
  }

  // Log warnings with recommendations
  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings & Recommendations:');
    const securityWarnings = result.warnings.filter(
      w => w.category === 'security'
    );
    const performanceWarnings = result.warnings.filter(
      w => w.category === 'performance'
    );
    const bestPracticeWarnings = result.warnings.filter(
      w => w.category === 'best-practice'
    );

    if (securityWarnings.length > 0) {
      console.log('\n  🔒 Security:');
      securityWarnings.forEach(warning => {
        console.log(`    • ${warning.variable}: ${warning.message}`);
        console.log(`      💡 ${warning.recommendation}`);
      });
    }

    if (performanceWarnings.length > 0) {
      console.log('\n  ⚡ Performance:');
      performanceWarnings.forEach(warning => {
        console.log(`    • ${warning.variable}: ${warning.message}`);
        console.log(`      💡 ${warning.recommendation}`);
      });
    }

    if (bestPracticeWarnings.length > 0) {
      console.log('\n  📝 Best Practices:');
      bestPracticeWarnings.forEach(warning => {
        console.log(`    • ${warning.variable}: ${warning.message}`);
        console.log(`      💡 ${warning.recommendation}`);
      });
    }
  }

  console.log('\n=====================================\n');
}

/**
 * Gets environment information for display in UI
 */
export function getEnvironmentInfo() {
  const result = validateEnvironment();

  return {
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    environment: result.environment,
    isValid: result.isValid,
    timestamp: result.timestamp,
    summary: result.summary,

    // Configuration status
    hasSupabase: !!(
      result.config.VITE_SUPABASE_URL && result.config.VITE_SUPABASE_ANON_KEY
    ),
    hasN8nWebhook: !!result.config.VITE_N8N_WEBHOOK_URL,
    hasAppDomain: !!result.config.VITE_APP_DOMAIN,
    hasErrorTracking: !!result.config.VITE_SENTRY_DSN,
    hasMonitoring: !!result.config.DATADOG_API_KEY,

    // Security status
    hasSecureWebhook:
      result.config.VITE_N8N_WEBHOOK_URL?.startsWith('https://') || false,
    hasWebhookSecret: !!result.config.N8N_WEBHOOK_SECRET,
    cspEnabled: result.config.CSP_ENABLED || false,

    // Feature flags status
    debugToolsEnabled: result.config.ENABLE_DEBUG_TOOLS || false,
    experimentalFeaturesEnabled:
      result.config.ENABLE_EXPERIMENTAL_FEATURES || false,
    mockResponsesEnabled: result.config.MOCK_N8N_RESPONSES || false,
    authBypassEnabled: result.config.BYPASS_AUTH || false,

    // Performance status
    cachingEnabled: result.config.ENABLE_CACHING || false,
    compressionEnabled: result.config.COMPRESSION_ENABLED || false,
    webhookMonitoringEnabled: result.config.WEBHOOK_MONITORING_ENABLED || false,

    errors: result.errors,
    warnings: result.warnings,
    config: result.config,
  };
}

/**
 * Checks if environment is ready for production deployment
 */
export function isProductionReady(): boolean {
  const result = validateEnvironment();

  // Must have no critical errors
  const hasCriticalErrors = result.errors.some(e => e.severity === 'critical');
  if (hasCriticalErrors) return false;

  // Must have no security errors
  const hasSecurityErrors = result.errors.some(e => e.category === 'security');
  if (hasSecurityErrors) return false;

  // Must have required production configuration
  const requiredForProduction = [
    result.config.VITE_SUPABASE_URL,
    result.config.VITE_SUPABASE_ANON_KEY,
    result.config.VITE_N8N_WEBHOOK_URL,
  ];

  return requiredForProduction.every(config => !!config);
}

/**
 * Gets health check status for monitoring
 */
export function getHealthCheckStatus() {
  const result = validateEnvironment();
  const isReady = isProductionReady();

  return {
    status: result.isValid ? (isReady ? 'healthy' : 'warning') : 'error',
    timestamp: result.timestamp,
    environment: result.environment,
    checks: {
      environment_validation: result.isValid,
      production_ready: isReady,
      database_configured: !!(
        result.config.VITE_SUPABASE_URL && result.config.VITE_SUPABASE_ANON_KEY
      ),
      webhook_configured: !!result.config.VITE_N8N_WEBHOOK_URL,
      error_tracking_configured: !!result.config.VITE_SENTRY_DSN,
      security_configured: result.config.CSP_ENABLED || false,
    },
    metrics: {
      total_variables: result.summary.totalVariables,
      valid_variables: result.summary.validVariables,
      missing_required: result.summary.missingRequired,
      security_issues: result.summary.securityIssues,
      performance_warnings: result.summary.performanceWarnings,
    },
    issues: {
      critical_errors: result.errors.filter(e => e.severity === 'critical')
        .length,
      errors: result.errors.length,
      warnings: result.warnings.length,
    },
  };
}
