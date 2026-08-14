---
type: development-deployment
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - development
  - deployment
---

# Deployment

## Summary
Placeholder for production deployment approach.

## Backend (confirmed from code)
- Server enforces HTTPS in production using `x-forwarded-proto` in `skill_swap/backend/src/server.ts`
- Helmet CSP/connect-src lists localhost dev ports (needs review for production domains)

## TODO
- Confirm:
  - Hosting provider (e.g., Render/VPS/Fly.io)
  - How environment variables are injected:
    - `DATABASE_URL`, `JWT_SECRET`, Firebase credentials
  - Build/deploy steps for:
    - frontend (Vite)
    - backend (tsc + dist/server.js)
- Document WebSocket behavior/scale concerns for Socket.IO in production.
