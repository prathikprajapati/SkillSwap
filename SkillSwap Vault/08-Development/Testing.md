---
type: development-testing
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - development
  - testing
---

# Testing

## Summary
Testing strategy includes Jest test suites for backend and Playwright e2e tests for frontend (based on repository structure).

## Backend (confirmed)
Scripts (from `skill_swap/backend/package.json`):
- `npm test` → Jest
- `npm run test:unit` → `--testPathPattern=unit`
- `npm run test:integration` → `--testPathPattern=integration`
- Integration test suites exist under:
  - `skill_swap/backend/tests/integration/*`
- Unit tests exist under:
  - `skill_swap/backend/tests/unit/*`
- Setup utilities:
  - `skill_swap/backend/tests/setup.ts`
  - `skill_swap/backend/tests/utils.ts`

## Frontend (confirmed by structure)
- Playwright e2e tests exist under:
  - `SkillSwapFrontEnd/e2e/*.spec.ts`
- Playwright report folder:
  - `SkillSwapFrontEnd/playwright-report/*`

## TODO
- Document exact test commands for frontend from `SkillSwapFrontEnd/package.json`
- Identify key test categories:
  - auth
  - authorization
  - concurrency
  - matchmaking
  - messages/chat
  - ratings
  - requests
  - user
