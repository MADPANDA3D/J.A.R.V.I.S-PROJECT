# JARVIS Chat - AI Chat Application

A modern, responsive AI chat application built with React, TypeScript, and Vite. Features dark theme with crimson red and neon accent colors, real-time chat functionality, and seamless integration with n8n backend services.

## 🚀 Quick Start

**Important: All commands must be run from the `jarvis-chat` directory**

```bash
# Clone the repository  
git clone https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT.git
cd J.A.R.V.I.S-PROJECT/jarvis-chat

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

**Health Check:** `http://localhost:5173/health` - Monitor system status  
**API Documentation:** `http://localhost:5173/api-docs.html` - Interactive API documentation with Swagger UI

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup (Supabase)

The application requires a Supabase database with specific tables for both the frontend chat interface and n8n workflow integration.

#### Quick Setup Instructions

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be created

2. **Set up the database**:
   - Navigate to your project dashboard
   - Go to **SQL Editor** in the left sidebar
   - Click **"New query"**
   - Copy and paste the SQL below into the editor
   - Click **"Run"** to execute

#### Database Schema (Copy & Paste)

```sql
-- =====================================================
-- JARVIS Chat Application Database Setup
-- =====================================================
-- This script creates all necessary tables and functions
-- for both the frontend chat interface and n8n backend
-- =====================================================

-- 1. Frontend Chat Messages Table (for chat interface)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for frontend messages
CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" ON public.chat_messages
    FOR DELETE USING (auth.uid() = user_id);

-- 2. n8n LangChain Postgres Chat Memory Table
-- =====================================================
-- This table is REQUIRED by n8n LangChain Postgres Chat Memory nodes
-- The schema must match exactly what LangChain expects
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message JSONB NOT NULL
);

-- Create indexes for n8n LangChain chat memory
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);

-- Enable RLS for LangChain messages (allow service role access)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow service role (n8n) to access LangChain messages
CREATE POLICY "Service role can manage langchain messages" ON public.messages
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users to read their own session memory
CREATE POLICY "Users can view their langchain session memory" ON public.messages
    FOR SELECT USING (
        session_id = 'session_' || auth.uid()::text
        OR session_id LIKE '%' || auth.uid()::text || '%'
    );

-- 3. User Profiles Table
-- =====================================================
-- Extended user information for the chat application
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Conversation Sessions Table
-- =====================================================
-- Track conversation sessions for better organization
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    session_id TEXT NOT NULL UNIQUE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for conversation sessions
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON public.conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_session_id ON public.conversation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_last_message ON public.conversation_sessions(last_message_at);

-- Enable RLS for conversation sessions
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation sessions
CREATE POLICY "Users can manage their own conversations" ON public.conversation_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 5. Utility Functions
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger to create profile on user signup (drop if exists, then create)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant Permissions
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.conversation_sessions TO authenticated;

-- Grant permissions to service role (for n8n)
GRANT ALL ON public.chat_messages TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.conversation_sessions TO service_role;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Your database is now ready for:
-- ✅ Frontend chat interface (chat_messages table)
-- ✅ n8n LangChain integration (messages table with SERIAL id, session_id, message JSONB)
-- ✅ User authentication and profiles
-- ✅ Conversation session management
-- ✅ AI memory persistence
-- =====================================================
```

3. **Get your database credentials**:
   - Go to **Settings** > **API** in your Supabase dashboard
   - Copy the following values:
     - Project URL
     - Project API Key (anon public)
     - Project API Key (service_role) - for n8n integration

#### n8n Integration Setup

If you're using n8n workflows, configure your Postgres connection:

1. **Add Postgres Credential in n8n**:
   - Go to n8n Credentials
   - Add new "Postgres" credential
   - Use your Supabase database credentials:
     - Host: `db.YOUR_PROJECT_REF.supabase.co`
     - Database: `postgres`
     - User: `postgres`
     - Password: Your database password
     - Port: `5432`
     - SSL: `require`

2. **Update Postgres Chat Memory nodes**:
   - Set table name to: `messages`
   - Set session ID field to match your session logic
   - Ensure the workflow uses the correct credentials
   - This table uses the LangChain schema (id SERIAL, session_id VARCHAR, message JSONB)

### 3. Environment Variables

**Important: Environment files must be created in the `jarvis-chat` directory**

Copy the template and add your credentials:

```bash
# Make sure you're in the jarvis-chat directory
cd jarvis-chat

# Copy the template file
cp .env.template .env.local

# Edit with your actual credentials
nano .env.local
```

**Note:** If `.env.template` doesn't exist, create it manually with the template provided below.

### Required Environment Variables:

- **VITE_SUPABASE_URL** - Your Supabase project URL
- **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous key

### Optional Environment Variables:

**Basic Optional:**
- **VITE_N8N_WEBHOOK_URL** - Your n8n webhook URL for AI responses
- **VITE_APP_DOMAIN** - Your custom domain name

**Advanced Optional (prevents Docker warnings):**
- **VITE_APP_VERSION** - Application version for display
- **VITE_CDN_URL** - CDN URL for static assets
- **SUPABASE_SERVICE_ROLE_KEY** - Supabase admin operations key
- **N8N_WEBHOOK_SECRET** - Security secret for n8n webhooks
- **N8N_API_KEY** - n8n API authentication key
- **JWT_SECRET** - Custom JWT signing secret
- **ENCRYPTION_KEY** - Data encryption key
- **VITE_SENTRY_DSN** - Sentry error tracking DSN
- **DATADOG_API_KEY** - DataDog monitoring API key

#### Environment Template (if .env.template is missing)

If the `.env.template` file doesn't exist, create it manually in the `jarvis-chat` directory:

```bash
# Make sure you're in the jarvis-chat directory
cd jarvis-chat

# Create the environment template file
cat > .env.template << 'EOF'
# ==========================================
# JARVIS Chat - Environment Configuration
# ==========================================
# Copy this file to .env.local and fill in your actual credentials
# DO NOT commit .env.local to version control!

# ==========================================
# REQUIRED - Supabase Configuration
# ==========================================
# Get these from your Supabase project dashboard:
# https://app.supabase.com/project/YOUR_PROJECT/settings/api

# Your Supabase project URL (looks like: https://abcdefghijk.supabase.co)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key (starts with "eyJ...")
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here

# ==========================================
# OPTIONAL - Basic Features
# ==========================================
# If you have an n8n instance for AI responses, add the webhook URL
# If not set, the app will use fallback AI responses for testing
# VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat/send

# Your application domain (used for CORS and redirects)
# VITE_APP_DOMAIN=jarvis.yourdomain.com

# ==========================================
# OPTIONAL - Advanced Configuration
# ==========================================
# These prevent Docker warnings but are not required for basic functionality

# Application version for display in UI
# VITE_APP_VERSION=1.0.0

# CDN URL for serving static assets (optional)
# VITE_CDN_URL=https://cdn.yourdomain.com

# Supabase service role key for admin operations (KEEP SECURE!)
# Get from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

# n8n webhook security (recommended if using n8n)
# N8N_WEBHOOK_SECRET=your-random-secret-string-here
# N8N_API_KEY=your-n8n-api-key

# Custom security keys (generate random strings)
# JWT_SECRET=your-jwt-secret-minimum-32-characters-long
# ENCRYPTION_KEY=your-encryption-key-32-characters-long

# Error tracking with Sentry (optional)
# Get from: https://sentry.io/settings/projects/
# VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Monitoring with DataDog (optional)  
# Get from: https://app.datadoghq.com/organization-settings/api-keys
# DATADOG_API_KEY=your-datadog-api-key
EOF

# Now copy it to create your local environment file
cp .env.template .env.local
```

### 📍 Where to Find Each Credential

#### **Required Credentials**

**Supabase Configuration:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Navigate to your project dashboard
3. Go to **Settings** → **API** in the left sidebar
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (optional, keep secure!)

#### **Optional Credentials**

**n8n Integration:**
1. **Webhook URL** (`VITE_N8N_WEBHOOK_URL`):
   - From your n8n instance workflow
   - Usually looks like: `https://your-n8n.com/webhook/xxxxx`
2. **API Key** (`N8N_API_KEY`):
   - n8n Settings → Personal Access Tokens
3. **Webhook Secret** (`N8N_WEBHOOK_SECRET`):
   - Generate a random string (min 16 characters)
   - Example: `openssl rand -base64 32`

**Security Keys (Generate Random Strings):**
```bash
# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate ENCRYPTION_KEY (32+ characters)  
openssl rand -base64 32

# Generate N8N_WEBHOOK_SECRET
openssl rand -base64 32
```

**Error Tracking (Sentry):**
1. Create account at [sentry.io](https://sentry.io)
2. Create new project
3. Go to **Settings** → **Projects** → **Your Project** → **Client Keys (DSN)**
4. Copy the DSN → `VITE_SENTRY_DSN`

**Monitoring (DataDog):**
1. Create account at [datadoghq.com](https://datadoghq.com)
2. Go to **Organization Settings** → **API Keys**
3. Create new API key → `DATADOG_API_KEY`

**Application Configuration:**
- **Version** (`VITE_APP_VERSION`): Your app version (e.g., "1.0.0")
- **Domain** (`VITE_APP_DOMAIN`): Your custom domain (e.g., "jarvis.yourdomain.com")
- **CDN URL** (`VITE_CDN_URL`): Your CDN provider URL (CloudFlare, AWS CloudFront, etc.)

#### **Quick Start - Minimal Configuration**

For basic functionality, you only need:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here
```

To eliminate all Docker warnings, add these with any values:
```env
VITE_APP_VERSION=1.0.0
VITE_CDN_URL=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_SECRET=
N8N_API_KEY=
JWT_SECRET=minimum-32-character-random-string-here
ENCRYPTION_KEY=another-32-character-random-string-here
VITE_SENTRY_DSN=
DATADOG_API_KEY=
```

### 4. Start Development Server

```bash
# Make sure you're in the jarvis-chat directory
npm run dev
```

The application will be available at `http://localhost:5173` with hot reload enabled.

### 5. Quick Deployment Test

To test the full Docker deployment locally:
```bash
# Still in jarvis-chat directory
cp .env.local .env          # Docker Compose needs .env file  
docker-compose up -d --build

# Test the application
curl http://localhost:3000/health

# Check logs if needed
docker-compose logs jarvis-chat

# Stop when done testing
docker-compose down
```

## 🔧 Available Scripts

**Development**
- `npm run dev` - Start development server with hot reload
- `npm run preview` - Preview production build locally

**Testing & Quality**
- `npm run test` - Run test suite in watch mode
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:ui` - Run tests with UI interface
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint code analysis
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

**Production**
- `npm run build` - Build optimized production bundle

## 🏗️ Project Structure

```
jarvis-chat/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── chat/           # Chat-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components
│   │   └── accessibility/  # Accessibility components and controls
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   │   ├── accessibility.ts     # Accessibility utilities and managers
│   │   ├── color-contrast-validator.ts # WCAG color contrast validation
│   │   └── accessibility-testing.ts    # Automated accessibility testing
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles with custom theme
├── public/                 # Static assets
│   ├── api-docs.html       # Interactive Swagger UI documentation
│   └── api/                # API documentation
│       └── openapi.yaml    # OpenAPI 3.0 specification
├── docs/                   # Documentation
│   ├── api-integration-guide.md # Comprehensive API integration guide
│   └── stories/            # Development stories and requirements
├── docker/                 # Docker-related files
└── package.json           # Project configuration
```

## 🎨 Theme & Styling

The application uses a dark theme with:

- **Primary Colors**: Pure Black (#000000), Pure White (#FFFFFF), Crimson Red (#DC143C)
- **Accent Colors**: Neon Cyan, Green, Purple, Yellow
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Typography**: System fonts with optimized rendering

### Custom CSS Classes

```css
.neon-cyan {
  color: #00ffff;
}
.neon-green {
  color: #00ff00;
}
.neon-purple {
  color: #ff00ff;
}
.neon-yellow {
  color: #ffff00;
}
```

## 🐳 Docker Deployment

Ready-to-deploy Docker setup with copy-paste commands for easy VPS deployment.

**Important: All Docker commands must be run from the `jarvis-chat` directory**

### 🚀 Quick Start (Copy & Paste)

**Step 1: Download and Setup**
```bash
# Clone the repository
git clone https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT.git
cd J.A.R.V.I.S-PROJECT/jarvis-chat

# Copy environment template
cp .env.template .env.local
```

**Step 2: Configure Environment**
```bash
# Edit .env.local with your credentials
nano .env.local
```

Add your actual credentials:
```env
# Required - Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key

# Optional - AI Integration  
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat
VITE_APP_DOMAIN=jarvis.yourdomain.com
```

**Important:** Docker Compose requires both `.env.local` and `.env` files:
```bash
# Copy .env.local to .env for Docker Compose
cp .env.local .env
```

**Step 3: Deploy with Docker Compose**
```bash
# Build and start the application (from jarvis-chat directory)
docker-compose up -d --build

# Check deployment status
docker-compose ps
docker-compose logs jarvis-chat
```

**Note:** Always use `--build` flag on first deployment to ensure fresh build.

### 📋 Ready-to-Use docker-compose.yml

Create this file in the `jarvis-chat` directory:

```yaml
version: '3.8'

services:
  jarvis-chat:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jarvis-chat
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    volumes:
      # Optional: Mount logs directory
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - jarvis-network

  # Optional: nginx reverse proxy (if not using external nginx)
  nginx:
    image: nginx:alpine
    container_name: jarvis-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # Mount your SSL certificates
    depends_on:
      - jarvis-chat
    networks:
      - jarvis-network
    profiles:
      - nginx  # Optional service, enable with --profile nginx

networks:
  jarvis-network:
    driver: bridge
```

### 🛠️ Advanced Deployment Options

**Option 1: Simple Deployment (App Only)**
```bash
# Just run the application (from jarvis-chat directory)
docker-compose up -d jarvis-chat
```

**Option 2: With nginx Reverse Proxy**
```bash
# Run with built-in nginx (requires nginx.conf setup in jarvis-chat directory)
docker-compose --profile nginx up -d
```

**Option 3: Production Build Only**
```bash
# Build the Docker image (from jarvis-chat directory)
docker build -t jarvis-chat:latest .

# Run with custom settings
docker run -d \
  --name jarvis-chat \
  --restart unless-stopped \
  -p 3000:80 \
  --env-file .env.local \
  jarvis-chat:latest
```

### 🔧 Deployment Commands Reference

**Important: Run all Docker commands from the `jarvis-chat` directory**

**Start Services**
```bash
# From jarvis-chat directory
docker-compose up -d
```

**Stop Services**
```bash
# From jarvis-chat directory
docker-compose down
```

**Update Application**
```bash
# Pull latest changes from main project directory
cd J.A.R.V.I.S-PROJECT
git pull origin main

# Navigate to jarvis-chat and rebuild
cd jarvis-chat
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f jarvis-chat
```

**Health Check**
```bash
# Check application health
curl http://localhost:3000/health

# Check container status
docker-compose ps
```

### 🔒 Production Security

**Environment Variables**
- Never commit `.env.local` to version control
- Use strong, unique credentials
- Regularly rotate API keys

**Container Security**
```bash
# Run with non-root user (already configured in Dockerfile)
# Limit container resources
docker-compose up -d --memory="512m" --cpus="1"
```

**SSL/TLS Setup**
```bash
# If using built-in nginx, mount SSL certificates:
# - Place certificates in ./ssl/ directory
# - Update nginx.conf with SSL configuration
# - Restart with: docker-compose --profile nginx up -d
```

### 📊 Monitoring & Maintenance

**Health Monitoring**
```bash
# Built-in health check endpoint
curl http://localhost:3000/health

# Docker health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Log Management**
```bash
# Rotate logs (add to crontab)
docker-compose logs --tail=1000 jarvis-chat > /var/log/jarvis-chat.log

# Clear old logs
docker system prune -f
```

**Backup Commands**
```bash
# Backup environment configuration
cp .env.local .env.backup

# Export container (if needed)
docker save jarvis-chat:latest > jarvis-chat-backup.tar
```

## 🔍 Code Quality

The project enforces code quality through:

- **ESLint**: Linting for JavaScript/TypeScript
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Pre-commit hooks
- **Pre-commit hooks**: Runs type checking and format validation

### Pre-commit Hooks

Before each commit, the following checks run automatically:

- TypeScript type checking (`npm run type-check`)
- Code formatting validation (`npm run format:check`)

## 🏛️ Architecture

### Frontend Stack

- **React 18+** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **shadcn/ui** components with Tailwind CSS
- **React Query** for state management and caching
- **React Router** for client-side routing

### Backend Integration

- **Supabase** for authentication, database, and real-time features
- **n8n** webhook integration for AI agent functionality
- **RESTful API** communication with error handling and retries

### Deployment

- **Docker** containerization with nginx for production
- **Multi-stage builds** for optimized image size
- **Environment-based configuration**

## ✨ Features

### 🎯 Core Features
- **Real-time Chat Interface** - WebSocket-based messaging with Supabase
- **AI Integration** - n8n webhook support with intelligent fallback responses
- **User Authentication** - Secure login/registration with Supabase Auth
- **Message Persistence** - Chat history stored and synchronized across sessions
- **Responsive Design** - Mobile-first UI with dark theme and neon accents
- **API Documentation** - Interactive OpenAPI 3.0 specification with Swagger UI
- **Accessibility Compliance** - WCAG 2.1 AA compliance with screen reader support

### 🛡️ Production Ready
- **Health Monitoring** - Built-in health checks at `/health` endpoint
- **Error Tracking** - Comprehensive error capture and reporting system
- **Environment Validation** - Runtime configuration validation with status display
- **Type Safety** - Full TypeScript implementation with strict typing
- **Test Coverage** - Automated testing with Vitest and React Testing Library
- **API Documentation** - Complete OpenAPI 3.0 specification with interactive Swagger UI
- **Accessibility Testing** - Automated WCAG 2.1 AA compliance validation with axe-core

### 🔧 Developer Experience
- **Hot Reload** - Fast development with Vite
- **Code Quality** - ESLint, Prettier, and pre-commit hooks
- **Docker Support** - One-command deployment with docker-compose
- **Environment Management** - Template-based configuration with validation
- **Error Boundaries** - Graceful error handling with recovery options

### 🎨 User Interface
- **Modern Design** - shadcn/ui components with Tailwind CSS
- **Dark Theme** - Optimized for extended use with crimson red accents
- **Accessibility** - WCAG 2.1 AA compliant with screen reader support and keyboard navigation
- **Loading States** - Smooth UX with skeleton loaders and progress indicators
- **Error States** - Clear error messages with retry mechanisms
- **User Preferences** - Accessibility controls for high contrast, font size, and reduced motion

### 📊 Monitoring & Analytics
- **Health Dashboard** - Real-time system status monitoring
- **Performance Tracking** - Response time and system metrics
- **Error Analytics** - Detailed error tracking with context and stack traces
- **Environment Status** - Configuration validation and service connectivity

### 📚 API Documentation & Integration
- **OpenAPI 3.0 Specification** - Complete API documentation with schemas and examples
- **Interactive Swagger UI** - Test API endpoints directly in the browser
- **Authentication Examples** - JWT flow with code samples in multiple languages
- **Rate Limiting Documentation** - Clear usage guidelines and optimization strategies
- **Integration Guide** - Comprehensive developer documentation with cURL, JavaScript, Python, and TypeScript examples

### ♿ Accessibility Features
- **WCAG 2.1 AA Compliance** - Full accessibility standard compliance
- **Screen Reader Support** - Comprehensive ARIA implementation and testing
- **Keyboard Navigation** - Complete keyboard-only interface navigation
- **Color Contrast Validation** - Mathematical compliance checking with user controls
- **Visual Accessibility Controls** - User preference system for high contrast, font size, and reduced motion
- **Automated Testing** - Continuous accessibility validation with axe-core integration

## 🚀 Production Deployment

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_N8N_WEBHOOK_URL` - Your n8n webhook endpoint
- `VITE_APP_DOMAIN` - Your application domain

### Docker Production Deployment

The production Docker image uses nginx to serve the built static files:

```bash
docker build -t jarvis-chat .
docker run -d -p 80:80 --name jarvis-chat-prod jarvis-chat
```

## 🧪 Testing

### Automated Testing

**Run Test Suite**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

**Test Coverage**
- ✅ Environment validation logic
- ✅ Authentication flow (ProtectedRoute)
- ✅ Chat functionality (useChat hook)
- ✅ Error boundary components
- ✅ Health check system
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ API documentation validation
- ✅ Color contrast validation

### Code Quality Checks

**TypeScript Validation**
```bash
npm run type-check
```

**Linting**
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

**Code Formatting**
```bash
npm run format
npm run format:check
```

### Production Testing Checklist

**Application Features**
- [ ] Authentication (login/logout/registration)
- [ ] Chat interface with real-time updates
- [ ] Message persistence and history loading
- [ ] Error handling and retry mechanisms
- [ ] Environment validation in Settings
- [ ] Health monitoring dashboard (`/health`)
- [ ] API documentation (`/api-docs.html`)
- [ ] Accessibility controls and preferences
- [ ] Dark theme with crimson red accents
- [ ] Responsive design (mobile/desktop)

**Technical Validation**
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] ESLint rules pass (`npm run lint`)
- [ ] Test suite passes (`npm run test:run`)
- [ ] Accessibility testing passes (axe-core validation)
- [ ] Production build succeeds (`npm run build`)
- [ ] Docker container builds and runs
- [ ] Health check endpoint responds (`/health`)
- [ ] API documentation accessible (`/api-docs.html`)
- [ ] WCAG 2.1 AA compliance validated
- [ ] Error tracking captures issues
- [ ] Environment variables validate correctly

**Deployment Verification**
- [ ] Docker containers start successfully
- [ ] Application accessible on configured port
- [ ] Database connectivity confirmed
- [ ] SSL/TLS certificates work (if configured)
- [ ] nginx reverse proxy functional
- [ ] Health monitoring shows "healthy" status

## 🔧 Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're using Node.js 20 or higher
2. **Dependencies**: Run `npm install` if you encounter missing module errors
3. **Type Errors**: Run `npm run type-check` to identify TypeScript issues
4. **Build Errors**: Clear `node_modules` and reinstall dependencies

### Development Issues

- **Hot Reload Not Working**: Restart the development server
- **Import Path Issues**: Check that path aliases are correctly configured
- **Theme Not Applied**: Ensure Tailwind CSS is properly imported in `index.css`

### Docker Issues

- **Build Failures**: Ensure Node.js 20+ is available in the container
- **Port Conflicts**: Use different ports if 3000 or 80 are occupied
- **Environment Variables**: Verify all required variables are set

**Environment Variable Warnings (NORMAL)**
```bash
WARNING: The VITE_APP_VERSION variable is not set. Defaulting to a blank string.
WARNING: The VITE_CDN_URL variable is not set. Defaulting to a blank string.
```
These warnings are normal for optional variables. Only fix if you need these features.

**Required Environment Variables Fix**
If you see warnings for required variables, ensure you have both files:
```bash
# Make sure both files exist in jarvis-chat directory
cp .env.local .env  # Docker Compose needs .env file
ls -la .env*        # Should show both .env and .env.local
```

**Package Lock File Issues**
If you see npm lockfile warnings during build:
```bash
# Delete and regenerate package-lock.json
rm package-lock.json
npm install
docker-compose down
docker-compose up -d --build
```

**Docker BuildX Errors**
If you see "buildx" format errors, use legacy builder:
```bash
export DOCKER_BUILDKIT=0
docker-compose up -d --build
```

### Deployment Issues

**Empty jarvis-chat Folder After Clone (FIXED)**
```bash
# ISSUE: jarvis-chat folder appears empty after git clone
# CAUSE: jarvis-chat was a separate git repository (submodule)
# FIX: Merged jarvis-chat into main repository structure

# If you cloned before this fix, you'll need to pull the latest:
git pull origin main

# The jarvis-chat folder should now contain all files
```

**Missing .env.template File (FIXED)**
```bash
# This issue has been resolved - .env.template is now included in the repository
# If you still don't see it, create it manually:

cat > .env.template << 'EOF'
# JARVIS Chat Environment Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here
# VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat/send
# VITE_APP_DOMAIN=jarvis.yourdomain.com
EOF

# Then copy it to create your environment file
cp .env.template .env.local
```

**Correct Directory Structure**
```bash
# Make sure you're in the right directory:
git clone https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT.git
cd J.A.R.V.I.S-PROJECT          # Main project directory
cd jarvis-chat                  # Navigate to the chat application
ls -la                          # Should see package.json, src/, public/, etc.
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run type-check && npm run lint`
5. Commit changes: `git commit -m "Add feature"`
6. Push to branch: `git push origin feature-name`
7. Create Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow the existing code style (enforced by Prettier)
- Add type definitions for new interfaces
- Use semantic commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For questions, issues, or contributions, please refer to the project documentation or contact the development team.

---

**JARVIS Chat** - Built with ❤️ for seamless AI conversations
