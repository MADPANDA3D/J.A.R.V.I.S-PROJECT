import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Configuration Templates Validation', () => {
  const templatesDir = join(__dirname, '../../../');

  describe('Environment Template Files', () => {
    it('should have .env.template for development', () => {
      expect(() => {
        const template = readFileSync(
          join(templatesDir, '.env.template'),
          'utf8'
        );
        expect(template).toBeTruthy();
        expect(template.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it('should have .env.staging.template for staging', () => {
      expect(() => {
        const template = readFileSync(
          join(templatesDir, '.env.staging.template'),
          'utf8'
        );
        expect(template).toBeTruthy();
        expect(template.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it('should have .env.production.template for production', () => {
      expect(() => {
        const template = readFileSync(
          join(templatesDir, '.env.production.template'),
          'utf8'
        );
        expect(template).toBeTruthy();
        expect(template.length).toBeGreaterThan(0);
      }).not.toThrow();
    });
  });

  describe('Template Content Validation', () => {
    it('should include all required variables in development template', () => {
      const template = readFileSync(
        join(templatesDir, '.env.template'),
        'utf8'
      );

      // Required variables for development
      expect(template).toContain('VITE_APP_ENV=');
      expect(template).toContain('VITE_SUPABASE_URL=');
      expect(template).toContain('VITE_SUPABASE_ANON_KEY=');
      expect(template).toContain('VITE_N8N_WEBHOOK_URL=');

      // Development-specific variables
      expect(template).toContain('ENABLE_DEBUG_TOOLS=');
      expect(template).toContain('LOG_LEVEL=');
    });

    it('should include production-specific variables in production template', () => {
      const template = readFileSync(
        join(templatesDir, '.env.production.template'),
        'utf8'
      );

      // Production-required variables
      expect(template).toContain('VITE_APP_ENV=production');
      expect(template).toContain('VITE_APP_VERSION=');
      expect(template).toContain('VITE_SUPABASE_URL=');
      expect(template).toContain('VITE_SUPABASE_ANON_KEY=');
      expect(template).toContain('VITE_N8N_WEBHOOK_URL=');

      // Production-specific variables
      expect(template).toContain('VITE_SENTRY_DSN=');
      expect(template).toContain('ENABLE_CACHING=');
      expect(template).toContain('COMPRESSION_ENABLED=');
      expect(template).toContain('CSP_ENABLED=');
    });

    it('should include staging-specific variables in staging template', () => {
      const template = readFileSync(
        join(templatesDir, '.env.staging.template'),
        'utf8'
      );

      // Staging-required variables
      expect(template).toContain('VITE_APP_ENV=staging');
      expect(template).toContain('VITE_SUPABASE_URL=');
      expect(template).toContain('VITE_SUPABASE_ANON_KEY=');

      // Staging-specific variables
      expect(template).toContain('LOG_LEVEL=info');
      expect(template).toContain('ENABLE_METRICS=');
    });
  });

  describe('Security Annotations', () => {
    it('should have security warnings in all templates', () => {
      const templates = [
        '.env.template',
        '.env.staging.template',
        '.env.production.template',
      ];

      templates.forEach(templateFile => {
        const template = readFileSync(join(templatesDir, templateFile), 'utf8');

        // Should have security warnings
        expect(template.toLowerCase()).toMatch(
          /(warning|security|secret|never commit)/i
        );

        // Should have comments explaining sensitive variables
        if (template.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          expect(template).toMatch(/service.*role.*key.*server.*only/i);
        }

        if (template.includes('N8N_WEBHOOK_SECRET')) {
          expect(template).toMatch(/webhook.*secret/i);
        }
      });
    });

    it('should mark sensitive variables appropriately', () => {
      const productionTemplate = readFileSync(
        join(templatesDir, '.env.production.template'),
        'utf8'
      );

      // Check that sensitive variables have appropriate comments
      const sensitiveVars = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'N8N_WEBHOOK_SECRET',
        'JWT_SECRET',
        'ENCRYPTION_KEY',
      ];

      sensitiveVars.forEach(varName => {
        if (productionTemplate.includes(varName)) {
          // Should have comment before or after the variable
          const lines = productionTemplate.split('\n');
          const varLineIndex = lines.findIndex(line => line.includes(varName));

          if (varLineIndex >= 0) {
            const contextLines = [
              lines[varLineIndex - 1] || '',
              lines[varLineIndex],
              lines[varLineIndex + 1] || '',
            ].join(' ');

            expect(contextLines).toMatch(
              /#.*\b(secret|key|sensitive|secure|never|warning)\b/i
            );
          }
        }
      });
    });
  });

  describe('Template Format Validation', () => {
    it('should use proper environment variable format', () => {
      const templates = [
        '.env.template',
        '.env.staging.template',
        '.env.production.template',
      ];

      templates.forEach(templateFile => {
        const template = readFileSync(join(templatesDir, templateFile), 'utf8');
        const lines = template.split('\n');

        lines.forEach((line, index) => {
          // Skip empty lines and comments
          if (!line.trim() || line.trim().startsWith('#')) return;

          // Should follow KEY=VALUE format
          expect(line).toMatch(/^[A-Z_][A-Z0-9_]*=/);
        });
      });
    });

    it('should have consistent variable naming', () => {
      const template = readFileSync(
        join(templatesDir, '.env.template'),
        'utf8'
      );

      // Check for consistent naming patterns
      const variables = template
        .split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => line.split('=')[0]);

      variables.forEach(variable => {
        // Should be uppercase with underscores
        expect(variable).toMatch(/^[A-Z][A-Z0-9_]*$/);

        // Client-side variables should start with VITE_
        if (
          variable.includes('SUPABASE_URL') ||
          variable.includes('SUPABASE_ANON_KEY') ||
          variable.includes('N8N_WEBHOOK_URL') ||
          variable.includes('APP_ENV') ||
          variable.includes('SENTRY_DSN')
        ) {
          expect(variable).toMatch(/^VITE_/);
        }
      });
    });
  });

  describe('Template Completeness', () => {
    it('should cover all configuration categories', () => {
      const productionTemplate = readFileSync(
        join(templatesDir, '.env.production.template'),
        'utf8'
      );

      // Application configuration
      expect(productionTemplate).toContain('VITE_APP_ENV');
      expect(productionTemplate).toContain('VITE_APP_VERSION');
      expect(productionTemplate).toContain('VITE_APP_DOMAIN');

      // Database configuration
      expect(productionTemplate).toContain('VITE_SUPABASE_URL');
      expect(productionTemplate).toContain('VITE_SUPABASE_ANON_KEY');

      // Integration configuration
      expect(productionTemplate).toContain('VITE_N8N_WEBHOOK_URL');

      // Monitoring configuration
      expect(productionTemplate).toContain('VITE_SENTRY_DSN');

      // Performance configuration
      expect(productionTemplate).toContain('ENABLE_CACHING');
      expect(productionTemplate).toContain('COMPRESSION_ENABLED');

      // Security configuration
      expect(productionTemplate).toContain('CSP_ENABLED');
    });

    it('should provide example values where appropriate', () => {
      const template = readFileSync(
        join(templatesDir, '.env.template'),
        'utf8'
      );

      // Should have example values for non-sensitive variables
      const lines = template.split('\n');

      const domainLine = lines.find(line => line.includes('VITE_APP_DOMAIN'));
      if (domainLine) {
        expect(domainLine).toMatch(/=.*localhost.*:|=.*example\.com/);
      }

      const logLevelLine = lines.find(line => line.includes('LOG_LEVEL'));
      if (logLevelLine) {
        expect(logLevelLine).toMatch(/=(debug|info|warn|error)/);
      }
    });
  });

  describe('Environment-Specific Differences', () => {
    it('should have appropriate differences between environments', () => {
      const devTemplate = readFileSync(
        join(templatesDir, '.env.template'),
        'utf8'
      );
      const stagingTemplate = readFileSync(
        join(templatesDir, '.env.staging.template'),
        'utf8'
      );
      const prodTemplate = readFileSync(
        join(templatesDir, '.env.production.template'),
        'utf8'
      );

      // Environment values should be different
      expect(devTemplate).toContain('VITE_APP_ENV=development');
      expect(stagingTemplate).toContain('VITE_APP_ENV=staging');
      expect(prodTemplate).toContain('VITE_APP_ENV=production');

      // Debug tools should only be in development
      expect(devTemplate).toContain('ENABLE_DEBUG_TOOLS=true');
      expect(prodTemplate).toMatch(
        /ENABLE_DEBUG_TOOLS=false|# ENABLE_DEBUG_TOOLS=/
      );

      // Production should have more security features
      expect(prodTemplate).toContain('CSP_ENABLED=true');
      expect(prodTemplate).toContain('COMPRESSION_ENABLED=true');

      // Log levels should be appropriate
      expect(devTemplate).toMatch(/LOG_LEVEL=debug/);
      expect(stagingTemplate).toMatch(/LOG_LEVEL=info/);
      expect(prodTemplate).toMatch(/LOG_LEVEL=(warn|error)/);
    });
  });

  describe('Documentation Quality', () => {
    it('should have comprehensive comments', () => {
      const templates = [
        '.env.template',
        '.env.staging.template',
        '.env.production.template',
      ];

      templates.forEach(templateFile => {
        const template = readFileSync(join(templatesDir, templateFile), 'utf8');
        const lines = template.split('\n');

        // Should have header comments
        expect(template).toMatch(/^#.*Environment.*Configuration/im);

        // Should have section dividers
        expect(template).toMatch(/#.*Application.*Settings/i);
        expect(template).toMatch(/#.*Database.*Authentication/i);

        // Should have explanatory comments for complex variables
        const complexVars = [
          'VITE_SUPABASE_ANON_KEY',
          'N8N_WEBHOOK_SECRET',
          'RATE_LIMIT_WINDOW',
        ];
        complexVars.forEach(varName => {
          if (template.includes(varName)) {
            const varLineIndex = lines.findIndex(line =>
              line.includes(varName)
            );
            if (varLineIndex >= 0) {
              // Should have comment within 2 lines
              const contextLines = lines.slice(
                Math.max(0, varLineIndex - 2),
                varLineIndex + 1
              );
              const hasComment = contextLines.some(line =>
                line.trim().startsWith('#')
              );
              expect(hasComment).toBe(true);
            }
          }
        });
      });
    });
  });
});
