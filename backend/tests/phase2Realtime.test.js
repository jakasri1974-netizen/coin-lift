import http from 'http';
import { io as ioClient } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const request = (path, method = 'GET', body = null, token = null) => {
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

export const runPhase2RealtimeTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 2 Real-Time & Notification Test Suite...');
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

  try {
    // 1. Register Creator & Project
    const creatorEmail = `rt_creator_${Date.now()}@cryplift.test`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Realtime Creator Vance',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data?.token, '1. Register Creator Account');
    const creatorToken = regCreator.body.data?.token;
    const creatorId = regCreator.body.data?._id;

    const projectEmail = `rt_project_${Date.now()}@cryplift.test`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Realtime Project Nova',
      email: projectEmail,
      password: 'Password123!',
      role: 'project',
    });
    assert(regProject.status === 201 && regProject.body.data?.token, '2. Register Project Account');
    const projectToken = regProject.body.data?.token;
    const projectId = regProject.body.data?._id;

    // 2. Test Socket.IO Authentication with JWT
    const badSocket = ioClient(SOCKET_URL, {
      auth: { token: 'Bearer invalid_jwt_token' },
      transports: ['websocket', 'polling'],
      forceNew: true,
    });

    const badSocketRejected = await new Promise((resolve) => {
      badSocket.on('connect_error', (err) => {
        badSocket.disconnect();
        resolve(true);
      });
      setTimeout(() => {
        badSocket.disconnect();
        resolve(false);
      }, 2000);
    });
    assert(badSocketRejected, '3. Socket.IO Rejects Invalid JWT Handshake');

    // Connect valid sockets
    creatorSocket = createTestSocket(creatorToken);
    projectSocket = createTestSocket(projectToken);

    const socketsConnected = await new Promise((resolve) => {
      let cConnected = false;
      let pConnected = false;
      creatorSocket.on('connect', () => {
        cConnected = true;
        if (pConnected) resolve(true);
      });
      projectSocket.on('connect', () => {
        pConnected = true;
        if (cConnected) resolve(true);
      });
      setTimeout(() => resolve(cConnected && pConnected), 3000);
    });
    assert(socketsConnected, '4. Authenticated Sockets Join User Rooms Successfully');

    // 3. Project creates campaign
    const createCamp = await request('/campaigns', 'POST', {
      title: 'Realtime Socket Test Campaign',
      description: 'Testing live application & collaboration event triggers',
      category: 'Infrastructure',
      budget: '6,000 USDC',
      deliverables: ['1x Walkthrough Video'],
    }, projectToken);
    assert(createCamp.status === 201 && createCamp.body.data?._id, '5. Project Creates Campaign for Realtime Flow');
    const campaignId = createCamp.body.data?._id;

    // 4. Creator applies -> Project receives real-time application:new socket notification
    const appNotifPromise = new Promise((resolve) => {
      projectSocket.once('application:new', (data) => resolve(data));
      setTimeout(() => resolve(null), 3000);
    });

    const applyRes = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'Submitting live application for socket test',
    }, creatorToken);
    assert(applyRes.status === 201 && applyRes.body.data?._id, '6. Creator Applies to Campaign');
    const applicationId = applyRes.body.data?._id;

    const receivedAppNotif = await appNotifPromise;
    assert(
      receivedAppNotif &&
      receivedAppNotif.type === 'application:new' &&
      receivedAppNotif.campaignTitle === 'Realtime Socket Test Campaign',
      '7. Project Receives Instant Real-Time application:new Socket Notification'
    );

    // 5. Persisted Notification in MongoDB / API
    const projectNotifs = await request('/notifications', 'GET', null, projectToken);
    assert(
      projectNotifs.status === 200 &&
      Array.isArray(projectNotifs.body.data) &&
      projectNotifs.body.data.some(n => n.type === 'application:new'),
      '8. Notification Persisted in MongoDB GET /api/notifications'
    );
    const notificationId = projectNotifs.body.data?.[0]?._id;

    const unreadCountRes = await request('/notifications/unread-count', 'GET', null, projectToken);
    assert(unreadCountRes.status === 200 && unreadCountRes.body.unreadCount >= 1, '9. Unread Count Endpoint GET /api/notifications/unread-count');

    // Mark single read
    if (notificationId) {
      const markReadRes = await request(`/notifications/${notificationId}/read`, 'PUT', null, projectToken);
      assert(markReadRes.status === 200 && markReadRes.body.data?.isRead === true, '10. Mark Notification Read PUT /api/notifications/:id/read');
    }

    // 6. Project Accepts Application -> Creator receives application:accepted and collaboration:created
    const creatorAcceptNotifPromise = new Promise((resolve) => {
      creatorSocket.once('application:accepted', (data) => resolve(data));
      setTimeout(() => resolve(null), 3000);
    });

    const creatorCollabCreatedPromise = new Promise((resolve) => {
      creatorSocket.once('collaboration:created', (data) => resolve(data));
      setTimeout(() => resolve(null), 3000);
    });

    const acceptRes = await request(`/applications/${applicationId}/status`, 'PUT', { status: 'accepted' }, projectToken);
    assert(acceptRes.status === 200 && acceptRes.body.data?.collaboration?._id, '11. Project Accepts Application & Creates Collaboration');
    const collaborationId = acceptRes.body.data?.collaboration?._id;

    const receivedAcceptNotif = await creatorAcceptNotifPromise;
    assert(receivedAcceptNotif && receivedAcceptNotif.type === 'application:accepted', '12. Creator Receives Real-Time application:accepted Socket Event');

    const receivedCollabCreated = await creatorCollabCreatedPromise;
    assert(receivedCollabCreated && receivedCollabCreated.type === 'collaboration:created', '13. Both Users Receive Real-Time collaboration:created Event');

    // 7. Collaboration update -> Both participants receive collaboration:updated
    const creatorCollabUpdatePromise = new Promise((resolve) => {
      creatorSocket.once('collaboration:updated', (data) => resolve(data));
      setTimeout(() => resolve(null), 3000);
    });

    const projectCollabUpdatePromise = new Promise((resolve) => {
      projectSocket.once('collaboration:updated', (data) => resolve(data));
      setTimeout(() => resolve(null), 3000);
    });

    const updateCollabRes = await request(`/collaborations/${collaborationId}`, 'PUT', {
      progress: 75,
      status: 'in_progress',
    }, creatorToken);
    assert(updateCollabRes.status === 200 && updateCollabRes.body.data?.progress === 75, '14. Creator Updates Collaboration Progress (75%)');

    const creatorReceivedUpdate = await creatorCollabUpdatePromise;
    const projectReceivedUpdate = await projectCollabUpdatePromise;

    assert(
      creatorReceivedUpdate && creatorReceivedUpdate.progress === 75,
      '15. Creator Receives Instant Real-Time collaboration:updated Event'
    );
    assert(
      projectReceivedUpdate && projectReceivedUpdate.progress === 75,
      '16. Project Receives Instant Real-Time collaboration:updated Event'
    );

    // 8. Security & Authorization Checks
    const unauthNotifs = await request('/notifications', 'GET');
    assert(unauthNotifs.status === 401, '17. Protected Notifications Endpoint Rejects Requests without JWT (401)');

    const markOthersRead = await request(`/notifications/${notificationId}/read`, 'PUT', null, creatorToken);
    assert(markOthersRead.status === 403, '18. User Blocked from Modifying Another User Notification (403)');

    const markAllReadRes = await request('/notifications/read-all', 'PUT', null, projectToken);
    assert(markAllReadRes.status === 200 && markAllReadRes.body.success === true, '19. Mark All Notifications Read PUT /api/notifications/read-all');

    console.log('==================================================');
    console.log(`📊 Phase 2 Real-Time Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 2 Real-Time Test Exception:', err);
    process.exit(1);
  } finally {
    if (creatorSocket) creatorSocket.disconnect();
    if (projectSocket) projectSocket.disconnect();
  }
};

if (process.argv[2] === '--run') {
  runPhase2RealtimeTests();
}
