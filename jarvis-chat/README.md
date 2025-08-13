# JARVIS Chat Application

A production-ready React chat application with automated deployment, real-time monitoring, and comprehensive webhook integration.

## 🔄 How Webhooks Work

### 1. GitHub Push → Deployment Flow

When you push commits to the repository:

1. **GitHub Actions Trigger**: `.github/workflows/production-auto.yml` automatically executes
2. **Docker Build**: Creates optimized production image and pushes to GitHub Container Registry
3. **Webhook Notification**: GitHub sends secure webhook to VPS server at `http://your-vps:9000/webhook/deploy`
4. **Deployment Automation**: VPS webhook server receives notification and triggers:
   - Container stop/pull/restart sequence
   - Health verification
   - Real-time user notifications via WebSocket

### 2. Live Session Monitoring

**Real-time Capabilities:**
- **WebSocket Server**: Port 9001 provides live notifications
- **User Notifications**: Pre-deployment warnings with countdown
- **Health Monitoring**: Continuous service status tracking
- **Performance Analytics**: Live webhook metrics and trends

**Monitoring Dashboard:** Access live logs and metrics at `http://your-vps:9000/dashboard`

## 🐳 Docker Deployment

### Prerequisites

- Docker & Docker Compose installed
- Node.js 20+ (for development)
- Git for version control

### Production Deployment

#### 1. Environment Configuration

Create your environment files:

```bash
# Create production environment file
cp .env.template .env.production
```

**Required Environment Variables:**
```env
# Application
NODE_ENV=production
VITE_APP_DOMAIN=your-domain.com

# Database (Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# External Integrations
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-id
N8N_WEBHOOK_SECRET=your-webhook-secret
N8N_API_KEY=your-n8n-api-key

# Security
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars

# Monitoring (Optional)
VITE_SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

#### 2. Production Deployment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost/health
```

#### 3. Complete Webhook Infrastructure Setup (VPS)

**Install webhook infrastructure on your VPS:**

```bash
# Install dependencies (if not already done)
npm install express ws @octokit/rest node-fetch@2

# Copy all systemd service files
sudo cp scripts/jarvis-webhook.service /etc/systemd/system/
sudo cp scripts/jarvis-webhook-backup.service /etc/systemd/system/
sudo cp scripts/jarvis-failover-manager.service /etc/systemd/system/

# Update service files with your actual paths and secrets
sudo nano /etc/systemd/system/jarvis-webhook.service
sudo nano /etc/systemd/system/jarvis-webhook-backup.service
sudo nano /etc/systemd/system/jarvis-failover-manager.service

# Reload systemd and enable all services
sudo systemctl daemon-reload
sudo systemctl enable jarvis-webhook
sudo systemctl enable jarvis-webhook-backup
sudo systemctl enable jarvis-failover-manager

# Start all webhook services
sudo systemctl start jarvis-webhook
sudo systemctl start jarvis-webhook-backup
sudo systemctl start jarvis-failover-manager

# Verify all services are running
sudo systemctl status jarvis-webhook
sudo systemctl status jarvis-webhook-backup
sudo systemctl status jarvis-failover-manager
```

**Required Environment Variables (Update in service files):**
```bash
# Primary Webhook Server (Port 9000)
WEBHOOK_SECRET=your-github-webhook-secret
PROJECT_ROOT=/path/to/your/jarvis-chat
WEBHOOK_PORT=9000
WEBSOCKET_PORT=9001

# Backup Webhook Server (Port 9002)
BACKUP_WEBHOOK_PORT=9002
PRIMARY_WEBHOOK_URL=http://localhost:9000

# Failover Manager (Port 9003)
FAILOVER_MANAGER_PORT=9003
GITHUB_TOKEN=your-github-token-with-repo-permissions
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-repository-name
PRIMARY_WEBHOOK_URL=http://your-vps-ip:9000/webhook/deploy
BACKUP_WEBHOOK_URL=http://your-vps-ip:9002/webhook/deploy
```

**Service Architecture:**
- **Port 9000**: Primary webhook server (main deployment handler)
- **Port 9001**: WebSocket server (real-time notifications)
- **Port 9002**: Backup webhook server (failover redundancy)
- **Port 9003**: Failover manager (automatic switching and health monitoring)

**Health Check All Services:**
```bash
# Test all webhook infrastructure endpoints
curl http://localhost:9000/health    # Primary webhook server
curl http://localhost:9002/health    # Backup webhook server
curl http://localhost:9003/health    # Failover manager

# View real-time logs for all services
journalctl -u jarvis-webhook -f &
journalctl -u jarvis-webhook-backup -f &
journalctl -u jarvis-failover-manager -f &
```

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Docker Compose Files

- **`docker-compose.yml`**: Development environment
- **`docker-compose.prod.yml`**: Production deployment
- **`docker-compose.staging.yml`**: Staging environment
- **`docker-compose.override.yml`**: Local overrides

### Multi-Environment Management

```bash
# Development
docker-compose up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration Templates

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
        
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### GitHub Actions Secrets

Configure these secrets in your GitHub repository:

```yaml
# Repository Settings > Secrets and Variables > Actions
VPS_WEBHOOK_SECRET: "your-webhook-secret"
VITE_SUPABASE_URL: "https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY: "your-anon-key"
N8N_WEBHOOK_SECRET: "your-n8n-secret"
```

### Webhook Failover Configuration

```javascript
// Failover configuration example
{
  "enabled": true,
  "primaryUrl": "http://your-vps:9000",
  "backupUrls": ["http://your-vps:9002"],
  "healthCheckInterval": 30000,
  "failoverThreshold": 3,
  "verificationEnabled": true
}
```

## 📊 Monitoring & Health Checks

### Health Endpoints

- **Application Health**: `http://your-domain/health`
- **Webhook Server**: `http://your-vps:9000/health`
- **WebSocket Status**: `http://your-vps:9001/health`
- **Monitoring Dashboard**: `http://your-vps:9000/dashboard`

### Container Health

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View container logs
docker logs jarvis-chat-prod

# Execute commands in container
docker exec -it jarvis-chat-prod sh
```

### Performance Testing

```bash
# Run webhook failover tests
node scripts/test-webhook-failover.cjs

# Load testing
npm run test:performance

# Security audit
npm audit
```

## 🔒 Security Considerations

### Production Security

- All secrets stored in environment variables (never in code)
- HMAC-SHA256 webhook signature verification
- Rate limiting and DDoS protection
- Content Security Policy (CSP) enabled
- HTTPS enforcement in production

### Docker Security

```dockerfile
# Security best practices applied:
# - Non-root user execution
# - Minimal base images (Alpine)
# - Multi-stage builds
# - Health checks
# - Read-only configurations
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Webhook secrets set in GitHub
- [ ] VPS webhook server deployed
- [ ] Health checks passing
- [ ] SSL certificates configured (if using HTTPS)

### Post-Deployment

- [ ] Application accessible at domain
- [ ] Webhook delivery working
- [ ] Real-time notifications functional
- [ ] Monitoring dashboard accessible
- [ ] Backup systems operational

## 📝 Scripts Reference

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Code linting
npm run typecheck    # TypeScript checking
```

### Docker Scripts

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up
docker-compose down -v --rmi all
```

### Webhook Scripts

```bash
# Test webhook server
node scripts/test-webhook-failover.cjs

# Monitor webhook performance
node scripts/test-monitoring-integration.cjs

# Test alerting system
node scripts/test-alerting-system.cjs
```

## 🛠️ Troubleshooting

### Common Issues

**Webhook Not Receiving:**
```bash
# Check all webhook servers status
curl http://your-vps:9000/health    # Primary
curl http://your-vps:9002/health    # Backup
curl http://your-vps:9003/health    # Failover Manager

# Verify GitHub webhook configuration
# Ensure URL and secret are correct
```

**Webhook Failover Services Not Starting:**
```bash
# Check service status
sudo systemctl status jarvis-webhook-backup
sudo systemctl status jarvis-failover-manager

# View detailed logs
journalctl -u jarvis-webhook-backup --no-pager -n 20
journalctl -u jarvis-failover-manager --no-pager -n 20

# Check missing dependencies
npm list express ws @octokit/rest

# Install missing dependencies
npm install @octokit/rest node-fetch@2
```

**Container Won't Start:**
```bash
# Check logs
docker logs jarvis-chat-prod

# Verify environment variables
docker exec jarvis-chat-prod env | grep VITE_
```

**Health Check Failing:**
```bash
# Test health endpoint
curl -f http://localhost/health

# Check nginx configuration
docker exec jarvis-chat-prod nginx -t
```

**Failover System Troubleshooting:**
```bash
# Test failover trigger manually
curl -X POST http://localhost:9003/failover/trigger \
  -H "Content-Type: application/json" \
  -d '{"target": "backup"}'

# Check failover status
curl http://localhost:9003/failover/status

# Reset failover to primary
curl -X POST http://localhost:9003/failover/trigger \
  -H "Content-Type: application/json" \
  -d '{"target": "primary"}'
```

### Support & Logs

- **Application Logs**: `docker logs jarvis-chat-prod`
- **Webhook Logs**: `sudo journalctl -u jarvis-webhook -f`
- **System Logs**: `/var/log/nginx/` (if using external nginx)

## 📚 Architecture

This application features:

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Docker** multi-stage builds for production
- **Nginx** for static file serving
- **Supabase** for authentication and database
- **Real-time WebSocket** notifications
- **Comprehensive monitoring** and alerting
- **Automated CI/CD** with GitHub Actions
- **Webhook-driven deployments** with failover

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is proprietary software. All rights reserved.