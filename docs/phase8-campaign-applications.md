# CoinLift — Phase 8 Documentation: Campaign + Creator Application Workflow

## 1. Overview
Phase 8 introduces the **Campaign + Creator Application Workflow** to CoinLift. It establishes a multi-role campaign lifecycle connecting **Project Owners**, **Admins**, and **Creators**:

```
[Project Owner] -> Create Campaign -> DRAFT
                        |
                        v
                 Submit for Approval
                        |
                        v
              [Admin] -> Review Campaign
               /                      \
      (Approve)                        (Reject with feedback)
          v                               v
      PUBLISHED                        REJECTED
          |                               |
          v                               v
[Creator] -> Discover & Apply     [Project Owner] -> Inspect Feedback & Edit Campaign
          |                               |
          v                               v
[Owner] -> Accept / Reject       [Project Owner] -> Resubmit for Approval (PENDING_APPROVAL)
[Creator] -> Withdraw (PENDING)
```

---

## 2. Database Schema (`server/prisma/schema.prisma`)

### `Campaign` Model
```prisma
model Campaign {
  id              String         @id @default(uuid())
  projectId       String
  project         ProjectProfile @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title           String
  description     String         @db.Text
  category        String
  budget          Float
  currency        String         @default("USDC")
  deliverables    String[]
  requirements    String?        @db.Text
  status          CampaignStatus @default(DRAFT)
  rejectionReason String?        @db.Text
  startDate       DateTime?
  endDate         DateTime?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  applications    Application[]

  @@index([projectId])
  @@index([status])
  @@index([category])
}

enum CampaignStatus {
  DRAFT
  PENDING_APPROVAL
  PUBLISHED
  PAUSED
  COMPLETED
  CANCELLED
  REJECTED
}
```

### `Application` Model
```prisma
model Application {
  id                   String            @id @default(uuid())
  creatorId            String
  creator              CreatorProfile    @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  campaignId           String
  campaign             Campaign          @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  proposal             String            @db.Text
  proposedDeliverables String[]
  proposedRate         Float?
  status               ApplicationStatus @default(PENDING)

  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  @@unique([creatorId, campaignId], name: "unique_creator_campaign_application")
  @@index([creatorId])
  @@index([campaignId])
  @@index([status])
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
}
```

---

## 3. API Endpoints Reference

### Campaign Endpoints (`/api/campaigns`)

| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/api/campaigns/me` | JWT (`PROJECT_OWNER`) | Get all campaigns created by the authenticated owner |
| `POST` | `/api/campaigns` | JWT (`PROJECT_OWNER`) | Create a new campaign draft (`DRAFT`) |
| `GET` | `/api/campaigns/:id` | Optional Auth | Get campaign details by ID |
| `PUT` | `/api/campaigns/:id` | JWT (`PROJECT_OWNER`) | Update a draft/rejected campaign owned by user |
| `POST` | `/api/campaigns/:id/submit` | JWT (`PROJECT_OWNER`) | Submit draft or rejected campaign for Admin approval (`PENDING_APPROVAL`) |
| `GET` | `/api/campaigns/:campaignId/applications` | JWT (`PROJECT_OWNER`) | View creator applications for owned campaign |
| `GET` | `/api/campaigns` | Public / Optional Auth | Discover `PUBLISHED` campaigns (supports `search`, `category`) |

### Creator Application Endpoints (`/api/applications`)

| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `POST` | `/api/applications` | JWT (`CREATOR`) | Apply to a `PUBLISHED` campaign (unique per creator/campaign) |
| `GET` | `/api/applications/me` | JWT (`CREATOR`) | View all applications submitted by creator |
| `GET` | `/api/applications/:id` | JWT (`CREATOR` / Owner) | Get specific application details |
| `POST` | `/api/applications/:id/withdraw` | JWT (`CREATOR`) | Withdraw a `PENDING` application (`WITHDRAWN`) |
| `PUT` | `/api/applications/:id/status` | JWT (`PROJECT_OWNER`) | Update application status (`ACCEPTED` or `REJECTED`) |

### Admin Moderation Endpoints (`/api/admin/campaigns`)

| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/api/admin/campaigns` | JWT (`ADMIN`) | List all campaigns with optional `status` filter |
| `PUT` | `/api/admin/campaigns/:id/approval` | JWT (`ADMIN`) | Approve (`PUBLISHED`) or Reject (`REJECTED`) campaign with audit log |

---

## 4. Security & Control Rules
1. **Server-Side Identity:** Creator and Project Owner identities are strictly resolved from `req.user.id` (JWT token). Frontend-supplied identity fields are rejected or ignored.
2. **Ownership Guards:**
   - Project Owners can only create, edit, submit, and view applications for campaigns linked to their own `ProjectProfile`.
   - Creators can only view, manage, and withdraw applications linked to their own `CreatorProfile`.
3. **Status Integrity & Rejection Lifecycle:**
   - Admin moderation changes campaign status to `REJECTED` and saves `rejectionReason`.
   - Project Owners inspect rejection reasons, edit their campaign details, and resubmit (`REJECTED` -> `PENDING_APPROVAL`).
   - Project Owners cannot directly publish campaigns or set `PUBLISHED` status.
   - Applications are rejected server-side if submitted to non-`PUBLISHED` campaigns (`DRAFT`, `PENDING_APPROVAL`, `REJECTED`, `PAUSED`, `COMPLETED`, `CANCELLED`).
   - Unique DB constraint `[creatorId, campaignId]` prevents duplicate creator applications.
4. **Admin Audit Logging:** Campaign moderation decisions create immutable records in `AdminLog` (`CAMPAIGN_APPROVED`, `CAMPAIGN_REJECTED`).

---

## 5. Verification Results
- **Prisma Schema & Generation:** Re-generated Prisma Client cleanly (`npx prisma generate`).
- **Frontend Build:** `npm run build` completed with 0 errors (1633 modules transformed).
- **Backend Startup & Syntax:** `node --check server/src/app.js` passed clean with exit code 0.
