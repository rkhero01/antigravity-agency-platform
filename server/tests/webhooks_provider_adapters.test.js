/**
 * Webhook Provider Adapters & Architecture Test Suite
 * Task 13 — Phase 1: Full Verification of Provider Adapters, Signature Checks, Tenant Isolation & Event Normalization
 */

import crypto from 'crypto';
import { BaseWebhookProvider } from '../src/services/webhooks/providers/baseWebhookProvider.js';
import {
  metaWebhookProvider,
  googleWebhookProvider,
  linkedinWebhookProvider,
  twitterWebhookProvider,
  getWebhookProvider,
  getAllWebhookStatus,
} from '../src/services/webhooks/providers/index.js';
import { socialAccountRepository } from '../src/repositories/socialAccountRepository.js';
import { webhookDeduplicator } from '../src/webhooks/webhookDeduplicator.js';
import { redactSecrets } from '../src/utils/redaction.js';

console.log('========================================================================');
console.log('TEST SUITE: WEBHOOK PROVIDER ADAPTERS & ARCHITECTURE (TASK 13 PHASE 1)');
console.log('========================================================================\n');

async function runWebhookAdapterTests() {
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

  // Section 1: Base Provider Interface
  console.log('[SECTION 1] Base Webhook Provider Interface');
  const base = new BaseWebhookProvider('TEST_GENERIC');
  assert('Base provider instantiated', base.name === 'TEST_GENERIC');
  assert('Base provider isConfigured defaults to false', base.isConfigured() === false);

  const baseVerify = await base.verifyWebhook({});
  assert('Base verifyWebhook returns UNSUPPORTED_CAPABILITY', baseVerify.status === 'UNSUPPORTED_CAPABILITY');

  const baseSig = base.verifySignature('body', 'sig', 'secret');
  assert('Base verifySignature returns UNSUPPORTED_CAPABILITY', baseSig.status === 'UNSUPPORTED_CAPABILITY');

  // Registry validation
  const resolvedMeta = getWebhookProvider('meta');
  assert('Provider registry resolves Meta adapter', resolvedMeta === metaWebhookProvider);

  let invalidProviderCaught = false;
  try {
    getWebhookProvider('invalid_snapchat');
  } catch (e) {
    invalidProviderCaught = true;
  }
  assert('Unsupported provider throws validation error', invalidProviderCaught);

  // Section 2: Meta Signature Verification & Rejection
  console.log('\n[SECTION 2] Meta Signature Verification & GET Challenge Handling');
  const testSecret = 'meta_test_app_secret_2026';
  const testPayload = { object: 'page', entry: [{ id: '123456', time: 1788082400 }] };
  const testPayloadString = JSON.stringify(testPayload);

  const validHash = crypto.createHmac('sha256', testSecret).update(testPayloadString).digest('hex');
  const validSigHeader = `sha256=${validHash}`;

  const validSigResult = metaWebhookProvider.verifySignature(testPayload, validSigHeader, testSecret);
  assert('Valid Meta HMAC-SHA256 signature accepted', validSigResult.isValid === true);

  const badSigResult = metaWebhookProvider.verifySignature(testPayload, 'sha256=invalidhash1234567890abcdef', testSecret);
  assert('Invalid Meta signature rejected', badSigResult.isValid === false);

  const missingSigResult = metaWebhookProvider.verifySignature(testPayload, null, testSecret);
  assert('Missing Meta signature header rejected', missingSigResult.isValid === false);

  // Meta GET verification
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'test_verify_token_secure_99';
  const validGetVerify = await metaWebhookProvider.verifyWebhook({
    'hub.mode': 'subscribe',
    'hub.verify_token': 'test_verify_token_secure_99',
    'hub.challenge': 'CHALLENGE_STRING_123',
  });
  assert('Meta GET webhook challenge verified successfully', validGetVerify.isValid && validGetVerify.challenge === 'CHALLENGE_STRING_123');

  const badGetVerify = await metaWebhookProvider.verifyWebhook({
    'hub.mode': 'subscribe',
    'hub.verify_token': 'wrong_token',
    'hub.challenge': 'CHALLENGE_STRING_123',
  });
  assert('Invalid Meta verify token rejected with 403 reason', badGetVerify.isValid === false);

  // Section 3: Meta Event Normalization
  console.log('\n[SECTION 3] Meta Event Normalization');
  // 1. Leadgen payload
  const leadPayload = {
    object: 'page',
    entry: [
      {
        id: 'page_1001',
        changes: [
          {
            field: 'leadgen',
            value: {
              leadgen_id: 'lead_778899',
              form_id: 'form_12345',
              ad_id: 'ad_9988',
              created_time: 1788082500,
            },
          },
        ],
      },
    ],
  };

  const normLead = metaWebhookProvider.normalizeEvent(leadPayload);
  assert('Normalized leadgen event has correct eventType', normLead.eventType === 'LEADGEN');
  assert('Normalized leadgen event has provider eventId', normLead.eventId === 'META-LEAD-lead_778899');
  assert('Normalized leadgen extracts platformAccountId (Page ID)', normLead.platformAccountId === 'page_1001');

  // 2. Feed / Comment payload
  const commentPayload = {
    object: 'page',
    entry: [
      {
        id: 'page_1001',
        time: 1788082600,
        changes: [
          {
            field: 'comments',
            value: {
              post_id: 'post_999',
              comment_id: 'comment_888',
              message: 'Interested in services!',
            },
          },
        ],
      },
    ],
  };

  const normComment = metaWebhookProvider.normalizeEvent(commentPayload);
  assert('Normalized comment event has correct eventType', normComment.eventType === 'PAGE_COMMENT');
  assert('Normalized comment extracts postId and commentId', normComment.payload.postId === 'post_999' && normComment.payload.commentId === 'comment_888');

  // Section 4: Tenant Resolution & Cross-Agency Isolation
  console.log('\n[SECTION 4] Tenant Resolution & Cross-Agency Isolation');
  const testPageId = `page_test_${Date.now()}`;
  const agencyA = 'agency-demo-001';
  const agencyB = 'agency-isolated-999';

  // Create SocialAccount for Agency A
  const createdAccount = await socialAccountRepository.create(
    {
      agencyId: agencyA,
      clientId: 'c1',
      platform: 'FACEBOOK',
      accountName: 'Meta Test Page',
      platformAccountId: testPageId,
      status: 'ACTIVE',
    },
    agencyA
  );

  // Resolve within Agency A
  const resolved = await metaWebhookProvider.resolveTenantAccount(testPageId, agencyA);
  assert('SocialAccount resolved for matching tenant agency', resolved.id === createdAccount.id);

  // Cross-agency injection attempt
  let crossAgencyCaught = false;
  try {
    await metaWebhookProvider.resolveTenantAccount(testPageId, agencyB);
  } catch (err) {
    crossAgencyCaught = true;
    assert('Cross-agency event injection rejected with AuthorizationError', Boolean(err.message));
  }
  assert('Cross-agency isolation strictly enforced', crossAgencyCaught);

  // Unknown page ID rejection
  let unknownPageCaught = false;
  try {
    await metaWebhookProvider.resolveTenantAccount('unknown_page_nonexistent_999', agencyA);
  } catch (err) {
    unknownPageCaught = true;
    assert('Unknown platform account ID rejected with NotFoundError', Boolean(err.message));
  }
  assert('Unknown page rejection strictly enforced', unknownPageCaught);

  // Section 5: Webhook Deduplication
  console.log('\n[SECTION 5] Webhook Deduplication & Replay Protection');
  const testEventId = `TEST-EVT-${Date.now()}`;
  const firstDedup = await webhookDeduplicator.processEvent(agencyA, 'META', testEventId, 'LEADGEN', { test: true });
  assert('First event processing is recorded as non-duplicate', firstDedup.isDuplicate === false);

  const secondDedup = await webhookDeduplicator.processEvent(agencyA, 'META', testEventId, 'LEADGEN', { test: true });
  assert('Second event with identical eventId rejected as duplicate', secondDedup.isDuplicate === true);

  // Clean up created test account via disconnect
  await socialAccountRepository.disconnect(createdAccount.id, agencyA);

  // Deleted SocialAccount rejection test
  let deletedAccountCaught = false;
  try {
    await metaWebhookProvider.resolveTenantAccount(testPageId, agencyA);
  } catch (e) {
    deletedAccountCaught = true;
    assert('Deleted SocialAccount is rejected and not resolved', Boolean(e.message));
  }
  assert('Deleted account exclusion strictly enforced', deletedAccountCaught);

  // Section 6: Google, LinkedIn & Twitter / X Adapters
  console.log('\n[SECTION 6] Google, LinkedIn & X / Twitter Adapters');
  const googleCap = await googleWebhookProvider.verifyWebhook({});
  assert('Google direct webhook verification returns UNSUPPORTED_CAPABILITY', googleCap.status === 'UNSUPPORTED_CAPABILITY');

  const linkedinCap = await linkedinWebhookProvider.verifyWebhook({});
  assert('LinkedIn unapproved webhook returns UNSUPPORTED_CAPABILITY', linkedinCap.status === 'UNSUPPORTED_CAPABILITY');

  // Twitter CRC Challenge Verification
  process.env.TWITTER_CLIENT_SECRET = 'twitter_secret_crc_2026';
  const twitterCrcRes = await twitterWebhookProvider.verifyWebhook({ crc_token: 'crc_test_token_12345' });
  assert('Twitter CRC challenge computes HMAC response_token', twitterCrcRes.isValid && twitterCrcRes.response_token.startsWith('sha256='));

  const twitterMissingCrc = await twitterWebhookProvider.verifyWebhook({});
  assert('Missing Twitter CRC token rejected', twitterMissingCrc.isValid === false);

  // Section 7: Secret Protection & Redaction
  console.log('\n[SECTION 7] Secret Protection & Redaction Verification');
  const sensitiveObject = {
    accessToken: 'EAABwz_sample_secret_token_123',
    appSecret: 'secret_app_key_456',
    verify_token: 'my_verify_token_789',
    safeField: 'Hello World',
  };

  const redacted = redactSecrets(sensitiveObject);
  assert('OAuth access tokens redacted in audit payloads', redacted.accessToken === '[REDACTED]');
  assert('App secrets redacted in audit payloads', redacted.appSecret === '[REDACTED]');
  assert('Verify tokens redacted in audit payloads', redacted.verify_token === '[REDACTED]');
  assert('Safe non-secret fields preserved', redacted.safeField === 'Hello World');

  console.log('\n========================================================================');
  console.log(`WEBHOOK PROVIDER ADAPTER TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runWebhookAdapterTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
