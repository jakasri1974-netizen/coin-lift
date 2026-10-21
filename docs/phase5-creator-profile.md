# CoinLift — Phase 5: Advanced Creator Profile System Documentation

**Version:** 1.0.0
**Phase:** Phase 5 (Advanced Creator Profile + Profile Submission + Public Creator Discovery)
**Status:** Completed

---

## 1. Overview

Phase 5 establishes a complete, professional Creator Profile management system, dynamic profile completion percentage calculator, profile submission for Admin approval, resubmission workflow, and public creator discovery.

---

## 2. Architecture & Data Flow

```text
Creator Client (/creator/profile)
       │
   POST/PUT /api/creators/me (Draft Save)
       │
   POST /api/creators/me/submit (Submit for Approval)
       │
   Database Record (approvalStatus = PENDING)
       │
Admin Moderation Panel (/admin/creators)
       │
   PUT /api/admin/creators/:id/approval (Approve or Reject)
       │
Public Discovery (/creators & /creators/:id)
       │
   GET /api/creators (Returns approvalStatus === APPROVED profiles only)
```

---

## 3. Database Schema (`CreatorProfile`)

The `CreatorProfile` model in `server/prisma/schema.prisma` contains:

- `id`: UUID Primary Key
- `userId`: 1-to-1 foreign key to `User`
- `displayName`: Full Creator Name / Handle
- `headline`: Professional Headline
- `bio`: Creator Biography & Overview
- `profileImage`: Profile Avatar URL
- `coverImage`: Cover Banner Image URL
- `location`: Location / Region
- `category`: Primary Content Niche
- `availability`: Availability Status (`Available`, `Limited`, `Booked`)
- `youtube`, `twitter`, `linkedin`, `instagram`, `discord`, `website`: Social links
- `services`: Array of offered deliverable services
- `skills`: Array of specialization tags
- `portfolio`: JSON array of project objects (`title`, `category`, `url`, `description`)
- `approvalStatus`: Moderation Enum (`PENDING`, `APPROVED`, `REJECTED`)
- `verified`: Boolean flag (automatically set to `true` when approved)

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Auth Required? | Roles Allowed |
|---|---|---|---|---|
| `GET` | `/api/creators/me` | Fetch current creator's profile | Yes | `CREATOR` |
| `POST` | `/api/creators/me` | Create creator profile | Yes | `CREATOR` |
| `PUT` | `/api/creators/me` | Update creator profile | Yes | `CREATOR` |
| `POST` | `/api/creators/me/submit` | Submit profile for Admin approval | Yes | `CREATOR` |
| `GET` | `/api/creators` | Public marketplace list | No | Public (returns `APPROVED` only) |
| `GET` | `/api/creators/:id` | Public creator detail view | No | Public (returns `APPROVED` unless owner/admin) |

---

## 5. Key Security & Approval Rules Implemented

1. **Server-Side Ownership Security:** Creator profile mutations (`/api/creators/me`) use `req.user.id` from the verified JWT. Creators cannot create or edit profiles belonging to other users.
2. **Self-Approval Prevention:** The backend strips `approvalStatus` and `verified` fields from incoming creator request payloads. Only Admin endpoints (`PUT /api/admin/creators/:id/approval`) can approve or verify profiles.
3. **Approval Visibility Rule:** Public queries on `GET /api/creators` default to `approvalStatus: 'APPROVED'`. Pending or rejected profiles do not appear in public marketplace searches.
4. **Dynamic Profile Completion:** `calculateProfileCompletion()` dynamically calculates a completion percentage (0-100%) and provides a checklist of missing items.

---

## 6. Testing Results

```text
Frontend build (npm run build):         PASS (Built successfully in 4.11s)
Backend startup (node server/src/server.js): PASS (Running on Port 5000)
Creator Profile Creation (/api/creators/me): PASS (Creates profile bound to req.user.id)
Creator Profile Update (/api/creators/me):   PASS (Updates fields, ignores self-approval attempts)
Profile Submission (/me/submit):            PASS (Sets approvalStatus = PENDING)
Admin Approval Workflow:                    PASS (Admin can approve/reject from Admin Portal)
Public Discovery Visibility:                PASS (Public GET /api/creators returns APPROVED only)
Public Profile View (/creators/:id):        PASS (Renders creator layout with portfolio & stats)
Existing Admin & Public Integrity:         PASS (Admin Portal & Public Navbar untouched)
```

---

## 7. Deferred Features (Phase 6+)

- **Phase 6:** Project Owner + Project Profile & Campaign Creation.
- **Phase 7-12:** Applications workflow, Chat/WebSockets, Agreements, Escrow/Payments, Analytics.
