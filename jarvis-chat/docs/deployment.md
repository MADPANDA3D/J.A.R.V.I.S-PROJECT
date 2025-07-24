# JARVIS Chat - Production Deployment Guide

This guide covers deploying JARVIS Chat to a VPS with Docker and nginx reverse proxy.

## 📋 Prerequisites

- Linux VPS with Docker and Docker Compose installed
- Domain/subdomain configured to point to your VPS
- nginx with SSL certificates (Let's Encrypt recommended)
- Supabase project set up
- n8n instance (optional, for AI responses)

## 🚀 Quick Deployment

### 1. Clone and Prepare

```bash
# Clone the repository
git clone <your-repo-url> jarvis-chat
cd jarvis-chat

# Create environment file
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your production values:

```env
# Required - Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional - AI Integration
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/chat/send

# Optional - Domain Configuration
VITE_APP_DOMAIN=jarvis.yourdomain.com
```

### 3. Deploy with Docker

```bash
# Build and start the container
docker-compose up -d

# Check logs
docker-compose logs -f jarvis-chat
```

### 4. Configure nginx Reverse Proxy

Create `/etc/nginx/sites-available/jarvis-chat`:

```nginx
server {
    listen 80;
    server_name jarvis.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name jarvis.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/jarvis.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jarvis.yourdomain.com/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts for AI responses
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/jarvis-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Detailed Configuration

### Environment Variables Explained

| Variable                 | Required | Description                                             |
| ------------------------ | -------- | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | ✅ Yes   | Your Supabase project URL                               |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes   | Supabase anonymous/public key                           |
| `VITE_N8N_WEBHOOK_URL`   | ❌ No    | n8n webhook for AI responses (uses fallback if not set) |
| `VITE_APP_DOMAIN`        | ❌ No    | Your app domain for CORS and redirects                  |

### Supabase Setup

1. **Create tables** (run the migration):

```sql
-- Run the contents of supabase/migrations/001_create_messages_table.sql
```

2. **Configure authentication** in Supabase dashboard:
   - Enable email authentication
   - Set up your site URL: `https://jarvis.yourdomain.com`
   - Add redirect URLs if needed

3. **Row Level Security**: Ensure RLS is enabled on all tables

### n8n Integration (Optional)

If you want real AI responses instead of fallback responses:

1. Set up an n8n instance
2. Create a webhook workflow
3. Set the webhook URL in `VITE_N8N_WEBHOOK_URL`
4. The webhook should accept POST requests with:

```json
{
  "message": "user message text",
  "userId": "user-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f jarvis-chat
```

### Health Monitoring

Check application health:

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs jarvis-chat

# Check nginx status
sudo systemctl status nginx

# Test SSL certificate
curl -I https://jarvis.yourdomain.com
```

### Backup Strategy

1. **Database**: Use Supabase's built-in backup features
2. **Configuration**: Keep your `.env.local` file backed up securely
3. **Code**: Ensure your customizations are in version control

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**

```bash
# Check Docker logs
docker-compose logs jarvis-chat

# Verify environment variables
docker-compose config
```

**nginx 502 Bad Gateway:**

```bash
# Check if the app container is running
docker-compose ps

# Verify port 3000 is accessible
curl http://localhost:3000

# Check nginx configuration
sudo nginx -t
```

**Environment validation errors:**

- Check browser console for detailed error messages
- Verify all required environment variables are set
- Ensure Supabase URLs and keys are correct

**Supabase connection issues:**

- Verify your Supabase project is active
- Check that the URL and key are correct
- Ensure RLS policies are properly configured

### Performance Optimization

For high-traffic deployments:

1. **Enable nginx caching**:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

2. **Use a CDN** for static assets

3. **Enable gzip compression** (already configured in nginx.conf)

4. **Monitor resource usage**:

```bash
docker stats jarvis-chat
```

## 🔒 Security Considerations

### SSL/TLS Configuration

Ensure you have:

- Valid SSL certificate (Let's Encrypt recommended)
- Modern TLS configuration
- HSTS headers enabled
- Security headers configured

### Environment Security

- Never commit `.env.local` to version control
- Use strong, unique passwords for all services
- Regularly rotate API keys and tokens
- Keep Docker images updated

### Network Security

- Configure firewall to only allow necessary ports (80, 443, 22)
- Use fail2ban for SSH protection
- Keep your VPS system updated

## 📊 Monitoring and Analytics

### Application Monitoring

The application includes built-in environment validation that logs to the browser console. In Settings, you can view:

- Environment status (Production/Development)
- Configuration validation results
- Service connection status
- Error and warning details

### Log Management

```bash
# View real-time logs
docker-compose logs -f jarvis-chat

# Save logs to file
docker-compose logs jarvis-chat > jarvis-chat.log

# Rotate logs (add to crontab)
docker-compose logs --tail=1000 jarvis-chat > /var/log/jarvis-chat.log
```

## 🚀 Production Checklist

Before going live:

- [ ] Environment variables configured correctly
- [ ] Supabase project set up with proper authentication
- [ ] Database migrations applied
- [ ] SSL certificate installed and working
- [ ] nginx reverse proxy configured
- [ ] Domain DNS pointing to VPS
- [ ] Application building and starting successfully
- [ ] Environment validation passing (check Settings page)
- [ ] Chat functionality working (send test message)
- [ ] Authentication working (register/login test)
- [ ] All pages accessible and responsive
- [ ] Error boundaries working (test by triggering errors)
- [ ] Performance acceptable (test on different devices)

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs: `docker-compose logs jarvis-chat`
3. Check browser console for client-side errors
4. Verify environment configuration in Settings page
5. Test each component individually (auth, database, chat)

---

**Ready for production!** 🎉

This deployment guide ensures your JARVIS Chat application is secure, performant, and ready for real-world use.
