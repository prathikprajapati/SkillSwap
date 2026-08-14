---
type: development-build-process
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - development
  - build
---

# Build Process

## Summary
Documents how frontend and backend builds are produced.

## Backend (confirmed)
Package scripts (from `skill_swap/backend/package.json`):
- `npm run build` → `tsc`
- `npm run start` → `node dist/server.js`

## Frontend (TODO)
From `SkillSwapFrontEnd/package.json` and `vite.config.ts`:
- TODO: confirm build/dev scripts
- TODO: confirm output directory and production settings

## Prisma (optional workflow)
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

## TODO
- Read:
  - `SkillSwapFrontEnd/package.json`
  - `SkillSwapFrontEnd/vite.config.ts`
  - `skill_swap/backend/tsconfig*.json`
