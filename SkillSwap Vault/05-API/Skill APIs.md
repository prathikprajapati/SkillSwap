---
type: api-skills
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - api
  - skills
---

# Skill APIs

## Summary
Endpoints for listing/creating/updating skills and skill offerings are grouped under `/skills/*`.

## Inventory (placeholders)
- Verify from `skill_swap/backend/src/routes/skills.ts`
- Verify from `skill_swap/backend/src/controllers/skillsController.ts`

## Authorization
- Expected: Firebase token verification (where wired)
- Soft-delete blocking: if `requireActiveUser` is used by this router, document it in Phase 3.

## Wiki Links
- [[Frontend Architecture]]
- [[Skill Exchange]]
- [[Authentication Flow]]

## TODO
- Populate exact route list and schemas after reading:
  - `src/routes/skills.ts`
  - `src/controllers/skillsController.ts`
  - `SkillSwapFrontEnd/src/app/api/skills.ts`
