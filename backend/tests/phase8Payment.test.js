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

export const runPhase8PaymentTests = async () => {
  console.log('==================================================');
  console.log('🧪 Starting CrypLift Phase 8 Payment & Escrow Test Suite...');
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

    // Setup creator & project
    const creatorEmail = `pay_creator_${timestamp}@cryplift.com`;
    const regCreator = await request('/auth/register', 'POST', {
      name: 'Pay Creator Alice',
      email: creatorEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const creatorToken = regCreator.body.data?.token;

    const projectEmail = `pay_project_${timestamp}@cryplift.com`;
    const regProject = await request('/auth/register', 'POST', {
      name: 'Pay Project DeFi',
      email: projectEmail,
      password: 'Password123!',
      role: 'project',
    });
    const projectToken = regProject.body.data?.token;

    const bystanderEmail = `pay_bystander_${timestamp}@cryplift.com`;
    const regBystander = await request('/auth/register', 'POST', {
      name: 'Bystander Charlie',
      email: bystanderEmail,
      password: 'Password123!',
      role: 'creator',
    });
    const bystanderToken = regBystander.body.data?.token;

    // Create collaboration (campaign -> apply -> accept)
    const createCamp = await request('/campaigns', 'POST', {
      title: 'Pay Architecture Campaign',
      description: 'Testing payment escrow status transitions',
      category: 'DeFi',
      budget: '5,000 USDC',
      deliverables: ['1x Video Review'],
    }, projectToken);
    const campaignId = createCamp.body.data?._id;

    const applyRes = await request(`/campaigns/${campaignId}/apply`, 'POST', {
      message: 'Applying for payment test campaign',
    }, creatorToken);
    const applicationId = applyRes.body.data?._id;

    const acceptRes = await request(`/applications/${applicationId}/status`, 'PUT', { status: 'accepted' }, projectToken);
    const collaborationId = acceptRes.body.data?.collaboration?._id;
    assert(collaborationId, '1. Collaboration created for payment test');

    // 2. Reject zero or negative payment amount (400)
    const negPayRes = await request('/payments', 'POST', {
      collaborationId,
      amount: -500,
    }, projectToken);
    assert(negPayRes.status === 400, '2. Reject negative payment amount (400 Bad Request)');

    // 3. Initialize escrow payment record
    const payRes = await request('/payments', 'POST', {
      collaborationId,
      amount: 5000,
      currency: 'USDC',
      method: 'simulated_escrow',
      notes: 'Initial milestone payment deposit',
    }, projectToken);
    assert(payRes.status === 201 && payRes.body.data?._id && payRes.body.data?.status === 'held', '3. Escrow payment initialized (status=held)');
    const paymentId = payRes.body.data?._id;

    // 4. Non-participant cannot view payment details (403)
    const bystanderGetRes = await request(`/payments/${paymentId}`, 'GET', null, bystanderToken);
    assert(bystanderGetRes.status === 403, '4. Non-participant blocked from payment record (403 Forbidden)');

    // 5. Participants can retrieve payment record
    const getPayRes = await request('/payments', 'GET', null, creatorToken);
    assert(
      getPayRes.status === 200 && getPayRes.body.data?.some((p) => String(p._id) === String(paymentId)),
      '5. Participant can retrieve payment history'
    );

    // 6. Creator cannot release escrow payment (403)
    const creatorReleaseRes = await request(`/payments/${paymentId}/release`, 'POST', null, creatorToken);
    assert(creatorReleaseRes.status === 403, '6. Payee/Creator blocked from releasing escrow funds (403)');

    // 7. Project owner releases payment
    const releaseRes = await request(`/payments/${paymentId}/release`, 'POST', null, projectToken);
    assert(
      releaseRes.status === 200 && releaseRes.body.data?.status === 'released' && releaseRes.body.data?.releasedAt,
      '7. Paying Project releases escrow funds to payee (status=released)'
    );

    // 8. Re-releasing or cancelling an already released payment fails
    const reCancelRes = await request(`/payments/${paymentId}/cancel`, 'POST', { reason: 'Late dispute' }, projectToken);
    assert(reCancelRes.status === 400 || reCancelRes.status === 500, '8. Cannot cancel or refund an already released payment');

    console.log('==================================================');
    console.log(`📊 Phase 8 Payment Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 8 Payment Test Exception:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '--run') {
  runPhase8PaymentTests();
}
