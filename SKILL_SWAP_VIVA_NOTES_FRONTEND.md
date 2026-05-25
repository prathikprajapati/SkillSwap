# SkillSwap (Frontend: `SkillSwapFrontEnd`) — Viva Notes

## 1. What this frontend does
`SkillSwapFrontEnd` is a **React + TypeScript + Vite** application that provides UI for:
- Authentication (Firebase)
- Dashboard, matches, requests, profile/settings, skills browsing
- **Real-time match chat** using **Socket.IO**

The frontend’s most viva-relevant part is the chat subsystem:
- connects to backend using Firebase token
- renders messages optimistically and reconciles with server events
- shows typing indicators + online/offline presence
- updates read receipts
- syncs chat history after reconnect

---

## 2. Tech stack (frontend)
- **React** + **TypeScript**
- **Vite** (dev server + build)
- **Socket.IO client** (`socket.io-client`)
- **Zustand** for chat state management
- **Axios** for REST calls

---

## 3. Key architecture
### 3.1 Chat API vs Socket (why both exist)
- **REST (`chatApi.ts`)** is used for:
  - loading message history (paginated)
  - fallback operations (e.g., mark read / send message if socket not available)
- **Socket (`chatSocketHandler.ts`)** is used for:
  - real-time streaming of messages & events
  - optimistic UI reconciliation
  - sync-after-reconnect

---

## 4. Where chat logic lives
### 4.1 Types / state shape: `src/chat/chatStore.ts`
This file defines:

#### Types
- `MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'`

- `Message` interface:
  - `id?: string` and `tempId?: string` (optimistic UI)
  - `matchId`, `senderId`, `senderName`, `content`
  - `createdAt: Date`
  - `status: MessageStatus`
  - `isMe: boolean`

- `Conversation` interface:
  - `matchId`, `userId`, `name`, `avatar`
  - `lastMessage`, `lastMessageTime`
  - `unread: number`
  - `online: boolean` (updated via socket)

#### Zustand store actions
Examples (viva-important):
- `addMessage(message)` with **deduplication** by key (`id || tempId`)
- `updateMessage(tempId, serverMessage)` to replace optimistic message with server message id
- `markMessageAsDelivered(messageId)`
- `markMessagesAsRead(matchId, lastReadMessageId?)` (updates read status in memory)
- `setTyping(matchId, userId, userName, isTyping)`
- `setOnlineStatus(userId, isOnline)` updates conversations

---

## 5. Socket.IO client implementation
### 5.1 Socket handler: `src/chat/chatSocketHandler.ts`
This module is responsible for creating the socket connection and wiring all socket events.

#### Connection
- Backend URL:
  - `VITE_BACKEND_URL` else `http://localhost:3000`
- `connectSocket(token)` uses:
  - `auth: { token }` (Firebase id token)
  - transports: `['websocket', 'polling']`
  - reconnection settings (attempts, delay, timeout)

#### Socket lifecycle events
- `connect`
  - sets store flag `isConnected=true`
  - resets reconnect attempts
  - if `currentMatchId` exists, emits `join_match`

- `disconnect`
  - sets `isConnected=false`

- `connect_error`
  - increments attempts
  - after max attempts → sets disconnected state

---

## 6. Socket events: definitions & handling
### 6.1 `new_message`
Frontend receives server-created message and:
- converts backend payload → `Message` format
- calls `useChatStore.getState().addMessage(formattedMessage)`

Mapping highlights:
- `createdAt: new Date(message.created_at)`
- `senderName/avatar` from `message.sender`
- `status: 'sent'`
- `isMe: false` for received messages

### 6.2 Optimistic reconciliation: `message_sent`
Purpose: confirm that the optimistic message was persisted.
- Frontend listens to:
  - `message_sent { messageId, tempId }`
- It finds the optimistic entry using `tempId` in the Zustand `messages` map.
- Calls `updateMessage(tempId, { ...optimisticMessage, id: messageId, status: 'sent' })`

**Viva line:** `tempId` allows instant UI while backend assigns the real DB `messageId`.

### 6.3 Delivery receipts: `message_delivered`
- Payload: `{ messageId }`
- Store action: `markMessageAsDelivered(messageId)`
- Only updates status if it was still `'sent'` (prevents status downgrade).

### 6.4 Read receipts: `message_read`
- Payload: `{ matchId, readBy, lastReadMessageId?, count? }`
- Calls: `markMessagesAsRead(matchId, lastReadMessageId)`

### 6.5 Typing indicators: `typing`
- Payload: `{ userId, userName, isTyping }`
- Uses current match id to store typing user:
  - `setTyping(currentMatchId, data.userId, data.userName, data.isTyping)`

### 6.6 Online/offline presence
- `user_status`: `{ userId, isOnline }`
  - updates conversation via `setOnlineStatus(userId, isOnline)`
- `online_status_list`: bulk initial data
  - loops and applies `setOnlineStatus` for each user

### 6.7 Sync after reconnect: `sync_response`
- Backend sends `{ matchId, messages }`
- Frontend maps to `Message` objects and calls:
  - `setMessages(matchId, formattedMessages)`

---

## 7. REST API for chat (frontend)
### 7.1 File: `src/chat/chatApi.ts`
Uses an Axios instance with:
- `baseURL: VITE_BACKEND_URL`

#### `getConversations()`
- calls `GET /matches`
- transforms match payload into `Conversation`
- supports fallback mock data when network fails (useful for demo stability)

#### `getMessages(matchId, cursor?, limit=20)`
- calls `GET /matches/:matchId/messages`
- handles pagination cursor
- maps backend message fields → `Message`

#### `markAsRead(matchId, messageId?)`
- calls `PUT /messages/:id/read` (batch or single depending on backend usage)

#### `sendMessageApi(matchId, content)`
- calls `POST /messages`

---

## 8. Token-based socket authentication (frontend)
### 8.1 Socket provider: `src/contexts/SocketContext.tsx`
This context ensures the socket is created only when a user is logged in.

Flow:
1. Uses `useAuth()` to check `user` existence.
2. If authenticated:
   - gets Firebase id token via `auth.currentUser.getIdToken()`
   - calls `connectSocket(idToken)`
   - keeps local `isConnected` in sync by listening to socket `connect/disconnect`
3. If user is not authenticated:
   - disconnects socket and clears connection state

---

## 9. Viva: common implementation explanations
- **Why Zustand store?**
  - Centralizes chat state and provides simple actions that socket event handlers can call without prop drilling.

- **Why optimistic UI?**
  - User experience: message appears immediately, then updates/reconciles when backend confirms.

- **How are duplicates avoided?**
  - Store uses `messages.has(key)` where key is `id || tempId`.

- **How does reconnect avoid losing messages?**
  - On reconnect, socket `connect` triggers `join_match`.
  - Frontend can call `syncMessages(matchId, lastMessageId)`; backend returns messages newer than the last known message.

---

## 10. Quick mapping: Frontend socket events ↔ Backend socket events
Backend emits → Frontend handles:
- `new_message` → add message to store
- `message_sent` → replace tempId entry with real id
- `message_delivered` → delivered status update
- `typing` → typingUsers map update
- `message_read` → markMessagesAsRead in store
- `user_status` / `online_status_list` → update conversation online flags
- `sync_response` → full chat history replacement

---

## 11. Files to mention in viva
Frontend chat-related files:
- `SkillSwapFrontEnd/src/chat/chatSocketHandler.ts`
- `SkillSwapFrontEnd/src/chat/chatStore.ts`
- `SkillSwapFrontEnd/src/chat/chatApi.ts`
- `SkillSwapFrontEnd/src/contexts/SocketContext.tsx`

---

## 12. Demo script (viva-friendly)
1. Login with Firebase auth on frontend.
2. Confirm socket connects (presence/console log).
3. Go to a match chat.
4. Send a message:
   - optimistic message appears
   - later reconciles using `message_sent`
5. Type to show typing indicator.
6. Read receipts:
   - mark as read / see status change from socket `message_read`.
7. Refresh/reconnect:
   - reopen chat and ensure history sync works via `sync_messages/sync_response`.

