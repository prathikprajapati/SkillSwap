---
type: api-other
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - api
  - other
---

# Other APIs

## Summary
Endpoints that don’t fit neatly into the major buckets (auth/users/skills/chat) — including matchmaking, sessions, exchanges, gamification, ratings, notifications, etc.

## Inventory (placeholders)
- [[Match APIs]] → `skill_swap/backend/src/routes/matches.ts` and `requests.ts`
- [[Session APIs]] → `src/routes/sessions.ts`
- [[Exchange APIs]] → `src/routes/exchanges.ts`
- [[Gamification APIs]] → `src/routes/gamification.ts` (XP award endpoints)
- [[Ratings APIs]] → `src/routes/ratings.ts`
- [[Notifications APIs]] → `src/routes/notifications.ts`
- [[Requests APIs]] → `src/routes/requests.ts`

## TODO
- Confirm exact REST paths + middleware per route by reading:
  - `skill_swap/backend/src/routes/*.ts`
  - corresponding controller(s) in `skill_swap/backend/src/controllers/*.ts`
- Map each REST endpoint to the frontend `SkillSwapFrontEnd/src/app/api/*` module(s).
