import assert from 'assert';
import jwt from 'jsonwebtoken';
import app from '../server/src/app.js';
import { prisma } from '../server/src/config/db.js';
import { getJwtSecret } from '../server/src/config/jwt.js';

const JWT_SECRET = getJwtSecret();

console.log('====================================================');
console.log('🔍 COINLIFT PHASE 10: REAL POSTGRESQL & API AUDIT');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function recordPass(name, detail = '') {
  totalTests++;
  passedTests++;
  testResults.push({ id: totalTests, name, status: 'PASS', detail });
  console.log(`✅ [PASS] Test ${totalTests}: ${name}${detail ? ` (${detail})` : ''}`);
}

function recordFail(name, error) {
  totalTests++;
  failedTests++;
  testResults.push({ id: totalTests, name, status: 'FAIL', error: error.message });
  console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
  console.error(error);
}

async function runAudit() {
  const ts = Date.now();
  let server = null;
  let baseUrl = '';

  // Tracking IDs for isolated test cleanup
  const createdUserIds = [];
  const createdProjectProfileIds = [];
  const createdCreatorProfileIds = [];
  const createdCampaignIds = [];
  const createdApplicationIds = [];
  const createdCollaborationIds = [];
  const createdAgreementIds = [];

  try {
    // -----------------------------------------------------------------
    // 0. Start Express Test Server on Ephemeral Port
    // -----------------------------------------------------------------
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        console.log(`📡 [Test Server]: Running on ${baseUrl}\n`);
        resolve();
      });
    });

    // -----------------------------------------------------------------
    // 1. Establish Isolated Test Fixtures in PostgreSQL
    // -----------------------------------------------------------------
    console.log('--- SETUP: CREATING ISOLATED TEST FIXTURES IN POSTGRESQL ---');

    // User 1: Project Owner
    const poUser = await prisma.user.create({
      data: {
        name: 'Audit Project Owner',
        email: `audit-po-${ts}@coinlift.test`,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvw1234567890abcdefghijklmnopqrstuv',
        role: 'PROJECT_OWNER',
        status: 'ACTIVE',
      },
    });
    createdUserIds.push(poUser.id);

    const projectProfile = await prisma.projectProfile.create({
      data: {
        userId: poUser.id,
        name: 'Audit DeFi Protocol',
        description: 'Audit project profile for Phase 10 validation',
        category: 'DeFi',
        approvalStatus: 'APPROVED',
        verified: true,
      },
    });
    createdProjectProfileIds.push(projectProfile.id);

    // User 2: Creator
    const creatorUser = await prisma.user.create({
      data: {
        name: 'Audit Creator Alice',
        email: `audit-creator-${ts}@coinlift.test`,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvw1234567890abcdefghijklmnopqrstuv',
        role: 'CREATOR',
        status: 'ACTIVE',
      },
    });
    createdUserIds.push(creatorUser.id);

    const creatorProfile = await prisma.creatorProfile.create({
      data: {
        userId: creatorUser.id,
        displayName: 'Alice Web3',
        category: 'YouTube',
        approvalStatus: 'APPROVED',
        verified: true,
      },
    });
    createdCreatorProfileIds.push(creatorProfile.id);

    // User 3: Attacker / Non-participant
    const attackerUser = await prisma.user.create({
      data: {
        name: 'Audit Attacker Eve',
        email: `audit-attacker-${ts}@coinlift.test`,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvw1234567890abcdefghijklmnopqrstuv',
        role: 'CREATOR',
        status: 'ACTIVE',
      },
    });
    createdUserIds.push(attackerUser.id);

    // User 4: Admin
    const adminUser = await prisma.user.create({
      data: {
        name: 'Audit Platform Admin',
        email: `audit-admin-${ts}@coinlift.test`,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvw1234567890abcdefghijklmnopqrstuv',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    createdUserIds.push(adminUser.id);

    // Campaign
    const campaign = await prisma.campaign.create({
      data: {
        projectId: projectProfile.id,
        title: 'Phase 10 Audit Launch Campaign',
        description: 'Bilateral agreement test brief',
        category: 'DeFi',
        budget: 5000,
        currency: 'USDC',
        deliverables: ['1x YouTube Review'],
        status: 'PUBLISHED',
      },
    });
    createdCampaignIds.push(campaign.id);

    // Application
    const application = await prisma.application.create({
      data: {
        creatorId: creatorProfile.id,
        campaignId: campaign.id,
        proposal: 'I will create a thorough deep-dive review.',
        proposedDeliverables: ['1x YouTube Review'],
        proposedRate: 2500,
        status: 'ACCEPTED',
      },
    });
    createdApplicationIds.push(application.id);

    // Collaboration
    const collaboration = await prisma.collaboration.create({
      data: {
        applicationId: application.id,
        creatorId: creatorProfile.id,
        projectId: projectProfile.id,
        campaignId: campaign.id,
        status: 'ACTIVE',
      },
    });
    createdCollaborationIds.push(collaboration.id);

    // Generate JWT tokens
    const poToken = jwt.sign({ userId: poUser.id, role: poUser.role }, JWT_SECRET);
    const creatorToken = jwt.sign({ userId: creatorUser.id, role: creatorUser.role }, JWT_SECRET);
    const attackerToken = jwt.sign({ userId: attackerUser.id, role: attackerUser.role }, JWT_SECRET);
    const adminToken = jwt.sign({ userId: adminUser.id, role: adminUser.role }, JWT_SECRET);

    console.log(`✅ [Fixtures Created]: Collaboration ${collaboration.id} ready in PostgreSQL.\n`);

    // Helper for authenticated fetch
    async function apiRequest(method, path, body = null, token = null) {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`${baseUrl}${path}`, options);
      const json = await res.json().catch(() => null);
      return { status: res.status, data: json };
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION A: REQUEST VALIDATION (Zod Schemas via HTTP)
    // -----------------------------------------------------------------
    console.log('--- SECTION A: REQUEST VALIDATION AUDIT (HTTP + ZOD) ---');

    // Test 1: Empty title rejected
    try {
      const res = await apiRequest('POST', `/collaborations/${collaboration.id}/agreements`, {
        title: '   ',
        scope: 'Detailed scope of work for test.',
        deliverables: ['1x Video'],
        rate: 2000,
      }, poToken);
      assert.strictEqual(res.status, 400, 'Expected 400 for empty title');
      assert.strictEqual(res.data.error.code, 'VALIDATION_ERROR');
      recordPass('POST /collaborations/:id/agreements rejects empty title', '400 VALIDATION_ERROR');
    } catch (e) {
      recordFail('POST /collaborations/:id/agreements rejects empty title', e);
    }

    // Test 2: Empty deliverables rejected
    try {
      const res = await apiRequest('POST', `/collaborations/${collaboration.id}/agreements`, {
        title: 'Valid Title',
        scope: 'Detailed scope of work for test.',
        deliverables: [],
        rate: 2000,
      }, poToken);
      assert.strictEqual(res.status, 400, 'Expected 400 for empty deliverables');
      assert.strictEqual(res.data.error.code, 'VALIDATION_ERROR');
      recordPass('POST /collaborations/:id/agreements rejects empty deliverables list', '400 VALIDATION_ERROR');
    } catch (e) {
      recordFail('POST /collaborations/:id/agreements rejects empty deliverables list', e);
    }

    // Test 3: Negative or zero rate rejected
    try {
      const res = await apiRequest('POST', `/collaborations/${collaboration.id}/agreements`, {
        title: 'Valid Title',
        scope: 'Detailed scope of work for test.',
        deliverables: ['1x Video'],
        rate: -100,
      }, poToken);
      assert.strictEqual(res.status, 400, 'Expected 400 for negative rate');
      assert.strictEqual(res.data.error.code, 'VALIDATION_ERROR');
      recordPass('POST /collaborations/:id/agreements rejects non-positive rate', '400 VALIDATION_ERROR');
    } catch (e) {
      recordFail('POST /collaborations/:id/agreements rejects non-positive rate', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION B: AUTHORIZATION ON AGREEMENT CREATION
    // -----------------------------------------------------------------
    console.log('\n--- SECTION B: AUTHORIZATION ON AGREEMENT CREATION ---');

    // Test 4: Attacker cannot create agreement
    try {
      const res = await apiRequest('POST', `/collaborations/${collaboration.id}/agreements`, {
        title: 'Malicious Agreement',
        scope: 'Attacker scope.',
        deliverables: ['1x Fake'],
        rate: 9999,
      }, attackerToken);
      assert.strictEqual(res.status, 403, 'Expected 403 Forbidden for non-owner');
      recordPass('Non-owner cannot create agreement for collaboration', '403 Forbidden');
    } catch (e) {
      recordFail('Non-owner cannot create agreement for collaboration', e);
    }

    // Test 5: Assigned Creator cannot create agreement (Only Project Owner can create)
    try {
      const res = await apiRequest('POST', `/collaborations/${collaboration.id}/agreements`, {
        title: 'Creator Proposed Agreement',
        scope: 'Creator attempted scope.',
        deliverables: ['1x Video'],
        rate: 3000,
      }, creatorToken);
      assert.strictEqual(res.status, 403, 'Expected 403 Forbidden for Creator role');
      recordPass('Assigned Creator cannot initiate agreement creation (Project Owner only)', '403 Forbidden');
    } catch (e) {
      recordFail('Assigned Creator cannot initiate agreement creation (Project Owner only)', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION C: CREATION & POSTGRESQL PERSISTENCE
    // -----------------------------------------------------------------
    console.log('\n--- SECTION C: CREATION & REAL POSTGRESQL PERSISTENCE ---');

    let activeAgreementId = null;

    // Test 6: Project Owner successfully creates DRAFT agreement
    try {
      const res = await apiRequest('POST', `/collaborations/${collaboration.id}/agreements`, {
        title: 'Phase 10 Bilateral Contract',
        scope: 'Creator will produce 1 dedicated deep-dive video covering tokenomics and roadmaps.',
        deliverables: ['1x Dedicated YouTube Review (10+ min)', '1x X (Twitter) Announcement Thread'],
        rate: 2500,
        currency: 'USDC',
        startDate: '2026-11-01',
        deadline: '2026-11-20',
      }, poToken);

      assert.strictEqual(res.status, 201, 'Expected 201 Created');
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.status, 'DRAFT');
      assert.strictEqual(res.data.data.version, 1);
      assert.strictEqual(res.data.data.rate, 2500);

      activeAgreementId = res.data.data.id;
      createdAgreementIds.push(activeAgreementId);

      // DIRECT DATABASE QUERY TO VERIFY POSTGRESQL PERSISTENCE
      const dbRecord = await prisma.agreement.findUnique({
        where: { id: activeAgreementId },
      });

      assert.ok(dbRecord, 'Record must exist in PostgreSQL');
      assert.strictEqual(dbRecord.title, 'Phase 10 Bilateral Contract');
      assert.strictEqual(dbRecord.status, 'DRAFT');
      assert.strictEqual(dbRecord.version, 1);
      assert.strictEqual(dbRecord.rate, 2500);
      assert.strictEqual(dbRecord.currency, 'USDC');
      assert.strictEqual(dbRecord.deliverables.length, 2);
      assert.strictEqual(dbRecord.creatorAcceptedAt, null);
      assert.strictEqual(dbRecord.rejectionReason, null);

      recordPass('Project Owner creates DRAFT agreement & persists to PostgreSQL', `ID: ${activeAgreementId.slice(0, 8)}...`);
    } catch (e) {
      recordFail('Project Owner creates DRAFT agreement & persists to PostgreSQL', e);
    }

    // Test 7: Duplicate active draft guard
    try {
      const res = await apiRequest('POST', `/collaborations/${collaboration.id}/agreements`, {
        title: 'Second Draft Attempt',
        scope: 'Attempting duplicate draft.',
        deliverables: ['1x Item'],
        rate: 1000,
      }, poToken);
      assert.strictEqual(res.status, 400, 'Expected 400 for duplicate draft');
      recordPass('Duplicate active draft agreement rejected', '400 Bad Request');
    } catch (e) {
      recordFail('Duplicate active draft agreement rejected', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION D: FETCHING, LISTING & ACCESS CONTROL
    // -----------------------------------------------------------------
    console.log('\n--- SECTION D: FETCHING, LISTING & ACCESS CONTROL ---');

    // Test 8: Project Owner can fetch agreement by ID
    try {
      const res = await apiRequest('GET', `/agreements/${activeAgreementId}`, null, poToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, activeAgreementId);
      assert.strictEqual(res.data.data.projectOwner.email, poUser.email);
      recordPass('Project Owner can fetch agreement by ID', '200 OK');
    } catch (e) {
      recordFail('Project Owner can fetch agreement by ID', e);
    }

    // Test 9: Creator can fetch agreement by ID
    try {
      const res = await apiRequest('GET', `/agreements/${activeAgreementId}`, null, creatorToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, activeAgreementId);
      recordPass('Creator can fetch agreement by ID', '200 OK');
    } catch (e) {
      recordFail('Creator can fetch agreement by ID', e);
    }

    // Test 10: Admin can fetch agreement by ID
    try {
      const res = await apiRequest('GET', `/agreements/${activeAgreementId}`, null, adminToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, activeAgreementId);
      recordPass('Admin can view agreement terms', '200 OK');
    } catch (e) {
      recordFail('Admin can view agreement terms', e);
    }

    // Test 11: Attacker cannot fetch agreement by ID (403 Forbidden)
    try {
      const res = await apiRequest('GET', `/agreements/${activeAgreementId}`, null, attackerToken);
      assert.strictEqual(res.status, 403);
      recordPass('Non-participant cannot view agreement terms', '403 Forbidden');
    } catch (e) {
      recordFail('Non-participant cannot view agreement terms', e);
    }

    // Test 12: Unauthenticated request rejected (401 Unauthorized)
    try {
      const res = await apiRequest('GET', `/agreements/${activeAgreementId}`, null, null);
      assert.strictEqual(res.status, 401);
      recordPass('Unauthenticated request rejected with 401 Unauthorized', '401 Unauthorized');
    } catch (e) {
      recordFail('Unauthenticated request rejected with 401 Unauthorized', e);
    }

    // Test 13: List agreements by collaboration workspace
    try {
      const res = await apiRequest('GET', `/collaborations/${collaboration.id}/agreements`, null, poToken);
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
      assert.strictEqual(res.data.data.length, 1);
      assert.strictEqual(res.data.data[0].id, activeAgreementId);
      recordPass('GET /collaborations/:id/agreements lists workspace agreements', '1 agreement returned');
    } catch (e) {
      recordFail('GET /collaborations/:id/agreements lists workspace agreements', e);
    }

    // Test 14: List user agreements (/api/agreements/me)
    try {
      const poRes = await apiRequest('GET', '/agreements/me', null, poToken);
      assert.strictEqual(poRes.status, 200);
      assert.strictEqual(poRes.data.data.length, 1);

      const creatorRes = await apiRequest('GET', '/agreements/me', null, creatorToken);
      assert.strictEqual(creatorRes.status, 200);
      assert.strictEqual(creatorRes.data.data.length, 1);

      const attackerRes = await apiRequest('GET', '/agreements/me', null, attackerToken);
      assert.strictEqual(attackerRes.status, 200);
      assert.strictEqual(attackerRes.data.data.length, 0);

      recordPass('GET /agreements/me partitions results by authenticated user role', 'PO: 1, Creator: 1, Attacker: 0');
    } catch (e) {
      recordFail('GET /agreements/me partitions results by authenticated user role', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION E: DRAFT MODIFICATION & STATE MACHINE
    // -----------------------------------------------------------------
    console.log('\n--- SECTION E: DRAFT MODIFICATION & STATE MACHINE ---');

    // Test 15: Creator cannot edit draft
    try {
      const res = await apiRequest('PUT', `/agreements/${activeAgreementId}`, {
        rate: 9999,
      }, creatorToken);
      assert.strictEqual(res.status, 403);
      recordPass('Creator cannot edit agreement draft', '403 Forbidden');
    } catch (e) {
      recordFail('Creator cannot edit agreement draft', e);
    }

    // Test 16: Project Owner updates draft terms & persists in PostgreSQL
    try {
      const res = await apiRequest('PUT', `/agreements/${activeAgreementId}`, {
        rate: 2800,
        deliverables: [
          '1x Dedicated YouTube Review (10+ min)',
          '1x X Announcement Thread',
          '1x Telegram AMA Session',
        ],
      }, poToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.rate, 2800);
      assert.strictEqual(res.data.data.deliverables.length, 3);

      // Verify in DB
      const dbCheck = await prisma.agreement.findUnique({ where: { id: activeAgreementId } });
      assert.strictEqual(dbCheck.rate, 2800);
      assert.strictEqual(dbCheck.deliverables.length, 3);
      recordPass('Project Owner updates draft & changes persist in PostgreSQL', 'Rate: 2800, Deliverables: 3');
    } catch (e) {
      recordFail('Project Owner updates draft & changes persist in PostgreSQL', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION F: SUBMISSION (DRAFT -> PENDING_ACCEPTANCE)
    // -----------------------------------------------------------------
    console.log('\n--- SECTION F: SUBMISSION (DRAFT -> PENDING_ACCEPTANCE) ---');

    // Test 17: Attacker cannot submit agreement
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/submit`, null, attackerToken);
      assert.strictEqual(res.status, 403);
      recordPass('Non-owner cannot submit agreement', '403 Forbidden');
    } catch (e) {
      recordFail('Non-owner cannot submit agreement', e);
    }

    // Test 18: Project Owner submits agreement for Creator review
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/submit`, null, poToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'PENDING_ACCEPTANCE');
      assert.strictEqual(res.data.data.version, 1);

      // Verify DB
      const dbCheck = await prisma.agreement.findUnique({ where: { id: activeAgreementId } });
      assert.strictEqual(dbCheck.status, 'PENDING_ACCEPTANCE');
      recordPass('Project Owner submits agreement -> PENDING_ACCEPTANCE in PostgreSQL', 'Version: 1');
    } catch (e) {
      recordFail('Project Owner submits agreement -> PENDING_ACCEPTANCE in PostgreSQL', e);
    }

    // Test 19: Cannot edit agreement while PENDING_ACCEPTANCE
    try {
      const res = await apiRequest('PUT', `/agreements/${activeAgreementId}`, { rate: 3500 }, poToken);
      assert.strictEqual(res.status, 400);
      recordPass('Cannot edit agreement while in PENDING_ACCEPTANCE status', '400 Bad Request');
    } catch (e) {
      recordFail('Cannot edit agreement while in PENDING_ACCEPTANCE status', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION G: REJECTION WORKFLOW (PENDING_ACCEPTANCE -> REJECTED)
    // -----------------------------------------------------------------
    console.log('\n--- SECTION G: REJECTION WORKFLOW (PENDING_ACCEPTANCE -> REJECTED) ---');

    // Test 20: Attacker cannot reject agreement
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/reject`, {
        rejectionReason: 'Malicious rejection attempt',
      }, attackerToken);
      assert.strictEqual(res.status, 403);
      recordPass('Unauthorized user cannot reject agreement', '403 Forbidden');
    } catch (e) {
      recordFail('Unauthorized user cannot reject agreement', e);
    }

    // Test 21: Rejection requires non-empty reason
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/reject`, {
        rejectionReason: '   ',
      }, creatorToken);
      assert.strictEqual(res.status, 400);
      recordPass('Creator rejection requires non-empty rejectionReason', '400 Bad Request');
    } catch (e) {
      recordFail('Creator rejection requires non-empty rejectionReason', e);
    }

    // Test 22: Creator successfully rejects agreement with feedback
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/reject`, {
        rejectionReason: 'The rate of 2800 USDC does not adequately cover the Telegram AMA deliverable.',
      }, creatorToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'REJECTED');
      assert.strictEqual(res.data.data.rejectionReason, 'The rate of 2800 USDC does not adequately cover the Telegram AMA deliverable.');

      // Verify in DB
      const dbCheck = await prisma.agreement.findUnique({ where: { id: activeAgreementId } });
      assert.strictEqual(dbCheck.status, 'REJECTED');
      assert.strictEqual(dbCheck.rejectionReason, 'The rate of 2800 USDC does not adequately cover the Telegram AMA deliverable.');
      assert.strictEqual(dbCheck.creatorAcceptedAt, null);

      recordPass('Creator rejects agreement with reason -> REJECTED persisted in PostgreSQL', 'Reason stored');
    } catch (e) {
      recordFail('Creator rejects agreement with reason -> REJECTED persisted in PostgreSQL', e);
    }

    // Test 23: Cannot accept an agreement in REJECTED status
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/accept`, null, creatorToken);
      assert.strictEqual(res.status, 400);
      recordPass('Creator cannot accept an agreement while in REJECTED status', '400 Bad Request');
    } catch (e) {
      recordFail('Creator cannot accept an agreement while in REJECTED status', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION H: REVISION & RESUBMIT (REJECTED -> PENDING_ACCEPTANCE, v2)
    // -----------------------------------------------------------------
    console.log('\n--- SECTION H: REVISION & RESUBMISSION (VERSION INCREMENT) ---');

    // Test 24: Project Owner updates terms on REJECTED agreement
    try {
      const res = await apiRequest('PUT', `/agreements/${activeAgreementId}`, {
        rate: 3200,
      }, poToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.rate, 3200);
      recordPass('Project Owner revises terms on REJECTED agreement', 'Rate: 3200 USDC');
    } catch (e) {
      recordFail('Project Owner revises terms on REJECTED agreement', e);
    }

    // Test 25: Project Owner resubmits revised agreement (increments version to 2, clears rejectionReason)
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/submit`, null, poToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'PENDING_ACCEPTANCE');
      assert.strictEqual(res.data.data.version, 2);
      assert.strictEqual(res.data.data.rejectionReason, null);

      // Verify in DB
      const dbCheck = await prisma.agreement.findUnique({ where: { id: activeAgreementId } });
      assert.strictEqual(dbCheck.status, 'PENDING_ACCEPTANCE');
      assert.strictEqual(dbCheck.version, 2);
      assert.strictEqual(dbCheck.rejectionReason, null);
      assert.strictEqual(dbCheck.rate, 3200);

      recordPass('Resubmission transitions to PENDING_ACCEPTANCE, increments version to 2 & clears rejectionReason in PostgreSQL', 'v2');
    } catch (e) {
      recordFail('Resubmission transitions to PENDING_ACCEPTANCE, increments version to 2 & clears rejectionReason in PostgreSQL', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION I: ACCEPTANCE & IMMUTABILITY (PENDING_ACCEPTANCE -> ACCEPTED)
    // -----------------------------------------------------------------
    console.log('\n--- SECTION I: ACCEPTANCE & IMMUTABILITY ENFORCEMENT ---');

    // Test 26: Project Owner cannot accept agreement (Only Creator can sign)
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/accept`, null, poToken);
      assert.strictEqual(res.status, 403);
      recordPass('Project Owner cannot accept agreement on Creator behalf', '403 Forbidden');
    } catch (e) {
      recordFail('Project Owner cannot accept agreement on Creator behalf', e);
    }

    // Test 27: Attacker cannot accept agreement
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/accept`, null, attackerToken);
      assert.strictEqual(res.status, 403);
      recordPass('Unauthorized user cannot accept agreement', '403 Forbidden');
    } catch (e) {
      recordFail('Unauthorized user cannot accept agreement', e);
    }

    // Test 28: Creator accepts agreement -> ACCEPTED with timestamp
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/accept`, null, creatorToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'ACCEPTED');
      assert.ok(res.data.data.creatorAcceptedAt);

      // Verify in DB
      const dbCheck = await prisma.agreement.findUnique({ where: { id: activeAgreementId } });
      assert.strictEqual(dbCheck.status, 'ACCEPTED');
      assert.ok(dbCheck.creatorAcceptedAt instanceof Date);
      assert.strictEqual(dbCheck.version, 2);

      recordPass('Creator accepts revised agreement -> ACCEPTED with timestamp in PostgreSQL', `Signed: ${dbCheck.creatorAcceptedAt.toISOString()}`);
    } catch (e) {
      recordFail('Creator accepts revised agreement -> ACCEPTED with timestamp in PostgreSQL', e);
    }

    // Test 29: IMMUTABILITY - Accepted agreement CANNOT be edited
    try {
      const res = await apiRequest('PUT', `/agreements/${activeAgreementId}`, { rate: 1000 }, poToken);
      assert.strictEqual(res.status, 400);
      recordPass('IMMUTABILITY: Accepted agreement cannot be edited (400 Bad Request)', 'Blocked');
    } catch (e) {
      recordFail('IMMUTABILITY: Accepted agreement cannot be edited (400 Bad Request)', e);
    }

    // Test 30: IMMUTABILITY - Accepted agreement CANNOT be resubmitted
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/submit`, null, poToken);
      assert.strictEqual(res.status, 400);
      recordPass('IMMUTABILITY: Accepted agreement cannot be resubmitted (400 Bad Request)', 'Blocked');
    } catch (e) {
      recordFail('IMMUTABILITY: Accepted agreement cannot be resubmitted (400 Bad Request)', e);
    }

    // Test 31: IMMUTABILITY - Accepted agreement CANNOT be rejected
    try {
      const res = await apiRequest('POST', `/agreements/${activeAgreementId}/reject`, {
        rejectionReason: 'Attempt to reject accepted agreement',
      }, creatorToken);
      assert.strictEqual(res.status, 400);
      recordPass('IMMUTABILITY: Accepted agreement cannot be rejected (400 Bad Request)', 'Blocked');
    } catch (e) {
      recordFail('IMMUTABILITY: Accepted agreement cannot be rejected (400 Bad Request)', e);
    }

    // -----------------------------------------------------------------
    // AUDIT SECTION J: ADMIN AUDIT DIRECTORY
    // -----------------------------------------------------------------
    console.log('\n--- SECTION J: ADMIN AUDIT DIRECTORY ---');

    // Test 32: Non-admin cannot access admin agreements directory
    try {
      const res = await apiRequest('GET', '/admin/agreements', null, poToken);
      assert.strictEqual(res.status, 403);
      recordPass('Non-admin access to /api/admin/agreements blocked', '403 Forbidden');
    } catch (e) {
      recordFail('Non-admin access to /api/admin/agreements blocked', e);
    }

    // Test 33: Admin can access all agreements directory
    try {
      const res = await apiRequest('GET', '/admin/agreements', null, adminToken);
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
      const found = res.data.data.find((a) => a.id === activeAgreementId);
      assert.ok(found, 'Agreement must appear in Admin audit directory');
      assert.strictEqual(found.status, 'ACCEPTED');
      assert.ok(found.project);
      assert.ok(found.creator);
      assert.ok(found.campaign);
      recordPass('Admin accesses read-only agreement audit directory', '200 OK');
    } catch (e) {
      recordFail('Admin accesses read-only agreement audit directory', e);
    }

  } finally {
    // -----------------------------------------------------------------
    // CLEANUP: REMOVE ONLY TEST RECORDS CREATED BY THIS RUN
    // -----------------------------------------------------------------
    console.log('\n--- CLEANUP: REMOVING ISOLATED TEST RECORDS ---');

    try {
      // 1. Delete agreements
      if (createdAgreementIds.length > 0) {
        const deletedAgreements = await prisma.agreement.deleteMany({
          where: { id: { in: createdAgreementIds } },
        });
        console.log(`🧹 Deleted ${deletedAgreements.count} test agreement(s)`);
      }

      // 2. Delete collaborations
      if (createdCollaborationIds.length > 0) {
        const deletedCollabs = await prisma.collaboration.deleteMany({
          where: { id: { in: createdCollaborationIds } },
        });
        console.log(`🧹 Deleted ${deletedCollabs.count} test collaboration(s)`);
      }

      // 3. Delete applications
      if (createdApplicationIds.length > 0) {
        const deletedApps = await prisma.application.deleteMany({
          where: { id: { in: createdApplicationIds } },
        });
        console.log(`🧹 Deleted ${deletedApps.count} test application(s)`);
      }

      // 4. Delete campaigns
      if (createdCampaignIds.length > 0) {
        const deletedCampaigns = await prisma.campaign.deleteMany({
          where: { id: { in: createdCampaignIds } },
        });
        console.log(`🧹 Deleted ${deletedCampaigns.count} test campaign(s)`);
      }

      // 5. Delete creator profiles
      if (createdCreatorProfileIds.length > 0) {
        const deletedCPs = await prisma.creatorProfile.deleteMany({
          where: { id: { in: createdCreatorProfileIds } },
        });
        console.log(`🧹 Deleted ${deletedCPs.count} test creator profile(s)`);
      }

      // 6. Delete project profiles
      if (createdProjectProfileIds.length > 0) {
        const deletedPPs = await prisma.projectProfile.deleteMany({
          where: { id: { in: createdProjectProfileIds } },
        });
        console.log(`🧹 Deleted ${deletedPPs.count} test project profile(s)`);
      }

      // 7. Delete users
      if (createdUserIds.length > 0) {
        const deletedUsers = await prisma.user.deleteMany({
          where: { id: { in: createdUserIds } },
        });
        console.log(`🧹 Deleted ${deletedUsers.count} test user(s)`);
      }

      // 8. Verify clean state
      const [uCount, agrCount] = await Promise.all([
        prisma.user.count(),
        prisma.agreement.count(),
      ]);
      console.log(`📊 Post-audit database state: Users: ${uCount}, Agreements: ${agrCount}`);
      assert.strictEqual(uCount, 0, 'Database users count must return to baseline (0)');
      assert.strictEqual(agrCount, 0, 'Database agreements count must return to baseline (0)');
      console.log('✨ Cleanup completed cleanly and verified against PostgreSQL.');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup warning/error:', cleanupError);
    }

    if (server) {
      server.close();
    }
  }

  console.log('\n====================================================');
  console.log(`AUDIT SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exitCode = 1;
  }
}

runAudit().then(() => {
  prisma.$disconnect();
}).catch((err) => {
  console.error('FATAL AUDIT RUNNER ERROR:', err);
  prisma.$disconnect();
  process.exit(1);
});
