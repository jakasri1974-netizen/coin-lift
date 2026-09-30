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

export const runProductionizationTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Productionization Phase 1 Test Suite...');
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
    // 1. Create Creator & Project Users
    const creatorEmail = `prod_creator_${Date.now()}@cryplift.test`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Prod Creator',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    assert(regCreator.status === 201 && regCreator.body.data?.token, '1. Register Creator Account');
    const creatorToken = regCreator.body.data?.token;

    const projectEmail = `prod_project_${Date.now()}@cryplift.test`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Prod Project',
      email: projectEmail,
      password: 'Password123!',
      role: 'project',
    });
    assert(regProject.status === 201 && regProject.body.data?.token, '2. Register Project Account');
    const projectToken = regProject.body.data?.token;

    // 2. Creator Profile GET & UPDATE
    const getCreatorProf = await request('/creators/me', 'GET', null, creatorToken);
    assert(getCreatorProf.status === 200 && getCreatorProf.body.success === true, '3. Creator Profile GET /api/creators/me');

    const updateCreatorProf = await request('/creators/me', 'PUT', {
      displayName: 'Prod Creator Vance',
      bio: 'Verified Web3 creator specializing in DeFi educational video content.',
      category: 'DeFi',
      location: 'Global',
      rawFollowers: 75000,
      followers: '75K+',
      engagementRate: '6.5%',
      platforms: ['YouTube', 'X'],
      socialLinks: {
        twitter: '@prodcreatorvance',
        youtube: 'youtube.com/c/prodcreatorvance',
      },
      availability: 'Available'
    }, creatorToken);
    assert(
      updateCreatorProf.status === 200 &&
      updateCreatorProf.body.data?.displayName === 'Prod Creator Vance' &&
      updateCreatorProf.body.data?.category === 'DeFi',
      '4. Creator Profile UPDATE /api/creators/me',
      JSON.stringify(updateCreatorProf.body)
    );

    // 3. Project Profile GET & UPDATE
    const getProjectProf = await request('/projects/me', 'GET', null, projectToken);
    assert(getProjectProf.status === 200 && getProjectProf.body.success === true, '5. Project Profile GET /api/projects/me');

    const updateProjectProf = await request('/projects/me', 'PUT', {
      projectName: 'Aetheria Protocol',
      description: 'Decentralized liquidity aggregation network built for multi-chain asset routing.',
      category: 'DeFi',
      website: 'https://aetheria.io',
      tokenSymbol: 'AETH',
      network: 'Arbitrum',
      projectStage: 'Mainnet'
    }, projectToken);
    assert(
      updateProjectProf.status === 200 &&
      updateProjectProf.body.data?.projectName === 'Aetheria Protocol' &&
      updateProjectProf.body.data?.tokenSymbol === 'AETH',
      '6. Project Profile UPDATE /api/projects/me',
      JSON.stringify(updateProjectProf.body)
    );

    // 4. Creator Discovery, Search, Filters, & Pagination
    const creatorDiscovery = await request('/creators?category=DeFi&search=Vance&page=1&limit=10');
    const hasVance = Array.isArray(creatorDiscovery.body.data) && creatorDiscovery.body.data.some(c => c.displayName === 'Prod Creator Vance');
    assert(
      creatorDiscovery.status === 200 &&
      Array.isArray(creatorDiscovery.body.data) &&
      creatorDiscovery.body.pagination !== undefined &&
      hasVance,
      '7. Creator Discovery GET /api/creators with Search, Filters, & Pagination',
      `[status=${creatorDiscovery.status}, hasVance=${hasVance}, count=${creatorDiscovery.body.data?.length}]`
    );

    // 5. Project Discovery, Search, Filters, & Pagination
    const projectDiscovery = await request('/projects?category=DeFi&search=Aetheria&page=1&limit=10');
    const hasAetheria = Array.isArray(projectDiscovery.body.data) && projectDiscovery.body.data.some(p => p.projectName === 'Aetheria Protocol');
    assert(
      projectDiscovery.status === 200 &&
      Array.isArray(projectDiscovery.body.data) &&
      projectDiscovery.body.pagination !== undefined &&
      hasAetheria,
      '8. Project Discovery GET /api/projects with Search, Filters, & Pagination',
      `[status=${projectDiscovery.status}, hasAetheria=${hasAetheria}, count=${projectDiscovery.body.data?.length}]`
    );

    // 6. Campaign Discovery, Search, Filters, & Pagination
    const createCampRes = await request('/campaigns', 'POST', {
      title: 'Aetheria Arbitrum Liquidity Sprint',
      description: 'Review our high-speed routing engine and submit video walkthrough.',
      category: 'DeFi',
      campaignType: 'Review Video',
      budget: '8,000 USDC',
      deliverables: ['1x Video Review']
    }, projectToken);
    assert(createCampRes.status === 201 && createCampRes.body.data?._id, '9. Project Creates Campaign for Discovery Test');

    const campaignDiscovery = await request('/campaigns?category=DeFi&search=Arbitrum&page=1&limit=10');
    const hasCamp = Array.isArray(campaignDiscovery.body.data) && campaignDiscovery.body.data.some(c => (c.title || '').includes('Arbitrum'));
    assert(
      campaignDiscovery.status === 200 &&
      Array.isArray(campaignDiscovery.body.data) &&
      campaignDiscovery.body.pagination !== undefined &&
      hasCamp,
      '10. Campaign Discovery GET /api/campaigns with Search, Filters, & Pagination',
      `[status=${campaignDiscovery.status}, hasCamp=${hasCamp}, count=${campaignDiscovery.body.data?.length}]`
    );

    // 7. Security: Unauthorized Profile Updates & Protected Endpoints
    const unauthCreatorProf = await request('/creators/me', 'GET');
    assert(unauthCreatorProf.status === 401, '11. Protected Creator Profile Endpoint Rejects Requests without JWT (401)');

    const unauthProjectProf = await request('/projects/me', 'GET');
    assert(unauthProjectProf.status === 401, '12. Protected Project Profile Endpoint Rejects Requests without JWT (401)');

    // 8. Cross-role authorization protection
    const creatorUpdatingProject = await request('/projects/me', 'PUT', {
      projectName: 'Hacked Project Name'
    }, creatorToken);
    assert(creatorUpdatingProject.status === 403, '13. Creator Role Blocked from Updating Project Profile (403)');

    const projectUpdatingCreator = await request('/creators/me', 'PUT', {
      displayName: 'Hacked Creator Name'
    }, projectToken);
    assert(projectUpdatingCreator.status === 403, '14. Project Role Blocked from Updating Creator Profile (403)');

    // 9. Input Validation & Error Responses
    const malformedCreator = await request('/creators/me', 'PUT', {
      rawFollowers: -500 // Invalid negative followers
    }, creatorToken);
    assert(malformedCreator.status === 400 && malformedCreator.body.success === false, '15. Reject Malformed Creator Profile Input (400)', `status=${malformedCreator.status}`);

    const malformedProject = await request('/projects/me', 'PUT', {
      website: 'not-a-valid-url' // Invalid URL format
    }, projectToken);
    assert(malformedProject.status === 400 && malformedProject.body.success === false, '16. Reject Malformed Project Profile Input (400)', `status=${malformedProject.status}`);

    console.log('==================================================');
    console.log(`📊 Productionization Phase 1 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Productionization Test Exception:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '--run') {
  runProductionizationTests();
}
