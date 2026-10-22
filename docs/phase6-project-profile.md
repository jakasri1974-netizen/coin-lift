# CoinLift Phase 6 — Project Owner Dashboard & Advanced Project Profile Documentation

## Overview
Phase 6 implements the complete **Project Owner Dashboard, Advanced Project Profile, and Approval Workflow** for CoinLift.

Project Owners can manage their project branding, Web3 token information, smart contract addresses, social/community links, technical architecture, roadmap summary, and achievements, calculate profile completion dynamically, save drafts, and submit for Admin approval. Public project discovery and detail views enforce strict server-side moderation rules, displaying only approved project profiles.

---

## 1. Architecture & Database Changes

### Extended Prisma Model (`ProjectProfile` in `server/prisma/schema.prisma`)
The `ProjectProfile` model was extended with optional Web3, technical, social, and milestone fields without breaking existing data structures:

```prisma
model ProjectProfile {
  id                 String         @id @default(uuid())
  userId             String         @unique
  user               User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name               String
  tagline            String?
  logo               String?
  coverImage         String?
  description        String         @db.Text
  category           String
  projectType        String?
  location           String?
  foundedYear        String?

  // Web3 Information
  network            String?
  contractAddress    String?
  tokenName          String?
  tokenSymbol        String?
  tokenWebsite       String?
  documentationUrl   String?
  whitepaperUrl      String?

  // Social & Community Links
  website            String?
  twitter            String?
  discord            String?
  telegram           String?
  github             String?
  linkedin           String?
  youtube            String?
  medium             String?

  // Technical & Roadmap Information
  vision             String?        @db.Text
  keyFeatures        String[]       @default([])
  technology         String?        @db.Text
  ecosystem          String?        @db.Text
  targetAudience     String?        @db.Text
  roadmap            String?        @db.Text
  teamInfo           String?        @db.Text

  // Achievements
  achievements       Json?

  status             UserStatus     @default(ACTIVE)
  approvalStatus     ApprovalStatus @default(PENDING)
  verified           Boolean        @default(false)

  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  campaigns          Campaign[]

  @@index([userId])
  @@index([approvalStatus])
  @@index([category])
}
```

---

## 2. API Endpoints & Routes (`server/src/routes/projectRoutes.js`)

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/projects/me` | Yes (JWT) | `PROJECT_OWNER` | Fetch authenticated owner's project profile |
| `POST` | `/api/projects/me` | Yes (JWT) | `PROJECT_OWNER` | Create new project profile draft (`PENDING`) |
| `PUT` | `/api/projects/me` | Yes (JWT) | `PROJECT_OWNER` | Update project profile draft |
| `POST` | `/api/projects/me/submit` | Yes (JWT) | `PROJECT_OWNER` | Submit project profile for Admin approval (`PENDING`) |
| `GET` | `/api/projects` | Optional | Public | List approved project profiles (with `category`, `network`, `projectType`, `search` filters) |
| `GET` | `/api/projects/:id` | Optional | Public | Fetch project profile details (strict check: non-APPROVED profiles return 404 for unauthenticated users) |

---

## 3. UI Routes & Components

1. **Project Owner Dashboard (`/project/profile`)**:
   - File: `src/pages/ProjectProfileDashboard.jsx`
   - Access: Protected (`PROJECT_OWNER` role)
   - Features: Status banner (`PENDING`, `APPROVED`, `REJECTED`), dynamic completion progress bar (0-100%), missing checklist, sectioned profile editor (Basic Info, Web3/Tokens, Socials, Technical/Roadmap, Achievements), live preview modal, Save Draft button, Submit for Approval button.

2. **Public Project Profile View (`/projects/:id`)**:
   - File: `src/pages/PublicProjectProfilePage.jsx`
   - Access: Public (displays approved project details)
   - Features: Cover banner & logo, Web3 network badge, token information, copyable contract address, social/community link buttons, overview, vision, key features, architecture, roadmap summary, and achievements.

3. **Public Projects Discovery (`/projects`)**:
   - File: `src/pages/ProjectsPage.jsx`
   - Access: Public
   - Features: Real-time search, category dropdown, network filter, project type filter, clear filters, empty state, and direct link to public project details.

---

## 4. Dynamic Completion Calculator (`src/utils/projectCompletion.js`)

Evaluates profile completeness across 8 weighted criteria:
- Project Name & Category (15%)
- Tagline & Detailed Description (15%)
- Logo & Banner Images (10%)
- Project Type & Network Architecture (10%)
- Web3 Token & Whitepaper Information (15%)
- Website & Community Links (15%)
- Technology Overview & Key Features (10%)
- Roadmap & Milestones (10%)

---

## 5. Security & Validation Controls

- **Ownership Guard**: All `/api/projects/me` mutation endpoints derive the target user strictly from `req.user.id` (verified JWT token).
- **Self-Approval Protection**: In `projectService.js`, `approvalStatus` and `verified` fields are forcibly deleted from user input payloads.
- **Admin Supremacy**: Approval state can only be changed to `APPROVED` or `REJECTED` via `/api/admin/projects/:id/approval`.
- **Public Visibility Enforcement**: `GET /api/projects` filters database queries to `approvalStatus === APPROVED`. `GET /api/projects/:id` returns `404` for non-approved profiles unless requested by the project owner or an admin.
- **Input Validation**: Backend Zod validation schemas (`createProjectProfileSchema`, `updateProjectProfileSchema`) enforce strict data types, URL validation, and minimum description lengths.

---

## 6. Build & Verification Results

- `npm run build`: Successful (Built in 4.47s with zero errors).
- `node --check server/src/app.js`: Clean syntax verification.
- Database Schema Compatibility: Generated Prisma Client v5.22.0.
