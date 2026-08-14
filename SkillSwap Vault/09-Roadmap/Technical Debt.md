---
type: roadmap-technical-debt
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - roadmap
  - technical-debt
---

# Technical Debt

## Summary
Tracks technical debt found during implementation and documentation work.

## Current Debt (placeholders)
- TODO: identify backend areas lacking consistent validation/auth checks across routes
- TODO: review Prisma schema for potential issues (e.g., migrations and enum completeness)
- TODO: check frontend-backend API path mismatches:
  - `SkillSwapFrontEnd/src/app/api/messages.ts` assumptions vs backend `/messages` and/or `/matches/:id/messages`
  - `SkillSwapFrontEnd/src/app/api/gamification.ts` endpoint mismatch possibility vs backend `/gamification/xp/award`

## TODO
- Convert each placeholder into a documented item with:
  - impact
  - likelihood
  - suggested remediation
  - owner
  - target milestone
