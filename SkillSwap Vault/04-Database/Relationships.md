---
type: database-relationships
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - database
  - prisma
  - relationships
---

# Relationships

## Summary
Documents how Prisma models relate and how relations are used in controllers.

## Inventory (placeholders)
- [[User]] → [[UserSkill]]
- [[User]] ↔ [[MatchRequest]]
- [[User]] ↔ [[Match]] (user1/user2)
- [[Match]] → [[Message]]
- [[User]] ↔ [[Rating]] (rated/rater)
- [[User]] → [[Achievement]]
- [[User]] → [[Notification]]
- [[Session]] → [[User]] + [[Skill]]
- [[Exchange]] → [[Match]]/sessions lifecycle (controller-defined)

## Wiki links
- [[Models]]
- [[Prisma Schema]]
- [[ER Diagram]]

## TODO (Phase 3)
- Populate with discovered foreign keys + onDelete semantics (from schema.prisma).
