# GitHub Copilot Instructions - JARVIS Chat Project

## 🎯 Project Overview
JARVIS Chat is a React PWA that communicates with n8n backend workflows via webhooks. The frontend is built with React 19, TypeScript, Vite, and shadcn/ui, while the backend orchestration happens entirely in n8n with Supabase for persistence.

## 🏗️ Architecture Patterns

### 3-Tier Architecture
- **Frontend**: React PWA (`jarvis-chat/`) - handles UI, authentication, real-time chat
- **Backend**: n8n workflows (`docs/n8n_workflows/`) - business logic, external API integration  
- **Database**: Supabase - auth, chat storage, real-time subscriptions

### Key Integration Points
- **Webhook Service**: `src/lib/webhookService.ts` - robust n8n communication with retry logic and circuit breaker
- **Chat Service**: `src/lib/chatService.ts` - message handling and real-time updates
- **Supabase Client**: `src/lib/supabase.ts` - auth and data persistence

## 🛠️ Development Workflows

### Essential Commands
```bash
# Development (requires Node.js 20.19.0+)
npm install && npm run dev                    # Start dev server on :5173
npm run build && npm run preview             # Test production build

# Quality Assurance  
npm run lint && npm run type-check           # Code quality checks
npm test                                     # Run test suite

# Docker Development
docker-compose up --build                    # Local containerized environment
```

### VPS Deployment
- **Webhook Server**: `scripts/vps-webhook-server.cjs` handles GitHub Actions deployment
- **Service Management**: `sudo systemctl {status|restart} jarvis-webhook`
- **CI/CD**: Triggered by pushes to `main` branch via GitHub Actions

## 📁 Project-Specific Conventions

### File Structure
```
jarvis-chat/src/
├── components/          # Shared UI components
│   ├── auth/           # Authentication forms & flows
│   ├── chat/           # Chat interface components  
│   └── ui/             # shadcn/ui base components
├── lib/                # Core services & utilities
├── hooks/              # Reusable React hooks
├── pages/              # Route-level components
└── types/              # TypeScript definitions
```

### Import Patterns
- Use path aliases: `@/components`, `@/lib`, `@/hooks`, `@/pages`, `@/types`
- Components import from `@/components/ui` for shadcn components
- Services live in `@/lib` and are imported by name

### Component Patterns
- **shadcn/ui**: All UI components follow shadcn patterns with Radix primitives
- **Forms**: Use `react-hook-form` + `zod` validation + `@hookform/resolvers`
- **State**: React Query for server state, local state for UI-only concerns

## 🎨 Styling & Theme

### Brand Colors
- **Primary**: Crimson red (`#DC143C`) for accents and CTAs
- **Theme**: Dark mode with custom shadcn/ui configuration
- **Layout**: Tailwind CSS utility classes with responsive design

### Component Styling
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui component patterns for consistency
- Custom components extend base UI components when possible

## 🔌 Integration Specifics

### n8n Webhook Communication
- **Payload Structure**: See `WebhookPayload` interface in `webhookService.ts`
- **Error Handling**: Built-in retry logic with exponential backoff
- **Circuit Breaker**: Protects against n8n service failures
- **Monitoring**: Request/response metrics and health tracking

### Supabase Integration
- **Auth**: JWT-based with automatic session refresh
- **Real-time**: Use for chat message updates and presence
- **RLS**: Row Level Security enforced on all tables
- **Environment**: Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### PWA Features
- **Service Worker**: `src/sw.ts` handles caching and offline functionality
- **Manifest**: `public/manifest.json` defines app installation behavior
- **Icons**: Multiple sizes in `public/icons/` for all platforms

## 🧪 Testing Strategy

### Test Structure
- **Unit Tests**: Vitest with React Testing Library
- **Component Tests**: Focus on user interactions and state changes
- **Integration Tests**: Mock Supabase and webhook services
- **E2E Tests**: Webhook integration scripts in `scripts/__tests__/`

### Test Utilities
- Use `@testing-library/react` for component testing
- Mock `@supabase/supabase-js` for database operations
- Use `msw` or similar for API mocking when needed

## 🚨 Common Pitfalls

### Environment Setup
- **Node.js Version**: Must be 20.19.0+ (not 18.x) - causes build failures
- **Environment Variables**: Copy `.env.template` to `.env.local` with real values
- **Package Lock**: May need `rm -rf node_modules package-lock.json && npm install` for lockfile issues

### Development Issues
- **Import Errors**: Missing exports in type files - check `src/types/auth.ts` exports
- **Webhook Failures**: Verify n8n endpoint availability and secret configuration
- **Build Warnings**: TypeScript strict mode enabled - all types must be properly defined

### Production Deployment
- **Docker**: Use `docker-compose.prod.yml` for production builds
- **VPS Setup**: Webhook server must be running and accessible on port 9000
- **Environment**: All production environment variables must be set in docker-compose

## 📚 Key Documentation
- **Architecture**: `docs/architecture.md` - system overview and data flows
- **API Integration**: `docs/api-integration-guide.md` - external service setup
- **Stories**: `docs/stories/` - detailed feature specifications with acceptance criteria
- **Deployment**: `scripts/VPS-WEBHOOK-DEPLOYMENT-GUIDE.md` - production setup guide
