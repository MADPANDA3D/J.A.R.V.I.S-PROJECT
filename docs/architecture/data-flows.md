# Data Flows

## Chat Message
1. User sends message (text/media/call) via React UI
2. Frontend queues message locally, POSTs to n8n webhook
3. n8n validates/processes message, updates Supabase (chat/message row, file storage if needed)
4. Supabase triggers real-time update to frontend; message is shown in UI
5. For media, signed URLs/preview returned for playback

## Voice Call
1. User initiates call (WebRTC/Audio API), signals via webhook
2. n8n opens voice channel, coordinates with TTS/STT API
3. All audio events routed via n8n; real-time transcript/notes optionally returned to frontend
4. SFX and agent responses mixed in, returned to frontend for playback

## Automations
1. User favorites/schedules a prompt in frontend
2. Details sent to Supabase; n8n subscribes to automation table
3. At schedule/trigger, n8n executes workflow, delivers results via webhook/chat message

## Offline/Sync
1. Service worker tracks connection
2. Messages composed offline are queued
3. On reconnect, unsent messages are sent, updates fetched
4. UI displays status banners as state changes