# Major Components

## React Frontend (PWA)
- Branded chat UI (shadcn, your palette)
- Media handlers (upload, preview, playback for audio/video/images/files)
- Voice call UI (WebRTC/Audio API)
- Service Worker for offline mode, caching, and push notifications
- IndexedDB/localStorage for local message/media cache
- Installable manifest, custom splash, icon
- Secure auth (Supabase client SDK)
- Message queue (for offline/unsent state)
- "Tasks"/projects UX with artifact file storage per task
- Automations UI (favorite, schedule, trigger prompts)
- Encryption handling (front-end encryption, milestone for full E2E)

## n8n Backend
- Webhook endpoints for all frontend operations
- Business logic for all chat, call, and automation flows
- Media ingestion, transcoding, file pointer generation
- TTS/STT pipeline for voice
- SFX handling (triggers, returns asset URLs/IDs)
- Automation runners (scheduled or triggered)
- User auth/identity sync with Supabase
- Handles E2E encryption when enabled (decrypt/encrypt flows)

## Supabase
- Users, sessions, device registration
- Chats, messages, media (schema for text/media/call events)
- Tasks/projects: context, artifact file storage (buckets)
- Automations: scheduled prompts, triggers
- Real-time listeners for chat updates
- Storage cost controls (media expiry, CDN/archival for large files)

## TTS/STT APIs
- STT: User audio → text (n8n handles webhook integration)
- TTS: Agent responses → voice (for live/audio chat)

## SFX/CDN
- Library of agent-usable sound effects, referenced by URL or ID in messages/events