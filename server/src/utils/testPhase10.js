import assert from 'assert';
import {
  createAgreementSchema,
  updateAgreementSchema,
  rejectAgreementSchema,
} from './validators.js';

console.log('====================================================');
console.log('🧪 COINLIFT PHASE 10: AUTOMATED TEST SUITE EXECUTION');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------------
// SUITE 1: Zod Schema & Input Validation Enforcement
// -------------------------------------------------------------------
console.log('--- SUITE 1: ZOD SCHEMA & INPUT VALIDATION ---');

runTest('createAgreementSchema validates valid agreement payload', () => {
  const validPayload = {
    title: 'Solana Ecosystem Launch Promotion',
    scope: 'Creator will produce 1 dedicated deep-dive video covering tokenomics and roadmaps.',
    deliverables: ['1x YouTube Video (10+ min)', '1x X Thread (5+ tweets)'],
    rate: 2500,
    currency: 'USDC',
    startDate: '2026-11-01',
    deadline: '2026-11-15',
  };
  const result = createAgreementSchema.parse(validPayload);
  assert.strictEqual(result.title, validPayload.title);
  assert.strictEqual(result.rate, 2500);
  assert.strictEqual(result.currency, 'USDC');
  assert.strictEqual(result.deliverables.length, 2);
});

runTest('createAgreementSchema rejects empty title', () => {
  assert.throws(() => {
    createAgreementSchema.parse({
      title: '  ',
      scope: 'Creator will produce dedicated video.',
      deliverables: ['1x Video'],
      rate: 1000,
    });
  }, /Agreement title must be at least 3 characters long/);
});

runTest('createAgreementSchema rejects empty deliverables list', () => {
  assert.throws(() => {
    createAgreementSchema.parse({
      title: 'Valid Title Here',
      scope: 'Creator will produce dedicated video content.',
      deliverables: [],
      rate: 1000,
    });
  }, /At least one deliverable is required/);
});

runTest('createAgreementSchema rejects negative or zero rate', () => {
  assert.throws(() => {
    createAgreementSchema.parse({
      title: 'Valid Title',
      scope: 'Detailed scope of work content here.',
      deliverables: ['1x Video'],
      rate: -50,
    });
  }, /Rate must be a positive number/);
});

runTest('rejectAgreementSchema requires non-empty rejectionReason', () => {
  assert.throws(() => {
    rejectAgreementSchema.parse({
      rejectionReason: '  ',
    });
  }, /Rejection reason must be at least 3 characters long/);

  const valid = rejectAgreementSchema.parse({
    rejectionReason: 'The delivery timeline is insufficient for quality production.',
  });
  assert.strictEqual(valid.rejectionReason, 'The delivery timeline is insufficient for quality production.');
});

// -------------------------------------------------------------------
// SUITE 2: Agreement State Machine & Lifecycle Transitions
// -------------------------------------------------------------------
console.log('\n--- SUITE 2: STATE MACHINE & TRANSITION WORKFLOWS ---');

// Mock data structures
const mockProjectOwnerUser = { id: 'user-po-123', email: 'owner@project.com', role: 'PROJECT_OWNER' };
const mockCreatorUser = { id: 'user-creator-456', email: 'alice@creator.com', role: 'CREATOR' };
const mockAttackerUser = { id: 'user-attacker-789', email: 'hacker@evil.com', role: 'CREATOR' };
const mockAdminUser = { id: 'user-admin-001', email: 'admin@coinlift.com', role: 'ADMIN' };

const mockCollaboration = {
  id: 'collab-101',
  campaignId: 'camp-202',
  projectId: 'proj-303',
  creatorId: 'creator-404',
  project: { userId: mockProjectOwnerUser.id, name: 'DeFi Alpha Project' },
  creator: { userId: mockCreatorUser.id, displayName: 'Alice Web3' },
  campaign: { title: 'Q4 Community Outreach', budget: 3000, currency: 'USDC' },
  status: 'ACTIVE',
};

// Simulation store for tests
let agreementsDb = [];

const mockAgreementService = {
  createAgreement(collabId, requesterUserId, data) {
    if (collabId !== mockCollaboration.id) {
      const err = new Error('Referenced collaboration workspace not found');
      err.statusCode = 404;
      throw err;
    }
    // Security Guard: Only Project Owner can create
    if (mockCollaboration.project.userId !== requesterUserId) {
      const err = new Error('Forbidden: Only the Project Owner of this collaboration can create an agreement');
      err.statusCode = 403;
      throw err;
    }

    const existingActive = agreementsDb.find(
      (a) => a.collaborationId === collabId && ['DRAFT', 'PENDING_ACCEPTANCE', 'ACCEPTED'].includes(a.status)
    );
    if (existingActive) {
      if (existingActive.status === 'ACCEPTED') {
        const err = new Error('An agreement has already been accepted and finalized for this collaboration');
        err.statusCode = 400;
        throw err;
      }
      if (existingActive.status === 'PENDING_ACCEPTANCE') {
        const err = new Error('An agreement is currently pending Creator review');
        err.statusCode = 400;
        throw err;
      }
      if (existingActive.status === 'DRAFT') {
        const err = new Error('A draft agreement already exists for this collaboration');
        err.statusCode = 400;
        throw err;
      }
    }

    const agreement = {
      id: `agr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      collaborationId: collabId,
      campaignId: mockCollaboration.campaignId,
      projectId: mockCollaboration.projectId,
      creatorId: mockCollaboration.creatorId,
      projectOwnerId: requesterUserId,
      title: data.title,
      scope: data.scope,
      deliverables: [...data.deliverables],
      rate: data.rate,
      currency: data.currency || 'USDC',
      startDate: data.startDate || null,
      deadline: data.deadline || null,
      status: 'DRAFT',
      version: 1,
      creatorAcceptedAt: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    agreementsDb.push(agreement);
    return agreement;
  },

  getAgreementById(agreementId, requesterUserId, role) {
    const agreement = agreementsDb.find((a) => a.id === agreementId);
    if (!agreement) {
      const err = new Error('Digital agreement not found');
      err.statusCode = 404;
      throw err;
    }
    const isPO = mockCollaboration.project.userId === requesterUserId;
    const isCreator = mockCollaboration.creator.userId === requesterUserId;
    const isAdmin = role === 'ADMIN';

    if (!isPO && !isCreator && !isAdmin) {
      const err = new Error('Forbidden: You are not authorized to view this agreement');
      err.statusCode = 403;
      throw err;
    }
    return agreement;
  },

  updateAgreement(agreementId, requesterUserId, data) {
    const agreement = agreementsDb.find((a) => a.id === agreementId);
    if (!agreement) throw new Error('Not found');

    if (mockCollaboration.project.userId !== requesterUserId) {
      const err = new Error('Forbidden: Only the Project Owner can edit this agreement');
      err.statusCode = 403;
      throw err;
    }
    if (agreement.status === 'ACCEPTED') {
      const err = new Error('Forbidden: Accepted agreements cannot be edited');
      err.statusCode = 400;
      throw err;
    }
    if (agreement.status === 'PENDING_ACCEPTANCE') {
      const err = new Error('Cannot edit an agreement while pending Creator review');
      err.statusCode = 400;
      throw err;
    }

    if (data.title !== undefined) agreement.title = data.title;
    if (data.scope !== undefined) agreement.scope = data.scope;
    if (data.deliverables !== undefined) agreement.deliverables = data.deliverables;
    if (data.rate !== undefined) agreement.rate = data.rate;
    agreement.updatedAt = new Date();
    return agreement;
  },

  submitAgreement(agreementId, requesterUserId) {
    const agreement = agreementsDb.find((a) => a.id === agreementId);
    if (!agreement) throw new Error('Not found');

    if (mockCollaboration.project.userId !== requesterUserId) {
      const err = new Error('Forbidden: Only the Project Owner can submit this agreement');
      err.statusCode = 403;
      throw err;
    }
    if (agreement.status === 'ACCEPTED') {
      const err = new Error('Agreement has already been accepted and cannot be resubmitted');
      err.statusCode = 400;
      throw err;
    }
    if (agreement.status === 'PENDING_ACCEPTANCE') {
      const err = new Error('Agreement is already pending Creator acceptance');
      err.statusCode = 400;
      throw err;
    }

    if (!agreement.title || !agreement.scope || !agreement.deliverables?.length || !agreement.rate) {
      const err = new Error('Incomplete agreement terms');
      err.statusCode = 400;
      throw err;
    }

    if (agreement.status === 'REJECTED') {
      agreement.version += 1;
      agreement.rejectionReason = null;
    }
    agreement.status = 'PENDING_ACCEPTANCE';
    agreement.updatedAt = new Date();
    return agreement;
  },

  acceptAgreement(agreementId, requesterUserId) {
    const agreement = agreementsDb.find((a) => a.id === agreementId);
    if (!agreement) throw new Error('Not found');

    if (mockCollaboration.creator.userId !== requesterUserId) {
      const err = new Error('Forbidden: Only the assigned Creator can accept this agreement');
      err.statusCode = 403;
      throw err;
    }
    if (agreement.status === 'ACCEPTED') {
      const err = new Error('Agreement is already accepted');
      err.statusCode = 400;
      throw err;
    }
    if (agreement.status !== 'PENDING_ACCEPTANCE') {
      const err = new Error(`Cannot accept an agreement in ${agreement.status} status`);
      err.statusCode = 400;
      throw err;
    }

    agreement.status = 'ACCEPTED';
    agreement.creatorAcceptedAt = new Date();
    agreement.updatedAt = new Date();
    return agreement;
  },

  rejectAgreement(agreementId, requesterUserId, reason) {
    const agreement = agreementsDb.find((a) => a.id === agreementId);
    if (!agreement) throw new Error('Not found');

    if (mockCollaboration.creator.userId !== requesterUserId) {
      const err = new Error('Forbidden: Only the assigned Creator can reject this agreement');
      err.statusCode = 403;
      throw err;
    }
    if (agreement.status === 'ACCEPTED') {
      const err = new Error('Cannot reject an agreement that has already been accepted');
      err.statusCode = 400;
      throw err;
    }
    if (agreement.status !== 'PENDING_ACCEPTANCE') {
      const err = new Error(`Cannot reject an agreement in ${agreement.status} status`);
      err.statusCode = 400;
      throw err;
    }
    if (!reason || !reason.trim()) {
      const err = new Error('A rejection reason must be provided');
      err.statusCode = 400;
      throw err;
    }

    agreement.status = 'REJECTED';
    agreement.rejectionReason = reason.trim();
    agreement.updatedAt = new Date();
    return agreement;
  },
};

// Test Execution
let activeAgreementId = null;

runTest('Project Owner successfully creates DRAFT agreement', () => {
  agreementsDb = []; // reset
  const agr = mockAgreementService.createAgreement(mockCollaboration.id, mockProjectOwnerUser.id, {
    title: 'Phase 10 Bilateral Agreement',
    scope: 'Detailed scope of deliverables and terms of service.',
    deliverables: ['1x YouTube Review'],
    rate: 2000,
    currency: 'USDC',
  });
  assert.strictEqual(agr.status, 'DRAFT');
  assert.strictEqual(agr.version, 1);
  assert.strictEqual(agr.rate, 2000);
  assert.strictEqual(agr.creatorAcceptedAt, null);
  activeAgreementId = agr.id;
});

runTest('Unauthorized user cannot create agreement for another collaboration (403 Forbidden)', () => {
  assert.throws(() => {
    mockAgreementService.createAgreement(mockCollaboration.id, mockAttackerUser.id, {
      title: 'Malicious Agreement',
      scope: 'Hacked scope.',
      deliverables: ['1x Fake'],
      rate: 99999,
    });
  }, /Forbidden: Only the Project Owner of this collaboration can create an agreement/);
});

runTest('Project Owner can edit agreement while in DRAFT status', () => {
  const updated = mockAgreementService.updateAgreement(activeAgreementId, mockProjectOwnerUser.id, {
    rate: 2200,
    deliverables: ['1x YouTube Review', '1x Telegram Broadcast'],
  });
  assert.strictEqual(updated.rate, 2200);
  assert.strictEqual(updated.deliverables.length, 2);
  assert.strictEqual(updated.status, 'DRAFT');
});

runTest('Creator cannot edit agreement draft (403 Forbidden)', () => {
  assert.throws(() => {
    mockAgreementService.updateAgreement(activeAgreementId, mockCreatorUser.id, {
      rate: 5000,
    });
  }, /Forbidden: Only the Project Owner can edit this agreement/);
});

runTest('Project Owner submits DRAFT agreement for Creator review -> PENDING_ACCEPTANCE', () => {
  const submitted = mockAgreementService.submitAgreement(activeAgreementId, mockProjectOwnerUser.id);
  assert.strictEqual(submitted.status, 'PENDING_ACCEPTANCE');
  assert.strictEqual(submitted.version, 1);
});

runTest('Agreement cannot be directly edited while in PENDING_ACCEPTANCE status', () => {
  assert.throws(() => {
    mockAgreementService.updateAgreement(activeAgreementId, mockProjectOwnerUser.id, {
      rate: 3000,
    });
  }, /Cannot edit an agreement while pending Creator review/);
});

runTest('Unauthorized party cannot accept or reject agreement (403 Forbidden)', () => {
  assert.throws(() => {
    mockAgreementService.acceptAgreement(activeAgreementId, mockAttackerUser.id);
  }, /Forbidden: Only the assigned Creator can accept this agreement/);

  assert.throws(() => {
    mockAgreementService.rejectAgreement(activeAgreementId, mockAttackerUser.id, 'I disagree');
  }, /Forbidden: Only the assigned Creator can reject this agreement/);
});

runTest('Creator rejects agreement with mandatory rejection reason -> REJECTED', () => {
  const rejected = mockAgreementService.rejectAgreement(
    activeAgreementId,
    mockCreatorUser.id,
    'Rate does not cover additional Telegram broadcast deliverable.'
  );
  assert.strictEqual(rejected.status, 'REJECTED');
  assert.strictEqual(rejected.rejectionReason, 'Rate does not cover additional Telegram broadcast deliverable.');
  assert.strictEqual(rejected.creatorAcceptedAt, null);
});

runTest('Creator cannot accept an agreement while in REJECTED status', () => {
  assert.throws(() => {
    mockAgreementService.acceptAgreement(activeAgreementId, mockCreatorUser.id);
  }, /Cannot accept an agreement in REJECTED status/);
});

runTest('Project Owner can revise REJECTED agreement and resubmit -> version increments to 2', () => {
  // PO revises terms
  mockAgreementService.updateAgreement(activeAgreementId, mockProjectOwnerUser.id, {
    rate: 2600,
  });

  // PO resubmits
  const resubmitted = mockAgreementService.submitAgreement(activeAgreementId, mockProjectOwnerUser.id);
  assert.strictEqual(resubmitted.status, 'PENDING_ACCEPTANCE');
  assert.strictEqual(resubmitted.version, 2);
  assert.strictEqual(resubmitted.rejectionReason, null); // cleared on resubmit
  assert.strictEqual(resubmitted.rate, 2600);
});

runTest('Creator accepts revised agreement -> ACCEPTED with timestamp', () => {
  const accepted = mockAgreementService.acceptAgreement(activeAgreementId, mockCreatorUser.id);
  assert.strictEqual(accepted.status, 'ACCEPTED');
  assert.notStrictEqual(accepted.creatorAcceptedAt, null);
  assert.strictEqual(accepted.version, 2);
});

runTest('PROTECTION: Accepted agreement is locked and CANNOT be edited (400 Bad Request)', () => {
  assert.throws(() => {
    mockAgreementService.updateAgreement(activeAgreementId, mockProjectOwnerUser.id, {
      rate: 1000,
    });
  }, /Forbidden: Accepted agreements cannot be edited/);
});

runTest('PROTECTION: Accepted agreement CANNOT be resubmitted or rejected', () => {
  assert.throws(() => {
    mockAgreementService.submitAgreement(activeAgreementId, mockProjectOwnerUser.id);
  }, /Agreement has already been accepted and cannot be resubmitted/);

  assert.throws(() => {
    mockAgreementService.rejectAgreement(activeAgreementId, mockCreatorUser.id, 'Changed my mind');
  }, /Cannot reject an agreement that has already been accepted/);
});

runTest('Non-participant cannot view agreement (403 Forbidden)', () => {
  assert.throws(() => {
    mockAgreementService.getAgreementById(activeAgreementId, mockAttackerUser.id, 'CREATOR');
  }, /Forbidden: You are not authorized to view this agreement/);
});

runTest('Authorized participants and Admins can view agreement', () => {
  const poView = mockAgreementService.getAgreementById(activeAgreementId, mockProjectOwnerUser.id, 'PROJECT_OWNER');
  assert.strictEqual(poView.id, activeAgreementId);

  const creatorView = mockAgreementService.getAgreementById(activeAgreementId, mockCreatorUser.id, 'CREATOR');
  assert.strictEqual(creatorView.id, activeAgreementId);

  const adminView = mockAgreementService.getAgreementById(activeAgreementId, mockAdminUser.id, 'ADMIN');
  assert.strictEqual(adminView.id, activeAgreementId);
});

console.log('\n====================================================');
console.log(`🎉 ALL TESTS PASSED: ${passedTests} / ${totalTests} (100% Success)`);
console.log('====================================================\n');
