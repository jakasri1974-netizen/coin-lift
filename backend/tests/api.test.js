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

export const runTests = async () => {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting CrypLift Backend API Test Suite...');
  console.log('--------------------------------------------------');

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
    // 1. Health Check
    const health = await request('/health');
    assert(health.status === 200 && health.body.success === true, 'Health Check GET /api/health');

    // 2. Auth: Register Creator
    const uniqueCreatorEmail = `testcreator_${Date.now()}@cryplift.test`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Test Creator',
      email: uniqueCreatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data.token, 'Auth: Register Creator');
    const creatorToken = regCreator.body.data?.token;

    // 3. Auth: Register Project
    const uniqueProjectEmail = `testproject_${Date.now()}@cryplift.test`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Test Project',
      email: uniqueProjectEmail,
      password: 'Password123!',
      role: 'project',
    });
    assert(regProject.status === 201 && regProject.body.data.token, 'Auth: Register Project');
    const projectToken = regProject.body.data?.token;

    // 4. Auth: Duplicate Email Error
    const dupReg = await request('/auth/register', 'POST', {
      name: 'Duplicate',
      email: uniqueCreatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(dupReg.status === 400 && dupReg.body.success === false, 'Auth: Duplicate Email Error Handling');

    // 5. Auth: Login
    const login = await request('/auth/login', 'POST', {
      email: uniqueCreatorEmail,
      password: 'Password123!',
    });
    assert(login.status === 200 && login.body.data.token, 'Auth: Login Creator');

    // 6. Auth: Invalid Password
    const badLogin = await request('/auth/login', 'POST', {
      email: uniqueCreatorEmail,
      password: 'WrongPassword!',
    });
    assert(badLogin.status === 401, 'Auth: Reject Invalid Password');

    // 7. Creators: Get Creators & Filtering
    const creators = await request('/creators');
    assert(creators.status === 200 && Array.isArray(creators.body.data), 'Creators: GET /api/creators');

    // 8. Projects: Get Projects
    const projects = await request('/projects');
    assert(projects.status === 200 && Array.isArray(projects.body.data), 'Projects: GET /api/projects');

    // 9. Campaigns: Create Campaign (Project token)
    const newCamp = await request('/campaigns', 'POST', {
      title: 'Automated Test Campaign',
      description: 'Campaign created during API test run',
      category: 'Web3',
      budget: '5,000 USDC',
      deliverables: ['1x Video'],
    }, projectToken);
    assert(newCamp.status === 201 && newCamp.body.data._id, 'Campaigns: Create Campaign (Project Authorized)');
    const campaignId = newCamp.body.data?._id;

    // 10. Campaigns: Creator cannot create campaign
    const unauthorizedCamp = await request('/campaigns', 'POST', {
      title: 'Illegal Campaign',
      description: 'Should fail',
    }, creatorToken);
    assert(unauthorizedCamp.status === 403, 'Campaigns: Block Creator from Creating Campaign');

    // 11. Applications: Apply to Campaign (Creator token)
    const apply = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'I would like to review this project!',
    }, creatorToken);
    assert(apply.status === 201 && apply.body.data._id, 'Applications: Apply to Campaign');
    const applicationId = apply.body.data?._id;

    // 12. Applications: Prevent Duplicate Application
    const dupApply = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'Second attempt',
    }, creatorToken);
    assert(dupApply.status === 400, 'Applications: Prevent Duplicate Application');

    // 13. Applications: Accept Application -> Auto Create Collaboration (Project token)
    const acceptApp = await request(`/applications/${applicationId}/status`, 'PUT', {
      status: 'accepted',
    }, projectToken);
    assert(acceptApp.status === 200 && acceptApp.body.data.collaboration, 'Applications: Accept Application & Auto-Create Collaboration');

    // 14. Collaborations: Get My Collaborations
    const collabs = await request('/collaborations/my', 'GET', null, creatorToken);
    assert(collabs.status === 200 && collabs.body.data.length > 0, 'Collaborations: GET /api/collaborations/my');

    // 15. Dashboards: Creator & Project Analytics
    const creatorDash = await request('/dashboard/creator', 'GET', null, creatorToken);
    assert(creatorDash.status === 200 && creatorDash.body.data.totalApplications !== undefined, 'Dashboard: Creator Dashboard Analytics');

    const projectDash = await request('/dashboard/project', 'GET', null, projectToken);
    assert(projectDash.status === 200 && projectDash.body.data.totalCampaigns !== undefined, 'Dashboard: Project Dashboard Analytics');

    console.log('--------------------------------------------------');
    console.log(`📊 API Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('Test Suite Exception:', err);
  }
};

if (process.argv[2] === '--run') {
  runTests();
}
