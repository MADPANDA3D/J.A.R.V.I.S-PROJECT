/**
 * Secure Secrets Management System
 * Provides secure handling, validation, and monitoring of application secrets
 */

export interface SecretConfig {
  name: string;
  value: string;
  isRequired: boolean;
  description: string;
  category: 'database' | 'api' | 'webhook' | 'monitoring' | 'security';
  environment: 'development' | 'staging' | 'production' | 'all';
  lastRotated?: Date;
  expiresAt?: Date;
  strength?: 'weak' | 'medium' | 'strong';
}

export interface SecretValidationResult {
  isValid: boolean;
  errors: SecretError[];
  warnings: SecretWarning[];
  secrets: SecretConfig[];
  summary: SecretSummary;
  timestamp: Date;
}

export interface SecretError {
  secret: string;
  message: string;
  severity: 'error' | 'critical';
  category: 'missing' | 'format' | 'strength' | 'exposure' | 'expired';
}

export interface SecretWarning {
  secret: string;
  message: string;
  recommendation: string;
  category: 'rotation' | 'strength' | 'best-practice' | 'security';
}

export interface SecretSummary {
  totalSecrets: number;
  validSecrets: number;
  missingRequired: number;
  exposureRisks: number;
  rotationNeeded: number;
  strengthIssues: number;
}

export interface SecretRotationConfig {
  secret: string;
  rotationInterval: number; // days
  autoRotate: boolean;
  notificationThreshold: number; // days before expiration
  backupCount: number;
}

/**
 * Secret management class with comprehensive security features
 */
export class SecretsManager {
  private secrets: Map<string, SecretConfig> = new Map();
  private rotationConfigs: Map<string, SecretRotationConfig> = new Map();
  private accessLog: Array<{
    secret: string;
    timestamp: Date;
    operation: string;
  }> = [];

  constructor() {
    this.initializeSecrets();
    this.setupRotationConfigs();
  }

  /**
   * Initialize secret configurations from environment
   */
  private initializeSecrets(): void {
    const environment = import.meta.env.VITE_APP_ENV || 'development';

    // Database secrets
    this.addSecret({
      name: 'VITE_SUPABASE_URL',
      value: import.meta.env.VITE_SUPABASE_URL || '',
      isRequired: true,
      description: 'Supabase database URL',
      category: 'database',
      environment: 'all',
    });

    this.addSecret({
      name: 'VITE_SUPABASE_ANON_KEY',
      value: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      isRequired: true,
      description: 'Supabase anonymous key for client authentication',
      category: 'database',
      environment: 'all',
    });

    this.addSecret({
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      value: import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '',
      isRequired: false,
      description: 'Supabase service role key (server-side only)',
      category: 'database',
      environment: 'all',
    });

    // Webhook secrets
    this.addSecret({
      name: 'N8N_WEBHOOK_SECRET',
      value: import.meta.env.N8N_WEBHOOK_SECRET || '',
      isRequired: environment !== 'development',
      description: 'Secret for securing N8N webhook communication',
      category: 'webhook',
      environment: 'all',
    });

    this.addSecret({
      name: 'N8N_API_KEY',
      value: import.meta.env.N8N_API_KEY || '',
      isRequired: false,
      description: 'API key for N8N service integration',
      category: 'api',
      environment: 'all',
    });

    // Monitoring secrets
    this.addSecret({
      name: 'VITE_SENTRY_DSN',
      value: import.meta.env.VITE_SENTRY_DSN || '',
      isRequired: environment === 'production',
      description: 'Sentry DSN for error tracking',
      category: 'monitoring',
      environment: 'all',
    });

    this.addSecret({
      name: 'DATADOG_API_KEY',
      value: import.meta.env.DATADOG_API_KEY || '',
      isRequired: false,
      description: 'DataDog API key for metrics and monitoring',
      category: 'monitoring',
      environment: 'all',
    });

    // Security secrets
    this.addSecret({
      name: 'JWT_SECRET',
      value: import.meta.env.JWT_SECRET || '',
      isRequired: environment !== 'development',
      description: 'Secret for JWT token signing',
      category: 'security',
      environment: 'all',
    });

    this.addSecret({
      name: 'ENCRYPTION_KEY',
      value: import.meta.env.ENCRYPTION_KEY || '',
      isRequired: environment === 'production',
      description: 'Key for data encryption',
      category: 'security',
      environment: 'all',
    });
  }

  /**
   * Setup rotation configurations for secrets
   */
  private setupRotationConfigs(): void {
    // Database secrets - rotate every 90 days
    this.rotationConfigs.set('SUPABASE_SERVICE_ROLE_KEY', {
      secret: 'SUPABASE_SERVICE_ROLE_KEY',
      rotationInterval: 90,
      autoRotate: false,
      notificationThreshold: 7,
      backupCount: 2,
    });

    // Webhook secrets - rotate every 30 days
    this.rotationConfigs.set('N8N_WEBHOOK_SECRET', {
      secret: 'N8N_WEBHOOK_SECRET',
      rotationInterval: 30,
      autoRotate: false,
      notificationThreshold: 5,
      backupCount: 3,
    });

    this.rotationConfigs.set('N8N_API_KEY', {
      secret: 'N8N_API_KEY',
      rotationInterval: 60,
      autoRotate: false,
      notificationThreshold: 7,
      backupCount: 2,
    });

    // Security secrets - rotate every 30 days
    this.rotationConfigs.set('JWT_SECRET', {
      secret: 'JWT_SECRET',
      rotationInterval: 30,
      autoRotate: false,
      notificationThreshold: 5,
      backupCount: 3,
    });

    this.rotationConfigs.set('ENCRYPTION_KEY', {
      secret: 'ENCRYPTION_KEY',
      rotationInterval: 60,
      autoRotate: false,
      notificationThreshold: 7,
      backupCount: 2,
    });
  }

  /**
   * Add a secret to the manager
   */
  private addSecret(
    config: Omit<SecretConfig, 'strength' | 'lastRotated'>
  ): void {
    const secretConfig: SecretConfig = {
      ...config,
      strength: this.assessSecretStrength(config.value),
      lastRotated: new Date(), // Assume current deployment as last rotation
    };

    this.secrets.set(config.name, secretConfig);
  }

  /**
   * Validate all secrets and return comprehensive results
   */
  public validateSecrets(): SecretValidationResult {
    const errors: SecretError[] = [];
    const warnings: SecretWarning[] = [];
    const secrets: SecretConfig[] = Array.from(this.secrets.values());
    const timestamp = new Date();
    const environment = import.meta.env.VITE_APP_ENV || 'development';

    // Validate each secret
    for (const secret of secrets) {
      this.validateSecret(secret, errors, warnings, environment);
    }

    // Check for rotation needs
    this.checkRotationNeeds(warnings);

    // Check for exposure risks
    this.checkExposureRisks(errors, warnings);

    // Generate summary
    const summary: SecretSummary = {
      totalSecrets: secrets.length,
      validSecrets: secrets.filter(
        s => s.value && !errors.some(e => e.secret === s.name)
      ).length,
      missingRequired: errors.filter(e => e.category === 'missing').length,
      exposureRisks: errors.filter(e => e.category === 'exposure').length,
      rotationNeeded: warnings.filter(w => w.category === 'rotation').length,
      strengthIssues: warnings.filter(w => w.category === 'strength').length,
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      secrets,
      summary,
      timestamp,
    };
  }

  /**
   * Validate individual secret
   */
  private validateSecret(
    secret: SecretConfig,
    errors: SecretError[],
    warnings: SecretWarning[],
    environment: string
  ): void {
    // Check if required secret is missing
    if (secret.isRequired && !secret.value) {
      errors.push({
        secret: secret.name,
        message: `Required secret is missing`,
        severity: 'critical',
        category: 'missing',
      });
      return;
    }

    // Skip further validation if secret is empty and not required
    if (!secret.value) return;

    // Validate secret strength
    if (secret.strength === 'weak') {
      if (secret.category === 'security' || secret.category === 'webhook') {
        errors.push({
          secret: secret.name,
          message:
            'Secret strength is too weak for security-critical component',
          severity: 'error',
          category: 'strength',
        });
      } else {
        warnings.push({
          secret: secret.name,
          message: 'Secret strength is weak',
          recommendation:
            'Use a stronger secret with mixed characters, numbers, and symbols',
          category: 'strength',
        });
      }
    } else if (secret.strength === 'medium') {
      warnings.push({
        secret: secret.name,
        message: 'Secret strength could be improved',
        recommendation: 'Consider using a longer secret with more complexity',
        category: 'strength',
      });
    }

    // Check for common exposure patterns
    if (this.hasExposureRisk(secret.value)) {
      errors.push({
        secret: secret.name,
        message: 'Secret appears to contain potentially exposed patterns',
        severity: 'error',
        category: 'exposure',
      });
    }

    // Environment-specific validations
    if (environment === 'production') {
      this.validateProductionSecret(secret, errors);
    }
  }

  /**
   * Check rotation needs for secrets
   */
  private checkRotationNeeds(warnings: SecretWarning[]): void {
    for (const [secretName, rotationConfig] of this.rotationConfigs) {
      const secret = this.secrets.get(secretName);
      if (!secret || !secret.value) continue;

      const daysSinceRotation = secret.lastRotated
        ? Math.floor(
            (Date.now() - secret.lastRotated.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 365; // Assume very old if no rotation date

      if (daysSinceRotation >= rotationConfig.rotationInterval) {
        warnings.push({
          secret: secretName,
          message: `Secret is overdue for rotation (${daysSinceRotation} days old)`,
          recommendation: `Rotate secret immediately. Target interval: ${rotationConfig.rotationInterval} days`,
          category: 'rotation',
        });
      } else if (
        daysSinceRotation >=
        rotationConfig.rotationInterval - rotationConfig.notificationThreshold
      ) {
        warnings.push({
          secret: secretName,
          message: `Secret rotation needed soon (${daysSinceRotation} days old)`,
          recommendation: `Plan secret rotation within ${rotationConfig.notificationThreshold} days`,
          category: 'rotation',
        });
      }
    }
  }

  /**
   * Check for exposure risks
   */
  private checkExposureRisks(
    errors: SecretError[],
    warnings: SecretWarning[]
  ): void {
    // Check if any secrets might be logged or exposed
    for (const secret of this.secrets.values()) {
      if (!secret.value) continue;

      // Check for secrets that might be accidentally logged
      if (
        secret.category === 'database' &&
        secret.name.includes('SERVICE_ROLE')
      ) {
        warnings.push({
          secret: secret.name,
          message: 'Service role key detected',
          recommendation:
            'Ensure this key is never exposed to client-side code or logs',
          category: 'security',
        });
      }

      // Check for client-exposed secrets that shouldn't be
      if (secret.name.startsWith('VITE_') && secret.category === 'security') {
        errors.push({
          secret: secret.name,
          message: 'Security secret exposed to client-side code',
          severity: 'critical',
          category: 'exposure',
        });
      }
    }
  }

  /**
   * Production-specific secret validation
   */
  private validateProductionSecret(
    secret: SecretConfig,
    errors: SecretError[]
  ): void {
    // Production secrets must be strong
    if (
      secret.strength !== 'strong' &&
      (secret.category === 'security' || secret.category === 'webhook')
    ) {
      errors.push({
        secret: secret.name,
        message: 'Production security secret must have strong strength',
        severity: 'error',
        category: 'strength',
      });
    }

    // Check for development patterns in production
    if (
      secret.value.includes('localhost') ||
      secret.value.includes('127.0.0.1')
    ) {
      errors.push({
        secret: secret.name,
        message: 'Development URL detected in production secret',
        severity: 'error',
        category: 'format',
      });
    }

    // Check for default/example values
    if (this.isDefaultValue(secret.value)) {
      errors.push({
        secret: secret.name,
        message: 'Default or example value detected in production',
        severity: 'critical',
        category: 'exposure',
      });
    }
  }

  /**
   * Assess secret strength
   */
  private assessSecretStrength(value: string): 'weak' | 'medium' | 'strong' {
    if (!value) return 'weak';

    const hasLowercase = /[a-z]/.test(value);
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);
    const hasSymbols = /[^a-zA-Z0-9]/.test(value);
    const hasMinLength = value.length >= 16;
    const hasGoodLength = value.length >= 32;

    const criteriaCount = [
      hasLowercase,
      hasUppercase,
      hasNumbers,
      hasSymbols,
    ].filter(Boolean).length;

    if (hasGoodLength && criteriaCount >= 3) {
      return 'strong';
    } else if (hasMinLength && criteriaCount >= 2) {
      return 'medium';
    } else {
      return 'weak';
    }
  }

  /**
   * Check for exposure risk patterns
   */
  private hasExposureRisk(value: string): boolean {
    const exposurePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /api[_-]?key/i,
      /auth[_-]?token/i,
    ];

    // If the value itself contains these words, it might be a weak pattern
    return exposurePatterns.some(
      pattern => pattern.test(value) && value.length < 20
    );
  }

  /**
   * Check for default/example values
   */
  private isDefaultValue(value: string): boolean {
    const defaultPatterns = [
      'your-secret-here',
      'replace-me',
      'example',
      'test-secret',
      'development-only',
      'change-me',
      '12345',
      'password',
      'secret',
    ];

    return defaultPatterns.some(pattern =>
      value.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Log secret access for audit purposes
   */
  public logAccess(secretName: string, operation: string): void {
    this.accessLog.push({
      secret: secretName,
      timestamp: new Date(),
      operation,
    });

    // Limit log size to prevent memory issues
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-500);
    }
  }

  /**
   * Get audit log for security monitoring
   */
  public getAuditLog(): Array<{
    secret: string;
    timestamp: Date;
    operation: string;
  }> {
    return [...this.accessLog];
  }

  /**
   * Get secret safely (logs access)
   */
  public getSecret(name: string): string | undefined {
    this.logAccess(name, 'read');
    return this.secrets.get(name)?.value;
  }

  /**
   * Get secrets by category
   */
  public getSecretsByCategory(
    category: SecretConfig['category']
  ): SecretConfig[] {
    return Array.from(this.secrets.values()).filter(
      s => s.category === category
    );
  }

  /**
   * Get rotation status for all secrets
   */
  public getRotationStatus(): Array<{
    secret: string;
    daysSinceRotation: number;
    daysUntilRotation: number;
    status: 'current' | 'due_soon' | 'overdue';
  }> {
    const status = [];

    for (const [secretName, rotationConfig] of this.rotationConfigs) {
      const secret = this.secrets.get(secretName);
      if (!secret) continue;

      const daysSinceRotation = secret.lastRotated
        ? Math.floor(
            (Date.now() - secret.lastRotated.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 365;

      const daysUntilRotation =
        rotationConfig.rotationInterval - daysSinceRotation;

      let rotationStatus: 'current' | 'due_soon' | 'overdue';
      if (daysSinceRotation >= rotationConfig.rotationInterval) {
        rotationStatus = 'overdue';
      } else if (daysUntilRotation <= rotationConfig.notificationThreshold) {
        rotationStatus = 'due_soon';
      } else {
        rotationStatus = 'current';
      }

      status.push({
        secret: secretName,
        daysSinceRotation,
        daysUntilRotation,
        status: rotationStatus,
      });
    }

    return status;
  }
}

/**
 * Global secrets manager instance
 */
export const secretsManager = new SecretsManager();

/**
 * Validate secrets and log results
 */
export function validateSecrets(): SecretValidationResult {
  return secretsManager.validateSecrets();
}

/**
 * Log secrets validation results
 */
export function logSecretsStatus(result: SecretValidationResult): void {
  console.log('🔐 Secrets Management Status:');
  console.log('==============================');
  console.log(`Validated at: ${result.timestamp.toISOString()}`);
  console.log('');

  if (result.isValid) {
    console.log('✅ All secrets validation passed');
  } else {
    console.log('❌ Secret validation issues detected');
  }

  // Log summary
  console.log('\n📊 Secrets Summary:');
  console.log(`• Total Secrets: ${result.summary.totalSecrets}`);
  console.log(`• Valid Secrets: ${result.summary.validSecrets}`);
  console.log(`• Missing Required: ${result.summary.missingRequired}`);
  console.log(`• Exposure Risks: ${result.summary.exposureRisks}`);
  console.log(`• Rotation Needed: ${result.summary.rotationNeeded}`);
  console.log(`• Strength Issues: ${result.summary.strengthIssues}`);

  // Log secrets by category
  console.log('\n📋 Secrets by Category:');

  const categories = [
    'database',
    'api',
    'webhook',
    'monitoring',
    'security',
  ] as const;
  for (const category of categories) {
    const categorySecrets = result.secrets.filter(s => s.category === category);
    if (categorySecrets.length > 0) {
      console.log(
        `\n🔧 ${category.charAt(0).toUpperCase() + category.slice(1)}:`
      );
      categorySecrets.forEach(secret => {
        const status = secret.value
          ? secret.strength === 'strong'
            ? '✅'
            : secret.strength === 'medium'
              ? '⚠️'
              : '❌'
          : '❌';
        console.log(
          `  • ${secret.name}: ${status} ${secret.strength || 'missing'}`
        );
      });
    }
  }

  // Log errors
  if (result.errors.length > 0) {
    console.log('\n❌ Security Issues:');
    const criticalErrors = result.errors.filter(e => e.severity === 'critical');
    const regularErrors = result.errors.filter(e => e.severity === 'error');

    if (criticalErrors.length > 0) {
      console.log('\n  🚨 Critical Security Issues:');
      criticalErrors.forEach(error => {
        console.log(`    • ${error.secret}: ${error.message}`);
      });
    }

    if (regularErrors.length > 0) {
      console.log('\n  ⚠️ Security Warnings:');
      regularErrors.forEach(error => {
        console.log(`    • ${error.secret}: ${error.message}`);
      });
    }
  }

  // Log warnings with recommendations
  if (result.warnings.length > 0) {
    console.log('\n⚠️ Recommendations:');
    const rotationWarnings = result.warnings.filter(
      w => w.category === 'rotation'
    );
    const strengthWarnings = result.warnings.filter(
      w => w.category === 'strength'
    );
    const securityWarnings = result.warnings.filter(
      w => w.category === 'security'
    );
    const bestPracticeWarnings = result.warnings.filter(
      w => w.category === 'best-practice'
    );

    if (rotationWarnings.length > 0) {
      console.log('\n  🔄 Rotation Needed:');
      rotationWarnings.forEach(warning => {
        console.log(`    • ${warning.secret}: ${warning.message}`);
        console.log(`      💡 ${warning.recommendation}`);
      });
    }

    if (strengthWarnings.length > 0) {
      console.log('\n  💪 Strength Improvements:');
      strengthWarnings.forEach(warning => {
        console.log(`    • ${warning.secret}: ${warning.message}`);
        console.log(`      💡 ${warning.recommendation}`);
      });
    }

    if (securityWarnings.length > 0) {
      console.log('\n  🔒 Security Recommendations:');
      securityWarnings.forEach(warning => {
        console.log(`    • ${warning.secret}: ${warning.message}`);
        console.log(`      💡 ${warning.recommendation}`);
      });
    }

    if (bestPracticeWarnings.length > 0) {
      console.log('\n  📝 Best Practices:');
      bestPracticeWarnings.forEach(warning => {
        console.log(`    • ${warning.secret}: ${warning.message}`);
        console.log(`      💡 ${warning.recommendation}`);
      });
    }
  }

  // Log rotation status
  const rotationStatus = secretsManager.getRotationStatus();
  if (rotationStatus.length > 0) {
    console.log('\n🔄 Rotation Schedule:');
    rotationStatus.forEach(status => {
      const statusIcon =
        status.status === 'current'
          ? '✅'
          : status.status === 'due_soon'
            ? '⚠️'
            : '❌';
      console.log(
        `  • ${status.secret}: ${statusIcon} ${status.daysSinceRotation} days old (${status.daysUntilRotation} days remaining)`
      );
    });
  }

  console.log('\n==============================\n');
}

/**
 * Get secrets health status for monitoring
 */
export function getSecretsHealthStatus() {
  const result = validateSecrets();
  const rotationStatus = secretsManager.getRotationStatus();

  return {
    status: result.isValid ? 'healthy' : 'warning',
    timestamp: result.timestamp,
    checks: {
      secrets_validation: result.isValid,
      missing_required: result.summary.missingRequired === 0,
      no_exposure_risks: result.summary.exposureRisks === 0,
      strength_adequate: result.summary.strengthIssues === 0,
      rotation_current: rotationStatus.every(s => s.status === 'current'),
    },
    metrics: {
      total_secrets: result.summary.totalSecrets,
      valid_secrets: result.summary.validSecrets,
      missing_required: result.summary.missingRequired,
      exposure_risks: result.summary.exposureRisks,
      rotation_needed: result.summary.rotationNeeded,
      strength_issues: result.summary.strengthIssues,
    },
    rotation_status: rotationStatus,
  };
}
