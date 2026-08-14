---
type: architecture-backend
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - architecture
  - backend
---

# Backend Architecture

## Summary
Express (TypeScript) REST API + Socket.IO real-time layer + Prisma ORM with MySQL.

## Key modules (placeholders)
- [[server.ts]] (Express app wiring)
- [[socket.ts]] (Socket.IO auth + chat events + online status)
- [[firebaseAuth]] middleware (Firebase ID token → MySQL user upsert)
- [[auth middleware]] (JWT-based auth exists, verify wiring in Phase 3)

## Data flow (placeholders)

```mermaid
flowchart LR
Client[Client] -->|REST| Express[Express REST]
Express -->|Prisma queries| DB[(MySQL)]
Express -->|Verify Firebase token| Firebase[Firebase Auth]

Client -->|Socket token| Socket[Socket.IO]
Socket -->|Prisma queries| DB
```

## Navigation
- [[System Architecture]]
- [[Request Lifecycle]]
