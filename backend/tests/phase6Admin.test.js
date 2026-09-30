import http from 'http';

const API_BASE = 'http://127.0.0.1:5000/api';

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

    const postData = body ? JSON.stringify(body) : null;

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
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

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

export const runPhase6AdminTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 6 Admin & Moderation Test Suite...');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(` ✅ PASS: ${title}`);
      passed++;
    } else {
      console.log(` ❌ FAIL: ${title} - Details:`, details);
      failed++;
    }
  };

  try {
    const timestamp = Date.now();
    
    // 1. Admin registration & login
    const adminEmail = `admin_${timestamp}@cryplift.com`;
    const regAdmin = await request('/auth/register', 'POST', {
      name: 'Super Admin',
      email: adminEmail,
      password: 'Password123!',
      role: 'admin',
    });
    assert(regAdmin.status === 201 && regAdmin.body.data?.token, '1. Admin account registered', JSON.stringify(regAdmin));
    const adminToken = regAdmin.body.data?.token;

    // 2. Creator registration & login
    const creatorEmail = `mod_creator_${timestamp}@cryplift.com`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Mod Creator Sam',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data?.token, '2. Creator account registered');
    const creatorToken = regCreator.body.data?.token;
    const creatorId = regCreator.body.data?._id;

    // 3. Non-admin blocked from admin dashboard (403)
    const creatorAdminCheck = await request('/admin/dashboard', 'GET', null, creatorToken);
    assert(creatorAdminCheck.status === 403, '3. Non-admin blocked from admin dashboard (403 Forbidden)');

    // 4. Admin accesses admin dashboard statistics
    const adminDashboardRes = await request('/admin/dashboard', 'GET', null, adminToken);
    assert(
      adminDashboardRes.status === 200 && adminDashboardRes.body.data?.totalUsers !== undefined,
      '4. Admin retrieves platform dashboard statistics'
    );

    // 5. Admin lists all users with pagination and search
    const usersListRes = await request('/admin/users?page=1&limit=10', 'GET', null, adminToken);
    assert(
      usersListRes.status === 200 && Array.isArray(usersListRes.body.data) && usersListRes.body.total >= 2,
      '5. Admin lists users with pagination'
    );

    // 6. User submits moderation report
    const reportRes = await request('/admin/reports', 'POST', {
      reportedUserId: creatorId,
      reason: 'Inappropriate content policy concern',
      description: 'Review required for creator promotional pitch',
    }, creatorToken);
    assert(reportRes.status === 201 && reportRes.body.data?._id, '6. User submits moderation report');
    const reportId = reportRes.body.data?._id;

    // 7. Admin views reports
    const getReportsRes = await request('/admin/reports', 'GET', null, adminToken);
    assert(
      getReportsRes.status === 200 && getReportsRes.body.data?.some((r) => String(r._id) === String(reportId)),
      '7. Admin views submitted moderation reports'
    );

    // 8. Admin updates report status
    const updateReportRes = await request(`/admin/reports/${reportId}`, 'PUT', {
      status: 'resolved',
      adminNotes: 'Reviewed and dismissed after audit',
    }, adminToken);
    assert(
      updateReportRes.status === 200 && updateReportRes.body.data?.status === 'resolved',
      '8. Admin updates report status to resolved'
    );

    // 9. Admin suspends user
    const suspendRes = await request(`/admin/users/${creatorId}/status`, 'PUT', {
      isSuspended: true,
    }, adminToken);
    assert(
      suspendRes.status === 200 && suspendRes.body.data?.isSuspended === true,
      '9. Admin suspends user account'
    );

    // 10. Admin activates user back
    const activateRes = await request(`/admin/users/${creatorId}/status`, 'PUT', {
      isSuspended: false,
    }, adminToken);
    assert(
      activateRes.status === 200 && activateRes.body.data?.isSuspended === false,
      '10. Admin activates suspended user account'
    );

    // 11. Admin views audit logs
    const auditRes = await request('/admin/audit-logs', 'GET', null, adminToken);
    assert(
      auditRes.status === 200 && Array.isArray(auditRes.body.data) && auditRes.body.data.length >= 2,
      '11. Admin views system audit logs recording administrative actions'
    );

    console.log('==================================================');
    console.log(`📊 Phase 6 Admin Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 6 Admin Test Exception:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '--run') {
  runPhase6AdminTests();
}
