---
type: development-debugging
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - development
  - debugging
---

# Debugging

## Summary
How to debug SkillSwap locally and during test runs (REST + WebSocket).

## Backend debugging (confirmed from code)
### Web server
- Run dev server: `npm run dev` (nodemon + tsx) from:
  - `skill_swap/backend`
- Start endpoint coverage:
  - `skill_swap/backend/src/server.ts` routes + error handlers

### WebSocket (Socket.IO)
- Socket initialization in:
  - `skill_swap/backend/src/socket.ts`
- Socket auth middleware expects:
  - `socket.handshake.auth.token` or `socket.handshake.query.token`
- Debug logging currently present in `socket.ts` for token inspection (to be removed in production).

## Frontend debugging (TODO)
- Identify:
  - how API base URL is configured
  - how socket connection is created
  - where errors are surfaced in UI

## TODO
- Add a “common issues” checklist:
  - 401/403 auth failures
  - socket disconnects
  - CORS/Helmet CSP issues
  - message delivery issues
- Add links to:
  - [[Testing]]
  - [[API Security]]
