# CoinLift — Phase 9 Documentation: Collaboration + Chat Workflow

## 1. Overview
Phase 9 introduces the **Collaboration & Chat Workspace** system to CoinLift. It establishes a secure collaboration lifecycle between **Creators** and **Project Owners** that begins automatically when a Creator's application is marked as `ACCEPTED`:

```
[Campaign] -> [Creator Applies] -> [Project Owner ACCEPTS Application]
                                              |
                                              v
                              [Collaboration Created: ACTIVE]
                                              |
                                              v
                       [Collaboration Workspace (/collaborations/:id)]
                               /                             \
                (Exchanges Chat Messages)               (Updates Status)
                           v                                    v
                     [Message Log]                   [COMPLETED / CANCELLED]
```

---

## 2. Database Schema (`server/prisma/schema.prisma`)

### `Collaboration` Model
```prisma
model Collaboration {
  id            String              @id @default(uuid())
  applicationId String              @unique
  application   Application         @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  creatorId     String
  creator       CreatorProfile      @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  projectId     String
  project       ProjectProfile      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  campaignId    String
  campaign      Campaign            @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  status        CollaborationStatus @default(ACTIVE)
  startedAt     DateTime            @default(now())
  completedAt   DateTime?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  messages      Message[]

  @@index([creatorId])
  @@index([projectId])
  @@index([campaignId])
  @@index([status])
}

enum CollaborationStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}
```

### `Message` Model
```prisma
model Message {
  id              String        @id @default(uuid())
  collaborationId String
  collaboration   Collaboration @relation(fields: [collaborationId], references: [id], onDelete: Cascade)
  senderId        String
  sender          User          @relation(fields: [senderId], references: [id], onDelete: Cascade)
  content         String        @db.Text
  readAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([collaborationId])
  @@index([senderId])
}
```

---

## 3. API Endpoints Reference

### Collaboration & Messaging Endpoints (`/api/collaborations`)

| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/api/collaborations/me` | JWT (`CREATOR` / `PROJECT_OWNER`) | List active/past collaborations for the authenticated user |
| `GET` | `/api/collaborations/:id` | JWT (Participants) | Get collaboration details, brief summary, agreed rates, and status |
| `PUT` | `/api/collaborations/:id/status` | JWT (Participants) | Update collaboration status (`COMPLETED` or `CANCELLED`) |
| `GET` | `/api/collaborations/:id/messages` | JWT (Participants) | Fetch collaboration chat messages in chronological order |
| `POST` | `/api/collaborations/:id/messages` | JWT (Participants) | Send a chat message within the collaboration workspace |

---

## 4. Security & Control Rules
1. **Automatic Creation:** A `Collaboration` is created ONLY when an `Application` transitions to `ACCEPTED`. Duplicate collaboration creation is prevented by a unique constraint on `applicationId`.
2. **Participant Authorization Guard:**
   - Workspace access (`GET /api/collaborations/:id`), message fetching, and message sending strictly verify that the authenticated user (`req.user.id`) matches either `collaboration.creator.userId` or `collaboration.project.userId`.
   - Non-participants receive a `403 Forbidden` response.
3. **Identity Resolution:** Message `senderId` is resolved exclusively from the authenticated JWT token. Frontend-supplied `senderId` fields are rejected.
4. **State Machine Guards:** Message sending is restricted to `ACTIVE` collaborations. Completed or cancelled collaborations block new messages.

---

## 5. Verification Results
- **Prisma Schema & Generation:** Validated via `npx prisma generate --schema=server/prisma/schema.prisma`.
- **Backend Syntax Check:** `node --check server/src/app.js` passed with exit code 0.
- **Frontend Workspace:** Dynamic route `/collaborations/:id` with real-time polling chat, status controls, and participant safeguards.
