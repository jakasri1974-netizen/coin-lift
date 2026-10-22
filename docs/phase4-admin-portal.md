# CoinLift — Phase 4: Separate Admin Portal & Moderation Infrastructure Documentation

**Version:** 1.0.0
**Phase:** Phase 4 (Separate Admin Portal & Admin Authorization)
**Status:** Completed

---

## 1. Architecture & Concept

The Admin Portal for **CoinLift** is conceptually and architecturally separated from the public Creator and Project Owner application.

```text
CoinLift Architecture
├── Public Application (coinlift.com)
│   ├── Creators Directory & Applications
│   ├── Projects Directory & Campaigns
│   ├── Public Login / Registration (CREATOR & PROJECT_OWNER only)
│   └── Public Navigation Bar (No Admin links!)
│
└── Admin Portal (admin.coinlift.com / /admin)
    ├── Secure Admin Login (/admin/login)
    ├── Admin Dashboard (/admin)
    ├── User Management (/admin/users)
    ├── Creator Moderation (/admin/creators)
    ├── Project Moderation (/admin/projects)
    └── System Audit Logs (/admin/logs)
```

---

## 2. Key Features Implemented

1. **Admin Seed Mechanism:** Secure server-side seed script (`server/src/utils/seedAdmin.js`) creates initial Admin credentials (`admin@coinlift.com`). Public registration (`POST /api/auth/register`) strictly blocks `role === 'ADMIN'`.
2. **Server-Side Admin Protection:** All endpoints mounted under `/api/admin/*` require `authenticateToken` + `requireRole('ADMIN')`. Suspended admins or non-admin users receive a `403 Forbidden` error.
3. **Approval Visibility Rule:** Server-side queries on public discovery endpoints (`GET /api/creators`, `GET /api/projects`) default to returning only profiles where `approvalStatus === 'APPROVED'`. Pending or rejected profiles are hidden from public view.
4. **Admin Audit Logging (`AdminLog`):** Every moderation action (`CREATOR_APPROVED`, `CREATOR_REJECTED`, `PROJECT_APPROVED`, `PROJECT_REJECTED`, `USER_SUSPENDED`, `USER_REACTIVATED`) generates an immutable `AdminLog` record with operator ID and metadata.
5. **Separate Admin Frontend:**
   - Isolated Admin Login Page (`/admin/login`) with distinct dark/cyan administration branding.
   - Reusable `AdminProtectedRoute` guard enforcing `role === 'ADMIN'` and `status === 'ACTIVE'`.
   - Dedicated Admin Layout (`AdminLayout.jsx`) with sidebar, top header, status indicators, and logout control.
   - Dynamic Dashboard (`AdminDashboardPage.jsx`) displaying real database metrics and recent activity.
   - Full User, Creator, Project management tables with status toggles and detail modals.

---

## 3. Admin API Endpoints Reference

All routes below require header `Authorization: Bearer <token>` with `role: "ADMIN"`.

| Method | Endpoint | Description | Audit Log Action |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Aggregates live system KPIs & recent activity | None |
| `GET` | `/api/admin/users` | List users with search & role/status filters | None |
| `PUT` | `/api/admin/users/:id/status` | Toggle user status (`ACTIVE` vs `SUSPENDED`) | `USER_SUSPENDED` / `USER_REACTIVATED` |
| `GET` | `/api/admin/creators` | List creators with approval status filter | None |
| `PUT` | `/api/admin/creators/:id/approval` | Update profile (`APPROVED` | `REJECTED`) | `CREATOR_APPROVED` / `CREATOR_REJECTED` |
| `GET` | `/api/admin/projects` | List projects with approval status filter | None |
| `PUT` | `/api/admin/projects/:id/approval` | Update project (`APPROVED` | `REJECTED`) | `PROJECT_APPROVED` / `PROJECT_REJECTED` |
| `GET` | `/api/admin/logs` | Fetch system audit logs | None |

---

## 4. Security Audit Verification

- [x] Public registration strictly rejects `role === 'ADMIN'`.
- [x] Admin accounts seeded via server script (`npm run seed:admin`).
- [x] `/api/admin/*` API endpoints require Bearer JWT token + `ADMIN` role.
- [x] Suspended Admin accounts denied access (`403 Forbidden`).
- [x] Creator & Project Owner roles denied access to Admin APIs (`403 Forbidden`).
- [x] `AdminLog` records all approval, rejection, and suspension actions.
- [x] Approval Visibility Rule enforced server-side.
- [x] Public Navbar contains 0 links to the Admin Portal.
- [x] Public Signup page contains 0 options for Admin registration.

---

## 5. Future Deployment Preparation

The Admin Portal frontend module (`src/admin/*`) and API routes (`/api/admin/*`) are structured for seamless future deployment on a separate subdomain:
```text
https://admin.coinlift.com
```
