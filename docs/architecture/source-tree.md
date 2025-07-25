# Source Tree Structure

## Project Root
```
BMAD_APP_1/
├── docs/                           # Project documentation
│   ├── architecture/               # Architecture documentation
│   │   ├── coding-standards.md     # Development standards
│   │   ├── tech-stack.md          # Technology choices
│   │   └── source-tree.md         # This file
│   ├── prd/                       # Product Requirements (sharded)
│   ├── stories/                   # User stories and tasks
│   └── *.md                       # Various project docs
├── jarvis-chat/                   # Main application directory
└── .bmad-core/                    # BMad system configuration
    └── core-config.yaml           # Core project settings
```

## Application Structure (`jarvis-chat/`)

### Core Configuration
```
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript project references
├── tsconfig.app.json             # App-specific TS config
├── tsconfig.node.json            # Node-specific TS config
├── vite.config.ts                # Build configuration
├── vitest.config.ts              # Test configuration
├── eslint.config.js              # Linting rules
├── tailwind.config.js            # Styling configuration
├── postcss.config.js             # CSS processing
└── components.json               # shadcn/ui configuration
```

### Source Code (`src/`)
```
src/
├── main.tsx                      # Application entry point
├── App.tsx                       # Root React component
├── App.css                       # Global styles
├── index.css                     # Tailwind imports
├── sw.ts                         # Service worker
├── vite-env.d.ts                # Vite type definitions
│
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── AuthLayout.tsx
│   │   ├── LoginForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RegisterForm.tsx
│   │   └── __tests__/
│   │
│   ├── chat/                     # Chat functionality
│   │   ├── ChatLayout.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageSearch.tsx
│   │   ├── ToolsSelector.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── __tests__/
│   │
│   ├── layout/                   # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── navigation/               # Navigation components
│   │   └── NavItem.tsx
│   │
│   ├── pwa/                      # PWA-specific components
│   │   ├── InstallPrompt.tsx
│   │   ├── PWAStatus.tsx
│   │   └── __tests__/
│   │
│   ├── accessibility/            # Accessibility features
│   │   ├── AccessibilityTestPanel.tsx
│   │   └── VisualAccessibilityControls.tsx
│   │
│   ├── error/                    # Error handling components
│   │   ├── ErrorBoundary.tsx
│   │   └── ErrorFallback.tsx
│   │
│   ├── ui/                       # Reusable UI components
│   │   ├── LoadingSkeleton.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── input.tsx
│   │
│   └── UpdateNotification.tsx    # Update notifications
│
├── pages/                        # Page components
│   ├── ChatPage.tsx
│   ├── Dashboard.tsx
│   ├── HealthPage.tsx
│   ├── NotFound.tsx
│   ├── SettingsPage.tsx
│   ├── TasksPage.tsx
│   └── auth/
│       └── LoginPage.tsx
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx
│
├── hooks/                        # Custom React hooks
│   ├── useChat.ts
│   ├── usePWAInstall.ts
│   ├── useTools.ts
│   └── __tests__/
│
├── lib/                          # Utility libraries and services
│   ├── supabase.ts              # Database client
│   ├── chatService.ts           # Chat functionality
│   ├── webhookService.ts        # Webhook integration
│   ├── utils.ts                 # General utilities
│   ├── monitoring.ts            # Application monitoring
│   ├── healthCheck.ts           # Health check utilities
│   ├── errorTracking.ts         # Error handling
│   ├── accessibility.ts         # Accessibility utilities
│   ├── env-validation.ts        # Environment validation
│   ├── secrets-management.ts    # Secret handling
│   └── __tests__/               # Service tests
│
├── types/                        # TypeScript type definitions
│   ├── auth.ts
│   └── tools.ts
│
├── assets/                       # Static assets
│   └── react.svg
│
└── test/                         # Test configuration
    └── setup.ts
```

### Public Assets (`public/`)
```
public/
├── index.html                    # HTML template
├── manifest.json                 # PWA manifest
├── vite.svg                     # Default Vite icon
├── api-docs.html                # API documentation
├── api/
│   └── openapi.yaml             # OpenAPI specification
└── icons/                       # PWA icons
    ├── icon-*.png               # Various sizes
    └── icon.svg                 # Vector icon
```

### Infrastructure & Deployment
```
├── Dockerfile                    # Production container
├── Dockerfile.dev               # Development container
├── docker-compose.yml           # Local development
├── docker-compose.prod.yml      # Production deployment
├── docker-compose.staging.yml   # Staging deployment
├── nginx.conf                   # Reverse proxy config
│
├── scripts/                     # Deployment & utility scripts
│   ├── deploy-production.sh
│   ├── deploy-staging.sh
│   ├── rollback.sh
│   ├── security-scan.sh
│   ├── smoke-tests.sh
│   └── validate-configuration.js
│
└── supabase/                    # Database migrations
    └── migrations/
        ├── 001_create_messages_table.sql
        └── 002_create_tools_usage_table.sql
```

## Key Conventions

### Component Organization
- **Feature-based folders**: Group related components together
- **Tests alongside code**: `__tests__/` directories next to components
- **Index files**: Use sparingly, only when needed for clean exports

### File Naming
- **Components**: PascalCase (e.g., `MessageBubble.tsx`)
- **Utilities**: camelCase (e.g., `chatService.ts`)
- **Types**: camelCase with `.ts` extension
- **Tests**: `ComponentName.test.tsx`

### Import Paths
- **Absolute imports**: Use `@/` alias for `src/` directory
- **Relative imports**: Only for closely related files
- **Index exports**: Avoid unless truly beneficial for API

### Directory Guidelines
- **Single responsibility**: Each directory has a clear purpose
- **Shallow nesting**: Avoid deep folder structures
- **Consistent naming**: Use kebab-case for multi-word directories
- **Co-location**: Keep related files close together

## Build Artifacts
```
├── dist/                        # Production build output
├── node_modules/                # Dependencies (excluded from git)
└── .husky/                      # Git hooks configuration
```

## Configuration Files Location
- **Root level**: Build tools (Vite, TypeScript, ESLint)
- **Package.json**: Scripts and dependency management
- **Environment**: `.env` files (not committed)

This structure supports:
- ✅ Clean separation of concerns
- ✅ Scalable component organization  
- ✅ Efficient testing strategy
- ✅ Clear development workflow
- ✅ Production deployment readiness