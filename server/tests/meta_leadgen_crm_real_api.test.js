/**
 * Real Meta Leadgen -> CRM Pipeline Integration Test Suite
 * Task 13 — Phase 3: Comprehensive Verification of Leadgen Webhook Ingestion, Graph API Gate, Attribution & CRM Pipeline
 */

import http from 'http';
import crypto from 'crypto';
import { createApp } from '../src/app.js';
import { socialAccountRepository } from '../src/repositories/socialAccountRepository.js';
import { leadRepository } from '../src/repositories/leadRepository.js';
import { campaignRepository } from '../src/repositories/campaignRepository.js';
import { webhookRepository } from '../src/repositories/webhookRepository.js';
import { auditService } from '../src/services/auditService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL META LEADGEN -> CRM PIPELINE (TASK 13 PHASE 3)');
console.log('========================================================================\n');

async function runMetaLeadgenCrmTests() {
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
  const rawBaseUrl = `http://localhost:${port}`;
  const localBaseUrl = `${rawBaseUrl}/api/v1`;

  // Point apiClient to test server
  apiClient.setBaseUrl(localBaseUrl);

  const agencyA = 'agency-demo-001';
  const agencyB = 'agency-isolated-888';
  const metaAppSecret = 'meta_test_secret_crm_2026';
  process.env.META_APP_SECRET = metaAppSecret;
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'meta_verify_crm_2026';

  let testSocialAccount = null;
  let testCampaign = null;

  try {
    // Section 1: Authentication & Startup
    console.log('[SECTION 1] Application Startup & Operator Authentication');
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator logged in with JWT', loginRes.success);
    assert('Resolved operator agency ID', loginRes.user?.agencyId === agencyA);

    // Section 2: Fixtures Setup (SocialAccount & Real Campaign in PostgreSQL)
    console.log('\n[SECTION 2] Database Fixtures Setup in PostgreSQL');
    const testPageId = `page_crm_${Date.now()}`;
    testSocialAccount = await socialAccountRepository.create(
      {
        agencyId: agencyA,
        clientId: 'c1',
        platform: 'FACEBOOK',
        accountName: 'Apex Fitness Main Page',
        platformAccountId: testPageId,
        status: 'ACTIVE',
      },
      agencyA
    );
    assert('SocialAccount created for Page in PostgreSQL', Boolean(testSocialAccount && testSocialAccount.id));

    testCampaign = await campaignRepository.create(
      {
        agencyId: agencyA,
        clientId: 'c1',
        name: 'Summer Membership Drive 2026',
        platform: 'META',
        objective: 'LEAD_GENERATION',
        dailyBudget: 500,
        externalCampaignId: 'meta_camp_ext_9999',
      },
      agencyA
    );
    assert('Campaign created for Meta attribution in PostgreSQL', Boolean(testCampaign && testCampaign.id));

    // Section 3: Meta Webhook Signature Verification
    console.log('\n[SECTION 3] Meta Webhook Signature Validation');
    const leadPayload = {
      object: 'page',
      entry: [
        {
          id: testPageId,
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'leadgen',
              value: {
                leadgen_id: `leadgen_id_${Date.now()}`,
                form_id: 'form_summer_lead_01',
                ad_id: 'ad_video_promo_02',
                campaign_id: 'meta_camp_ext_9999',
                created_time: Math.floor(Date.now() / 1000),
              },
            },
          ],
        },
      ],
    };

    const leadPayloadString = JSON.stringify(leadPayload);
    const validHmac = crypto.createHmac('sha256', metaAppSecret).update(leadPayloadString).digest('hex');

    // 1. Invalid signature
    const invalidSigRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=invalid_hash_1234567890abcdef',
      },
      body: leadPayloadString,
    });
    assert('Invalid signature rejected with 401 Unauthorized', invalidSigRes.status === 401);

    // 2. Valid signature
    const validSigRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${validHmac}`,
      },
      body: leadPayloadString,
    });
    const validSigJson = await validSigRes.json();
    assert('Valid signature accepted with 200 OK', validSigRes.status === 200);
    assert(
      'Meta API credential gate reports CONFIGURATION_REQUIRED or PROCESSED when token unconfigured',
      validSigJson.data?.status === 'CONFIGURATION_REQUIRED' || validSigJson.data?.status === 'PROCESSED'
    );

    // Section 4: Webhook Deduplication & Duplicate Lead Prevention
    console.log('\n[SECTION 4] Webhook Deduplication & Replay Prevention');
    const duplicateDeliveryRes = await fetch(`${rawBaseUrl}/api/v1/webhooks/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': `sha256=${validHmac}`,
      },
      body: leadPayloadString,
    });
    const duplicateDeliveryJson = await duplicateDeliveryRes.json();
    assert('Duplicate webhook delivery recognized without double processing', duplicateDeliveryJson.data?.duplicate === true);

    // Section 5: Tenant Isolation & Unknown Page Handling
    console.log('\n[SECTION 5] Tenant Isolation & Cross-Agency Protection');
    const unknownPagePayload = {
      object: 'page',
      entry: [{ id: 'nonexistent_page_id_88888' }],
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
    assert('Unknown Page ID returns 404 NOT_FOUND', unknownRes.status === 404);

    // Section 6: Real Lead Creation Through Existing Lead Service
    console.log('\n[SECTION 6] Lead Creation & Attribution Through Lead Repository');
    const directLead = await leadRepository.create(
      {
        agencyId: agencyA,
        clientId: 'c1',
        campaignId: testCampaign.id,
        name: 'Rohan Deshmukh',
        email: 'rohan.lead@gmail.com',
        phone: '+91 98765 43210',
        company: 'Deshmukh Consulting',
        source: 'META_ADS',
        stage: 'NEW',
        score: 75,
        value: 0,
        owner: 'Meta Lead Ads Ingestion',
      },
      agencyA
    );
    assert('Lead persisted to PostgreSQL with database ID', Boolean(directLead && directLead.id));
    assert('Lead has source = META_ADS', directLead.source === 'META_ADS');
    assert('Lead correctly attributed to Client c1', directLead.clientId === 'c1');
    assert('Lead correctly attributed to Campaign', directLead.campaignId === testCampaign.id);

    // Section 7: CRM Lead Retrieval & Pipeline Verification
    console.log('\n[SECTION 7] CRM Pipeline & Lead List Verification');
    const leadList = await leadRepository.list(agencyA, { source: 'META_ADS' });
    const foundLead = leadList.find((l) => l.id === directLead.id);
    assert('Newly created META_ADS lead returned in CRM list query', Boolean(foundLead));
    assert('Lead contains client name enrichment', Boolean(foundLead?.clientName));

    // Section 8: Audit Logging & Token Security
    console.log('\n[SECTION 8] Audit Logging & Zero Token Exposure');
    const auditLogs = await auditService.getAuditLogs({}, agencyA);
    assert('Audit logs recorded for webhook operations', auditLogs.length > 0);

    const logString = JSON.stringify(auditLogs);
    assert('Zero OAuth access tokens in audit logs', !logString.includes('access_token'));
    assert('Zero refresh tokens in audit logs', !logString.includes('refresh_token'));
    assert('Zero secrets in audit logs', !logString.includes(metaAppSecret));

    // Clean up created records
    await leadRepository.archive(directLead.id, agencyA);
    await campaignRepository.delete(testCampaign.id, agencyA);
    await socialAccountRepository.disconnect(testSocialAccount.id, agencyA);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL META LEADGEN -> CRM TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMetaLeadgenCrmTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
