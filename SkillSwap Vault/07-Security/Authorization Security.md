---
type: security-authorization
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - security
  - authorization
---

# Authorization Security

## Summary
Authorization is conceptually enforced via:
- Authentication middleware populating `req.user` (Firebase UID lookup)
- Route-level checks for account state (soft-delete)
- Socket events organized by match rooms (participant authorization not yet confirmed)

## REST authorization (placeholders)
- `verifyFirebaseToken` populates user context from Firebase UID
- Soft-delete block is present via controller logic in `firebaseLogin`
- JWT middleware exists (`authenticateToken`, `requireActiveUser`) but route usage is TODO

## Socket authorization (placeholders)
- Socket.IO auth verifies Firebase token in `initializeSocket`
- Emission and reception occurs in rooms: `match:${match.id}`

## TODO (Phase 3)
- Confirm per-route middleware chain in:
  - `skill_swap/backend/src/routes/*.ts`
- Confirm whether match-room membership is checked before emitting/accepting events
