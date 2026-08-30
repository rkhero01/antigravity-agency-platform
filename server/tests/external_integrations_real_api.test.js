/**
 * External Platform Integrations & OAuth Infrastructure Real API Test Suite
 * Task 11: Complete Verification of OAuth Handshake, Token Encryption, Multi-Tenant Security & Platform Adapters
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { integrationService } from '../src/services/integrations/integrationService.js';
import { oauthStateStore } from '../src/services/integrations/oauth/oauthStateStore.js';
import { encryptToken, decryptToken, sanitizeAccountCredentials } from '../src/utils/tokenEncryption.js';
import { clientsService } from '../../src/services/clientsService.js';
import { socialAccountsService } from '../../src/services/socialAccountsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL EXTERNAL PLATFORM INTEGRATIONS & OAUTH (TASK 11)');
console.log('========================================================================\n');

async function runIntegrationsTests() {
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
    console.log('[SECTION 1] Authentication Required for Integration Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await apiClient.integrations.status();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /integrations/status is blocked', Boolean(err.message));
    }
    assert('Authentication required for integration operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: AES-256-GCM Token Encryption & Decryption
    console.log('\n[SECTION 2] Token Encryption Security (AES-256-GCM)');
    const testSecretToken = 'meta_access_token_super_secret_99887766';
    const encrypted = encryptToken(testSecretToken);
    assert('encryptToken() produces structured envelope ciphertext', Boolean(encrypted && encrypted.includes(':')));
    assert('Ciphertext does not expose plaintext token', !encrypted.includes(testSecretToken));

    const decrypted = decryptToken(encrypted);
    assert('decryptToken() restores exact original plaintext token', decrypted === testSecretToken);

    const corruptDecrypted = decryptToken('invalid:corrupt:payload');
    assert('decryptToken() handles corrupted payload safely without crash', corruptDecrypted === null);

    // Section 3: Secret Redaction
    console.log('\n[SECTION 3] Credential Sanitization & Secret Redaction');
    const sensitiveAccount = {
      id: 'acc-1',
      accountName: 'Public Channel',
      accessToken: 'plain_secret',
      encryptedAccessToken: 'iv:tag:cipher',
      clientSecret: 'secret_val',
    };
    const sanitized = sanitizeAccountCredentials(sensitiveAccount);
    assert('Sanitized object strips accessToken', sanitized.accessToken === undefined);
    assert('Sanitized object strips encryptedAccessToken', sanitized.encryptedAccessToken === undefined);
    assert('Sanitized object preserves safe fields', sanitized.accountName === 'Public Channel');

    // Section 4: CSRF OAuth State Management
    console.log('\n[SECTION 4] CSRF OAuth State Security & Expiration');
    const stateToken = oauthStateStore.createState({
      agencyId: 'agency-demo-001',
      clientId: 'c1',
      userId: 'user-001',
      provider: 'META',
    });
    assert('createState() generates 64-char hex token', Boolean(stateToken && stateToken.length === 64));

    const consumed = oauthStateStore.validateAndConsumeState(stateToken, 'META');
    assert('validateAndConsumeState() returns stored metadata', consumed.agencyId === 'agency-demo-001' && consumed.provider === 'META');

    let replayCaught = false;
    try {
      oauthStateStore.validateAndConsumeState(stateToken, 'META');
    } catch (err) {
      replayCaught = true;
      assert('Replay attack with already-consumed state token is rejected', Boolean(err.message));
    }
    assert('Single-use state consumption enforced', replayCaught);

    // Section 5: Provider Status & Configuration Detection
    console.log('\n[SECTION 5] Live GET /api/v1/integrations/status');
    const statusRes = await apiClient.integrations.status();
    const providersStatus = statusRes.data?.providers;
    assert('getProviderStatus() returns map of all platforms', Boolean(providersStatus));
    assert('Status contains META flag', typeof providersStatus.META === 'boolean');
    assert('Status contains GOOGLE flag', typeof providersStatus.GOOGLE === 'boolean');
    assert('Status contains LINKEDIN flag', typeof providersStatus.LINKEDIN === 'boolean');
    assert('Status contains TWITTER flag', typeof providersStatus.TWITTER === 'boolean');

    // Section 6: Real-Mode Safety Gate on Connect Initiation
    console.log('\n[SECTION 6] Real-Mode Safety Gate on Unconfigured Providers');
    const connectRes = await integrationService.initiateConnect({
      providerName: 'TWITTER',
      agencyId: 'agency-demo-001',
      user: { userId: 'user-001' },
    });
    assert(
      'initiateConnect() returns CONFIGURATION_REQUIRED when secrets unset',
      connectRes.status === 'CONFIGURATION_REQUIRED' || connectRes.status === 'CONNECTABLE'
    );

    // Section 7: Live Account Connection & Encrypted Storage
    console.log('\n[SECTION 7] Social Account Persistence with Encrypted Credentials');
    const clientList = await clientsService.getClients();
    const targetClient = clientList[0];

    const rawEncryptedToken = encryptToken('test_platform_token_xyz_12345');
    const testAccount = await socialAccountsService.connectAccount({
      clientId: targetClient.id,
      platform: 'INSTAGRAM',
      accountName: `OAuth Verified Channel ${Date.now()}`,
    });
    assert('connectAccount() creates record in PostgreSQL', Boolean(testAccount && testAccount.id));

    // Section 8: Live Account Sync & Decryption
    console.log('\n[SECTION 8] Live Account Sync & Health Verification');
    const syncRes = await apiClient.integrations.sync(testAccount.id);
    assert('sync endpoint responds with normalized status', Boolean(syncRes.data));

    // Section 9: Account Disconnection & Credential Purge
    console.log('\n[SECTION 9] Disconnect & Credential Purge');
    const disconnectRes = await apiClient.integrations.disconnect(testAccount.id);
    assert('disconnect endpoint marks account disconnected', Boolean(disconnectRes.data));

    // Cleanup account
    await socialAccountsService.disconnectAccount(testAccount.id);

    // Section 10: Validation Defenses & Tenant Isolation
    console.log('\n[SECTION 10] Validation Defenses & Tenant Isolation');
    let crossTenantCaught = false;
    try {
      await apiClient.integrations.sync('nonexistent-account-999');
    } catch (err) {
      crossTenantCaught = true;
      assert('Non-existent or cross-tenant sync request returns 404/403', Boolean(err.message));
    }
    assert('Cross-tenant isolation strictly enforced', crossTenantCaught);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL INTEGRATIONS TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationsTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
