#!/bin/bash

# Staging Deployment Script for JARVIS Chat
# This script deploys the application to the staging environment

set -e

echo "🚀 Starting staging deployment..."

# Configuration
COMPOSE_FILE="docker-compose.staging.yml"
IMAGE_TAG="${GITHUB_SHA:-latest}"
CONTAINER_NAME="jarvis-chat-staging"
HEALTH_CHECK_URL="http://localhost:8080/health"
MAX_WAIT_TIME=60

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

# Pre-deployment checks
log_info "Running pre-deployment checks..."

if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Docker Compose file $COMPOSE_FILE not found"
fi

if [ ! -f ".env.staging" ]; then
    log_error "Staging environment file .env.staging not found"
fi

# Pull latest image
log_info "Pulling latest staging image..."
docker-compose -f $COMPOSE_FILE pull || log_error "Failed to pull image"

# Stop existing container
log_info "Stopping existing staging container..."
docker-compose -f $COMPOSE_FILE down || true

# Start new container
log_info "Starting new staging container..."
docker-compose -f $COMPOSE_FILE up -d || log_error "Failed to start container"

# Wait for health check
log_info "Waiting for application to be healthy..."
WAIT_TIME=0
while [ $WAIT_TIME -lt $MAX_WAIT_TIME ]; do
    if curl -f $HEALTH_CHECK_URL > /dev/null 2>&1; then
        log_success "Application is healthy!"
        break
    fi
    
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
    
    if [ $WAIT_TIME -ge $MAX_WAIT_TIME ]; then
        log_error "Health check failed after ${MAX_WAIT_TIME}s"
    fi
done

# Run smoke tests
log_info "Running smoke tests..."
./scripts/smoke-tests.sh staging || log_error "Smoke tests failed"

log_success "Staging deployment completed successfully!"
log_info "Application available at: https://staging-jarvis.madpanda3d.com"