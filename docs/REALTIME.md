# CrypLift Real-Time Architecture & Notification System

Production-ready real-time communication and notification framework for CrypLift using **Socket.IO** and **MongoDB**.

---

## 1. Socket.IO Architecture

CrypLift integrates Socket.IO with the existing Express HTTP server in `backend/server.js`:

```text
Backend:
├── server.js                        # Initializes HTTP & Socket.IO server
├── sockets/
│   ├── socketAuth.js                # Handshake JWT authentication middleware
│   └── socketServer.js              # Socket server & notification emission helper
├── models/
│   └── Notification.js              # Mongoose model for persistent notifications
├── controllers/
│   └── notificationController.js    # REST endpoints for notification management
└── routes/
    └── notificationRoutes.js        # Mounted under /api/notifications
```

---

## 2. JWT Socket Authentication

Socket authentication uses the existing JWT system:

1. The frontend socket client connects passing `auth: { token: "Bearer <jwt>" }`.
2. `socketAuthMiddleware` verifies the JWT signature against `process.env.JWT_SECRET`.
3. Unauthenticated or invalid token handshakes are rejected immediately.
4. On success, user claims (`socket.user = { _id, role }`) are attached to the socket instance.

---

## 3. User Rooms

Upon successful connection, each user automatically joins a private user room:

```text
user:{userId}
```
Example: `user:66f1c4e97a2e8b0012345678`

This guarantees targeted, private real-time delivery. Users cannot listen to or inspect another user's room.

---

## 4. Real-Time Events & Payloads

| Event Name | Trigger Context | Recipient | Payload Details |
| :--- | :--- | :--- | :--- |
| `application:new` | Creator applies to campaign | Campaign Owner (Project) | `{ applicationId, campaignId, creatorId, creatorName, campaignTitle, message, createdAt }` |
| `application:accepted` | Project accepts creator application | Applicant (Creator) | `{ applicationId, campaignId, projectId, projectName, campaignTitle, collaborationId }` |
| `application:rejected` | Project rejects creator application | Applicant (Creator) | `{ applicationId, campaignId, projectId, projectName, campaignTitle }` |
| `collaboration:created` | Application accepted & collaboration initialized | Both Creator & Project | `{ collaborationId, campaignId, creatorId, projectId, status: 'active' }` |
| `collaboration:updated` | Progress or performance metrics update | Both Participants | `{ collaborationId, status, progress, performanceMetrics, updatedAt }` |
| `notification:new` | Any new notification generated | Target Recipient | Complete `Notification` document payload |

---

## 5. Notification Model & Database Schema

Notifications are persisted server-side in MongoDB via `Notification.js`:

```javascript
{
  recipientId: { type: ObjectId, ref: 'User', required: true, index: true },
  type: String, // 'application:new', 'application:accepted', etc.
  title: String,
  message: String,
  relatedId: ObjectId || null,
  relatedType: String || null, // 'Campaign', 'Application', 'Collaboration'
  isRead: { type: Boolean, default: false, index: true },
  createdAt: Date
}
```

### Database Indexing
- `{ recipientId: 1, createdAt: -1 }`
- `{ recipientId: 1, isRead: 1 }`
- `{ createdAt: -1 }`

---

## 6. REST Notification APIs

All notification endpoints require JWT authorization (`protect` middleware):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notifications?page=1&limit=20` | Returns paginated notifications for logged-in user |
| `GET` | `/api/notifications/unread-count` | Returns `{ success: true, unreadCount }` |
| `PUT` | `/api/notifications/:id/read` | Marks single owned notification as read |
| `PUT` | `/api/notifications/read-all` | Marks all notifications of user as read |

---

## 7. Frontend Integration

1. **Shared Singleton (`src/services/socket.js`)**:
   - Manages one shared Socket.IO connection.
   - Handles auto-reconnects and lifecycle state (`connected`, `connecting`, `disconnected`).
2. **Auth Lifecycle Integration (`src/context/AuthContext.jsx`)**:
   - Calls `connectSocket()` on login / session restore.
   - Calls `disconnectSocket()` on logout.
3. **Notification Bell Component (`src/components/NotificationBell.jsx`)**:
   - Integrated into `Navbar.jsx`.
   - Displays real-time unread badge, connection status (`● Live`), dropdown popover, and handles click navigation.

---

## 8. Security Rules

1. Handshake JWT authentication enforced.
2. Users join only their own room (`user:${req.user._id}`).
3. Client-provided `userId` is never trusted; identity is derived strictly from `req.user._id`.
4. Notification REST endpoints verify user ownership (`recipientId === req.user._id`).
5. Sockets disconnect cleanly on session termination or logout.

---

## 9. How to Test Locally

1. **Run Automated Test Suites**:
   ```bash
   npm run test:realtime
   npm run test:flow
   npm run test:prod
   npm run test:api
   ```

2. **Manual Dual-Browser Verification**:
   - **Browser A**: Login as **Project**.
   - **Browser B**: Login as **Creator**.
   - Creator applies to a Project campaign → Project immediately receives **🔔 notification** and new application in dashboard.
   - Project accepts application → Creator immediately receives **🔔 notification**, status updates to Accepted, and Collaboration appears in real-time.
   - Creator/Project updates collaboration progress → Both browsers show updated progress bar instantly.
