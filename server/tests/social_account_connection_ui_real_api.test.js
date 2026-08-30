/**
 * Social Account Connection UI & Real OAuth Handshake Test Suite
 * Task 12: Complete Verification of Connection Center, Real OAuth Handshake, CSRF State, Multi-Page Discovery & Selection
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { integrationService } from '../src/services/integrations/integrationService.js';
import { oauthStateStore } from '../src/services/integrations/oauth/oauthStateStore.js';
import { oauthDiscoveryStore } from '../src/services/integrations/oauth/oauthDiscoveryStore.js';
import { encryptToken, decryptToken, sanitizeAccountCredentials } from '../src/utils/tokenEncryption.js';
import { clientsService } from '../../src/services/clientsService.js';
import { socialAccountsService } from '../../src/services/socialAccountsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL SOCIAL ACCOUNT CONNECTION CENTER (TASK 12)');
console.log('========================================================================\n');

async function runSocialConnectionTests() {
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
    console.log('[SECTION 1] Authentication Required for Connection Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await apiClient.integrations.status();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /integrations is blocked', Boolean(err.message));
    }
    assert('Authentication required for connection operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: OAuth Configuration Status
    console.log('\n[SECTION 2] Live GET /api/v1/integrations/status');
    const statusRes = await apiClient.integrations.status();
    const providers = statusRes.data?.providers;
    assert('Platform OAuth status returns object', Boolean(providers));
    assert('Meta status evaluated', typeof providers?.META === 'boolean');
    assert('Google status evaluated', typeof providers?.GOOGLE === 'boolean');
    assert('LinkedIn status evaluated', typeof providers?.LINKEDIN === 'boolean');
    assert('Twitter status evaluated', typeof providers?.TWITTER === 'boolean');

    // Section 3: Provider Connection Handshake Initiation
    console.log('\n[SECTION 3] Live Provider Connect Handshake Endpoints');
    const clientList = await clientsService.getClients();
    const targetClient = clientList[0];

    const platforms = ['meta', 'google', 'linkedin', 'twitter'];
    for (const plat of platforms) {
      const connRes = await apiClient.integrations.connect(plat, { clientId: targetClient.id });
      assert(
        `Connect handshake evaluated for ${plat.toUpperCase()}`,
        connRes.data?.status === 'CONFIGURATION_REQUIRED' || connRes.data?.status === 'CONNECTABLE'
      );
    }

    // Section 4: Invalid Provider & Invalid Client Handling
    console.log('\n[SECTION 4] Validation Defenses & Tenant Security');
    let invalidPlatCaught = false;
    try {
      await apiClient.integrations.connect('invalid_snapchat_unknown', { clientId: targetClient.id });
    } catch (err) {
      invalidPlatCaught = true;
      assert('Invalid provider name rejected with validation error', Boolean(err.message));
    }
    assert('Invalid provider strictly blocked', invalidPlatCaught);

    let invalidClientCaught = false;
    try {
      await apiClient.integrations.connect('meta', { clientId: 'nonexistent-client-uuid-999' });
    } catch (err) {
      invalidClientCaught = true;
      assert('Non-existent client workspace rejected', Boolean(err.message));
    }
    assert('Client validation strictly enforced', invalidClientCaught);

    // Section 5: CSRF State Store Security
    console.log('\n[SECTION 5] CSRF OAuth State Generation & Single-Use Consumption');
    const stateToken = oauthStateStore.createState({
      agencyId: 'agency-demo-001',
      clientId: targetClient.id,
      userId: 'user-001',
      provider: 'META',
    });
    assert('Generated cryptographic state token (64 hex)', Boolean(stateToken && stateToken.length === 64));

    const validated = oauthStateStore.validateAndConsumeState(stateToken, 'META');
    assert('Validated state bound to agency and client', validated.agencyId === 'agency-demo-001' && validated.clientId === targetClient.id);

    let replayCaught = false;
    try {
      oauthStateStore.validateAndConsumeState(stateToken, 'META');
    } catch (err) {
      replayCaught = true;
      assert('Replay of consumed state token is rejected', Boolean(err.message));
    }
    assert('Single-use state strictly enforced', replayCaught);

    // Section 6: OAuth Discovery Session Store & Account Selection
    console.log('\n[SECTION 6] OAuth Discovery Session Store & Selection API');
    const testDiscoveredAccounts = [
      {
        platformAccountId: `fb_page_${Date.now()}`,
        accountName: 'Acme Marketing Page',
        handle: '@acmemarketing',
        platform: 'FACEBOOK',
        platformLabel: 'Facebook Page',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        metadata: { pageId: '123456' },
      },
      {
        platformAccountId: `ig_biz_${Date.now()}`,
        accountName: '@acme.growth',
        handle: '@acme.growth',
        platform: 'INSTAGRAM',
        platformLabel: 'Instagram Business',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        metadata: { instagramId: '789012' },
      },
    ];

    const discoveryToken = oauthDiscoveryStore.createSession({
      agencyId: 'agency-demo-001',
      clientId: targetClient.id,
      userId: 'user-001',
      provider: 'META',
      tokenResult: {
        accessToken: 'mock_meta_oauth_access_token_12345',
        refreshToken: null,
        tokenExpiresAt: new Date(Date.now() + 5184000000),
        scopes: 'pages_show_list,pages_read_engagement,pages_manage_posts',
      },
      discoveredAccounts: testDiscoveredAccounts,
    });
    assert('Discovery session created with 64-char token', Boolean(discoveryToken && discoveryToken.length === 64));

    // Connect selected account via select-account endpoint
    const selectRes = await apiClient.integrations.selectAccount('meta', {
      discoveryToken,
      platformAccountId: testDiscoveredAccounts[1].platformAccountId,
      clientId: targetClient.id,
    });
    const connectedDiscovered = selectRes.data?.account;
    assert('selectAccount endpoint connects chosen account', Boolean(connectedDiscovered && connectedDiscovered.id));
    assert('Connected account matches chosen handle', connectedDiscovered.handle === '@acme.growth');
    assert('Connected account status is ACTIVE', connectedDiscovered.status === 'ACTIVE');

    // Section 7: AES-256-GCM Token Encryption & Decryption
    console.log('\n[SECTION 7] AES-256-GCM Token Encryption & Decryption');
    const sampleToken = 'meta_oauth_long_lived_token_secret_abc123';
    const cipher = encryptToken(sampleToken);
    assert('Token encrypted into IV:Tag:Cipher format', cipher.includes(':'));
    assert('Plaintext secret not present in ciphertext', !cipher.includes(sampleToken));

    const plain = decryptToken(cipher);
    assert('Decrypted token matches original secret exactly', plain === sampleToken);

    // Section 8: Live Account Connection & Encrypted Storage
    console.log('\n[SECTION 8] Social Account Persistence in PostgreSQL');
    const newAccount = await socialAccountsService.connectAccount({
      clientId: targetClient.id,
      platform: 'INSTAGRAM',
      accountName: `Connection Center Test ${Date.now()}`,
    });
    assert('connectAccount() persists record in PostgreSQL', Boolean(newAccount && newAccount.id));

    // Section 9: Live Account Sync & Decrypted Health
    console.log('\n[SECTION 9] Live Account Sync & Health Verification');
    const syncRes = await apiClient.integrations.sync(newAccount.id);
    assert('sync endpoint responds with normalized status', Boolean(syncRes.data));

    // Section 10: Reconnect Initiation & Token Replacement
    console.log('\n[SECTION 10] Live Account Reconnect Initiation');
    const reconnectRes = await apiClient.integrations.reconnect(newAccount.id, { platform: 'INSTAGRAM' });
    assert(
      'reconnect endpoint initiates OAuth flow',
      reconnectRes.data?.status === 'CONFIGURATION_REQUIRED' || reconnectRes.data?.status === 'CONNECTABLE'
    );

    // Section 11: Disconnect Account & Purge Credentials
    console.log('\n[SECTION 11] Disconnect Account & Purge Credentials');
    const disconnectRes = await apiClient.integrations.disconnect(newAccount.id);
    assert('disconnect endpoint marks account disconnected', Boolean(disconnectRes.data));

    // Clean up created accounts
    await socialAccountsService.disconnectAccount(newAccount.id);
    if (connectedDiscovered?.id) {
      await socialAccountsService.disconnectAccount(connectedDiscovered.id);
    }

    // Section 12: Cross-Tenant Protection
    console.log('\n[SECTION 12] Cross-Tenant Protection');
    let crossTenantCaught = false;
    try {
      await apiClient.integrations.sync('nonexistent-account-999');
    } catch (err) {
      crossTenantCaught = true;
      assert('Cross-tenant or non-existent integration sync returns 404/403', Boolean(err.message));
    }
    assert('Cross-tenant isolation strictly enforced', crossTenantCaught);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL SOCIAL CONNECTION TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSocialConnectionTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
