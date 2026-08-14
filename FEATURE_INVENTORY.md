---
type: feature-inventory
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - documentation
  - feature-inventory
---

# Feature Inventory — SkillSwap

## 1. Authentication & Identity (Firebase-first)
- **Backend**
  - Firebase ID token verification creates/updates `User` in MySQL via `verifyFirebaseToken`.
  - **Endpoints**
    - `POST /auth/firebase-login`
    - `POST /auth/firebase-signup`
- **Frontend**
  - `AuthContext` (Firebase `onAuthStateChanged`) keeps a cached user in `localStorage`.
  - Protected routes block UI until user is loaded.

**Wiki links**
- [[Authentication Flow]]

---

## 2. User Profile
- **Backend**
  - Get current user profile: `GET /users/me`
  - Update name + avatar: `PUT /users/me`
  - Soft delete account: `DELETE /users/me`
  - Avatar upload uses `multer`:
    - only images allowed
    - max size 5MB
    - stored under `uploads/avatars`
- **Frontend**
  - `Profile.tsx` calls:
    - `GET /users/me`
    - `GET /users/me/skills`
  - Update flow exists in `usersApi.updateMe` (name/avatar fields).

---

## 3. Skills (Catalog + Profile Skills)
- **Backend**
  - Public catalog: `GET /skills`
  - Profile mutations:
    - `POST /users/me/skills`
    - `DELETE /users/me/skills/:skillId`
    - `GET /users/me/skills`
- **Frontend**
  - `skillsApi.getAll()`, `addToProfile()`, `removeFromProfile()`

---

## 4. Matching: Requests → Matches
### 4.1 Match Requests (Invite Flow)
- **Backend**
  - Incoming: `GET /requests/incoming`
  - Sent: `GET /requests/sent`
  - Send new request: `POST /requests`
  - Accept: `PUT /requests/:id/accept`
  - Reject: `PUT /requests/:id/reject`
  - (Controller mentions cancel behavior; exact route was not fully re-opened during discovery.)
- **Business side effects**
  - Accept creates/gets a `Match` and creates an `Exchange` record in a transaction.
  - Notifications are created internally via `notificationService`.

### 4.2 Matches + Recommendations
- **Backend**
  - Recommended matches: `GET /matches/recommended`
    - scored based on mutual offer/want overlap + profile completion (per controller logic)
  - List my matches: `GET /matches`
  - Update match status: `PATCH /matches/:id` (status transitions)
  - Messages per match: `GET /matches/:id/messages`
- **Frontend**
  - `matchesApi.getRecommended()` → `/matches/recommended`
  - `matchesApi.getMyMatches()` → `/matches`

---

## 5. Messaging (REST + Socket.IO)
### 5.1 REST Message APIs
- **Backend**
  - List messages in a match: `GET /messages/matches/:id/messages` (actual server path verified via routes)
  - Send message: `POST /messages`
  - Mark read: `PUT /messages/:id/read`
  - Delete: `DELETE /messages/:id` (wired in server under messagesRouter, controller read during discovery)

### 5.2 Real-time Chat (Socket.IO)
- **Backend**
  - Socket auth verifies Firebase ID token in `socket.handshake.auth.token` or query token.
  - Broadcasts online/offline status per match room `match:<matchId>`.
  - Enforces rate limits for:
    - message send events
    - typing indicator events
- **Frontend**
  - `chatSocketHandler.ts` manages:
    - connect/disconnect
    - join match rooms
    - message events lifecycle (`new_message`, delivered/read, typing)
  - `chatStore.ts` (Zustand):
    - optimistic message sending
    - deduplication via `id || tempId`
    - read receipt state updates

**Wiki links**
- [[Request Lifecycle]] (link to create/send/read in chat context)

---

## 6. Sessions (Skill Exchange Sessions / Teaching)
- **Backend**
  - List my sessions: `GET /sessions`
  - Get session by id: `GET /sessions/:id`
  - Create session: `POST /sessions`
  - Update session: `PUT /sessions/:id`
  - Delete: `DELETE /sessions/:id`
  - Permission logic:
    - teacher/learner membership checks
    - status scheduling rules and timestamps for completion
- **Frontend**
  - `sessionsApi.*` powers `Schedule.tsx`

---

## 7. Exchanges (Post-accept transactional learning state)
- **Backend**
  - `GET /exchanges` (user exchanges)
  - `GET /exchanges/:matchId` (match exchanges)
  - `PUT /exchanges/:exchangeId/complete`
  - `PUT /exchanges/:exchangeId/cancel`
- **Frontend**
  - `Exchanges.tsx` uses:
    - `GET /exchanges`
    - complete via `/exchanges/:exchangeId/complete`

---

## 8. Reviews / Ratings
- **Backend**
  - Rating creation and retrieval:
    - duplicates prevented
    - self-review prevented
    - match must be active + user must be participant
  - Once both users rated:
    - match status becomes `completed`
    - achievements/notifications may trigger
- **Frontend**
  - Ratings UI pages were not read during Phase 1 discovery (ratings API existence inferred from backend controllers/routes discovered earlier).

---

## 9. Notifications
- **Backend**
  - List: `GET /notifications`
  - Mark single: `PUT /notifications/:id/read`
  - Mark all: `PUT /notifications/read/all`
  - Unread count: `GET /notifications/unread-count`
- **Internal creation**
  - `notificationService` supports event-style helpers:
    - match request / accepted
    - new message preview
    - achievement unlock
    - XP earned
    - rating received

---

## 10. Gamification (XP, streaks, leaderboard, achievements)
- **Backend**
  - `GET /gamification/stats`
  - `POST /gamification/xp/award`
  - `GET /gamification/xp/history`
  - `POST /gamification/streak`
  - `GET /gamification/leaderboard`
- **Achievement service**
  - `achievementService.processAchievementTrigger()` is fire-and-forget
  - trigger types:
    - match complete
    - skill added
    - rating submitted
    - verification
    - XP threshold
- **Frontend**
  - `gamificationApi` calls `POST /gamification/xp` for awarding XP (**mismatch flagged in ISSUE_LOG.md**)

---

## 11. Authorization Layers
- **Backend**
  - Firebase ID token required for most routes (`verifyFirebaseToken`).
  - JWT middleware (`authenticateToken`, `requireActiveUser`) exists but is not clearly wired in `server.ts`.
- **Frontend**
  - `ProtectedRoute` blocks if `AuthContext.user` is not present.

---

## 12. Feature Inventory Gaps (known pending)
- Some frontend pages/APIs were not fully read during this discovery pass:
  - `BrowseSkills`, `CreateSkill`, `Settings` sections/pages
  - `chat/chatStore.ts` was read; `chatSocketHandler.ts` was discovered earlier but some internal event mapping still needs confirmation against backend event names.
