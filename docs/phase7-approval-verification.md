# CoinLift Phase 7 — Approval & Verification Workflow Enhancement Documentation

## Overview
Phase 7 enhances the **Moderation, Approval, and Verification Architecture** across the CoinLift platform. It establishes a strict separation between `approvalStatus` (`PENDING`, `APPROVED`, `REJECTED`) and `verified` badge status (`true`, `false`), adds rejection feedback support (`rejectionReason`), enables Admin verification toggles, provides feedback banners on Creator & Project Owner dashboards, and logs all moderation actions in the `AdminLog` audit trail.

---

## 1. Database Schema Extension (`server/prisma/schema.prisma`)
Added `rejectionReason String? @db.Text` to both `CreatorProfile` and `ProjectProfile` models:

```prisma
model CreatorProfile {
  // ...
  approvalStatus     ApprovalStatus @default(PENDING)
  verified           Boolean        @default(false)
  rejectionReason    String?        @db.Text
  // ...
}

model ProjectProfile {
  // ...
  approvalStatus     ApprovalStatus @default(PENDING)
  verified           Boolean        @default(false)
  rejectionReason    String?        @db.Text
  // ...
}
```

---

## 2. API Endpoints & Moderation Routes (`server/src/routes/adminRoutes.js`)

| Method | Endpoint | Auth Required | Role | Action Description |
|---|---|---|---|---|
| `GET` | `/api/admin/creators` | Yes (JWT) | `ADMIN` | Fetch Creator queue with filters (`approvalStatus`: ALL, PENDING, APPROVED, REJECTED, VERIFIED, UNVERIFIED) |
| `PUT` | `/api/admin/creators/:id/approval` | Yes (JWT) | `ADMIN` | Approve or Reject Creator profile (supports `rejectionReason` body field) |
| `PUT` | `/api/admin/creators/:id/verification` | Yes (JWT) | `ADMIN` | Toggle `verified: true \| false` status for approved creators |
| `GET` | `/api/admin/projects` | Yes (JWT) | `ADMIN` | Fetch Project queue with filters (`approvalStatus`: ALL, PENDING, APPROVED, REJECTED, VERIFIED, UNVERIFIED) |
| `PUT` | `/api/admin/projects/:id/approval` | Yes (JWT) | `ADMIN` | Approve or Reject Project profile (supports `rejectionReason` body field) |
| `PUT` | `/api/admin/projects/:id/verification` | Yes (JWT) | `ADMIN` | Toggle `verified: true \| false` status for approved projects |
| `GET` | `/api/admin/logs` | Yes (JWT) | `ADMIN` | Fetch audit logs (`CREATOR_APPROVED`, `CREATOR_REJECTED`, `CREATOR_VERIFIED`, `CREATOR_UNVERIFIED`, `PROJECT_APPROVED`, `PROJECT_REJECTED`, `PROJECT_VERIFIED`, `PROJECT_UNVERIFIED`) |

---

## 3. Workflow & Dashboard Enhancements

### A. Rejection & Resubmission Cycle
1. **Admin Rejection**: When an Admin rejects a submission via `AdminCreatorsPage` or `AdminProjectsPage`, a modal prompts for feedback (`rejectionReason`).
2. **Dashboard Feedback**: On the Creator (`/creator/profile`) or Project Owner (`/project/profile`) dashboard, a Red alert banner displays the exact `rejectionReason` specified by the Admin.
3. **Resubmission**: Updating profile information and clicking "Submit for Approval" automatically updates `approvalStatus` to `PENDING` and re-queues the profile for Admin review.

### B. Separate Approval vs. Verification States
- `approvalStatus === 'APPROVED'`: Unlocks public visibility across discovery pages (`/creators`, `/projects`) and public detail pages (`/creators/:id`, `/projects/:id`).
- `verified === true`: Displays a distinct "Verified Badge" (`ShieldCheck`) next to profile titles on public cards and detail pages. Admins can independently grant or revoke verification via "Verify" / "Unverify" actions.

---

## 4. Security & Audit Enforcement
- **Parameter Stripping**: User mutation endpoints (`/api/creators/me`, `/api/projects/me`) delete `approvalStatus` and `verified` fields from client payloads to prevent self-approval or self-verification.
- **Role Guards**: Admin endpoints require valid Bearer JWT tokens and `requireRole('ADMIN')`.
- **Audit Logging**: Every approval, rejection (with reason), verification grant, and verification revocation is logged in `AdminLog` with admin user context.

---

## 5. Verification & Build Status
- `npm run build`: Passed cleanly with 0 errors.
- `node --check server/src/app.js`: Passed with code 0.
- Prisma Client: Generated v5.22.0.
