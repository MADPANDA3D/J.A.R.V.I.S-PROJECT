# Core Features & MVP Scope

## Core Features
- Branded, animated chat UI (text, images, video, audio, files)
- Live voice call with agent (TTS/STT, sound effects, and voice reactions)
- Persistent chat history (Supabase, with search and local cache)
- Tasks/Projects: context-aware chat spaces, each with file storage (like Claude projects/artifacts)
- Micro automations: favorite prompts, cloud-scheduled and trigger-based actions (run even offline)
- Note-taker mode: continuous listening with summarized output
- Augmented calls: visual aids and live notes
- End-to-end encryption: for all chat, files, and calls (milestone for true E2E)
- Offline banner & reconnect logic: tells user when they're offline, allows search/local access, auto-reconnect + banner when back
- Installable as a PWA: full "add to home screen" experience, cross-platform

## MVP Scope
- Single-user, single-agent (multi-user optional in future)
- Core messaging and media support (text, images, audio, video, files)
- Live call with note-taking and SFX
- Offline detection, banners, local cache
- PWA support for installability/offline
- Automation/favorites (core scheduling, no advanced triggers at MVP)