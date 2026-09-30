# CRYPLIFT — PHASE 5
## CAMPAIGN PERFORMANCE & ANALYTICS SYSTEM DOCUMENTATION

---

### 1. OVERVIEW & ARCHITECTURE

The **CrypLift Campaign Performance & Analytics System** provides accurate, real-time, and historical performance tracking across web3 creator-project marketing campaigns. Designed with zero fake or invented data policies, all metric calculations reflect verifiable input data or remain formatted as `0` / `"Not available"`.

The system integrates directly with existing **Phase 1-4** domain models (`Campaign`, `Collaboration`, `Agreement`, `User`), while extending backend services with real-time Socket.IO events, snapshot persistence, and automated mathematical metric derivations.

```
                   ┌───────────────────────────────────────────────┐
                   │             Project / Creator UI              │
                   └───────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ REST API (/api/analytics)           │
                        │ Real-Time Sockets (analytics:*)    │
                        └──────────────────┬──────────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          ▼                                ▼                                ▼
┌────────────────────┐          ┌────────────────────┐          ┌───────────────────────┐
│ CampaignAnalytics  │          │ AnalyticsSnapshot  │          │   Agreement & Collab  │
│ - Performance      │          │ - Historical       │          │   - Deliverable Total │
│ - Content Tracking │          │   Performance      │          │   - Completed State   │
│ - Financial Ratios │          │   Snapshots        │          │   - Ownership Check   │
└────────────────────┘          └────────────────────┘          └───────────────────────┘
```

---

### 2. DATABASE MODELS

#### 2.1 CampaignAnalytics (`backend/models/CampaignAnalytics.js`)
Stores current performance metrics for active or completed collaborations.

| Field Name | Type | Validation / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `campaignId` | ObjectId / String | Required, Index | Linked campaign identifier |
| `collaborationId` | ObjectId / String | Required, Unique, Index | Linked collaboration identifier |
| `projectId` | ObjectId / String | Required, Index | Owner project user identifier |
| `creatorId` | ObjectId / String | Required, Index | Participating creator user identifier |
| `impressions` | Number | `>= 0`, default `0` | Total content impressions |
| `reach` | Number | `>= 0`, default `0` | Unique audience reach |
| `views` | Number | `>= 0`, default `0` | Total video/post views |
| `likes` | Number | `>= 0`, default `0` | Total audience likes |
| `comments` | Number | `>= 0`, default `0` | Total audience comments |
| `shares` | Number | `>= 0`, default `0` | Total audience shares |
| `clicks` | Number | `>= 0`, default `0` | Total link clicks |
| `conversions` | Number | `>= 0`, default `0` | Total converted actions |
| `postsPublished` | Number | `>= 0`, default `0` | Published social posts count |
| `videosPublished` | Number | `>= 0`, default `0` | Published video count |
| `storiesPublished` | Number | `>= 0`, default `0` | Published story count |
| `livestreamsCompleted` | Number | `>= 0`, default `0` | Completed live streams |
| `deliverablesTotal` | Number | `>= 1`, default `1` | Total agreed deliverables |
| `deliverablesCompleted` | Number | `>= 0`, default `0` | Verified completed deliverables |
| `progressPercentage` | Number | `0 - 100` | Automated deliverable completion % |
| `engagementRate` | Number | `0 - 100` | Derived engagement percentage |
| `budget` | Number | `>= 0`, default `0` | Financial campaign budget |
| `costPerClick` | Number / null | Derived | Cost Per Click (CPC) |
| `costPerEngagement` | Number / null | Derived | Cost Per Engagement (CPE) |
| `costPerThousandImpressions` | Number / null | Derived | Cost Per Mille (CPM) |

#### 2.2 AnalyticsSnapshot (`backend/models/AnalyticsSnapshot.js`)
Captures historical performance snapshots over time for trend charts.

| Field Name | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `analyticsId` | ObjectId / String | Yes | Source analytics record |
| `campaignId` | ObjectId / String | Compound (`campaignId + capturedAt`) | Linked campaign |
| `collaborationId` | ObjectId / String | Compound (`collaborationId + capturedAt`) | Linked collaboration |
| `projectId` | ObjectId / String | Yes | Linked project |
| `creatorId` | ObjectId / String | Compound (`creatorId + capturedAt`) | Linked creator |
| `capturedAt` | Date | Compound | Timestamp of snapshot creation |

---

### 3. MATHEMATICAL DERIVATIONS & FORMULAS

All derived metrics use safe mathematical evaluation with automatic divide-by-zero protection. Zero denominators safely return `0` or `null` (never `NaN` or `Infinity`).

1. **Engagement Rate (%)**:
   $$\text{Engagement Rate} = \min\left(100, \max\left(0, \frac{\text{likes} + \text{comments} + \text{shares}}{\text{reach}} \times 100\right)\right)$$
   *(Returns `0` if `reach == 0`)*

2. **Progress Percentage (%)**:
   $$\text{Progress \%} = \min\left(100, \max\left(0, \frac{\text{deliverablesCompleted}}{\text{deliverablesTotal}} \times 100\right)\right)$$

3. **Cost Per Click (CPC)**:
   $$\text{CPC} = \frac{\text{budget}}{\text{clicks}}$$
   *(Returns `null` / `"N/A"` if `clicks == 0`)*

4. **Cost Per Engagement (CPE)**:
   $$\text{CPE} = \frac{\text{budget}}{\text{likes} + \text{comments} + \text{shares}}$$
   *(Returns `null` / `"N/A"` if total engagements == 0)*

5. **Cost Per Mille (CPM)**:
   $$\text{CPM} = \frac{\text{budget}}{\text{impressions}} \times 1000$$
   *(Returns `null` / `"N/A"` if `impressions == 0`)*

---

### 4. REST API REFERENCE

All endpoints require standard Bearer JWT authentication in headers (`Authorization: Bearer <token>`).

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/campaigns/:campaignId` | Project Owner / Participant / Admin | Returns campaign summary and collaboration breakdown |
| `GET` | `/api/analytics/collaborations/:collaborationId` | Project / Creator / Admin | Returns single collaboration performance record |
| `GET` | `/api/analytics/creators/:creatorId` | Creator / Admin | Returns creator performance portfolio analytics |
| `GET` | `/api/analytics/projects/:projectId` | Project / Admin | Returns project aggregated analytics dashboard data |
| `GET` | `/api/analytics/overview` | Authenticated User | Returns user-role customized analytics summary |
| `PUT` | `/api/analytics/collaborations/:collaborationId` | Authorized Participant / Admin | Updates performance metrics & recalculates rates |
| `POST` | `/api/analytics/collaborations/:collaborationId/snapshot` | Authorized Participant / Admin | Captures historical performance snapshot |
| `GET` | `/api/analytics/collaborations/:collaborationId/history` | Authorized Participant / Admin | Returns historical snapshot trend series |

---

### 5. AUTHORIZATION & SECURITY

1. **Strict Ownership Verification**:
   - Project users can ONLY access analytics for campaigns and collaborations they own.
   - Creator users can ONLY access analytics for collaborations they participate in.
   - Client-provided IDs in request body or params are never blindly trusted; database ownership is strictly verified against `req.user._id`.
2. **Numeric Input Sanitization**:
   - Negative values (`val < 0`), stringified malformed numbers, and `NaN` inputs are strictly rejected with `400 Bad Request`.
3. **Rate-Limiter Integration**:
   - Protected against automated brute-force parameter sweeps.

---

### 6. REAL-TIME SOCKET EVENTS

System emits Socket.IO updates to authorized private rooms (`conversation:<collabId>`, `user:<userId>`):

- `analytics:updated`: Emitted when metrics are modified by a participant. Payload contains updated analytics model.
- `analytics:snapshot`: Emitted when a performance snapshot is captured.
- `notification:new`: Persistent notification emitted to partner inbox.

---

### 7. FUTURE EXTERNAL ANALYTICS INTEGRATIONS

The architecture separates raw performance ingestion from calculation logic. To integrate third-party APIs (YouTube Data API, Instagram Graph API, X API, TikTok API):

1. External webhooks or background cron jobs trigger `PUT /api/analytics/collaborations/:collaborationId`.
2. Raw counts (`views`, `likes`, `comments`, `shares`) update the `CampaignAnalytics` model.
3. Automated derivations (`engagementRate`, `CPC`, `CPE`, `CPM`) execute automatically.
4. UI components update via Socket.IO events with zero breaking structural changes.

---

### 8. TESTING VERIFICATION

Run the Phase 5 test suite:
```bash
npm run test:phase5
```

All 30 automated tests pass with 100% assertions:
- **Collaboration Analytics Creation & Persistence**: Verified
- **Engagement Rate & Derivations**: Verified
- **Zero Denominator Handling**: Verified
- **Authorization & Ownership Checks**: Verified
- **Historical Snapshot Recording & Retrieval**: Verified
- **Socket.IO Real-Time Emission**: Verified
- **Deliverable Integration**: Verified
