---
type: security-api
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - security
  - api
---

# API Security

## Summary
Backend API security is implemented using:
- **Helmet** (security headers + CSP)
- **Rate limiting** (global + stricter auth limits)
- **Token-based authentication** (Firebase middleware `verifyFirebaseToken`)
- **Input validation** via `express-validator` (used in routes such as auth)

## Implemented (confirmed)
- **Helmet** configured in `skill_swap/backend/src/server.ts`
  - CSP directives: `defaultSrc 'self'`, `connectSrc` includes local dev hosts/ports
  - `crossOriginEmbedderPolicy: false`
- **Rate limiting**
  - Global `express-rate-limit` for all routes
  - Auth-specific limiter applied at `/auth` in `server.ts`
- **Auth token verification**
  - REST: `verifyFirebaseToken` middleware (`backend/src/middleware/firebaseAuth.ts`)
  - Socket: `io.use` verifies token in `backend/src/socket.ts`

## Input validation (confirmed partially)
- Auth signup route includes `express-validator` body rules:
  - `body('name').optional().trim().isLength({ min: 1, max: 255 })`

## TODO (Phase 3)
- Enumerate which write endpoints use `express-validator`
- Confirm whether all controllers enforce soft-delete / active-user checks
- Confirm per-route authentication middleware usage across:
  - `backend/src/routes/*.ts`
- Confirm REST endpoints used by frontend modules in:
  - `SkillSwapFrontEnd/src/app/api/*`
