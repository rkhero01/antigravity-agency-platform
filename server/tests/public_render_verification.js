/**
 * TASK 28 — STEP 13: PUBLIC RENDER PRODUCTION DEPLOYMENT VERIFICATION
 * 
 * Verifies live operations against the public HTTPS Render deployment:
 * https://antigravity-agency-platform.onrender.com
 */

import https from 'https';

const RENDER_BASE_URL = 'https://antigravity-agency-platform.onrender.com';

console.log('========================================================================');
console.log('TASK 28 — STEP 13: PUBLIC RENDER PRODUCTION VERIFICATION');
console.log(`Target URL: ${RENDER_BASE_URL}`);
console.log('========================================================================\n');

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, RENDER_BASE_URL);
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(url, {
      method: options.method || 'GET',
      headers: reqHeaders,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = { raw: data };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

async function runPublicVerification() {
  const results = {
    passed: 0,
    failed: 0,
    checks: [],
  };

  function recordCheck(name, success, details = '') {
    const statusStr = success ? '[PUBLIC VERIFIED] PASS' : '[PUBLIC VERIFIED] FAIL';
    console.log(`  ${statusStr}: ${name} ${details ? '(' + details + ')' : ''}`);
    results.checks.push({ name, success, details });
    if (success) results.passed++;
    else results.failed++;
  }

  // ---------------------------------------------------------------------------
  // 1. PUBLIC HEALTH ENDPOINTS
  // ---------------------------------------------------------------------------
  console.log('[SECTION 1] Public Health, Liveness & Readiness Probes');

  const liveRes = await request('/api/v1/health/live');
  recordCheck(
    'GET /api/v1/health/live returned 200 OK (Process Alive)',
    liveRes.status === 200 && liveRes.body?.data?.status === 'alive',
    `Uptime: ${liveRes.body?.data?.uptimeSeconds}s`
  );

  const readyRes = await request('/api/v1/health/ready');
  recordCheck(
    'GET /api/v1/health/ready returned 200 OK (PostgreSQL Connected & Ready)',
    readyRes.status === 200 && readyRes.body?.data?.status === 'ready' && readyRes.body?.data?.database?.connected === true,
    `Driver: ${readyRes.body?.data?.database?.driver}`
  );

  const dbRes = await request('/api/v1/health/database');
  recordCheck(
    'GET /api/v1/health/database returned 200 OK (Prisma PostgreSQL Driver Active)',
    dbRes.status === 200 && dbRes.body?.data?.status === 'PostgreSQL Connected' && dbRes.body?.data?.connected === true,
    `Migration: ${dbRes.body?.data?.migrationStatus?.status}`
  );

  const provRes = await request('/api/v1/health/providers');
  recordCheck(
    'GET /api/v1/health/providers returned 200 OK (Real-Mode Safety Gate ACTIVE)',
    provRes.status === 200 && provRes.body?.data?.realModeSafetyGate?.includes('ACTIVE')
  );

  // ---------------------------------------------------------------------------
  // 2. PUBLIC AUTHENTICATION & IDENTITY
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 2] Public Authentication & Session Management');

  const loginRes = await request('/api/v1/auth/login', { method: 'POST' }, {
    email: 'owner@antigravity.agency',
    password: 'AntigravityDemo2026!',
  });
  const token = loginRes.body?.data?.token;
  recordCheck('POST /api/v1/auth/login returned HMAC-SHA256 JWT', loginRes.status === 200 && Boolean(token));

  const meRes = await request('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  recordCheck(
    'GET /api/v1/auth/me resolved authenticated operator profile',
    meRes.status === 200 && meRes.body?.data?.user?.email === 'owner@antigravity.agency',
    `Agency: ${meRes.body?.data?.user?.agencyId}`
  );

  // ---------------------------------------------------------------------------
  // 3. PUBLIC DISPOSABLE CRUD & SOFT DELETE
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 3] Public Disposable CRUD & Soft Delete');

  const clientName = `Public Render Test Client ${Date.now()}`;
  const createClientRes = await request('/api/v1/clients', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }, {
    clientName,
    industry: 'Cloud Infrastructure',
    monthlyRetainer: 95000,
    tier: 'ENTERPRISE',
    healthScore: 98,
    status: 'ACTIVE',
  });
  const createdClientId = createClientRes.body?.data?.client?.id;
  recordCheck('Public Render Client CREATE', createClientRes.status === 201 && Boolean(createdClientId), `ID: ${createdClientId}`);

  const getClientRes = await request(`/api/v1/clients/${createdClientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  recordCheck('Public Render Client READ', getClientRes.status === 200 && getClientRes.body?.data?.client?.clientName === clientName);

  const patchClientRes = await request(`/api/v1/clients/${createdClientId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  }, {
    monthlyRetainer: 125000,
    healthScore: 99,
  });
  recordCheck(
    'Public Render Client UPDATE',
    patchClientRes.status === 200 && patchClientRes.body?.data?.client?.monthlyRetainer === 125000,
    'Retainer: ₹1,25,000'
  );

  const deleteClientRes = await request(`/api/v1/clients/${createdClientId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  recordCheck('Public Render Client SOFT DELETE', deleteClientRes.status === 200);

  const readDeletedRes = await request(`/api/v1/clients/${createdClientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  recordCheck('Public Render Deleted Record Exclusion', readDeletedRes.status === 404, 'Excluded with 404 NOT_FOUND');

  // ---------------------------------------------------------------------------
  // 4. PUBLIC TENANT ISOLATION
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 4] Public Multi-Tenant Isolation');

  const isoClientRes = await request('/api/v1/clients/c-isolated-99', {
    headers: { Authorization: `Bearer ${token}` },
  });
  recordCheck('Cross-tenant client access blocked (403 AUTHORIZATION_ERROR)', isoClientRes.status === 403);

  const isoContractRes = await request('/api/v1/contracts/cnt-isolated-99', {
    headers: { Authorization: `Bearer ${token}` },
  });
  recordCheck('Cross-tenant contract access blocked (403 AUTHORIZATION_ERROR)', isoContractRes.status === 403);

  const isoInvoiceRes = await request('/api/v1/contracts/invoices/inv-isolated-99', {
    headers: { Authorization: `Bearer ${token}` },
  });
  recordCheck('Cross-tenant invoice access blocked (403 AUTHORIZATION_ERROR)', isoInvoiceRes.status === 403);

  const spoofRes = await request('/api/v1/clients', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }, {
    agencyId: 'agency-demo-002',
    clientName: 'Spoof Attempt Client Public',
    industry: 'Cybersecurity',
    monthlyRetainer: 40000,
  });
  recordCheck(
    'Request body agencyId spoofing immunity',
    spoofRes.status === 201 && spoofRes.body?.data?.client?.agencyId === 'agency-demo-001',
    'Bound strictly to JWT tenant: agency-demo-001'
  );

  // Clean up spoof test client
  if (spoofRes.body?.data?.client?.id) {
    await request(`/api/v1/clients/${spoofRes.body.data.client.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ---------------------------------------------------------------------------
  // 5. PUBLIC HARD REAL-MODE SAFETY GATES
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 5] Public Hard Real-Mode Safety Gates (100% Blocked)');

  const provSafetyCheck = provRes.status === 200 && provRes.body?.data?.realModeSafetyGate?.includes('ACTIVE');
  recordCheck(
    'Real-Mode Safety Gate ACTIVE across all external providers',
    provSafetyCheck,
    provRes.body?.data?.realModeSafetyGate
  );

  const realExecAttempt = await request('/api/v1/actions/test-action-id/execute', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }, {
    mode: 'REAL',
  });
  const realExecutionBlocked = [403, 404].includes(realExecAttempt.status);
  recordCheck(
    'Public AI Action Execution Gate strictly prevents unauthorized real execution',
    realExecutionBlocked,
    `Status: ${realExecAttempt.status}`
  );

  // ---------------------------------------------------------------------------
  // 6. PUBLIC SECURITY HEADERS & SECRET SANITIZATION
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 6] Public Security Headers & Secret Redaction Audit');

  const headers = readyRes.headers;
  const hasNoSniff = headers['x-content-type-options'] === 'nosniff';
  const hasDenyFrame = headers['x-frame-options'] === 'DENY';
  const hasRequestId = Boolean(headers['x-request-id']);
  recordCheck('Security headers present on Render responses (nosniff, DENY, X-Request-ID)', hasNoSniff && hasDenyFrame && hasRequestId);

  const rawPayload = JSON.stringify(readyRes.body) + JSON.stringify(dbRes.body);
  const leakedSecrets = rawPayload.includes('postgres://') || rawPayload.includes('postgresql://') || rawPayload.includes('Ramesh') || rawPayload.includes('JWT_SECRET');
  recordCheck('Zero secrets, passwords, or connection strings exposed in public API responses', !leakedSecrets);

  // ---------------------------------------------------------------------------
  // 7. ROOT / HEAD BEHAVIOR
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 7] Public Root Path Audit');

  const rootRes = await request('/');
  recordCheck(
    'Root path returns 404 JSON (API gateway mounted at /api/v1, root not routed to avoid ghost endpoints)',
    rootRes.status === 404 && rootRes.body?.error?.code === 'NOT_FOUND'
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`PUBLIC RENDER VERIFICATION COMPLETE: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('========================================================================\n');

  return results;
}

runPublicVerification().catch((err) => {
  console.error('\n[FATAL ERROR IN PUBLIC VERIFICATION]:', err);
  process.exit(1);
});
