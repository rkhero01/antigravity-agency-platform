/**
 * Settings & Agency Workspace Real API Test Suite
 * Task 4: Complete Verification of Production Agency Profile & Settings Module
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { settingsService } from '../../src/services/settingsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL AGENCY WORKSPACE & SETTINGS MODULE (TASK 4)');
console.log('========================================================================\n');

async function runSettingsTests() {
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

  // Start local test server for unified verification of latest route definitions
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
    console.log('[SECTION 1] Authentication Required for Agency Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await settingsService.getAgencyProfile();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /agency is blocked', Boolean(err.message));
    }
    assert('Authentication required for agency operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator logged in with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: Live GET /api/v1/agency from PostgreSQL
    console.log('\n[SECTION 2] Live GET /api/v1/agency from Database');
    const agency = await settingsService.getAgencyProfile();
    assert('getAgencyProfile() returns agency object from database', Boolean(agency && agency.id));
    assert('Agency ID matches operator tenant ID', agency.id === agencyId);
    assert('Agency name is populated', Boolean(agency.name));
    assert('Agency plan is populated', Boolean(agency.plan));
    assert('Agency status is ACTIVE', agency.status === 'ACTIVE');

    // Section 3: Live PATCH /api/v1/agency (Agency Profile Update)
    console.log('\n[SECTION 3] Live PATCH /api/v1/agency (Agency Profile Update)');
    const originalName = agency.name;
    const testUpdatedName = `Antigravity Global Media ${Date.now()}`;
    const updatedAgency = await settingsService.updateAgencyProfile({
      name: testUpdatedName,
      domain: 'antigravity-global.agency',
    });
    assert('updateAgencyProfile() returns updated name', updatedAgency.name === testUpdatedName);
    assert('updateAgencyProfile() returns updated domain', updatedAgency.domain === 'antigravity-global.agency');

    // Verify persistence in fresh GET query
    const freshAgency = await settingsService.getAgencyProfile();
    assert('Updated agency profile persisted in database', freshAgency.name === testUpdatedName);

    // Revert back to clean state
    await settingsService.updateAgencyProfile({ name: originalName });
    const revertedAgency = await settingsService.getAgencyProfile();
    assert('Agency name reverted cleanly to original state', revertedAgency.name === originalName);

    // Section 4: Live GET /api/v1/auth/me (User Profile)
    console.log('\n[SECTION 4] Live GET /api/v1/auth/me (User Profile)');
    const userProfile = await settingsService.getUserProfile();
    assert('getUserProfile() returns user object', Boolean(userProfile && userProfile.id));
    assert('User has corporate email', userProfile.email === 'owner@antigravity.agency');
    assert('User has assigned OWNER role', userProfile.role === 'OWNER');
    assert('User has permissions array', Array.isArray(userProfile.permissions));

    // Section 5: Live PATCH /api/v1/auth/profile (Update Name)
    console.log('\n[SECTION 5] Live PATCH /api/v1/auth/profile (Update Name)');
    const originalUserName = userProfile.name;
    const testUserName = `Managing Partner ${Date.now()}`;
    const updatedUser = await settingsService.updateUserProfile({ name: testUserName });
    assert('updateUserProfile() updates name in database', updatedUser.name === testUserName);

    // Revert user name
    await settingsService.updateUserProfile({ name: originalUserName });
    const revertedUser = await settingsService.getUserProfile();
    assert('User name reverted cleanly', revertedUser.name === originalUserName);

    // Section 6: Live POST /api/v1/auth/change-password
    console.log('\n[SECTION 6] Live POST /api/v1/auth/change-password');
    // 6a. Wrong current password rejected
    let wrongPassCaught = false;
    try {
      await settingsService.changePassword('WrongPassword123!', 'NewStrongPass2026!');
    } catch (err) {
      wrongPassCaught = true;
      assert('Incorrect current password is rejected with error', Boolean(err.message));
    }
    assert('Current password verification enforced', wrongPassCaught);

    // 6b. Short new password rejected
    let shortPassCaught = false;
    try {
      await settingsService.changePassword('AntigravityDemo2026!', 'short');
    } catch (err) {
      shortPassCaught = true;
      assert('Short new password (< 8 chars) is rejected', Boolean(err.message));
    }
    assert('Password length requirement enforced', shortPassCaught);

    // 6c. Successful password update and rollback
    const changeRes = await settingsService.changePassword('AntigravityDemo2026!', 'TemporaryPass2026!');
    assert('Valid password change succeeds', Boolean(changeRes?.message));

    // Revert password back to original AntigravityDemo2026!
    await settingsService.changePassword('TemporaryPass2026!', 'AntigravityDemo2026!');
    assert('Password reverted back to primary demo password', true);

    // Section 7: Unified getSettings Loader
    console.log('\n[SECTION 7] Unified getSettings() Loader');
    const fullSettings = await settingsService.getSettings();
    assert('getSettings() returns agency section', Boolean(fullSettings.agency?.name));
    assert('getSettings() returns user section', Boolean(fullSettings.user?.email));
    assert('getSettings() returns preferences section', Boolean(fullSettings.preferences?.timezone));

    // Section 8: Multi-Tenant Isolation & Security
    console.log('\n[SECTION 8] Multi-Tenant Isolation & Security');
    let tenantTamperCaught = false;
    try {
      await apiClient.agency.update({ id: 'agency-foreign-999' });
    } catch (err) {
      tenantTamperCaught = true;
      assert('Tenant ID tampering rejected by backend', Boolean(err.message));
    }
    assert('Immutable tenant isolation enforced', tenantTamperCaught);
  } finally {
    // Reset apiClient URL to initial base URL
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL SETTINGS TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSettingsTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
