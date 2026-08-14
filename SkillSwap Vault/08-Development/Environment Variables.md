---
type: development-env-vars
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - development
  - env
---

# Environment Variables

## Summary
Documents required environment variables discovered from backend configuration and middleware.

## Backend (confirmed)
### `skill_swap/backend/src/middleware/auth.ts`
- `JWT_SECRET` (**required**)
  - Server startup throws if missing.

### `skill_swap/backend/prisma/schema.prisma`
- `DATABASE_URL`
  - MySQL connection string used by Prisma datasource.

## Frontend (TODO)
- Firebase config and API base URL usage should be documented after reading:
  - `SkillSwapFrontEnd/src/app/config/firebase.ts`
  - API client modules under `SkillSwapFrontEnd/src/app/api/*.ts`

## TODO
- Enumerate all env vars from:
  - `skill_swap/backend/src/config/*`
  - `skill_swap/backend/.env` patterns (if any)
  - `SkillSwapFrontEnd` config usage
