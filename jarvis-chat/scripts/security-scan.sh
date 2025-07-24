#!/bin/bash

# Security Scanning Script for JARVIS Chat
# This script runs comprehensive security scans

set -e

echo "🔒 Running security scans..."

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

# 1. npm audit for dependency vulnerabilities
log_info "Running npm audit for dependency vulnerabilities..."
if npm audit --audit-level=high; then
    log_success "npm audit passed - no high-severity vulnerabilities found"
else
    log_warning "npm audit found vulnerabilities - review required"
fi

# 2. Check for common security issues in package.json
log_info "Checking package.json for security issues..."
if [ -f package.json ]; then
    # Check for dangerous scripts
    if grep -q "rm -rf" package.json; then
        log_warning "Potentially dangerous rm -rf command found in package.json"
    fi
    
    # Check for suspicious dependencies
    if grep -q "http://" package.json; then
        log_warning "HTTP URLs found in package.json - consider using HTTPS"
    fi
    
    log_success "package.json security check completed"
fi

# 3. Dockerfile security check
log_info "Checking Dockerfile for security best practices..."
if [ -f Dockerfile ]; then
    # Check if running as root
    if ! grep -q "USER" Dockerfile; then
        log_warning "Dockerfile doesn't specify non-root user - consider adding USER directive"
    fi
    
    # Check for package manager cache cleanup
    if ! grep -q "rm -rf\|--no-cache" Dockerfile; then
        log_warning "Dockerfile might not be cleaning package manager cache"
    fi
    
    log_success "Dockerfile security check completed"
fi

# 4. Environment file security check
log_info "Checking for exposed secrets in environment files..."
SECRET_PATTERNS=("password" "secret" "key" "token" "api_key")

for pattern in "${SECRET_PATTERNS[@]}"; do
    if find . -name "*.env*" -type f -exec grep -l "$pattern" {} \; 2>/dev/null | grep -v ".env.template" | head -1; then
        log_warning "Potential secrets found in environment files - ensure they're not committed"
    fi
done

# Check if .env files are in .gitignore
if [ -f .gitignore ]; then
    if grep -q "\.env" .gitignore; then
        log_success "Environment files are properly ignored in .gitignore"
    else
        log_warning ".env files should be added to .gitignore"
    fi
fi

# 5. Git security check
log_info "Checking git history for committed secrets..."
if command -v git &> /dev/null; then
    # Check for committed secrets (basic patterns)
    if git log --all --grep="password\|secret\|key" --oneline | head -5; then
        log_warning "Potential secrets found in git history - review commit messages"
    fi
    
    log_success "Git security check completed"
fi

# 6. File permissions check
log_info "Checking file permissions..."
if find . -name "*.sh" -type f ! -perm -u+x; then
    log_warning "Some shell scripts may not have execute permissions"
fi

if find . -name "*.key" -o -name "*.pem" -type f -perm -o+r 2>/dev/null | head -1; then
    log_warning "Private key files with world-readable permissions found"
fi

log_success "File permissions check completed"

# 7. Docker image security (if Docker is available)
if command -v docker &> /dev/null; then
    log_info "Running Docker image security scan..."
    
    # Build image for scanning
    if docker build -t jarvis-chat-security-scan . &> /dev/null; then
        # Basic image analysis
        IMAGE_SIZE=$(docker images jarvis-chat-security-scan --format "table {{.Size}}" | tail -1)
        log_info "Image size: $IMAGE_SIZE"
        
        # Check for known vulnerable base images (basic check)
        if docker history jarvis-chat-security-scan | grep -i "node.*slim\|alpine"; then
            log_success "Using secure base image (slim/alpine)"
        else
            log_warning "Consider using slim or alpine base images for better security"
        fi
        
        # Cleanup
        docker rmi jarvis-chat-security-scan &> /dev/null || true
        
        log_success "Docker image security scan completed"
    else
        log_warning "Could not build Docker image for security scanning"
    fi
fi

echo ""
log_success "Security scan completed!"
log_info "Review any warnings above and address them before deployment"

# Generate security report
REPORT_FILE="security-scan-report.txt"
{
    echo "Security Scan Report - $(date)"
    echo "=================================="
    echo ""
    echo "Scan completed at: $(date)"
    echo "Project: JARVIS Chat"
    echo ""
    echo "For detailed results, check the CI/CD pipeline logs."
    echo ""
} > $REPORT_FILE

log_info "Security report generated: $REPORT_FILE"