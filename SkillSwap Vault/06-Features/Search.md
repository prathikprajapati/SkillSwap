---
type: feature-search
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - feature
  - search
---

# Search

## Summary
Placeholder note for search capabilities (finding users/skills/matches) in SkillSwap.

## TODO
- Identify backend search endpoints from:
  - `skill_swap/backend/src/routes/skills.ts`
  - `skill_swap/backend/src/routes/users.ts`
  - any controllers referenced by search UI
- Identify frontend search UI and API calls from:
  - `SkillSwapFrontEnd/src/app/pages/BrowseSkills.tsx`
  - any related components under `SkillSwapFrontEnd/src/app/components/*`
- Document:
  - searchable entities (skills, users, matches)
  - query parameters
  - pagination strategy (check `SkillSwapFrontEnd/src/app/api/*` and backend pagination utils)

## Wiki Links
- [[Frontend Overview]]
- [[Skill APIs]]
- [[User APIs]]
