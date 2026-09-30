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

export const runPhase7VerificationTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 7 Creator & Project Verification Test Suite...');
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

    // 1. Admin setup
    const adminEmail = `ver_admin_${timestamp}@cryplift.com`;
    const regAdmin = await request('/auth/register', 'POST', {
      name: 'Verification Admin',
      email: adminEmail,
      password: 'Password123!',
      role: 'admin',
    });
    const adminToken = regAdmin.body.data?.token;

    // 2. Creator setup
    const creatorEmail = `ver_creator_${timestamp}@cryplift.com`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Verifiable Creator Bob',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data?.token, '1. Creator setup');
    const creatorToken = regCreator.body.data?.token;

    // 3. Check initial verification status (unverified)
    const initVerRes = await request('/verification/me', 'GET', null, creatorToken);
    assert(
      initVerRes.status === 200 && initVerRes.body.data?.isVerified !== true,
      '2. User initial verification status is unverified'
    );

    // 4. Submit verification request
    const subVerRes = await request('/verification', 'POST', {
      submittedData: {
        portfolioUrl: 'https://youtube.com/c/verifiablecreatorbob',
        socialHandles: { twitter: '@creatorbob' },
      },
      documents: [{ name: 'ID Document', url: 'https://cdn.cryplift.test/docs/id.pdf', type: 'identity' }],
    }, creatorToken);
    assert(subVerRes.status === 201 && subVerRes.body.data?._id, '3. Creator submits verification request');
    const verificationId = subVerRes.body.data?._id;

    // 5. Prevent duplicate pending verification submission (400)
    const dupSubRes = await request('/verification', 'POST', {
      submittedData: { portfolioUrl: 'https://youtube.com/c/verifiablecreatorbob' },
    }, creatorToken);
    assert(dupSubRes.status === 400, '4. Prevent duplicate pending verification request (400 Bad Request)');

    // 6. Non-admin blocked from admin verification list (403)
    const unauthListRes = await request('/verification/admin/list', 'GET', null, creatorToken);
    assert(unauthListRes.status === 403, '5. Non-admin blocked from admin verification list (403 Forbidden)');

    // 7. Admin views pending verifications
    const adminListRes = await request('/verification/admin/list', 'GET', null, adminToken);
    assert(
      adminListRes.status === 200 && adminListRes.body.data?.some((v) => String(v._id) === String(verificationId)),
      '6. Admin views pending verification requests'
    );

    // 8. Admin approves verification
    const approveRes = await request(`/verification/admin/${verificationId}/approve`, 'PUT', null, adminToken);
    assert(
      approveRes.status === 200 && approveRes.body.data?.status === 'verified',
      '7. Admin approves verification request'
    );

    // 9. Verified user now reflects isVerified = true
    const postVerRes = await request('/verification/me', 'GET', null, creatorToken);
    assert(
      postVerRes.status === 200 && (postVerRes.body.data?.status === 'verified' || postVerRes.body.data?.isVerified === true),
      '8. User verification status reflects verified badge state'
    );

    console.log('==================================================');
    console.log(`📊 Phase 7 Verification Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 7 Verification Test Exception:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '--run') {
  runPhase7VerificationTests();
}
