---
type: project-analysis
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - documentation
---

# PROJECT_ANALYSIS.md — SkillSwap (Repository Discovery Phase 1)

## Tech Stack

### Frontend (SkillSwapFrontEnd)
- React + TypeScript
- React Router (protected routing)
- Axios (API client)
- Zustand (chat state)
- Socket.IO client (real-time chat)
- Firebase Auth (client-side ID tokens + onAuthStateChanged)
- TanStack Query (requests page data fetching)
- UI stack includes Tailwind-like styling + custom component library (numerous `src/components/ui/*`)

### Backend (skill_swap)
- Express (v5) + TypeScript + tsx tooling
- Socket.IO (WebSockets)
- Prisma ORM (MySQL)
- Firebase Admin SDK (ID token verification)
- Security middleware:
  - helmet (CSP + security headers)
  - express-rate-limit
  - express-validator
- File upload:
  - multer (avatar upload)
- Testing:
  - jest + ts-jest; integration tests present

---

## Architecture Summary

SkillSwap uses a **Firebase-authenticated REST API** plus **Socket.IO real-time messaging**:

1. **Authentication**
   - Client obtains Firebase ID token.
   - Backend verifies token via `verifyFirebaseToken` and ensures a corresponding MySQL `User` exists.

2. **Core domain**
   - Users exchange skills via:
     - match requests (`/requests`)
     - matches + recommended discovery (`/matches`)
     - message exchange (`/messages` REST and Socket.IO)
     - sessions and exchanges for scheduling/teaching completion
     - ratings/reviews which finalize matches
   - Gamification (XP/streak/achievements) is computed via services and event-style triggers.

3. **Chat architecture**
   - Socket.IO auth middleware verifies Firebase token.
   - Clients join match rooms and receive:
     - message lifecycle events
     - typing indicators
     - online/offline status updates for match participants
   - REST endpoints support chat history and read receipts.

---

## Frontend Overview

### Routing & access control
- `src/app/routes.tsx` (protected routes)
- `src/app/components/ProtectedRoute.tsx` blocks access until user exists in `AuthContext`.

### Authentication client state
- `src/app/contexts/AuthContext.tsx`
  - Firebase `onAuthStateChanged`
  - Syncs user profile via `usersApi.getMe()`
  - Caches user in `localStorage`.

### API client & token injection
- `src/app/api/client.ts`
  - Axios base URL: `VITE_API_BASE_URL`
  - Authorization token injection
  - 401 handling behavior (redirect / auth)

### Feature pages discovered
- `Dashboard.tsx` — displays incoming requests and accepts/declines
- `Profile.tsx` — shows own profile & skills (`/users/me`, `/users/me/skills`)
- `Messages.tsx` — chat UI with REST history + Socket.IO live updates
- `RequestsPage.tsx` — incoming/sent request management (React Query)
- `Exchanges.tsx` — lists exchanges and completes active ones
- `Schedule.tsx` — lists sessions and books new sessions via modal

### Chat state management
- `src/chat/chatStore.ts` (Zustand)
  - conversation list
  - message map (dedup by `id || tempId`)
  - optimistic sending + read/delivered states
  - typing/online state

- `src/chat/chatSocketHandler.ts` (discovered earlier)
  - singleton connectSocket(token)
  - match room join/rejoin
  - event listeners for messages + typing + statuses

---

## Backend Overview

### Server entry / routing
- `skill_swap/backend/src/server.ts`
  - helmet + rate limiting
  - `/auth` routes mounted with authLimiter
  - mounts route groups:
    - `/skills`, `/users`, `/matches`, `/sessions`, `/requests`, `/messages`, `/gamification`, `/ratings`, `/notifications`, `/exchanges`

### Real-time server (Socket.IO)
- `skill_swap/backend/src/socket.ts`
  - socket auth middleware verifies Firebase token
  - maintains `connectedUsers`
  - broadcasts match-participant online status
  - rate limits for chat events

### Core middleware
- `src/middleware/firebaseAuth.ts`: verifyFirebaseToken
  - verifies Firebase ID token
  - ensures `User` exists (create or backfill `firebase_uid`)
  - sets `req.user` for downstream controllers

- `src/middleware/upload.ts`: multer uploadAvatar
  - field name: `avatar`
  - accepts image types only, max 5MB

### Services
- `src/services/notificationService.ts`
  - internal notification creation (fire-and-forget)
  - read/unread operations
  - helper functions for event notifications

- `src/services/achievementService.ts`
  - unlockAchievement (idempotent upsert)
  - processAchievementTrigger (fire-and-forget event processing)
  - achievement triggers tied to match completion, skill addition, rating submission, XP thresholds

---

## API Inventory (high-level)

> See `API_INVENTORY.md` for full endpoint-by-endpoint inventory.

### Auth
- `POST /auth/firebase-login`
- `POST /auth/firebase-signup`

### Users
- `GET /users/me`
- `PUT /users/me`
- `DELETE /users/me` (soft delete)

### Skills
- `GET /skills` (public)
- `POST /users/me/skills`
- `DELETE /users/me/skills/:skillId`
- `GET /users/me/skills`

### Requests / Matchmaking
- `GET /requests/incoming`
- `GET /requests/sent`
- `POST /requests`
- `PUT /requests/:id/accept`
- `PUT /requests/:id/reject`
- (controller mention exists for cancel; confirm route later in Phase 2)

### Matches
- `GET /matches/recommended`
- `GET /matches`
- `PATCH /matches/:id` (status update)
- `GET /matches/:id/messages`

### Messages (REST)
- `POST /messages`
- `PUT /messages/:id/read`
- `DELETE /messages/:id`

### Sessions
- `GET /sessions`
- `GET /sessions/:id`
- `POST /sessions`
- `PUT /sessions/:id`
- `DELETE /sessions/:id`

### Exchanges
- `GET /exchanges`
- `GET /exchanges/:matchId` (match exchanges)
- `PUT /exchanges/:exchangeId/complete`
- `PUT /exchanges/:exchangeId/cancel`

### Ratings
- Rating controller enforces match membership + prevents duplicates and self-rating
- Completing ratings finalizes match status (as per discovered controller logic)

### Notifications
- `GET /notifications`
- `PUT /notifications/:id/read`
- `PUT /notifications/read/all`
- `GET /notifications/unread-count`

### Gamification
- `GET /gamification/stats`
- `POST /gamification/xp/award`
- `GET /gamification/xp/history`
- `POST /gamification/streak`
- `GET /gamification/leaderboard`

---

## Database Inventory (Prisma + MySQL)

- `User`
  - firebase_uid, email, password_hash (nullable), name, avatar
  - profile_completion, xp, is_verified, is_deleted, deleted_at
  - relations to skills, requests, matches, messages, ratings, achievements, notifications, sessions, streak

- `Skill`
  - name, category

- `UserSkill`
  - user_id, skill_id, skill_type (offer/want), proficiency_level
  - unique constraint: (user_id, skill_id, skill_type)

- `MatchRequest`
  - sender_id, receiver_id, skill_offered_id (nullable)
  - contains enum-ish relations to learner/match context (controller logic uses it as exchange precursor)

- `Match`
  - relates to user1/user2, messages, ratings, exchange completion

- `Message`
  - match_id, sender_id, content, is_read, created_at

- `Rating`
  - rated_user_id, rater_user_id, rating, comment, created_at
  - link to match_id (nullable, set null on delete)

- `Achievement`
  - user_id, type, title, description, unlocked_at

- `Notification`
  - user_id, type, title, message, data (Json?), is_read, created_at

- `Session`
  - teacher_id, learner_id, skill_id, status, scheduled_at, completed_at, created_at

- `Exchange`
  - status lifecycle (pending/active/completed/cancelled), completion/permissions enforced in controller

- `XPTransaction`, `Streak`
  - used in gamification stats/streak/level computations

> See `backend/prisma/schema.prisma` for exact schema fields and enums.

---

## Dependency Inventory (major)
- Runtime:
  - express, socket.io, cors, helmet, express-rate-limit, express-validator
  - firebase-admin, jsonwebtoken
  - prisma + @prisma/client
  - mysql2
  - multer
- Tooling/dev:
  - jest, ts-jest, supertest
  - eslint + @typescript-eslint
  - tsx / ts-node

---

## Security Observations

### Auth model
- Majority of REST endpoints use Firebase token verification middleware (`verifyFirebaseToken`).
- JWT middleware (`src/middleware/auth.ts`) exists but is not confirmed as primary in server wiring.

### Rate limiting
- Global rate limit applied to all routes.
- Stricter limiter for `/auth` endpoints.
- Socket.IO includes per-user rate limiting maps for messages and typing.

### Input validation
- express-validator is used in routes:
  - request body validation (content length, UUID params)
  - gamification XP award action/amount validation

### Soft-delete protection
- `requireActiveUser` middleware exists to block actions by `is_deleted` users (not confirmed wired everywhere; Phase 2 should verify route composition).

### CSP / security headers
- helmet used with CSP directives and connectSrc allowed for multiple localhost ports.

---

## Potential Technical Debt / Risks

1. **Frontend/Backend route mismatch (Critical)**
   - Frontend calls `POST /gamification/xp`
   - Backend defines `POST /gamification/xp/award`
   - Documented in `ISSUE_LOG.md`

2. **Messages REST path confusion (Medium)**
   - Frontend assumes `/matches/:id/messages` relative to axios config.
   - Backend effective path includes `/messages` mount.
   - Confirm axios base URL composition in `src/app/api/client.ts`.

3. **Incomplete endpoint confirmation**
   - Frontend expects `GET /matches/:id` (for `matchesApi.getMatchById`)
   - Not fully confirmed from `routes/matches.ts` during this pass.

4. **Mock-first UI behavior**
   - Some pages (Schedule/Messages) create mock sessions/events for immediate UI feedback.
   - This may diverge from backend state if API responses differ.

---

## Missing Documentation (discovered gaps)
- No single “brain” document exists yet (to be solved by Obsidian vault).
- Route definitions for some endpoints were inferred from controllers and not re-opened fully (e.g., rating routes, requests cancel route).
- No explicit event schema documentation for:
  - socket events names
  - DOM custom events (`session:created`, `session:updated`) used for cross-page sync

---

## Suggested Improvements

1. Add compatibility aliases / fix route mismatches:
   - align gamification XP endpoint (`/gamification/xp/award` vs `/gamification/xp`)

2. Centralize API route constants:
   - remove mixed usage of direct `fetch(API_BASE_URL + ...)` and axios.

3. Formalize event contracts:
   - document Socket.IO event payloads (typing, new_message, delivery/read, user_status)
   - document DOM custom event payloads for sessions.

4. Validate match/message route correctness:
   - ensure `getMatchById` and message fetching paths match backend mounts.

5. Consolidate auth strategy:
   - decide Firebase-only vs JWT usage and remove unused middleware or integrate consistently.

---
