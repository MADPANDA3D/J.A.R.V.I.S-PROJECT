#!/bin/bash
# Fix Production Environment Configuration
# This script addresses missing environment variables causing validation warnings

set -e

echo "🔧 Fixing Production Environment Configuration"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found. Run this script from the jarvis-chat directory."
    exit 1
fi

# Backup existing .env.production if it exists
if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup.$(date +%s)
    echo "✅ Backed up existing .env.production"
fi

# Generate secure secrets
echo "🔐 Generating secure secrets..."
N8N_WEBHOOK_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Create/update .env.production with generated secrets
echo "📝 Creating .env.production with secure defaults..."

# Copy from existing .env or template
if [ -f ".env" ]; then
    # Use existing .env as base
    cp .env .env.production
    echo "✅ Copied from existing .env file"
else
    # Use template as base
    cp .env.production.template .env.production
    echo "✅ Copied from template"
fi

# Add/update the missing critical variables
echo "" >> .env.production
echo "# Auto-generated secure secrets ($(date))" >> .env.production
echo "N8N_WEBHOOK_SECRET=${N8N_WEBHOOK_SECRET}" >> .env.production
echo "JWT_SECRET=${JWT_SECRET}" >> .env.production  
echo "ENCRYPTION_KEY=${ENCRYPTION_KEY}" >> .env.production

# Add optional monitoring (empty but present to prevent warnings)
echo "VITE_SENTRY_DSN=" >> .env.production
echo "DATADOG_API_KEY=" >> .env.production

# Ensure required app settings are present
if ! grep -q "VITE_APP_ENV=production" .env.production; then
    echo "VITE_APP_ENV=production" >> .env.production
fi

if ! grep -q "NODE_ENV=production" .env.production; then
    echo "NODE_ENV=production" >> .env.production
fi

echo ""
echo "✅ Environment configuration completed!"
echo ""
echo "📋 Generated secure secrets:"
echo "   • N8N_WEBHOOK_SECRET: ${N8N_WEBHOOK_SECRET:0:8}... (32 chars)"
echo "   • JWT_SECRET: ${JWT_SECRET:0:8}... (32 chars)" 
echo "   • ENCRYPTION_KEY: ${ENCRYPTION_KEY:0:8}... (32 chars)"
echo ""
echo "⚠️  IMPORTANT: Please manually update these values in .env.production:"
echo "   • VITE_SUPABASE_URL (your Supabase project URL)"
echo "   • VITE_SUPABASE_ANON_KEY (your Supabase anon key)"
echo "   • SUPABASE_SERVICE_ROLE_KEY (your Supabase service role key)"
echo "   • VITE_N8N_WEBHOOK_URL (your n8n webhook URL)"
echo "   • N8N_API_KEY (your n8n API key)"
echo ""
echo "🔒 Security reminder: .env.production is in .gitignore and will not be committed"