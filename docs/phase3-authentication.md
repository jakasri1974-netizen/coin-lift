# CoinLift — Phase 3: Real Authentication & Role-Based Access Control (RBAC) Documentation

**Version:** 1.0.0
**Phase:** Phase 3 (Authentication & RBAC Security Foundation)
**Status:** Completed

---

## 1. Overview

Phase 3 implements real, production-ready authentication and Role-Based Access Control (RBAC) across both the Express backend API and the React frontend application.

---

## 2. Architecture & Data Flow

```text
React Client (src/context/AuthContext.jsx)
       │
   POST /api/auth/register or POST /api/auth/login
       │
Express Server (server/src/routes/authRoutes.js)
       │
   Password Hashing & Verification (bcryptjs)
       │
   JWT Token Generation (jsonwebtoken)
       │
   Authorization Header: Bearer <token>
       │
   Auth Middleware (authenticateToken & requireRole)
       │
   Protected Mutation Controllers with Database Ownership Verification
```

---

## 3. Key Security Features Implemented

1. **Password Hashing:** Passwords are hashed using `bcryptjs` with 10 salt rounds. `passwordHash` is excluded from all API query select fields and sanitized responses.
2. **JWT Tokens:** Issued on successful login or registration. Contains `userId` and `role`. Expiration set to `1d`. Secret stored in `JWT_SECRET`.
3. **Public Registration Restriction:** Public signup (`POST /api/auth/register`) enforces Zod validation permitting ONLY `CREATOR` or `PROJECT_OWNER` roles. Any attempt to register as `ADMIN` is rejected with a `400 Bad Request`.
4. **Account Status Verification:** During login and token authentication, the server verifies `user.status === 'ACTIVE'`. If an account is `SUSPENDED`, login and token access are denied (`403 Forbidden`).
5. **Server-Side Ownership Enforcement:** Controllers verify resource ownership against `req.user.id` in the database. Users cannot create or modify resources belonging to another user.
6. **Frontend Auth State & Utilities:**
   - `AuthContext.jsx` manages `user`, `token`, `isAuthenticated`, `login()`, `register()`, and `logout()`.
   - Token is stored in `localStorage` (`coinlift_token`).
   - `api.js` client helper automatically attaches `Authorization: Bearer <token>`.
   - `ProtectedRoute.jsx` checks auth status and role permissions before rendering protected pages.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Auth Required? | Roles Allowed |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public registration (CREATOR or PROJECT_OWNER) | No | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes | Any (`CREATOR`, `PROJECT_OWNER`, `ADMIN`) |
| `POST` | `/api/auth/logout` | Revoke client authentication session | Yes | Any |
| `POST` | `/api/creators` | Create Creator Profile (bound to `req.user.id`) | Yes | `CREATOR` |
| `POST` | `/api/projects` | Create Project Profile (bound to `req.user.id`) | Yes | `PROJECT_OWNER` |
| `POST` | `/api/campaigns` | Create Campaign (checks Project ownership) | Yes | `PROJECT_OWNER` |
| `POST` | `/api/applications` | Apply for Campaign (checks Creator profile) | Yes | `CREATOR` |

---

## 5. Security Checklist Audit Results

- [x] Passwords hashed with bcrypt (10 rounds)
- [x] `passwordHash` never returned in API responses
- [x] `JWT_SECRET` configured in environment (`.env`)
- [x] JWT expiration set to 1 day
- [x] Public registration strictly rejects `ADMIN` role
- [x] Protected API routes require Bearer JWT token
- [x] User roles validated server-side
- [x] Resource ownership verified from DB using `req.user.id`
- [x] Suspended accounts rejected at login and middleware
- [x] No plaintext passwords or tokens logged
- [x] Client-side role override prevented by server verification
- [x] Clean user-friendly error responses (400, 401, 403, 409)

---

## 6. Deferred Features (Phase 4+)

- **Phase 4:** Dedicated Admin Portal UI, verification queues, and admin login entry point.
- **Phase 5-8:** Creator & Project Dashboards, application review UI.
- **Phase 9-12:** Chat/WebSockets, Digital Agreements, Web3 Wallet signatures, Escrow/Payments, Notifications.
