---
type: architecture-frontend
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - architecture
  - frontend
---

# Frontend Architecture

## Summary
Frontend is a React + TypeScript application with protected routing and Firebase-authenticated API calls, plus Socket.IO chat.

## Key sub-areas
- [[Routing]]
- [[State Management]]
- [[UI Architecture]]
- [[Chat Lifecycle]] (created in Phase 4)
- [[Authentication Flow]]

## Data flow (placeholders)
```mermaid
flowchart LR
User[User] -->|Firebase ID token| AuthContext[AuthContext]
AuthContext -->|Authorization header| AxiosClient[Axios client]
AxiosClient --> Backend[Backend REST API]
User -->|Socket token| SocketClient[Socket.IO client]
SocketClient --> BackendSocket[Backend Socket.IO]
```

## Navigation
- [[System Architecture]]
- [[Frontend Overview]]
