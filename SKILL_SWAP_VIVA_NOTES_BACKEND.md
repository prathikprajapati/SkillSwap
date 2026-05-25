# SkillSwap (Backend: `skill_swap`) — Viva Notes

## 1. What this backend does
`skill_swap` is a **Node.js + Express + Socket.IO + Prisma** backend that powers:
- **Authentication** using **Firebase ID tokens** (admin verification)
- **User** and other domain CRUD (matches, messages, requests, skills, etc.)
- **Real-time chat** for match-based conversations using **Socket.IO**

### Main features (viva-ready)
- REST APIs for fetching/sending messages (used for pagination / fallback)
- Socket.IO events for:
  - join/leave match chat rooms
  - send/receive messages in real-time
  - optimistic UI reconciliation (`tempId` → `messageId`)
  - typing indicators
  - online/offline presence
  - read receipts
  - sync messages on reconnect

---

## 2. Tech stack & core dependencies
- **Express**: HTTP server + REST endpoints
- **Socket.IO**: WebSocket-like real-time channel
- **Prisma**: ORM layer (DB schema/models)
- **Firebase Admin SDK**: verifies `idToken` and maps it to DB users
- **Helmet + express-rate-limit**: security and abuse protection
- **express-validator**: request validation for REST routes

---

## 3. Project entry points (where things start)
### 3.1 `server.ts` (Express app bootstrap)
File: `skill_swap/backend/src/server.ts`
Key responsibilities:
1. Loads env vars with `dotenv.config()`
2. Creates `httpServer = createServer(app)`
3. Adds middlewares:
   - **Helmet** (security headers + CSP)
   - **rate limiting** (global + stricter for `/auth`)
   - **JSON body parsing**
   - **basic input sanitization** to reduce XSS (removes script tags / event handlers)
4. Mounts routes:
   - `/skills`, `/users`, `/matches`, `/sessions`, `/requests`, `/messages`, `/gamification`, `/ratings`, `/notifications`, `/exchanges`
5. Initializes Socket.IO:
   - `const io = initializeSocket(httpServer);`
6. Starts listening on `PORT` (skipped in test mode unless `FORCE_START_SERVER=true`)

### Viva question: “Why Socket.IO is initialized in `server.ts`?”
Because Socket.IO needs the same `httpServer` instance created by Express to attach WebSocket transport.

---

## 4. Socket.IO Implementation (real-time chat)
### 4.1 File: `socket.ts`
File: `skill_swap/backend/src/socket.ts`

#### Core types and state
- **AuthenticatedSocket**: extends `Socket` with:
  - `userId?: string`
  - `userName?: string`

- **connectedUsers**: `Map<userId, socketId>`
  - enables online/offline presence

- **Rate limiting maps**
  - `messageRateLimits`: user message rate (10 per minute)
  - `typingRateLimits`: user typing rate (5 per second)

- **typingTimeouts**: `Map<socketId, timeout>`
  - controls auto-expire typing state after a few seconds

---

## 5. Socket authentication (very important for viva)
### 5.1 `io.use(...)` middleware
Within `initializeSocket`, Socket.IO uses an auth middleware:
1. Reads token from:
   - `socket.handshake.auth.token` OR `socket.handshake.query.token`
2. If missing → error `Authentication error: No token provided`
3. Verifies token:
   - `auth.verifyIdToken(token)` (Firebase Admin)
4. Fetches user from DB:
   - `prisma.user.findUnique({ where: { firebase_uid: decodedToken.uid } })`
5. If not found or user is deleted → reject
6. Stores values in socket:
   - `socket.userId`, `socket.userName`

**Viva points**
- Why handshake auth? Socket.IO supports attaching auth data before connecting.
- Ensures only authenticated users can join match rooms / send messages.

---

## 6. Socket events: definitions, behavior, types

### 6.1 `join_match(matchId)`
**Purpose:** allow private messaging within a match.
- Verifies socket user belongs to the match:
  - checks `match.user1_id` or `match.user2_id`
- Joins Socket.IO room:
  - `socket.join(\`match:${matchId}\`)`
- Emits to other participant:
  - `user_joined` with `{ userId, userName, matchId }`

### 6.2 `leave_match(matchId)`
- `socket.leave(\`match:${matchId}\`)`
- Notifies other user:
  - `user_left`

---

### 6.3 `typing({ matchId, isTyping })`
**Purpose:** typing indicator in match room.
- Uses **rate limiting** (5 events/sec)
- Broadcasts to room:
  - `socket.to(\`match:${matchId}\`).emit('typing', { userId, userName, isTyping })`
- If `isTyping=true`, sets timeout to auto-send `isTyping=false` after **3 seconds**.

---

### 6.4 `send_message({ matchId, content, tempId? })`
**Purpose:** create message in DB + broadcast to match participants.

Flow:
1. Ensure `socket.userId` exists
2. Rate limit:
   - 10 messages per minute per user
3. Validate content:
   - trim
   - reject empty
   - enforce max length (5000)
4. Ensure user is part of match
5. Create message in DB:
   - `prisma.message.create({ data: { match_id, sender_id, content }, include sender })`
6. Broadcast to room:
   - `io.to(\`match:${matchId}\').emit('new_message', message)`
7. Optimistic reconciliation:
   - `socket.emit('message_sent', { messageId: message.id, tempId: data.tempId })`
8. Delivery notification:
   - if other user is online and in the room, emit `message_delivered`

**Viva points**
- `tempId` enables **optimistic UI**: frontend can show message immediately, then replace/update when server confirms.
- Delivery is conditional on recipient being connected and in that match room.

---

### 6.5 `mark_read({ matchId, lastReadMessageId?, messageId? })`
**Purpose:** read receipts.

Two modes:
1. **Batch mode** (newer):
   - if `lastReadMessageId` provided
   - find `created_at` of lastReadMessageId
   - update many messages:
     - same match
     - sender is not current user
     - `is_read=false`
     - `created_at <= lastMessage.created_at`
   - then broadcast `message_read`

2. **Single mode** (legacy/backward compatibility):
   - if `messageId` provided
   - ensure message belongs to match
   - do not mark own messages as read

Broadcast:
- `io.to(\`match:${matchId}\`).emit('message_read', { matchId, readBy: socket.userId, lastReadMessageId, count })`

---

### 6.6 `sync_messages({ matchId, lastMessageId? })`
**Purpose:** sync message history after reconnect.
- Validate user is part of match
- If `lastMessageId` exists:
  - query messages with `created_at > lastMessage.created_at`
- Else:
  - return last 20 messages
  - reverse to ascending order
- Emits:
  - `socket.emit('sync_response', { matchId, messages })`

---

### 6.7 `get_online_status()`
**Purpose:** initial presence data.
- finds all matches for user
- determines other user per match and whether they exist in `connectedUsers`
- emits:
  - `online_status_list`

---

### 6.8 `disconnect`
- removes user from `connectedUsers` and rate limit maps
- clears typing timeout
- broadcasts user offline status via `broadcastUserStatus(io, userId, false)`

---

## 7. Helper functions
### `broadcastUserStatus(io, userId, isOnline)`
- Finds all matches where `userId` participates
- For each match room, emits:
  - `user_status: { userId, isOnline, otherUserId }`

### `getConnectedUsersCount()` / `isUserOnline(userId)`
- Used for debugging/monitoring

### `disconnectUserById(io, userId)`
- For account deletion flow.
- Forces socket disconnect and emits `account_deleted`.

---

## 8. REST API: message routes (for viva)
### 8.1 File: `routes/messages.ts`
All routes require Firebase auth:
- `router.use(verifyFirebaseToken)`

Endpoints:
1. `GET /messages/:id/messages` (path actually `/matches/:id/messages`)
   - `getMessages`
   - validates `param('id').isUUID()`
2. `POST /messages` (send message)
   - validates:
     - `match_id` UUID
     - `content` length 1..1000
   - controller `sendMessage`
3. `PUT /messages/:id/read` (mark read)
   - validates message id UUID
   - controller `markMessageAsRead`

---

## 9. REST controllers (message behavior)
### 9.1 `messagesController.ts`
Main functions:

#### `getMessages(req, res)`
- user must be authenticated (`req.user?.id`)
- match must exist
- user must be participant of match
- returns paginated messages:
  - sorted by `created_at asc`
  - includes `sender` (id, name, avatar)

#### `sendMessage(req, res)`
- validate request with `validationResult`
- user must be participant of match
- create message with:
  - `match_id`, `sender_id`, `content`

#### `markMessageAsRead(req, res)`
- message must exist and belong to match participants
- block marking **own** message as read:
  - if `message.sender_id === userId` → 403

---

## 10. Firebase auth middleware (REST)
### File: `middleware/firebaseAuth.ts`
`verifyFirebaseToken`:
1. Reads `Authorization: Bearer <token>`
2. Verifies using Firebase Admin:
   - `auth.verifyIdToken(token)`
3. Maps Firebase user to DB user:
   - looks up by `firebase_uid`
   - if missing, attempts create:
     - uses token name/email/picture as fallback
4. Attaches `req.user = { id, firebaseUid, email }`
5. Calls `next()`

**Viva notes**
- Same concept for Socket.IO auth, but stored on `socket` instead of `req`.

---

## 11. Security & performance decisions (good viva points)
- **Helmet**: security headers + CSP
- **Rate limiting**:
  - global limiter
  - stricter auth limiter
  - socket-specific limits for `typing` and `send_message`
- **Input sanitization**: removes scripts/event handlers from JSON body
- **Authorization checks**:
  - match membership verification for join/sending/sync/read

---

## 12. Common viva questions (quick answers)
- **Q:** Why rooms `match:${matchId}`?
  - **A:** isolates messages per match and ensures only participants receive events.

- **Q:** How does optimistic UI work here?
  - **A:** frontend sends `tempId`, backend confirms via `message_sent` with real `messageId`, frontend replaces temp entry.

- **Q:** How do typing indicators stop automatically?
  - **A:** server broadcasts typing state and uses a timeout to auto-expire after ~3 seconds.

- **Q:** How is reconnect handled?
  - **A:** frontend emits `sync_messages`; backend returns messages newer than `lastMessageId` (or last 20 by default).

- **Q:** How do read receipts avoid cheating?
  - **A:** server checks match membership and blocks marking own messages as read.

---

## 13. Where to look in code (viva checklist)
Backend files to mention:
- `skill_swap/backend/src/server.ts` (Express bootstrapping)
- `skill_swap/backend/src/socket.ts` (Socket.IO events + auth + rate limiting)
- `skill_swap/backend/src/routes/messages.ts` (message REST routes)
- `skill_swap/backend/src/controllers/messagesController.ts` (message controller logic)
- `skill_swap/backend/src/middleware/firebaseAuth.ts` (Firebase token verification)

