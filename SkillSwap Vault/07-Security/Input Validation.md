---
type: security-input-validation
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - security
  - input-validation
---

# Input Validation

## Summary
Defines how SkillSwap validates incoming data for REST and WebSocket requests.

## Observations (based on discovered code so far)
- Backend uses `express-validator` in some routes (e.g., `skill_swap/backend/src/routes/auth.ts` uses `body('name')...`).
- Auth middleware:
  - `verifyFirebaseToken` expects `Authorization: Bearer <token>` header
  - JWT middleware `authenticateToken` expects `Authorization: Bearer <token>`

## TODO
- Enumerate validation patterns in:
  - `skill_swap/backend/src/routes/*.ts`
  - `skill_swap/backend/src/controllers/*.ts`
- Confirm whether request bodies use:
  - schema validation
  - sanitization
  - consistent error responses
- Document WebSocket message validation (from `socket.ts` and message handlers).

## Wiki Links
- [[Authentication Security]]
- [[Authorization Security]]
- [[API Security]]
- [[Security Checklist]]
