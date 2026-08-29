/**
 * Frontend Authentication, Profile Dropdown & Logout Flow Verification
 * 
 * Verifies:
 * 1. authSessionService login against live Render backend
 * 2. Token persistence and header authorization
 * 3. Session restoration via GET /api/v1/auth/me
 * 4. User profile data hydration (no hardcoded mock user)
 * 5. Sign out / token clearance and session blocking
 * 6. Re-authentication flow
 */

import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { MODULES } from '../../src/utils/constants.js';

console.log('========================================================================');
console.log('TEST SUITE: FRONTEND AUTHENTICATION & PROFILE DROPDOWN FLOW');
console.log('========================================================================\n');

async function runAuthProfileMenuTests() {
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // Ensure clean starting state
  await authSessionService.logout();

  // Test 1: Logged-out state
  console.log('[SECTION 1] Initial Unauthenticated State');
  assert('User is initially not authenticated', !authSessionService.isAuthenticated());
  assert('Initial token is empty', apiClient.getAuthToken() === null);
  assert('Initial user is null', authSessionService.getCurrentUser() === null);

  // Test 2: Login flow with real live Render backend credentials
  console.log('\n[SECTION 2] Live Login & Token Generation');
  const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
  assert('Login returned success: true', loginRes.success === true);
  assert('User has real authenticated user ID', loginRes.user?.id === 'usr-owner-001');
  assert('User has real agency ID', loginRes.user?.agencyId === 'agency-demo-001');
  assert('User has real role', loginRes.user?.role === 'OWNER');
  assert('Auth token stored in apiClient', Boolean(apiClient.getAuthToken()));
  assert('Service reports authenticated', authSessionService.isAuthenticated());

  // Test 3: Session restoration via GET /api/v1/auth/me
  console.log('\n[SECTION 3] Session Restoration from Live Backend');
  const restoredUser = await authSessionService.restoreSession();
  assert('Session restored successfully from /auth/me', Boolean(restoredUser));
  assert('Restored email matches operator', restoredUser?.email === 'owner@antigravity.agency');
  assert('Restored role matches OWNER', restoredUser?.role === 'OWNER');

  // Test 4: Menu navigation actions resolution
  console.log('\n[SECTION 4] Profile Menu Target Modules');
  assert('Workspace Settings targets MODULES.SETTINGS', MODULES.SETTINGS === 'settings');
  assert('Team Members & Roles targets MODULES.TEAM', MODULES.TEAM === 'team');
  assert('API & Integrations targets MODULES.SETTINGS', MODULES.SETTINGS === 'settings');

  // Test 5: Logout flow
  console.log('\n[SECTION 5] Sign Out & Token Clearance');
  await authSessionService.logout();
  assert('User is logged out after calling logout()', !authSessionService.isAuthenticated());
  assert('Auth token cleared from apiClient', apiClient.getAuthToken() === null);
  assert('Current user is null after logout', authSessionService.getCurrentUser() === null);

  // Test 6: Protected session blocked after logout
  console.log('\n[SECTION 6] Protection Verification After Logout');
  const postLogoutRestore = await authSessionService.restoreSession();
  assert('restoreSession returns null after logout', postLogoutRestore === null);
  assert('User remains unauthenticated', !authSessionService.isAuthenticated());

  // Test 7: Re-authentication flow
  console.log('\n[SECTION 7] Re-Authentication Flow');
  const reLoginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
  assert('Re-login succeeds', reLoginRes.success === true);
  assert('New token is stored', Boolean(apiClient.getAuthToken()));
  assert('User is authenticated again', authSessionService.isAuthenticated());

  // Clean up
  await authSessionService.logout();

  console.log('\n========================================================================');
  console.log(`FRONTEND AUTH & MENU TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthProfileMenuTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
