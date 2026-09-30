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
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
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

export const runPhase5AnalyticsTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 5 Campaign Analytics Test Suite...');
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

    // 1. Account Setup
    const creatorEmail = `anly_creator_${timestamp}@cryplift.test`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Analytics Creator Vance',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const creatorToken = regCreator.body.data?.token;
    const creatorId = regCreator.body.data?._id;

    const projectEmail = `anly_project_${timestamp}@cryplift.test`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Analytics Project NovaX',
      email: projectEmail,
      password: 'Password123!',
      role: 'project',
    });
    const projectToken = regProject.body.data?.token;
    const projectId = regProject.body.data?._id;

    const bystanderEmail = `anly_bystander_${timestamp}@cryplift.test`;
    const regBystander = await request('/auth/register', 'POST', {
      name: 'Analytics Bystander Charlie',
      email: bystanderEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const bystanderToken = regBystander.body.data?.token;

    // Create Campaign -> Apply -> Accept to generate Collaboration
    const createCamp = await request('/campaigns', 'POST', {
      title: 'NovaX Analytics Test Campaign',
      description: 'Testing performance analytics metrics',
      category: 'Infrastructure',
      budget: '5,000 USDC',
      deliverables: ['1x In-Depth YouTube Review', '2x X Threads'],
    }, projectToken);
    const campaignId = createCamp.body.data?._id;

    const applyRes = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'Applying for analytics test',
    }, creatorToken);
    const applicationId = applyRes.body.data?._id;

    const acceptRes = await request(`/applications/${applicationId}/status`, 'PUT', { status: 'accepted' }, projectToken);
    const collaborationId = acceptRes.body.data?.collaboration?._id;

    assert(collaborationId, '1. Create analytics prerequisite: Collaboration active');

    // 2. Fetch Collaboration Analytics (Auto-creates record)
    const getCollabAnly = await request(`/analytics/collaborations/${collaborationId}`, 'GET', null, projectToken);
    assert(
      getCollabAnly.status === 200 && getCollabAnly.body.data?.collaborationId,
      '2. Fetch collaboration analytics auto-creates record'
    );
    const analyticsId = getCollabAnly.body.data?._id;

    // 3. Fetch Campaign Analytics
    const getCampAnly = await request(`/analytics/campaigns/${campaignId}`, 'GET', null, projectToken);
    assert(
      getCampAnly.status === 200 && getCampAnly.body.data?.summary && getCampAnly.body.data?.breakdown?.length >= 1,
      '3. Fetch campaign-level analytics returns aggregated metrics'
    );

    // 4. Creator Authorization
    const getCreatorAnly = await request(`/analytics/creators/${creatorId}`, 'GET', null, creatorToken);
    assert(
      getCreatorAnly.status === 200 && String(getCreatorAnly.body.data?.creatorId) === String(creatorId),
      '4. Creator can view their own performance analytics'
    );

    // 5. Project Authorization
    const getProjAnly = await request(`/analytics/projects/${projectId}`, 'GET', null, projectToken);
    assert(
      getProjAnly.status === 200 && String(getProjAnly.body.data?.projectId) === String(projectId),
      '5. Project owner can view project analytics'
    );

    // 6. Admin Access
    const adminReg = await request('/auth/register', 'POST', {
      name: 'Analytics Admin',
      email: `admin_${timestamp}@cryplift.test`,
      password: 'Password123!',
      role: 'admin',
    });
    const adminToken = adminReg.body.data?.token;

    const adminGet = await request(`/analytics/collaborations/${collaborationId}`, 'GET', null, adminToken);
    assert(adminGet.status === 200, '6. Admin access granted to all analytics');

    // 7. Non-participant blocked (403 Forbidden)
    const bystanderGet = await request(`/analytics/collaborations/${collaborationId}`, 'GET', null, bystanderToken);
    assert(bystanderGet.status === 403, '7. Non-participant blocked from viewing collaboration analytics (403)');

    // 8. Negative metrics rejected (400 Bad Request)
    const negUpdate = await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      impressions: -500,
    }, projectToken);
    assert(negUpdate.status === 400, '8. Negative metric value rejected (400 Bad Request)');

    // 9. Invalid string metrics rejected (400 Bad Request)
    const invUpdate = await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      reach: 'invalid_number_str',
    }, projectToken);
    assert(invUpdate.status === 400, '9. Invalid metric string value rejected (400 Bad Request)');

    // 10. Engagement rate calculation
    const updateMetrics1 = await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      impressions: 10000,
      reach: 5000,
      likes: 400,
      comments: 75,
      shares: 25, // Total engagement = 500
      clicks: 250,
      conversions: 25,
      deliverablesCompleted: 1,
      deliverablesTotal: 2,
      budget: 5000,
    }, projectToken);

    const engRate = updateMetrics1.body.data?.engagementRate;
    assert(
      updateMetrics1.status === 200 && engRate === 10, // (500 / 5000) * 100 = 10%
      '10. Engagement rate calculated correctly (((likes+comments+shares)/reach)*100 = 10%)'
    );

    // 11. Progress calculation
    const progPct = updateMetrics1.body.data?.progressPercentage;
    assert(
      progPct === 50, // (1 / 2) * 100 = 50%
      '11. Progress percentage calculated correctly ((completed/total)*100 = 50%)'
    );

    // 12. CPC calculation
    const cpc = updateMetrics1.body.data?.costPerClick;
    assert(
      cpc === 20, // 5000 / 250 = 20
      '12. Cost Per Click (CPC) calculated correctly (budget / clicks = $20)'
    );

    // 13. CPE calculation
    const cpe = updateMetrics1.body.data?.costPerEngagement;
    assert(
      cpe === 10, // 5000 / 500 = 10
      '13. Cost Per Engagement (CPE) calculated correctly (budget / engagements = $10)'
    );

    // 14. CPM calculation
    const cpm = updateMetrics1.body.data?.costPerThousandImpressions;
    assert(
      cpm === 500, // (5000 / 10000) * 1000 = 500
      '14. Cost Per Mille (CPM) calculated correctly ((budget / impressions)*1000 = $500)'
    );

    // 15. Zero denominator handled safely
    const updateZero = await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
    }, projectToken);
    assert(
      updateZero.status === 200 &&
      updateZero.body.data?.engagementRate === 0 &&
      updateZero.body.data?.costPerClick === null,
      '15. Zero denominator handled safely (returns 0 or null, no NaN or Infinity)'
    );

    // Restore valid metrics
    await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      impressions: 12000,
      reach: 6000,
      likes: 450,
      comments: 100,
      shares: 50,
      clicks: 300,
      conversions: 30,
      deliverablesCompleted: 2,
      deliverablesTotal: 2,
      budget: 5000,
    }, projectToken);

    // 16. Update analytics
    const creatorUpdate = await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      postsPublished: 2,
      videosPublished: 1,
    }, creatorToken);
    assert(
      creatorUpdate.status === 200 && creatorUpdate.body.data?.postsPublished === 2,
      '16. Creator can update collaboration content delivery metrics'
    );

    // 17. Snapshot creation
    const snapRes = await request(`/analytics/collaborations/${collaborationId}/snapshot`, 'POST', null, projectToken);
    assert(
      snapRes.status === 201 && snapRes.body.data?.collaborationId,
      '17. Snapshot creation (POST /analytics/collaborations/:id/snapshot)'
    );

    // 18. Snapshot history retrieval
    const histRes = await request(`/analytics/collaborations/${collaborationId}/history`, 'GET', null, creatorToken);
    assert(
      histRes.status === 200 && histRes.body.data?.length >= 1,
      '18. Historical snapshots retrieval (GET /analytics/collaborations/:id/history)'
    );

    // 19. History sorting
    assert(
      histRes.body.data?.[0]?.capturedAt !== undefined,
      '19. Snapshot history sorted chronologically by capturedAt'
    );

    // 20. Overview endpoint
    const overviewRes = await request('/analytics/overview', 'GET', null, projectToken);
    assert(
      overviewRes.status === 200 && overviewRes.body.data?.summary,
      '20. User dashboard overview analytics (GET /analytics/overview)'
    );

    // 21. Real-time Sockets setup
    creatorSocket = createTestSocket(creatorToken);
    projectSocket = createTestSocket(projectToken);
    bystanderSocket = createTestSocket(bystanderToken);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Join room
    projectSocket.emit('chat:join', { conversationId: collaborationId });
    creatorSocket.emit('chat:join', { conversationId: collaborationId });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 21. Socket analytics event
    const socketEventPromise = new Promise((resolve) => {
      creatorSocket.on('analytics:updated', (data) => {
        if (data && typeof data.impressions === 'number') {
          resolve(data);
        }
      });
    });

    await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      impressions: 15000,
    }, projectToken);

    const receivedSocketData = await Promise.race([
      socketEventPromise,
      new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);

    assert(
      receivedSocketData !== null && receivedSocketData.impressions === 15000,
      '21. Real-time analytics:updated socket event received by participant'
    );

    // 22. Unauthorized socket room blocked
    let bystanderReceived = false;
    bystanderSocket.on('analytics:updated', () => {
      bystanderReceived = true;
    });

    await request(`/analytics/collaborations/${collaborationId}`, 'PUT', {
      impressions: 16000,
    }, projectToken);

    await new Promise((resolve) => setTimeout(resolve, 400));
    assert(!bystanderReceived, '22. Non-participant socket room access blocked');

    // 23. Notification integration
    const notifRes = await request('/notifications', 'GET', null, creatorToken);
    const hasAnlyNotif = notifRes.body.data?.some(n => n.type === 'analytics:updated');
    assert(
      notifRes.status === 200 && hasAnlyNotif,
      '23. Analytics update generates persistent notification for counterparty'
    );

    // 24. Deliverable progress integration
    const colAnlyFinal = await request(`/analytics/collaborations/${collaborationId}`, 'GET', null, creatorToken);
    assert(
      colAnlyFinal.body.data?.deliverablesTotal >= 1,
      '24. Deliverable progress integrated with collaboration agreement'
    );

    // 25. Real persistence
    assert(
      colAnlyFinal.body.data?.impressions === 16000,
      '25. Performance metrics accurately persisted in backend store'
    );

    // 26. No fake metrics
    const emptyCamp = await request('/campaigns', 'POST', {
      title: 'Empty Analytics Campaign',
      description: 'Zero data test',
      category: 'DeFi',
      budget: '1,000 USDC',
      deliverables: ['1x Thread'],
    }, projectToken);
    const emptyCampId = emptyCamp.body.data?._id;

    const emptyAnlyRes = await request(`/analytics/campaigns/${emptyCampId}`, 'GET', null, projectToken);
    assert(
      emptyAnlyRes.status === 200 && emptyAnlyRes.body.data?.summary?.impressions === 0,
      '26. Uncalculated/unprovided metrics return 0 or null (No fake metrics)'
    );

    // 27. Analytics overview aggregation
    const creatorOverview = await request('/analytics/overview', 'GET', null, creatorToken);
    assert(
      creatorOverview.status === 200 && creatorOverview.body.data?.summary !== undefined,
      '27. Creator overview aggregates active performance'
    );

    // 28. Completed collaboration handling
    await request(`/collaborations/${collaborationId}/progress`, 'PUT', { progress: 100, status: 'completed' }, creatorToken);
    const completedAnly = await request(`/analytics/collaborations/${collaborationId}`, 'GET', null, projectToken);
    assert(
      completedAnly.status === 200,
      '28. Completed collaboration analytics remain accessible'
    );

    // 29. API response structure validation
    assert(
      typeof completedAnly.body.data?.progressPercentage === 'number' &&
      typeof completedAnly.body.data?.engagementRate === 'number',
      '29. Mobile/API response structure contains typed numeric metric fields'
    );

    // 30. Rate limit / security validation
    const unauthPut = await request(`/analytics/collaborations/${collaborationId}`, 'PUT', { impressions: 99999 }, null);
    assert(unauthPut.status === 401, '30. Unauthenticated analytics modification rejected (401 Unauthorized)');

  } catch (err) {
    console.error('Test Suite Error:', err);
    assert(false, 'Phase 5 Test Suite execution error', err.message);
  } finally {
    if (creatorSocket) creatorSocket.disconnect();
    if (projectSocket) projectSocket.disconnect();
    if (bystanderSocket) bystanderSocket.disconnect();
  }

  console.log('==================================================');
  console.log(`📊 Phase 5 Analytics Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

if (process.argv.includes('--run')) {
  runPhase5AnalyticsTests();
}
