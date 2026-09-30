import http from 'http';

const API_BASE = 'http://localhost:5000/api';

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

export const runAuthTests = async () => {
  console.log('==================================================');
  console.log('🧪 Running Real Frontend & Backend Auth Integration Verification...');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(` ✅ PASS: ${title}`);
      passed++;
    } else {
      console.log(` ❌ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // 1. Register New Creator Account
    const creatorEmail = `real_creator_${Date.now()}@cryplift.io`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Real Creator User',
      email: creatorEmail,
      password: 'RealPassword123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data.token && regCreator.body.data.role === 'creator', 'A. Creator Registration (Real MongoDB & JWT)');
    const creatorToken = regCreator.body.data?.token;

    // 2. Reject Duplicate Creator Email Registration
    const dupReg = await request('/auth/register', 'POST', {
      name: 'Duplicate Creator',
      email: creatorEmail,
      password: 'RealPassword123!',
      role: 'creator',
    });
    assert(dupReg.status === 400 && dupReg.body.success === false, 'B. Reject Duplicate Email Registration');

    // 3. Test Wrong Password Login (MUST FAIL)
    const wrongLogin = await request('/auth/login', 'POST', {
      email: creatorEmail,
      password: 'WrongPassword999!',
    });
    assert(wrongLogin.status === 401 && wrongLogin.body.success === false, 'D. Reject Login with Incorrect Password');

    // 4. Test Correct Password Login (MUST SUCCEED)
    const correctLogin = await request('/auth/login', 'POST', {
      email: creatorEmail,
      password: 'RealPassword123!',
    });
    assert(correctLogin.status === 200 && correctLogin.body.data.token, 'E. Login with Correct Password');

    // 5. Test Session Persistence via GET /api/auth/me
    const meCheck = await request('/auth/me', 'GET', null, creatorToken);
    assert(meCheck.status === 200 && meCheck.body.data?.user?.email === creatorEmail, 'F. Restore Session via GET /api/auth/me');

    // 6. Test Unauthenticated Access to /api/auth/me (MUST REJECT)
    const invalidMe = await request('/auth/me', 'GET', null, 'invalid_token_xyz');
    assert(invalidMe.status === 401, 'G. Unauthenticated Session Rejection');

    // 7. Register New Project Account
    const projectEmail = `real_project_${Date.now()}@cryplift.io`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Real Project Org',
      email: projectEmail,
      password: 'ProjectPassword123!',
      role: 'project',
    });
    assert(regProject.status === 201 && regProject.body.data.role === 'project', 'I. Separate Project Account Registration');
    const projectToken = regProject.body.data?.token;

    // 8. Verify Role-based Dashboard Access Separation
    const projectDashForCreator = await request('/dashboard/project', 'GET', null, creatorToken);
    assert(projectDashForCreator.status === 403, 'J. Block Creator from Accessing Project Protected Endpoint');

    const projectDashForProject = await request('/dashboard/project', 'GET', null, projectToken);
    assert(projectDashForProject.status === 200, 'K. Allow Project to Access Project Dashboard Endpoint');

    console.log('==================================================');
    console.log(`📊 Auth Verification Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');
  } catch (err) {
    console.error('Integration Test Error:', err);
  }
};

runAuthTests();
