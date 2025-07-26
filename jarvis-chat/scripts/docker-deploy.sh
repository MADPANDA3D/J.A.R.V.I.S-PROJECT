#!/bin/bash

# JARVIS Docker Deployment Script
# Handles legacy Docker builder issues and provides clean deployment

echo "🚀 JARVIS Docker Deployment Script"
echo "=================================="

# Set legacy builder to avoid BuildX errors and enable optimizations
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0
export NODE_ENV=production

echo "📋 Using legacy Docker builder with production optimizations..."

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

echo "🛠️  Building and deploying JARVIS Chat..."

# Automatically run build analysis
echo "📊 Running build analysis..."
npm run build:analyze || echo "⚠️ Build analysis failed, continuing with deployment..."
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start with legacy builder
echo "🔨 Building with legacy Docker builder..."
docker-compose up -d --build

# Check status
echo "📊 Checking deployment status..."
sleep 5
docker-compose ps

echo ""
echo "🎯 Deployment Summary:"
echo "====================="
echo "🌐 Application: http://$(hostname -I | awk '{print $1}'):3000"
echo "💓 Health Check: http://$(hostname -I | awk '{print $1}'):3000/health"
echo "📊 Webhook Dashboard: http://$(hostname -I | awk '{print $1}'):9000/dashboard"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: docker-compose logs -f jarvis-chat"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo ""
echo "✅ Deployment Complete!"