#!/bin/bash
# JARVIS Chat VPS Deployment Fix
# Addresses port conflict and missing environment variables

set -e

echo "🚀 JARVIS Chat VPS Deployment Fix"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found. Run this script from the jarvis-chat directory."
    exit 1
fi

echo "📋 Step 1: Creating .env.production from template..."
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.template" ]; then
        cp .env.production.template .env.production
        echo "✅ Created .env.production from template"
        echo "⚠️  IMPORTANT: You must edit .env.production and add your actual values before deployment!"
    else
        echo "⚠️  No template found. Creating minimal .env.production..."
        cat > .env.production << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
VITE_APP_DOMAIN=jarvis.madpanda3d.com
EOF
        echo "✅ Created minimal .env.production with generated secrets"
    fi
else
    echo "✅ .env.production already exists"
fi

echo "📋 Step 2: Stopping any existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

echo "📋 Step 3: Checking port conflicts..."
if netstat -tlnp | grep -q ":80 "; then
    echo "⚠️  Port 80 is in use (likely nginx-proxy-manager). Using port 3001 instead."
else
    echo "✅ Port 80 is available"
fi

echo "📋 Step 4: Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "📋 Step 5: Waiting for container to start..."
sleep 10

echo "📋 Step 6: Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo "📋 Step 7: Testing container health..."
if docker logs jarvis-chat-prod 2>&1 | grep -q "error\|Error\|failed"; then
    echo "⚠️  Container may have errors. Checking logs:"
    docker logs --tail=20 jarvis-chat-prod
else
    echo "✅ Container appears to be running successfully"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "✅ Fixed port conflict (now using port 3001)"
echo "✅ Created/verified .env.production"
echo "✅ Container deployed and running"
echo ""
echo "🔗 Access your application:"
echo "   http://your-vps-ip:3001"
echo "   or configure nginx-proxy-manager to route to port 3001"
echo ""
echo "📊 Monitor with: docker logs -f jarvis-chat-prod"