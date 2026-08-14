---
type: security-authentication
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - security
  - authentication
---

# Authentication Security

## Summary
Authentication is primarily enforced using **Firebase ID token verification** in:
- REST middleware: `verifyFirebaseToken` (`skill_swap/backend/src/middleware/firebaseAuth.ts`)
- Socket.IO middleware: `io.use` in `skill_swap/backend/src/socket.ts`

A separate JWT middleware (`authenticateToken`) exists in `skill_swap/backend/src/middleware/auth.ts`, but its usage across routers is not yet fully confirmed.

## REST authentication (Firebase)
- Extracts `Authorization: Bearer <token>`
- Calls `auth.verifyIdToken(token)`
- Uses Firebase UID to upsert / find a `User` in MySQL
- Attaches `req.user = { id, firebaseUid, email }`

## Socket authentication (Firebase)
- Token is read from `socket.handshake.auth.token` or `socket.handshake.query.token`
- Calls `auth.verifyIdToken(token)`
- (TODO) Document the exact socket fields populated after verification

## TODO
- Confirm which endpoints use Firebase middleware vs JWT middleware
- Document expected request headers and failure response bodies
