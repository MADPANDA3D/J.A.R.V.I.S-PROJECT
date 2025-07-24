#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates environment configuration using the application's validation system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Logging functions
const log = message =>
  console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
const error = message =>
  console.error(`${colors.red}[ERROR]${colors.reset} ${message}`);
const warning = message =>
  console.warn(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
const success = message =>
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);

// Help function
function showHelp() {
  console.log(`
Configuration Validation Script

Usage: node validate-configuration.js [ENV_FILE] [OPTIONS]

Arguments:
  ENV_FILE    Path to environment file (default: .env)

Options:
  --environment=ENV    Set environment type (development|staging|production)
  --format=FORMAT      Output format (console|json|summary)
  --fail-on-warnings   Exit with error code if warnings are found
  --secrets-check      Include secrets validation
  --help              Show this help message

Examples:
  node validate-configuration.js
  node validate-configuration.js .env.production --environment=production
  node validate-configuration.js --format=json --secrets-check
  node validate-configuration.js .env.staging --fail-on-warnings
`);
}

// Parse command line arguments
function parseArguments() {
  const args = {
    envFile: '.env',
    environment: null,
    format: 'console',
    failOnWarnings: false,
    secretsCheck: false,
    help: false,
  };

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg.startsWith('--environment=')) {
      args.environment = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      args.format = arg.split('=')[1];
    } else if (arg === '--fail-on-warnings') {
      args.failOnWarnings = true;
    } else if (arg === '--secrets-check') {
      args.secretsCheck = true;
    } else if (!arg.startsWith('--')) {
      args.envFile = arg;
    }
  }

  return args;
}

// Load environment file
function loadEnvironmentFile(filePath) {
  const fullPath = path.resolve(filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Environment file not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });

  return env;
}

// Basic environment validation
function validateBasicEnvironment(env, environment) {
  const errors = [];
  const warnings = [];

  // Required variables for all environments
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

  // Environment-specific requirements
  if (environment === 'production') {
    requiredVars.push(
      'VITE_N8N_WEBHOOK_URL',
      'N8N_WEBHOOK_SECRET',
      'VITE_SENTRY_DSN'
    );
  } else if (environment === 'staging') {
    requiredVars.push('VITE_N8N_WEBHOOK_URL', 'N8N_WEBHOOK_SECRET');
  }

  // Check required variables
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName].trim() === '') {
      errors.push({
        variable: varName,
        message: 'Required variable is missing or empty',
        severity: 'error',
        category: 'missing',
      });
    }
  });

  // Validate URL formats
  const urlVars = [
    'VITE_SUPABASE_URL',
    'VITE_N8N_WEBHOOK_URL',
    'VITE_SENTRY_DSN',
    'VITE_CDN_URL',
  ];
  urlVars.forEach(varName => {
    if (env[varName]) {
      try {
        new URL(env[varName]);
      } catch (e) {
        errors.push({
          variable: varName,
          message: 'Invalid URL format',
          severity: 'error',
          category: 'format',
        });
      }
    }
  });

  // Environment-specific validations
  if (environment === 'production') {
    // Production security checks
    if (env.ENABLE_DEBUG_TOOLS === 'true') {
      errors.push({
        variable: 'ENABLE_DEBUG_TOOLS',
        message: 'Debug tools must be disabled in production',
        severity: 'error',
        category: 'security',
      });
    }

    if (env.MOCK_N8N_RESPONSES === 'true') {
      errors.push({
        variable: 'MOCK_N8N_RESPONSES',
        message: 'Mock responses must be disabled in production',
        severity: 'error',
        category: 'security',
      });
    }

    if (env.BYPASS_AUTH === 'true') {
      errors.push({
        variable: 'BYPASS_AUTH',
        message: 'Authentication bypass must be disabled in production',
        severity: 'error',
        category: 'security',
      });
    }

    // HTTPS requirement for production
    if (
      env.VITE_N8N_WEBHOOK_URL &&
      !env.VITE_N8N_WEBHOOK_URL.startsWith('https://')
    ) {
      errors.push({
        variable: 'VITE_N8N_WEBHOOK_URL',
        message: 'Webhook URL must use HTTPS in production',
        severity: 'error',
        category: 'security',
      });
    }

    // Version should be set in production
    if (!env.VITE_APP_VERSION) {
      warnings.push({
        variable: 'VITE_APP_VERSION',
        message: 'Version should be specified in production',
        recommendation: 'Set VITE_APP_VERSION for production deployments',
        category: 'best-practice',
      });
    }
  }

  // Check for potentially weak secrets
  const secretVars = ['N8N_WEBHOOK_SECRET', 'JWT_SECRET', 'ENCRYPTION_KEY'];
  secretVars.forEach(varName => {
    if (env[varName]) {
      if (env[varName].length < 16) {
        warnings.push({
          variable: varName,
          message: 'Secret appears to be too short',
          recommendation: 'Use a secret with at least 16 characters',
          category: 'security',
        });
      }

      // Check for common weak patterns
      const weakPatterns = ['password', 'secret', '123', 'test', 'change-me'];
      if (
        weakPatterns.some(pattern =>
          env[varName].toLowerCase().includes(pattern)
        )
      ) {
        errors.push({
          variable: varName,
          message: 'Secret contains weak or default patterns',
          severity: 'error',
          category: 'security',
        });
      }
    }
  });

  return { errors, warnings };
}

// Validate secrets
function validateSecrets(env) {
  const errors = [];
  const warnings = [];

  const secrets = [
    { name: 'VITE_SUPABASE_ANON_KEY', category: 'database', minLength: 100 },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', category: 'database', minLength: 100 },
    { name: 'N8N_WEBHOOK_SECRET', category: 'webhook', minLength: 16 },
    { name: 'N8N_API_KEY', category: 'api', minLength: 20 },
    { name: 'JWT_SECRET', category: 'security', minLength: 32 },
    { name: 'ENCRYPTION_KEY', category: 'security', minLength: 32 },
  ];

  secrets.forEach(secret => {
    if (env[secret.name]) {
      const value = env[secret.name];

      // Check length
      if (value.length < secret.minLength) {
        warnings.push({
          variable: secret.name,
          message: `Secret is shorter than recommended minimum (${secret.minLength} characters)`,
          recommendation: `Use at least ${secret.minLength} characters for ${secret.category} secrets`,
          category: 'security',
        });
      }

      // Check for exposure patterns
      if (secret.name.startsWith('VITE_') && secret.category === 'security') {
        errors.push({
          variable: secret.name,
          message: 'Security secret exposed to client-side code',
          severity: 'error',
          category: 'exposure',
        });
      }

      // Check for service role key exposure warning
      if (secret.name === 'SUPABASE_SERVICE_ROLE_KEY') {
        warnings.push({
          variable: secret.name,
          message: 'Service role key detected',
          recommendation:
            'Ensure this key is never exposed to client-side code',
          category: 'security',
        });
      }
    }
  });

  return { errors, warnings };
}

// Format output
function formatOutput(result, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);

    case 'summary':
      const summary = {
        valid: result.isValid,
        errors: result.errors.length,
        warnings: result.warnings.length,
        environment: result.environment,
      };
      return JSON.stringify(summary, null, 2);

    case 'console':
    default:
      return formatConsoleOutput(result);
  }
}

// Format console output
function formatConsoleOutput(result) {
  let output = '';

  output += `${colors.bold}Configuration Validation Results${colors.reset}\n`;
  output += `${'='.repeat(40)}\n`;
  output += `Environment: ${result.environment || 'unknown'}\n`;
  output += `Status: ${result.isValid ? `${colors.green}VALID${colors.reset}` : `${colors.red}INVALID${colors.reset}`}\n`;
  output += `Errors: ${result.errors.length}\n`;
  output += `Warnings: ${result.warnings.length}\n\n`;

  if (result.errors.length > 0) {
    output += `${colors.red}${colors.bold}Errors:${colors.reset}\n`;
    result.errors.forEach((error, index) => {
      output += `  ${index + 1}. ${colors.red}${error.variable}${colors.reset}: ${error.message}\n`;
      if (error.category) {
        output += `     Category: ${error.category}\n`;
      }
    });
    output += '\n';
  }

  if (result.warnings.length > 0) {
    output += `${colors.yellow}${colors.bold}Warnings:${colors.reset}\n`;
    result.warnings.forEach((warning, index) => {
      output += `  ${index + 1}. ${colors.yellow}${warning.variable}${colors.reset}: ${warning.message}\n`;
      if (warning.recommendation) {
        output += `     ${colors.cyan}Recommendation:${colors.reset} ${warning.recommendation}\n`;
      }
    });
    output += '\n';
  }

  if (result.isValid) {
    output += `${colors.green}${colors.bold}Configuration is valid!${colors.reset}\n`;
  } else {
    output += `${colors.red}${colors.bold}Configuration has issues that need to be resolved.${colors.reset}\n`;
  }

  return output;
}

// Main function
function main() {
  const args = parseArguments();

  if (args.help) {
    showHelp();
    return;
  }

  try {
    log(`Loading environment file: ${args.envFile}`);
    const env = loadEnvironmentFile(args.envFile);

    // Detect environment if not specified
    let environment = args.environment;
    if (!environment) {
      if (env.VITE_APP_ENV) {
        environment = env.VITE_APP_ENV;
      } else if (args.envFile.includes('production')) {
        environment = 'production';
      } else if (args.envFile.includes('staging')) {
        environment = 'staging';
      } else {
        environment = 'development';
      }
    }

    log(`Validating for environment: ${environment}`);

    // Run validations
    const basicValidation = validateBasicEnvironment(env, environment);
    let secretsValidation = { errors: [], warnings: [] };

    if (args.secretsCheck) {
      log('Running secrets validation...');
      secretsValidation = validateSecrets(env);
    }

    // Combine results
    const result = {
      isValid:
        basicValidation.errors.length === 0 &&
        secretsValidation.errors.length === 0,
      environment: environment,
      errors: [...basicValidation.errors, ...secretsValidation.errors],
      warnings: [...basicValidation.warnings, ...secretsValidation.warnings],
      timestamp: new Date().toISOString(),
      envFile: args.envFile,
    };

    // Output results
    const output = formatOutput(result, args.format);
    console.log(output);

    // Exit with appropriate code
    let exitCode = 0;
    if (!result.isValid) {
      exitCode = 1;
    } else if (args.failOnWarnings && result.warnings.length > 0) {
      exitCode = 1;
    }

    if (exitCode !== 0) {
      error(`Validation failed (exit code: ${exitCode})`);
    } else {
      success('Validation completed successfully');
    }

    process.exit(exitCode);
  } catch (err) {
    error(`Validation failed: ${err.message}`);
    process.exit(1);
  }
}

// Run main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  validateBasicEnvironment,
  validateSecrets,
  loadEnvironmentFile,
  formatOutput,
};
