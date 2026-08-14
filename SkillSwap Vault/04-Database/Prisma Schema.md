---
type: prisma-schema
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - database
  - prisma
  - documentation
---

# Prisma Schema

## Location
- `skill_swap/backend/prisma/schema.prisma`

## Summary
Prisma schema defines:
- Data source: MySQL (`DATABASE_URL`)
- Client generator: `prisma-client-js`
- Models: `User`, `Skill`, `UserSkill`, `MatchRequest`, `Match`, `Message`, `Rating`, `Achievement`, `Notification`, `Session`, `Exchange`, `XPTransaction`, `Streak` (as applicable)
- Enums: `SkillType`, `ProficiencyLevel`, `RequestStatus`, `SessionStatus`, `MatchStatus`, `ExchangeStatus`, etc.

## Wiki Links
- [[Models]]
- [[Relationships]]
- [[ER Diagram]]

## TODO
- Inline key model summaries and enum semantics.
