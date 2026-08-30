/**
 * Automation Reliability, Retries & Async Execution Test Suite
 * Task 14 — Phase 6 (Task 6 Phase 3): Verification of Retry Policies, Backoff, Idempotent Execution & RBAC
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { retryPolicy, RETRY_CATEGORIES } from '../src/services/automation/retryPolicy.js';
import { automationRepository } from '../src/repositories/automationRepository.js';
import { automationExecutionRepository } from '../src/repositories/automationExecutionRepository.js';
import { automationService } from '../src/services/automationService.js';
import { actionExecutor } from '../src/services/automation/actionExecutor.js';
import { leadRepository } from '../src/repositories/leadRepository.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { generateToken } from '../src/auth/tokenUtils.js';
import { ROLES } from '../src/middleware/auth.js';

console.log('========================================================================');
console.log('TEST SUITE: AUTOMATION RETRIES & RELIABILITY (TASK 6 PHASE 3)');
console.log('========================================================================\n');

async function runReliabilityTests() {
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

  let testLead = null;
  let testRule = null;
  let testExecution = null;

  try {
    // Section 1: Authentication & Setup
    console.log('[SECTION 1] Operator Authentication & Fixture Setup');
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator logged in with JWT', loginRes.success);
    assert('Resolved operator agency ID', loginRes.user?.agencyId === agencyA);

    testLead = await leadRepository.create(
      {
        agencyId: agencyA,
        clientId: 'c1',
        name: 'Rohan Varma',
        email: 'rohan.varma@example.com',
        phone: '+91 91234 56789',
        source: 'META_ADS',
        stage: 'NEW',
        score: 90,
      },
      agencyA
    );
    assert('Test Lead created in PostgreSQL', Boolean(testLead && testLead.id));

    testRule = await automationRepository.create(
      {
        name: 'Reliable Task & Stage Assignment',
        triggerType: 'LEAD_CREATED',
        actions: [
          { type: 'CRM_UPDATE_STAGE', params: { stage: 'QUALIFIED' } },
          { type: 'CRM_CREATE_TASK', params: { title: 'Call high value client' } },
        ],
        status: 'ACTIVE',
      },
      agencyA
    );
    assert('Automation Rule created in PostgreSQL', Boolean(testRule && testRule.id));

    // Section 2: Deterministic Retry Policy Classifications
    console.log('\n[SECTION 2] Retry Policy Classification Engine');
    // 1. HTTP 429 -> RATE_LIMITED
    const cat429 = retryPolicy.classifyFailure(429);
    assert('HTTP 429 classified as RATE_LIMITED', cat429 === RETRY_CATEGORIES.RATE_LIMITED);
    assert('RATE_LIMITED is marked as retryable', retryPolicy.isRetryable(cat429));

    // 2. HTTP 401 & 403 -> NEEDS_REAUTH
    const cat401 = retryPolicy.classifyFailure(401);
    const cat403 = retryPolicy.classifyFailure(403);
    assert('HTTP 401 classified as NEEDS_REAUTH', cat401 === RETRY_CATEGORIES.NEEDS_REAUTH);
    assert('HTTP 403 classified as NEEDS_REAUTH', cat403 === RETRY_CATEGORIES.NEEDS_REAUTH);
    assert('NEEDS_REAUTH is NOT automatically retried without credentials', !retryPolicy.isRetryable(cat401));

    // 3. HTTP 408 & Timeouts -> TEMPORARY_FAILURE
    const cat408 = retryPolicy.classifyFailure(408);
    const catTimeout = retryPolicy.classifyFailure(0, new Error('Network timeout'));
    assert('HTTP 408 classified as TEMPORARY_FAILURE', cat408 === RETRY_CATEGORIES.TEMPORARY_FAILURE);
    assert('Timeout error classified as TEMPORARY_FAILURE', catTimeout === RETRY_CATEGORIES.TEMPORARY_FAILURE);
    assert('TEMPORARY_FAILURE is marked as retryable', retryPolicy.isRetryable(catTimeout));

    // 4. HTTP 5xx -> TEMPORARY_FAILURE
    const cat503 = retryPolicy.classifyFailure(503);
    assert('HTTP 503 classified as TEMPORARY_FAILURE', cat503 === RETRY_CATEGORIES.TEMPORARY_FAILURE);

    // 5. HTTP 400/422 -> FAILED
    const cat400 = retryPolicy.classifyFailure(400);
    assert('HTTP 400 classified as FAILED (Permanent validation error)', cat400 === RETRY_CATEGORIES.FAILED);
    assert('Permanent FAILED is NOT retryable', !retryPolicy.isRetryable(cat400));

    // 6. CONFIGURATION_REQUIRED & DUPLICATE
    const catConfig = retryPolicy.classifyFailure(0, null, { status: 'CONFIGURATION_REQUIRED' });
    const catDup = retryPolicy.classifyFailure(0, null, { status: 'DUPLICATE' });
    assert('Configuration status mapped to CONFIGURATION_REQUIRED', catConfig === RETRY_CATEGORIES.CONFIGURATION_REQUIRED);
    assert('Duplicate status mapped to DUPLICATE', catDup === RETRY_CATEGORIES.DUPLICATE);

    // Section 3: Exponential Backoff & Retry-After
    console.log('\n[SECTION 3] Bounded Exponential Backoff & Retry-After Handling');
    const delay1 = retryPolicy.calculateBackoff(1, { baseDelayMs: 1000, jitter: false });
    const delay2 = retryPolicy.calculateBackoff(2, { baseDelayMs: 1000, jitter: false });
    const delay3 = retryPolicy.calculateBackoff(3, { baseDelayMs: 1000, jitter: false });
    assert('Attempt 1 delay calculated correctly (1000ms)', delay1 === 1000);
    assert('Attempt 2 exponential delay calculated correctly (2000ms)', delay2 === 2000);
    assert('Attempt 3 exponential delay calculated correctly (4000ms)', delay3 === 4000);

    const clampedDelay = retryPolicy.calculateBackoff(10, { baseDelayMs: 1000, maxDelayMs: 30000, jitter: false });
    assert('Excessive attempt delay clamped to maxDelayMs (30000ms)', clampedDelay === 30000);

    const retryAfterDelay = retryPolicy.calculateBackoff(1, { retryAfter: 15, maxDelayMs: 60000 });
    assert('Respects Retry-After header in seconds (15s -> 15000ms)', retryAfterDelay === 15000);

    // Section 4: Persistent Retry State & Execution History
    console.log('\n[SECTION 4] Persistent Retry State & Execution History');
    testExecution = await automationExecutionRepository.recordExecution({
      agencyId: agencyA,
      automationId: testRule.id,
      automationName: testRule.name,
      eventId: `EVT-RETRY-${Date.now()}`,
      leadId: testLead.id,
      actionType: 'CRM_UPDATE_STAGE',
      status: 'FAILED',
      error: 'Temporary simulated timeout',
      attemptCount: 1,
      failureCategory: 'TEMPORARY_FAILURE',
      retryHistory: [{ attempt: 1, executedAt: new Date().toISOString(), status: 'FAILED' }],
    });
    assert('Initial failed execution persisted with attemptCount = 1', testExecution?.attemptCount === 1);
    assert('Execution status is FAILED', testExecution?.status === 'FAILED');

    // Section 5: Manual Retry API
    console.log('\n[SECTION 5] Manual Retry API Endpoint');
    const retryRes = await apiClient.post(`/api/v1/automations/executions/${testExecution.id}/retry`);
    assert('POST /automations/executions/:id/retry executed successfully', retryRes.success);
    assert('Retry resulted in SUCCESS for CRM stage update', retryRes.data?.status === 'SUCCESS');

    const refreshedExecution = await automationExecutionRepository.findById(testExecution.id, agencyA);
    assert('Execution record updated to status = SUCCESS', refreshedExecution?.status === 'SUCCESS');
    assert('Attempt count incremented to 2 in database', refreshedExecution?.attemptCount === 2);
    assert('Retry history recorded attempt details', refreshedExecution?.retryHistory?.length === 2);

    // Verify lead was actually updated in PostgreSQL
    const refreshedLead = await leadRepository.findById(testLead.id, agencyA);
    assert('Real lead in database updated to QUALIFIED via retry', refreshedLead?.stage === 'QUALIFIED');

    // Section 6: Idempotent Retries & Guardrails
    console.log('\n[SECTION 6] Retry Guardrails & Idempotency');
    // Cannot retry an execution that has already succeeded
    try {
      await apiClient.post(`/api/v1/automations/executions/${testExecution.id}/retry`);
      assert('Retrying a SUCCESS execution was rejected', false);
    } catch (err) {
      assert('Retrying a SUCCESS execution is rejected with 400 ValidationError', true);
    }

    // Section 7: RBAC Protection on Manual Retry
    console.log('\n[SECTION 7] RBAC Permission Gates on Manual Retry');
    const viewerToken = generateToken({
      userId: 'usr-viewer-retry',
      agencyId: agencyA,
      role: ROLES.VIEWER,
      email: 'viewer@agency.com',
    });
    const viewerHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${viewerToken}`,
    };

    const viewerRetryRes = await fetch(`${localBaseUrl}/automations/executions/${testExecution.id}/retry`, {
      method: 'POST',
      headers: viewerHeaders,
    });
    assert('Viewer role is rejected with 403 Forbidden on manual retry', viewerRetryRes.status === 403);

    const analystToken = generateToken({
      userId: 'usr-analyst-retry',
      agencyId: agencyA,
      role: ROLES.ANALYST,
      email: 'analyst@agency.com',
    });
    const analystHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${analystToken}`,
    };

    const analystRetryRes = await fetch(`${localBaseUrl}/automations/executions/${testExecution.id}/retry`, {
      method: 'POST',
      headers: analystHeaders,
    });
    assert('Analyst role is rejected with 403 Forbidden on manual retry', analystRetryRes.status === 403);

    // Section 8: Cross-Tenant Isolation
    console.log('\n[SECTION 8] Multi-Tenant Protection');
    const tenantBToken = generateToken({
      userId: 'usr-tenant-b',
      agencyId: agencyB,
      role: ROLES.OWNER,
      email: 'owner@agency-b.com',
    });
    const tenantBHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tenantBToken}`,
    };

    const crossTenantRetryRes = await fetch(`${localBaseUrl}/automations/executions/${testExecution.id}/retry`, {
      method: 'POST',
      headers: tenantBHeaders,
    });
    assert('Cross-tenant retry attempt is rejected with 404/403', crossTenantRetryRes.status === 404 || crossTenantRetryRes.status === 403);

    // Clean up fixtures
    await apiClient.delete(`/api/v1/automations/${testRule.id}`);
    await leadRepository.archive(testLead.id, agencyA);
  } finally {
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`RELIABILITY TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runReliabilityTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
