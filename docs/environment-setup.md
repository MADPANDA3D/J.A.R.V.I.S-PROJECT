# Environment Setup Guide

A comprehensive guide for configuring environment variables across all deployment environments for the JARVIS Chat application.

## Table of Contents

- [Overview](#overview)
- [Environment Variable Categories](#environment-variable-categories)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Security Best Practices](#security-best-practices)
- [Validation and Troubleshooting](#validation-and-troubleshooting)
- [Deployment Procedures](#deployment-procedures)

## Overview

The JARVIS Chat application uses environment variables for configuration management across development, staging, and production environments. This guide provides complete documentation for all environment variables, their purposes, and secure configuration practices.

### Environment Types

- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment
- **Docker**: Containerized deployment environment

## Environment Variable Categories

### 1. Application Configuration

Core application settings that define the runtime environment.

| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `VITE_APP_ENV` | Yes | string | Application environment (`development`, `staging`, `production`) |
| `VITE_APP_VERSION` | No | string | Application version for tracking and debugging |
| `VITE_APP_DOMAIN` | No | string | Application domain/hostname |
| `VITE_CDN_URL` | No | string | CDN URL for static assets (production only) |

**Example:**
```env
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_DOMAIN=jarvis.madpanda3d.com
```

### 2. Database & Authentication (Supabase)

Configuration for Supabase database and authentication services.

| Variable | Required | Type | Description | Security Level |
|----------|----------|------|-------------|----------------|
| `VITE_SUPABASE_URL` | Yes | URL | Supabase project URL | Public |
| `VITE_SUPABASE_ANON_KEY` | Yes | string | Supabase anonymous/public key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | No | string | Supabase service role key (server-side only) | **SECRET** |

**Example:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Notes:**
- `VITE_SUPABASE_ANON_KEY` is safe to expose to clients (designed for frontend use)
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to clients - use only in secure server environments
- Implement Row Level Security (RLS) policies in Supabase for data protection

### 3. External Integrations

Configuration for external service integrations.

| Variable | Required | Type | Description | Security Level |
|----------|----------|------|-------------|----------------|
| `VITE_N8N_WEBHOOK_URL` | Yes | URL | n8n webhook endpoint for AI processing | Public |
| `N8N_WEBHOOK_SECRET` | Yes | string | Secret for n8n webhook authentication | **SECRET** |
| `N8N_API_KEY` | No | string | n8n API key for advanced operations | **SECRET** |

**Example:**
```env
VITE_N8N_WEBHOOK_URL=https://n8n.madpanda3d.com/webhook/jarvis
N8N_WEBHOOK_SECRET=your-secure-webhook-secret
```

### 4. Monitoring & Logging

Configuration for monitoring, logging, and error tracking.

| Variable | Required | Type | Description | Security Level |
|----------|----------|------|-------------|----------------|
| `VITE_SENTRY_DSN` | No | URL | Sentry error tracking DSN | Public |
| `DATADOG_API_KEY` | No | string | DataDog monitoring API key | **SECRET** |
| `LOG_LEVEL` | No | enum | Logging level (`debug`, `info`, `warn`, `error`) | Public |
| `ENABLE_ANALYTICS` | No | boolean | Enable analytics tracking | Public |

**Example:**
```env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
LOG_LEVEL=info
ENABLE_ANALYTICS=true
```

### 5. Performance & Security

Configuration for performance optimization and security features.

| Variable | Required | Type | Description | Security Level |
|----------|----------|------|-------------|----------------|
| `ENABLE_CACHING` | No | boolean | Enable application caching | Public |
| `CACHE_TTL` | No | number | Cache time-to-live in seconds | Public |
| `COMPRESSION_ENABLED` | No | boolean | Enable response compression | Public |
| `RATE_LIMIT_WINDOW` | No | number | Rate limiting window in seconds | Public |
| `RATE_LIMIT_MAX_REQUESTS` | No | number | Maximum requests per window | Public |
| `CSP_ENABLED` | No | boolean | Enable Content Security Policy | Public |

**Example:**
```env
ENABLE_CACHING=true
CACHE_TTL=3600
COMPRESSION_ENABLED=true
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX_REQUESTS=100
```

### 6. Feature Flags & Debugging

Configuration for feature toggles and debugging options.

| Variable | Required | Type | Description | Security Level |
|----------|----------|------|-------------|----------------|
| `ENABLE_DEBUG_TOOLS` | No | boolean | Enable debug tools (development only) | Public |
| `ENABLE_EXPERIMENTAL_FEATURES` | No | boolean | Enable experimental features | Public |
| `MOCK_N8N_RESPONSES` | No | boolean | Use mock responses for testing | Public |
| `BYPASS_AUTH` | No | boolean | Bypass authentication (development only) | Public |

**Example:**
```env
ENABLE_DEBUG_TOOLS=false
ENABLE_EXPERIMENTAL_FEATURES=false
MOCK_N8N_RESPONSES=false
```

## Required Variables

### Minimum Configuration

For the application to function, the following variables **must** be set:

```env
# Core Application
VITE_APP_ENV=development

# Supabase (Database & Auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# n8n Integration
VITE_N8N_WEBHOOK_URL=https://your-n8n.domain.com/webhook/jarvis
N8N_WEBHOOK_SECRET=your-webhook-secret
```

### Validation Requirements

- `VITE_SUPABASE_URL` must be a valid URL containing 'supabase.co' or 'localhost'
- `VITE_SUPABASE_ANON_KEY` must be at least 100 characters long
- `VITE_N8N_WEBHOOK_URL` must be a valid HTTPS URL
- `VITE_APP_ENV` must be one of: `development`, `staging`, `production`

## Environment-Specific Configuration

### Development Environment

Optimized for local development with debugging enabled.

```env
# Application
VITE_APP_ENV=development
VITE_APP_VERSION=dev
VITE_APP_DOMAIN=localhost:5173

# Database & Auth
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key

# n8n Integration
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/jarvis
N8N_WEBHOOK_SECRET=dev-webhook-secret

# Monitoring & Logging
LOG_LEVEL=debug
ENABLE_ANALYTICS=false

# Performance & Security
ENABLE_CACHING=false
COMPRESSION_ENABLED=false

# Feature Flags & Debugging
ENABLE_DEBUG_TOOLS=true
ENABLE_EXPERIMENTAL_FEATURES=true
MOCK_N8N_RESPONSES=false
BYPASS_AUTH=false
```

### Staging Environment

Pre-production environment for testing with production-like configuration.

```env
# Application
VITE_APP_ENV=staging
VITE_APP_VERSION=staging
VITE_APP_DOMAIN=staging-jarvis.madpanda3d.com

# Database & Auth
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key

# n8n Integration
VITE_N8N_WEBHOOK_URL=https://staging-n8n.madpanda3d.com/webhook/jarvis
N8N_WEBHOOK_SECRET=staging-webhook-secret

# Monitoring & Logging
VITE_SENTRY_DSN=https://your-staging-dsn@sentry.io/project-id
LOG_LEVEL=info
ENABLE_ANALYTICS=true

# Performance & Security
ENABLE_CACHING=true
CACHE_TTL=1800
COMPRESSION_ENABLED=true
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX_REQUESTS=200

# Feature Flags & Debugging
ENABLE_DEBUG_TOOLS=false
ENABLE_EXPERIMENTAL_FEATURES=true
MOCK_N8N_RESPONSES=false
```

### Production Environment

Production-optimized configuration with security hardening.

```env
# Application
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_DOMAIN=jarvis.madpanda3d.com
VITE_CDN_URL=https://cdn.madpanda3d.com

# Database & Auth
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# n8n Integration
VITE_N8N_WEBHOOK_URL=https://n8n.madpanda3d.com/webhook/jarvis
N8N_WEBHOOK_SECRET=production-webhook-secret

# Monitoring & Logging
VITE_SENTRY_DSN=https://your-production-dsn@sentry.io/project-id
DATADOG_API_KEY=your-datadog-api-key
LOG_LEVEL=warn
ENABLE_ANALYTICS=true

# Performance & Security
ENABLE_CACHING=true
CACHE_TTL=3600
COMPRESSION_ENABLED=true
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX_REQUESTS=100
CSP_ENABLED=true

# Feature Flags & Debugging
ENABLE_DEBUG_TOOLS=false
ENABLE_EXPERIMENTAL_FEATURES=false
MOCK_N8N_RESPONSES=false
```

## Security Best Practices

### 1. Secret Management

**Never commit secrets to version control:**
- Use `.env.local` for local development secrets
- Add `.env.local` to `.gitignore`
- Use environment-specific secret management systems

**Secret Categories:**
- **PUBLIC**: Safe to expose to clients (prefixed with `VITE_`)
- **SECRET**: Must never be exposed to clients (no `VITE_` prefix)

### 2. Environment Isolation

**Separate configurations by environment:**
- Use different Supabase projects for each environment
- Use different domain names and API endpoints
- Implement proper access controls and monitoring

### 3. Secret Rotation

**Regular secret rotation schedule:**
- Database keys: Every 90 days
- API keys: Every 60 days
- Webhook secrets: Every 30 days
- Monitor for unauthorized access

### 4. Validation and Monitoring

**Implement comprehensive validation:**
- Validate all environment variables on startup
- Monitor for configuration drift
- Alert on validation failures
- Regular security audits

## Validation and Troubleshooting

### Environment Validation

The application automatically validates environment variables on startup. Check the console for validation results:

```
🔧 Environment Configuration Status:
=====================================
✅ Environment validation passed

📋 Configuration Status:
• Supabase URL: ✅ Configured
• Supabase Key: ✅ Configured  
• N8N Webhook: ✅ Configured
• App Domain: ✅ Configured
=====================================
```

### Common Issues and Solutions

#### 1. Supabase Connection Failed
**Error**: `VITE_SUPABASE_URL is not a valid URL`
**Solution**: 
- Verify the URL format: `https://your-project.supabase.co`
- Check for typos in the project ID
- Ensure the Supabase project is active

#### 2. n8n Webhook Not Responding
**Error**: Webhook requests failing or timing out
**Solution**:
- Verify `VITE_N8N_WEBHOOK_URL` is accessible
- Check `N8N_WEBHOOK_SECRET` matches n8n configuration
- Ensure n8n workflow is active and published

#### 3. Authentication Issues
**Error**: Users cannot sign in or get permission errors
**Solution**:
- Verify `VITE_SUPABASE_ANON_KEY` is correct
- Check Supabase RLS policies are configured
- Ensure authentication providers are enabled

#### 4. Performance Issues
**Error**: Slow application loading or API responses
**Solution**:
- Enable caching: `ENABLE_CACHING=true`
- Enable compression: `COMPRESSION_ENABLED=true`
- Adjust cache TTL: `CACHE_TTL=3600`
- Check rate limiting settings

### Environment Health Check

Run the environment health check:

```typescript
import { validateEnvironment, logEnvironmentStatus } from '@/lib/env-validation';

const result = validateEnvironment();
logEnvironmentStatus(result);

if (!result.isValid) {
  console.error('Environment validation failed:', result.errors);
}
```

## Deployment Procedures

### 1. Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd jarvis-chat

# Copy environment template
cp .env.template .env.local

# Edit environment variables
nano .env.local

# Install dependencies
npm install

# Validate environment
npm run validate-env

# Start development server
npm run dev
```

### 2. Staging Deployment

```bash
# Use staging environment template
cp .env.staging.template .env.staging

# Configure staging-specific variables
# Deploy with staging configuration
npm run deploy:staging

# Verify deployment
npm run health-check:staging
```

### 3. Production Deployment

```bash
# Use production environment template
cp .env.production.template .env.production

# Configure production-specific variables
# Deploy with production configuration
npm run deploy:production

# Verify deployment
npm run health-check:production

# Monitor deployment
npm run monitor:production
```

### 4. Docker Deployment

```bash
# Build with environment variables
docker build --build-arg ENV_FILE=.env.production -t jarvis-chat .

# Run with environment file
docker run --env-file .env.production -p 80:80 jarvis-chat

# Or use Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variable Naming Conventions

### Prefixes
- `VITE_`: Client-side variables (publicly accessible)
- No prefix: Server-side only variables (secrets)

### Categories
- `APP_`: Application configuration
- `SUPABASE_`: Database and authentication
- `N8N_`: n8n integration
- `SENTRY_`: Error tracking
- `DATADOG_`: Monitoring
- `ENABLE_`: Feature flags (boolean)

### Format
- Use UPPERCASE with underscores
- Be descriptive and specific
- Group related variables with common prefixes

### Examples
```env
# Good
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://project.supabase.co
N8N_WEBHOOK_SECRET=secret-value
ENABLE_ANALYTICS=true

# Avoid
appenv=production
supabase_url=https://project.supabase.co
webhook_secret=secret-value
analytics=true
```

## Configuration Templates

See the following template files for complete environment configurations:

- [`.env.template`](./.env.template) - Development environment
- [`.env.staging.template`](./.env.staging.template) - Staging environment  
- [`.env.production.template`](./.env.production.template) - Production environment

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review environment validation logs
2. **Monthly**: Audit environment configurations
3. **Quarterly**: Rotate secrets and keys
4. **Annually**: Security audit and compliance review

### Getting Help

1. Check environment validation output for specific errors
2. Review this documentation for configuration examples
3. Consult the troubleshooting section for common issues
4. Contact the development team for assistance

### Contributing

When adding new environment variables:

1. Update this documentation
2. Add validation logic to `env-validation.ts`
3. Update all environment templates
4. Add tests for new validation logic
5. Update deployment procedures if needed

---

**Last Updated**: 2025-07-24  
**Version**: 1.0  
**Maintainer**: Development Team