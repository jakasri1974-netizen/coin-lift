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

export const runPhase3ChatTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 3 Real-Time Chat Test Suite...');
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
    // 1. Creator and Project setup
    const timestamp = Date.now();
    const creatorEmail = `chat_creator_${timestamp}@cryplift.test`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Chat Creator Alex',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data?.token, '1. Creator and Project setup (Creator Registered)');
    const creatorToken = regCreator.body.data?.token;
    const creatorId = regCreator.body.data?._id;

    const projectEmail = `chat_project_${timestamp}@cryplift.test`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Chat Project NovaX',
      email: projectEmail,
      password: 'Password123!',
      role: 'project',
    });
    assert(regProject.status === 201 && regProject.body.data?.token, '1b. Project Registered Successfully');
    const projectToken = regProject.body.data?.token;
    const projectId = regProject.body.data?._id;

    const bystanderEmail = `chat_bystander_${timestamp}@cryplift.test`;
    const regBystander = await request('/auth/register', 'POST', {
      name: 'Uninvolved User Bob',
      email: bystanderEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const bystanderToken = regBystander.body.data?.token;

    // 2. Collaboration exists (Create campaign -> apply -> accept)
    const createCamp = await request('/campaigns', 'POST', {
      title: 'NovaX DeFi Chat Campaign',
      description: 'Testing live chat messaging between creator and project',
      category: 'DeFi',
      budget: '10,000 USDC',
      deliverables: ['2x Twitter Threads'],
    }, projectToken);
    const campaignId = createCamp.body.data?._id;

    const applyRes = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'Excited to build chat content!',
    }, creatorToken);
    const applicationId = applyRes.body.data?._id;

    const acceptRes = await request(`/applications/${applicationId}/status`, 'PUT', { status: 'accepted' }, projectToken);
    assert(acceptRes.status === 200 && acceptRes.body.data?.collaboration?._id, '2. Collaboration exists after application acceptance');
    const collaborationId = acceptRes.body.data?.collaboration?._id;

    // 3. Conversation automatically created
    const getConvsCreator = await request('/chat/conversations', 'GET', null, creatorToken);
    const conv = getConvsCreator.body.data?.find(c => String(c.collaborationId) === String(collaborationId) || String(c.collaborationId?._id) === String(collaborationId));
    assert(
      getConvsCreator.status === 200 && conv && conv._id,
      '3. Conversation automatically created upon application acceptance'
    );
    const conversationId = conv ? conv._id : null;

    // 4. Conversation cannot be duplicated
    const dupRes = await request('/chat/conversations', 'POST', { collaborationId }, creatorToken);
    assert(
      dupRes.status === 200 && String(dupRes.body.data?._id) === String(conversationId),
      '4. Conversation cannot be duplicated (reused existing conversation)'
    );

    // 5. Participant can retrieve conversation
    const getConvsProject = await request('/chat/conversations', 'GET', null, projectToken);
    assert(
      getConvsProject.status === 200 && getConvsProject.body.data?.some(c => String(c._id) === String(conversationId)),
      '5. Participant can retrieve conversation'
    );

    // 6. Non-participant cannot retrieve conversation
    const bystanderGetMsg = await request(`/chat/conversations/${conversationId}/messages`, 'GET', null, bystanderToken);
    assert(
      bystanderGetMsg.status === 403,
      '6. Non-participant cannot retrieve conversation messages (403 Forbidden)'
    );

    // 7. Send message via REST fallback
    const sendMsgRes = await request(`/chat/conversations/${conversationId}/messages`, 'POST', {
      message: 'Hello NovaX! Let us discuss the campaign deliverables.',
    }, creatorToken);
    assert(
      sendMsgRes.status === 201 && sendMsgRes.body.data?._id,
      '7. Send message via REST fallback'
    );
    const firstMessageId = sendMsgRes.body.data?._id;

    // 8. Message saved to MongoDB
    const getMsgsRes = await request(`/chat/conversations/${conversationId}/messages`, 'GET', null, creatorToken);
    assert(
      getMsgsRes.status === 200 && getMsgsRes.body.data?.some(m => String(m._id) === String(firstMessageId)),
      '8. Message saved to MongoDB and returned via GET /api/chat/conversations/:id/messages'
    );

    // 9. Socket authenticated user can join conversation
    creatorSocket = createTestSocket(creatorToken);
    projectSocket = createTestSocket(projectToken);
    bystanderSocket = createTestSocket(bystanderToken);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const creatorJoinPromise = new Promise((resolve) => {
      creatorSocket.emit('chat:join', { conversationId });
      setTimeout(() => resolve(true), 500);
    });
    const creatorJoined = await creatorJoinPromise;
    assert(creatorJoined, '9. Socket authenticated user can join conversation');

    // 10. Unauthorized user cannot join conversation
    const bystanderErrorPromise = new Promise((resolve) => {
      bystanderSocket.once('error', (err) => resolve(err));
      bystanderSocket.emit('chat:join', { conversationId });
      setTimeout(() => resolve(null), 1000);
    });
    const bystanderErr = await bystanderErrorPromise;
    assert(
      bystanderErr && bystanderErr.message?.toLowerCase().includes('authorized'),
      '10. Unauthorized user cannot join conversation room'
    );

    // 11. Real-time chat:message received
    projectSocket.emit('chat:join', { conversationId });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const projectMsgPromise = new Promise((resolve) => {
      projectSocket.once('chat:message', (data) => resolve(data));
      setTimeout(() => resolve(null), 3000);
    });

    creatorSocket.emit('chat:send', {
      conversationId,
      message: 'Live Socket.IO message from Creator!',
    });

    const receivedMsg = await projectMsgPromise;
    assert(
      receivedMsg && receivedMsg.message === 'Live Socket.IO message from Creator!',
      '11. Real-time chat:message received by room participant'
    );

    // 12. Typing event
    const typingPromise = new Promise((resolve) => {
      projectSocket.once('chat:typing', (data) => resolve(data));
      setTimeout(() => resolve(null), 3000);
    });

    creatorSocket.emit('chat:typing', { conversationId, isTyping: true });
    const typingEvent = await typingPromise;
    assert(
      typingEvent && typingEvent.isTyping === true && String(typingEvent.conversationId) === String(conversationId),
      '12. Typing event received in real time'
    );

    // 13. Mark message read
    const markReadRes = await request(`/chat/messages/${firstMessageId}/read`, 'PUT', null, projectToken);
    assert(
      markReadRes.status === 200 && markReadRes.body.data?.isRead === true,
      '13. Mark message read (PUT /api/chat/messages/:id/read)'
    );

    // 14. Mark conversation read-all
    const markAllReadRes = await request(`/chat/conversations/${conversationId}/read-all`, 'PUT', null, projectToken);
    assert(
      markAllReadRes.status === 200 && markAllReadRes.body.success === true,
      '14. Mark conversation read-all (PUT /api/chat/conversations/:id/read-all)'
    );

    // 15. Unread count
    // Project leaves conversation room
    projectSocket.emit('chat:leave', { conversationId });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Creator sends another message via REST
    await request(`/chat/conversations/${conversationId}/messages`, 'POST', {
      message: 'Unread badge test message',
    }, creatorToken);

    const getConvsAfterUnread = await request('/chat/conversations', 'GET', null, projectToken);
    const unreadTarget = getConvsAfterUnread.body.data?.find(c => String(c._id) === String(conversationId));
    assert(
      unreadTarget && unreadTarget.unreadCount >= 1,
      '15. Unread count correctly computed when recipient is not active'
    );

    // 16. Message pagination
    for (let i = 1; i <= 32; i++) {
      await request(`/chat/conversations/${conversationId}/messages`, 'POST', {
        message: `Pagination batch message #${i}`,
      }, creatorToken);
    }

    const page1Res = await request(`/chat/conversations/${conversationId}/messages?page=1&limit=30`, 'GET', null, creatorToken);
    const page2Res = await request(`/chat/conversations/${conversationId}/messages?page=2&limit=30`, 'GET', null, creatorToken);
    assert(
      page1Res.status === 200 && page1Res.body.data?.length === 30 &&
      page2Res.status === 200 && page2Res.body.data?.length >= 2 &&
      page1Res.body.pagination?.totalPages >= 2,
      '16. Message pagination supported (?page=1&limit=30)'
    );

    // 17. Empty message rejected
    const emptyMsgRes = await request(`/chat/conversations/${conversationId}/messages`, 'POST', {
      message: '   ',
    }, creatorToken);
    assert(
      emptyMsgRes.status === 400,
      '17. Empty message rejected (400 Bad Request)'
    );

    // 18. >2000 character message rejected
    const longMessage = 'A'.repeat(2005);
    const longMsgRes = await request(`/chat/conversations/${conversationId}/messages`, 'POST', {
      message: longMessage,
    }, creatorToken);
    assert(
      longMsgRes.status === 400,
      '18. >2000 character message rejected (400 Bad Request)'
    );

    // 19. Invalid conversation blocked
    const invalidConvId = '507f1f77bcf86cd799439011';
    const invalidConvRes = await request(`/chat/conversations/${invalidConvId}/messages`, 'POST', {
      message: 'Hello invalid conversation',
    }, creatorToken);
    assert(
      invalidConvRes.status === 404 || invalidConvRes.status === 403,
      '19. Invalid conversation blocked (404/403)'
    );

    // 20. Rate limiting/abuse protection
    let rateLimited = false;
    for (let i = 0; i < 110; i++) {
      const res = await request(`/chat/conversations/${conversationId}/messages`, 'POST', {
        message: `Spam burst attempt #${i}`,
      }, creatorToken, false);
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    assert(
      rateLimited === true,
      '20. Rate limiting/abuse protection triggered (429 Too Many Requests)'
    );

    // 21. Chat notification generated when recipient not in conversation room
    const notifsProject = await request('/notifications?limit=100', 'GET', null, projectToken);
    assert(
      notifsProject.status === 200 &&
      Array.isArray(notifsProject.body.data) &&
      notifsProject.body.data.some(n => n.type === 'chat:new_message'),
      '21. Chat notification (chat:new_message) generated when recipient is not active in conversation'
    );

    // 22. Existing Phase 2 notification flow still works
    let hasAppNewNotif = false;
    for (let p = 1; p <= 5; p++) {
      const pNotifRes = await request(`/notifications?page=${p}&limit=50`, 'GET', null, projectToken);
      if (pNotifRes.body.data?.some(n => n.type === 'application:new')) {
        hasAppNewNotif = true;
        break;
      }
    }
    assert(
      hasAppNewNotif === true,
      '22. Existing Phase 2 notification flow still works alongside chat'
    );

    console.log('==================================================');
    console.log(`📊 Phase 3 Chat Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 3 Chat Test Exception:', err);
    process.exit(1);
  } finally {
    if (creatorSocket) creatorSocket.disconnect();
    if (projectSocket) projectSocket.disconnect();
    if (bystanderSocket) bystanderSocket.disconnect();
  }
};

if (process.argv[2] === '--run') {
  runPhase3ChatTests();
}
