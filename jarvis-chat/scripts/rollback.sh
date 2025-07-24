#!/bin/bash

# Rollback Script for JARVIS Chat
# This script rolls back to the previous deployment

set -e

echo "🔄 Starting rollback process..."

# Configuration
ENVIRONMENT="${1:-production}"
BACKUP_TAG="${2}"
MAX_WAIT_TIME=60

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    CONTAINER_NAME="jarvis-chat-prod"
    HEALTH_CHECK_URL="http://localhost/health"
    DOMAIN="https://jarvis.madpanda3d.com"
elif [ "$ENVIRONMENT" = "staging" ]; then
    COMPOSE_FILE="docker-compose.staging.yml"
    CONTAINER_NAME="jarvis-chat-staging"
    HEALTH_CHECK_URL="http://localhost:8080/health"
    DOMAIN="https://staging-jarvis.madpanda3d.com"
else
    echo "❌ Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

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

# Find backup image if not provided
if [ -z "$BACKUP_TAG" ]; then
    log_info "Searching for latest backup image..."
    BACKUP_TAG=$(docker images --format "table {{.Tag}}" | grep "backup-" | head -1)
    
    if [ -z "$BACKUP_TAG" ]; then
        log_error "No backup image found. Cannot rollback."
    fi
    
    log_info "Found backup: $BACKUP_TAG"
fi

# Verify backup image exists
if ! docker image inspect "ghcr.io/madpanda3d/jarvis-chat:$BACKUP_TAG" > /dev/null 2>&1; then
    log_error "Backup image ghcr.io/madpanda3d/jarvis-chat:$BACKUP_TAG not found"
fi

# Stop current deployment
log_info "Stopping current deployment..."
docker-compose -f $COMPOSE_FILE down || true

# Create rollback compose file
ROLLBACK_COMPOSE_FILE="docker-compose.rollback.yml"
cp $COMPOSE_FILE $ROLLBACK_COMPOSE_FILE

# Update image tag in rollback compose file
sed -i "s|image: ghcr.io/madpanda3d/jarvis-chat:.*|image: ghcr.io/madpanda3d/jarvis-chat:$BACKUP_TAG|" $ROLLBACK_COMPOSE_FILE

# Start rollback deployment
log_info "Starting rollback deployment with image: $BACKUP_TAG"
docker-compose -f $ROLLBACK_COMPOSE_FILE up -d || log_error "Failed to start rollback container"

# Wait for health check
log_info "Waiting for rollback deployment to be healthy..."
WAIT_TIME=0
while [ $WAIT_TIME -lt $MAX_WAIT_TIME ]; do
    if curl -f $HEALTH_CHECK_URL > /dev/null 2>&1; then
        log_success "Rollback deployment is healthy!"
        break
    fi
    
    sleep 2
    WAIT_TIME=$((WAIT_TIME + 2))
    
    if [ $WAIT_TIME -ge $MAX_WAIT_TIME ]; then
        log_error "Rollback health check failed after ${MAX_WAIT_TIME}s"
    fi
done

# Update main compose file to use backup image
cp $ROLLBACK_COMPOSE_FILE $COMPOSE_FILE

# Run smoke tests
log_info "Running post-rollback smoke tests..."
./scripts/smoke-tests.sh $ENVIRONMENT || log_error "Post-rollback smoke tests failed"

# Cleanup
rm -f $ROLLBACK_COMPOSE_FILE

log_success "Rollback completed successfully!"
log_info "Application available at: $DOMAIN"
log_info "Rolled back to: $BACKUP_TAG"

# Log rollback event
echo "$(date): Rollback to $BACKUP_TAG completed successfully" >> rollback.log