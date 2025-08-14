import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock import.meta.env
const mockEnv: Record<string, string | undefined> = {};

vi.stubGlobal('import', {
  meta: {
    env: new Proxy(mockEnv, {
      get(target, prop) {
        return target[prop as string];
      },
    }),
  },
});

// Import after mocking
import {
  validateEnvironment,
  getHealthCheckStatus,
  isProductionReady,
} from '../env-validation';
import { validateSecrets, getSecretsHealthStatus } from '../secrets-management';

describe('Environment & Secrets Integration', () => {
  beforeEach(() => {
    // Clear all environment variables
    Object.keys(mockEnv).forEach(key => {
      delete mockEnv[key];
    });

    // Set default environment
    mockEnv.VITE_APP_ENV = 'development';
  });

  describe('Complete Development Environment', () => {
    it('should validate complete development setup', () => {
      // Set up complete development environment
      mockEnv.VITE_APP_ENV = 'development';
      mockEnv.VITE_APP_VERSION = '1.0.0-dev';
      mockEnv.VITE_APP_DOMAIN = 'localhost:5173';
      mockEnv.VITE_SUPABASE_URL = 'https://dev.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDAwMDB9.dev-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/test';
      mockEnv.LOG_LEVEL = 'debug';
      mockEnv.ENABLE_DEBUG_TOOLS = 'true';
      mockEnv.MOCK_N8N_RESPONSES = 'true';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();


      expect(envResult.isValid).toBe(true);
      expect(secretsResult.isValid).toBe(true);

      // Development-specific validations
      expect(envResult.config.ENABLE_DEBUG_TOOLS).toBe(true);
      expect(envResult.config.MOCK_N8N_RESPONSES).toBe(true);

      // Should have minimal critical errors
      const criticalErrors = [
        ...envResult.errors,
        ...secretsResult.errors,
      ].filter(e => e.severity === 'critical');
      expect(criticalErrors.length).toBe(0);
    });

    it('should allow insecure configurations in development', () => {
      mockEnv.VITE_APP_ENV = 'development';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'short-dev-key';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'http://localhost:5678/webhook';
      mockEnv.N8N_WEBHOOK_SECRET = 'dev-secret';
      mockEnv.BYPASS_AUTH = 'true';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();

      // Should not have critical security errors in development
      const criticalSecurityErrors = [
        ...envResult.errors,
        ...secretsResult.errors,
      ].filter(e => e.severity === 'critical' && e.category === 'security');
      expect(criticalSecurityErrors.length).toBe(0);
    });
  });

  describe('Complete Staging Environment', () => {
    it('should validate complete staging setup', () => {
      // Set up complete staging environment
      mockEnv.VITE_APP_ENV = 'staging';
      mockEnv.VITE_APP_VERSION = '1.0.0-staging';
      mockEnv.VITE_APP_DOMAIN = 'staging.example.com';
      mockEnv.VITE_SUPABASE_URL = 'https://staging.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YWdpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.staging-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://staging-n8n.example.com/webhook';
      mockEnv.N8N_WEBHOOK_SECRET = 'staging-webhook-secret-with-good-length';
      mockEnv.VITE_SENTRY_DSN = 'https://staging-sentry.io/project';
      mockEnv.LOG_LEVEL = 'info';
      mockEnv.ENABLE_CACHING = 'true';
      mockEnv.CACHE_TTL = '300';
      mockEnv.CSP_ENABLED = 'true';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();

      expect(envResult.isValid).toBe(true);
      expect(secretsResult.isValid).toBe(true);

      // Staging-specific validations
      expect(envResult.config.VITE_APP_ENV).toBe('staging');
      expect(envResult.config.ENABLE_CACHING).toBe(true);
      expect(envResult.config.CSP_ENABLED).toBe(true);
    });

    it('should enforce HTTPS in staging', () => {
      mockEnv.VITE_APP_ENV = 'staging';
      mockEnv.VITE_SUPABASE_URL = 'https://staging.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.staging-key';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'http://insecure-staging.com/webhook';

      const envResult = validateEnvironment();

      // Should have security errors for non-HTTPS in staging
      expect(
        envResult.errors.some(
          e =>
            e.variable === 'VITE_N8N_WEBHOOK_URL' && e.category === 'security'
        )
      ).toBe(false); // Only enforced in production
    });
  });

  describe('Complete Production Environment', () => {
    it('should validate complete production setup', () => {
      // Set up complete production environment
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_APP_VERSION = '1.0.0';
      mockEnv.VITE_APP_DOMAIN = 'app.example.com';
      mockEnv.VITE_CDN_URL = 'https://cdn.example.com';
      mockEnv.VITE_SUPABASE_URL = 'https://prod.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.production-signature-that-is-long-enough-for-validation';
      mockEnv.SUPABASE_SERVICE_ROLE_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDAwMDB9.service-role-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://n8n.example.com/webhook';
      mockEnv.N8N_WEBHOOK_SECRET =
        'VerySecureProductionWebhookSecret123!WithSymbols';
      mockEnv.N8N_API_KEY = 'prod-api-key-with-sufficient-length';
      mockEnv.VITE_SENTRY_DSN = 'https://sentry.io/production-project';
      mockEnv.DATADOG_API_KEY = 'datadog-production-api-key';
      mockEnv.JWT_SECRET = 'ProductionJWTSecret123!WithGoodComplexity&Length';
      mockEnv.ENCRYPTION_KEY =
        'ProductionEncryptionKey456!WithExcellentSecurity';
      mockEnv.LOG_LEVEL = 'warn';
      mockEnv.ENABLE_CACHING = 'true';
      mockEnv.CACHE_TTL = '3600';
      mockEnv.COMPRESSION_ENABLED = 'true';
      mockEnv.CSP_ENABLED = 'true';
      mockEnv.RATE_LIMIT_WINDOW = '900';
      mockEnv.RATE_LIMIT_MAX_REQUESTS = '1000';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();

      expect(envResult.isValid).toBe(true);
      expect(secretsResult.isValid).toBe(true);

      // Production-specific validations
      expect(envResult.config.VITE_APP_ENV).toBe('production');
      expect(envResult.config.CSP_ENABLED).toBe(true);
      expect(envResult.config.COMPRESSION_ENABLED).toBe(true);

      // All secrets should be strong in production
      const securitySecrets = secretsResult.secrets.filter(
        s => s.category === 'security' && s.value
      );
      securitySecrets.forEach(secret => {
        expect(secret.strength).toBe('strong');
      });
    });

    it('should reject insecure production configurations', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://prod.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prod-key';
      mockEnv.ENABLE_DEBUG_TOOLS = 'true';
      mockEnv.MOCK_N8N_RESPONSES = 'true';
      mockEnv.BYPASS_AUTH = 'true';
      mockEnv.JWT_SECRET = 'weak';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();

      expect(envResult.isValid).toBe(false);
      expect(secretsResult.isValid).toBe(false);

      // Should have critical security errors
      const criticalErrors = [
        ...envResult.errors,
        ...secretsResult.errors,
      ].filter(e => e.severity === 'critical');
      expect(criticalErrors.length).toBeGreaterThan(0);
    });

    it('should require HTTPS for all external services in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://prod.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prod-key';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'http://insecure-webhook.com';

      const envResult = validateEnvironment();

      expect(
        envResult.errors.some(
          e =>
            e.variable === 'VITE_N8N_WEBHOOK_URL' && e.category === 'security'
        )
      ).toBe(true);
    });
  });

  describe('Health Check Integration', () => {
    it('should provide comprehensive health status', () => {
      // Set up a good configuration
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://prod.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.production-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://n8n.example.com/webhook';
      mockEnv.N8N_WEBHOOK_SECRET = 'VerySecureProductionWebhookSecret123!';
      mockEnv.JWT_SECRET = 'ProductionJWTSecret123!WithGoodComplexity';
      mockEnv.ENCRYPTION_KEY =
        'ProductionEncryptionKey456!WithExcellentSecurity';

      const envHealth = getHealthCheckStatus();
      const secretsHealth = getSecretsHealthStatus();

      expect(envHealth.status).toBe('healthy');
      expect(secretsHealth.status).toBe('healthy');

      // Should have all required checks passing
      expect(envHealth.checks.environment_validation).toBe(true);
      expect(envHealth.checks.database_configured).toBe(true);
      expect(envHealth.checks.webhook_configured).toBe(true);
      expect(secretsHealth.checks.secrets_validation).toBe(true);
      expect(secretsHealth.checks.missing_required).toBe(true);
      expect(secretsHealth.checks.no_exposure_risks).toBe(true);
    });

    it('should detect configuration problems in health checks', () => {
      // Set up problematic configuration
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.JWT_SECRET = 'weak';

      const envHealth = getHealthCheckStatus();
      const secretsHealth = getSecretsHealthStatus();

      expect(envHealth.status).toBe('error');
      expect(secretsHealth.status).toBe('warning');

      // Should have failing checks
      expect(envHealth.checks.database_configured).toBe(false);
      expect(secretsHealth.checks.secrets_validation).toBe(false);
    });
  });

  describe('Production Readiness Assessment', () => {
    it('should correctly assess production readiness', () => {
      // Set up production-ready configuration
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://prod.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.production-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://n8n.example.com/webhook';
      mockEnv.N8N_WEBHOOK_SECRET = 'VerySecureProductionWebhookSecret123!';
      mockEnv.JWT_SECRET = 'ProductionJWTSecret123!WithGoodComplexity';
      mockEnv.ENCRYPTION_KEY =
        'ProductionEncryptionKey456!WithExcellentSecurity';
      mockEnv.VITE_SENTRY_DSN = 'https://sentry.io/project';

      const isReady = isProductionReady();
      const secretsResult = validateSecrets();

      expect(isReady).toBe(true);
      expect(secretsResult.isValid).toBe(true);
    });

    it('should reject non-production-ready configuration', () => {
      // Set up non-production-ready configuration
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.ENABLE_DEBUG_TOOLS = 'true';
      mockEnv.JWT_SECRET = 'weak';

      const isReady = isProductionReady();
      const secretsResult = validateSecrets();

      expect(isReady).toBe(false);
      expect(secretsResult.isValid).toBe(false);
    });
  });

  describe('Cross-System Dependencies', () => {
    it('should validate database and webhook integration', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://n8n.example.com/webhook';
      mockEnv.N8N_WEBHOOK_SECRET = 'secure-webhook-secret';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();

      // Both systems should recognize database configuration
      expect(envResult.config.VITE_SUPABASE_URL).toBeDefined();
      expect(
        secretsResult.secrets.some(
          s => s.name === 'VITE_SUPABASE_URL' && s.value
        )
      ).toBe(true);

      // Both systems should recognize webhook configuration
      expect(envResult.config.VITE_N8N_WEBHOOK_URL).toBeDefined();
      expect(
        secretsResult.secrets.some(
          s => s.name === 'N8N_WEBHOOK_SECRET' && s.value
        )
      ).toBe(true);
    });

    it('should validate monitoring integration', () => {
      mockEnv.VITE_SENTRY_DSN = 'https://sentry.io/project';
      mockEnv.DATADOG_API_KEY = 'datadog-api-key';
      mockEnv.LOG_LEVEL = 'info';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();

      // Environment validation should handle monitoring config
      expect(envResult.config.VITE_SENTRY_DSN).toBeDefined();
      expect(envResult.config.LOG_LEVEL).toBe('info');

      // Secrets validation should handle monitoring secrets
      expect(
        secretsResult.secrets.some(
          s => s.name === 'VITE_SENTRY_DSN' && s.category === 'monitoring'
        )
      ).toBe(true);
      expect(
        secretsResult.secrets.some(
          s => s.name === 'DATADOG_API_KEY' && s.category === 'monitoring'
        )
      ).toBe(true);
    });
  });

  describe('Error Correlation', () => {
    it('should correlate related errors across systems', () => {
      // Set up configuration with related errors
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://webhook.example.com';
      // Missing webhook secret will cause issues in both systems

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();

      // Environment validation should warn about missing webhook secret
      expect(
        envResult.warnings.some(w => w.variable === 'N8N_WEBHOOK_SECRET')
      ).toBe(true);

      // Secrets validation should also flag this
      expect(
        secretsResult.warnings.some(w => w.secret === 'N8N_WEBHOOK_SECRET')
      ).toBe(true);
    });
  });

  describe('Complete System Validation', () => {
    it('should validate entire system health', () => {
      // Set up minimal working configuration
      mockEnv.VITE_APP_ENV = 'development';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const envResult = validateEnvironment();
      const secretsResult = validateSecrets();
      const envHealth = getHealthCheckStatus();
      const secretsHealth = getSecretsHealthStatus();

      // System should be functional with minimal configuration
      expect(envResult.isValid).toBe(true);
      expect(secretsResult.isValid).toBe(true);

      // Health checks should reflect system state
      expect(envHealth.checks.environment_validation).toBe(true);
      expect(envHealth.checks.database_configured).toBe(true);
      expect(secretsHealth.checks.secrets_validation).toBe(true);

      // Should have reasonable metrics
      expect(envResult.summary.totalVariables).toBeGreaterThan(0);
      expect(secretsResult.summary.totalSecrets).toBeGreaterThan(0);
    });
  });
});
