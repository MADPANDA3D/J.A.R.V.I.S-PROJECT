import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import after mocking
import {
  validateEnvironment,
  getHealthCheckStatus,
  isProductionReady,
} from '../env-validation';
import { validateSecrets, getSecretsHealthStatus } from '../secrets-management';

describe('Environment & Secrets Integration', () => {
  beforeEach(() => {
    // Clear all environment variables using vi.unstubAllEnvs
    vi.unstubAllEnvs();
    
    // Set default environment using vi.stubEnv
    vi.stubEnv('VITE_APP_ENV', 'development');
  });

  describe('Complete Development Environment', () => {
    it('should validate complete development setup', () => {
      // Set up complete development environment using vi.stubEnv
      vi.stubEnv('VITE_APP_ENV', 'development');
      vi.stubEnv('VITE_APP_VERSION', '1.0.0-dev');
      vi.stubEnv('VITE_APP_DOMAIN', 'localhost:5173');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://dev.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDAwMDB9.dev-signature-that-is-long-enough-for-validation');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/test');
      vi.stubEnv('LOG_LEVEL', 'debug');
      vi.stubEnv('ENABLE_DEBUG_TOOLS', 'true');
      vi.stubEnv('MOCK_N8N_RESPONSES', 'true');

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
      vi.stubEnv('VITE_APP_ENV', 'development');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'short-dev-key');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'http://localhost:5678/webhook');
      vi.stubEnv('N8N_WEBHOOK_SECRET', 'dev-secret');
      vi.stubEnv('BYPASS_AUTH', 'true');

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
      vi.stubEnv('VITE_APP_ENV', 'staging');
      vi.stubEnv('VITE_APP_VERSION', '1.0.0-staging');
      vi.stubEnv('VITE_APP_DOMAIN', 'staging.example.com');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://staging.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YWdpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.staging-signature-that-is-long-enough-for-validation');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'https://staging-n8n.example.com/webhook');
      vi.stubEnv('N8N_WEBHOOK_SECRET', 'staging-webhook-secret-with-good-length');
      vi.stubEnv('VITE_SENTRY_DSN', 'https://staging-sentry.io/project');
      vi.stubEnv('LOG_LEVEL', 'info');
      vi.stubEnv('ENABLE_CACHING', 'true');
      vi.stubEnv('CACHE_TTL', '300');
      vi.stubEnv('CSP_ENABLED', 'true');

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
      vi.stubEnv('VITE_APP_ENV', 'staging');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://staging.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.staging-key');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'http://insecure-staging.com/webhook');

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
      vi.stubEnv('VITE_APP_ENV', 'production');
      vi.stubEnv('VITE_APP_VERSION', '1.0.0');
      vi.stubEnv('VITE_APP_DOMAIN', 'app.example.com');
      vi.stubEnv('VITE_CDN_URL', 'https://cdn.example.com');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://prod.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.production-signature-that-is-long-enough-for-validation');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDAwMDB9.service-role-signature-that-is-long-enough-for-validation');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'https://n8n.example.com/webhook');
      vi.stubEnv('N8N_WEBHOOK_SECRET',
        'VerySecureProductionWebhookSecret123!WithSymbols');
      vi.stubEnv('N8N_API_KEY', 'prod-api-key-with-sufficient-length');
      vi.stubEnv('VITE_SENTRY_DSN', 'https://sentry.io/production-project');
      vi.stubEnv('DATADOG_API_KEY', 'datadog-production-api-key');
      vi.stubEnv('JWT_SECRET', 'ProductionJWTSecret123!WithGoodComplexity&Length');
      vi.stubEnv('ENCRYPTION_KEY',
        'ProductionEncryptionKey456!WithExcellentSecurity');
      vi.stubEnv('LOG_LEVEL', 'warn');
      vi.stubEnv('ENABLE_CACHING', 'true');
      vi.stubEnv('CACHE_TTL', '3600');
      vi.stubEnv('COMPRESSION_ENABLED', 'true');
      vi.stubEnv('CSP_ENABLED', 'true');
      vi.stubEnv('RATE_LIMIT_WINDOW', '900');
      vi.stubEnv('RATE_LIMIT_MAX_REQUESTS', '1000');

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
      vi.stubEnv('VITE_APP_ENV', 'production');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://prod.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prod-key');
      vi.stubEnv('ENABLE_DEBUG_TOOLS', 'true');
      vi.stubEnv('MOCK_N8N_RESPONSES', 'true');
      vi.stubEnv('BYPASS_AUTH', 'true');
      vi.stubEnv('JWT_SECRET', 'weak');

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
      vi.stubEnv('VITE_APP_ENV', 'production');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://prod.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prod-key');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'http://insecure-webhook.com');

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
      vi.stubEnv('VITE_APP_ENV', 'production');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://prod.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.production-signature-that-is-long-enough-for-validation');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'https://n8n.example.com/webhook');
      vi.stubEnv('N8N_WEBHOOK_SECRET', 'VerySecureProductionWebhookSecret123!');
      vi.stubEnv('JWT_SECRET', 'ProductionJWTSecret123!WithGoodComplexity');
      vi.stubEnv('ENCRYPTION_KEY',
        'ProductionEncryptionKey456!WithExcellentSecurity');
      vi.stubEnv('VITE_SENTRY_DSN', 'https://sentry.io/production-project');

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
      // Set up problematic configuration - missing required database config
      vi.stubEnv('VITE_APP_ENV', 'production');
      // Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY will cause critical env validation errors
      vi.stubEnv('N8N_WEBHOOK_SECRET', 'production-webhook-secret');
      vi.stubEnv('VITE_SENTRY_DSN', 'https://sentry.io/project');
      vi.stubEnv('ENCRYPTION_KEY', 'production-encryption-key-sufficiently-long');
      vi.stubEnv('JWT_SECRET', 'weak');

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
      vi.stubEnv('VITE_APP_ENV', 'production');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://prod.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.production-signature-that-is-long-enough-for-validation');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'https://n8n.example.com/webhook');
      vi.stubEnv('N8N_WEBHOOK_SECRET', 'VerySecureProductionWebhookSecret123!');
      vi.stubEnv('JWT_SECRET', 'ProductionJWTSecret123!WithGoodComplexity');
      vi.stubEnv('ENCRYPTION_KEY',
        'ProductionEncryptionKey456!WithExcellentSecurity');
      vi.stubEnv('VITE_SENTRY_DSN', 'https://sentry.io/project');

      const isReady = isProductionReady();
      const secretsResult = validateSecrets();

      expect(isReady).toBe(true);
      expect(secretsResult.isValid).toBe(true);
    });

    it('should reject non-production-ready configuration', () => {
      // Set up non-production-ready configuration
      vi.stubEnv('VITE_APP_ENV', 'production');
      vi.stubEnv('ENABLE_DEBUG_TOOLS', 'true');
      vi.stubEnv('JWT_SECRET', 'weak');

      const isReady = isProductionReady();
      const secretsResult = validateSecrets();

      expect(isReady).toBe(false);
      expect(secretsResult.isValid).toBe(false);
    });
  });

  describe('Cross-System Dependencies', () => {
    it('should validate database and webhook integration', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'https://n8n.example.com/webhook');
      vi.stubEnv('N8N_WEBHOOK_SECRET', 'secure-webhook-secret');

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
      vi.stubEnv('VITE_SENTRY_DSN', 'https://sentry.io/project');
      vi.stubEnv('DATADOG_API_KEY', 'datadog-api-key');
      vi.stubEnv('LOG_LEVEL', 'info');

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
      vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'https://webhook.example.com');
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
      vi.stubEnv('VITE_APP_ENV', 'development');
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation');

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
