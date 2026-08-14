---
type: security-threat-model
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - security
  - threat-model
---

# Threat Model

## Summary
Places where SkillSwap can be attacked: REST API, Socket.IO chat, auth/session handling, and data persistence (Prisma/MySQL).

## Threat Surface
- REST endpoints behind Express + Helmet + Rate limiting
- Firebase token verification (`verifyFirebaseToken`, Socket auth `io.use`)
- WebSocket events & match rooms
- Soft-delete user enforcement (`is_deleted`)
- File uploads (multer) for avatar uploads (middleware exists)

## Risks (placeholders)
| Category | Risk | Impact |
|---|---|---|
| Auth | Invalid/expired Firebase tokens accepted | account takeover |
| Authorization | User can access non-participant match room | data leakage |
| Injection | Missing/partial express-validator on write endpoints | integrity loss |
| Abuse | Flood chat/typing events | denial of service |
| Privacy | Overly detailed error messages | user enumeration |

## Wiki Links
- [[Security Checklist]]
- [[Authentication Security]]
- [[Authorization Security]]
- [[API Security]]

## TODO
- Derive concrete threats from:
  - `skill_swap/backend/src/socket.ts`
  - `skill_swap/backend/src/routes/*.ts`
  - `skill_swap/backend/src/middleware/*`
