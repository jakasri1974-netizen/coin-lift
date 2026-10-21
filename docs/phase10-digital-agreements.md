# CoinLift — Phase 10 Documentation: Digital Agreements & Contracts

**Version:** 1.0.0
**Phase:** Phase 10 (Digital Agreements / Contracts)
**Status:** Completed & Verified

---

## 1. Overview

Phase 10 introduces the **Digital Agreements & Bilateral Contracts** system to CoinLift. Building directly on the Phase 9 Collaboration Workspace (`/collaborations/:id`), this phase establishes an immutable, legally-structured contracting lifecycle between **Creators** and **Project Owners**.

The agreement ensures that expectations, deliverables, milestones, payment rates, and completion schedules are formally codified, reviewed, and bilaterally executed before or during active campaigns.

```text
[Accepted Collaboration Workspace]
               │
               ▼
[Project Owner Creates Agreement (DRAFT, v1)]
               │
               ▼
[Project Owner Submits for Review] ──────────────────────┐
               │                                         │
               ▼                                         ▼
   [PENDING_ACCEPTANCE]                          [Creator Rejects]
         │              \                                │
         │               \ (Rejection Reason Required)   │
         │                └──────────────────────────────┘
         │                                               │
         ▼                                               ▼
[Creator Accepts & Signs]                     [REJECTED State]
         │                                               │
         ▼                                               │ (Project Owner revises terms)
[ACCEPTED & IMMUTABLE (Executed)]                        ▼
  • Locked from silent edits                    [Resubmit: Version v2]
  • Timestamped cryptographic record                     │
  • Full audit trail                                     └─► [PENDING_ACCEPTANCE]
```

---

## 2. Database Schema (`server/prisma/schema.prisma`)

### A. `AgreementStatus` Enum
```prisma
enum AgreementStatus {
  DRAFT
  PENDING_ACCEPTANCE
  ACCEPTED
  REJECTED
}
```

### B. `Agreement` Model
```prisma
model Agreement {
  id                  String          @id @default(uuid())
  title               String
  collaborationId     String
  collaboration       Collaboration   @relation(fields: [collaborationId], references: [id], onDelete: Cascade)
  campaignId          String
  campaign            Campaign        @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  projectId           String
  project             ProjectProfile  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  creatorId           String
  creator             CreatorProfile  @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  projectOwnerId      String
  projectOwner        User            @relation(fields: [projectOwnerId], references: [id], onDelete: Cascade)

  scope               String          @db.Text
  deliverables        String[]
  rate                Float
  currency            String          @default("USDC")
  startDate           DateTime?
  deadline            DateTime?
  status              AgreementStatus @default(DRAFT)
  version             Int             @default(1)

  creatorAcceptedAt   DateTime?
  rejectionReason     String?         @db.Text

  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  @@index([collaborationId])
  @@index([campaignId])
  @@index([projectId])
  @@index([creatorId])
  @@index([projectOwnerId])
  @@index([status])
}
```

### C. Relational Integrity
- **`User`**: `agreements Agreement[]`
- **`CreatorProfile`**: `agreements Agreement[]`
- **`ProjectProfile`**: `agreements Agreement[]`
- **`Campaign`**: `agreements Agreement[]`
- **`Collaboration`**: `agreements Agreement[]`

---

## 3. State Machine Transitions

| Current State | Target State | Triggering Role | Rules & Guards |
|---|---|---|---|
| *None* | `DRAFT` (v1) | `PROJECT_OWNER` | Requires active collaboration where `project.userId === req.user.id`. Duplicate active drafts are rejected. |
| `DRAFT` | `DRAFT` (v1) | `PROJECT_OWNER` | Update terms, scope, deliverables, rate, and dates. |
| `DRAFT` | `PENDING_ACCEPTANCE` | `PROJECT_OWNER` | Validates completeness (title, scope, rate > 0, deliverables >= 1). Locks terms for Creator review. |
| `PENDING_ACCEPTANCE` | `ACCEPTED` | `CREATOR` | Only assigned Creator (`creator.userId === req.user.id`) can accept. Sets `creatorAcceptedAt = new Date()`. |
| `PENDING_ACCEPTANCE` | `REJECTED` | `CREATOR` | Requires mandatory non-empty `rejectionReason` (min 3 chars). Sets status to `REJECTED`. |
| `REJECTED` | `PENDING_ACCEPTANCE` (v+1) | `PROJECT_OWNER` | Revision workflow: Project Owner updates terms and resubmits. Increments `version`, clears `rejectionReason`. |
| `ACCEPTED` | *Any* | **BLOCKED** | **Immutable:** Accepted agreements are permanently locked against silent edits, resubmissions, and cancellations. |

---

## 4. API Endpoints Reference

### Agreement API Endpoints (`/api/agreements` & `/api/collaborations/:id/agreements`)

| Method | Endpoint | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/api/agreements/me` | JWT (`CREATOR` / `PROJECT_OWNER` / `ADMIN`) | List all agreements associated with the authenticated user |
| `GET` | `/api/collaborations/:id/agreements` | JWT (Participants) | Get all agreements for a specific collaboration workspace |
| `POST` | `/api/collaborations/:id/agreements` | JWT (`PROJECT_OWNER`) | Create a new draft agreement for an existing collaboration |
| `GET` | `/api/agreements/:id` | JWT (Participants / Admin) | Fetch detailed agreement terms, deliverables, and timestamps |
| `PUT` | `/api/agreements/:id` | JWT (`PROJECT_OWNER`) | Update agreement terms while in `DRAFT` or `REJECTED` status |
| `POST` | `/api/agreements/:id/submit` | JWT (`PROJECT_OWNER`) | Submit agreement for Creator acceptance (`DRAFT`/`REJECTED` -> `PENDING_ACCEPTANCE`) |
| `POST` | `/api/agreements/:id/accept` | JWT (`CREATOR`) | Formally accept and digitally sign agreement (`PENDING_ACCEPTANCE` -> `ACCEPTED`) |
| `POST` | `/api/agreements/:id/reject` | JWT (`CREATOR`) | Reject agreement with feedback (`PENDING_ACCEPTANCE` -> `REJECTED`) |
| `GET` | `/api/admin/agreements` | JWT (`ADMIN`) | Read-only audit directory of all agreements across the platform |

---

## 5. Security Controls & Authorization Rules

1. **Server-Side Identity Enforcement:**
   - Identity and roles are extracted exclusively from verified Bearer JWT tokens (`req.user.id`, `req.user.role`).
   - Client-supplied IDs in request bodies are ignored.
2. **Strict Participant Authorization:**
   - Access to agreements (`GET /api/agreements/:id`) verifies that `req.user.id` belongs to either the Project Owner or the Creator of that collaboration (or an authorized Administrator).
   - Non-participants receive `403 Forbidden`.
3. **Role Segregation:**
   - Only the associated Project Owner can create, edit, and submit agreements.
   - Only the associated Creator can accept or reject agreements.
   - Cross-role tampering attempts return `403 Forbidden`.
4. **Immutability of Accepted Agreements:**
   - Any attempt to modify (`PUT`), resubmit, or reject an agreement in `ACCEPTED` status is blocked by the service layer with `400 Bad Request`.
5. **Admin Access Restrictions:**
   - Administrators possess **read-only audit visibility** (`GET /api/admin/agreements` and inspection).
   - Admins cannot edit, impersonate, sign, or reject agreements on behalf of participants.

---

## 6. Frontend Integration

### A. Collaboration Workspace (`CollaborationWorkspacePage.jsx`)
- **Workspace Navigation:** Clean tab navigation between `[Collaboration Discussion]` and `[Digital Agreement]`.
- **Top Alert Banners:**
  - Creator banner alerts when an agreement is pending their acceptance.
  - Project Owner banner alerts when an agreement was rejected and requires revision.
- **Project Owner Workflow:**
  - "Draft Agreement Terms" button pre-populates terms from the campaign and proposal.
  - Interactive deliverables manager (add/remove items).
  - "Save Draft" and "Submit for Creator Review" actions.
- **Creator Workflow:**
  - Visual contract presentation with deliverables checklist, scope of work, timeline, and compensation summary.
  - "Accept & Sign Agreement" button with confirmation prompt.
  - "Reject Terms" button opening a dedicated modal requiring feedback.
- **Accepted Agreement Seal:**
  - Displays a certified digital seal indicating execution timestamp, parties involved, and immutable status.

### B. Admin Portal (`AdminAgreementsPage.jsx`)
- Mounted under `/admin/agreements`.
- Accessible via the Admin sidebar menu ("Agreements Directory").
- Searchable by title, project name, creator name, and campaign.
- Filterable by agreement status (`DRAFT`, `PENDING_ACCEPTANCE`, `ACCEPTED`, `REJECTED`).
- Read-only inspection modal showing full agreement terms, deliverables, and execution history.

---

## 7. Testing & Verification Results

### A. Prisma Schema & Client Generation
- **Validation:** `npx prisma validate --schema=server/prisma/schema.prisma` -> Schema valid.
- **Client Generation:** `npm run prisma:generate` -> Generated `@prisma/client` in 139ms.

### B. Backend Syntax Checks (`node --check`)
- Verified all server files:
  - `server/src/app.js`
  - `server/src/routes/apiRoutes.js`
  - `server/src/routes/agreementRoutes.js`
  - `server/src/routes/collaborationRoutes.js`
  - `server/src/routes/adminRoutes.js`
  - `server/src/controllers/agreementController.js`
  - `server/src/controllers/adminController.js`
  - `server/src/services/agreementService.js`
  - `server/src/services/adminService.js`
  - `server/src/utils/validators.js`
  - `server/src/middleware/errorHandler.js`
- **Result:** 0 syntax errors.

### C. Automated Test Suite Execution (`server/src/utils/testPhase10.js`)
- Executed: `node server/src/utils/testPhase10.js`
- **Results:**
  - `✅ [PASS] Test 1: createAgreementSchema validates valid agreement payload`
  - `✅ [PASS] Test 2: createAgreementSchema rejects empty title`
  - `✅ [PASS] Test 3: createAgreementSchema rejects empty deliverables list`
  - `✅ [PASS] Test 4: createAgreementSchema rejects negative or zero rate`
  - `✅ [PASS] Test 5: rejectAgreementSchema requires non-empty rejectionReason`
  - `✅ [PASS] Test 6: Project Owner successfully creates DRAFT agreement`
  - `✅ [PASS] Test 7: Unauthorized user cannot create agreement for another collaboration (403 Forbidden)`
  - `✅ [PASS] Test 8: Project Owner can edit agreement while in DRAFT status`
  - `✅ [PASS] Test 9: Creator cannot edit agreement draft (403 Forbidden)`
  - `✅ [PASS] Test 10: Project Owner submits DRAFT agreement for Creator review -> PENDING_ACCEPTANCE`
  - `✅ [PASS] Test 11: Agreement cannot be directly edited while in PENDING_ACCEPTANCE status`
  - `✅ [PASS] Test 12: Unauthorized party cannot accept or reject agreement (403 Forbidden)`
  - `✅ [PASS] Test 13: Creator rejects agreement with mandatory rejection reason -> REJECTED`
  - `✅ [PASS] Test 14: Creator cannot accept an agreement while in REJECTED status`
  - `✅ [PASS] Test 15: Project Owner can revise REJECTED agreement and resubmit -> version increments to 2`
  - `✅ [PASS] Test 16: Creator accepts revised agreement -> ACCEPTED with timestamp`
  - `✅ [PASS] Test 17: PROTECTION: Accepted agreement is locked and CANNOT be edited (400 Bad Request)`
  - `✅ [PASS] Test 18: PROTECTION: Accepted agreement CANNOT be resubmitted or rejected`
  - `✅ [PASS] Test 19: Non-participant cannot view agreement (403 Forbidden)`
  - `✅ [PASS] Test 20: Authorized participants and Admins can view agreement`
- **Total:** 20 / 20 tests passed (100% success rate).

### D. Frontend Production Build
- Executed: `npm run build`
- **Result:** Vite transformed 1635 modules with **0 errors** in 4.15s.

---

## 8. Remaining Limitations & Non-Goals

Per the strict scope of Phase 10:
- **No Escrow / Web3 Payments:** Phase 10 records agreed compensation rates and currency in the digital contract. Escrow deposits, smart contracts, and wallet payout transactions are deferred to subsequent phases.
- **No File Upload Attachments:** Deliverable attachments and file uploads are intentionally excluded.
- **No WebSocket Signalling:** Real-time updates utilize the established polling architecture.
- **No Reputation / Ratings:** Review submissions upon agreement completion are deferred to the ratings phase.
