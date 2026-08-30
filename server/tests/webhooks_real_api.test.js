/**
 * Webhook Ingestion & Subscription Management Real API Test Suite
 * Task 13 — Phase 2: Live Ingestion Pipeline, Replay Protection, Tenant Scoping & Lead Sync
 */

import http from 'http';
import crypto from 'crypto';
import { createApp } from '../src/app.js';
import { socialAccountRepository } from '../src/repositories/socialAccountRepository.js';
import { leadRepository } from '../src/repositories/leadRepository.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { ROLES } from '../src/middleware/auth.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL WEBHOOK INGESTION & SUBSCRIPTIONS (TASK 13 PHASE 2)');
console.log('========================================================================\n');

async function runWebhooksRealApiTests() {
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
    // Section 1: Public Meta GET Webhook Verification
    console.log('[SECTION 1] Public Meta GET Webhook Verification');
    process.env.META_WEBHOOK_VERIFY_TOKEN = 'meta_test_verify_token_2026';
    const rawBaseUrl = `http://localhost:${port}`;

    // 1. Valid verification
    const validVerifyRes = await fetch(
      `${rawBaseUrl}/api/v1/webhooks/meta?hub.mode=subscribe&hub.verify_token=meta_test_verify_token_2026&hub.challenge=CHALLENGE_TEST_7788`
    );
    const challengeText = await validVerifyRes.text();
    assert('Meta GET returns 200 OK for valid verify_token', validVerifyRes.status === 200);
    assert('Meta GET echoes back hub.challenge in body', challengeText === 'CHALLENGE_TEST_7788');

    // 2. Invalid verification token
    const invalidVerifyRes = await fetch(
      `${rawBaseUrl}/api/v1/webhooks/meta?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=CHALLENGE_TEST_7788`
    );
    assert('Meta GET returns 403 Forbidden for invalid verify_token', invalidVerifyRes.status === 403);

    // Section 2: Meta POST Signature Verification
    console.log('\n[SECTION 2] Meta POST Signature Verification & Replay Protection');
    const metaAppSecret = 'meta_test_app_secret_2026';
    process.env.META_APP_SECRET = metaAppSecret;

    const testPageId = `fb_page_live_${Date.now()}`;
    const testAgencyId = 'agency-demo-001';

    // Create active SocialAccount in database
    const createdAccount = await socialAccountRepository.create(
      {
        agencyId: testAgencyId,
        clientId: 'c1',
        platform: 'FACEBOOK',
        accountName: 'Acme Apex FB Page',
        platformAccountId: testPageId,
        status: 'ACTIVE',
      },
      testAgencyId
    );

    // 1. Missing signature
    const missingSigRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ object: 'page', entry: [{ id: testPageId }] }),
    });
    assert('Missing signature header is rejected with 401 Unauthorized', missingSigRes.status === 401);

    // 2. Invalid signature
    const invalidSigRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=invalid_hash_value_1234567890abcdef',
      },
      body: JSON.stringify({ object: 'page', entry: [{ id: testPageId }] }),
    });
    assert('Invalid signature is rejected with 401 Unauthorized', invalidSigRes.status === 401);

    // 3. Valid signature for Feed event
    const feedPayload = {
      object: 'page',
      entry: [
        {
          id: testPageId,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'feed',
              value: {
                item: 'status',
                verb: 'add',
                post_id: `post_${Date.now()}`,
                message: 'Excited to announce our new program!',
              },
            },
          ],
        },
      ],
    };

    const feedPayloadString = JSON.stringify(feedPayload);
    const feedHmac = crypto.createHmac('sha256', metaAppSecret).update(feedPayloadString).digest('hex');

    const validPostRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${feedHmac}`,
      },
      body: feedPayloadString,
    });
    const validPostJson = await validPostRes.json();
    assert('Valid POST webhook is processed successfully (200 OK)', validPostRes.status === 200 && validPostJson.success === true);

    // Section 3: Webhook Deduplication
    console.log('\n[SECTION 3] Webhook Deduplication');
    const duplicateRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${feedHmac}`,
      },
      body: feedPayloadString,
    });
    const duplicateJson = await duplicateRes.json();
    assert('Duplicate webhook event returns duplicate: true without re-processing', duplicateJson.data?.duplicate === true);

    // Section 4: Leadgen Ingestion
    console.log('\n[SECTION 4] Leadgen Ingestion & Configuration Gating');
    const leadPayload = {
      object: 'page',
      entry: [
        {
          id: testPageId,
          changes: [
            {
              field: 'leadgen',
              value: {
                leadgen_id: `leadgen_${Date.now()}`,
                form_id: 'form_888',
                ad_id: 'ad_777',
                created_time: Math.floor(Date.now() / 1000),
              },
            },
          ],
        },
      ],
    };

    const leadPayloadString = JSON.stringify(leadPayload);
    const leadHmac = crypto.createHmac('sha256', metaAppSecret).update(leadPayloadString).digest('hex');

    const leadPostRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${leadHmac}`,
      },
      body: leadPayloadString,
    });
    const leadPostJson = await leadPostRes.json();
    assert(
      'Leadgen webhook triggers real handling or CONFIGURATION_REQUIRED when access token unconfigured',
      leadPostRes.status === 200 && (leadPostJson.data?.status === 'CONFIGURATION_REQUIRED' || leadPostJson.data?.status === 'PROCESSED')
    );

    // Section 5: Tenant Isolation & Unknown Page Rejection
    console.log('\n[SECTION 5] Tenant Isolation & Unknown Page Handling');
    const unknownPagePayload = {
      object: 'page',
      entry: [{ id: 'unknown_page_9999999' }],
    };
    const unknownString = JSON.stringify(unknownPagePayload);
    const unknownHmac = crypto.createHmac('sha256', metaAppSecret).update(unknownString).digest('hex');

    const unknownRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${unknownHmac}`,
      },
      body: unknownString,
    });
    assert('Unknown platform account ID is rejected (404 NOT_FOUND)', unknownRes.status === 404);

    // Section 6: Authenticated Webhook Subscriptions & RBAC
    console.log('\n[SECTION 6] Authenticated Webhook Subscriptions & RBAC Controls');
    // Login as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success);

    // 1. List subscriptions
    const subListRes = await apiClient.get('/api/v1/webhooks/subscriptions');
    assert('GET /webhooks/subscriptions returns array', Array.isArray(subListRes.data?.subscriptions));

    // 2. Create subscription for Meta channel
    const createSubRes = await apiClient.post('/api/v1/webhooks/meta/subscribe', {
      socialAccountId: createdAccount.id,
      events: ['messages', 'feed', 'leadgen'],
    });
    assert(
      'POST /webhooks/meta/subscribe returns active subscription or CONFIGURATION_REQUIRED',
      createSubRes.data?.status === 'ACTIVE' || createSubRes.data?.status === 'CONFIGURATION_REQUIRED'
    );
    const createdSubId = createSubRes.data?.subscription?.id;

    // 3. Create subscription for Unsupported Google
    const googleSubRes = await apiClient.post('/api/v1/webhooks/google/subscribe', {
      socialAccountId: createdAccount.id,
    });
    assert('Google subscribe returns UNSUPPORTED_CAPABILITY', googleSubRes.data?.status === 'UNSUPPORTED_CAPABILITY');

    // 4. Create subscription for Unsupported LinkedIn
    const linkedinSubRes = await apiClient.post('/api/v1/webhooks/linkedin/subscribe', {
      socialAccountId: createdAccount.id,
    });
    assert('LinkedIn subscribe returns UNSUPPORTED_CAPABILITY', linkedinSubRes.data?.status === 'UNSUPPORTED_CAPABILITY');

    // 5. Delete subscription
    if (createdSubId) {
      const deleteSubRes = await apiClient.delete(`/api/v1/webhooks/subscriptions/${createdSubId}`);
      assert('DELETE /webhooks/subscriptions/:id disconnects subscription', deleteSubRes.data?.success === true);
    }

    // Clean up created social account
    await socialAccountRepository.disconnect(createdAccount.id, testAgencyId);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL WEBHOOK INGESTION TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runWebhooksRealApiTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
