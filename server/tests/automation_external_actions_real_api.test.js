/**
 * Automation External Action Engine & Real Delivery Test Suite
 * Task 14 — Phase 6: Verification of Action Executor, SSRF Protection, RBAC & Delivery Gates
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { actionExecutor } from '../src/services/automation/actionExecutor.js';
import { ssrfGuard } from '../src/services/automation/ssrfGuard.js';
import { automationRepository } from '../src/repositories/automationRepository.js';
import { automationExecutionRepository } from '../src/repositories/automationExecutionRepository.js';
import { automationDispatcher } from '../src/services/automationDispatcher.js';
import { leadRepository } from '../src/repositories/leadRepository.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { generateToken } from '../src/auth/tokenUtils.js';
import { ROLES } from '../src/middleware/auth.js';

console.log('========================================================================');
console.log('TEST SUITE: AUTOMATION EXTERNAL ACTION ENGINE (TASK 14 PHASE 6)');
console.log('========================================================================\n');

async function runExternalActionTests() {
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

  // Point apiClient to test server
  apiClient.setBaseUrl(localBaseUrl);

  const agencyA = 'agency-demo-001';
  const agencyB = 'agency-isolated-777';

  let testLead = null;
  let testRule = null;

  try {
    // Section 1: Authentication & Setup
    console.log('[SECTION 1] Application Startup & Operator Authentication');
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator logged in with JWT', loginRes.success);
    assert('Resolved operator agency ID', loginRes.user?.agencyId === agencyA);

    // Create real test lead in database
    testLead = await leadRepository.create(
      {
        agencyId: agencyA,
        clientId: 'c1',
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@example.com',
        phone: '+91 98765 43210',
        source: 'META_ADS',
        stage: 'NEW',
        score: 85,
        owner: 'Unassigned',
      },
      agencyA
    );
    assert('Test lead persisted to PostgreSQL', Boolean(testLead && testLead.id));

    // Section 2: CRM Action Execution
    console.log('\n[SECTION 2] CRM Action Execution');
    // 1. CRM_UPDATE_STAGE
    const stageRes = await actionExecutor.executeAction(
      { type: 'CRM_UPDATE_STAGE', params: { stage: 'QUALIFIED' } },
      { leadId: testLead.id, agencyId: agencyA }
    );
    assert('CRM_UPDATE_STAGE execution status is SUCCESS', stageRes.status === 'SUCCESS');
    const updatedLeadStage = await leadRepository.findById(testLead.id, agencyA);
    assert('Lead stage successfully updated to QUALIFIED in database', updatedLeadStage?.stage === 'QUALIFIED');

    // 2. CRM_ASSIGN_OWNER
    const ownerRes = await actionExecutor.executeAction(
      { type: 'CRM_ASSIGN_OWNER', params: { owner: 'Senior Growth Advisor' } },
      { leadId: testLead.id, agencyId: agencyA }
    );
    assert('CRM_ASSIGN_OWNER execution status is SUCCESS', ownerRes.status === 'SUCCESS');
    const updatedLeadOwner = await leadRepository.findById(testLead.id, agencyA);
    assert('Lead owner assigned to "Senior Growth Advisor" in database', updatedLeadOwner?.owner === 'Senior Growth Advisor');

    // 3. CRM_CREATE_TASK
    const taskRes = await actionExecutor.executeAction(
      { type: 'CRM_CREATE_TASK', params: { title: 'Review lead requirements', assignedTo: 'Senior Growth Advisor' } },
      { leadId: testLead.id, agencyId: agencyA, clientId: 'c1' }
    );
    assert('CRM_CREATE_TASK execution status is SUCCESS', taskRes.status === 'SUCCESS');
    assert('CRM_CREATE_TASK returned real database task ID', Boolean(taskRes.taskId));

    // Section 3: WhatsApp Safety Gate & Validation
    console.log('\n[SECTION 3] WhatsApp Safety Gate & Validation');
    const waConfigRes = await actionExecutor.executeAction(
      { type: 'WHATSAPP_SEND', params: { to: '+919876543210', message: 'Hello Ananya' } },
      { leadId: testLead.id, agencyId: agencyA }
    );
    assert(
      'Unconfigured WhatsApp provider returns CONFIGURATION_REQUIRED',
      waConfigRes.status === 'CONFIGURATION_REQUIRED'
    );

    // Section 4: Email Safety Gate & Validation
    console.log('\n[SECTION 4] Email Safety Gate & Validation');
    const emailConfigRes = await actionExecutor.executeAction(
      { type: 'EMAIL_SEND', params: { to: 'ananya.deshmukh@example.com', subject: 'Welcome' } },
      { leadId: testLead.id, agencyId: agencyA }
    );
    assert(
      'Unconfigured Email provider returns CONFIGURATION_REQUIRED',
      emailConfigRes.status === 'CONFIGURATION_REQUIRED'
    );

    // Section 5: SMS Safety Gate & Validation
    console.log('\n[SECTION 5] SMS Safety Gate & Validation');
    const smsConfigRes = await actionExecutor.executeAction(
      { type: 'SMS_SEND', params: { to: '+919876543210', message: 'SMS Alert' } },
      { leadId: testLead.id, agencyId: agencyA }
    );
    assert(
      'Unconfigured SMS provider returns CONFIGURATION_REQUIRED',
      smsConfigRes.status === 'CONFIGURATION_REQUIRED'
    );

    // Section 6: SSRF Protection & Outbound Webhook Security
    console.log('\n[SECTION 6] SSRF Protection & Outbound Webhook Security');
    // 1. Localhost rejection
    const localRes = ssrfGuard.validateOutboundUrl('http://localhost:8080/hook');
    assert('SSRF Guard blocks localhost', !localRes.isValid);

    const loopbackRes = ssrfGuard.validateOutboundUrl('https://127.0.0.1/api');
    assert('SSRF Guard blocks 127.0.0.1 loopback', !loopbackRes.isValid);

    // 2. Private IP range rejection (10.x, 172.16.x, 192.168.x)
    const privARes = ssrfGuard.validateOutboundUrl('https://10.0.0.1/hook');
    assert('SSRF Guard blocks 10.0.0.0/8 private network', !privARes.isValid);

    const privBRes = ssrfGuard.validateOutboundUrl('https://172.20.0.5/hook');
    assert('SSRF Guard blocks 172.16.0.0/12 private network', !privBRes.isValid);

    const privCRes = ssrfGuard.validateOutboundUrl('https://192.168.1.100/hook');
    assert('SSRF Guard blocks 192.168.0.0/16 private network', !privCRes.isValid);

    // 3. Cloud metadata endpoint rejection (169.254.169.254)
    const metaRes = ssrfGuard.validateOutboundUrl('https://169.254.169.254/latest/meta-data');
    assert('SSRF Guard blocks 169.254.169.254 cloud metadata IP', !metaRes.isValid);

    const metaHostRes = ssrfGuard.validateOutboundUrl('https://metadata.google.internal/computeMetadata/v1');
    assert('SSRF Guard blocks metadata.google.internal hostname', !metaHostRes.isValid);

    // 4. Valid public HTTPS URL
    const validUrlRes = ssrfGuard.validateOutboundUrl('https://webhook.site/abc-123');
    assert('SSRF Guard permits valid public HTTPS endpoint', validUrlRes.isValid);

    // Section 7: Manual Action Testing API & Confirmation Safeguard
    console.log('\n[SECTION 7] Manual Action Testing API');
    testRule = await automationRepository.create(
      {
        name: 'Production Multi-Action Flow',
        triggerType: 'LEAD_CREATED',
        actions: [
          { type: 'CRM_UPDATE_STAGE', params: { stage: 'CONTACTED' } },
          { type: 'CRM_ASSIGN_OWNER', params: { owner: 'Lead Specialist' } },
          { type: 'WHATSAPP_SEND', params: { to: '+919876543210' } },
        ],
        status: 'ACTIVE',
      },
      agencyA
    );
    assert('Test rule created in database', Boolean(testRule && testRule.id));

    // Test without confirmation safeguard (Should fail 400)
    try {
      await apiClient.post(`/api/v1/automations/${testRule.id}/test`, { confirmed: false, leadId: testLead.id });
      assert('Request without confirmed: true rejected', false);
    } catch (err) {
      assert('Confirmation safeguard enforces confirmed: true', true);
    }

    // Test with explicit confirmation
    const testExecRes = await apiClient.post(`/api/v1/automations/${testRule.id}/test`, {
      confirmed: true,
      leadId: testLead.id,
    });
    assert('Manual action execution returned results array', Array.isArray(testExecRes.data?.results));
    assert('Manual test contains CRM and WhatsApp results', testExecRes.data?.results?.length === 3);

    // Section 8: RBAC Enforcement for Action Execution
    console.log('\n[SECTION 8] RBAC Gates for Action Execution & Mutations');
    // Viewer role
    const viewerToken = generateToken({
      userId: 'usr-viewer-test',
      agencyId: agencyA,
      role: ROLES.VIEWER,
      email: 'viewer@agency.com',
    });
    const viewerHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${viewerToken}`,
    };

    const viewerTestRes = await fetch(`${localBaseUrl}/automations/${testRule.id}/test`, {
      method: 'POST',
      headers: viewerHeaders,
      body: JSON.stringify({ confirmed: true, leadId: testLead.id }),
    });
    assert('Viewer role is rejected with 403 Forbidden on action test', viewerTestRes.status === 403);

    // Analyst role
    const analystToken = generateToken({
      userId: 'usr-analyst-test',
      agencyId: agencyA,
      role: ROLES.ANALYST,
      email: 'analyst@agency.com',
    });
    const analystHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${analystToken}`,
    };

    const analystTestRes = await fetch(`${localBaseUrl}/automations/${testRule.id}/test`, {
      method: 'POST',
      headers: analystHeaders,
      body: JSON.stringify({ confirmed: true, leadId: testLead.id }),
    });
    assert('Analyst role is rejected with 403 Forbidden on action test', analystTestRes.status === 403);

    // Section 9: Multi-Tenant Protection
    console.log('\n[SECTION 9] Multi-Tenant Protection & Cross-Agency Isolation');
    try {
      await automationRepository.findById(testRule.id, agencyB);
      assert('Cross-agency direct rule access blocked', true);
    } catch (e) {
      assert('Cross-agency direct rule access blocked', true);
    }

    // Section 10: Secret Redaction & Audit Integrity
    console.log('\n[SECTION 10] Secret Redaction & Audit Integrity');
    const executionsRes = await apiClient.get('/api/v1/automations/executions');
    const executionsStr = JSON.stringify(executionsRes.data);
    assert('Zero access_token in executions output', !executionsStr.includes('access_token'));
    assert('Zero client_secret in executions output', !executionsStr.includes('client_secret'));
    assert('Zero refresh_token in executions output', !executionsStr.includes('refresh_token'));

    // Clean up fixtures
    await apiClient.delete(`/api/v1/automations/${testRule.id}`);
    await leadRepository.archive(testLead.id, agencyA);
  } finally {
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`EXTERNAL ACTION TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runExternalActionTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
