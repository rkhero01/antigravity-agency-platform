import {
  initialMockSEOOverview,
  initialMockKeywords,
  initialMockAuditIssues,
  initialMockContentGaps,
  initialMockBacklinks,
  initialMockLocalSEO,
} from '../data/mockSEO.js';
import { mockClients } from '../data/mockClients.js';

let keywordsState = JSON.parse(JSON.stringify(initialMockKeywords));
let auditIssuesState = JSON.parse(JSON.stringify(initialMockAuditIssues));
let contentGapsState = JSON.parse(JSON.stringify(initialMockContentGaps));
let backlinksState = JSON.parse(JSON.stringify(initialMockBacklinks));
let localSEOState = JSON.parse(JSON.stringify(initialMockLocalSEO));

export const seoService = {
  /**
   * Get SEO Overview KPIs
   */
  async getSEOOverview(clientId = 'all') {
    if (clientId === 'all') {
      return Promise.resolve(initialMockSEOOverview);
    }
    const client = mockClients.find((c) => c.id === clientId);
    const clientKeywords = keywordsState.filter((k) => k.clientId === clientId);
    const top3 = clientKeywords.filter((k) => k.position >= 1 && k.position <= 3).length;
    const top10 = clientKeywords.filter((k) => k.position >= 1 && k.position <= 10).length;

    return Promise.resolve({
      organicTraffic: `${Math.round(clientKeywords.length * 4800).toLocaleString()}`,
      trafficMoM: '+24.2%',
      organicKeywords: `${clientKeywords.length * 140}`,
      keywordsMoM: `+${clientKeywords.length * 12} Keywords`,
      top3Keywords: `${top3 * 28}`,
      top3MoM: `+${top3 * 4} Top 3`,
      top10Keywords: `${top10 * 45}`,
      top10MoM: `+${top10 * 8} Top 10`,
      avgPosition: '11.4',
      avgPositionMoM: '+3.1 positions',
      domainAuthority: '58 / 100',
      healthScore: '94 / 100',
      organicConversions: `${clientKeywords.length * 120}`,
      conversionsMoM: '+18.4%',
      organicRevenue: `$${(clientKeywords.length * 14200).toLocaleString()}`,
      revenueMoM: '+21.5%',
    });
  },

  /**
   * Get Rank Tracked Keywords
   */
  async getKeywords(filters = {}) {
    const {
      clientId = 'all',
      intent = 'all',
      status = 'all',
      positionRange = 'all',
      search = '',
    } = filters;

    let filtered = [...keywordsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((k) => k.clientId === clientId);
    }

    if (intent && intent !== 'all') {
      filtered = filtered.filter((k) => k.intent.toLowerCase() === intent.toLowerCase());
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((k) => k.status.toLowerCase() === status.toLowerCase());
    }

    if (positionRange && positionRange !== 'all') {
      if (positionRange === 'top3') {
        filtered = filtered.filter((k) => k.position >= 1 && k.position <= 3);
      } else if (positionRange === 'top10') {
        filtered = filtered.filter((k) => k.position >= 1 && k.position <= 10);
      } else if (positionRange === 'page2') {
        filtered = filtered.filter((k) => k.position >= 11 && k.position <= 20);
      }
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (k) =>
          k.keyword.toLowerCase().includes(q) ||
          k.clientName.toLowerCase().includes(q) ||
          k.url.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Add new keyword
   */
  async addKeyword(keywordData) {
    const client = mockClients.find((c) => c.id === keywordData.clientId) || mockClients[0];
    const newKw = {
      id: `kw-${Date.now()}`,
      keyword: keywordData.keyword,
      clientId: client.id,
      clientName: client.name,
      volume: parseInt(keywordData.volume || '8500', 10),
      difficulty: parseInt(keywordData.difficulty || '35', 10),
      position: parseInt(keywordData.position || '1', 10),
      previousPosition: parseInt(keywordData.position || '1', 10),
      change: 0,
      intent: keywordData.intent || 'Commercial',
      serpFeature: keywordData.serpFeature || 'Featured Snippet, Reviews',
      url: keywordData.url || `https://${client.name.toLowerCase().replace(/\s+/g, '')}.com`,
      lastChecked: 'Just now',
      status: 'New',
    };

    keywordsState = [newKw, ...keywordsState];
    return Promise.resolve(newKw);
  },

  /**
   * Update keyword
   */
  async updateKeyword(id, updates) {
    keywordsState = keywordsState.map((k) => (k.id === id ? { ...k, ...updates } : k));
    return Promise.resolve(true);
  },

  /**
   * Delete keyword
   */
  async deleteKeyword(id) {
    keywordsState = keywordsState.filter((k) => k.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Get Site Audit Issues
   */
  async getAudit(clientId = 'all') {
    let filtered = [...auditIssuesState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((a) => a.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Run new live site audit
   */
  async runAudit(clientId = 'all') {
    // Return audit summary and refreshed score
    return Promise.resolve({
      healthScore: 95,
      criticalErrors: 0,
      warnings: 3,
      passedChecks: 148,
      scannedUrls: 1240,
      timestamp: new Date().toLocaleTimeString(),
    });
  },

  /**
   * Get Content Gaps
   */
  async getContentGaps(clientId = 'all') {
    let filtered = [...contentGapsState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((g) => g.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Get Backlinks
   */
  async getBacklinks(clientId = 'all') {
    let filtered = [...backlinksState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((b) => b.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * Get Local SEO Profiles
   */
  async getLocalSEO(clientId = 'all') {
    let filtered = [...localSEOState];
    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((l) => l.clientId === clientId);
    }
    return Promise.resolve(filtered);
  },

  /**
   * On-Page SEO Real-Time Analyzer
   */
  async optimizeOnPage(data) {
    const kw = (data.targetKeyword || '').toLowerCase();
    const title = (data.title || '').toLowerCase();
    const meta = (data.metaDescription || '').toLowerCase();
    const h1 = (data.h1 || '').toLowerCase();
    const content = (data.content || '').toLowerCase();

    let score = 50;
    const checks = [];

    if (title.includes(kw)) {
      score += 15;
      checks.push({ text: 'Target keyword is present in page title', status: 'pass' });
    } else {
      checks.push({ text: 'Target keyword missing from page title', status: 'fail' });
    }

    if (title.length >= 45 && title.length <= 65) {
      score += 10;
      checks.push({ text: `Title length is optimal (${title.length} chars)`, status: 'pass' });
    } else {
      checks.push({ text: `Title length should be 45-65 chars (currently ${title.length})`, status: 'warn' });
    }

    if (meta.includes(kw)) {
      score += 10;
      checks.push({ text: 'Target keyword is present in meta description', status: 'pass' });
    } else {
      checks.push({ text: 'Target keyword missing from meta description', status: 'fail' });
    }

    if (h1.includes(kw)) {
      score += 15;
      checks.push({ text: 'Target keyword is in H1 heading', status: 'pass' });
    } else {
      checks.push({ text: 'Target keyword missing from H1 tag', status: 'fail' });
    }

    return Promise.resolve({
      seoScore: Math.min(100, score),
      checks,
      titleRecommendation: `${data.targetKeyword || 'Keyword'} | Complete 2026 Guide & Top Insights`,
      metaRecommendation: `Discover everything about ${data.targetKeyword || 'this topic'}. Expert advice, practical steps, and key benefits inside. Read more.`,
      h1Recommendation: `The Ultimate Guide to ${data.targetKeyword || 'Top Growth'} in 2026`,
      internalLinkSuggestions: ['/resources/best-practices', '/pricing', '/case-studies/industry-leader'],
      faqOpportunities: [
        `What are the main advantages of ${data.targetKeyword || 'this strategy'}?`,
        `How long does it take to see tangible results?`,
        `What common mistakes should you avoid?`,
      ],
    });
  },

  /**
   * AI SEO Content Brief Generator
   */
  async generateContentBrief(data) {
    const client = mockClients.find((c) => c.id === data.clientId) || mockClients[0];
    const primary = data.primaryKeyword || 'Contrast Therapy Protocols';

    return Promise.resolve({
      clientName: client.name,
      primaryKeyword: primary,
      recommendedWordCount: '2,200 – 2,800 words',
      seoTitle: `${primary}: The Definitive Clinical & Practical Guide (2026)`,
      metaDescription: `Master ${primary} with proven routines, scientific benefits, and expert tips from ${client.name}. Unlock peak performance today.`,
      suggestedH1: `Comprehensive Guide to ${primary} for Maximum Performance`,
      outlineStructure: [
        { h2: `1. Understanding ${primary}: Fundamentals & Science`, h3: ['Physiological Mechanisms', 'Clinical Studies & Safety'] },
        { h2: `2. Core Benefits & Performance Metrics`, h3: ['Recovery Acceleration', 'Mental Focus & Resilience'] },
        { h2: `3. Step-by-Step Implementation Routine`, h3: ['Beginner 15-Minute Protocol', 'Advanced Mastery Schedule'] },
        { h2: `4. Frequently Asked Questions`, h3: ['Best Timing', 'Equipment Guidelines'] },
      ],
      semanticKeywords: [
        'recovery optimization',
        'circulation boost',
        'cold shock proteins',
        'inflammation reduction',
        'endurance recovery',
      ],
      internalLinks: [
        { anchor: 'VIP recovery membership pass', url: '/memberships/vip' },
        { anchor: 'infrared sauna benefits', url: '/recovery/sauna' },
      ],
      callToAction: `Ready to elevate your recovery? Book your trial session at ${client.name} today.`,
    });
  },

  /**
   * AI 30-Day SEO Strategy Synthesizer
   */
  async generateStrategy(clientId = 'all') {
    const client = mockClients.find((c) => c.id === clientId) || mockClients[0];

    return Promise.resolve({
      clientName: clientId === 'all' ? 'All Client Portfolios' : client.name,
      summary: `Automated algorithmic audit identified 4 High-ROI ranking recovery avenues, 2 technical crawl bottlenecks, and 3 content gap capture opportunities.`,
      actionPlan: [
        {
          priority: 'P0 Critical',
          category: 'Technical SEO',
          action: 'Fix 301 redirects and resolve LCP asset compression on top product landing templates.',
          impact: '+12% Crawl Budget & Faster Indexation',
        },
        {
          priority: 'P1 High',
          category: 'Content Gap Expansion',
          action: 'Publish 2,500-word clinical comparison pillar piece targeting competitor high-volume gap keywords.',
          impact: 'Capture 38,000+ monthly search impressions',
        },
        {
          priority: 'P1 High',
          category: 'Digital PR & Backlinks',
          action: 'Pitch curated survey data study to Tier-1 industry publications (Men\'s Health, Vogue, TechCrunch).',
          impact: 'Gain 5+ Dofollow DA 80+ referring domains',
        },
        {
          priority: 'P2 Medium',
          category: 'Local SEO & Reviews',
          action: 'Optimize Google Business Profile Map Pack secondary categories and launch automated SMS review request triggers.',
          impact: 'Secure Top 3 Map Pack placement across 4 regional zip codes',
        },
      ],
    });
  },

  /**
   * Generate Executive SEO Report
   */
  async generateSEOReport(clientId = 'all', dateRange = 'Last 30 Days') {
    const overview = await this.getSEOOverview(clientId);
    return Promise.resolve({
      title: `Executive Organic Growth & SEO Performance Audit`,
      dateRange,
      overview,
      highlights: [
        'Organic traffic expanded by +18.4% MoM driven by new Top 3 commercial keyword captures.',
        'Core Web Vitals health score stabilized at 92/100 following image asset compression.',
        'Backlink profile grew with 4 high-authority DA 80+ Tier-1 editorial placements.',
        'Local Google Business Map Pack visibility reached 96% top-of-funnel impression share.',
      ],
    });
  },
};

export default seoService;
