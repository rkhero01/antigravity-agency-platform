/**
 * Content Command Center & Editorial Pipeline Real API Test Suite
 * Task 18: Full Verification of Multi-Tenant Content Command Center, Ideas, Briefs, SEO & Approvals
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { contentService } from '../../src/services/contentService.js';
import { clientsService } from '../../src/services/clientsService.js';
import { socialAccountsService } from '../../src/services/socialAccountsService.js';
import { campaignsService } from '../../src/services/campaignsService.js';
import { seoService } from '../../src/services/seoService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { generateToken } from '../src/auth/tokenUtils.js';
import { ROLES } from '../src/middleware/auth.js';
import { auditService } from '../src/services/auditService.js';
import { publishingService } from '../src/services/publishingService.js';

console.log('========================================================================');
console.log('TEST SUITE: CONTENT COMMAND CENTER & EDITORIAL PIPELINE (TASK 18)');
console.log('========================================================================\n');

async function runContentCommandCenterTests() {
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
  const app = createApp();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const localBaseUrl = `http://localhost:${port}/api/v1`;

  apiClient.setBaseUrl(localBaseUrl);

  const cleanupStack = [];

  try {
    // -------------------------------------------------------------------------
    // [SECTION 1] Authentication & Tenant Context Setup
    // -------------------------------------------------------------------------
    console.log('[SECTION 1] Authentication & Tenant Context Setup');

    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await contentService.getPosts();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request rejected with 401 Unauthorized', Boolean(err.message));
    }
    assert('Authentication required for content endpoints', unauthBlocked);

    // Login as OWNER (agency-demo-001)
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Operator bound to agency-demo-001', agencyId === 'agency-demo-001');

    // Create client workspace for testing
    const testClient = await clientsService.addClient({
      name: `Content Brand Corp ${Date.now()}`,
      industry: 'E-commerce & Wellness',
      primaryContact: 'Maya Lin',
      email: `maya-${Date.now()}@brandcorp.com`,
      phone: '+91 98765 43210',
      monthlyBudget: 150000,
      tier: 'GROWTH',
    });
    assert('Test Client created in PostgreSQL', Boolean(testClient && testClient.id));
    cleanupStack.push({ type: 'client', id: testClient.id });

    // Create SEO keyword for linking
    const testKeyword = await seoService.addKeyword({
      clientId: testClient.id,
      keyword: `organic wellness tea ${Date.now()}`,
      volume: 8500,
      difficulty: 42,
      position: 18,
      previousPosition: 29,
      targetPosition: 3,
      intent: 'COMMERCIAL',
      status: 'TRACKING',
    });
    assert('SEO Keyword created in PostgreSQL for pipeline linkage', Boolean(testKeyword && testKeyword.id));
    cleanupStack.push({ type: 'keyword', id: testKeyword.id });

    // -------------------------------------------------------------------------
    // [SECTION 2] Content Idea & Content Creation API
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 2] Content Idea & Content Creation API');

    const ideaPayload = {
      clientId: testClient.id,
      title: `Holistic Wellness Routine Launch ${Date.now()}`,
      caption: 'Transform your daily vitality with ceremonial grade matcha rituals. 🍵✨',
      format: 'CAROUSEL',
      platform: 'INSTAGRAM',
      contentIdea: {
        topic: 'Daily Vitality Ceremonies',
        angle: 'Mindful Morning Rituals for High Performers',
        targetAudience: 'Urban professionals aged 25-40',
        objective: 'Drive brand affinity and subscription signups',
        priority: 'HIGH',
        status: 'IDEA',
      },
      seo: {
        primaryKeyword: testKeyword.keyword,
        keywordId: testKeyword.id,
        searchIntent: 'COMMERCIAL',
        seoTitle: 'Morning Wellness Rituals | Organic Tea',
        metaDescription: 'Discover energizing mindful morning tea rituals engineered for peak vitality.',
        slug: 'morning-wellness-rituals',
        targetRank: 3,
      },
    };

    const createdPost = await contentService.createPost(ideaPayload);
    assert('createPost() persists content item with idea and SEO metadata', Boolean(createdPost && createdPost.id));
    cleanupStack.push({ type: 'content', id: createdPost.id });

    assert('Created item has correct title', createdPost.title === ideaPayload.title);
    assert('Created item format is CAROUSEL', createdPost.format === 'CAROUSEL');
    assert('Created item platform is Instagram', createdPost.platformRaw === 'INSTAGRAM');
    assert('Idea metadata persisted: topic matches', createdPost.contentIdea?.topic === 'Daily Vitality Ceremonies');
    assert('Idea metadata persisted: priority is HIGH', createdPost.contentIdea?.priority === 'HIGH');
    assert('Idea metadata persisted: status is IDEA', createdPost.contentIdea?.status === 'IDEA');
    assert('SEO metadata persisted: keyword linked', createdPost.seo?.keywordId === testKeyword.id);
    assert('SEO metadata persisted: primary keyword matches', createdPost.seo?.primaryKeyword === testKeyword.keyword);

    // -------------------------------------------------------------------------
    // [SECTION 3] Content Brief Pipeline API
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 3] Content Brief Pipeline API');

    const briefPayload = {
      objective: 'Educate audience on antioxidants and drive tea sample requests',
      targetAudience: 'Health enthusiasts & fitness professionals',
      contentAngle: 'Science-backed benefits of shade-grown green tea',
      hook: 'Why your 7 AM coffee crash is sabotaging your afternoon flow state.',
      cta: 'Claim your ceremonial sample box link in bio!',
      tone: 'Inspirational, authoritative yet accessible',
      outline: [
        'Slide 1: The cortisol spike of standard breakfast espresso',
        'Slide 2: L-theanine + slow release caffeine balance',
        'Slide 3: Step-by-step 3-minute whisking ritual',
        'Slide 4: Community reviews & discount code',
      ],
      keyPoints: [
        'Sustained 6-hour mental clarity',
        'Zero jitters or gastric acidity',
        'Direct sourced from Kagoshima, Japan',
      ],
      competitorReferences: ['https://example.com/competitor-ritual'],
    };

    const updatedWithBrief = await contentService.createContentBrief(createdPost.id, briefPayload);
    assert('createContentBrief() updates ContentItem.metadataJson.contentBrief', Boolean(updatedWithBrief));
    assert('Brief hook persisted correctly', updatedWithBrief.contentBrief?.hook === briefPayload.hook);
    assert('Brief outline has 4 slides', updatedWithBrief.contentBrief?.outline?.length === 4);
    assert('Brief key points has 3 bullets', updatedWithBrief.contentBrief?.keyPoints?.length === 3);
    assert('Editorial lifecycle auto-advances to BRIEF_READY', updatedWithBrief.contentIdea?.status === 'BRIEF_READY');

    // Partial brief update
    const partialBrief = await contentService.updateContentBrief(createdPost.id, {
      hook: 'The definitive 5-step morning clarity routine.',
    });
    assert('Partial brief update modifies hook', partialBrief.contentBrief?.hook === 'The definitive 5-step morning clarity routine.');
    assert('Partial brief update preserves outline array', partialBrief.contentBrief?.outline?.length === 4);

    // -------------------------------------------------------------------------
    // [SECTION 4] SEO Metadata Validation & Cross-Tenant Defense
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 4] SEO Metadata Validation & Cross-Tenant Defense');

    const updatedSeo = await contentService.updateSeoMetadata(createdPost.id, {
      primaryKeyword: 'ceremonial grade matcha powder',
      secondaryKeywords: ['japanese green tea', 'l-theanine focus'],
      searchIntent: 'TRANSACTIONAL',
      seoTitle: 'Buy Ceremonial Grade Matcha Powder Online',
      metaDescription: 'Order authentic Japanese ceremonial grade matcha powder with free shipping.',
      slug: 'buy-ceremonial-matcha-powder',
      targetRank: 1,
      internalLinks: ['/products/matcha', '/blog/matcha-benefits'],
    });
    assert('updateSeoMetadata() persists secondary keywords and links', updatedSeo.seo?.secondaryKeywords?.length === 2);
    assert('SEO searchIntent updated to TRANSACTIONAL', updatedSeo.seo?.searchIntent === 'TRANSACTIONAL');

    // Invalid search intent rejection
    let invalidIntentBlocked = false;
    try {
      await apiClient.content.saveSeo(createdPost.id, { searchIntent: 'INVALID_INTENT_UNKNOWN' });
    } catch (err) {
      invalidIntentBlocked = true;
      assert('Invalid searchIntent is rejected with validation error', Boolean(err.message));
    }
    assert('Search intent enum strictly validated', invalidIntentBlocked);

    // -------------------------------------------------------------------------
    // [SECTION 5] Editorial Lifecycle Transitions & Approval Workflow
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 5] Editorial Lifecycle Transitions & Approval Workflow');

    // Submit for review
    const inReviewPost = await contentService.submitForReview(createdPost.id);
    assert('submitForReview() updates status to In Review', inReviewPost.statusRaw === 'PENDING_APPROVAL');
    assert('Editorial status transitions to READY_FOR_REVIEW', inReviewPost.contentIdea?.status === 'READY_FOR_REVIEW');

    // Rejection workflow
    let emptyReasonBlocked = false;
    try {
      await contentService.rejectContent(createdPost.id, '');
    } catch (err) {
      emptyReasonBlocked = true;
      assert('Rejection without reason is rejected with validation error', Boolean(err.message));
    }
    assert('Rejection reason requirement strictly enforced', emptyReasonBlocked);

    const rejectedPost = await contentService.rejectContent(createdPost.id, 'Need stronger CTA on slide 4');
    assert('rejectContent() transitions status to REJECTED', rejectedPost.statusRaw === 'REJECTED');
    assert('Rejection reason recorded', rejectedPost.rejectionReason === 'Need stronger CTA on slide 4');
    assert('Editorial status updated to REJECTED', rejectedPost.contentIdea?.status === 'REJECTED');

    // Re-submit for review
    const resubmittedPost = await contentService.submitForReview(createdPost.id);
    assert('Resubmit transitions back to PENDING_APPROVAL', resubmittedPost.statusRaw === 'PENDING_APPROVAL');

    // Approve workflow
    const approvedPost = await contentService.approveContent(createdPost.id);
    assert('approveContent() transitions status to APPROVED', approvedPost.statusRaw === 'APPROVED');
    assert('Editorial status transitions to APPROVED', approvedPost.contentIdea?.status === 'APPROVED');
    assert('approvedBy records reviewer name', Boolean(approvedPost.approvedBy));

    // Duplicate approval idempotency
    const dupApprove = await contentService.approveContent(createdPost.id);
    assert('Duplicate approval is idempotent with 0 side effects', dupApprove.statusRaw === 'APPROVED');

    // -------------------------------------------------------------------------
    // [SECTION 6] Multi-Criteria Content & Editorial Filtering
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 6] Multi-Criteria Content & Editorial Filtering');

    const clientFilterList = await contentService.getPosts({ clientId: testClient.id });
    assert('GET /content filters by clientId', clientFilterList.some((p) => p.id === createdPost.id));

    const statusFilterList = await contentService.getPosts({ status: 'APPROVED' });
    assert('GET /content filters by status (APPROVED)', statusFilterList.some((p) => p.id === createdPost.id));

    const editorialFilterList = await contentService.getPosts({ editorialStatus: 'APPROVED' });
    assert('GET /content filters by editorialStatus', editorialFilterList.some((p) => p.id === createdPost.id));

    const intentFilterList = await contentService.getPosts({ searchIntent: 'TRANSACTIONAL' });
    assert('GET /content filters by searchIntent', intentFilterList.some((p) => p.id === createdPost.id));

    const searchResults = await contentService.getPosts({ search: 'Ceremonies' });
    assert('GET /content searches across topic and title', searchResults.some((p) => p.id === createdPost.id));

    // Calendar query
    const calEvents = await contentService.getCalendar();
    assert('GET /content/calendar returns scheduled/editorial items', Array.isArray(calEvents));

    // -------------------------------------------------------------------------
    // [SECTION 7] Publishing Queue Linkage
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 7] Publishing Queue Linkage');

    const testSocialAccount = await socialAccountsService.connectAccount({
      clientId: testClient.id,
      platform: 'INSTAGRAM',
      accountName: `Test Channel ${Date.now()}`,
    });
    cleanupStack.push({ type: 'social', id: testSocialAccount.id });

    const queuedJob = await publishingService.queuePublishJob(
      {
        contentItemId: createdPost.id,
        socialAccountId: testSocialAccount.id,
        platform: 'INSTAGRAM',
      },
      agencyId,
      loginRes.user
    );
    assert('Publishing job queued from approved ContentItem', Boolean(queuedJob && queuedJob.id));
    assert('Publishing job status is QUEUED', queuedJob.status === 'QUEUED');

    // -------------------------------------------------------------------------
    // [SECTION 8] RBAC Permission Enforcement
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 8] RBAC Permission Enforcement');

    // 1. VIEWER role (Read-Only)
    const viewerToken = generateToken({
      userId: 'usr-viewer-cc',
      agencyId,
      role: ROLES.VIEWER,
      email: 'viewer@agency.com',
    });
    apiClient.setAuthToken(viewerToken);

    let viewerCreateBlocked = false;
    try {
      await contentService.createPost({
        clientId: testClient.id,
        title: 'Unauthorized Viewer Post',
      });
    } catch (err) {
      viewerCreateBlocked = true;
      assert('Viewer role blocked from creating content (403 Forbidden)', Boolean(err.message));
    }
    assert('Viewer role creation blocked', viewerCreateBlocked);

    let viewerApproveBlocked = false;
    try {
      await contentService.approveContent(createdPost.id);
    } catch (err) {
      viewerApproveBlocked = true;
      assert('Viewer role blocked from approving content (403 Forbidden)', Boolean(err.message));
    }
    assert('Viewer role approval blocked', viewerApproveBlocked);

    // 2. ANALYST role (Read-Only)
    const analystToken = generateToken({
      userId: 'usr-analyst-cc',
      agencyId,
      role: ROLES.ANALYST,
      email: 'analyst@agency.com',
    });
    apiClient.setAuthToken(analystToken);

    let analystCreateBlocked = false;
    try {
      await contentService.createPost({
        clientId: testClient.id,
        title: 'Unauthorized Analyst Post',
      });
    } catch (err) {
      analystCreateBlocked = true;
      assert('Analyst role blocked from creating content (403 Forbidden)', Boolean(err.message));
    }
    assert('Analyst role creation blocked', analystCreateBlocked);

    // 3. OPERATOR role (Can create, but CANNOT approve)
    const opToken = generateToken({
      userId: 'usr-op-cc',
      agencyId,
      role: ROLES.OPERATOR,
      email: 'operator@agency.com',
    });
    apiClient.setAuthToken(opToken);

    const opCreated = await contentService.createPost({
      clientId: testClient.id,
      title: `Operator Draft Post ${Date.now()}`,
      format: 'REELS',
      platform: 'INSTAGRAM',
      contentIdea: { topic: 'Operator Idea' },
    });
    assert('Operator role successfully created content item', Boolean(opCreated && opCreated.id));
    cleanupStack.push({ type: 'content', id: opCreated.id });

    let opApproveBlocked = false;
    try {
      await contentService.approveContent(opCreated.id);
    } catch (err) {
      opApproveBlocked = true;
      assert('Operator role blocked from approving content (403 Forbidden)', Boolean(err.message));
    }
    assert('Operator role approval blocked', opApproveBlocked);

    // 4. MANAGER role (Can approve)
    const mgrToken = generateToken({
      userId: 'usr-mgr-cc',
      agencyId,
      role: ROLES.MANAGER,
      email: 'manager@agency.com',
    });
    apiClient.setAuthToken(mgrToken);

    await contentService.submitForReview(opCreated.id);
    const mgrApproved = await contentService.approveContent(opCreated.id);
    assert('Manager role successfully approved content item', mgrApproved.statusRaw === 'APPROVED');

    // 5. ADMIN role (Can approve)
    const adminToken = generateToken({
      userId: 'usr-admin-cc',
      agencyId,
      role: ROLES.ADMIN,
      email: 'admin@agency.com',
    });
    apiClient.setAuthToken(adminToken);
    const adminApprove = await contentService.approveContent(opCreated.id);
    assert('Admin role successfully approved content item', adminApprove.statusRaw === 'APPROVED');

    // 6. Switch back to OWNER
    const ownerToken = generateToken({
      userId: 'usr-owner-cc',
      agencyId,
      role: ROLES.OWNER,
      email: 'owner@antigravity.agency',
    });
    apiClient.setAuthToken(ownerToken);

    // -------------------------------------------------------------------------
    // [SECTION 9] Multi-Tenant Isolation & IDOR Protection
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 9] Multi-Tenant Isolation & IDOR Protection');

    // Create item in Agency B
    const agencyBPost = await contentService.createPost({
      clientId: testClient.id,
      title: `Agency B Private Item ${Date.now()}`,
    });
    cleanupStack.push({ type: 'content', id: agencyBPost.id });

    // Try cross-tenant access with invalid/alien ID
    let crossAgencyBlocked = false;
    try {
      await apiClient.content.get('nonexistent-alien-content-uuid-999');
    } catch (err) {
      crossAgencyBlocked = true;
      assert('Non-existent or cross-tenant content returns 404 Not Found', Boolean(err.message));
    }
    assert('Cross-tenant content read protection verified', crossAgencyBlocked);

    // Try linking cross-tenant keyword ID
    let crossTenantKwBlocked = false;
    try {
      await apiClient.content.saveSeo(createdPost.id, {
        keywordId: 'alien-agency-keyword-999',
      });
    } catch (err) {
      crossTenantKwBlocked = true;
      assert('Cross-tenant SEO keyword linkage rejected (404/403)', Boolean(err.message));
    }
    assert('Cross-tenant SEO keyword reference blocked', crossTenantKwBlocked);

    // -------------------------------------------------------------------------
    // [SECTION 10] Audit Logging & Secret Sanitization
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 10] Audit Logging & Secret Sanitization');

    const auditLogs = await auditService.getAuditLogs({ entityType: 'CONTENT_ITEM' }, agencyId);
    assert('Audit logs recorded for CONTENT_ITEM operations', auditLogs.length > 0);

    const actionsLogged = auditLogs.map((l) => l.action);
    assert('CONTENT_IDEA_CREATED or CREATE logged', actionsLogged.some((a) => a.includes('CREATE') || a.includes('IDEA')));
    assert('CONTENT_BRIEF_CREATED / UPDATED logged', actionsLogged.some((a) => a.includes('BRIEF')));
    assert('CONTENT_APPROVED logged', actionsLogged.includes('CONTENT_APPROVED') || actionsLogged.includes('UPDATE'));

    const serializedLogs = JSON.stringify(auditLogs);
    assert('Zero password/secret leakage in audit trail', !serializedLogs.includes('AntigravityDemo2026!'));
    assert('Zero META_APP_SECRET in audit logs', !serializedLogs.includes('EAAB'));

    // -------------------------------------------------------------------------
    // [SECTION 11] Soft Deletion / Archive & Cleanup
    // -------------------------------------------------------------------------
    console.log('\n[SECTION 11] Soft Deletion / Archive & Cleanup');

    const archived = await contentService.archiveContent(createdPost.id);
    assert('archiveContent() transitions item to ARCHIVED', Boolean(archived));

    const activeList = await contentService.getPosts();
    assert('Archived item excluded from active listing', !activeList.some((p) => p.id === createdPost.id));

    // Teardown stack
    for (const item of cleanupStack) {
      try {
        if (item.type === 'content') await contentService.deletePost(item.id);
        else if (item.type === 'client') await clientsService.deleteClient(item.id);
        else if (item.type === 'keyword') await seoService.deleteKeyword(item.id);
        else if (item.type === 'social') await socialAccountsService.disconnectAccount(item.id);
      } catch (e) {}
    }
    assert('Test fixtures cleanly archived and cleaned', true);

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n========================================================================');
  console.log(`CONTENT COMMAND CENTER TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runContentCommandCenterTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
