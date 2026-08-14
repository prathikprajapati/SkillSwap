---
type: issue-log
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - documentation
  - issue-log
---

# Issue Log — SkillSwap (Discovery Phase 1)

## 1) Endpoint mismatches (Frontend ↔ Backend)

### 1.1 Gamification XP award route mismatch (High)
- **Backend route (verified):** `POST /gamification/xp/award`  
  - File: `skill_swap/backend/src/routes/gamification.ts`
- **Frontend call (verified):** `POST /gamification/xp`  
  - File: `SkillSwapFrontEnd/src/app/api/gamification.ts` → `awardXP()`

**Impact:** XP awarding from frontend will fail unless there is an additional backend route.
**Action:** Align frontend URL with backend route or add backend redirect alias.

---

### 1.2 Messages route shape ambiguity (Medium)
- Backend message route file defines: `GET /matches/:id/messages` inside `messagesRouter`.
- Backend mounts: `app.use("/messages", messagesRouter)` (in `server.ts`).
- Therefore effective GET path is: `GET /messages/matches/:id/messages`.

Frontend `messagesApi.getByMatchId(matchId)` calls:
- `GET /matches/${matchId}/messages` (no `/messages` prefix inside the function)
- Assumes axios client `apiClient` base URL/prefix already includes `/messages`.

**Impact:** Can lead to double `/messages` or missing `/messages` depending on axios client config.
**Action:** Verify `src/app/api/client.ts` base URL/prefix behavior.

---

### 1.3 Frontend expects `GET /matches/:id` (Medium)
- Frontend `matchesApi.getMatchById(id)` calls: `GET /matches/${id}`.
- During current discovery pass, backend `server.ts` wiring confirmed `/matches` import, and matches recommendations/list/status update, plus messages-per-match.
- `GET /matches/:id` existence was **not fully confirmed**.

**Impact:** If missing, any page using `getMatchById` will break.
**Action:** Verify `skill_swap/backend/src/routes/matches.ts` includes `GET /:id`.

---

## 2) Frontend logic gaps / mock fallbacks (Medium)

### 2.1 Multiple pages rely on mock data/events (Non-production behavior)
Examples found during page reads:
- `Profile.tsx`: other-user profiles explicitly “not yet implemented”
- `Messages.tsx`: `/meet` command opens modal and creates **mock sessions + mock system message**; emits custom `session:created` event
- `Schedule.tsx`: on meeting submission, tries `sessionsApi.createSession(mockSession)` but often falls back to mock data and uses the same `session:created` event
- `Exchanges.tsx`: UI normalizes fields but doesn’t guarantee backend response contract

**Impact:** Feature correctness may depend on backend maturity; state/event contracts may diverge.
**Action:** Decide on “source of truth” for sessions:
- either real API-first (with proper backend endpoints & response shape),
- or formalize mock/event-based flows for MVP and document it clearly.

---

## 3) Authorization & security observations (Potential / needs verification)

### 3.1 JWT middleware exists but may not be used
- Backend has `src/middleware/auth.ts` with `authenticateToken` and `requireActiveUser`.
- Most REST routes are using Firebase token middleware (`verifyFirebaseToken`).
- JWT middleware is not confirmed as wired into `server.ts` route stack.

**Risk:** dead/unused code or incomplete auth patterns (JWT vs Firebase).
**Action:** Confirm intended auth strategy and remove/route JWT middleware accordingly.

---

## 4) Remaining unknowns (Discovery gaps)
Because discovery was incomplete for some components during this pass, confirm later in Phase 2:
- Backend notification creation call-sites inside `requestsController`, `messagesController`, ratings/match completion, etc. (partially discovered via services, not every controller call re-opened)
- Ratings route file contents (controllers discovered; routes file partially inferred)
- Exact route inventory for `/requests/:id/cancel` (controller exists per earlier notes; route file not fully re-opened in this pass)
- `chat/chatStore.ts` and `chatSocketHandler.ts` event name alignment with backend Socket.IO event names (some inferred; needs confirmation)

## 5) Suggested cleanup candidates (Low)
- If frontend uses custom DOM events (`session:created`, `session:updated`) for cross-page sync, document event payload schemas and ensure no name collisions.
- Ensure axios base client pathing is consistent to prevent accidental `/matches/...` vs `/messages/matches/...` mismatches.
