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

export const runCampaignIntegrationTests = async () => {
  console.log('==================================================');
  console.log('🧪 Running Project Campaign Creation & Application Verification...');
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
    // 1. Register & Login as Project User
    const projectEmail = `project_owner_${Date.now()}@cryplift.io`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Apex Foundation',
      email: projectEmail,
      password: 'ProjectPassword123!',
      role: 'project',
    });
    assert(regProject.status === 201 && regProject.body.data?.token, '1. Project Account Created (JWT Issued)');
    const projectToken = regProject.body.data?.token;

    // 2. Create Real Campaign as Project User
    const campaignTitle = `ApexChain L2 Ecosystem Growth Brief ${Date.now()}`;
    const createRes = await request('/campaigns', 'POST', {
      title: campaignTitle,
      description: 'Educational deep-dive and tutorial videos for ApexChain layer-2 mainnet launch.',
      category: 'Infrastructure',
      campaignType: 'Sponsored Content',
      budget: '7,500 USDC',
      duration: '14 Days',
      deliverables: ['1x Detailed Video Review', '2x X Threads'],
      status: 'active',
    }, projectToken);

    assert(
      createRes.status === 201 && createRes.body.success && createRes.body.data?._id,
      '2. Project Campaign Created in MongoDB Atlas (POST /api/campaigns)'
    );
    const campaignId = createRes.body.data?._id;

    // 3. Reject Campaign Creation from Creator Role (Forbidden)
    const creatorEmail = `creator_applicant_${Date.now()}@cryplift.io`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Crypto Educator Vance',
      email: creatorEmail,
      password: 'CreatorPassword123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data?.token, '3. Creator Account Created');
    const creatorToken = regCreator.body.data?.token;

    const blockCreatorCreate = await request('/campaigns', 'POST', {
      title: 'Unauthorized Creator Campaign',
      description: 'Should be rejected',
      category: 'DeFi',
      campaignType: 'Sponsored Content',
      budget: '1,000 USDC',
    }, creatorToken);
    assert(blockCreatorCreate.status === 403, '4. Creator Role Blocked from Creating Campaign');

    // 4. Verify Creator Can View Active Project Campaign
    const getCampaignsRes = await request('/campaigns?status=active', 'GET', null, creatorToken);
    const foundCampaign = getCampaignsRes.body.data?.find((c) => c._id === campaignId || c.title === campaignTitle);
    assert(getCampaignsRes.status === 200 && !!foundCampaign, '5. Newly Created Campaign Visible in Creator Marketplace');

    // 5. Creator Applies to the Project Campaign
    const applyRes = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'Interested in producing a detailed 10-minute video review of ApexChain L2.',
    }, creatorToken);
    assert(applyRes.status === 201 && applyRes.body.success, '6. Creator Application Submitted (POST /api/campaigns/:id/apply)');

    // 6. Project Views Submitted Application in Dashboard / Applications List
    const projectAppsRes = await request('/applications/my', 'GET', null, projectToken);
    const receivedApp = projectAppsRes.body.data?.find((a) => a.campaignId?._id === campaignId || a.campaignId === campaignId);
    assert(projectAppsRes.status === 200 && !!receivedApp, '7. Project Dashboard Receives Creator Application');

    console.log('==================================================');
    console.log(`📊 Campaign Verification Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');
  } catch (err) {
    console.error('Campaign Integration Error:', err);
  }
};

runCampaignIntegrationTests();
