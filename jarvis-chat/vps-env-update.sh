#!/bin/bash

# VPS Environment Update Script
# Add missing critical environment variables

echo "Adding missing critical environment variables to .env.production..."

# Generate secure secrets
JWT_SECRET=$(openssl rand -hex 32)
N8N_WEBHOOK_SECRET_NEW=$(openssl rand -hex 32)

# Backup existing file
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# Add missing variables to .env.production
cat >> .env.production << EOF

# Generated Critical Secrets $(date)
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
N8N_WEBHOOK_SECRET=${N8N_WEBHOOK_SECRET_NEW}

# Monitoring (Optional but recommended for error tracking)
VITE_SENTRY_DSN=
LOG_LEVEL=error
ENABLE_ANALYTICS=true

# Performance Settings
ENABLE_CACHING=true
CACHE_TTL=7200
COMPRESSION_ENABLED=true
RATE_LIMIT_WINDOW=900
RATE_LIMIT_MAX_REQUESTS=2000
CSP_ENABLED=true

# Feature Flags (Production - Keep disabled)
ENABLE_DEBUG_TOOLS=false
ENABLE_EXPERIMENTAL_FEATURES=false
MOCK_N8N_RESPONSES=false
BYPASS_AUTH=false

# Webhook Configuration
WEBHOOK_TIMEOUT=30000
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_CIRCUIT_BREAKER_THRESHOLD=5
WEBHOOK_MONITORING_ENABLED=true
EOF

echo "✅ Added missing environment variables:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET (32-char secure)"
echo "   - N8N_WEBHOOK_SECRET (32-char secure)"
echo "   - Performance and security settings"
echo ""
echo "⚠️  NOTE: Your existing N8N_WEBHOOK_SECRET was empty, so we generated a new one."
echo "   If you have webhooks expecting a specific secret, update the N8N_WEBHOOK_SECRET value manually."
echo ""
echo "🔒 File permissions set to 600 for security"
chmod 600 .env.production

echo "✅ Environment update complete!"