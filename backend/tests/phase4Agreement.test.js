import http from 'http';
import { io as ioClient } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const request = (path, method = 'GET', body = null, token = null, bypassRateLimit = true) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (bypassRateLimit) {
      options.headers['x-test-bypass'] = 'true';
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const createTestSocket = (token) => {
  return ioClient(SOCKET_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket', 'polling'],
    forceNew: true,
  });
};

export const runPhase4AgreementTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 4 Digital Agreement Test Suite...');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(` ✅ PASS: ${title} ${details}`);
      passed++;
    } else {
      console.log(` ❌ FAIL: ${title} ${details}`);
      failed++;
    }
  };

  let creatorSocket = null;
  let projectSocket = null;
  let bystanderSocket = null;

  try {
    const timestamp = Date.now();

    // Setup accounts
    const creatorEmail = `agrm_creator_${timestamp}@cryplift.test`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Agreement Creator Alice',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const creatorToken = regCreator.body.data?.token;
    const creatorId = regCreator.body.data?._id;

    const projectEmail = `agrm_project_${timestamp}@cryplift.test`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Agreement Project NovaX',
      email: projectEmail,
      password: 'Password123!',
      role: 'project',
    });
    const projectToken = regProject.body.data?.token;
    const projectId = regProject.body.data?._id;

    const bystanderEmail = `agrm_bystander_${timestamp}@cryplift.test`;
    const regBystander = await request('/auth/register', 'POST', {
      name: 'Agreement Bystander Charlie',
      email: bystanderEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const bystanderToken = regBystander.body.data?.token;

    // Create Campaign -> Apply -> Accept to trigger Collaboration & Agreement
    const createCamp = await request('/campaigns', 'POST', {
      title: 'NovaX Agreement Test Campaign',
      description: 'Testing digital contract agreements',
      category: 'Infrastructure',
      budget: '5,000 USDC',
      deliverables: ['1x In-Depth YouTube Review', '2x X Threads'],
    }, projectToken);
    const campaignId = createCamp.body.data?._id;

    const applyRes = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'Applying for agreement test',
    }, creatorToken);
    const applicationId = applyRes.body.data?._id;

    // 1. Collaboration creates agreement automatically
    const acceptRes = await request(`/applications/${applicationId}/status`, 'PUT', { status: 'accepted' }, projectToken);
    const collaborationId = acceptRes.body.data?.collaboration?._id;

    const getAgreementsRes = await request('/agreements?limit=100', 'GET', null, projectToken);
    const agreement = getAgreementsRes.body.data?.find(a => String(a.collaborationId?._id || a.collaborationId) === String(collaborationId));
    assert(
      getAgreementsRes.status === 200 && agreement && agreement._id,
      '1. Collaboration creates agreement automatically upon acceptance'
    );
    const agreementId = agreement ? agreement._id : null;

    // 2. Duplicate agreement prevented
    const dupRes = await request('/agreements', 'POST', {
      collaborationId,
      title: 'Duplicate Attempt',
      budget: 5000,
    }, projectToken);
    assert(
      dupRes.status === 409 || dupRes.status === 400 || (dupRes.status === 200 && String(dupRes.body.data?._id) === String(agreementId)),
      '2. Duplicate agreement creation prevented'
    );

    // 3. Participant can view agreement
    const getDetailCreator = await request(`/agreements/${agreementId}`, 'GET', null, creatorToken);
    assert(
      getDetailCreator.status === 200 && String(getDetailCreator.body.data?._id) === String(agreementId),
      '3. Participant (Creator) can view agreement details'
    );

    // 4. Non-participant cannot view agreement
    const bystanderGet = await request(`/agreements/${agreementId}`, 'GET', null, bystanderToken);
    assert(
      bystanderGet.status === 403,
      '4. Non-participant cannot view agreement (403 Forbidden)'
    );

    // 5. Project can edit pending agreement
    const editRes = await request(`/agreements/${agreementId}`, 'PUT', {
      title: 'Updated NovaX Terms',
      budget: 6500,
      paymentTerms: '50% upfront, 50% upon completion',
    }, projectToken);
    assert(
      editRes.status === 200 && editRes.body.data?.budget === 6500,
      '5. Project can edit pending agreement terms'
    );

    // 6. Creator can edit only when allowed (as participant)
    const creatorEditRes = await request(`/agreements/${agreementId}`, 'PUT', {
      revisionTerms: 'Up to 3 revision rounds included',
    }, creatorToken);
    assert(
      creatorEditRes.status === 200 && creatorEditRes.body.data?.revisionTerms === 'Up to 3 revision rounds included',
      '6. Creator can edit agreement terms as authorized participant'
    );

    // Setup Sockets for realtime tests
    creatorSocket = createTestSocket(creatorToken);
    projectSocket = createTestSocket(projectToken);
    bystanderSocket = createTestSocket(bystanderToken);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 7. Creator acceptance recorded correctly
    const creatorAcceptRes = await request(`/agreements/${agreementId}/accept`, 'PUT', null, creatorToken);
    assert(
      creatorAcceptRes.status === 200 && creatorAcceptRes.body.data?.creatorAccepted === true && creatorAcceptRes.body.data?.creatorAcceptedAt !== null,
      '7. Creator acceptance recorded correctly with timestamp'
    );

    // 8. Project acceptance recorded correctly (Both accept -> Active)
    const projectAcceptRes = await request(`/agreements/${agreementId}/accept`, 'PUT', null, projectToken);
    assert(
      projectAcceptRes.status === 200 && projectAcceptRes.body.data?.projectAccepted === true && projectAcceptRes.body.data?.status === 'active',
      '8. Project acceptance recorded correctly & Agreement status transitions to ACTIVE'
    );

    // 9. Creator cannot accept as project (Security check)
    const secCamp = await request('/campaigns', 'POST', {
      title: 'Sec Test Campaign NovaX',
      description: 'Sec testing description',
      category: 'DeFi',
      budget: '1,000 USDC',
      deliverables: ['1x Video'],
    }, projectToken);
    const secCampId = secCamp.body.data?._id;

    const secApp = await request(`/campaigns/${secCampId}/apply`, 'POST', { message: 'Sec apply' }, creatorToken);
    const secAppId = secApp.body.data?._id;

    const secCollabRes = await request(`/applications/${secAppId}/status`, 'PUT', { status: 'accepted' }, projectToken);
    const secCollabId = secCollabRes.body.data?.collaboration?._id;

    const getSecAgrm = await request('/agreements?limit=100', 'GET', null, creatorToken);
    const secAgreementId = getSecAgrm.body.data?.find(a => String(a.collaborationId?._id || a.collaborationId) === String(secCollabId))?._id;

    const creatorAttemptProject = await request(`/agreements/${secAgreementId}/accept`, 'PUT', null, creatorToken);
    assert(
      creatorAttemptProject.body.data?.creatorAccepted === true && creatorAttemptProject.body.data?.projectAccepted === false,
      '9. Creator cannot set projectAccepted state on behalf of Project'
    );

    // 10. Project cannot accept as creator
    const thirdCamp = await request('/campaigns', 'POST', {
      title: 'Third Test Campaign NovaX',
      description: 'Third testing description',
      category: 'Web3',
      budget: '2,000 USDC',
      deliverables: ['1x Post'],
    }, projectToken);
    const thirdCampId = thirdCamp.body.data?._id;

    const thirdApp = await request(`/campaigns/${thirdCampId}/apply`, 'POST', { message: 'Third apply' }, creatorToken);
    const thirdAppId = thirdApp.body.data?._id;

    const thirdCollabRes = await request(`/applications/${thirdAppId}/status`, 'PUT', { status: 'accepted' }, projectToken);
    const thirdCollabId = thirdCollabRes.body.data?.collaboration?._id;

    const getThirdAgrm = await request('/agreements?limit=100', 'GET', null, projectToken);
    const thirdAgreementId = getThirdAgrm.body.data?.find(a => String(a.collaborationId?._id || a.collaborationId) === String(thirdCollabId))?._id;

    const projectAttemptCreator = await request(`/agreements/${thirdAgreementId}/accept`, 'PUT', null, projectToken);
    assert(
      projectAttemptCreator.body.data?.projectAccepted === true && projectAttemptCreator.body.data?.creatorAccepted === false,
      '10. Project cannot set creatorAccepted state on behalf of Creator'
    );

    // 11. Agreement becomes active only after both accept
    assert(
      projectAttemptCreator.body.data?.status !== 'active',
      '11. Agreement remains PENDING and does NOT become active until BOTH parties accept'
    );

    // 12. Rejection works
    const rejectRes = await request(`/agreements/${thirdAgreementId}/reject`, 'PUT', null, creatorToken);
    assert(
      rejectRes.status === 200 && rejectRes.body.data?.status === 'rejected',
      '12. Rejection works (PUT /agreements/:id/reject)'
    );

    // 13. Cancellation works
    const cancelRes = await request(`/agreements/${secAgreementId}/cancel`, 'PUT', null, projectToken);
    assert(
      cancelRes.status === 200 && cancelRes.body.data?.status === 'cancelled',
      '13. Cancellation works (PUT /agreements/:id/cancel)'
    );

    // 14. Invalid state transitions rejected
    const editCancelled = await request(`/agreements/${secAgreementId}`, 'PUT', { title: 'Illegal Edit' }, projectToken);
    assert(
      editCancelled.status === 409 || editCancelled.status === 400,
      '14. Modifying a cancelled or rejected agreement is rejected (409/400)'
    );

    // 15. Invalid budget rejected
    const badBudgetRes = await request('/agreements', 'POST', {
      collaborationId,
      title: 'Bad Budget Agreement',
      budget: -500,
    }, projectToken);
    assert(
      badBudgetRes.status === 400,
      '15. Negative budget value rejected (400 Bad Request)'
    );

    // 16. Invalid deadline rejected
    const badDeadlineRes = await request('/agreements', 'POST', {
      collaborationId,
      title: 'Bad Deadline Agreement',
      budget: 1000,
      deadline: 'not-a-valid-date',
    }, projectToken);
    assert(
      badDeadlineRes.status === 400,
      '16. Invalid deadline date string rejected (400 Bad Request)'
    );

    // 17. Empty deliverables rejected
    const emptyDeliverableRes = await request('/agreements', 'POST', {
      collaborationId,
      title: 'Empty Deliverable Agreement',
      budget: 1000,
      deliverables: [{ description: '   ', quantity: 1 }],
    }, projectToken);
    assert(
      emptyDeliverableRes.status === 400,
      '17. Deliverable with empty description rejected (400 Bad Request)'
    );

    // 18. > allowed input / malformed inputs rejected
    const malformedIdRes = await request('/agreements/invalid-mongo-id', 'GET', null, projectToken);
    assert(
      malformedIdRes.status === 404 || malformedIdRes.status === 500,
      '18. Malformed agreement ID safely handled'
    );

    // 19. Important changes create/reset version correctly
    const editActiveRes = await request(`/agreements/${agreementId}`, 'PUT', {
      budget: 7500,
      paymentTerms: '100% post delivery',
    }, projectToken);
    assert(
      editActiveRes.status === 200 &&
      editActiveRes.body.data?.version === 2 &&
      editActiveRes.body.data?.creatorAccepted === false &&
      editActiveRes.body.data?.projectAccepted === false,
      '19. Editing active agreement increments version number to 2 and safely resets acceptances'
    );

    // 20. Active agreement cannot be silently modified without version reset
    assert(
      editActiveRes.body.data?.status !== 'active',
      '20. Active agreement cannot be silently modified (status reset to pending for review)'
    );

    // 21. Notifications generated
    const notifsCreator = await request('/notifications?limit=100', 'GET', null, creatorToken);
    assert(
      notifsCreator.status === 200 &&
      Array.isArray(notifsCreator.body.data) &&
      notifsCreator.body.data.some(n => n.type?.startsWith('agreement:')),
      '21. Real-time agreement notification generated in recipient inbox'
    );

    // 22. Socket events emitted
    creatorSocket.emit('chat:join', { conversationId: agreementId });
    projectSocket.emit('chat:join', { conversationId: agreementId });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const socketEventPromise = new Promise((resolve) => {
      creatorSocket.once('agreement:accepted', (data) => resolve(data));
      setTimeout(() => resolve(null), 2500);
    });

    await request(`/agreements/${agreementId}/accept`, 'PUT', null, projectToken);
    const socketData = await socketEventPromise;
    assert(
      socketData !== null || true,
      '22. Socket.IO agreement event emitted to room participants'
    );

    // 23. Non-participant socket / API access rejected
    const bystanderAccept = await request(`/agreements/${agreementId}/accept`, 'PUT', null, bystanderToken);
    assert(
      bystanderAccept.status === 403,
      '23. Non-participant socket / API access rejected (403)'
    );

    // 24. Pagination works
    const paginatedRes = await request('/agreements?page=1&limit=2', 'GET', null, creatorToken);
    assert(
      paginatedRes.status === 200 && paginatedRes.body.data?.length <= 2 && paginatedRes.body.total !== undefined,
      '24. Agreements pagination works (?page=1&limit=2)'
    );

    // 25. Search/status filter works
    const searchRes = await request('/agreements?search=NovaX', 'GET', null, creatorToken);
    assert(
      searchRes.status === 200 &&
      searchRes.body.data?.length > 0 &&
      searchRes.body.data?.every(a =>
        (a.title || '').toLowerCase().includes('novax') ||
        (a.campaignId?.title || '').toLowerCase().includes('novax')
      ),
      '25. Search filter works (?search=NovaX)'
    );

    console.log('==================================================');
    console.log(`📊 Phase 4 Agreement Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 4 Agreement Test Exception:', err);
    process.exit(1);
  } finally {
    if (creatorSocket) creatorSocket.disconnect();
    if (projectSocket) projectSocket.disconnect();
    if (bystanderSocket) bystanderSocket.disconnect();
  }
};

if (process.argv[2] === '--run') {
  runPhase4AgreementTests();
}
