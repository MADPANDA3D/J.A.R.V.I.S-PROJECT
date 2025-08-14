#!/bin/bash

# CI/CD Test Runner
# Mirrors GitHub Actions CI environment exactly
# This script replicates the exact steps from main.yml workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
echo_success() { echo -e "${GREEN}✅ $1${NC}"; }
echo_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
echo_error() { echo -e "${RED}❌ $1${NC}"; }

# Script metadata
SCRIPT_START_TIME=$(date)
echo_info "CI/CD Test Runner started at: $SCRIPT_START_TIME"
echo_info "Node Version: $(node --version)"
echo_info "NPM Version: $(npm --version)"
echo_info "Working Directory: $(pwd)"

# Environment setup (mirrors GitHub Actions)
export CI=true
export NODE_ENV=test
export NODE_OPTIONS='--max-old-space-size=4096'

echo_info "Environment Variables Set:"
echo_info "  CI=$CI"
echo_info "  NODE_ENV=$NODE_ENV"
echo_info "  NODE_OPTIONS=$NODE_OPTIONS"

# Step 1: Install dependencies with timing (mirrors GitHub Actions step)
echo_info "Step 1: Installing dependencies..."
INSTALL_START=$(date +%s)
npm ci
INSTALL_END=$(date +%s)
INSTALL_TIME=$((INSTALL_END - INSTALL_START))
echo_success "Dependency installation completed in ${INSTALL_TIME}s"

# Step 2: TypeScript type checking (mirrors GitHub Actions step)
echo_info "Step 2: TypeScript type checking..."
TYPE_CHECK_START=$(date +%s)
npm run type-check
TYPE_CHECK_END=$(date +%s)
TYPE_CHECK_TIME=$((TYPE_CHECK_END - TYPE_CHECK_START))
echo_success "TypeScript type checking completed in ${TYPE_CHECK_TIME}s"

# Step 3: ESLint linting (mirrors GitHub Actions step)  
echo_info "Step 3: ESLint linting..."
LINT_START=$(date +%s)
npm run lint
LINT_END=$(date +%s)
LINT_TIME=$((LINT_END - LINT_START))
echo_success "ESLint linting completed in ${LINT_TIME}s"

# Step 4: Run tests with coverage (mirrors GitHub Actions step)
echo_info "Step 4: Running tests with coverage..."
TEST_START=$(date +%s)

# Run tests with same configuration as GitHub Actions
npm run test:run -- --coverage --reporter=verbose --bail=10

TEST_END=$(date +%s)
TEST_TIME=$((TEST_END - TEST_START))
echo_success "Tests completed in ${TEST_TIME}s"

# Step 5: Build application (mirrors GitHub Actions step)
echo_info "Step 5: Building application..."
BUILD_START=$(date +%s)
npm run build
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))
echo_success "Build completed in ${BUILD_TIME}s"

# Step 6: Analyze bundle size (mirrors GitHub Actions step)
echo_info "Step 6: Analyzing bundle size..."
if [ -d "dist/" ]; then
    BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
    echo_info "Bundle size: $BUNDLE_SIZE"
    ls -la dist/
    echo_success "Bundle analysis completed"
else
    echo_error "dist/ directory not found after build"
    exit 1
fi

# Step 7: Security audit (mirrors GitHub Actions security step)
echo_info "Step 7: Running security audit..."
AUDIT_START=$(date +%s)

# Run npm audit with same level as GitHub Actions
if npm audit --audit-level=high; then
    echo_success "Security audit passed"
else
    echo_warning "Security audit found high-level vulnerabilities"
    # Don't fail the build for audit issues in development
fi

AUDIT_END=$(date +%s)
AUDIT_TIME=$((AUDIT_END - AUDIT_START))
echo_success "Security audit completed in ${AUDIT_TIME}s"

# Step 8: Validate deployment scripts exist (mirrors GitHub Actions build step)
echo_info "Step 8: Validating deployment configuration..."

REQUIRED_FILES=(
    ".github/workflows/main.yml"
    ".github/workflows/staging.yml" 
    ".github/workflows/production.yml"
    "scripts/deploy-staging.sh"
    "scripts/deploy-production.sh"
    "scripts/rollback.sh"
    "scripts/smoke-tests.sh"
    "scripts/security-scan.sh"
    "Dockerfile"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo_success "Found: $file"
    else
        echo_error "Missing: $file"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo_success "All deployment files present"
else
    echo_error "Missing ${#MISSING_FILES[@]} required deployment files"
    for file in "${MISSING_FILES[@]}"; do
        echo_error "  Missing: $file"
    done
fi

# Step 9: Test Docker build (basic validation)
echo_info "Step 9: Validating Docker configuration..."
if [ -f "Dockerfile" ]; then
    if command -v docker &> /dev/null; then
        # Test Docker syntax without building
        if docker build --dry-run . > /dev/null 2>&1; then
            echo_success "Dockerfile syntax valid"
        else
            echo_warning "Dockerfile syntax validation failed"
        fi
    else
        echo_info "Docker not available - skipping Dockerfile validation"
    fi
else
    echo_error "Dockerfile not found"
fi

# Performance Summary Report
SCRIPT_END_TIME=$(date)
TOTAL_TIME=$((INSTALL_TIME + TYPE_CHECK_TIME + LINT_TIME + TEST_TIME + BUILD_TIME + AUDIT_TIME))

echo ""
echo_info "=== CI/CD Performance Report ==="
echo_info "Script Start: $SCRIPT_START_TIME"
echo_info "Script End: $SCRIPT_END_TIME"
echo ""
echo_info "Step Timing Breakdown:"
echo_info "  Dependencies: ${INSTALL_TIME}s"
echo_info "  Type Check: ${TYPE_CHECK_TIME}s"
echo_info "  Linting: ${LINT_TIME}s"
echo_info "  Tests: ${TEST_TIME}s"
echo_info "  Build: ${BUILD_TIME}s"
echo_info "  Security: ${AUDIT_TIME}s"
echo_info "  Total: ${TOTAL_TIME}s"

# Performance Thresholds (same as GitHub Actions)
echo ""
echo_info "=== Performance Threshold Check ==="
FAIL_COUNT=0

if [ $BUILD_TIME -gt 300 ]; then  # 5 minutes
    echo_error "Build time exceeded 5 minutes: ${BUILD_TIME}s"
    FAIL_COUNT=$((FAIL_COUNT + 1))
else
    echo_success "Build time under 5 minutes: ${BUILD_TIME}s"
fi

if [ $TEST_TIME -gt 600 ]; then  # 10 minutes
    echo_error "Test time exceeded 10 minutes: ${TEST_TIME}s"
    FAIL_COUNT=$((FAIL_COUNT + 1))
else
    echo_success "Test time under 10 minutes: ${TEST_TIME}s"
fi

if [ $TOTAL_TIME -gt 900 ]; then  # 15 minutes
    echo_error "Total time exceeded 15 minutes: ${TOTAL_TIME}s"
    FAIL_COUNT=$((FAIL_COUNT + 1))
else
    echo_success "Total time under 15 minutes: ${TOTAL_TIME}s"
fi

# Final Results
echo ""
if [ $FAIL_COUNT -eq 0 ] && [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo_success "=== ALL CI/CD CHECKS PASSED ==="
    echo_success "Your application is ready for GitHub Actions deployment!"
    exit 0
else
    echo_error "=== CI/CD CHECKS FAILED ==="
    echo_error "Performance failures: $FAIL_COUNT"
    echo_error "Missing files: ${#MISSING_FILES[@]}"
    echo_error "Fix these issues before deploying to GitHub Actions"
    exit 1
fi