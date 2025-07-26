# JARVIS Chat - AI Chat Application

A modern, responsive AI chat application built with React, TypeScript, and Vite. Features dark theme with crimson red and neon accent colors, real-time chat functionality, and seamless integration with n8n backend services.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Available Scripts](#available-scripts)
7. [Project Structure](#project-structure)
8. [Features](#features)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

---

## 🚀 Quick Start

**Follow these steps in exact order:**

```bash
# 1. Clone the repository  
git clone https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT.git
cd J.A.R.V.I.S-PROJECT

# 2. Check Node.js version (CRITICAL STEP)
node --version  # Must show v20.19.0 or higher

# 3. If Node.js is v18.x or lower, upgrade it first:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should now show v20.x.x

# 4. Install dependencies (this may take a few minutes)
npm install

# 5. Configure environment
cp .env.template .env.local
nano .env.local  # Add your Supabase credentials

# 6. Start development server
npm run dev
```

**✅ Application will be available at:** `http://localhost:5173`

**📊 Health Check:** `http://localhost:5173/health`  
**📚 API Documentation:** `http://localhost:5173/api-docs.html`

---

## 📋 Prerequisites

### Required Software
- **Node.js 20.19.0 or higher** (NOT Node.js 18!)
- **npm 10 or higher** 
- **Docker** (for containerized deployment)

### Version Check
```bash
node --version  # Must be 20.19.0 or higher
npm --version   # Should be 9.2.0 or higher
```

### ⚠️ Node.js Upgrade (If Needed)

**If you have Node.js 18.x or lower, you MUST upgrade:**

```bash
# Method 1: Using NodeSource repository (Recommended for Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Method 2: Using snap (Alternative)
sudo snap install node --classic

# Verify installation
node --version  # Should show v20.19.0 or higher
npm --version   # Should show 10.x.x or higher
```

---

## 🛠️ Development Setup

### Step 1: Prerequisites Check & Installation

```bash
# Check your Node.js version FIRST
node --version
npm --version

# If Node.js is v18.x or lower, upgrade it (see Prerequisites section)
```

### Step 2: Install Dependencies

```bash
# Make sure you're in the project directory
cd J.A.R.V.I.S-PROJECT

# Clean any previous installations (if you had issues)
rm -rf node_modules package-lock.json

# Install all project dependencies (this may take a few minutes)
npm install

# Verify installation
npx vite --version  # Should show vite/7.0.6 with your Node.js version
```

### Step 3: Database Setup (Supabase)

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
   - Copy and paste the SQL schema below
   - Click **"Run"** to execute

#### Database Schema
<details>
<summary>Click to expand database schema</summary>

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
</details>

3. **Get your database credentials**:
   - Go to **Settings** > **API** in your Supabase dashboard
   - Copy the following values:
     - Project URL
     - Project API Key (anon public)
     - Project API Key (service_role) - for n8n integration

### Step 4: Environment Variables

#### Required Environment Variables

Copy the template and add your credentials:

```bash
# Copy the template file
cp .env.template .env.local

# Edit with your actual credentials
nano .env.local
```

**Minimum Required Configuration:**
```env
# Required - Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here

# Optional - Auto-Deployment Notifications
VITE_WEBHOOK_WEBSOCKET_URL=ws://localhost:9001
```

#### Environment Template
<details>
<summary>Click to expand full environment template</summary>

```env
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
# OPTIONAL - Auto-Deployment Notifications
# ==========================================
# WebSocket URL for real-time deployment notifications
# Development: ws://localhost:9001
# Production: ws://69.62.71.229:9001
VITE_WEBHOOK_WEBSOCKET_URL=ws://localhost:9001

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
```
</details>

### Step 5: Start Development Server

```bash
# Start the development server
npm run dev
```

**✅ Success! You should see:**
```
  VITE v7.0.6  ready in 247 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 🐳 Docker Deployment

### Quick Start (Copy & Paste)

**Step 1: Download and Setup**
```bash
# Clone the repository
git clone https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT.git
cd J.A.R.V.I.S-PROJECT

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

**Step 3: Deploy with Docker Compose**
```bash
# Copy .env.local to .env for Docker Compose
cp .env.local .env

# Build and start with automatic optimizations
docker-compose up -d --build

# All optimizations are applied automatically:
# ✅ Code splitting and lazy loading
# ✅ Bundle size optimization
# ✅ Manual chunk splitting
# ✅ Production build settings

# Check deployment status
docker-compose ps
docker-compose logs jarvis-chat
```

### Production Docker Commands

**Start Services**
```bash
docker-compose up -d
```

**Stop Services**
```bash
docker-compose down
```

**Update Application**
```bash
git pull origin main
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

---

## 🚀 Production Deployment

### VPS Webhook Server Setup

For auto-deployment notifications, you need to set up the webhook server on your VPS:

```bash
# On your VPS (69.62.71.229)
git clone https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT.git
cd J.A.R.V.I.S-PROJECT

# Install webhook dependencies
npm install express ws

# Setup systemd service (uses vps-webhook-server.cjs for CommonJS compatibility)
sudo cp scripts/jarvis-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable jarvis-webhook
sudo systemctl start jarvis-webhook

# Verify webhook service is running
sudo systemctl status jarvis-webhook

# Deploy with automatic optimizations
cp .env.template .env
nano .env  # Add your credentials
docker-compose -f docker-compose.prod.yml up -d --build

# All optimizations applied automatically:
# ✅ Bundle size reduced from 643KB to ~300KB
# ✅ Code splitting for faster loading
# ✅ Production build optimizations
```

### GitHub Repository Secrets

Add these secrets to your GitHub repository settings:

```
VPS_WEBHOOK_SECRET=your-secure-random-secret-here
VPS_WEBHOOK_URL=http://69.62.71.229:9000
GITHUB_TOKEN=your-github-personal-access-token
```

### Environment Variables for Production

```env
# Production WebSocket URL
VITE_WEBHOOK_WEBSOCKET_URL=ws://69.62.71.229:9001

# Development WebSocket URL (for testing)
VITE_WEBHOOK_WEBSOCKET_URL=ws://localhost:9001
```

---

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run preview` - Preview production build locally

### Testing & Quality
- `npm run test` - Run test suite in watch mode
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:ui` - Run tests with UI interface
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint code analysis
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Production
- `npm run build` - Build optimized production bundle

---

## 🏗️ Project Structure

```
J.A.R.V.I.S-PROJECT/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── chat/           # Chat-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components
│   │   └── accessibility/  # Accessibility components and controls
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles with custom theme
├── public/                 # Static assets
│   ├── api-docs.html       # Interactive Swagger UI documentation
│   └── api/                # API documentation
├── docs/                   # Documentation
├── scripts/                # Deployment & utility scripts
├── docker/                 # Docker-related files
└── package.json           # Project configuration
```

---

## ✨ Features

### 🎯 Core Features
- **Real-time Chat Interface** - WebSocket-based messaging with Supabase
- **AI Integration** - n8n webhook support with intelligent fallback responses
- **User Authentication** - Secure login/registration with Supabase Auth
- **Message Persistence** - Chat history stored and synchronized across sessions
- **Responsive Design** - Mobile-first UI with dark theme and neon accents
- **Auto-Deployment Notifications** - Real-time deployment status updates

### 🛡️ Production Ready
- **Health Monitoring** - Built-in health checks at `/health` endpoint
- **Error Tracking** - Comprehensive error capture and reporting system
- **Environment Validation** - Runtime configuration validation with status display
- **Type Safety** - Full TypeScript implementation with strict typing
- **Test Coverage** - Automated testing with Vitest and React Testing Library
- **API Documentation** - Complete OpenAPI 3.0 specification with interactive Swagger UI
- **Accessibility Testing** - Automated WCAG 2.1 AA compliance validation with axe-core

### ♿ Accessibility Features
- **WCAG 2.1 AA Compliance** - Full accessibility standard compliance
- **Screen Reader Support** - Comprehensive ARIA implementation and testing
- **Keyboard Navigation** - Complete keyboard-only interface navigation
- **Color Contrast Validation** - Mathematical compliance checking with user controls
- **Visual Accessibility Controls** - User preference system for high contrast, font size, and reduced motion

---

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

---

## 🔧 Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Error: "Unsupported engine" or "vite: not found"
node --version  # If this shows v18.x.x, you need to upgrade

# Fix: Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should now show v20.x.x
```

#### Vite Not Found Error
```bash
# Error: "sh: 1: vite: not found"
# This means you didn't run npm install properly

# Fix: Install dependencies locally (NOT globally)
rm -rf node_modules package-lock.json  # Clean install
npm install                            # This installs vite locally
npx vite --version                     # Should work now
npm run dev                            # Should work now
```

#### Missing Dependencies
```bash
# Error: "Cannot find package 'vite'"
# This means node_modules is corrupted or missing

# Fix: Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Docker Issues

#### Environment Variable Warnings (NORMAL)
```bash
WARNING: The VITE_APP_VERSION variable is not set. Defaulting to a blank string.
WARNING: The VITE_CDN_URL variable is not set. Defaulting to a blank string.
```
These warnings are normal for optional variables. Only fix if you need these features.

#### Required Environment Variables Fix
```bash
# Make sure both files exist
cp .env.local .env  # Docker Compose needs .env file
ls -la .env*        # Should show both .env and .env.local
```

---

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

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Support

For questions, issues, or contributions, please refer to the project documentation or contact the development team.

---

**JARVIS Chat** - Built with ❤️ for seamless AI conversations