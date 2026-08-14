---
type: feature-authentication
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - feature
  - authentication
---

# Authentication

## Summary
SkillSwap authenticates users primarily via **Firebase ID tokens** verified by backend middleware (`verifyFirebaseToken`) and by Socket.IO middleware in `socket.ts`.

## Backend mapping (wiki links)
- [[Authentication Flow]]
- [[Authentication APIs]]
- [[Authentication Security]]

## Key behaviors
- Token required for authenticated REST endpoints (where middleware is applied)
- Socket connections also require a Firebase token from `handshake.auth.token` or `handshake.query.token`

## TODO
- Enumerate exact endpoint paths from `skill_swap/backend/src/routes/auth.ts` and all other routers that require authentication.
