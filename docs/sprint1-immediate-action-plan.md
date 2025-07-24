# Sprint 1: Immediate Action Plan - Week 1

**Sprint Goal:** Establish foundation with working text chat and authentication  
**Duration:** 5 days (full-time development)  
**Target:** MVP text chat deployed to jarvis.madpanda3d.com  

## 🎯 Sprint 1 Stories (Prioritized)

### Day 1-2: Foundation Setup
**JARVIS-001: Development Environment Setup** (3 points)
- ✅ Initialize React + TypeScript + Vite project with Yarn
- ✅ Configure shadcn/ui with dark theme + black/white/crimson/neon palette
- ✅ Set up ESLint, Prettier, Husky pre-commit hooks
- ✅ Configure Docker containers for deployment
- ✅ Set up absolute imports and path aliases

### Day 2-3: Authentication & Infrastructure  
**JARVIS-002: Supabase Integration and Authentication** (5 points)
- ✅ Create fresh Supabase project with clean schema
- ✅ Configure authentication (email/password, Google OAuth)
- ✅ Set up Row Level Security (RLS) policies
- ✅ Implement React Context for auth state management
- ✅ Create login/register forms with shadcn components

### Day 3-4: Application Structure
**JARVIS-003: Basic React Application Structure** (3 points)
- ✅ Set up React Router v6 with protected routes
- ✅ Create main layout (header, sidebar, chat area)
- ✅ Implement responsive design (mobile + desktop)
- ✅ Add loading states and error boundaries
- ✅ Apply brand colors and dark theme throughout

### Day 4-5: Core Chat Functionality
**JARVIS-004: Basic Chat UI Implementation** (8 points)
- ✅ Build message list with virtual scrolling
- ✅ Create message input with send functionality
- ✅ Style user vs agent message bubbles
- ✅ Add timestamps and message status indicators
- ✅ Implement auto-scroll to newest messages

**JARVIS-006: Complete Chat Functionality - Text Messages** (8 points)
- ✅ Connect to your existing n8n webhook endpoints
- ✅ Send/receive text messages through n8n
- ✅ Store messages in Supabase with proper schema
- ✅ Add optimistic updates with React Query
- ✅ Implement error handling and retry logic

## 🛠️ Technical Configuration

### Project Structure
```
jarvis-chat/
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── chat/
│   │   ├── auth/
│   │   └── layout/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── types/
├── docker/
├── docs/
└── public/
```

### Environment Variables Needed
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
VITE_APP_DOMAIN=jarvis.madpanda3d.com
```

### Key Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "shadcn/ui": "latest",
    "tailwindcss": "^3.3.0"
  }
}
```

## 🎨 Brand Implementation

### Color Palette (Tailwind Config)
```js
theme: {
  extend: {
    colors: {
      primary: '#DC143C', // Crimson Red
      background: '#000000', // Pure Black
      foreground: '#FFFFFF', // Pure White
      accent: {
        cyan: '#00FFFF',
        green: '#00FF00',
        purple: '#8A2BE2',
        yellow: '#FFFF00'
      }
    }
  }
}
```

### Design System
- **Dark theme with glowing neon accents**
- **Smooth animations and transitions**
- **Minimalist, high-tech aesthetic**
- **Mobile-first responsive design**

## 🔌 n8n Integration Points

### Required Webhook Endpoints
1. **Send Message:** `POST /webhook/chat/send`
2. **Receive Message:** WebSocket or polling for responses
3. **User Authentication:** Sync with Supabase auth

### Payload Structure (Standardized)
```json
{
  "user_id": "uuid",
  "message": "text content",
  "timestamp": "ISO string",
  "message_type": "text",
  "session_id": "uuid"
}
```

## 📊 Sprint 1 Success Criteria

### Must Have (MVP)
- [ ] User can register and login
- [ ] Text messages send to n8n successfully  
- [ ] AI responses display in chat interface
- [ ] Messages persist in Supabase
- [ ] Responsive design works on mobile/desktop
- [ ] Docker deployment to Hostinger VPS works

### Nice to Have
- [ ] Message search functionality
- [ ] Typing indicators
- [ ] Message delivery status
- [ ] Basic error handling with user feedback

## 🚀 Deployment Plan

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "preview"]
```

### Hostinger VPS Deployment
1. Set up Docker on VPS
2. Configure nginx reverse proxy
3. Set up SSL certificate for jarvis.madpanda3d.com
4. Deploy container with environment variables
5. Configure automatic deployments

## 📋 Daily Checklist

### Day 1: Setup & Config
- [ ] Project initialized with Vite + React + TypeScript
- [ ] Yarn dependencies installed
- [ ] shadcn/ui configured with custom theme
- [ ] Git repository set up with proper .gitignore
- [ ] Docker configuration tested locally

### Day 2: Authentication  
- [ ] Supabase project created and configured
- [ ] Authentication components built and styled
- [ ] Protected routes working
- [ ] User state management implemented
- [ ] Login/logout flow tested

### Day 3: App Structure
- [ ] Main layout components created
- [ ] Routing configured and tested
- [ ] Responsive design verified
- [ ] Error boundaries implemented
- [ ] Loading states added

### Day 4: Chat Interface
- [ ] Message list component built
- [ ] Message input component created
- [ ] Message bubbles styled correctly
- [ ] Auto-scroll functionality working
- [ ] Basic chat flow operational

### Day 5: n8n Integration & Deployment
- [ ] n8n webhook integration complete
- [ ] Messages sending/receiving successfully
- [ ] Supabase storage working
- [ ] Error handling implemented
- [ ] Deployed to jarvis.madpanda3d.com

## 🆘 Potential Blockers & Solutions

### Technical Risks
- **n8n Webhook Issues:** Test endpoints early, have backup polling method
- **Supabase Schema:** Keep initial schema simple, iterate later
- **Docker Deployment:** Test locally first, prepare VPS environment

### Mitigation Strategies
- **Daily builds:** Deploy to staging daily for early issue detection
- **Incremental testing:** Test each component as it's built
- **Backup plans:** Have fallback options for critical integrations

## 📞 Support & Resources

### Documentation References
- [shadcn/ui docs](https://ui.shadcn.com/)
- [Supabase React docs](https://supabase.com/docs/guides/with-react)
- [React Query docs](https://tanstack.com/query/latest)
- [n8n webhook docs](https://docs.n8n.io/webhooks/)

### Testing Strategy
- Manual testing after each feature
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile testing on real devices
- n8n webhook testing with Postman/curl

---

**Ready to start development?** Let me know if you want me to help with any specific aspect of Sprint 1, such as:
- Creating the initial project structure
- Setting up the Supabase schema
- Configuring the Docker deployment
- Or diving into any specific story implementation!