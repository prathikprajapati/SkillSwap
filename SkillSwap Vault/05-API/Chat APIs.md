---
type: api-chat
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - api
  - chat
---

# Chat APIs

## Summary
Chat is implemented via:
- REST endpoints under `/messages/*` (REST inventory will be confirmed in Phase 3)
- Socket.IO for real-time messaging (rooms per match)

## REST (placeholders)
- [[Message APIs]] → expected in `skill_swap/backend/src/routes/messages.ts`
- Possible relation: messages may be fetched by match id (frontend mentions `/matches/:id/messages`)

## WebSocket (placeholders)
- Socket.IO auth verifies Firebase token via `skill_swap/backend/src/socket.ts`
- Connected users tracked by `userId -> socketId`
- Rate limiting implemented for messages and typing indicators

## Wiki Links
- [[Authentication Flow]]
- [[Request Lifecycle]]
- [[Chat System]]
- [[API Security]]

## TODO
- Confirm exact socket event names and REST paths by reading:
  - `skill_swap/backend/src/controllers/messagesController.ts`
  - `skill_swap/backend/src/routes/messages.ts`
  - `SkillSwapFrontEnd/src/chat/chatSocketHandler.ts`
