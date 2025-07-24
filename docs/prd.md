# Product Requirements Document (PRD): AI Chat App (with PWA)

## 1. Overview & Goals

**Project Overview:**
Build a fully branded, multi-platform AI chat application—offering an experience comparable to ChatGPT, but personalized for your business and workflow. The app is installable as a Progressive Web App (PWA), supports all media types, and communicates in real time with a powerful n8n-powered backend agent (“Jarvis”). All chat data is securely stored and synced with Supabase, enabling seamless conversation, automations, and voice interactions from any device.

**Goals:**
- Deliver a modern, installable, offline-capable chat UI that’s always accessible
- Seamless integration with n8n backend for multimodal, automated agent interactions
- Persistent, searchable, and encrypted chat history
- Empower advanced features: voice calling, live note-taking, micro-automations, and project/task management
- Maintain strict brand consistency with high-quality UI/UX and engaging animation

---

## 2. Core Features & MVP Scope

### 2.1 Core Features
- Branded, animated chat UI (text, images, video, audio, files)
- Live voice call with agent (TTS/STT, sound effects, and voice reactions)
- Persistent chat history (Supabase, with search and local cache)
- Tasks/Projects: context-aware chat spaces, each with file storage (like Claude projects/artifacts)
- Micro automations: favorite prompts, cloud-scheduled and trigger-based actions (run even offline)
- Note-taker mode: continuous listening with summarized output
- Augmented calls: visual aids and live notes
- End-to-end encryption: for all chat, files, and calls (milestone for true E2E)
- Offline banner & reconnect logic: tells user when they’re offline, allows search/local access, auto-reconnect + banner when back
- Installable as a PWA: full “add to home screen” experience, cross-platform

### 2.2 MVP Scope
- Single-user, single-agent (multi-user optional in future)
- Core messaging and media support (text, images, audio, video, files)
- Live call with note-taking and SFX
- Offline detection, banners, local cache
- PWA support for installability/offline
- Automation/favorites (core scheduling, no advanced triggers at MVP)

---

## 3. User Stories / User Flows

- As a user, I can send/receive text, images, video, audio, and files in a chat UI.
- As a user, I can start a voice call with the agent, and the agent can play sound effects or react with voice.
- As a user, I can install the app on my device (mobile/desktop) and use it offline.
- As a user, I see a clear banner if I’m offline, and can search/browse my previous chats locally.
- As a user, I can start a new “Task”/project, upload files, and have chat context stored and linked for each task.
- As a user, I can favorite prompts and set them to run automatically on a schedule.
- As a user, I know my conversations and files are encrypted and private.

---

## 4. Non-Functional Requirements

- **Performance:** Must be highly responsive on both mobile and desktop (target <100ms message send time under normal conditions)
- **Security:** TLS everywhere, database encryption at rest, milestone: E2E encryption for messages/media
- **Branding:** Custom theme, logo, splash, color palette, and animation
- **Accessibility:** Meets WCAG 2.1 AA minimums (screen reader support, color contrast, keyboard navigation)
- **Scalability:** Support for growth to multi-user, multi-agent use
- **Reliability:** Automatic reconnect, safe offline queueing, local storage fallback
- **Updatability:** PWA auto-updates silently in background

---

## 5. Integration Points

- **Supabase:**
  - Auth (JWT, email, Google)
  - Real-time chat DB (messages, threads, tasks)
  - File storage (user files, agent artifacts)
  - Schema: users, chats, messages, media, tasks, automations

- **n8n:**
  - Webhook endpoints for all chat and media types
  - TTS/STT processing, call handling, SFX triggers
  - Automation triggers (scheduled or event-based)

- **PWA:**
  - manifest.json, service worker for offline/cache
  - Push notifications
  - Install banner, splash, custom icon

- **TTS/STT APIs:**
  - Speech-to-text for user and agent
  - Text-to-speech for agent responses

---

## 6. Risks & Assumptions

- **Risks:**
  - Media handling on mobile: variable device/browser support
  - Supabase/storage cost at scale
  - Audio call reliability on poor connections
  - E2E encryption complexity and rollout risk

- **Assumptions:**
  - n8n backend is robust and handles all critical business logic
  - Users are mostly on mobile but may use desktop
  - PWA features will be compatible with target devices

---

## 7. Milestones & Phases

- **Phase 1 (MVP):** Core chat, media, live call, PWA, basic automations
- **Phase 2:** Tasks/projects with file store, advanced automations, note-taker, branding polish
- **Phase 3:** E2E encryption, multi-user support, agent personality/voice selection, push notifications
- **Phase 4:** Settings, advanced analytics, system-wide overlay/shortcut, future integrations

---

## 8. Success Metrics

- Time to first message (post-login): <2s
- Media send success rate: >98%
- Voice call setup success rate: >95%
- User retention (30 days): 80%+
- PWA install rate (users): 60%+
- Bug-free push to production: <3 critical issues per release
- Accessibility score (Lighthouse): 90+

