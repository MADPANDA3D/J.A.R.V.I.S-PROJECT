#!/bin/bash

# Smoke Tests for JARVIS Chat
# This script runs post-deployment smoke tests

set -e

ENVIRONMENT="${1:-staging}"

if [ "$ENVIRONMENT" = "production" ]; then
    BASE_URL="https://jarvis.madpanda3d.com"
    HEALTH_URL="http://localhost/health"
elif [ "$ENVIRONMENT" = "staging" ]; then
    BASE_URL="https://staging-jarvis.madpanda3d.com"
    HEALTH_URL="http://localhost:8080/health"
else
    echo "❌ Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

echo "🧪 Running smoke tests for $ENVIRONMENT environment..."

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

# Test 1: Health endpoint
log_info "Testing health endpoint..."
if curl -f -s $HEALTH_URL | grep -q "OK"; then
    log_success "Health endpoint test passed"
else
    log_error "Health endpoint test failed"
fi

# Test 2: Application loads
log_info "Testing application load..."
if curl -f -s $BASE_URL > /dev/null 2>&1; then
    log_success "Application load test passed"
else
    log_error "Application load test failed"
fi

# Test 3: Static assets load
log_info "Testing static assets..."
if curl -f -s -I $BASE_URL/assets/ | grep -q "200\|301\|302"; then
    log_success "Static assets test passed"
else
    log_error "Static assets test failed"
fi

# Test 4: Security headers
log_info "Testing security headers..."
HEADERS=$(curl -s -I $BASE_URL)

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    log_success "X-Frame-Options header present"
else
    log_error "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    log_success "X-Content-Type-Options header present"
else
    log_error "X-Content-Type-Options header missing"
fi

# Test 5: Gzip compression
log_info "Testing gzip compression..."
if curl -H "Accept-Encoding: gzip" -s -I $BASE_URL | grep -q "Content-Encoding: gzip"; then
    log_success "Gzip compression test passed"
else
    log_error "Gzip compression test failed"
fi

# Test 6: 404 handling (should redirect to index.html for SPA)
log_info "Testing 404 handling..."
if curl -f -s $BASE_URL/nonexistent-page > /dev/null 2>&1; then
    log_success "404 handling test passed (SPA routing works)"
else
    log_error "404 handling test failed"
fi

log_success "All smoke tests passed for $ENVIRONMENT environment!"