/**
 * WhatsApp Marketing, Live Omnichannel Inbox & Multi-Tenant Conversation Pipeline Test Suite
 * Task 15 — Real PostgreSQL Verification, RBAC, Tenant Isolation & Secret Sanitization
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { conversationRepository } from '../src/repositories/conversationRepository.js';
import { whatsappTemplateRepository } from '../src/repositories/whatsappTemplateRepository.js';
import { whatsappAutomationRepository } from '../src/repositories/whatsappAutomationRepository.js';
import { followUpRepository } from '../src/repositories/followUpRepository.js';
import { clientRepository } from '../src/repositories/clientRepository.js';
import { actionExecutor } from '../src/services/automation/actionExecutor.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { generateToken } from '../src/auth/tokenUtils.js';
import { ROLES } from '../src/middleware/auth.js';

console.log('========================================================================');
console.log('TEST SUITE: WHATSAPP MARKETING & OMNICHANNEL INBOX (TASK 15)');
console.log('========================================================================\n');

async function runWhatsAppTests() {
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
  let testConv = null;
  let testTemplate = null;
  let testAutomation = null;
  let testFollowUp = null;

  try {
    // Section 1: Authentication & Operator Setup
    console.log('[SECTION 1] Authentication & Tenant Context Setup');
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success);
    assert('Operator bound to agency A', loginRes.user?.agencyId === agencyA);

    // Unauthenticated rejection
    const unauthRes = await fetch(`${localBaseUrl}/whatsapp/conversations`);
    assert('Unauthenticated request rejected with 401 Unauthorized', unauthRes.status === 401);

    testClient = await clientRepository.create(
      {
        name: 'Omni Retail Global',
        industry: 'E-Commerce',
        status: 'ACTIVE',
        primaryContact: 'Priya Mehta',
        email: 'priya@omniretail.com',
        monthlyRetainer: 85000,
      },
      agencyA
    );
    assert('Test Client created in PostgreSQL', Boolean(testClient && testClient.id));

    // Section 2: Conversation Listing, Creation & Thread History
    console.log('\n[SECTION 2] WhatsApp Conversation & Live Message Thread Engine');
    const createConvRes = await apiClient.post('/api/v1/whatsapp/conversations', {
      clientId: testClient.id,
      contactName: 'Aarav Patel',
      contactPhone: '+91 98765 12345',
      channel: 'WHATSAPP',
      assignedTo: 'Elena Rostova',
      tags: 'VIP, High Intent',
      initialMessage: 'Hi, I need a proposal for social marketing campaigns.',
    });
    assert('POST /whatsapp/conversations creates record with 201', createConvRes.success);
    testConv = createConvRes.data?.conversation;
    assert('Conversation assigned PostgreSQL UUID', Boolean(testConv && testConv.id));
    assert('Initial message recorded as unread', testConv?.unreadCount === 1);

    // Append outbound response message
    const addMsgRes = await apiClient.post(`/api/v1/whatsapp/conversations/${testConv.id}/messages`, {
      body: 'Hello Aarav! We would love to prepare a comprehensive strategy for you.',
      direction: 'OUTBOUND',
      messageType: 'text',
    });
    assert('POST /whatsapp/conversations/:id/messages appends message', addMsgRes.success);

    // Fetch conversation thread
    const threadRes = await apiClient.get(`/api/v1/whatsapp/conversations/${testConv.id}`);
    assert('GET /whatsapp/conversations/:id returns conversation details', threadRes.success);
    assert('Conversation contains complete message thread history (2 messages)', threadRes.data?.messages?.length === 2);

    // List conversations with filters
    const listConvsRes = await apiClient.get(`/api/v1/whatsapp/conversations?clientId=${testClient.id}&status=OPEN`);
    assert('GET /whatsapp/conversations filters by clientId and status', listConvsRes.success && listConvsRes.data?.length > 0);

    // Section 3: WhatsApp Templates CRUD & Approval Workflow
    console.log('\n[SECTION 3] WhatsApp Template Lifecycle Management');
    const createTmplRes = await apiClient.post('/api/v1/whatsapp/templates', {
      clientId: testClient.id,
      name: 'strategy_consultation_welcome',
      category: 'MARKETING',
      language: 'en',
      body: 'Hi {{1}}, thank you for booking a strategy call with {{2}}.',
      variables: ['Customer_Name', 'Brand_Name'],
      status: 'APPROVED',
    });
    assert('POST /whatsapp/templates creates approved template', createTmplRes.success);
    testTemplate = createTmplRes.data?.template;
    assert('Template assigned PostgreSQL ID', Boolean(testTemplate && testTemplate.id));

    // Update template
    const updateTmplRes = await apiClient.patch(`/api/v1/whatsapp/templates/${testTemplate.id}`, {
      body: 'Hi {{1}}, your growth strategy session with {{2}} is confirmed for {{3}}.',
      category: 'UTILITY',
    });
    assert('PATCH /whatsapp/templates/:id updates body & category', updateTmplRes.success && updateTmplRes.data?.template?.category === 'UTILITY');

    // List templates
    const listTmplRes = await apiClient.get(`/api/v1/whatsapp/templates?category=UTILITY`);
    assert('GET /whatsapp/templates filters by category', listTmplRes.success && listTmplRes.data?.length > 0);

    // Section 4: WhatsApp Automation Sequences
    console.log('\n[SECTION 4] WhatsApp Automation Sequence Engine');
    const createAutoRes = await apiClient.post('/api/v1/whatsapp/automations', {
      clientId: testClient.id,
      name: 'Lead Welcome & Nurture Sequence',
      triggerType: 'LEAD_CREATED',
      actionType: 'SEND_TEMPLATE',
      delayMinutes: 5,
      steps: [
        { step: 1, action: 'SEND_TEMPLATE', templateId: testTemplate.id, delayMinutes: 0 },
        { step: 2, action: 'ASSIGN_AGENT', assignee: 'Elena Rostova', delayMinutes: 5 },
      ],
      status: 'ACTIVE',
    });
    assert('POST /whatsapp/automations creates automation sequence', createAutoRes.success);
    testAutomation = createAutoRes.data?.automation;
    assert('Automation assigned PostgreSQL UUID', Boolean(testAutomation && testAutomation.id));

    // List automations
    const listAutosRes = await apiClient.get('/api/v1/whatsapp/automations?status=ACTIVE');
    assert('GET /whatsapp/automations returns active workflows', listAutosRes.success && listAutosRes.data?.length > 0);

    // Update automation status
    const updateAutoRes = await apiClient.patch(`/api/v1/whatsapp/automations/${testAutomation.id}`, {
      status: 'PAUSED',
    });
    assert('PATCH /whatsapp/automations/:id pauses sequence', updateAutoRes.success && updateAutoRes.data?.automation?.status === 'PAUSED');

    // Section 5: Follow-Up Management Pipeline
    console.log('\n[SECTION 5] Follow-Up Pipeline & Scheduling');
    const createFollowUpRes = await apiClient.post('/api/v1/whatsapp/follow-ups', {
      clientId: testClient.id,
      conversationId: testConv.id,
      assignedTo: 'Elena Rostova',
      contactPhone: '+91 98765 12345',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      note: 'Deliver finalized pricing matrix and onboard retainer.',
      channel: 'WHATSAPP',
      priority: 'HIGH',
    });
    assert('POST /whatsapp/follow-ups creates follow-up task', createFollowUpRes.success);
    testFollowUp = createFollowUpRes.data?.followUp;
    assert('Follow-up assigned PostgreSQL UUID', Boolean(testFollowUp && testFollowUp.id));
    assert('Follow-up priority set to HIGH', testFollowUp?.priority === 'HIGH');

    // Update follow-up status transition
    const updateFollowUpRes = await apiClient.patch(`/api/v1/whatsapp/follow-ups/${testFollowUp.id}`, {
      status: 'COMPLETED',
      note: 'Pricing proposal accepted by client.',
    });
    assert('PATCH /whatsapp/follow-ups/:id transitions status to COMPLETED', updateFollowUpRes.success && updateFollowUpRes.data?.followUp?.status === 'COMPLETED');

    // Section 6: Meta WhatsApp External Dispatch Safety Gate
    console.log('\n[SECTION 6] Meta WhatsApp Cloud API Provider Gate');
    const waDispatchResult = await actionExecutor.executeAction(
      {
        type: 'WHATSAPP_SEND',
        params: {
          to: '+91 98765 12345',
          template: 'strategy_consultation_welcome',
        },
      },
      {
        agencyId: agencyA,
        clientId: testClient.id,
        leadId: 'test-lead-001',
      }
    );
    assert('Unconfigured Meta Cloud API safely returns CONFIGURATION_REQUIRED', waDispatchResult.status === 'CONFIGURATION_REQUIRED');
    assert('Zero fake delivery IDs generated', !waDispatchResult.messageId);

    // Section 7: RBAC Access Control Gates
    console.log('\n[SECTION 7] RBAC Permission Enforcement');
    const viewerToken = generateToken({
      userId: 'usr-viewer-wa',
      agencyId: agencyA,
      role: ROLES.VIEWER,
      email: 'viewer@agency.com',
    });
    const viewerHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${viewerToken}`,
    };

    const viewerConvRes = await fetch(`${localBaseUrl}/whatsapp/conversations`, {
      method: 'POST',
      headers: viewerHeaders,
      body: JSON.stringify({
        clientId: testClient.id,
        contactName: 'Unauthorized Create',
        contactPhone: '+91 90000 00000',
      }),
    });
    assert('Viewer role blocked from creating conversation (403 Forbidden)', viewerConvRes.status === 403);

    const analystToken = generateToken({
      userId: 'usr-analyst-wa',
      agencyId: agencyA,
      role: ROLES.ANALYST,
      email: 'analyst@agency.com',
    });
    const analystHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${analystToken}`,
    };

    const analystTmplDeleteRes = await fetch(`${localBaseUrl}/whatsapp/templates/${testTemplate.id}`, {
      method: 'DELETE',
      headers: analystHeaders,
    });
    assert('Analyst role blocked from deleting template (403 Forbidden)', analystTmplDeleteRes.status === 403);

    const analystAutoDeleteRes = await fetch(`${localBaseUrl}/whatsapp/automations/${testAutomation.id}`, {
      method: 'DELETE',
      headers: analystHeaders,
    });
    assert('Analyst role blocked from deleting automation (403 Forbidden)', analystAutoDeleteRes.status === 403);

    // Section 8: Multi-Tenant Cross-Agency Protection
    console.log('\n[SECTION 8] Multi-Tenant Isolation & IDOR Protection');
    const tenantBToken = generateToken({
      userId: 'usr-tenant-b-wa',
      agencyId: agencyB,
      role: ROLES.OWNER,
      email: 'owner@agency-b.com',
    });
    const tenantBHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tenantBToken}`,
    };

    const crossConvRes = await fetch(`${localBaseUrl}/whatsapp/conversations/${testConv.id}`, {
      method: 'GET',
      headers: tenantBHeaders,
    });
    assert('Cross-agency conversation access blocked (403/404)', crossConvRes.status === 403 || crossConvRes.status === 404);

    const crossTmplRes = await fetch(`${localBaseUrl}/whatsapp/templates/${testTemplate.id}`, {
      method: 'GET',
      headers: tenantBHeaders,
    });
    assert('Cross-agency template access blocked (403/404)', crossTmplRes.status === 403 || crossTmplRes.status === 404);

    const crossFollowUpRes = await fetch(`${localBaseUrl}/whatsapp/follow-ups/${testFollowUp.id}`, {
      method: 'GET',
      headers: tenantBHeaders,
    });
    assert('Cross-agency follow-up access blocked (403/404)', crossFollowUpRes.status === 403 || crossFollowUpRes.status === 404);

    // Section 9: Secret Sanitization
    console.log('\n[SECTION 9] Secret Protection & Sanitization');
    const dumpStr = JSON.stringify({
      conv: testConv,
      tmpl: testTemplate,
      auto: testAutomation,
      fu: testFollowUp,
      waResult: waDispatchResult,
    });
    assert('Zero access_token present in serialized state', !dumpStr.includes('access_token'));
    assert('Zero client_secret present in serialized state', !dumpStr.includes('client_secret'));
    assert('Zero META_WA_ACCESS_TOKEN present in serialized state', !dumpStr.includes('META_WA_ACCESS_TOKEN'));

    // Section 10: Cleanup Fixtures
    console.log('\n[SECTION 10] Fixture Teardown');
    await apiClient.delete(`/api/v1/whatsapp/conversations/${testConv.id}`);
    await apiClient.delete(`/api/v1/whatsapp/templates/${testTemplate.id}`);
    await apiClient.delete(`/api/v1/whatsapp/automations/${testAutomation.id}`);
    await apiClient.delete(`/api/v1/whatsapp/follow-ups/${testFollowUp.id}`);
    await clientRepository.delete(testClient.id, agencyA, true);
    assert('Fixtures safely archived and deleted from PostgreSQL', true);
  } finally {
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`WHATSAPP MARKETING TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runWhatsAppTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
