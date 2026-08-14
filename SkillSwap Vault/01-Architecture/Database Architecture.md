---
type: architecture-database
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - architecture
  - database
---

# Database Architecture

## Summary
Prisma ORM over MySQL. Core entities: `User`, `Skill`, `UserSkill`, `MatchRequest`, `Match`, `Message`, `Rating`, `Session`, `Exchange`, `Achievement`, `Notification`, plus gamification/streak tables.

## Diagram placeholder
```mermaid
flowchart LR
App[Express API + Socket.IO] --> Prisma[Prisma Client]
Prisma --> MySQL[(MySQL)]
```

## Wiki links
- [[Prisma Schema]]
- [[Models]]
- [[Relationships]]
- [[ER Diagram]]

## Navigation
- [[System Architecture]]
- [[Database Overview]]
