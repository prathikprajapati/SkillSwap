---
type: feature-chat-system
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - feature
  - chat
---

# Chat System

## Summary
SkillSwap supports chat messages associated with matches/sessions and delivered via REST and Socket.IO (based on backend `messagesController` and `socket.ts`).

## Backend mapping (placeholders)
- [[Chat APIs]]
- [[Request Lifecycle]]
- [[Authorization Flow]]

## Frontend mapping (placeholders)
- REST/API client modules:
  - `SkillSwapFrontEnd/src/app/api/messages.ts`
  - `SkillSwapFrontEnd/src/app/api/matches.ts`
- Socket handling:
  - `SkillSwapFrontEnd/src/chat/chatSocketHandler.ts`
  - `SkillSwapFrontEnd/src/contexts/SocketContext.tsx`

## Wiki Links
- [[Chat APIs]]
- [[Chat System]]
- [[Authentication APIs]]
- [[Security Checklist]]

## TODO
- Confirm exact backend REST paths for messages:
  - Determine whether frontend uses:
    - GET `/matches/:id/messages` (assumed)
    - or `/messages` router endpoints
- Confirm socket event names and payload schemas (from `skill_swap/backend/src/socket.ts` and any message-related handlers in `socket.ts`).
