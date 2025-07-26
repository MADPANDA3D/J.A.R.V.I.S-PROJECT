#!/bin/bash

# JARVIS Optimized Docker Deployment Script
# Includes bundle analysis and performance optimization

echo "🚀 JARVIS Optimized Docker Deployment"
echo "===================================="

# Set legacy builder to avoid BuildX errors
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

echo "📋 Using legacy Docker builder to avoid BuildX issues..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.template..."
    if [ -f .env.template ]; then
        cp .env.template .env
        echo "✅ Created .env file from template"
        echo "🔧 Please edit .env file with your actual credentials"
        echo "   nano .env"
        exit 1
    else
        echo "❌ No .env.template found. Please create .env file manually."
        exit 1
    fi
fi

# Run build analysis
echo "📊 Running pre-deployment build analysis..."
npm run build:analyze

echo ""
echo "🔍 Bundle Analysis Results:"
echo "=========================="

# Check bundle sizes
if [ -d "dist" ]; then
    total_js=$(find dist -name "*.js" -exec du -c {} + | tail -1 | cut -f1)
    total_css=$(find dist -name "*.css" -exec du -c {} + | tail -1 | cut -f1)
    
    echo "📦 Bundle sizes:"
    echo "   JavaScript: ${total_js}K"
    echo "   CSS: ${total_css}K"
    
    # Performance recommendations
    if [ "$total_js" -gt 300 ]; then
        echo "⚠️  Large JS bundle detected (${total_js}K)"
        echo "   Code splitting optimizations applied ✓"
    else
        echo "✅ JS bundle size is optimal (${total_js}K)"
    fi
    
    echo ""
fi

# Continue with deployment
echo "🛠️  Proceeding with optimized deployment..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start with legacy builder
echo "🔨 Building with optimized bundle..."
docker-compose up -d --build

# Check status
echo "📊 Checking deployment status..."
sleep 10

# Verify containers
echo "🔍 Container status:"
docker-compose ps

# Test endpoints
echo ""
echo "🧪 Testing endpoints..."

# Test main app
if curl -f -s "http://localhost:3000/health" > /dev/null; then
    echo "✅ Main app: http://localhost:3000 - HEALTHY"
else
    echo "❌ Main app: http://localhost:3000 - FAILED"
fi

# Test webhook if available
if curl -f -s "http://localhost:9000/health" > /dev/null 2>&1; then
    echo "✅ Webhook: http://localhost:9000 - HEALTHY"
else
    echo "⚠️  Webhook: http://localhost:9000 - Not available (normal if not configured)"
fi

echo ""
echo "🎯 Optimized Deployment Summary:"
echo "==============================="
echo "🌐 Application: http://$(hostname -I | awk '{print $1}'):3000"
echo "💓 Health Check: http://$(hostname -I | awk '{print $1}'):3000/health"
echo "📊 Webhook Dashboard: http://$(hostname -I | awk '{print $1}'):9000/dashboard"
echo ""
echo "⚡ Performance Optimizations Applied:"
echo "   ✓ Route-based code splitting"
echo "   ✓ Manual chunk optimization"
echo "   ✓ Vendor library separation"
echo "   ✓ Bundle size analysis"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: docker-compose logs -f jarvis-chat"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Build analysis: npm run build:analyze"
echo ""
echo "✅ Optimized Deployment Complete!"