---
type: development-local-setup
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - development
  - setup
---

# Local Setup

## Summary
Placeholder for running SkillSwap locally (frontend + backend).

## Backend (placeholders)
- Backend scripts (from `skill_swap/backend/package.json`):
  - `npm run dev` (nodemon + tsx, runs `src/server.ts`)
  - `npm run test` (jest)
  - Prisma scripts: `prisma generate`, `prisma migrate dev`, `prisma seed`

## Frontend (placeholders)
- Frontend scripts will be documented after reading `SkillSwapFrontEnd/package.json` (TODO)

## TODO
- Document exact run commands for both repositories
- Document required env vars for:
  - `skill_swap/backend/prisma` (DATABASE_URL)
  - JWT_SECRET (required at startup by `src/middleware/auth.ts`)
  - Firebase config (used by `src/config/firebase.ts`)
