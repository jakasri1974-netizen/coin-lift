# CoinLift — Phase 2: Backend + Database Foundation Documentation

**Version:** 1.0.0
**Phase:** Phase 2 (Backend + Database Foundation)
**Status:** Completed

---

## 1. Overview

Phase 2 establishes the core backend API server and database schema foundation for **CoinLift** without disturbing or altering the pre-existing React + Vite frontend UI.

---

## 2. Directory Architecture

```text
coin-lift/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Prisma client & connection health test
│   │   ├── controllers/
│   │   │   ├── healthController.js   # Health check controller
│   │   │   ├── userController.js     # User CRUD controller
│   │   │   ├── creatorController.js  # Creator Profile controller
│   │   │   ├── projectController.js  # Project Profile controller
│   │   │   ├── campaignController.js # Campaign controller
│   │   │   └── applicationController.js # Application controller
│   │   ├── middleware/
│   │   │   ├── errorHandler.js       # Centralized API & 404 error handlers
│   │   │   └── validate.js           # Zod schema validation middleware
│   │   ├── routes/
│   │   │   ├── apiRoutes.js          # Master /api router
│   │   │   ├── healthRoutes.js       # /api/health endpoint
│   │   │   ├── userRoutes.js         # /api/users endpoints
│   │   │   ├── creatorRoutes.js      # /api/creators endpoints
│   │   │   ├── projectRoutes.js      # /api/projects endpoints
│   │   │   ├── campaignRoutes.js     # /api/campaigns endpoints
│   │   │   └── applicationRoutes.js  # /api/applications endpoints
│   │   ├── services/
│   │   │   ├── userService.js        # User database operations
│   │   │   ├── creatorService.js     # Creator database operations
│   │   │   ├── projectService.js     # Project database operations
│   │   │   ├── campaignService.js    # Campaign database operations
│   │   │   └── applicationService.js # Application database operations
│   │   ├── utils/
│   │   │   └── validators.js         # Zod schemas for input validation
│   │   ├── app.js                    # Express app setup & middleware
│   │   └── server.js                 # HTTP listener entry point (Port 5000)
│   │
│   └── prisma/
│       └── schema.prisma             # PostgreSQL schema definition
│
├── .env                              # Active environment variables
├── .env.example                      # Environment variables template
└── package.json                      # Unified root package.json with server scripts
```

---

## 3. Database Models & Prisma Setup

The database foundation is defined in `server/prisma/schema.prisma` using PostgreSQL:

1. **User:** Base identity (`id`, `name`, `email`, `passwordHash`, `role` [CREATOR, PROJECT_OWNER, ADMIN], `status` [ACTIVE, SUSPENDED, PENDING]).
2. **CreatorProfile:** Creator profile (`id`, `userId`, `displayName`, `bio`, `category`, social platforms, professional skills/services, audience metrics, `approvalStatus` [PENDING, APPROVED, REJECTED], `verified`).
3. **ProjectProfile:** Token/Ecosystem project (`id`, `userId`, `name`, `description`, `category`, social links, `approvalStatus`, `verified`).
4. **Campaign:** Marketing campaign briefs (`id`, `projectId`, `title`, `description`, `category`, `budget`, `currency`, `deliverables`, `status` [DRAFT, PENDING_APPROVAL, PUBLISHED, PAUSED, COMPLETED, CANCELLED]).
5. **Application:** Creator application connecting Creator -> Campaign (`id`, `creatorId`, `campaignId`, `proposal`, `proposedDeliverables`, `proposedRate`, `status` [PENDING, ACCEPTED, REJECTED, WITHDRAWN], `@@unique([creatorId, campaignId])`).
6. **AdminLog:** Administrative audit trail (`id`, `adminUserId`, `action`, `targetType`, `targetId`, `metadata`).

---

## 4. Environment Variables

Variables are configured in `.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coinlift_db?schema=public"
```

---

## 5. Express API Endpoint Structure

| Method | Endpoint | Description | Validation |
|---|---|---|---|
| `GET` | `/api/health` | API & Database Connection Health Status | None |
| `POST` | `/api/users` | Create User foundation record | `createUserSchema` |
| `GET` | `/api/users` | Get all users (sanitized, passwordHash excluded) | None |
| `GET` | `/api/users/:id` | Get user by ID | None |
| `POST` | `/api/creators` | Create Creator Profile | `createCreatorProfileSchema` |
| `GET` | `/api/creators` | List Creator Profiles (filterable) | Query params |
| `GET` | `/api/creators/:id` | Get Creator Profile by ID | None |
| `POST` | `/api/projects` | Create Project Profile | `createProjectProfileSchema` |
| `GET` | `/api/projects` | List Project Profiles (filterable) | Query params |
| `GET` | `/api/projects/:id` | Get Project Profile by ID | None |
| `POST` | `/api/campaigns` | Create Campaign | `createCampaignSchema` |
| `GET` | `/api/campaigns` | List Campaigns (filterable) | Query params |
| `GET` | `/api/campaigns/:id` | Get Campaign by ID | None |
| `POST` | `/api/applications` | Submit Campaign Application | `createApplicationSchema` |
| `GET` | `/api/applications` | List Applications | Query params |
| `GET` | `/api/applications/:id` | Get Application by ID | None |

---

## 6. How to Run the Backend & Database Commands

### A. Start Backend Server (Development mode with hot reload)
```bash
npm run server:dev
```

### B. Start Backend Server (Production mode)
```bash
npm run server
```

### C. Generate Prisma Client
```bash
npm run prisma:generate
```

### D. Run Database Migrations (Requires running PostgreSQL instance)
```bash
npm run prisma:migrate
```

---

## 7. Deferred Functionality (Phase 3+)

The following features were intentionally deferred per Phase 2 instructions:
- **Phase 3:** Full JWT / Session Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC) middleware, and Protected Route guards.
- **Phase 4:** Admin Portal UI & verification queues.
- **Phase 5-8:** Creator & Project Dashboards, Campaign approval workflows, and Application review UI.
- **Phase 9-12:** Chat/Sockets, Digital Agreements, Web3 Escrow/Payments, and Realtime Notifications.
