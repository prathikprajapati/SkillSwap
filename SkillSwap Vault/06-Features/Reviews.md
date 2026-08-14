---
type: feature-reviews
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - feature
  - reviews
---

# Reviews

## Summary
Placeholder for rating/review functionality in SkillSwap.

## Backend mapping (placeholders)
- [[Other APIs]]
- [[Chat System]]
- Uses Prisma model `Rating` and includes:
  - rated user
  - rater user
  - optional match linkage
  - rating value + optional comment

## Frontend mapping (placeholders)
- Identify from frontend:
  - profile/settings pages
  - any rating UI components
- TODO: locate which `SkillSwapFrontEnd/src/app/api/*.ts` calls ratings endpoints.

## Wiki Links
- [[User APIs]]
- [[API Overview]]
- [[Security Checklist]]

## TODO
- Document exact endpoints from `skill_swap/backend/src/routes/ratings.ts`
- Document exact controller behavior from `skill_swap/backend/src/controllers/ratingsController.ts`
