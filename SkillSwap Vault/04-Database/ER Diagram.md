---
type: database-er-diagram
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - database
  - er-diagram
  - mermaid
---

# ER Diagram

## Summary
Mermaid ER diagram placeholder. Will be generated from Prisma models in Phase 3.

## TODO
- Generate diagram for MySQL schema using `skill_swap/backend/prisma/schema.prisma`
- Add entities and relationship cardinalities.

## Wiki Links
- [[Prisma Schema]]
- [[Relationships]]

## Diagram (placeholder)
```mermaid
erDiagram
  USER ||--o{ USER_SKILL : has
  USER ||--o{ MATCH_REQUEST : sent
  USER ||--o{ MATCH_REQUEST : received
  USER ||--o{ MESSAGE : sent
  USER ||--o{ RATING : rated
  USER ||--o{ ACHIEVEMENT : unlocks
  USER ||--o{ NOTIFICATION : receives

  SKILL ||--o{ USER_SKILL : typed_as
  SKILL ||--o{ SESSION : included_in
  MATCH ||--o{ MESSAGE : contains
  MATCH ||--o{ RATING : reviewed_by
