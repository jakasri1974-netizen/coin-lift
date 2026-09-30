# CrypLift — Phase 6 Admin Control, Moderation & Audit Architecture

## Overview
The Admin and Moderation module provides platform governance for administrative users (`role === 'admin'`).

## Features
1. **User Management**: Search, filter, inspect, suspend, and reactivate accounts.
2. **Platform Moderation**: User report submission, status workflow (`open`, `reviewing`, `resolved`, `dismissed`), and administrative note logging.
3. **Audit Logging**: Immutable action recording (`AuditLog` collection) tracking all administrative actions with actor metadata and IP logging.
4. **Metrics Overview**: Real-time aggregate count of platform users, active campaigns, pending applications, active collaborations, and open reports.

## Security
- All admin routes enforce JWT authentication (`protect`) and strict role checking (`authorize('admin')`).
- Administrative actions cannot be self-targeted (e.g., self-suspension is blocked).
- Password hashes and internal secrets are excluded from API payloads.
