# CrypLift — Phase 3 Real-Time Chat & Collaboration Communication System

## Architecture Overview

The CrypLift Real-Time Chat System provides secure, real-time end-to-end messaging between Projects and Creators connected via active collaborations.

```
+-----------------------------------------------------------------------+
|                           CrypLift Platform                           |
+-----------------------------------------------------------------------+
|  Frontend (React + Vite)                                              |
|   ├── MessagesPage (/messages)                                        |
|   ├── ChatPanel, ConversationList, MessageBubble, MessageInput        |
|   └── Services: api.js (REST), socket.js (Socket.IO client)           |
+-----------------------------------------------------------------------+
                                  │
                  REST APIs (HTTP) │ Socket.IO (WebSockets)
                                  ▼
+-----------------------------------------------------------------------+
|  Backend (Express + Node.js + Socket.IO)                               |
|   ├── Auth Middleware (JWT Token Verification)                        |
|   ├── Controllers: chatController.js, applicationController.js        |
|   ├── Sockets: socketServer.js, chatSocket.js                         |
|   └── Models: Conversation.js, Message.js, Collaboration.js           |
+-----------------------------------------------------------------------+
                                  │
                                  ▼
                      MongoDB / Memory Store Fallback
```

---

## Database Models

### 1. Conversation (`backend/models/Conversation.js`)

Each collaboration automatically creates one primary conversation between the Project and the Creator.

- `participants`: Array of User ObjectIds (`[creatorId, projectId]`)
- `collaborationId`: ObjectId reference to `Collaboration` (Unique, Indexed)
- `campaignId`: ObjectId reference to `Campaign`
- `lastMessage`: String snippet of the latest message
- `lastMessageId`: ObjectId reference to latest `Message`
- `lastMessageAt`: Date timestamp of latest activity (Indexed)
- `createdAt`, `updatedAt`: Automatic timestamps

Indexes:
- `{ collaborationId: 1 }` (Unique index preventing duplicate conversations per collaboration)
- `{ participants: 1 }`
- `{ lastMessageAt: -1 }`

---

### 2. Message (`backend/models/Message.js`)

Persists individual chat messages between authorized conversation participants.

- `conversationId`: ObjectId reference to `Conversation` (Indexed)
- `senderId`: ObjectId reference to `User` (Indexed)
- `text` / `message`: String (Required, trimmed, maximum 2,000 characters)
- `messageType`: String enum (`'text'`, `'link'`)
- `isRead`: Boolean (Default: `false`, Indexed)
- `readAt`: Date timestamp when marked as read
- `createdAt`, `updatedAt`: Timestamps (Indexed)

Indexes:
- `{ conversationId: 1, createdAt: -1 }`
- `{ senderId: 1, createdAt: -1 }`
- `{ conversationId: 1, isRead: 1 }`

---

## Automatic Conversation Creation

When a Project accepts a Creator's application in `applicationController.js`:

1. Application status updates to `accepted`.
2. Active `Collaboration` document is created in MongoDB.
3. `ensureConversationExists({ collaborationId, campaignId, creatorId, projectId })` executes automatically.
4. Conversation document is created linking the Creator and Project as participants.
5. If a conversation already exists for the collaboration, the existing conversation is returned securely.

---

## REST APIs

All chat REST endpoints are protected with JWT authentication (`protect` middleware).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/conversations` | Create or retrieve conversation for `collaborationId` |
| `GET` | `/api/chat/conversations` | Get user's conversations with search, pagination, and unread counts |
| `GET` | `/api/chat/conversations/:id` | Get details for a specific conversation by ID or `collaborationId` |
| `GET` | `/api/chat/conversations/:id/messages` | Get paginated messages (Default: 30 per page, `?page=1&limit=30`) |
| `POST` | `/api/chat/conversations/:id/messages` | Send a message via REST fallback |
| `PUT` | `/api/chat/messages/:id/read` | Mark single message as read (`isRead: true`, `readAt: Date`) |
| `PUT` | `/api/chat/conversations/:id/read-all` | Mark all unread messages in conversation as read |

---

## Socket.IO Real-Time Events

Authenticated Socket connection reuses existing JWT socket authentication (`socketAuthMiddleware`).

### Client → Server Events

- `chat:join`: Join private conversation room (`conversation:<conversationId>`)
- `chat:leave`: Leave conversation room
- `chat:send`: Send message (`{ conversationId, text / message }`)
- `chat:typing`: Broadcast typing status (`{ conversationId, isTyping }`)
- `chat:read`: Broadcast read receipt (`{ conversationId }`)

### Server → Client Events

- `chat:message`: Broadcast saved message to room participants
- `chat:typing`: Live typing indicator signal (`"Creator is typing..."`)
- `chat:read`: Real-time read status update
- `chat:online`: Participant joined room / online indicator
- `chat:offline`: Participant left room / offline indicator

---

## Security & Authorization Rules

1. **Strict Participant Access**: Non-participants attempting to view messages, send messages, join room, or mark read receive `403 Forbidden`.
2. **Strict Room Scoping**: Users cannot arbitrarily join Socket.IO rooms. Room joins verify database permissions.
3. **Input Validation**: Empty messages or messages exceeding 2,000 characters are rejected with `400 Bad Request`.
4. **Rate Limiting**: REST message creation uses rate limiting (`chatMessageLimiter`) to prevent spam/abuse.
5. **Read-Only Enforcements**: If a collaboration status is `completed` or `cancelled`, chat becomes read-only.

---

## Notification Integration

When a message is sent via Socket or REST:
- If the recipient is **not currently active in the room**, a persistent MongoDB notification is created (`createAndEmitNotification`) with type `chat:new_message` (or `message`).
- Real-time `notification:new` socket event is dispatched to the recipient's private user room (`user:<recipientId>`).
- If the recipient is active inside the chat room, redundant notifications are avoided.

---

## Pagination & Performance

- Message listings support cursor/page pagination using `?page=X&limit=30`.
- Fast MongoDB queries leverage composite index `{ conversationId: 1, createdAt: -1 }`.
- Unread counts are computed per conversation for optimal sidebar rendering.

---

## Testing & Verification

Run tests:

```bash
# Run Phase 3 Real-time Chat Test Suite
npm run test:phase3

# Run All System Test Suites
npm run test:api
npm run test:flow
npm run test:prod
npm run test:realtime
npm run test:phase3

# Validate Frontend Production Build
npm run build
```

---

## Frontend Integration & Usage

1. **Dashboard Collaboration Integration**: Clicking **"Open Chat"** on any collaboration card navigates to `/messages?conversation=<id>`.
2. **Messages View**: `/messages` renders `MessagesPage` featuring responsive dual-pane desktop layout and single-pane mobile layout with back button navigation.
3. **Socket Lifecycle**: Connects automatically on login via `AuthContext.jsx` and disconnects cleanly on logout without creating duplicate socket instances.
