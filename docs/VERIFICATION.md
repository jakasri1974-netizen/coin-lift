# CrypLift — Phase 7 Creator & Project Verification Architecture
## Overview
The Verification System allows creators and projects to submit identity, social, and project documentation for official platform verification badges.
## Workflow
1. **Submission**: User submits profile details and supporting documents via `POST /api/verification`.
2. **Review State**: Status sets to `pending` or `under_review`. Duplicate active submissions are blocked.
3. **Admin Review**: Admins inspect submissions via `GET /api/admin/verifications` and approve or reject via `PUT /api/admin/verifications/:id/approve` or `reject`.
4. **Verified Badge**: Upon approval, `isVerified = true` is set on `User`, `CreatorProfile`, or `ProjectProfile`. Verification badges display in UI ONLY when backend state reflects `isVerified === true`.
