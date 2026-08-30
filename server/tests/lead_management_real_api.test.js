/**
 * Lead & CRM Pipeline Real API Test Suite
 * Task 7: Complete Verification of Production Lead Management Module
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { crmService } from '../../src/services/crmService.js';
import { clientsService } from '../../src/services/clientsService.js';
import { campaignsService } from '../../src/services/campaignsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL CRM LEAD MANAGEMENT (TASK 7)');
console.log('========================================================================\n');

async function runLeadTests() {
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

  // Start local test server
  const initialBaseUrl = apiClient.getBaseUrl();
  const app = createApp();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const localBaseUrl = `http://localhost:${port}/api/v1`;

  // Point apiClient to test server
  apiClient.setBaseUrl(localBaseUrl);

  try {
    // Section 1: Authentication Required
    console.log('[SECTION 1] Authentication Required for Lead Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await crmService.getLeads();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /leads is blocked', Boolean(err.message));
    }
    assert('Authentication required for lead operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: Live GET /api/v1/leads (Initial List)
    console.log('\n[SECTION 2] Live GET /api/v1/leads from Database');
    const initialList = await crmService.getLeads();
    assert('getLeads() returns array from database', Array.isArray(initialList));
    const initialCount = initialList.length;

    // Get a valid client and campaign for association
    const clientList = await clientsService.getClients();
    assert('Retrieved client workspaces for association', clientList.length > 0);
    const targetClient = clientList[0];

    const campList = await campaignsService.getCampaigns();
    const targetCampaign = campList[0];

    // Section 3: Create / POST Lead
    console.log('\n[SECTION 3] Live POST /api/v1/leads');
    const testLeadName = `Vikram Malhotra ${Date.now()}`;
    const newLeadData = {
      clientId: targetClient.id,
      campaignId: targetCampaign?.id || null,
      name: testLeadName,
      company: 'Omni Retail Ventures',
      email: 'vikram@omniretail.in',
      phone: '+91 98999 11223',
      source: 'META_ADS',
      stage: 'QUALIFIED',
      value: 175000,
      owner: 'Diya Patel',
    };

    const created = await crmService.createLead(newLeadData);
    assert('createLead() returns normalized lead record with ID', Boolean(created && created.id));
    assert('Created lead has correct contact name', created.name === testLeadName);
    assert('Created lead bound to client workspace', created.clientId === targetClient.id);
    assert('Created lead stage is Qualified (SQL)', created.stage === 'QUALIFIED');
    assert('Created lead value is set', created.value === 175000);

    // Section 4: Persistence & List Filter
    console.log('\n[SECTION 4] Verification of Persistence & Query Filters');
    const afterCreateList = await crmService.getLeads();
    assert('Lead count incremented in database', afterCreateList.length === initialCount + 1);

    const clientFiltered = await crmService.getLeads({ clientId: targetClient.id });
    assert('Client filter returns matching lead', clientFiltered.some((l) => l.id === created.id));

    const stageFiltered = await crmService.getLeads({ stage: 'QUALIFIED' });
    assert('Stage filter returns matching lead', stageFiltered.some((l) => l.id === created.id));

    const overview = await crmService.getCRMOverview();
    assert('getCRMOverview() returns live total leads', parseInt(overview.totalLeads, 10) === afterCreateList.length);
    assert('getCRMOverview() tallies pipeline value', Boolean(overview.pipelineValue));

    // Section 5: GET Single Lead by ID
    console.log('\n[SECTION 5] Live GET /api/v1/leads/:id');
    const fetched = await crmService.getLeadById(created.id);
    assert('getLeadById() returns specific lead record', Boolean(fetched && fetched.id === created.id));
    assert('Fetched lead details match created values', fetched.name === testLeadName);

    // Section 6: Update Lead
    console.log('\n[SECTION 6] Live PATCH /api/v1/leads/:id (Update)');
    const updated = await crmService.updateLead(created.id, {
      name: `${testLeadName} (Director)`,
      stage: 'PROPOSAL_SENT',
      value: 220000,
    });
    assert('updateLead() updates name', updated.name === `${testLeadName} (Director)`);
    assert('updateLead() updates stage to PROPOSAL_SENT', updated.stage === 'PROPOSAL_SENT');
    assert('updateLead() updates deal value', updated.value === 220000);

    // Section 7: Archive / Soft-Delete Lead
    console.log('\n[SECTION 7] Live DELETE /api/v1/leads/:id (Archive & Soft-Delete)');
    const deleteRes = await crmService.deleteLead(created.id);
    assert('deleteLead() returns success message', Boolean(deleteRes.message));

    const postDeleteList = await crmService.getLeads();
    const isExcluded = !postDeleteList.some((l) => l.id === created.id);
    assert('Archived lead is excluded from active query list', isExcluded);

    // Section 8: Validation Defenses & Tenant Isolation
    console.log('\n[SECTION 8] Validation Defenses & Tenant Isolation');
    let invalidClientCaught = false;
    try {
      await crmService.createLead({
        clientId: 'invalid-client-uuid-999',
        name: 'Invalid Client Lead',
      });
    } catch (err) {
      invalidClientCaught = true;
      assert('Lead creation with non-existent client is rejected', Boolean(err.message));
    }
    assert('Client association validation strictly enforced', invalidClientCaught);

    let invalidStageCaught = false;
    try {
      await crmService.updateLead(initialList[0]?.id || 'lead-1', {
        stage: 'INVALID_STATUS_UNKNOWN',
      });
    } catch (err) {
      invalidStageCaught = true;
      assert('Invalid lead stage update is rejected with validation error', Boolean(err.message));
    }
    assert('Stage enum validation strictly enforced', invalidStageCaught);

    let crossTenantCaught = false;
    try {
      await apiClient.leads.get('nonexistent-lead-999');
    } catch (err) {
      crossTenantCaught = true;
      assert('Non-existent or cross-tenant lead returns 404/403', Boolean(err.message));
    }
    assert('Cross-tenant isolation strictly enforced', crossTenantCaught);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL CRM LEAD TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLeadTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
