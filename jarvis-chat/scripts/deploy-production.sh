#!/bin/bash

# Production Deployment Script for JARVIS Chat
# This script deploys the application to the production environment

set -e

echo "🚀 Starting production deployment..."

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
IMAGE_TAG="${GITHUB_SHA:-latest}"
CONTAINER_NAME="jarvis-chat-prod"
HEALTH_CHECK_URL="http://localhost/health"
MAX_WAIT_TIME=120
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"

# Functions
log_info() {
    echo "ℹ️  $1"
}

log_success() {
    echo "✅ $1"
}

log_error() {
    echo "❌ $1"
    exit 1
}

log_warning() {
    echo "⚠️  $1"
}

# Pre-deployment checks
log_info "Running pre-deployment checks..."

if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Docker Compose file $COMPOSE_FILE not found"
fi

if [ ! -f ".env.production" ]; then
    log_error "Production environment file .env.production not found"
fi

# Create backup of current deployment
log_info "Creating backup of current deployment..."
if docker ps | grep -q $CONTAINER_NAME; then
    docker tag $(docker ps --format "table {{.Image}}" | grep jarvis-chat | head -1) "ghcr.io/madpanda3d/jarvis-chat:$BACKUP_TAG"
    log_success "Backup created with tag: $BACKUP_TAG"
else
    log_warning "No existing container found to backup"
fi

# Pull latest image
log_info "Pulling latest production image..."
docker-compose -f $COMPOSE_FILE pull || log_error "Failed to pull image"

# Blue-green deployment strategy (simplified)
log_info "Starting blue-green deployment..."

# Stop current container gracefully
log_info "Stopping current production container..."
docker-compose -f $COMPOSE_FILE down || true

# Start new container
log_info "Starting new production container..."
docker-compose -f $COMPOSE_FILE up -d || log_error "Failed to start new container"

# Final health check
log_info "Running final health check..."
WAIT_TIME=0
while [ $WAIT_TIME -lt $MAX_WAIT_TIME ]; do
    if curl -f $HEALTH_CHECK_URL > /dev/null 2>&1; then
        log_success "Production application is healthy!"
        break
    fi
    
    sleep 3
    WAIT_TIME=$((WAIT_TIME + 3))
    
    if [ $WAIT_TIME -ge $MAX_WAIT_TIME ]; then
        log_error "Production health check failed after ${MAX_WAIT_TIME}s"
    fi
done

# Run production smoke tests
log_info "Running production smoke tests..."
./scripts/smoke-tests.sh production || log_error "Production smoke tests failed"

log_success "Production deployment completed successfully!"
log_info "Application available at: https://jarvis.madpanda3d.com"
log_info "Backup available at tag: $BACKUP_TAG"