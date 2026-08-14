---
type: architecture
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - architecture
---

# System Architecture

## Overview
SkillSwap is a **Firebase-authenticated** system with:
- a **REST API** (Express + Prisma + MySQL)
- a **real-time chat layer** (Socket.IO)
- a **React frontend** with protected routing

## High-level diagram

```mermaid
flowchart LR
User[User] -->|Firebase ID Token| Frontend[SkillSwapFrontEnd]

Frontend -->|REST requests| Backend[Express REST API]
Frontend -->|Socket.IO auth token| Socket[Socket.IO]

Backend -->|Prisma queries| DB[(MySQL / Prisma)]
Backend -->|Firebase verification| Firebase[Firebase Auth]
Socket -->|Online status + messages| Backend

```

## Components (as discovered)
- **Frontend**
  - Protected pages via `ProtectedRoute`
  - Auth state via `AuthContext`
  - Chat UI via `Messages.tsx` + Zustand store + Socket.IO handlers
- **Backend**
  - `server.ts` wires REST routes and security middleware
  - `socket.ts` authenticates socket connections and broadcasts status
  - `middleware/firebaseAuth.ts` ensures a MySQL `User` exists

## Wiki links
- [[Frontend Architecture]]
- [[Backend Architecture]]
- [[Database Architecture]]
- [[Authentication Flow]]
- [[Authorization Flow]]
- [[Request Lifecycle]]
