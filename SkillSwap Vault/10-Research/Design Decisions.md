---
type: research-design-decisions
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - research
  - design-decisions
---

# Design Decisions

## Summary
Captures major architecture/product decisions for SkillSwap and why they were chosen.

## Current Decisions (placeholders)
- Firebase-based authentication:
  - Backend verifies Firebase ID tokens via `verifyIdToken`
  - Socket.IO connections also authenticate via Firebase tokens
- MySQL + Prisma:
  - Persist app state in relational tables with Prisma models
- Socket.IO for chat:
  - Real-time message delivery and presence signaling (rooms like `match:<id>`)

## TODO
- Create decision entries with:
  - decision statement
  - alternatives considered
  - consequences (pros/cons)
  - linked code locations
