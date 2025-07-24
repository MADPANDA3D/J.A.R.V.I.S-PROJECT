# Developer Handoff: Story 001.005 - Initial PWA Configuration

**Date**: January 24, 2025  
**Scrum Master**: Bob  
**Story File**: `docs/stories/001.005.initial-pwa-configuration.md`  
**Priority**: High  
**Estimated Complexity**: Medium (5 story points from original epic)

## 🎯 What You're Building

Transform the existing JARVIS Chat application into a **Progressive Web App (PWA)** that users can install on their devices like a native app. This creates an app-like experience without browser UI clutter.

### User Story
*"As a user, I want to install the chat application on my device like a native app, so that I can access it quickly without opening a browser and have an app-like experience."*

## 📁 Project Context

- **Working Directory**: `jarvis-chat/` (main React app)
- **Current Status**: Stories 001.001-001.004 completed, 001.006 approved but 001.005 missing
- **Architecture**: React + TypeScript + Vite + Supabase + shadcn/ui
- **Deployment**: Docker-ready with existing CI/CD pipeline

## ✅ Success Criteria (9 Acceptance Criteria)

You'll know you're done when:

1. ✅ PWA manifest.json configured with complete app metadata
2. ✅ Custom app icons for all required sizes and platforms  
3. ✅ Branded splash screen displays on app launch
4. ✅ Service worker implemented for PWA requirements
5. ✅ "Add to Home Screen" prompt appears at appropriate times
6. ✅ App installs successfully on mobile AND desktop
7. ✅ Installed app opens in standalone mode (no browser UI)
8. ✅ App name and icon display correctly after installation
9. ✅ Uninstall process works correctly

## 🔧 Technical Implementation Overview

### Core Files to Create/Modify

```
jarvis-chat/
├── public/
│   ├── manifest.json (NEW - PWA configuration)
│   └── icons/ (NEW - All PWA icon sizes)
│       ├── icon-144x144.png
│       ├── icon-192x192.png
│       ├── icon-512x512.png
│       └── [additional sizes for iOS/Android]
├── src/
│   ├── sw.ts (NEW - Service Worker)
│   ├── hooks/
│   │   └── usePWAInstall.ts (NEW - Install prompt logic)
│   ├── components/pwa/ (NEW)
│   │   ├── InstallPrompt.tsx
│   │   └── PWAStatus.tsx
│   └── main.tsx (UPDATE - Register service worker)
└── vite.config.ts (UPDATE - PWA build config)
```

### Required Icon Sizes
Generate these exact sizes from the JARVIS brand assets:
- **144x144** (Android minimum)
- **192x192** (Android standard) 
- **512x512** (Android high-res + splash)
- **180x180** (iOS)
- **152x152** (iPad)
- **120x120** (iPhone)
- **76x76** (iPad legacy)

## 🚨 Critical Technical Details

### 1. PWA Manifest Requirements
```json
{
  "name": "JARVIS Chat",
  "short_name": "JARVIS", 
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#[use existing brand color]",
  "background_color": "#[use existing brand background]"
}
```

### 2. Service Worker Essentials
- Must handle `install`, `activate`, and `fetch` events
- Cache app shell (HTML/CSS/JS) for offline access
- Network-first for API calls, cache-first for static assets
- Handle service worker updates gracefully

### 3. Install Prompt Strategy
- Listen for `beforeinstallprompt` event
- Show install UI after user engagement (not immediately)
- Respect user dismissal during session
- Handle different browser behaviors (Chrome vs Safari vs Firefox)

## 🔗 Integration Points

### Dependencies on Previous Stories
- **001.001**: Uses existing Vite + TypeScript + shadcn/ui setup
- **001.002**: Integrates with Supabase auth context
- **001.003**: Works with AppLayout and routing system  
- **001.004**: Enhances chat UI with native app experience

### Brand Integration
- Extract theme colors from existing shadcn/ui configuration
- Use consistent branding across all PWA surfaces
- Match splash screen to app design system

## 🧪 Testing Requirements

### Must Pass Before Completion
1. **Lighthouse PWA Audit**: Score 90+ required
2. **Cross-Platform Installation**:
   - Android: Chrome, Samsung Browser
   - iOS: Safari, Chrome  
   - Desktop: Chrome, Edge, Firefox
3. **Standalone Mode**: All features work without browser UI
4. **Icon Display**: Correct branding in home screen/app drawer

### Test Files to Create
```
src/hooks/__tests__/usePWAInstall.test.ts
src/components/pwa/__tests__/InstallPrompt.test.tsx
src/components/pwa/__tests__/PWAStatus.test.tsx
```

## ⚠️ Platform-Specific Gotchas

### iOS Safari Limitations
- Limited PWA support compared to Android
- Requires specific meta tags in `index.html`
- Install prompt behavior differs significantly

### Chrome/Android
- Full PWA support with native install prompts
- Best testing platform for development

### Desktop PWA
- Chrome and Edge have excellent support
- Firefox has basic support with limitations

## 🔒 Security & Performance Notes

- **HTTPS Required**: Service worker only works over HTTPS (localhost OK for dev)
- **Same Origin**: Service worker must be served from same origin
- **Performance**: Don't block app startup with SW registration
- **Caching**: Be strategic - cache essentials, not everything

## 📊 Validation Checklist

Before marking story complete, verify:

- [ ] PWA Lighthouse audit passes with 90+ score
- [ ] App installs on at least 3 different platforms
- [ ] All 9 acceptance criteria are demonstrably met
- [ ] Service worker registers without console errors
- [ ] Install prompt appears and functions correctly
- [ ] Standalone mode works for all app features
- [ ] Icons display correctly across all platforms
- [ ] Uninstall process works cleanly

## 🚀 Getting Started

1. **Review the complete story**: `docs/stories/001.005.initial-pwa-configuration.md`
2. **Check current app state**: Ensure Stories 001.001-001.004 are working
3. **Start with manifest.json**: This is your foundation
4. **Generate icons**: Use existing brand assets
5. **Implement service worker**: Keep it simple initially
6. **Test early and often**: PWA behavior varies by browser

## 📞 Questions or Blockers?

If you need clarification on:
- **Brand assets/colors**: Check existing shadcn/ui theme configuration
- **Architecture decisions**: Reference `docs/architecture/` folder
- **Previous story context**: See integration notes in story document
- **Testing approach**: Follow patterns from Stories 001.001-001.004

## 📈 Success Metrics

When done successfully:
- Users can install JARVIS Chat like a native app
- App launches quickly from home screen/desktop
- Experience feels native, not web-based
- Foundation set for future offline capabilities
- PWA audit passes all requirements

---

**Ready to ship a native-quality PWA experience!** 🎉

The story document contains comprehensive technical details, code examples, and architecture context. Focus on the acceptance criteria and don't over-engineer - this is about enabling installation and native app experience, not building complex offline functionality (that comes in future stories).