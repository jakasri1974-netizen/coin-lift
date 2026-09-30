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

export const runPhase10SecurityTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 10 Security & Production Audit Test Suite...');
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

  try {
    const timestamp = Date.now();

    // 1. Health check returns 200 with environment
    const healthRes = await request('/health', 'GET');
    assert(healthRes.status === 200 && healthRes.body.success === true, '1. Health endpoint GET /api/health returns 200 OK');

    // 2. Unauthenticated user rejected on protected endpoints (401)
    const unauthRes = await request('/auth/me', 'GET');
    assert(unauthRes.status === 401, '2. Unauthenticated user rejected with 401 Unauthorized');

    // 3. Register user
    const userEmail = `sec_user_${timestamp}@cryplift.com`;
    const regRes = await request('/auth/register', 'POST', {
      name: 'Security User',
      email: userEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(regRes.status === 201 && regRes.body.data?.token, '3. Register user successfully');
    const userToken = regRes.body.data?.token;

    // 4. API responses do not expose user passwords or JWT secrets
    const meRes = await request('/auth/me', 'GET', null, userToken);
    assert(
      meRes.status === 200 && meRes.body.data?.password === undefined,
      '4. Sensitive fields (password) excluded from user API responses'
    );

    // 5. Invalid JWT token rejected with 401
    const invalidJwtRes = await request('/auth/me', 'GET', null, 'invalid_jwt_token_format');
    assert(invalidJwtRes.status === 401, '5. Malformed or invalid JWT token rejected (401)');

    // 6. User role escalation attempt blocked
    const roleEscalationRes = await request('/creators/me', 'PUT', {
      role: 'admin',
    }, userToken);
    assert(
      roleEscalationRes.status === 200 && roleEscalationRes.body.data?.role !== 'admin',
      '6. User role escalation attempt prevented'
    );

    console.log('==================================================');
    console.log(`📊 Phase 10 Security Audit Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 10 Security Test Exception:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '--run') {
  runPhase10SecurityTests();
}
