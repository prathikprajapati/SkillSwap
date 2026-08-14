---
type: architecture-authentication-flow
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - authentication
  - architecture
---

# Authentication Flow

## Summary
Firebase ID tokens authenticate users for REST endpoints and Socket.IO.

## Actors
- User
- Frontend (React)
- Backend REST API (Express)
- Socket.IO server
- Firebase Auth (token verification)
- MySQL (via Prisma `User`)

## Flow (placeholders)
```mermaid
sequenceDiagram
User->>Frontend: Sign in with Firebase
Frontend->>Backend: POST /auth/firebase-login (Authorization: Bearer token)
Backend->>Firebase: Verify ID token
Backend->>MySQL: Find/Create User
MySQL-->>Backend: User record
Backend-->>Frontend: User payload
```

## Wiki Links
- [[Authorization Flow]]
- [[Request Lifecycle]]
- [[System Architecture]]

## TODO
- Document exact frontend auth endpoints usage (login/signup vs firebase-login/signup)
- Document how AuthContext stores tokens/user data (confirmed later)
