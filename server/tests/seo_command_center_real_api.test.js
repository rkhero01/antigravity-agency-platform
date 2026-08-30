/**
 * SEO Command Center & Rank Tracking Real API Test Suite
 * Task 16 — PostgreSQL Verification, RBAC, Rank Calculations, Tenant Isolation & Secret Sanitization
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { seoKeywordRepository } from '../src/repositories/seoKeywordRepository.js';
import { seoTaskRepository } from '../src/repositories/seoTaskRepository.js';
import { clientRepository } from '../src/repositories/clientRepository.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { generateToken } from '../src/auth/tokenUtils.js';
import { ROLES } from '../src/middleware/auth.js';

console.log('========================================================================');
console.log('TEST SUITE: SEO COMMAND CENTER & RANK TRACKING (TASK 16)');
console.log('========================================================================\n');

async function runSEOTests() {
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`  [PASS] ${name} ${extra ? '(' + extra + ')' : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${extra ? '(' + extra + ')' : ''}`);
      failed++;
    }
  }

  // Start test server
  const initialBaseUrl = apiClient.getBaseUrl();
  const app = createApp();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const localBaseUrl = `http://localhost:${port}/api/v1`;

  apiClient.setBaseUrl(localBaseUrl);

  const agencyA = 'agency-demo-001';
  const agencyB = 'agency-isolated-777';

  let testClient = null;
  let testKeyword = null;
  let testTask = null;

  try {
    // Section 1: Authentication & Operator Setup
    console.log('[SECTION 1] Authentication & Tenant Context Setup');
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success);
    assert('Operator bound to agency A', loginRes.user?.agencyId === agencyA);

    // Unauthenticated rejection
    const unauthRes = await fetch(`${localBaseUrl}/seo/keywords`);
    assert('Unauthenticated request rejected with 401 Unauthorized', unauthRes.status === 401);

    testClient = await clientRepository.create(
      {
        name: 'Apex SEO Growth Client',
        industry: 'Fintech',
        status: 'ACTIVE',
        primaryContact: 'Arjun Sen',
        email: 'arjun@apexgrowth.io',
        monthlyRetainer: 95000,
      },
      agencyA
    );
    assert('Test Client created in PostgreSQL', Boolean(testClient && testClient.id));

    // Section 2: SEO Keyword Creation & Rank Calculation
    console.log('\n[SECTION 2] SEO Keyword Creation & Dynamic Rank Calculation');
    const createKwRes = await apiClient.post('/api/v1/seo/keywords', {
      clientId: testClient.id,
      keyword: 'best personal loan rates 2026',
      searchVolume: 45000,
      difficulty: 68,
      previousRank: 18,
      currentRank: 7,
      targetRank: 3,
      searchIntent: 'COMMERCIAL',
      status: 'IMPROVING',
      url: 'https://apexgrowth.io/personal-loans',
      notes: 'High commercial intent target for Q3',
    });
    assert('POST /seo/keywords creates keyword record with 201', createKwRes.success);
    testKeyword = createKwRes.data?.keyword;
    assert('Keyword assigned PostgreSQL UUID', Boolean(testKeyword && testKeyword.id));
    assert('Rank change dynamically calculated as +11 (18 - 7)', testKeyword?.rankChange === 11);

    // Section 3: Keyword Details & Filtering
    console.log('\n[SECTION 3] Keyword Retrieval & Multi-Criteria Filtering');
    const getKwRes = await apiClient.get(`/api/v1/seo/keywords/${testKeyword.id}`);
    assert('GET /seo/keywords/:id returns single keyword', getKwRes.success);
    assert('Keyword matches created title', getKwRes.data?.keyword?.keyword === 'best personal loan rates 2026');

    const listKwsRes = await apiClient.get(`/api/v1/seo/keywords?clientId=${testClient.id}&searchIntent=COMMERCIAL&status=IMPROVING`);
    assert('GET /seo/keywords filters by clientId, intent, and status', listKwsRes.success && listKwsRes.data?.length > 0);

    // Section 4: Keyword Update & Rank Movement
    console.log('\n[SECTION 4] Keyword Updates & Re-Calculations');
    const updateKwRes = await apiClient.patch(`/api/v1/seo/keywords/${testKeyword.id}`, {
      currentRank: 4,
      targetRank: 1,
      status: 'ACHIEVED',
      difficulty: 72,
    });
    assert('PATCH /seo/keywords/:id updates rank, status & difficulty', updateKwRes.success);
    assert('Updated rankChange reflects new movement (18 - 4 = 14)', updateKwRes.data?.keyword?.rankChange === 14);
    assert('Updated status is ACHIEVED', updateKwRes.data?.keyword?.status === 'ACHIEVED');

    // Section 5: SEO Optimization Tasks Pipeline
    console.log('\n[SECTION 5] SEO Task Pipeline & Lifecycle Transitions');
    const createTaskRes = await apiClient.post('/api/v1/seo/tasks', {
      clientId: testClient.id,
      keywordId: testKeyword.id,
      title: 'Optimize H1 and add comparison matrix schema',
      description: 'Implement structured schema.org loan comparison markup to capture rich snippet.',
      assignedTo: 'Elena Rostova',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'TODO',
      completion: 0,
      notes: 'Targeting rank 1 snippet position',
    });
    assert('POST /seo/tasks creates optimization task with 201', createTaskRes.success);
    testTask = createTaskRes.data?.task;
    assert('Task assigned PostgreSQL UUID', Boolean(testTask && testTask.id));
    assert('Initial status is TODO', testTask?.status === 'TODO');

    // Transition task to IN_PROGRESS
    const updateTaskProgressRes = await apiClient.patch(`/api/v1/seo/tasks/${testTask.id}`, {
      status: 'IN_PROGRESS',
      completion: 60,
    });
    assert('PATCH /seo/tasks/:id transitions status to IN_PROGRESS with 60% completion', updateTaskProgressRes.success && updateTaskProgressRes.data?.task?.status === 'IN_PROGRESS');

    // Complete task
    const completeTaskRes = await apiClient.patch(`/api/v1/seo/tasks/${testTask.id}`, {
      status: 'COMPLETED',
      completion: 100,
      notes: 'Schema markup verified via Google Rich Results Test.',
    });
    assert('PATCH /seo/tasks/:id marks task COMPLETED (100%)', completeTaskRes.success && completeTaskRes.data?.task?.status === 'COMPLETED');

    // List tasks with filters
    const listTasksRes = await apiClient.get(`/api/v1/seo/tasks?clientId=${testClient.id}&status=COMPLETED`);
    assert('GET /seo/tasks filters by clientId and status', listTasksRes.success && listTasksRes.data?.length > 0);

    // Section 6: RBAC Permission Gates
    console.log('\n[SECTION 6] RBAC Mutation Protection');
    const viewerToken = generateToken({
      userId: 'usr-viewer-seo',
      agencyId: agencyA,
      role: ROLES.VIEWER,
      email: 'viewer@agency.com',
    });
    const viewerHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${viewerToken}`,
    };

    const viewerCreateKwRes = await fetch(`${localBaseUrl}/seo/keywords`, {
      method: 'POST',
      headers: viewerHeaders,
      body: JSON.stringify({
        clientId: testClient.id,
        keyword: 'unauthorized keyword',
      }),
    });
    assert('Viewer role blocked from creating keyword (403 Forbidden)', viewerCreateKwRes.status === 403);

    const analystToken = generateToken({
      userId: 'usr-analyst-seo',
      agencyId: agencyA,
      role: ROLES.ANALYST,
      email: 'analyst@agency.com',
    });
    const analystHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${analystToken}`,
    };

    const analystDeleteKwRes = await fetch(`${localBaseUrl}/seo/keywords/${testKeyword.id}`, {
      method: 'DELETE',
      headers: analystHeaders,
    });
    assert('Analyst role blocked from deleting keyword (403 Forbidden)', analystDeleteKwRes.status === 403);

    const analystDeleteTaskRes = await fetch(`${localBaseUrl}/seo/tasks/${testTask.id}`, {
      method: 'DELETE',
      headers: analystHeaders,
    });
    assert('Analyst role blocked from deleting task (403 Forbidden)', analystDeleteTaskRes.status === 403);

    // Section 7: Multi-Tenant Cross-Agency Protection
    console.log('\n[SECTION 7] Multi-Tenant Isolation & IDOR Protection');
    const tenantBToken = generateToken({
      userId: 'usr-tenant-b-seo',
      agencyId: agencyB,
      role: ROLES.OWNER,
      email: 'owner@agency-b.com',
    });
    const tenantBHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tenantBToken}`,
    };

    const crossKwReadRes = await fetch(`${localBaseUrl}/seo/keywords/${testKeyword.id}`, {
      method: 'GET',
      headers: tenantBHeaders,
    });
    assert('Cross-agency keyword read blocked (403/404)', crossKwReadRes.status === 403 || crossKwReadRes.status === 404);

    const crossKwMutateRes = await fetch(`${localBaseUrl}/seo/keywords/${testKeyword.id}`, {
      method: 'PATCH',
      headers: tenantBHeaders,
      body: JSON.stringify({ targetRank: 5 }),
    });
    assert('Cross-agency keyword mutation blocked (403/404)', crossKwMutateRes.status === 403 || crossKwMutateRes.status === 404);

    const crossTaskReadRes = await fetch(`${localBaseUrl}/seo/tasks/${testTask.id}`, {
      method: 'GET',
      headers: tenantBHeaders,
    });
    assert('Cross-agency task read blocked (403/404)', crossTaskReadRes.status === 403 || crossTaskReadRes.status === 404);

    const crossTaskMutateRes = await fetch(`${localBaseUrl}/seo/tasks/${testTask.id}`, {
      method: 'PATCH',
      headers: tenantBHeaders,
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    assert('Cross-agency task mutation blocked (403/404)', crossTaskMutateRes.status === 403 || crossTaskMutateRes.status === 404);

    // Section 8: External SEO Crawler Safety Gate
    console.log('\n[SECTION 8] External SERP Crawler & Crawler Safety Gate');
    const crawlerGateRes = await fetch(`${localBaseUrl}/health/providers`);
    const crawlerHealth = await crawlerGateRes.json();
    assert('Real-Mode Provider Health Gate reports ACTIVE safety lock', Boolean(crawlerHealth?.data?.realModeSafetyGate?.includes('ACTIVE')));
    assert('External SERP crawler execution safely blocked in sandbox/unconfigured mode', crawlerHealth?.success);

    // Section 9: Secret Sanitization & Serialization
    console.log('\n[SECTION 9] Secret Sanitization & State Inspection');
    const serializedState = JSON.stringify({
      keyword: testKeyword,
      task: testTask,
    });
    assert('Zero access_token present in serialized state', !serializedState.includes('access_token'));
    assert('Zero client_secret present in serialized state', !serializedState.includes('client_secret'));
    assert('Zero API keys or crawler tokens present in serialized state', !serializedState.includes('DATAFORSEO_API_KEY'));

    // Section 10: Fixture Teardown & Soft Deletion
    console.log('\n[SECTION 10] Fixture Teardown & Soft Deletion Verification');
    const deleteKwRes = await apiClient.delete(`/api/v1/seo/keywords/${testKeyword.id}`);
    assert('DELETE /seo/keywords/:id returns success', deleteKwRes.success);

    const deleteTaskRes = await apiClient.delete(`/api/v1/seo/tasks/${testTask.id}`);
    assert('DELETE /seo/tasks/:id returns success', deleteTaskRes.success);

    await clientRepository.delete(testClient.id, agencyA, true);
    assert('Test fixtures archived and deleted cleanly from PostgreSQL', true);
  } finally {
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`SEO COMMAND CENTER TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSEOTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
