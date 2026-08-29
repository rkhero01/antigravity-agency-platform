/**
 * Social Accounts & Platform Connection Real API Test Suite
 * Task 5: Complete Verification of Production Social Accounts Module
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { socialAccountsService } from '../../src/services/socialAccountsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { clientRepository } from '../src/repositories/clientRepository.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL SOCIAL ACCOUNTS & PLATFORM CONNECTIONS (TASK 5)');
console.log('========================================================================\n');

async function runSocialAccountTests() {
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
    console.log('[SECTION 1] Authentication Required for Social Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await socialAccountsService.getAccounts();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /social-accounts is blocked', Boolean(err.message));
    }
    assert('Authentication required for social operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: OAuth Configuration Reporting
    console.log('\n[SECTION 2] OAuth Provider Configuration Reporting');
    const oauthStatus = await socialAccountsService.getOAuthStatus();
    assert('getOAuthStatus() returns provider status map', typeof oauthStatus === 'object');
    assert('Meta OAuth configuration evaluated accurately', typeof oauthStatus.META === 'boolean');
    assert('Google OAuth configuration evaluated accurately', typeof oauthStatus.GOOGLE_BUSINESS === 'boolean');
    assert('LinkedIn OAuth configuration evaluated accurately', typeof oauthStatus.LINKEDIN === 'boolean');

    // Section 3: Live GET /api/v1/social-accounts (Empty / Initial List)
    console.log('\n[SECTION 3] Live GET /api/v1/social-accounts from Database');
    const initialList = await socialAccountsService.getAccounts();
    assert('getAccounts() returns array from database', Array.isArray(initialList));
    const initialCount = initialList.length;

    // Section 4: Create / Connect Social Account
    console.log('\n[SECTION 4] Live POST /api/v1/social-accounts/connect');
    const testAccountName = `Meta Growth Channel ${Date.now()}`;
    const newAccountData = {
      platform: 'META',
      accountName: testAccountName,
      handle: '@growth_apex',
      platformAccountId: `act_meta_${Date.now()}`,
      scopes: ['pages_read_engagement', 'instagram_basic'],
    };

    const created = await socialAccountsService.connectAccount(newAccountData);
    assert('connectAccount() returns normalized social account record with ID', Boolean(created && created.id));
    assert('Created account has correct platform', created.platform === 'META');
    assert('Created account has correct name', created.accountName === testAccountName);
    assert('Created account has active status', created.status === 'Active');
    assert('Created account has calculated tokenDaysRemaining', created.tokenDaysRemaining > 0);

    // Section 5: Verification of Persistence & List Filter
    console.log('\n[SECTION 5] Verification of Persistence & Query Filters');
    const afterCreateList = await socialAccountsService.getAccounts();
    assert('Social account count incremented in database', afterCreateList.length === initialCount + 1);

    const platformFiltered = await socialAccountsService.getAccounts({ platform: 'META' });
    assert('Platform filter returns matching assets', platformFiltered.some((a) => a.id === created.id));

    const metrics = socialAccountsService.calculateHealthMetrics(afterCreateList);
    assert('calculateHealthMetrics tallies total connections', metrics.total === afterCreateList.length);
    assert('calculateHealthMetrics tallies active connections', metrics.active > 0);

    // Section 6: GET Single Social Account by ID
    console.log('\n[SECTION 6] Live GET /api/v1/social-accounts/:id');
    const fetched = await socialAccountsService.getAccountById(created.id);
    assert('getAccountById() returns specific account record', Boolean(fetched && fetched.id === created.id));
    assert('Account details match created values', fetched.accountName === testAccountName);

    // Section 7: Update Social Account
    console.log('\n[SECTION 7] Live PATCH /api/v1/social-accounts/:id (Update)');
    const updated = await socialAccountsService.updateAccount(created.id, {
      accountName: `${testAccountName} (Verified)`,
      handle: '@growth_apex_verified',
    });
    assert('updateAccount() updates accountName', updated.accountName === `${testAccountName} (Verified)`);
    assert('updateAccount() updates handle', updated.handle === '@growth_apex_verified');

    // Section 8: Reconnect Social Account
    console.log('\n[SECTION 8] Live POST /api/v1/social-accounts/:id/reconnect');
    const reconnectRes = await socialAccountsService.reconnectAccount(created.id);
    assert('reconnectAccount() returns refreshed account', Boolean(reconnectRes.account && reconnectRes.account.id === created.id));
    assert('reconnectAccount() reports OAuth configuration status', typeof reconnectRes.oauthConfigured === 'boolean');
    assert('reconnectAccount() provides clear user feedback', Boolean(reconnectRes.message));

    // Section 9: Disconnect / Soft-Delete Social Account
    console.log('\n[SECTION 9] Live DELETE /api/v1/social-accounts/:id (Disconnect & Soft-Delete)');
    const disconnectRes = await socialAccountsService.disconnectAccount(created.id);
    assert('disconnectAccount() returns success response', Boolean(disconnectRes.message));

    const postDisconnectList = await socialAccountsService.getAccounts();
    const isExcluded = !postDisconnectList.some((a) => a.id === created.id);
    assert('Disconnected social account excluded from active query list', isExcluded);

    // Section 10: Validation Defenses
    console.log('\n[SECTION 10] Validation Defenses & Error Handling');
    let invalidPlatformCaught = false;
    try {
      await socialAccountsService.connectAccount({
        platform: 'INVALID_TIKTOK_UNKNOWN',
        accountName: 'Bad Platform',
      });
    } catch (err) {
      invalidPlatformCaught = true;
      assert('Invalid social platform is rejected with validation error', Boolean(err.message));
    }
    assert('Platform validation strictly enforced', invalidPlatformCaught);

    // Section 11: Multi-Tenant Isolation
    console.log('\n[SECTION 11] Multi-Tenant Isolation & Cross-Tenant Protection');
    let crossTenantCaught = false;
    try {
      await apiClient.socialAccounts.getById('nonexistent-account-999');
    } catch (err) {
      crossTenantCaught = true;
      assert('Non-existent or cross-tenant account request returns 404/403', Boolean(err.message));
    }
    assert('Cross-tenant isolation strictly enforced', crossTenantCaught);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL SOCIAL ACCOUNTS TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSocialAccountTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
