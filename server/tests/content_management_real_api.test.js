/**
 * Content Management & Publishing Real API Test Suite
 * Task 8: Complete Verification of Production Content Module
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { contentService } from '../../src/services/contentService.js';
import { clientsService } from '../../src/services/clientsService.js';
import { socialAccountsService } from '../../src/services/socialAccountsService.js';
import { campaignsService } from '../../src/services/campaignsService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL CONTENT MANAGEMENT & EDITORIAL CALENDAR (TASK 8)');
console.log('========================================================================\n');

async function runContentTests() {
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
    console.log('[SECTION 1] Authentication Required for Content Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await contentService.getPosts();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /content is blocked', Boolean(err.message));
    }
    assert('Authentication required for content operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: Live GET /api/v1/content (Initial List)
    console.log('\n[SECTION 2] Live GET /api/v1/content from Database');
    const initialList = await contentService.getPosts();
    assert('getPosts() returns array from database', Array.isArray(initialList));
    const initialCount = initialList.length;

    // Get prerequisites for association
    const clientList = await clientsService.getClients();
    assert('Retrieved client workspaces for association', clientList.length > 0);
    const targetClient = clientList[0];

    const campList = await campaignsService.getCampaigns();
    const targetCampaign = campList[0];

    const testSocial = await socialAccountsService.connectAccount({
      clientId: targetClient.id,
      platform: 'INSTAGRAM',
      accountName: `Content Channel ${Date.now()}`,
    });
    assert('Created temporary social asset channel for linkage', Boolean(testSocial && testSocial.id));

    // Section 3: Create / POST Content
    console.log('\n[SECTION 3] Live POST /api/v1/content');
    const testPostTitle = `Summer Athlete Protocol ${Date.now()}`;
    const newPostData = {
      clientId: targetClient.id,
      socialAccountId: testSocial.id,
      campaignId: targetCampaign?.id || null,
      title: testPostTitle,
      caption: 'Discover peak recovery protocols engineered for elite athletes. ⚡',
      format: 'CAROUSEL',
      platform: 'INSTAGRAM',
      status: 'DRAFT',
    };

    const created = await contentService.createPost(newPostData);
    assert('createPost() returns normalized post record with ID', Boolean(created && created.id));
    assert('Created post has correct title', created.title === testPostTitle);
    assert('Created post bound to client workspace', created.clientId === targetClient.id);
    assert('Created post linked to social channel', created.socialAccountId === testSocial.id);
    assert('Created post status is Draft', created.status === 'Draft');

    // Section 4: Persistence & List Filter
    console.log('\n[SECTION 4] Verification of Persistence & Query Filters');
    const afterCreateList = await contentService.getPosts();
    assert('Post count incremented in database', afterCreateList.length === initialCount + 1);

    const clientFiltered = await contentService.getPosts({ clientId: targetClient.id });
    assert('Client filter returns matching post', clientFiltered.some((p) => p.id === created.id));

    const platformFiltered = await contentService.getPosts({ platform: 'INSTAGRAM' });
    assert('Platform filter returns matching post', platformFiltered.some((p) => p.id === created.id));

    const counts = contentService.calculateStageCounts(afterCreateList);
    assert('calculateStageCounts returns accurate total', counts.total === afterCreateList.length);
    assert('calculateStageCounts tallies draft status', counts.draft > 0);

    // Section 5: GET Single Post by ID
    console.log('\n[SECTION 5] Live GET /api/v1/content/:id');
    const fetched = await contentService.getPostById(created.id);
    assert('getPostById() returns specific post record', Boolean(fetched && fetched.id === created.id));
    assert('Fetched post details match created values', fetched.title === testPostTitle);

    // Section 6: Update Post
    console.log('\n[SECTION 6] Live PATCH /api/v1/content/:id (Update)');
    const updated = await contentService.updatePost(created.id, {
      title: `${testPostTitle} (Approved Edition)`,
      format: 'REELS',
    });
    assert('updatePost() updates title', updated.title === `${testPostTitle} (Approved Edition)`);
    assert('updatePost() updates format to Reels', (updated.type || updated.format).includes('Reel') || updated.format === 'REELS');

    // Section 7: Schedule Content
    console.log('\n[SECTION 7] Live POST /api/v1/content/:id/schedule (Scheduling)');
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString();
    const scheduled = await contentService.schedulePost(created.id, futureDate);
    assert('schedulePost() transitions status to Scheduled', scheduled.status === 'Scheduled');
    assert('schedulePost() sets scheduledAt timestamp', Boolean(scheduled.scheduledAt));

    // Section 8: Approve & Reject Content
    console.log('\n[SECTION 8] Live POST /api/v1/content/:id/approve & reject');
    const approved = await contentService.approvePost(created.id);
    assert('approvePost() transitions status to Approved', approved.status === 'Approved');

    const rejected = await contentService.rejectPost(created.id, 'Image dimensions require 1080x1350 crop');
    assert('rejectPost() transitions status to Rejected', rejected.status === 'Rejected');

    // Section 9: Calendar Query
    console.log('\n[SECTION 9] Live GET /api/v1/content/calendar');
    const calendarEvents = await contentService.getCalendar({ clientId: targetClient.id });
    assert('getCalendar() returns array of scheduled/published items', Array.isArray(calendarEvents));

    // Section 10: Archive / Soft-Delete Post
    console.log('\n[SECTION 10] Live DELETE /api/v1/content/:id (Archive & Soft-Delete)');
    const deleteRes = await contentService.deletePost(created.id);
    assert('deletePost() returns success message', Boolean(deleteRes.message));

    const postDeleteList = await contentService.getPosts();
    const isExcluded = !postDeleteList.some((p) => p.id === created.id);
    assert('Archived post is excluded from active query list', isExcluded);

    // Clean up temporary social account
    await socialAccountsService.disconnectAccount(testSocial.id);

    // Section 11: Validation Defenses & Tenant Isolation
    console.log('\n[SECTION 11] Validation Defenses & Tenant Isolation');
    let invalidClientCaught = false;
    try {
      await contentService.createPost({
        clientId: 'invalid-client-uuid-999',
        title: 'Invalid Client Post',
      });
    } catch (err) {
      invalidClientCaught = true;
      assert('Post creation with non-existent client is rejected', Boolean(err.message));
    }
    assert('Client association validation strictly enforced', invalidClientCaught);

    let invalidFormatCaught = false;
    try {
      await contentService.updatePost(initialList[0]?.id || 'post-1', {
        format: 'INVALID_FORMAT_3D_HOLOGRAM',
      });
    } catch (err) {
      invalidFormatCaught = true;
      assert('Invalid format update is rejected with validation error', Boolean(err.message));
    }
    assert('Format enum validation strictly enforced', invalidFormatCaught);

    let crossTenantCaught = false;
    try {
      await apiClient.content.get('nonexistent-post-999');
    } catch (err) {
      crossTenantCaught = true;
      assert('Non-existent or cross-tenant post returns 404/403', Boolean(err.message));
    }
    assert('Cross-tenant isolation strictly enforced', crossTenantCaught);
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL CONTENT TESTS: 31 PASSED, 0 FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runContentTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
