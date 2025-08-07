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
  getEnvironmentInfo,
  isProductionReady,
  getHealthCheckStatus,
  logEnvironmentStatus,
} from '../env-validation';

describe('Enhanced Environment Validation', () => {
  beforeEach(() => {
    // Clear all environment variables
    Object.keys(mockEnv).forEach(key => {
      delete mockEnv[key];
    });

    // Set default environment
    mockEnv.VITE_APP_ENV = 'development';
  });

  describe('Application Configuration Validation', () => {
    it('should validate application environment correctly', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      expect(result.config.VITE_APP_ENV).toBe('production');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid environment values', () => {
      mockEnv.VITE_APP_ENV = 'invalid';

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          e => e.variable === 'VITE_APP_ENV' && e.category === 'format'
        )
      ).toBe(true);
    });

    it('should warn about missing version in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          w =>
            w.variable === 'VITE_APP_VERSION' && w.category === 'best-practice'
        )
      ).toBe(true);
    });

    it('should validate domain format', () => {
      mockEnv.VITE_APP_DOMAIN = 'invalid-domain-format';

      const result = validateEnvironment();

      expect(result.warnings.some(w => w.variable === 'VITE_APP_DOMAIN')).toBe(
        true
      );
    });
  });

  describe('Database Configuration Validation', () => {
    it('should require Supabase URL and key', () => {
      // Don't set required variables

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          e => e.variable === 'VITE_SUPABASE_URL' && e.severity === 'critical'
        )
      ).toBe(true);
      expect(
        result.errors.some(
          e =>
            e.variable === 'VITE_SUPABASE_ANON_KEY' && e.severity === 'critical'
        )
      ).toBe(true);
    });

    it('should validate Supabase URL format', () => {
      mockEnv.VITE_SUPABASE_URL = 'invalid-url';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'test-key';

      const result = validateEnvironment();

      expect(
        result.errors.some(
          e => e.variable === 'VITE_SUPABASE_URL' && e.category === 'format'
        )
      ).toBe(true);
    });

    it('should warn about short Supabase keys', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'short-key';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          w =>
            w.variable === 'VITE_SUPABASE_ANON_KEY' && w.category === 'security'
        )
      ).toBe(true);
    });

    it('should warn about service role key security', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      mockEnv.SUPABASE_SERVICE_ROLE_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDAwMDB9.service-role-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          w =>
            w.variable === 'SUPABASE_SERVICE_ROLE_KEY' &&
            w.category === 'security'
        )
      ).toBe(true);
    });
  });

  describe('External Integrations Validation', () => {
    it('should validate N8N webhook URL format', () => {
      mockEnv.VITE_N8N_WEBHOOK_URL = 'invalid-webhook-url';

      const result = validateEnvironment();

      expect(
        result.errors.some(
          e => e.variable === 'VITE_N8N_WEBHOOK_URL' && e.category === 'format'
        )
      ).toBe(true);
    });

    it('should require HTTPS for production webhooks', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'http://insecure-webhook.com';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      expect(
        result.errors.some(
          e =>
            e.variable === 'VITE_N8N_WEBHOOK_URL' && e.category === 'security'
        )
      ).toBe(true);
    });

    it('should warn about missing webhook secret', () => {
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://webhook.example.com';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          w => w.variable === 'N8N_WEBHOOK_SECRET' && w.category === 'security'
        )
      ).toBe(true);
    });

    it('should warn about weak webhook secrets', () => {
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://webhook.example.com';
      mockEnv.N8N_WEBHOOK_SECRET = 'weak';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          w => w.variable === 'N8N_WEBHOOK_SECRET' && w.category === 'security'
        )
      ).toBe(true);
    });
  });

  describe('Security Configuration Validation', () => {
    it('should prevent debug tools in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.ENABLE_DEBUG_TOOLS = 'true';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      expect(
        result.errors.some(
          e => e.variable === 'ENABLE_DEBUG_TOOLS' && e.category === 'security'
        )
      ).toBe(true);
    });

    it('should prevent mock responses in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.MOCK_N8N_RESPONSES = 'true';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      expect(
        result.errors.some(
          e => e.variable === 'MOCK_N8N_RESPONSES' && e.category === 'security'
        )
      ).toBe(true);
    });

    it('should prevent auth bypass outside development', () => {
      mockEnv.VITE_APP_ENV = 'staging';
      mockEnv.BYPASS_AUTH = 'true';

      const result = validateEnvironment();

      expect(
        result.errors.some(
          e => e.variable === 'BYPASS_AUTH' && e.severity === 'critical'
        )
      ).toBe(true);
    });

    it('should warn about missing CSP in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.CSP_ENABLED = 'false';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          w => w.variable === 'CSP_ENABLED' && w.category === 'security'
        )
      ).toBe(true);
    });
  });

  describe('Performance Configuration Validation', () => {
    it('should validate cache TTL values', () => {
      mockEnv.ENABLE_CACHING = 'true';
      mockEnv.CACHE_TTL = 'invalid';

      const result = validateEnvironment();

      expect(
        result.warnings.some(
          w => w.variable === 'CACHE_TTL' && w.category === 'performance'
        )
      ).toBe(true);
    });

    it('should validate rate limiting configuration', () => {
      mockEnv.RATE_LIMIT_WINDOW = '0';
      mockEnv.RATE_LIMIT_MAX_REQUESTS = '-1';

      const result = validateEnvironment();

      expect(
        result.warnings.some(w => w.variable === 'RATE_LIMIT_WINDOW')
      ).toBe(true);
      expect(
        result.warnings.some(w => w.variable === 'RATE_LIMIT_MAX_REQUESTS')
      ).toBe(true);
    });

    it('should validate webhook performance settings', () => {
      mockEnv.WEBHOOK_TIMEOUT = 'invalid';
      mockEnv.WEBHOOK_RETRY_ATTEMPTS = '-1';
      mockEnv.WEBHOOK_CIRCUIT_BREAKER_THRESHOLD = '0';

      const result = validateEnvironment();

      expect(result.warnings.some(w => w.variable === 'WEBHOOK_TIMEOUT')).toBe(
        true
      );
      expect(
        result.warnings.some(w => w.variable === 'WEBHOOK_RETRY_ATTEMPTS')
      ).toBe(true);
      expect(
        result.warnings.some(
          w => w.variable === 'WEBHOOK_CIRCUIT_BREAKER_THRESHOLD'
        )
      ).toBe(true);
    });
  });

  describe('Production Readiness', () => {
    it('should identify production-ready configuration', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://webhook.example.com';

      const isReady = isProductionReady();

      expect(isReady).toBe(true);
    });

    it('should identify non-production-ready configuration', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.ENABLE_DEBUG_TOOLS = 'true';

      const isReady = isProductionReady();

      expect(isReady).toBe(false);
    });
  });

  describe('Health Check Status', () => {
    it('should return healthy status for valid configuration', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://webhook.example.com';

      const health = getHealthCheckStatus();

      expect(health.status).toBe('healthy');
      expect(health.checks.environment_validation).toBe(true);
      expect(health.checks.database_configured).toBe(true);
      expect(health.checks.webhook_configured).toBe(true);
    });

    it('should return error status for invalid configuration', () => {
      // No required variables set

      const health = getHealthCheckStatus();

      expect(health.status).toBe('error');
      expect(health.checks.environment_validation).toBe(false);
      expect(health.checks.database_configured).toBe(false);
    });

    it('should include metrics in health status', () => {
      const health = getHealthCheckStatus();

      expect(health.metrics).toHaveProperty('total_variables');
      expect(health.metrics).toHaveProperty('valid_variables');
      expect(health.metrics).toHaveProperty('missing_required');
      expect(health.metrics).toHaveProperty('security_issues');
      expect(health.metrics).toHaveProperty('performance_warnings');
    });
  });

  describe('Environment Info', () => {
    it('should return comprehensive environment information', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://webhook.example.com';
      mockEnv.N8N_WEBHOOK_SECRET = 'secure-webhook-secret-key';
      mockEnv.VITE_SENTRY_DSN = 'https://sentry.io/test';

      const info = getEnvironmentInfo();

      expect(info).toHaveProperty('environment', 'development');
      expect(info).toHaveProperty('isValid', true);
      expect(info).toHaveProperty('hasSupabase', true);
      expect(info).toHaveProperty('hasN8nWebhook', true);
      expect(info).toHaveProperty('hasErrorTracking', true);
      expect(info).toHaveProperty('hasSecureWebhook', true);
      expect(info).toHaveProperty('hasWebhookSecret', true);
    });
  });

  describe('Logging', () => {
    it('should log environment status without errors', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();
      logEnvironmentStatus(result);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Cross-Environment Validation', () => {
    it('should handle development environment specifics', () => {
      mockEnv.VITE_APP_ENV = 'development';
      mockEnv.BYPASS_AUTH = 'true';
      mockEnv.ENABLE_DEBUG_TOOLS = 'true';

      const result = validateEnvironment();

      // These should be allowed in development
      expect(
        result.errors.some(
          e => e.variable === 'BYPASS_AUTH' && e.severity === 'critical'
        )
      ).toBe(false);
    });

    it('should handle staging environment specifics', () => {
      mockEnv.VITE_APP_ENV = 'staging';
      mockEnv.ENABLE_EXPERIMENTAL_FEATURES = 'true';
      mockEnv.VITE_SUPABASE_URL = 'https://staging.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';

      const result = validateEnvironment();

      // Experimental features should generate warnings but not errors in staging
      expect(
        result.warnings.some(w => w.variable === 'ENABLE_EXPERIMENTAL_FEATURES')
      ).toBe(false); // Only warns in production
    });

    it('should handle production environment specifics', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      mockEnv.ENABLE_EXPERIMENTAL_FEATURES = 'true';

      const result = validateEnvironment();

      // Experimental features should generate warnings in production
      expect(
        result.warnings.some(
          w =>
            w.variable === 'ENABLE_EXPERIMENTAL_FEATURES' &&
            w.category === 'best-practice'
        )
      ).toBe(true);
    });
  });
});
