# CrypLift — Phase 4 Digital Collaboration Agreement System

## Overview

The Digital Collaboration Agreement System in CrypLift allows Projects and Creators to define, review, edit, accept, and reject structured commercial and operational terms before and during an active collaboration.

> **Important Legal & Financial Disclaimer**:
> This agreement system records commercial terms mutually accepted by both parties on the CrypLift platform. CrypLift does **NOT** execute money transfers, cryptocurrency payments, escrow services, wallet transactions, or automated smart contracts in this phase. Users remain responsible for verifying legal suitability and tax obligations within their applicable jurisdictions.

---

## Agreement Model & Database Schema

Defined in `backend/models/Agreement.js`.

### Fields
- `collaborationId`: `ObjectId` / `String` (Ref: `Collaboration`) — Required, indexed.
- `campaignId`: `ObjectId` / `String` (Ref: `Campaign`) — Required, indexed.
- `projectId`: `ObjectId` / `String` (Ref: `User`) — Required, indexed.
- `creatorId`: `ObjectId` / `String` (Ref: `User`) — Required, indexed.
- `title`: `String` — Document title (e.g. "Web3 Video Promotion Agreement").
- `description`: `String` — High-level summary of collaboration scope.
- `deliverables`: `Array` of Deliverable objects:
  - `type`: `Enum` (`youtube_video`, `youtube_short`, `instagram_post`, `instagram_reel`, `x_post`, `article`, `livestream`, `custom`).
  - `description`: `String` (e.g. "Create 1 primary video review").
  - `quantity`: `Number` (>= 1).
  - `dueDate`: `Date` / `String`.
  - `platform`: `String` (e.g. "YouTube", "X").
- `quantity`: `Number` — Total deliverable count.
- `deadline`: `Date` — Target completion date for all deliverables.
- `budget`: `Number` (>= 0) — Total agreed compensation/reward value.
- `currency`: `String` (Default: `'USDC'`).
- `paymentTerms`: `String` — Specific payout schedule text.
- `contentRights`: `String` — Ownership and distribution licensing terms.
- `revisionTerms`: `String` — Max revision rounds included.
- `cancellationTerms`: `String` — Notice period and terms for early cancellation.
- `additionalTerms`: `String` — Supplementary clauses or legal notes.
- `status`: `Enum` (`draft`, `pending_creator`, `pending_project`, `active`, `rejected`, `cancelled`, `completed`).
- `creatorAccepted`: `Boolean` (Default: `false`).
- `projectAccepted`: `Boolean` (Default: `false`).
- `creatorAcceptedAt`: `Date` / `String` (ISO 8601 timestamp).
- `projectAcceptedAt`: `Date` / `String` (ISO 8601 timestamp).
- `createdBy`: `ObjectId` / `String` (Ref: `User`).
- `version`: `Number` (Default: `1`).
- `previousVersionId`: `ObjectId` / `String` (Ref: `Agreement`, optional).

---

## Status Lifecycle & Acceptance Workflow

```
[Application Accepted]
        │
        ▼
 (Auto-Create Agreement)
        │
        ▼
   [pending_creator] / [pending_project]
        │
 ┌──────┴───────────────────────┐
 │ Both Parties Review & Edit   │ (Modifying terms resets acceptances)
 └──────┬───────────────────────┘
        │
        ├──► Project Accepts  ──► projectAccepted = true, projectAcceptedAt = timestamp
        │
        ├──► Creator Accepts  ──► creatorAccepted = true, creatorAcceptedAt = timestamp
        │
        ▼
 (Both Accepted?)
        │
        ├── YES ──► status = "active"
        │
        └── NO  ──► Remains pending review
```

- **Rejection**: Either participant can reject the agreement (`status = "rejected"`).
- **Cancellation**: Either participant can cancel an uncompleted agreement (`status = "cancelled"`).
- **Completion**: When the collaboration finishes, agreement transitions to `completed`.

---

## Agreement Versioning

When terms of an **active** or **accepted** agreement are edited by either party:
1. Historical version remains immutable.
2. `version` number is incremented.
3. Acceptance flags (`creatorAccepted`, `projectAccepted`) are safely reset to `false`.
4. Status transitions back to `pending_creator` or `pending_project` for mandatory re-review.
5. Emits real-time socket & persistent notification to the counterparty.

---

## Security & Authorization

- **JWT Authentication Required**: All `/api/agreements` endpoints require a valid Bearer token.
- **Participant Ownership Isolation**: Only the assigned `projectId` or `creatorId` (or system Admin) can view, edit, accept, reject, or cancel an agreement.
- **Role-Gated Acceptance Protection**:
  - `PUT /api/agreements/:id/accept` strictly sets `creatorAccepted` ONLY if requested by the authenticated Creator.
  - `PUT /api/agreements/:id/accept` strictly sets `projectAccepted` ONLY if requested by the authenticated Project owner.
  - Requests trying to spoof counterparty acceptance are rejected with `403 Forbidden`.

---

## REST API Specifications

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/agreements` | Manual agreement creation for collaboration | Private |
| `GET` | `/api/agreements` | List agreements with filters (`status`, `search`, `page`, `limit`) | Private |
| `GET` | `/api/agreements/:id` | Fetch detailed agreement record | Private |
| `PUT` | `/api/agreements/:id` | Update agreement terms (triggers versioning/reset if active) | Private |
| `PUT` | `/api/agreements/:id/accept` | Accept agreement on behalf of authenticated user | Private |
| `PUT` | `/api/agreements/:id/reject` | Reject agreement | Private |
| `PUT` | `/api/agreements/:id/cancel` | Cancel agreement | Private |

---

## Real-Time Socket.IO & Notifications

### Socket.IO Events
Emitted on room `conversation:<collaborationId>` and user rooms `user:<userId>`:
- `agreement:created`
- `agreement:updated`
- `agreement:accepted`
- `agreement:rejected`
- `agreement:activated`
- `agreement:cancelled`

### Notifications
Persisted in MongoDB / MemoryStore and delivered via Socket.IO:
- **`agreement:created`**: Notifies counterparty when agreement is drafted.
- **`agreement:updated`**: Notifies counterparty when terms are edited.
- **`agreement:accepted`**: Notifies counterparty when accepted.
- **`agreement:activated`**: Notifies both participants when agreement becomes `active`.
- **`agreement:rejected`**: Notifies counterparty if rejected.
- **`agreement:cancelled`**: Notifies counterparty if cancelled.

---

## Frontend Integration

### UI Components (`src/components/agreements/`)
- `AgreementDetails.jsx`: Clean document layout with print/export capabilities (`@media print` stylesheet).
- `AgreementForm.jsx`: Modal/Form for editing terms & custom deliverables.
- `DeliverableEditor.jsx`: Interactive list builder for YouTube, X, Instagram, Article deliverables.
- `AgreementCard.jsx`: Card overview for list views with status badges.
- `AgreementList.jsx`: Searchable, tabbed view of user agreements.
- `AgreementTimeline.jsx`: Audit trail showing agreement milestones with ISO timestamps.
- `AgreementStatus.jsx`: Badge & helper text component for lifecycle statuses.
- `AgreementActions.jsx`: Action control bar for Edit, Accept, Reject, Cancel, Print.

### Pages & Routes
- `/agreements`: Main `AgreementsPage.jsx` workspace for Creator & Project dashboards.
- Collaboration Cards on `DashboardPage.jsx` feature direct "View Agreement" buttons.

---

## Verification & Testing

Run Phase 4 test suite:
```bash
npm run test:phase4
```

Run full regression test suites:
```bash
npm run test:api
npm run test:flow
npm run test:prod
npm run test:realtime
npm run test:phase3
```

Verify production build:
```bash
npm run build
```
