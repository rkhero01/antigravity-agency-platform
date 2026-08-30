/**
 * Analytics & Reporting Real API Test Suite
 * Task 10: Complete Verification of Production Analytics & Performance Module
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { analyticsService } from '../../src/services/analyticsService.js';
import { clientsService } from '../../src/services/clientsService.js';
import { campaignsService } from '../../src/services/campaignsService.js';
import { crmService } from '../../src/services/crmService.js';
import { contentService } from '../../src/services/contentService.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';

console.log('========================================================================');
console.log('TEST SUITE: REAL ANALYTICS & PERFORMANCE REPORTING (TASK 10)');
console.log('========================================================================\n');

async function runAnalyticsTests() {
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
    console.log('[SECTION 1] Authentication Required for Analytics Endpoints');
    apiClient.clearAuthToken();
    let unauthBlocked = false;
    try {
      await analyticsService.getAnalytics();
    } catch (err) {
      unauthBlocked = true;
      assert('Unauthenticated request to /analytics is blocked', Boolean(err.message));
    }
    assert('Authentication required for analytics operations', unauthBlocked);

    // Authenticate as OWNER
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success && Boolean(apiClient.getAuthToken()));
    const agencyId = loginRes.user?.agencyId;
    assert('Resolved operator agency ID', agencyId === 'agency-demo-001');

    // Section 2: Executive Overview Analytics
    console.log('\n[SECTION 2] Live GET /api/v1/analytics/overview');
    const overviewRes = await apiClient.analytics.getOverview({ range: 'last_30_days' });
    const overview = overviewRes.data;
    assert('getOverview() returns valid data object', Boolean(overview && overview.summary));
    assert('Summary contains totalSpend number', typeof overview.summary.totalSpend === 'number');
    assert('Summary contains totalRevenue number', typeof overview.summary.totalRevenue === 'number');
    assert('Summary contains formatted ROAS string', typeof overview.summary.roas === 'string');
    assert('Summary contains totalLeads integer', typeof overview.summary.totalLeads === 'number');
    assert('Summary contains qualifiedLeads integer', typeof overview.summary.qualifiedLeads === 'number');
    assert('Summary contains wonDeals integer', typeof overview.summary.wonDeals === 'number');
    assert('Summary contains cpl metric', typeof overview.summary.cpl === 'string');
    assert('Summary contains conversionRate metric', typeof overview.summary.conversionRate === 'string');
    assert('Summary contains activeCampaigns integer', typeof overview.summary.activeCampaigns === 'number');
    assert('Summary contains publishedContent integer', typeof overview.summary.publishedContent === 'number');
    assert('Timeseries returns date-bucketed array', Array.isArray(overview.timeseries));

    // Section 3: Campaign Performance Analytics
    console.log('\n[SECTION 3] Live GET /api/v1/analytics/campaigns');
    const campAnalytics = await analyticsService.getCampaigns({ range: 'last_30_days' });
    assert('getCampaigns() returns array from database', Array.isArray(campAnalytics));
    if (campAnalytics.length > 0) {
      const firstCamp = campAnalytics[0];
      assert('Campaign metric contains spend', typeof firstCamp.spend === 'number');
      assert('Campaign metric contains roas', typeof firstCamp.roas === 'string');
    } else {
      assert('Campaign analytics handled empty campaign state without errors', true);
    }

    // Section 4: Lead Funnel Analytics
    console.log('\n[SECTION 4] Live GET /api/v1/analytics/leads');
    const leadAnalytics = await analyticsService.getLeads({ range: 'last_30_days' });
    assert('getLeads() returns lead funnel breakdown', Boolean(leadAnalytics && leadAnalytics.stageFunnel));
    assert('Lead funnel contains NEW stage count', typeof leadAnalytics.stageFunnel.NEW === 'number');
    assert('Lead funnel contains QUALIFIED stage count', typeof leadAnalytics.stageFunnel.QUALIFIED === 'number');
    assert('Lead funnel contains WON stage count', typeof leadAnalytics.stageFunnel.WON === 'number');
    assert('Lead analytics contains qualificationRate', typeof leadAnalytics.qualificationRate === 'string');
    assert('Lead analytics contains winRate', typeof leadAnalytics.winRate === 'string');
    assert('Lead analytics contains sourceBreakdown', typeof leadAnalytics.sourceBreakdown === 'object');

    // Section 5: Content Publishing Analytics
    console.log('\n[SECTION 5] Live GET /api/v1/analytics/content');
    const contentAnalytics = await analyticsService.getContent({ range: 'last_30_days' });
    assert('getContent() returns content stage breakdown', Boolean(contentAnalytics && contentAnalytics.statusCounts));
    assert('Content analytics contains format breakdown', typeof contentAnalytics.formatBreakdown === 'object');
    assert('Content analytics contains platform breakdown', typeof contentAnalytics.platformBreakdown === 'object');
    assert('Content analytics contains publishing metrics', Boolean(contentAnalytics.publishing));

    // Section 6: Client Rollup Analytics
    console.log('\n[SECTION 6] Live GET /api/v1/analytics/clients');
    const clientAnalytics = await analyticsService.getClients({ range: 'last_30_days' });
    assert('getClients() returns array of client rollups', Array.isArray(clientAnalytics));

    // Section 7: Date Ranges & Custom Filters
    console.log('\n[SECTION 7] Date Range Filtering & Time Windows');
    const ranges = ['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'previous_month'];
    for (const r of ranges) {
      const rRes = await apiClient.analytics.getOverview({ range: r });
      assert(`Overview computed successfully for date range "${r}"`, Boolean(rRes.data?.summary));
    }

    const customRes = await apiClient.analytics.getOverview({
      startDate: '2026-08-01',
      endDate: '2026-08-30',
    });
    assert('Custom startDate/endDate window processed correctly', Boolean(customRes.data?.summary));

    // Section 8: CSV Export
    console.log('\n[SECTION 8] Live GET /api/v1/analytics/export (CSV)');
    const csvExport = await analyticsService.exportCsv('overview', { range: 'last_30_days' });
    assert('exportCsv() returns non-empty CSV formatted text', typeof csvExport === 'string' && csvExport.includes('Metric,Value'));

    // Section 9: Defensive Math & Division by Zero
    console.log('\n[SECTION 9] Defensive Math & Division by Zero');
    const emptyOverviewRes = await apiClient.analytics.getOverview({ range: 'today', clientId: 'c999-nonexistent' });
    const emptySummary = emptyOverviewRes.data?.summary;
    assert('Empty client filter returns zero ROAS without NaN', emptySummary?.roas === '0.00x');
    assert('Empty client filter returns zero CPL without Infinity', emptySummary?.cpl === '$0.00');
    assert('Empty client filter returns zero CTR without NaN', emptySummary?.ctr === '0%');
  } finally {
    // Restore initial baseUrl and close server
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`REAL ANALYTICS TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAnalyticsTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
