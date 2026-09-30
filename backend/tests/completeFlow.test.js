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

export const runCompleteFlowTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Real Application Review & Collaboration Test Suite...');
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
    // TEST A: Create/login Project
    const projectEmail = `proj_flow_${Date.now()}@cryplift.test`;
    const regProj = await request('/auth/register', 'POST', {
      name: 'Alpha Infra Project',
      email: projectEmail,
      password: 'ProjectPassword123!',
      role: 'project',
    });
    assert(regProj.status === 201 && regProj.body.data?.token, 'TEST A: Create & Login Project Account');
    const projectToken = regProj.body.data?.token;

    // TEST B: Create campaign
    const campTitle = `Alpha Infra Mainnet Launch ${Date.now()}`;
    const createCamp = await request('/campaigns', 'POST', {
      title: campTitle,
      description: 'Educational campaign for Alpha mainnet launch.',
      category: 'Infrastructure',
      budget: '10,000 USDC',
      deliverables: ['1x Video Review', '2x X Threads'],
    }, projectToken);
    assert(createCamp.status === 201 && createCamp.body.data?._id, 'TEST B: Project Creates Campaign in MongoDB');
    const campaignId1 = createCamp.body.data?._id;

    // Create a 2nd campaign for rejection test
    const createCamp2 = await request('/campaigns', 'POST', {
      title: `Alpha Extra Brief ${Date.now()}`,
      description: 'Second campaign for rejection testing.',
      category: 'DeFi',
      budget: '2,500 USDC',
      deliverables: ['1x Thread'],
    }, projectToken);
    const campaignId2 = createCamp2.body.data?._id;

    // TEST C: Create/login Creator
    const creatorEmail = `creator_flow_${Date.now()}@cryplift.test`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Vance Tech Creator',
      email: creatorEmail,
      password: 'CreatorPassword123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data?.token, 'TEST C: Create & Login Creator Account');
    const creatorToken = regCreator.body.data?.token;

    // TEST D: Creator applies
    const apply1 = await request(`/campaigns/${campaignId1}/apply`, 'POST', {
      message: 'I would love to review Alpha Infra on YouTube!',
    }, creatorToken);
    assert(apply1.status === 201 && apply1.body.data?._id, 'TEST D1: Creator Applies to Campaign 1');
    const applicationId1 = apply1.body.data?._id;

    const apply2 = await request(`/campaigns/${campaignId2}/apply`, 'POST', {
      message: 'Applying for second campaign.',
    }, creatorToken);
    assert(apply2.status === 201 && apply2.body.data?._id, 'TEST D2: Creator Applies to Campaign 2');
    const applicationId2 = apply2.body.data?._id;

    // TEST E: Project sees application
    const projectApps = await request('/applications/my', 'GET', null, projectToken);
    const foundApp1 = projectApps.body.data?.find(a => a._id === applicationId1);
    assert(projectApps.status === 200 && !!foundApp1, 'TEST E: Project Sees Submitted Application in Dashboard');

    // TEST F: Project accepts application 1
    const acceptRes = await request(`/applications/${applicationId1}/status`, 'PUT', {
      status: 'accepted',
    }, projectToken);
    const acceptedApp = acceptRes.body.data?.application;
    const createdCollab = acceptRes.body.data?.collaboration;

    assert(
      acceptRes.status === 200 &&
      acceptedApp?.status === 'accepted' &&
      createdCollab &&
      createdCollab.status === 'active' &&
      createdCollab.progress === 0,
      'TEST F: Project Accepts Application -> Application=accepted, Collaboration=active, progress=0'
    );
    const collaborationId = createdCollab?._id;

    // Verify duplicate Accept click handles safely without creating duplicate collaboration
    const acceptRes2 = await request(`/applications/${applicationId1}/status`, 'PUT', {
      status: 'accepted',
    }, projectToken);
    assert(acceptRes2.status === 200 && acceptRes2.body.data?.collaboration?._id === collaborationId, 'TEST F2: Safe Handling of Duplicate Accept Click');

    // TEST G: Creator dashboard shows accepted collaboration
    const creatorCollabs = await request('/collaborations/my', 'GET', null, creatorToken);
    const foundCreatorCollab = creatorCollabs.body.data?.find(c => c._id === collaborationId);
    assert(creatorCollabs.status === 200 && !!foundCreatorCollab, 'TEST G: Creator Dashboard Sees Active Collaboration');

    // TEST H: Update collaboration progress
    const updateCollabRes = await request(`/collaborations/${collaborationId}`, 'PUT', {
      progress: 65,
      status: 'in_progress',
      performance: {
        views: 8500,
        likes: 620,
        reach: '15.2K',
        engagement: '7.3%',
      }
    }, creatorToken);

    assert(
      updateCollabRes.status === 200 &&
      updateCollabRes.body.data?.progress === 65 &&
      updateCollabRes.body.data?.status === 'in_progress' &&
      updateCollabRes.body.data?.performance?.views === 8500,
      'TEST H: Authorized Creator Updates Collaboration Progress (65%) & Performance Metrics'
    );

    // TEST I: Verify Project and Creator see updated data
    const projectCollabs = await request('/collaborations/my', 'GET', null, projectToken);
    const updatedProjCollab = projectCollabs.body.data?.find(c => c._id === collaborationId);
    assert(projectCollabs.status === 200 && updatedProjCollab?.progress === 65, 'TEST I: Project Sees Updated Collaboration Progress');

    // TEST J: Reject another application
    const rejectRes = await request(`/applications/${applicationId2}/status`, 'PUT', {
      status: 'rejected',
    }, projectToken);
    assert(
      rejectRes.status === 200 &&
      rejectRes.body.data?.application?.status === 'rejected' &&
      !rejectRes.body.data?.collaboration,
      'TEST J: Project Rejects Application -> Status=rejected, No Collaboration Created'
    );

    // TEST K: Try unauthorized access & verify 401/403 responses
    // K1: Creator tries to accept application (MUST return 403)
    const unauthorizedAccept = await request(`/applications/${applicationId2}/status`, 'PUT', {
      status: 'accepted',
    }, creatorToken);
    assert(unauthorizedAccept.status === 403, 'TEST K1: Creator Blocked from Accepting Application (403)');

    // K2: Random user tries to update collaboration (MUST return 403)
    const randomUserEmail = `random_${Date.now()}@coinlift.test`;
    const regRandom = await request('/auth/register', 'POST', {
      name: 'Random Stranger',
      email: randomUserEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const randomToken = regRandom.body.data?.token;

    const unauthorizedUpdateCollab = await request(`/collaborations/${collaborationId}`, 'PUT', {
      progress: 100,
    }, randomToken);
    assert(unauthorizedUpdateCollab.status === 403, 'TEST K2: Non-Participant Blocked from Updating Collaboration (403)');

    // K3: Invalid progress range (150%) MUST return 400
    const invalidProgress = await request(`/collaborations/${collaborationId}`, 'PUT', {
      progress: 150,
    }, creatorToken);
    assert(invalidProgress.status === 400, 'TEST K3: Reject Progress Value > 100 (400)');

    console.log('==================================================');
    console.log(`📊 Complete Flow Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Complete Flow Test Exception:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '--run') {
  runCompleteFlowTests();
}
