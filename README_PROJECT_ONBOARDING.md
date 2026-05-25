# SkillSwap — Project Onboarding (Backend + Frontend) — Viva-Safe Guide

This README is designed for **live demos / viva/presentation readiness**. It covers how to set up, run, and validate both parts of the system:

- **Backend:** `skill_swap` (Node + Express + Prisma + Socket.IO)
- **Frontend:** `SkillSwapFrontEnd` (React + TypeScript + Socket.IO chat)

## 1) Quick overview (what the system does)
SkillSwap connects users and enables skill-matching chat flows:
- Users authenticate with **Firebase** tokens.
- Matches are created/accepted through REST endpoints.
- Chat uses **Socket.IO** for:
  - message sending
  - optimistic message reconciliation (send confirmation + sync on reconnect)
  - typing indicators
  - read receipts
  - online/offline presence updates

## 2) Prerequisites
- Node.js (LTS recommended)
- npm
- Access to Firebase project credentials (used by backend)
- A working database configured for Prisma

## 3) Backend (`skill_swap`) — Setup & Run

### 3.1 Install dependencies
From the repository root, go to:
- `skill_swap/backend`

Then run:
```bash
npm install
```

### 3.2 Environment variables
Backend uses Firebase Admin SDK and Prisma. Ensure you have the required env vars in:
- `skill_swap/backend/.env` (or configure via your process/environment)

Typical needs (names may vary depending on existing code):
- Firebase service account / admin credentials
- Database URL for Prisma
- Any server port (if configured)

If any env var is missing, the backend will fail during startup or auth verification.

### 3.3 Run backend
From:
- `skill_swap`

Use the existing start script (as configured in `skill_swap/package.json`) or run the backend entry directly.

Common patterns:
```bash
npm run dev
```
or
```bash
npm start
```

### 3.4 Backend health check (viva-safe)
1) Start backend.
2) Confirm server logs show it’s listening.
3) Confirm Prisma connects to the database.
4) Confirm Firebase token verification works by attempting login flow from frontend.

## 4) Frontend (`SkillSwapFrontEnd`) — Setup & Run

### 4.1 Install dependencies
From:
- `SkillSwapFrontEnd`

Run:
```bash
npm install
```

### 4.2 Environment variables
Frontend uses:
- `VITE_BACKEND_URL` (default often falls back to `http://localhost:3000`)

Set in:
- `SkillSwapFrontEnd/.env`

Example:
```bash
VITE_BACKEND_URL=http://localhost:3000
```

### 4.3 Run frontend
Run:
```bash
npm run dev
```

Open the dev server URL (usually `http://localhost:5173` or `5174`).

## 5) End-to-end Demo Flow (recommended viva script)
Perform the following in order to reduce the chance of edge-case failures:

### Step A — Login
- Use the frontend auth UI to sign up/login.
- Confirm you land in the dashboard (i.e., tokens are being stored and refreshed).

### Step B — Create or accept a match
- Navigate to a match flow (send/accept request).
- Confirm a match page exists and the match ID is visible/active.

### Step C — Enter chat
- Open the chat for the match.
- Ensure socket connection is established (frontend should connect to backend via Socket.IO).

### Step D — Send a message (socket send)
- Type a short message and hit send.
- Expected:
  - message appears immediately (optimistic UI)
  - backend confirmation arrives (`message_sent` reconciliation)
  - message is visible for both participants (`new_message`)

### Step E — Typing indicator
- While typing, verify typing indicator appears to the other user.
- Stop typing and confirm indicator clears.

### Step F — Read receipts
- Read the last message(s).
- Expected:
  - backend marks messages as read (`mark_read`)
  - recipient sees updated read states (`message_read`)

### Step G — Disconnect + reconnect resilience
- Temporarily close/reopen the socket connection by:
  - refreshing frontend, or
  - navigating away/back to chat.
- Expected:
  - reconnect triggers `sync_messages` / `sync_response`
  - message history reconciles without duplication
  - read receipts and typing state return to consistent values

## 6) Local testing checklist (fast validation)
- Backend starts without auth/token errors
- Frontend can call REST endpoints
- Socket can:
  - join match rooms (`join_match`)
  - send/receive messages
  - update read receipts
  - show typing indicators
- No duplicate message listeners after reconnect
- UI stays consistent (uses design tokens; avoids drift)

## 7) Common failure modes (and what to do)
### A) Firebase token invalid / expired
- Re-login in frontend.
- Verify backend Firebase config is correct.

### B) Socket fails to authenticate
- Confirm `VITE_BACKEND_URL` points to correct backend host/port.
- Confirm frontend passes a valid Firebase token to socket auth.

### C) Messages not reconciling after reconnect
- Refresh chat after reconnect.
- Ensure optimistic tempId -> server id mapping is working.

## 8) Where to look for implementation
Key modules involved in chat hardening:
- Backend:
  - `skill_swap/backend/src/socket.ts`
  - `skill_swap/backend/src/middleware/firebaseAuth.ts`
  - controllers under `skill_swap/backend/src/controllers/`
- Frontend:
  - `SkillSwapFrontEnd/src/chat/chatSocketHandler.ts`
  - `SkillSwapFrontEnd/src/chat/chatStore.ts`
  - `SkillSwapFrontEnd/src/chat/chatApi.ts`
