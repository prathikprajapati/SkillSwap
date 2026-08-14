---
type: feature-notifications
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - feature
  - notifications
---

# Notifications

## Summary
Placeholder for user notifications (match events, messages, reminders, achievements).

## Backend mapping (placeholders)
- [[Other APIs]]
- [[Authentication Flow]]
- `skill_swap/backend/src/routes/notifications.ts`
- `skill_swap/backend/src/controllers/notificationsController.ts`
- `skill_swap/backend/src/services/notificationService.ts`

## Frontend mapping (placeholders)
- Settings notifications UI:
  - `SkillSwapFrontEnd/src/app/pages/settings/NotificationsSection.tsx`

## Wiki Links
- [[API Overview]]
- [[Security Checklist]]

## TODO
- List exact notification types from Prisma enum `NotificationType`:
  - MATCH_REQUEST
  - MATCH_ACCEPTED
  - NEW_MESSAGE
  - SESSION_REMINDER
  - ACHIEVEMENT_UNLOCKED
  - XP_EARNED
  - RATING_RECEIVED
- Identify REST endpoints used by the frontend from `SkillSwapFrontEnd/src/app/api/*`.
