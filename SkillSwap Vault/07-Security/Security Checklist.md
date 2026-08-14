---
type: security-checklist
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - security
  - checklist
---

# Security Checklist

## Summary
Audit checklist for authentication, authorization, input validation, rate limiting, and data exposure.

## REST API
- [ ] Verify Firebase token middleware (`verifyFirebaseToken`) applied where required
- [ ] Verify JWT middleware (`authenticateToken`) is either deprecated or consistently used
- [ ] Ensure soft-deleted users are blocked (`is_deleted`)
- [ ] Confirm `express-validator` rules exist for all write endpoints
- [ ] Validate correct status codes and error messages (no sensitive leakage)

## WebSocket / Socket.IO
- [ ] Verify socket token is present and verified on `io.use`
- [ ] Ensure match-room authorization (user is participant) is enforced (not confirmed yet)
- [ ] Confirm per-event rate limiting (messages + typing) is enforced

## Headers / Transport
- [ ] Helmet CSP + CORS configured correctly for production
- [ ] Production HTTPS enforcement is correct (`x-forwarded-proto`)

## TODO
- Populate concrete findings from:
  - `skill_swap/backend/src/socket.ts`
  - `skill_swap/backend/src/routes/*.ts`
  - `skill_swap/backend/src/controllers/*.ts`
  - `SkillSwapFrontEnd/src/app/api/*.ts`
