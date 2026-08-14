---
type: api-users
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - api
  - users
---

# User APIs

## Summary
User-related endpoints are grouped under REST routes `/users/*`.

## Inventory (placeholders)
- [[User APIs]] — verify from `skill_swap/backend/src/routes/users.ts` and `userController.ts`
- Authenticated requests should be verified via Firebase token middleware where applied.

## Authorization
- Expected patterns:
  - Firebase token verification via `verifyFirebaseToken`
  - Soft-delete checks via `firebaseLogin` (confirmed) and/or `requireActiveUser` (wiring TBD)
  - JWT middleware exists (`authenticateToken`) but usage not fully confirmed

## TODO
- Populate exact route paths and response schemas from:
  - `skill_swap/backend/src/routes/users.ts`
  - `skill_swap/backend/src/controllers/userController.ts`
- Confirm whether JWT middleware is actually used by this router.
