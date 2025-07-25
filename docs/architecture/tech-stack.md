# Tech Stack

## Frontend Framework
- **React 19.1.0** - Latest React with modern features
- **TypeScript 5.8.3** - Strict typing for better code quality
- **Vite 7.0.4** - Fast build tool and dev server

## UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-slot`
- **Lucide React 0.525.0** - Modern icon library
- **class-variance-authority** - Type-safe component variants
- **clsx + tailwind-merge** - Conditional class utilities

## State Management & Data Fetching
- **React Query (@tanstack/react-query 5.83.0)** - Server state management
- **React Hook Form 7.61.0** - Form state management
- **Zod 4.0.8** - Schema validation
- **@hookform/resolvers** - Form validation integration

## Routing & Navigation
- **React Router DOM 7.7.0** - Client-side routing

## Backend & Database
- **Supabase (@supabase/supabase-js 2.52.1)** - Backend-as-a-Service
  - Authentication
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)

## Testing
- **Vitest 3.2.4** - Fast unit test runner (Vite-native)
- **React Testing Library 16.3.0** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom 26.1.0** - DOM environment for testing

## Code Quality & Development
- **ESLint 9.30.1** - Linting with modern flat config
  - `@eslint/js` - Core ESLint rules
  - `typescript-eslint` - TypeScript-specific rules
  - `eslint-plugin-react-hooks` - React Hooks rules
  - `eslint-plugin-react-refresh` - HMR compatibility
- **Prettier 3.6.2** - Code formatting
- **Husky 9.1.7** - Git hooks for quality gates

## Build & Deployment
- **Docker** - Containerization
  - `Dockerfile` - Production builds
  - `Dockerfile.dev` - Development environment
  - `docker-compose.yml` - Local development
  - `docker-compose.prod.yml` - Production deployment
- **nginx.conf** - Reverse proxy configuration
- **GitHub Actions** - CI/CD pipeline (workflows in progress)

## PWA (Progressive Web App)
- **Vite PWA Plugin** - Service worker generation
- **Web App Manifest** - PWA configuration
- **Service Worker** - Offline functionality and caching

## Integration & Webhooks
- **n8n Integration** - Workflow automation platform
- **Custom Webhook Services** - Event-driven architecture
- **OpenAPI/Swagger** - API documentation

## Environment & Configuration
- **Environment Variables** - Configuration management
- **Path Aliases** - `@/` alias for clean imports
- **PostCSS + Autoprefixer** - CSS processing

## Monitoring & Logging
- **Custom Health Monitoring** - Application health checks
- **Error Tracking** - Structured error logging
- **Webhook Monitoring** - Integration health tracking

## Development Tools
- **Yarn 1.22.22** - Package manager
- **Globals** - Global type definitions
- **Components.json** - shadcn/ui configuration

## Future Considerations
- **Sentry** - Production error tracking
- **Analytics** - User behavior tracking
- **CDN** - Asset delivery optimization
- **Redis** - Caching layer (if needed)
- **WebSocket** - Real-time features beyond Supabase

## Version Compatibility
- **Node.js**: >= 18.0.0 (recommended)
- **npm**: >= 8.0.0 or Yarn >= 1.22.0
- **Browser Support**: Modern browsers (ES2020+)

## Package Manager Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Quality & Testing  
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript validation
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Test UI interface

# Formatting
npm run format       # Format code with Prettier
npm run format:check # Check formatting
```