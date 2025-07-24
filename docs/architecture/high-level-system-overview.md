# High-Level System Overview

This architecture describes a modern, branded Progressive Web App (PWA) chat platform for accessing an n8n-based AI agent. The system is composed of a React frontend (with shadcn), a backend orchestrated entirely in n8n, and Supabase for user, message, file, and automation storage. All communication between frontend and backend occurs via secure webhook/API endpoints.