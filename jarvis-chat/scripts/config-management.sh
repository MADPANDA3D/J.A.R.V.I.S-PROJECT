#!/bin/bash

# Configuration Management and Deployment Script
# Handles environment setup, validation, and deployment automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENTS=("development" "staging" "production")

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Configuration Management and Deployment Script

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    validate-env [ENV]      Validate environment configuration
    deploy [ENV]           Deploy to environment
    setup-env [ENV]        Setup environment files
    backup-config [ENV]    Backup current configuration
    restore-config [ENV]   Restore configuration from backup
    check-health [ENV]     Check environment health
    rotate-secrets [ENV]   Rotate environment secrets
    help                   Show this help message

Environments:
    development, staging, production

Options:
    --dry-run             Show what would be done without executing
    --force               Force operation without prompts
    --backup              Create backup before deployment
    --verbose             Enable verbose output

Examples:
    $0 validate-env production
    $0 deploy staging --backup
    $0 setup-env development
    $0 check-health production
EOF
}

# Validate environment name
validate_environment() {
    local env=$1
    if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${env} " ]]; then
        error "Invalid environment: $env. Valid options: ${ENVIRONMENTS[*]}"
        exit 1
    fi
}

# Check if required tools are installed
check_prerequisites() {
    local tools=("docker" "docker-compose" "curl" "jq")
    local missing=()

    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing+=("$tool")
        fi
    done

    if [ ${#missing[@]} -ne 0 ]; then
        error "Missing required tools: ${missing[*]}"
        log "Please install the missing tools and try again"
        exit 1
    fi
}

# Validate environment configuration
validate_env_config() {
    local env=$1
    local env_file=""
    
    case $env in
        development)
            env_file=".env.template"
            ;;
        staging)
            env_file=".env.staging.template"
            ;;
        production)
            env_file=".env.production.template"
            ;;
    esac

    log "Validating $env environment configuration..."

    # Check if template file exists
    if [ ! -f "$PROJECT_ROOT/$env_file" ]; then
        error "Environment template file not found: $env_file"
        return 1
    fi

    # Check if actual environment file exists
    local actual_env_file="${env_file%.template}"
    if [ "$env" != "development" ]; then
        actual_env_file=".env.$env"
    fi

    if [ ! -f "$PROJECT_ROOT/$actual_env_file" ]; then
        warning "Environment file not found: $actual_env_file"
        log "You may need to create it from the template"
    fi

    # Validate required variables
    local required_vars=()
    case $env in
        development)
            required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
            ;;
        staging|production)
            required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_N8N_WEBHOOK_URL" "N8N_WEBHOOK_SECRET")
            ;;
    esac

    if [ -f "$PROJECT_ROOT/$actual_env_file" ]; then
        local missing_vars=()
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" "$PROJECT_ROOT/$actual_env_file"; then
                missing_vars+=("$var")
            fi
        done

        if [ ${#missing_vars[@]} -ne 0 ]; then
            error "Missing required variables in $actual_env_file: ${missing_vars[*]}"
            return 1
        fi
    fi

    success "Environment configuration validation passed"
    return 0
}

# Setup environment files
setup_environment() {
    local env=$1
    local force=${2:-false}

    log "Setting up $env environment..."

    local template_file=""
    local target_file=""

    case $env in
        development)
            template_file=".env.template"
            target_file=".env"
            ;;
        staging)
            template_file=".env.staging.template"
            target_file=".env.staging"
            ;;
        production)
            template_file=".env.production.template"
            target_file=".env.production"
            ;;
    esac

    if [ ! -f "$PROJECT_ROOT/$template_file" ]; then
        error "Template file not found: $template_file"
        return 1
    fi

    if [ -f "$PROJECT_ROOT/$target_file" ] && [ "$force" != "true" ]; then
        warning "Target file already exists: $target_file"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Skipping environment setup"
            return 0
        fi
    fi

    # Copy template to target
    cp "$PROJECT_ROOT/$template_file" "$PROJECT_ROOT/$target_file"
    success "Created $target_file from template"

    # Set appropriate permissions
    chmod 600 "$PROJECT_ROOT/$target_file"
    log "Set secure permissions on $target_file"

    warning "Please edit $target_file and set actual values for your environment"
    return 0
}

# Backup configuration
backup_configuration() {
    local env=$1
    local backup_dir="$PROJECT_ROOT/.config-backups"
    local timestamp=$(date +"%Y%m%d_%H%M%S")

    log "Creating configuration backup for $env environment..."

    # Create backup directory
    mkdir -p "$backup_dir"

    # Determine which files to backup
    local files_to_backup=()
    case $env in
        development)
            [ -f "$PROJECT_ROOT/.env" ] && files_to_backup+=(".env")
            ;;
        staging)
            [ -f "$PROJECT_ROOT/.env.staging" ] && files_to_backup+=(".env.staging")
            ;;
        production)
            [ -f "$PROJECT_ROOT/.env.production" ] && files_to_backup+=(".env.production")
            ;;
    esac

    if [ ${#files_to_backup[@]} -eq 0 ]; then
        warning "No configuration files found to backup for $env"
        return 0
    fi

    # Create backup archive
    local backup_file="$backup_dir/config_${env}_${timestamp}.tar.gz"
    (cd "$PROJECT_ROOT" && tar -czf "$backup_file" "${files_to_backup[@]}")

    success "Configuration backed up to: $backup_file"
    return 0
}

# Restore configuration
restore_configuration() {
    local env=$1
    local backup_dir="$PROJECT_ROOT/.config-backups"

    log "Looking for configuration backups for $env environment..."

    if [ ! -d "$backup_dir" ]; then
        error "No backup directory found"
        return 1
    fi

    # List available backups
    local backups=($(ls -1 "$backup_dir"/config_${env}_*.tar.gz 2>/dev/null | sort -r))

    if [ ${#backups[@]} -eq 0 ]; then
        error "No backups found for $env environment"
        return 1
    fi

    log "Available backups:"
    for i in "${!backups[@]}"; do
        local backup_name=$(basename "${backups[i]}")
        echo "  $((i+1)). $backup_name"
    done

    read -p "Select backup to restore (1-${#backups[@]}): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[1-9][0-9]*$ ]] || [ "$REPLY" -gt "${#backups[@]}" ]; then
        error "Invalid selection"
        return 1
    fi

    local selected_backup="${backups[$((REPLY-1))]}"
    log "Restoring configuration from: $(basename "$selected_backup")"

    # Extract backup
    (cd "$PROJECT_ROOT" && tar -xzf "$selected_backup")

    success "Configuration restored from backup"
    return 0
}

# Deploy to environment
deploy_to_environment() {
    local env=$1
    local create_backup=${2:-false}
    local dry_run=${3:-false}

    log "Deploying to $env environment..."

    # Validate configuration first
    if ! validate_env_config "$env"; then
        error "Configuration validation failed"
        return 1
    fi

    # Create backup if requested
    if [ "$create_backup" = "true" ]; then
        backup_configuration "$env"
    fi

    # Determine docker-compose file
    local compose_file=""
    case $env in
        development)
            compose_file="docker-compose.yml"
            ;;
        staging)
            compose_file="docker-compose.staging.yml"
            ;;
        production)
            compose_file="docker-compose.prod.yml"
            ;;
    esac

    if [ "$dry_run" = "true" ]; then
        log "DRY RUN - Would execute the following commands:"
        echo "  cd $PROJECT_ROOT"
        echo "  docker-compose -f $compose_file down"
        echo "  docker-compose -f $compose_file pull"
        echo "  docker-compose -f $compose_file up -d"
        return 0
    fi

    # Execute deployment
    cd "$PROJECT_ROOT"

    log "Stopping existing services..."
    docker-compose -f "$compose_file" down || true

    log "Pulling latest images..."
    docker-compose -f "$compose_file" pull

    log "Starting services..."
    docker-compose -f "$compose_file" up -d

    # Wait for services to start
    log "Waiting for services to start..."
    sleep 10

    # Check health
    if check_environment_health "$env"; then
        success "Deployment to $env completed successfully"
        return 0
    else
        error "Deployment health check failed"
        return 1
    fi
}

# Check environment health
check_environment_health() {
    local env=$1
    local health_endpoint=""
    local max_retries=5
    local retry_delay=10

    case $env in
        development)
            health_endpoint="http://localhost:5173/health"
            ;;
        staging)
            health_endpoint="http://localhost:8080/health"
            ;;
        production)
            health_endpoint="http://localhost:80/health"
            ;;
    esac

    log "Checking $env environment health..."

    for i in $(seq 1 $max_retries); do
        log "Health check attempt $i/$max_retries..."

        if curl -f -s "$health_endpoint" > /dev/null 2>&1; then
            success "Health check passed"
            return 0
        fi

        if [ $i -lt $max_retries ]; then
            log "Health check failed, retrying in ${retry_delay}s..."
            sleep $retry_delay
        fi
    done

    error "Health check failed after $max_retries attempts"
    return 1
}

# Rotate secrets
rotate_secrets() {
    local env=$1

    log "Initiating secret rotation for $env environment..."

    warning "Secret rotation is a sensitive operation"
    warning "Make sure you have the ability to update all dependent services"

    read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Secret rotation cancelled"
        return 0
    fi

    # Create backup before rotation
    backup_configuration "$env"

    warning "Secret rotation procedure:"
    warning "1. Generate new secrets manually"
    warning "2. Update environment file"
    warning "3. Update dependent services"
    warning "4. Test the deployment"
    warning "5. Monitor for issues"

    log "Please follow the manual secret rotation procedure"
    log "Refer to the security documentation for detailed steps"

    return 0
}

# Main script logic
main() {
    local command=${1:-help}
    local environment=${2:-}
    local dry_run=false
    local force=false
    local backup=false
    local verbose=false

    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --backup)
                backup=true
                shift
                ;;
            --verbose)
                verbose=true
                set -x
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                shift
                ;;
        esac
    done

    # Check prerequisites
    check_prerequisites

    case $command in
        validate-env)
            if [ -z "$environment" ]; then
                error "Environment required for validate-env command"
                exit 1
            fi
            validate_environment "$environment"
            validate_env_config "$environment"
            ;;
        deploy)
            if [ -z "$environment" ]; then
                error "Environment required for deploy command"
                exit 1
            fi
            validate_environment "$environment"
            deploy_to_environment "$environment" "$backup" "$dry_run"
            ;;
        setup-env)
            if [ -z "$environment" ]; then
                error "Environment required for setup-env command"
                exit 1
            fi
            validate_environment "$environment"
            setup_environment "$environment" "$force"
            ;;
        backup-config)
            if [ -z "$environment" ]; then
                error "Environment required for backup-config command"
                exit 1
            fi
            validate_environment "$environment"
            backup_configuration "$environment"
            ;;
        restore-config)
            if [ -z "$environment" ]; then
                error "Environment required for restore-config command"
                exit 1
            fi
            validate_environment "$environment"
            restore_configuration "$environment"
            ;;
        check-health)
            if [ -z "$environment" ]; then
                error "Environment required for check-health command"
                exit 1
            fi
            validate_environment "$environment"
            check_environment_health "$environment"
            ;;
        rotate-secrets)
            if [ -z "$environment" ]; then
                error "Environment required for rotate-secrets command"
                exit 1
            fi
            validate_environment "$environment"
            rotate_secrets "$environment"
            ;;
        help)
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"