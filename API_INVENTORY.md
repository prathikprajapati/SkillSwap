---
type: api-inventory
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - documentation
  - api-inventory
---

# API Inventory — SkillSwap

> Source of truth: discovered backend routes/controllers + frontend API modules.

## 0) Base URLs / Clients
- Backend: `skill_swap/backend` (Express, Socket.IO)
- Frontend uses:
  - `src/app/api/client.ts` (axios client) with `VITE_API_BASE_URL`
  - Some pages also call `fetch(`${API_BASE_URL}/...`)` directly (e.g., Dashboard, Profile, Exchanges, Schedule).

## 1) Auth APIs (Firebase)
### POST `/auth/firebase-login`
- **Backend**: `src/routes/auth.ts` → middleware `verifyFirebaseToken` → `firebaseLogin`
- **Auth**: Firebase ID token required in `Authorization: Bearer <idToken>`
- **Response**: user profile payload including offered/wanted skills.

### POST `/auth/firebase-signup`
- **Backend**: `src/routes/auth.ts` → middleware `verifyFirebaseToken` → `firebaseSignup`
- **Auth**: Firebase ID token required in `Authorization: Bearer <idToken>`
- **Body**: optional `name`
- **Response**: created/updated user payload.

**Frontend API**
- `src/app/api/auth.ts`
  - `firebaseLogin(idToken)` → POST `/auth/firebase-login`
  - `firebaseSignup(idToken, name?)` → POST `/auth/firebase-signup`

---

## 2) Users / Profile APIs
### GET `/users/me`
- **Backend**: `src/routes/users.ts` → `userController.getProfile`
- **Auth**: Firebase token required (routes use `verifyFirebaseToken`)
- **Purpose**: current user profile.

### PUT `/users/me`
- **Backend**: `src/routes/users.ts` → `userController.updateProfile`
- **Auth**: Firebase token required
- **Body**: name + avatar (avatar via upload middleware if configured)

### DELETE `/users/me`
- **Backend**: `src/routes/users.ts` → `userController.deleteAccount`
- **Auth**: Firebase token required
- **Side effects**: soft-delete user + cancels active matches.

### Avatar Upload
- **Backend**: `src/middleware/upload.ts`
- **Multer field**: `"avatar"`
- **Constraints**: image types only, max 5MB
- **Storage**: `uploads/avatars`

**Frontend API**
- `src/app/api/users.ts`
  - `getMe()` → GET `/users/me`
  - `updateMe(data)` → PUT `/users/me`

---

## 3) Skills APIs
### GET `/skills` (public)
- **Backend**: `src/routes/skills.ts` → `skillsController.getSkills`

### Profile skills (authenticated)
- **POST** `/users/me/skills` → addUserSkill
- **DELETE** `/users/me/skills/:skillId` → removeUserSkill
- **GET** `/users/me/skills` → getUserSkills

**Frontend API**
- `src/app/api/skills.ts`
  - `getAll()` → GET `/skills`
  - `addToProfile(data)` → POST `/users/me/skills`
  - `removeFromProfile(skillId)` → DELETE `/users/me/skills/:skillId`

---

## 4) Requests APIs (Match Requests)
### GET `/requests/incoming`
- **Backend**: `src/routes/requests.ts` → `requestsController.getIncoming`

### GET `/requests/sent`
- **Backend**: `src/routes/requests.ts` → `requestsController.getSent`

### POST `/requests`
- **Backend**: `requestsController.sendRequest`
- **Body**: `{ receiver_id }`

### PUT `/requests/:requestId/accept`
- **Backend**: `requestsController.acceptRequest`
- **Side effects**: creates/gets match + creates exchange transaction + notifications

### PUT `/requests/:requestId/reject`
- **Backend**: `requestsController.rejectRequest`

### PUT `/requests/:requestId/cancel` (controller mentioned; route not fully verified)
- **Backend**: `requestsController.cancelRequest` likely exists (not fully re-read during this pass)

**Frontend API**
- `src/app/api/requests.ts`
  - `getIncoming()` → GET `/requests/incoming`
  - `getSent()` → GET `/requests/sent`
  - `create({ receiver_id })` → POST `/requests`
  - `accept(requestId)` → PUT `/requests/:requestId/accept`
  - `reject(requestId)` → PUT `/requests/:requestId/reject`

---

## 5) Matches APIs
### GET `/matches/recommended`
- **Backend**: `src/routes/matches.ts` → `matchesController.getRecommendedMatches`
- **Auth**: Firebase token required
- **Response**: recommended matches + matchScore + isOnline + profile_completion.

### GET `/matches`
- **Backend**: `matchesController.getMyMatches`
- **Auth**: Firebase token required

### PATCH `/matches/:id`
- **Backend**: `matchesController.updateMatchStatus`
- **Purpose**: status transitions (active/completed/cancelled/archived)

### GET `/matches/:id/messages`
- **Backend**: `src/routes/messages.ts` + `messagesController.getMessages`
- **Auth**: Firebase token required

### GET `/matches/:id` (frontend expects)
- **Frontend**: `matchesApi.getMatchById` calls `GET /matches/${id}`
- **Backend**: **not confirmed** in server.ts wiring during current pass
  - Route may exist in `src/routes/matches.ts` or may be missing.

**Frontend API**
- `src/app/api/matches.ts`
  - `getRecommended()` → GET `/matches/recommended`
  - `getMyMatches()` → GET `/matches`
  - `getMatchById(id)` → GET `/matches/:id` (**needs backend confirmation**)

---

## 6) Messages APIs (REST)
> Messages routes mounted under `/messages` (per `server.ts` import & exports).

### GET `/messages/matches/:id/messages`? (actual path)
- Backend verified as: `src/routes/messages.ts`
  - route: `GET '/matches/:id/messages'` within `messagesRouter`
  - and `server.ts` mounts `app.use("/messages", messagesRouter)`  
  - **Therefore effective path**: `GET /messages/matches/:id/messages`

### POST `/messages`
- **Backend**: `messagesController.sendMessage`
- **Body**: `{ match_id, content }`

### PUT `/messages/:id/read`
- **Backend**: `messagesController.markMessageAsRead`
- **Purpose**: mark messages as read (non-sender only)

### DELETE `/messages/:id` (wired in server.ts via messagesRouter)
- Controller behavior present in earlier discovery (`deleteMessage`)

**Frontend API**
- `src/app/api/messages.ts`
  - `getByMatchId(matchId)` → GET `/matches/${matchId}/messages`
  - `send(data)` → POST `/messages`
  - `markAsRead(messageId)` → PUT `/messages/${messageId}/read`

✅ Note: Frontend’s `getByMatchId` path **does not include `/messages/` prefix**, so base client mounting in `apiClient` likely already prefixes `/messages`. Needs verification by inspecting `src/app/api/client.ts`.

---

## 7) Sessions APIs
### GET `/sessions`
- Backend: `sessionController.getMySessions`

### GET `/sessions/:id`
- Backend: `sessionController.getSession`

### POST `/sessions`
- Backend: `sessionController.createSession`
- Body includes: teacher_id/learner_id/skill_id/scheduled_at

### PUT `/sessions/:id`
- Backend: `sessionController.updateSession`

### DELETE `/sessions/:id`
- Backend: `sessionController.deleteSession`

**Frontend API**
- `src/app/api/sessions.ts`
  - `getMySessions()` → GET `/sessions`
  - `getSession(id)` → GET `/sessions/:id`
  - `createSession(data)` → POST `/sessions`
  - `updateSession(id, data)` → PUT `/sessions/:id`
  - `deleteSession(id)` → DELETE `/sessions/:id`

---

## 8) Exchanges APIs
### GET `/exchanges`
- Backend: `exchangesController.getUserExchanges`

### GET `/exchanges/:matchId`
- Backend: `exchangesController.getMatchExchanges`

### PUT `/exchanges/:exchangeId/complete`
- Backend: `exchangesController.completeExchange`

### PUT `/exchanges/:exchangeId/cancel`
- Backend: `exchangesController.cancelExchange`

**Frontend page**
- `src/app/pages/Exchanges.tsx`
  - `GET /exchanges`
  - `PUT /exchanges/:exchangeId/complete`

---

## 9) Ratings APIs (Reviews)
- Implemented via `ratingsController` (route file not re-opened during this pass, but server imports `./routes/ratings`).
- Behavior:
  - prevents self-rating
  - validates match is active + user membership
  - prevents duplicates
  - once both users rated: match status becomes completed
  - triggers achievements + notifications

**Frontend**
- Ratings pages were not read during this Phase 1 discovery pass, so no API module mapping yet.

---

## 10) Notifications APIs
### GET `/notifications`
- Backend: `notificationsController.getNotifications`

### PUT `/notifications/:id/read`
- Backend: `notificationsController.markNotificationAsRead`

### PUT `/notifications/read/all`
- Backend: `notificationsController.markAllNotificationsAsRead`

### GET `/notifications/unread-count`
- Backend: `notificationsController.getUnreadCount`

**Frontend**
- Notifications API module not read during this pass.

---

## 11) Gamification APIs (XP/streak/leaderboard)
### GET `/gamification/stats`
- Backend: `gamificationController.getUserStats`

### POST `/gamification/xp/award`
- Backend: `gamificationController.awardXP`
- Body is validated with express-validator (action, amount)

### GET `/gamification/xp/history`
- Backend: `getXPHistory`

### POST `/gamification/streak`
- Backend: `updateStreak`

### GET `/gamification/leaderboard`
- Backend: `getLeaderboard`

**Frontend mismatch risk**
- `src/app/api/gamification.ts`
  - `awardXP(action, amount)` calls **POST `/gamification/xp`**
  - but backend route is **`/gamification/xp/award`**
  - This should be corrected or confirmed.
