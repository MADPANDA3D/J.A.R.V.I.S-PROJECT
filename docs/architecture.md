# Architecture Document: AI Chat App (with PWA)

## 1. High-Level System Overview

This architecture describes a modern, branded Progressive Web App (PWA) chat platform for accessing an n8n-based AI agent. The system is composed of a React frontend (with shadcn), a backend orchestrated entirely in n8n, and Supabase for user, message, file, and automation storage. All communication between frontend and backend occurs via secure webhook/API endpoints.

## 2. Architecture Diagram (Textual)

**[React PWA Frontend]** <-> **[n8n API/Webhook Layer]** <-> **[Supabase (DB, Storage)]**

**Supporting services:**
- TTS/STT APIs for audio processing
- SFX CDN or asset server for sound effects

## 3. Major Components

### 3.1 React Frontend (PWA)
- Branded chat UI (shadcn, your palette)
- Media handlers (upload, preview, playback for audio/video/images/files)
- Voice call UI (WebRTC/Audio API)
- Service Worker for offline mode, caching, and push notifications
- IndexedDB/localStorage for local message/media cache
- Installable manifest, custom splash, icon
- Secure auth (Supabase client SDK)
- Message queue (for offline/unsent state)
- “Tasks”/projects UX with artifact file storage per task
- Automations UI (favorite, schedule, trigger prompts)
- Encryption handling (front-end encryption, milestone for full E2E)

### 3.2 n8n Backend
- Webhook endpoints for all frontend operations
- Business logic for all chat, call, and automation flows
- Media ingestion, transcoding, file pointer generation
- TTS/STT pipeline for voice
- SFX handling (triggers, returns asset URLs/IDs)
- Automation runners (scheduled or triggered)
- User auth/identity sync with Supabase
- Handles E2E encryption when enabled (decrypt/encrypt flows)

### 3.3 Supabase
- Users, sessions, device registration
- Chats, messages, media (schema for text/media/call events)
- Tasks/projects: context, artifact file storage (buckets)
- Automations: scheduled prompts, triggers
- Real-time listeners for chat updates
- Storage cost controls (media expiry, CDN/archival for large files)

### 3.4 TTS/STT APIs
- STT: User audio → text (n8n handles webhook integration)
- TTS: Agent responses → voice (for live/audio chat)

### 3.5 SFX/CDN
- Library of agent-usable sound effects, referenced by URL or ID in messages/events

## 4. Data Flows

### 4.1 Chat Message
1. User sends message (text/media/call) via React UI
2. Frontend queues message locally, POSTs to n8n webhook
3. n8n validates/processes message, updates Supabase (chat/message row, file storage if needed)
4. Supabase triggers real-time update to frontend; message is shown in UI
5. For media, signed URLs/preview returned for playback

### 4.2 Voice Call
1. User initiates call (WebRTC/Audio API), signals via webhook
2. n8n opens voice channel, coordinates with TTS/STT API
3. All audio events routed via n8n; real-time transcript/notes optionally returned to frontend
4. SFX and agent responses mixed in, returned to frontend for playback

### 4.3 Automations
1. User favorites/schedules a prompt in frontend
2. Details sent to Supabase; n8n subscribes to automation table
3. At schedule/trigger, n8n executes workflow, delivers results via webhook/chat message

### 4.4 Offline/Sync
1. Service worker tracks connection
2. Messages composed offline are queued
3. On reconnect, unsent messages are sent, updates fetched
4. UI displays status banners as state changes

## 5. Security & Privacy
- TLS for all network traffic
- Supabase database encryption at rest
- Authentication via Supabase JWT/session
- E2E encryption for messages/media (milestone)
- File validation/sanitization for uploads
- SFX/media served via secure, signed URLs
- Role-based access for all tables/buckets

## 6. Scalability/Extensibility
- Multi-user, multi-agent support (schema ready, phased release)
- CDN for large/archival media
- Pluggable SFX/voice models
- Easily add new automations, tasks, chat types (threaded, group, etc.)

## 7. Monitoring & Logging
- Supabase: Usage, error, and connection logs
- n8n: Workflow monitoring, failures, retries
- Frontend: Error boundaries, logging (with opt-in user analytics)

## 8. Milestones
- v1: Core chat, PWA, calls, media, offline
- v2: Tasks/projects, advanced automations, SFX, note-taker
- v3: E2E encryption, multi-user, settings, push notifications, overlays

---

# End of Architecture Document

