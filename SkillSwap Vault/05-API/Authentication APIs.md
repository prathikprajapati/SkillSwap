---
type: api-authentication
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - api
  - authentication
---

# Authentication APIs

## Summary
Backend authentication uses **Firebase ID tokens** for most endpoints. Socket authentication also verifies Firebase tokens.

## Inventory (placeholders; Phase 3 will confirm all paths)
- POST `/auth/firebase-login`
- POST `/auth/firebase-signup`

## Authorization
- Both routes use `verifyFirebaseToken` middleware (Firebase token verification + user upsert)
- Soft-delete enforcement is performed inside `firebaseLogin` controller

## Wiki Links
- [[Authentication Flow]]
- [[Authorization Flow]]
- [[API Security]]

## TODO
- Confirm request/response schemas from controllers and frontend API modules.
