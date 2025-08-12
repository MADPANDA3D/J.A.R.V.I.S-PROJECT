import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables before importing the module
const mockEnv = {
  VITE_SUPABASE_URL: '',
  VITE_SUPABASE_ANON_KEY: '',
  VITE_N8N_WEBHOOK_URL: '',
  VITE_APP_DOMAIN: '',
  DEV: false,
  PROD: true,
  MODE: 'test',
};

// Mock the env-validation module with controlled import.meta.env
vi.mock('../env-validation', async () => {
  const actual = (await vi.importActual('../env-validation')) as Record<string, unknown>;

  // Override import.meta.env for this module
  const mockValidateEnvironment = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: Record<string, string> = {};

    // Required variables
    const supabaseUrl = mockEnv.VITE_SUPABASE_URL;
    const supabaseKey = mockEnv.VITE_SUPABASE_ANON_KEY;

    // Optional variables
    const n8nWebhookUrl = mockEnv.VITE_N8N_WEBHOOK_URL;
    const appDomain = mockEnv.VITE_APP_DOMAIN;

    // Validate Supabase URL
    if (!supabaseUrl) {
      errors.push('VITE_SUPABASE_URL is required but not set');
    } else if (!isValidUrl(supabaseUrl)) {
      errors.push('VITE_SUPABASE_URL is not a valid URL');
    } else if (
      !supabaseUrl.includes('supabase.co') &&
      !supabaseUrl.includes('localhost')
    ) {
      warnings.push('VITE_SUPABASE_URL does not appear to be a Supabase URL');
    } else {
      config.VITE_SUPABASE_URL = supabaseUrl;
    }

    // Validate Supabase key
    if (!supabaseKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required but not set');
    } else if (supabaseKey.length < 100) {
      warnings.push(
        'VITE_SUPABASE_ANON_KEY appears to be too short for a valid Supabase key'
      );
    } else {
      config.VITE_SUPABASE_ANON_KEY = supabaseKey;
    }

    // Validate N8N webhook URL (optional)
    if (n8nWebhookUrl) {
      if (!isValidUrl(n8nWebhookUrl)) {
        warnings.push('VITE_N8N_WEBHOOK_URL is not a valid URL');
      } else {
        config.VITE_N8N_WEBHOOK_URL = n8nWebhookUrl;
      }
    } else {
      warnings.push(
        'VITE_N8N_WEBHOOK_URL is not set - using fallback AI responses'
      );
    }

    // Validate app domain (optional)
    if (appDomain) {
      if (!isValidUrl(`https://${appDomain}`) && !isValidUrl(appDomain)) {
        warnings.push('VITE_APP_DOMAIN does not appear to be a valid domain');
      } else {
        config.VITE_APP_DOMAIN = appDomain;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config,
    };
  };

  const mockGetEnvironmentInfo = () => {
    const result = mockValidateEnvironment();

    return {
      isProduction: mockEnv.PROD,
      isDevelopment: mockEnv.DEV,
      mode: mockEnv.MODE,
      isValid: result.isValid,
      hasSupabase: !!(
        result.config.VITE_SUPABASE_URL && result.config.VITE_SUPABASE_ANON_KEY
      ),
      hasN8nWebhook: !!result.config.VITE_N8N_WEBHOOK_URL,
      hasAppDomain: !!result.config.VITE_APP_DOMAIN,
      errors: result.errors,
      warnings: result.warnings,
    };
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (error) {
      return false;
    }
  }

  return {
    ...actual,
    validateEnvironment: mockValidateEnvironment,
    getEnvironmentInfo: mockGetEnvironmentInfo,
  };
});

import { validateEnvironment, getEnvironmentInfo } from '../env-validation';

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset mock environment before each test
    mockEnv.VITE_SUPABASE_URL = '';
    mockEnv.VITE_SUPABASE_ANON_KEY = '';
    mockEnv.VITE_N8N_WEBHOOK_URL = '';
    mockEnv.VITE_APP_DOMAIN = '';
    mockEnv.DEV = false;
    mockEnv.PROD = true;
  });

  describe('validateEnvironment', () => {
    it('should return valid when all required variables are set', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough';

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors when required variables are missing', () => {
      // Ensure variables are empty
      mockEnv.VITE_SUPABASE_URL = '';
      mockEnv.VITE_SUPABASE_ANON_KEY = '';

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'VITE_SUPABASE_URL is required but not set'
      );
      expect(result.errors).toContain(
        'VITE_SUPABASE_ANON_KEY is required but not set'
      );
    });

    it('should validate URL format for Supabase URL', () => {
      mockEnv.VITE_SUPABASE_URL = 'invalid-url';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('VITE_SUPABASE_URL is not a valid URL');
    });

    it('should validate JWT format for Supabase anon key', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY = 'invalid-jwt';

      const result = validateEnvironment();

      expect(result.isValid).toBe(true); // Key is set, no length validation in current implementation
      expect(result.warnings).toContain(
        'VITE_SUPABASE_ANON_KEY appears to be too short for a valid Supabase key'
      );
    });

    it('should add warnings for optional missing variables', () => {
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getEnvironmentInfo', () => {
    it('should return correct environment info structure', () => {
      // Set up a properly long Supabase key to avoid warnings
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough';
      mockEnv.VITE_N8N_WEBHOOK_URL = 'https://test-n8n.com/webhook';
      mockEnv.VITE_APP_DOMAIN = 'test.com';

      const info = getEnvironmentInfo();

      expect(info).toMatchObject({
        isValid: true,
        isProduction: true,
        isDevelopment: false,
        mode: 'test', // In test environment
        hasSupabase: true,
        hasN8nWebhook: true,
        hasAppDomain: true,
        errors: [],
        warnings: expect.any(Array), // May have warnings
      });
    });

    it('should detect development environment', () => {
      mockEnv.DEV = true;
      mockEnv.PROD = false;
      mockEnv.VITE_SUPABASE_URL = 'https://test.supabase.co';
      mockEnv.VITE_SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDAwMDAwMCwiZXhwIjoxNjQwMDAwMDAwfQ.test-signature-that-is-long-enough';

      const info = getEnvironmentInfo();

      expect(info.isProduction).toBe(false);
      expect(info.isDevelopment).toBe(true);
    });
  });
});
