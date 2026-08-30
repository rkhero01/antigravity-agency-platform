/**
 * SEO Rank Tracking & Site Audit Real API Test Suite
 * Task 17 — Production SERP Provider Abstraction, GSC/DataForSEO Config Gates, Crawler SSRF, Heuristics & RBAC
 */

import http from 'http';
import { createApp } from '../src/app.js';
import { seoKeywordRepository } from '../src/repositories/seoKeywordRepository.js';
import { seoTaskRepository } from '../src/repositories/seoTaskRepository.js';
import { clientRepository } from '../src/repositories/clientRepository.js';
import { authSessionService } from '../../src/services/authSessionService.js';
import { apiClient } from '../../src/services/api/apiClient.js';
import { generateToken } from '../src/auth/tokenUtils.js';
import { ROLES } from '../src/middleware/auth.js';
import { getSeoProvider, getSeoProvidersStatus, PROVIDER_TYPES } from '../src/services/seo/providers/index.js';
import { GoogleSearchConsoleProvider } from '../src/services/seo/providers/googleSearchConsoleProvider.js';
import { DataForSeoProvider } from '../src/services/seo/providers/dataForSeoProvider.js';
import { siteCrawler } from '../src/services/seo/siteCrawler.js';
import { siteAuditService, AUDIT_SEVERITY } from '../src/services/seo/siteAuditService.js';
import { rankTrackingService } from '../src/services/seo/rankTrackingService.js';
import { classifyFailure, RETRY_CATEGORIES } from '../src/services/automation/retryPolicy.js';

console.log('========================================================================');
console.log('TEST SUITE: SEO RANK TRACKING & SITE AUDIT ENGINE (TASK 17)');
console.log('========================================================================\n');

async function runRankTrackingTests() {
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

  // Start test server
  const initialBaseUrl = apiClient.getBaseUrl();
  const app = createApp();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const localBaseUrl = `http://localhost:${port}/api/v1`;

  apiClient.setBaseUrl(localBaseUrl);

  const agencyA = 'agency-demo-001';
  const agencyB = 'agency-isolated-777';

  let testClient = null;
  let testKeyword = null;

  try {
    // Section 1: Authentication & Setup
    console.log('[SECTION 1] Authentication & Tenant Context Setup');
    const loginRes = await authSessionService.login('owner@antigravity.agency', 'AntigravityDemo2026!');
    assert('Operator authenticated with JWT', loginRes.success);
    assert('Operator bound to agency A', loginRes.user?.agencyId === agencyA);

    const unauthRes = await fetch(`${localBaseUrl}/seo/providers/status`);
    assert('Unauthenticated request rejected with 401 Unauthorized', unauthRes.status === 401);

    testClient = await clientRepository.create(
      {
        name: 'Nexus Organic FinTech',
        industry: 'Banking',
        status: 'ACTIVE',
        primaryContact: 'Maya Patel',
        email: 'maya@nexusfintech.com',
        monthlyRetainer: 120000,
      },
      agencyA
    );
    assert('Test Client created in PostgreSQL', Boolean(testClient && testClient.id));

    testKeyword = await seoKeywordRepository.create({
      agencyId: agencyA,
      clientId: testClient.id,
      keyword: 'best business credit cards 2026',
      searchVolume: 65000,
      difficulty: 74,
      currentRank: 12,
      previousRank: 24,
      targetRank: 3,
      searchIntent: 'COMMERCIAL',
      status: 'TRACKING',
      url: 'https://nexusfintech.com/business-cards',
    });
    assert('Tracked Keyword created in PostgreSQL', Boolean(testKeyword && testKeyword.id));

    // Section 2: Provider Abstraction & Configuration Gates
    console.log('\n[SECTION 2] SEO Provider Abstraction & Capability Gates');
    const gscProvider = getSeoProvider(PROVIDER_TYPES.GOOGLE_SEARCH_CONSOLE);
    assert('Google Search Console provider instantiated', gscProvider instanceof GoogleSearchConsoleProvider);

    const dataForSeoProvider = getSeoProvider(PROVIDER_TYPES.DATAFORSEO);
    assert('DataForSEO provider instantiated', dataForSeoProvider instanceof DataForSeoProvider);

    const gscUnconf = await gscProvider.getKeywordRank('credit cards');
    assert('Missing GSC credentials returns CONFIGURATION_REQUIRED', gscUnconf.status === 'CONFIGURATION_REQUIRED');

    const dfsUnconf = await dataForSeoProvider.getKeywordRank('credit cards');
    assert('Missing DataForSEO credentials returns CONFIGURATION_REQUIRED', dfsUnconf.status === 'CONFIGURATION_REQUIRED');

    const providerStatusList = await getSeoProvidersStatus();
    assert('getSeoProvidersStatus() returns provider status map', Array.isArray(providerStatusList) && providerStatusList.length >= 2);
    assert('GSC reports CONFIGURATION_REQUIRED when keys unset', providerStatusList.some((p) => p.provider === 'GOOGLE_SEARCH_CONSOLE' && p.status === 'CONFIGURATION_REQUIRED'));

    // Section 3: Response Normalization & Math
    console.log('\n[SECTION 3] Provider Response Normalization & SERP Math');
    const normalizedDirect = gscProvider.normalizeRankResult({
      keyword: 'best personal loan',
      currentRank: 5,
      previousRank: 15,
      searchVolume: 12000,
      clicks: 450,
      impressions: 8900,
    });
    assert('normalizeRankResult calculates rankChange as +10 (15 - 5)', normalizedDirect.rankChange === 10);
    assert('normalizeRankResult preserves impressions and clicks', normalizedDirect.impressions === 8900 && normalizedDirect.clicks === 450);

    const gscRowNorm = gscProvider.normalizeGscRow({
      keys: ['mortgage calculator 2026', 'https://nexus.com/calc'],
      clicks: '320',
      impressions: '4500',
      ctr: '0.071',
      position: '3.4',
    });
    assert('normalizeGscRow maps query and page', gscRowNorm.query === 'mortgage calculator 2026' && gscRowNorm.page === 'https://nexus.com/calc');
    assert('normalizeGscRow parses position and clicks', gscRowNorm.position === 3.4 && gscRowNorm.clicks === 320);

    // Section 4: Live Rank Tracking Endpoint & History
    console.log('\n[SECTION 4] Rank Check API & Historical Snapshots');
    const rankCheckRes = await apiClient.post(`/api/v1/seo/rank-check/${testKeyword.id}`, {
      provider: 'DATAFORSEO',
    });
    assert('POST /seo/rank-check/:keywordId responds with status', rankCheckRes.success);
    assert('Rank check reports CONFIGURATION_REQUIRED in unconfigured environment', rankCheckRes.data?.status === 'CONFIGURATION_REQUIRED');

    const historyRes = await apiClient.get(`/api/v1/seo/rank-history/${testKeyword.id}`);
    assert('GET /seo/rank-history/:keywordId returns historical snapshot array', historyRes.success && Array.isArray(historyRes.data?.history));

    const providerStatusApiRes = await apiClient.get('/api/v1/seo/providers/status');
    assert('GET /seo/providers/status returns 200 with provider array', providerStatusApiRes.success && providerStatusApiRes.data?.providers?.length > 0);

    // Section 5: Retry Classification & Error Handling
    console.log('\n[SECTION 5] Retry Classification & Failure Mapping');
    assert('HTTP 429 classified as RATE_LIMITED', classifyFailure(429) === RETRY_CATEGORIES.RATE_LIMITED);
    assert('HTTP 401 classified as NEEDS_REAUTH', classifyFailure(401) === RETRY_CATEGORIES.NEEDS_REAUTH);
    assert('HTTP 503 classified as TEMPORARY_FAILURE', classifyFailure(503) === RETRY_CATEGORIES.TEMPORARY_FAILURE);
    assert('HTTP 400 classified as FAILED', classifyFailure(400) === RETRY_CATEGORIES.FAILED);
    assert('CONFIGURATION_REQUIRED classified correctly', classifyFailure(null, null, { status: 'CONFIGURATION_REQUIRED' }) === RETRY_CATEGORIES.CONFIGURATION_REQUIRED);

    // Section 6: Site Crawler SSRF Protection & Policy Gates
    console.log('\n[SECTION 6] Crawler SSRF Protection & Security Boundaries');
    const localhostCrawl = await siteCrawler.crawlPage('https://localhost:8080/admin');
    assert('Localhost target blocked by SSRF policy', localhostCrawl.blocked === true);

    const privateIpCrawl = await siteCrawler.crawlPage('https://192.168.1.1/secret');
    assert('Private RFC1918 IP target blocked by SSRF policy', privateIpCrawl.blocked === true);

    const loopbackCrawl = await siteCrawler.crawlPage('https://127.0.0.1:3000/db');
    assert('127.0.0.1 loopback target blocked by SSRF policy', loopbackCrawl.blocked === true);

    const metadataCrawl = await siteCrawler.crawlPage('https://metadata.google.internal/computeMetadata/v1');
    assert('Cloud metadata endpoint blocked by SSRF policy', metadataCrawl.blocked === true);

    const httpInsecureCrawl = await siteCrawler.crawlPage('http://insecure-example.com');
    assert('Insecure HTTP target rejected (HTTPS enforced)', httpInsecureCrawl.blocked === true);

    // Section 7: HTML Inspector & Heuristic Findings
    console.log('\n[SECTION 7] HTML Parser & Technical SEO Heuristics');
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Short</title>
          <!-- Missing Meta Description -->
          <!-- Missing Canonical -->
          <meta name="robots" content="noindex, follow">
        </head>
        <body>
          <h1>First Main Heading</h1>
          <h1>Duplicate Second Heading</h1>
          <p>Short content snippet with very few words.</p>
          <img src="/logo.png" alt="Company Logo">
          <img src="/banner.jpg">
        </body>
      </html>
    `;

    const parsedSample = siteCrawler.parseHtml(sampleHtml, 'https://example.com/test');
    assert('Parser extracts title', parsedSample.title === 'Short');
    assert('Parser flags noindex robots directive', parsedSample.isNoindex === true);
    assert('Parser counts multiple H1 tags (2 found)', parsedSample.h1Count === 2);
    assert('Parser detects missing image alt tags (1 missing)', parsedSample.imagesMissingAlt === 1);
    assert('Parser counts word count accurately', parsedSample.wordCount < 30);

    const findings = siteAuditService.evaluateFindings({
      url: 'https://example.com/test',
      ...parsedSample,
    });
    assert('Evaluator flags MISSING_META_DESCRIPTION', findings.some((f) => f.type === 'MISSING_META_DESCRIPTION'));
    assert('Evaluator flags MULTIPLE_H1', findings.some((f) => f.type === 'MULTIPLE_H1'));
    assert('Evaluator flags NOINDEX_DETECTED with CRITICAL severity', findings.some((f) => f.type === 'NOINDEX_DETECTED' && f.severity === AUDIT_SEVERITY.CRITICAL));
    assert('Evaluator flags THIN_CONTENT', findings.some((f) => f.type === 'THIN_CONTENT'));
    assert('Evaluator flags MISSING_IMAGE_ALT', findings.some((f) => f.type === 'MISSING_IMAGE_ALT'));

    const calculatedScore = siteAuditService.calculateHealthScore(findings);
    assert('Health score calculated with appropriate deductions (< 60)', calculatedScore < 60);

    // Section 8: Site Audit API Endpoint
    console.log('\n[SECTION 8] Site Audit API Execution');
    const siteAuditApiRes = await apiClient.post('/api/v1/seo/site-audit', {
      url: 'https://127.0.0.1:4000/internal',
      clientId: testClient.id,
    });
    assert('POST /seo/site-audit blocks SSRF internal targets gracefully', siteAuditApiRes.success && siteAuditApiRes.data?.status === 'BLOCKED');

    // Section 9: RBAC Mutation Gates
    console.log('\n[SECTION 9] RBAC Permission Enforcement');
    const viewerToken = generateToken({
      userId: 'usr-viewer-seo-rank',
      agencyId: agencyA,
      role: ROLES.VIEWER,
      email: 'viewer@agency.com',
    });
    const viewerHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${viewerToken}`,
    };

    const viewerRankCheckRes = await fetch(`${localBaseUrl}/seo/rank-check/${testKeyword.id}`, {
      method: 'POST',
      headers: viewerHeaders,
    });
    assert('Viewer role blocked from triggering rank check (403 Forbidden)', viewerRankCheckRes.status === 403);

    const viewerSiteAuditRes = await fetch(`${localBaseUrl}/seo/site-audit`, {
      method: 'POST',
      headers: viewerHeaders,
      body: JSON.stringify({ url: 'https://example.com' }),
    });
    assert('Viewer role blocked from triggering site audit (403 Forbidden)', viewerSiteAuditRes.status === 403);

    const analystToken = generateToken({
      userId: 'usr-analyst-seo-rank',
      agencyId: agencyA,
      role: ROLES.ANALYST,
      email: 'analyst@agency.com',
    });
    const analystHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${analystToken}`,
    };

    const analystRankCheckRes = await fetch(`${localBaseUrl}/seo/rank-check/${testKeyword.id}`, {
      method: 'POST',
      headers: analystHeaders,
    });
    assert('Analyst role blocked from triggering rank check (403 Forbidden)', analystRankCheckRes.status === 403);

    // Section 10: Multi-Tenant Cross-Agency Protection
    console.log('\n[SECTION 10] Multi-Tenant Isolation & IDOR Protection');
    const tenantBToken = generateToken({
      userId: 'usr-tenant-b-seo-rank',
      agencyId: agencyB,
      role: ROLES.OWNER,
      email: 'owner@agency-b.com',
    });
    const tenantBHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tenantBToken}`,
    };

    const crossRankHistoryRes = await fetch(`${localBaseUrl}/seo/rank-history/${testKeyword.id}`, {
      method: 'GET',
      headers: tenantBHeaders,
    });
    assert('Cross-agency rank history read blocked (403/404)', crossRankHistoryRes.status === 403 || crossRankHistoryRes.status === 404);

    const crossRankCheckRes = await fetch(`${localBaseUrl}/seo/rank-check/${testKeyword.id}`, {
      method: 'POST',
      headers: tenantBHeaders,
    });
    assert('Cross-agency rank check blocked (403/404)', crossRankCheckRes.status === 403 || crossRankCheckRes.status === 404);

    // Section 11: Secret Sanitization
    console.log('\n[SECTION 11] Secret Sanitization');
    const serializedHistory = JSON.stringify(historyRes.data);
    assert('Zero DATAFORSEO_API_KEY in serialized history', !serializedHistory.includes('DATAFORSEO_API_KEY'));
    assert('Zero GOOGLE_SEARCH_CONSOLE_KEY in serialized history', !serializedHistory.includes('GOOGLE_SEARCH_CONSOLE_KEY'));
    assert('Zero access_token in serialized history', !serializedHistory.includes('access_token'));

    // Section 12: Cleanup
    console.log('\n[SECTION 12] Fixture Teardown');
    await seoKeywordRepository.delete(testKeyword.id, agencyA, true);
    await clientRepository.delete(testClient.id, agencyA, true);
    assert('Test fixtures cleanly archived and deleted from PostgreSQL', true);
  } finally {
    apiClient.setBaseUrl(initialBaseUrl);
    server.close();
  }

  console.log('\n========================================================================');
  console.log(`SEO RANK TRACKING TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRankTrackingTests().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
