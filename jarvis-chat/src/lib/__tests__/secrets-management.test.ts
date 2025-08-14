import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SecretsManager,
  validateSecrets,
  logSecretsStatus,
  getSecretsHealthStatus,
} from '../secrets-management';

// Mock environment for testing
const mockEnv: Record<string, string | undefined> = {};

describe('Secrets Management System', () => {

  beforeEach(() => {
    // Clear all environment variables
    Object.keys(mockEnv).forEach(key => {
      delete mockEnv[key];
    });

    // Set default environment
    mockEnv.VITE_APP_ENV = 'development';

    // Test environment is set up for each test
  });

  describe('Secret Strength Assessment', () => {
    it('should identify strong secrets', () => {
      // Strong secret: long, mixed case, numbers, symbols
      mockEnv.JWT_SECRET = 'MyVerySecureJWT$ecret123WithSymbols!AndNumbers456';

      const manager = new SecretsManager(mockEnv);
      const result = manager.validateSecrets();

      const jwtSecret = result.secrets.find(s => s.name === 'JWT_SECRET');
      expect(jwtSecret?.strength).toBe('strong');
    });

    it('should identify medium strength secrets', () => {
      // Medium secret: decent length, some complexity
      mockEnv.JWT_SECRET = 'MediumSecret123';

      const manager = new SecretsManager(mockEnv);
      const result = manager.validateSecrets();

      const jwtSecret = result.secrets.find(s => s.name === 'JWT_SECRET');
      expect(jwtSecret?.strength).toBe('medium');
    });

    it('should identify weak secrets', () => {
      // Weak secret: short or simple
      mockEnv.JWT_SECRET = 'weak123';

      const manager = new SecretsManager(mockEnv);
      const result = manager.validateSecrets();

      const jwtSecret = result.secrets.find(s => s.name === 'JWT_SECRET');
      expect(jwtSecret?.strength).toBe('weak');
    });

    it('should identify empty secrets as weak', () => {
      mockEnv.JWT_SECRET = '';

      const manager = new SecretsManager(mockEnv);
      const result = manager.validateSecrets();

      const jwtSecret = result.secrets.find(s => s.name === 'JWT_SECRET');
      expect(jwtSecret?.strength).toBe('weak');
    });
  });

  describe('Required Secrets Validation', () => {
    it('should require Supabase URL and key', () => {
      // Don't set required variables

      const result = validateSecrets(mockEnv);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          e => e.secret === 'VITE_SUPABASE_URL' && e.category === 'missing'
        )
      ).toBe(true);
      expect(
        result.errors.some(
          e => e.secret === 'VITE_SUPABASE_ANON_KEY' && e.category === 'missing'
        )
      ).toBe(true);
    });

    it('should require webhook secret in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const result = validateSecrets(mockEnv);

      expect(
        result.errors.some(
          e => e.secret === 'N8N_WEBHOOK_SECRET' && e.category === 'missing'
        )
      ).toBe(true);
    });

    it('should require security secrets in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const result = validateSecrets(mockEnv);

      expect(
        result.errors.some(
          e => e.secret === 'ENCRYPTION_KEY' && e.category === 'missing'
        )
      ).toBe(true);
    });

    it('should not require monitoring secrets in development', () => {
      mockEnv.VITE_APP_ENV = 'development';

      const result = validateSecrets(mockEnv);

      expect(
        result.errors.some(
          e => e.secret === 'VITE_SENTRY_DSN' && e.category === 'missing'
        )
      ).toBe(false);
    });
  });

  describe('Security Validation', () => {
    it('should detect weak security secrets as errors', () => {
      mockEnv.JWT_SECRET = 'weak';
      mockEnv.N8N_WEBHOOK_SECRET = '123';

      const result = validateSecrets(mockEnv);

      expect(
        result.errors.some(
          e => e.secret === 'JWT_SECRET' && e.category === 'strength'
        )
      ).toBe(true);
      expect(
        result.errors.some(
          e => e.secret === 'N8N_WEBHOOK_SECRET' && e.category === 'strength'
        )
      ).toBe(true);
    });

    it('should warn about client-exposed security secrets', () => {
      mockEnv.VITE_SECURITY_SECRET = 'test-secret';

      const manager = new SecretsManager(mockEnv);
      // Manually add a VITE_ prefixed security secret to test this
      manager['secrets'].set('VITE_SECURITY_SECRET', {
        name: 'VITE_SECURITY_SECRET',
        value: 'test-secret',
        isRequired: false,
        description: 'Test security secret',
        category: 'security',
        environment: 'all',
        strength: 'medium',
      });

      const result = manager.validateSecrets();

      expect(
        result.errors.some(
          e => e.secret === 'VITE_SECURITY_SECRET' && e.category === 'exposure'
        )
      ).toBe(true);
    });

    it('should warn about service role key exposure', () => {
      mockEnv.SUPABASE_SERVICE_ROLE_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDAwMDB9.service-role-signature';

      const result = validateSecrets(mockEnv);

      expect(
        result.warnings.some(
          w =>
            w.secret === 'SUPABASE_SERVICE_ROLE_KEY' &&
            w.category === 'security'
        )
      ).toBe(true);
    });

    it('should detect default values in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.JWT_SECRET = 'your-secret-here';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const result = validateSecrets(mockEnv);

      expect(
        result.errors.some(
          e => e.secret === 'JWT_SECRET' && e.category === 'exposure'
        )
      ).toBe(true);
    });

    it('should detect development URLs in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'http://localhost:3000';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const result = validateSecrets(mockEnv);

      expect(
        result.errors.some(
          e => e.secret === 'VITE_SUPABASE_URL' && e.category === 'format'
        )
      ).toBe(true);
    });
  });

  describe('Secret Categorization', () => {
    it('should categorize secrets correctly', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'test-key';
      mockEnv.N8N_WEBHOOK_SECRET = 'webhook-secret';
      mockEnv.VITE_SENTRY_DSN = 'https://sentry.io/test';
      mockEnv.JWT_SECRET = 'jwt-secret';

      const manager = new SecretsManager(mockEnv);
      const databaseSecrets = manager.getSecretsByCategory('database');
      const webhookSecrets = manager.getSecretsByCategory('webhook');
      const monitoringSecrets = manager.getSecretsByCategory('monitoring');
      const securitySecrets = manager.getSecretsByCategory('security');

      expect(databaseSecrets.some(s => s.name === 'VITE_SUPABASE_URL')).toBe(
        true
      );
      expect(webhookSecrets.some(s => s.name === 'N8N_WEBHOOK_SECRET')).toBe(
        true
      );
      expect(monitoringSecrets.some(s => s.name === 'VITE_SENTRY_DSN')).toBe(
        true
      );
      expect(securitySecrets.some(s => s.name === 'JWT_SECRET')).toBe(true);
    });
  });

  describe('Secret Access Logging', () => {
    it('should log secret access', () => {
      const manager = new SecretsManager(mockEnv);

      manager.getSecret('VITE_SUPABASE_URL');
      manager.getSecret('JWT_SECRET');

      const auditLog = manager.getAuditLog();

      expect(
        auditLog.some(
          entry =>
            entry.secret === 'VITE_SUPABASE_URL' && entry.operation === 'read'
        )
      ).toBe(true);
      expect(
        auditLog.some(
          entry => entry.secret === 'JWT_SECRET' && entry.operation === 'read'
        )
      ).toBe(true);
    });

    it('should limit audit log size', () => {
      const manager = new SecretsManager(mockEnv);

      // Simulate many accesses
      for (let i = 0; i < 1200; i++) {
        manager.logAccess('TEST_SECRET', 'read');
      }

      const auditLog = manager.getAuditLog();
      expect(auditLog.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Rotation Status', () => {
    it('should track rotation status', () => {
      mockEnv.N8N_WEBHOOK_SECRET = 'test-webhook-secret';
      mockEnv.JWT_SECRET = 'test-jwt-secret';

      const manager = new SecretsManager(mockEnv);
      const rotationStatus = manager.getRotationStatus();

      expect(
        rotationStatus.some(status => status.secret === 'N8N_WEBHOOK_SECRET')
      ).toBe(true);
      expect(
        rotationStatus.some(status => status.secret === 'JWT_SECRET')
      ).toBe(true);
    });

    it('should identify overdue rotations', () => {
      mockEnv.JWT_SECRET = 'test-jwt-secret';

      const manager = new SecretsManager(mockEnv);

      // Simulate old rotation date
      const jwtSecret = manager['secrets'].get('JWT_SECRET');
      if (jwtSecret) {
        jwtSecret.lastRotated = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
        manager['secrets'].set('JWT_SECRET', jwtSecret);
      }

      const rotationStatus = manager.getRotationStatus();
      const jwtStatus = rotationStatus.find(s => s.secret === 'JWT_SECRET');

      expect(jwtStatus?.status).toBe('overdue');
    });

    it('should identify upcoming rotation needs', () => {
      mockEnv.JWT_SECRET = 'test-jwt-secret';

      const manager = new SecretsManager(mockEnv);

      // Simulate recent but due-soon rotation date
      const jwtSecret = manager['secrets'].get('JWT_SECRET');
      if (jwtSecret) {
        jwtSecret.lastRotated = new Date(Date.now() - 27 * 24 * 60 * 60 * 1000); // 27 days ago (30-day rotation, 5-day threshold)
        manager['secrets'].set('JWT_SECRET', jwtSecret);
      }

      const rotationStatus = manager.getRotationStatus();
      const jwtStatus = rotationStatus.find(s => s.secret === 'JWT_SECRET');

      expect(jwtStatus?.status).toBe('due_soon');
    });
  });

  describe('Summary Generation', () => {
    it('should generate accurate summary', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      mockEnv.JWT_SECRET = 'weak'; // This will generate strength issue

      const result = validateSecrets(mockEnv);

      expect(result.summary.totalSecrets).toBeGreaterThan(0);
      expect(result.summary.validSecrets).toBeGreaterThan(0);
      expect(result.summary.strengthIssues).toBeGreaterThan(0);
      expect(typeof result.summary.missingRequired).toBe('number');
      expect(typeof result.summary.exposureRisks).toBe('number');
      expect(typeof result.summary.rotationNeeded).toBe('number');
    });
  });

  describe('Health Status', () => {
    it('should return healthy status for good configuration', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      mockEnv.N8N_WEBHOOK_SECRET =
        'very-secure-webhook-secret-with-good-length';

      const health = getSecretsHealthStatus(mockEnv);

      expect(health.status).toBe('healthy');
      expect(health.checks.secrets_validation).toBe(true);
      expect(health.checks.missing_required).toBe(true);
      expect(health.checks.no_exposure_risks).toBe(true);
    });

    it('should return warning status for issues', () => {
      // Set required secrets so they don't cause missing required errors
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough-for-validation';
      // Set JWT_SECRET to weak value - this should cause only a quality issue
      mockEnv.JWT_SECRET = 'weak';

      const health = getSecretsHealthStatus(mockEnv);

      expect(health.status).toBe('warning');
      expect(health.checks.secrets_validation).toBe(false);
    });

    it('should include rotation status in health check', () => {
      const health = getSecretsHealthStatus(mockEnv);

      expect(health).toHaveProperty('rotation_status');
      expect(Array.isArray(health.rotation_status)).toBe(true);
    });
  });

  describe('Environment-Specific Validation', () => {
    it('should be more permissive in development', () => {
      mockEnv.VITE_APP_ENV = 'development';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'short-key';

      const result = validateSecrets(mockEnv);

      // Should not require webhook secret in development
      expect(
        result.errors.some(
          e => e.secret === 'N8N_WEBHOOK_SECRET' && e.category === 'missing'
        )
      ).toBe(false);
    });

    it('should be strict in production', () => {
      mockEnv.VITE_APP_ENV = 'production';
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      mockEnv.JWT_SECRET = 'weak-production-secret';

      const result = validateSecrets(mockEnv);

      expect(
        result.errors.some(
          e => e.secret === 'JWT_SECRET' && e.category === 'strength'
        )
      ).toBe(true);
    });
  });

  describe('Logging', () => {
    it('should log secrets status without revealing values', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'test-key';

      const result = validateSecrets(mockEnv);
      logSecretsStatus(result);

      expect(consoleSpy).toHaveBeenCalled();

      // Verify no actual secret values were logged
      const loggedContent = consoleSpy.mock.calls
        .map(call => call.join(' '))
        .join(' ');
      expect(loggedContent).not.toContain('https://test.supabase.co');
      expect(loggedContent).not.toContain('test-key');

      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Environment Validation', () => {
    it('should complement environment validation', () => {
      // Test that secrets validation works alongside env validation
      const secretsResult = validateSecrets();

      expect(secretsResult).toHaveProperty('isValid');
      expect(secretsResult).toHaveProperty('errors');
      expect(secretsResult).toHaveProperty('warnings');
      expect(secretsResult).toHaveProperty('summary');
      expect(secretsResult).toHaveProperty('timestamp');
    });
  });
});
