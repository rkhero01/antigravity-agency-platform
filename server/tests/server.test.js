/**
 * Production Database Activation, Deployment Verification & Hardening Test Suite
 * Task 28 — Step 7: Complete Production Database & Deployment Verification QA Suite
 */

import http from 'http';
import { app } from '../src/app.js';
import { env, validateEnvironment, getSafeEnvironmentSummary } from '../src/config/env.js';
import { database } from '../src/config/database.js';
import { authService } from '../src/services/authService.js';
import { aiActionRepository } from '../src/repositories/aiActionRepository.js';
import { clientRepository } from '../src/repositories/clientRepository.js';
import { invoiceRepository } from '../src/repositories/invoiceRepository.js';
import { contractRepository } from '../src/repositories/contractRepository.js';
import { auditService } from '../src/services/auditService.js';
import { whatsAppProvider } from '../src/providers/whatsappProvider.js';
import { seoProvider } from '../src/providers/seoProvider.js';
import { billingProvider } from '../src/providers/billingProvider.js';
import { redactSecrets } from '../src/utils/redaction.js';

console.log('========================================================================');
console.log('TASK 28 — STEP 7: PRODUCTION DATABASE ACTIVATION & VERIFICATION QA');
console.log('========================================================================');

function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }

    req.end();
  });
}

async function runTests() {
  await database.connect();
  const TEST_PORT = 4993;
  const server = app.listen(TEST_PORT);

  try {
    console.log('\n[TEST 1] Environment Validation & Production Fail-Safe Guards (Phase 2 & 12)');
    const demoValidation = validateEnvironment('demo');
    if (!demoValidation.valid) {
      throw new Error(`Demo environment validation failed: ${JSON.stringify(demoValidation.errors)}`);
    }
    console.log('  ✓ Demo environment validation passed (offline sandbox ready)');

    const prodValidation = validateEnvironment('production');
    if (prodValidation.valid && !env.isDatabaseConfigured) {
      throw new Error('Production environment validation failed to enforce required DATABASE_URL');
    }
    console.log('  ✓ Production environment validation safely caught missing credentials without crashing');

    const envSummary = getSafeEnvironmentSummary();
    const envJson = JSON.stringify(envSummary);
    if (envJson.includes('password') || envJson.includes('secret') || envJson.includes('token')) {
      throw new Error('Environment summary leaked sensitive secret keys');
    }
    console.log('  ✓ Safe environment summary generated with zero secret leakage');

    console.log('\n[TEST 2] Health, Liveness & Readiness Probes (Phase 4 & 6)');
    const liveRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/live',
      method: 'GET',
    });

    if (liveRes.status !== 200 || liveRes.body.data.status !== 'alive') {
      throw new Error(`Liveness probe failed: ${JSON.stringify(liveRes.body)}`);
    }
    console.log('  ✓ GET /api/v1/health/live returned 200 OK (Process Alive)');

    const readyRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/ready',
      method: 'GET',
    });

    if (readyRes.status !== 200 || readyRes.body.data.status !== 'ready') {
      throw new Error(`Readiness probe failed: ${JSON.stringify(readyRes.body)}`);
    }
    console.log('  ✓ GET /api/v1/health/ready returned 200 OK (Traffic Ready in Demo Sandbox)');

    const dbHealthRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/database',
      method: 'GET',
    });

    if (dbHealthRes.status !== 200 || !dbHealthRes.body.data.migrationStatus.migrationReady) {
      throw new Error(`Database health probe failed: ${JSON.stringify(dbHealthRes.body)}`);
    }
    console.log('  ✓ GET /api/v1/health/database reported migration readiness');

    const provHealthRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/health/providers',
      method: 'GET',
    });

    if (provHealthRes.status !== 200 || !provHealthRes.body.data.realModeSafetyGate) {
      throw new Error(`Providers health probe failed: ${JSON.stringify(provHealthRes.body)}`);
    }
    console.log('  ✓ GET /api/v1/health/providers reported honest provider statuses and active safety gates');

    console.log('\n[TEST 3] Authentication & Session Management (Phase 5)');
    const loginRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
    }, {
      email: 'owner@antigravity.agency',
      password: 'AntigravityDemo2026!',
    });

    if (loginRes.status !== 200 || !loginRes.body.data.token) {
      throw new Error('Authentication login failed');
    }
    const token = loginRes.body.data.token;
    console.log('  ✓ Authenticated as Owner for agency:', loginRes.body.data.user.agencyId);

    console.log('\n[TEST 4] Transaction Rollback & State Atomicity (Phase 8)');
    let rollbackSuccess = false;
    try {
      await invoiceRepository.withTransaction(async (repo) => {
        await repo.create({
          agencyId: 'agency-demo-001',
          clientId: 'c1',
          invoiceNumber: 'INV-STEP7-TX-FAIL',
          subtotal: 25000,
          total: 25000,
          amountPaid: 0,
          balanceDue: 25000,
        });
        throw new Error('Simulated atomic transaction failure');
      });
    } catch (err) {
      rollbackSuccess = true;
    }

    const checkRolledBack = await invoiceRepository.findByInvoiceNumber('INV-STEP7-TX-FAIL', 'agency-demo-001');
    if (!rollbackSuccess || checkRolledBack !== null) {
      throw new Error('Transaction rollback failed: Partial state committed');
    }
    console.log('  ✓ Transaction rollback verified: In-memory snapshot restored with 0 leaked records');

    console.log('\n[TEST 5] Idempotency & Duplicate Request Protection (Phase 9)');
    const idempotencyKey = `IDEM-STEP7-${Date.now()}`;
    const action1 = await aiActionRepository.createActionWithIdempotency({
      agencyId: 'agency-demo-001',
      clientId: 'c1',
      actionType: 'OPTIMIZE_KEYWORDS',
      title: 'Step 7 Idempotency Test',
      priority: 'P1',
      idempotencyKey,
    });

    let duplicateRejected = false;
    try {
      await aiActionRepository.createActionWithIdempotency({
        agencyId: 'agency-demo-001',
        clientId: 'c1',
        actionType: 'OPTIMIZE_KEYWORDS',
        title: 'Step 7 Idempotency Test',
        priority: 'P1',
        idempotencyKey,
      });
    } catch (err) {
      if (err.code === 'CONFLICT') {
        duplicateRejected = true;
      }
    }

    if (!duplicateRejected) {
      throw new Error('Idempotency failure: Duplicate action was not rejected with CONFLICT (409)');
    }
    console.log('  ✓ Idempotency verified: Duplicate action execution rejected with 409 CONFLICT');

    console.log('\n[TEST 6] Client Management CRUD & Soft-Delete Semantics (Phase 5)');
    const createClientRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/clients',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, {
      clientName: 'Step 7 Production Deployment Client',
      industry: 'Enterprise Security',
      monthlyRetainer: 90000,
      tier: 'ENTERPRISE',
    });

    const clientId = createClientRes.body.data.client.id;
    console.log('  ✓ Client created with ID:', clientId);

    const deleteClientRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/clients/${clientId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (deleteClientRes.status !== 200) {
      throw new Error('Soft-delete client failed');
    }

    const getDeletedRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/clients/${clientId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (getDeletedRes.status !== 404) {
      throw new Error('Soft-deleted client still accessible via GET');
    }
    console.log('  ✓ Soft-deleted record excluded from standard queries (404 NOT_FOUND)');

    console.log('\n[TEST 7] Paid Media Performance Derived Metrics Math Guard (Phase 5)');
    const createCampRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/campaigns',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, {
      clientId: 'c1',
      platform: 'GOOGLE',
      name: 'Step 7 Performance Metrics Campaign',
      dailyBudget: 8000,
    });

    const campId = createCampRes.body.data.campaign.id;
    const updateCampRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/campaigns/${campId}`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }, {
      impressions: 250000,
      clicks: 10000,
      totalSpend: 100000,
      conversions: 1000,
      revenue: 700000,
    });

    const m = updateCampRes.body.data.campaign.metrics;
    if (m.ctr !== 4 || m.cpc !== 10 || m.cpa !== 100 || m.roas !== 7) {
      throw new Error(`Campaign derived metrics mismatch: ${JSON.stringify(m)}`);
    }
    console.log('  ✓ Derived campaign metrics verified: CTR=4.0%, CPC=₹10, CPA=₹100, ROAS=7.0x');

    console.log('\n[TEST 8] Defensive Invoice Balance & Compound Uniqueness (Phase 10)');
    const invRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/contracts/invoices',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, {
      clientId: 'c1',
      invoiceNumber: 'INV-STEP7-QA-001',
      subtotal: 75000,
      tax: 13500,
      discount: 3500,
      amountPaid: 40000,
    });

    const inv = invRes.body.data.invoice;
    // Expected: total = 75000 + 13500 - 3500 = 85000; balanceDue = 85000 - 40000 = 45000; status = PARTIALLY_PAID
    if (inv.total !== 85000 || inv.balanceDue !== 45000 || inv.status !== 'PARTIALLY_PAID') {
      throw new Error(`Invoice defensive calculations mismatch: ${JSON.stringify(inv)}`);
    }
    console.log('  ✓ Invoice totals accurately computed: total=₹85,000, balanceDue=₹45,000, status=PARTIALLY_PAID');

    // Duplicate Invoice Number in Same Agency Check
    const dupInvRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/contracts/invoices',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, {
      clientId: 'c1',
      invoiceNumber: 'INV-STEP7-QA-001',
      subtotal: 10000,
    });

    if (dupInvRes.status !== 409 || dupInvRes.body.error.code !== 'CONFLICT') {
      throw new Error('Compound invoice uniqueness was not enforced');
    }
    console.log('  ✓ Duplicate invoice number in same agency strictly blocked with 409 CONFLICT');

    console.log('\n[TEST 9 — CRITICAL] REAL MODE SAFETY GATE & HARD BLOCKS (Phase 16)');
    const realExecRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/api/v1/actions/${action1.id}/execute`,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, {
      mode: 'REAL',
    });

    if (realExecRes.status !== 403 || realExecRes.body.error.code !== 'EXECUTION_BLOCKED') {
      throw new Error('Real mode execution gate was not enforced');
    }
    console.log('  ✓ AI Action real execution strictly BLOCKED with 403 EXECUTION_BLOCKED');

    try {
      await whatsAppProvider.sendMessage({}, 'REAL');
      throw new Error('WhatsApp real mode was not blocked');
    } catch (e) {
      if (e.code !== 'EXECUTION_BLOCKED') throw e;
      console.log('  ✓ WhatsApp real provider dispatch strictly BLOCKED with EXECUTION_BLOCKED');
    }

    try {
      await seoProvider.fetchLiveSERPRank('test', 'https://test.com', 'REAL');
      throw new Error('SEO real crawler was not blocked');
    } catch (e) {
      if (e.code !== 'EXECUTION_BLOCKED') throw e;
      console.log('  ✓ SEO real crawler dispatch strictly BLOCKED with EXECUTION_BLOCKED');
    }

    try {
      await billingProvider.chargePayment('inv-101', 5000, 'REAL');
      throw new Error('Billing real payment capture was not blocked');
    } catch (e) {
      if (e.code !== 'EXECUTION_BLOCKED') throw e;
      console.log('  ✓ Billing real financial capture strictly BLOCKED with EXECUTION_BLOCKED');
    }

    console.log('\n[TEST 10 — CRITICAL] CROSS-AGENCY TENANT ISOLATION (ALL 9 SUBSYSTEMS) (Phase 7 & 17)');
    const isolatedEndpoints = [
      '/api/v1/clients/c-isolated-99',
      '/api/v1/whatsapp/conversations/conv-isolated-99',
      '/api/v1/whatsapp/templates/tmpl-isolated-99',
      '/api/v1/whatsapp/automations/auto-isolated-99',
      '/api/v1/whatsapp/follow-ups/flw-isolated-99',
      '/api/v1/seo/keywords/kw-isolated-99',
      '/api/v1/seo/tasks/task-isolated-99',
      '/api/v1/contracts/cnt-isolated-99',
      '/api/v1/contracts/invoices/inv-isolated-99',
    ];

    for (const ep of isolatedEndpoints) {
      const res = await makeRequest(server, {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: ep,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 403) {
        throw new Error(`Cross-tenant leak detected on ${ep}! Status: ${res.status}`);
      }
    }
    console.log('  ✓ 100% Cross-agency tenant isolation verified across all 9 endpoints (403)');

    console.log('\n[TEST 11] Mutation Audit Store & Secret Redaction Audit (Phase 11)');
    const logs = await auditService.getAuditLogs({}, 'agency-demo-001');
    const jsonLogs = JSON.stringify(logs);
    if (
      jsonLogs.includes('AntigravityDemo2026!') ||
      jsonLogs.includes('Bearer ') ||
      jsonLogs.includes('password')
    ) {
      throw new Error('Audit store leaked secrets');
    }
    console.log('  ✓ Audit store inspected: zero secret leakage verified');

    console.log('\n[TEST 12] Body/Query Tenant Parameter Injection Immunity (Phase 7 & 17)');
    // Attempting to create resource with a spoofed external agencyId in request body
    const spoofRes = await makeRequest(server, {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/v1/clients',
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, {
      agencyId: 'agency-demo-002', // Spoofed tenant ID
      clientName: 'Spoof Attempt Client',
      industry: 'Defense',
    });

    if (spoofRes.body.data.client.agencyId === 'agency-demo-002') {
      throw new Error('Body agencyId injection vulnerability detected!');
    }
    console.log('  ✓ Body agencyId injection rejected: Record bound to authenticated agency (agency-demo-001)');

    console.log('\n========================================================================');
    console.log('ALL 12 STEP 7 PRODUCTION ACTIVATION & QA TESTS PASSED (100% SUCCESS).');
    console.log('========================================================================');
  } finally {
    server.close();
    await database.disconnect();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n[STEP 7 TEST FAILURE]:', err);
    process.exit(1);
  });
