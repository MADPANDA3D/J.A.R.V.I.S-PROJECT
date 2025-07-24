# Integration Points

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