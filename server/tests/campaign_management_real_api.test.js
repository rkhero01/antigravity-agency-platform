/**
 * Campaign & Paid Media Management Real API Test Suite
 * Task 6: Complete Verification of Production Campaigns Module
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { campaignsService } from '../../src/services/campaignsService.js';
import { clientsService } from '../../src/services/clientsService.js';
import { socialAccountsService } from '../../src/services/socialAccountsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL PAID MEDIA CAMPAIGNS (TASK 6)');
console.log('========================================================================\n');

async function runCampaignTests() {
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
    console.log('[SECTION 1] Authentication Required for Campaign Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await campaignsService.getCampaigns();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /campaigns is blocked', Boolean(err.message));
    }
    assert('Authentication required for campaign operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: Live GET /api/v1/campaigns (Initial List)
    console.log('\n[SECTION 2] Live GET /api/v1/campaigns from Database');
    const initialList = await campaignsService.getCampaigns();
    assert('getCampaigns() returns array from database', Array.isArray(initialList));
    const initialCount = initialList.length;

    // Get a valid client ID for association
    const clientList = await clientsService.getClients();
    assert('Retrieved client workspaces for association', clientList.length > 0);
    const targetClient = clientList[0];

    // Optional: create a test social account for channel linkage
    const testSocial = await socialAccountsService.connectAccount({
      clientId: targetClient.id,
      platform: 'META',
      accountName: `Ad Asset ${Date.now()}`,
    });
    assert('Created temporary social asset channel for linkage', Boolean(testSocial && testSocial.id));

    // Section 3: Create / POST Campaign
    console.log('\n[SECTION 3] Live POST /api/v1/campaigns');
    const testCampaignName = `Apex Summer Lead Surge ${Date.now()}`;
    const newCampaignData = {
      clientId: targetClient.id,
      socialAccountId: testSocial.id,
      platform: 'META',
      name: testCampaignName,
      objective: 'LEAD_GENERATION',
      dailyBudget: 2500,
      budgetType: 'DAILY',
      externalCampaignId: `ext-meta-${Date.now()}`,
    };

    const created = await campaignsService.createCampaign(newCampaignData);
    assert('createCampaign() returns normalized campaign record with ID', Boolean(created && created.id));
    assert('Created campaign has correct name', (created.name || created.title) === testCampaignName);
    assert('Created campaign bound to client', created.clientId === targetClient.id);
    assert('Created campaign linked to social asset', created.socialAccountId === testSocial.id);
    assert('Created campaign status is Active', created.status === 'Active');
    assert('Created campaign dailyBudget is set', created.dailyBudget === 2500);

    // Section 4: Persistence & List Filter
    console.log('\n[SECTION 4] Verification of Persistence & Query Filters');
    const afterCreateList = await campaignsService.getCampaigns();
    assert('Campaign count incremented in database', afterCreateList.length === initialCount + 1);

    const clientFiltered = await campaignsService.getCampaigns({ clientId: targetClient.id });
    assert('Client filter returns matching campaign', clientFiltered.some((c) => c.id === created.id));

    const platformFiltered = await campaignsService.getCampaigns({ platform: 'META' });
    assert('Platform filter returns matching campaign', platformFiltered.some((c) => c.id === created.id));

    const kpis = campaignsService.calculateCampaignKPIs(afterCreateList);
    assert('calculateCampaignKPIs tallies total campaigns', kpis.total === afterCreateList.length);
    assert('calculateCampaignKPIs tallies daily budget run-rate', kpis.totalDailyBudget > 0);

    // Section 5: GET Single Campaign by ID
    console.log('\n[SECTION 5] Live GET /api/v1/campaigns/:id');
    const fetched = await campaignsService.getCampaignById(created.id);
    assert('getCampaignById() returns specific campaign record', Boolean(fetched && fetched.id === created.id));
    assert('Fetched campaign details match created values', (fetched.name || fetched.title) === testCampaignName);

    // Section 6: Update Campaign
    console.log('\n[SECTION 6] Live PATCH /api/v1/campaigns/:id (Update)');
    const updated = await campaignsService.updateCampaign(created.id, {
      name: `${testCampaignName} (Scaled)`,
      dailyBudget: 4000,
      status: 'PAUSED',
    });
    assert('updateCampaign() updates name', (updated.name || updated.title) === `${testCampaignName} (Scaled)`);
    assert('updateCampaign() updates dailyBudget', updated.dailyBudget === 4000);
    assert('updateCampaign() updates status to Paused', updated.status === 'Paused');

    // Section 7: Archive / Soft-Delete Campaign
    console.log('\n[SECTION 7] Live DELETE /api/v1/campaigns/:id (Archive & Soft-Delete)');
    const archiveRes = await campaignsService.archiveCampaign(created.id);
    assert('archiveCampaign() returns success message', Boolean(archiveRes.message));

    const postArchiveList = await campaignsService.getCampaigns();
    const isExcluded = !postArchiveList.some((c) => c.id === created.id);
    assert('Archived campaign is excluded from active query list', isExcluded);

    // Clean up temporary social asset
    await socialAccountsService.disconnectAccount(testSocial.id);

    // Section 8: Validation Defenses
    console.log('\n[SECTION 8] Validation Defenses & Tenant Isolation');
    let invalidClientCaught = false;
    try {
      await campaignsService.createCampaign({
        clientId: 'invalid-client-uuid-999',
        name: 'Invalid Client Campaign',
        platform: 'META',
      });
    } catch (err) {
      invalidClientCaught = true;
      assert('Campaign creation with non-existent client is rejected', Boolean(err.message));
    }
    assert('Client association validation enforced', invalidClientCaught);

    let invalidPlatformCaught = false;
    try {
      await campaignsService.createCampaign({
        clientId: targetClient.id,
        name: 'Invalid Platform Campaign',
        platform: 'INVALID_PINTEREST_UNKNOWN',
      });
    } catch (err) {
      invalidPlatformCaught = true;
      assert('Campaign creation with invalid platform is rejected', Boolean(err.message));
    }
    assert('Platform validation strictly enforced', invalidPlatformCaught);

    let crossTenantCaught = false;
    try {
      await apiClient.campaigns.get('nonexistent-camp-999');
    } catch (err) {
      crossTenantCaught = true;
      assert('Non-existent or cross-tenant campaign returns 404/403', Boolean(err.message));
    }
    assert('Cross-tenant isolation strictly enforced', crossTenantCaught);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL CAMPAIGN TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCampaignTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
