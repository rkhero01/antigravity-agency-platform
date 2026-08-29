/**
 * AI Growth & Marketing Intelligence Data Layer & Unified Aggregator
 * Task 27 — Step 4: Real-Time Data Synchronization & Cross-Module Integration
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

import { initialMockAIIntelligence } from '../data/mockAIIntelligence.js';
import { initialMockClients } from '../data/mockClients.js';
import { initialMockLeads, initialMockFollowUps } from '../data/mockCRM.js';
import {
  initialMockWhatsAppConversations,
  initialMockWhatsAppCampaigns,
  initialMockWhatsAppTemplates,
  initialMockWhatsAppAutomationFlows,
  initialMockWhatsAppFollowUps,
  initialMockWhatsAppAnalytics,
} from '../data/mockWhatsApp.js';
import { initialMockCampaigns as initialMockAdsCampaigns } from '../data/mockAds.js';
import { initialMockKeywords, initialMockSEOOverview } from '../data/mockSEO.js';
import { initialMockTeam as initialMockTeamMembers } from '../data/mockTeam.js';
import { initialMockContracts } from '../data/mockContracts.js';
import { calculateAIPriority } from './aiPriorityService.js';
import { aiActionOrchestrator } from './aiActionOrchestrator.js';

// In-memory working copy of intelligence state initialized with deep clone
let intelligenceState = JSON.parse(JSON.stringify(initialMockAIIntelligence));

// --------------------------------------------------------------------------
// 1. DEFENSIVE MATHEMATICAL & SANITIZATION HELPERS
// --------------------------------------------------------------------------

export const safeNumber = (val, fallback = 0) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return fallback;
    return val;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num) || !isFinite(num)) return fallback;
    return num;
  }
  return fallback;
};

export const safeDivide = (num, denom, fallback = 0) => {
  const n = safeNumber(num, 0);
  const d = safeNumber(denom, 0);
  if (d === 0) return fallback;
  const res = n / d;
  if (isNaN(res) || !isFinite(res)) return fallback;
  return res;
};

export const safePercentage = (num, denom, decimals = 1) => {
  const n = safeNumber(num, 0);
  const d = safeNumber(denom, 0);
  if (d === 0) return '0.0%';
  const val = (n / d) * 100;
  if (isNaN(val) || !isFinite(val)) return '0.0%';
  return `${val.toFixed(decimals)}%`;
};

export const safeRoas = (revenue, spend, decimals = 2) => {
  const rev = safeNumber(revenue, 0);
  const sp = safeNumber(spend, 0);
  if (sp === 0) return '0.00x';
  const val = rev / sp;
  if (isNaN(val) || !isFinite(val)) return '0.00x';
  return `${val.toFixed(decimals)}x`;
};

export const safeGrowthRate = (current, previous, decimals = 1) => {
  const cur = safeNumber(current, 0);
  const prev = safeNumber(previous, 0);
  if (prev === 0) return '+0.0%';
  const val = ((cur - prev) / prev) * 100;
  if (isNaN(val) || !isFinite(val)) return '+0.0%';
  const prefix = val >= 0 ? '+' : '';
  return `${prefix}${val.toFixed(decimals)}%`;
};

export const safeAverage = (arr = [], key = null) => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  let sum = 0;
  let count = 0;
  for (const item of arr) {
    const val = key && typeof item === 'object' && item !== null ? item[key] : item;
    const num = safeNumber(val, null);
    if (num !== null) {
      sum += num;
      count += 1;
    }
  }
  if (count === 0) return 0;
  const avg = sum / count;
  return isNaN(avg) || !isFinite(avg) ? 0 : Math.round(avg * 10) / 10;
};

export const safeSum = (arr = [], key = null) => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  let sum = 0;
  for (const item of arr) {
    const val = key && typeof item === 'object' && item !== null ? item[key] : item;
    sum += safeNumber(val, 0);
  }
  return isNaN(sum) || !isFinite(sum) ? 0 : sum;
};

// --------------------------------------------------------------------------
// 2. CENTRALIZED CROSS-MODULE INTELLIGENCE AGGREGATOR
// --------------------------------------------------------------------------

export const aiIntelligenceService = {
  /**
   * Universal Cross-Module Snapshot Aggregator
   * Safely consumes data from CRM, WhatsApp, Ads, SEO, Contracts, and Team datasets.
   */
  async getUnifiedIntelligenceSnapshot(filters = {}) {
    const { clientId = 'all' } = filters;

    // Filter leads
    const allLeads = JSON.parse(JSON.stringify(initialMockLeads || []));
    const leads = clientId === 'all' ? allLeads : allLeads.filter((l) => l.clientId === clientId);

    // Filter WhatsApp conversations & campaigns
    const allWaConvs = JSON.parse(JSON.stringify(initialMockWhatsAppConversations || []));
    const waConvs = clientId === 'all' ? allWaConvs : allWaConvs.filter((c) => c.clientId === clientId);
    const allWaCamps = JSON.parse(JSON.stringify(initialMockWhatsAppCampaigns || []));
    const waCampaigns = clientId === 'all' ? allWaCamps : allWaCamps.filter((c) => c.clientId === clientId);

    // Filter Ads campaigns
    const allAds = JSON.parse(JSON.stringify(initialMockAdsCampaigns || []));
    const adsCampaigns = clientId === 'all' ? allAds : allAds.filter((a) => a.clientId === clientId);

    // Filter SEO keywords
    const allKeywords = JSON.parse(JSON.stringify(initialMockKeywords || []));
    const seoKeywords = clientId === 'all' ? allKeywords : allKeywords.filter((k) => k.clientId === clientId);

    // Filter Contracts / Retainers
    const allContracts = JSON.parse(JSON.stringify(initialMockContracts || []));
    const contracts = clientId === 'all' ? allContracts : allContracts.filter((c) => c.clientId === clientId);

    // Filter Clients
    const allClients = await this.getClientIntelligence('all');
    const clients = clientId === 'all' ? allClients : allClients.filter((c) => c.clientId === clientId);

    // Aggregate key metrics
    const totalLeads = leads.length + waConvs.length + (clientId === 'all' ? 4820 - (leads.length + waConvs.length) : 0);
    const totalMRR = safeSum(contracts, 'monthlyValue') || (clientId === 'all' ? 184500 : (contracts[0]?.monthlyValue || 25000));
    const totalAdSpend = safeSum(adsCampaigns, 'spent') || (clientId === 'all' ? 1845000 : 350000);
    const totalRevenue = clientId === 'all' ? 12840000 : (clients[0]?.revenue || 2840000);
    const blendedROAS = safeRoas(totalRevenue, totalAdSpend);

    // Calculate dynamic health
    const health = await this.getBusinessHealth({ clientId });
    const insights = await this.getAIInsights({ clientId });
    const recommendations = await this.getAIRecommendations({ clientId });
    const anomalies = await this.getAnomalies({ clientId });
    const forecast = await this.getForecast({ timeframe: '30d' });
    const channelMatrix = await this.getChannelIntelligence({ clientId });

    return Promise.resolve({
      clients,
      leads: {
        total: totalLeads,
        items: leads,
        velocity: '18.5 days avg to close',
      },
      campaigns: {
        activeCount: adsCampaigns.length + waCampaigns.length + 12,
        ads: adsCampaigns,
        whatsapp: waCampaigns,
      },
      channels: channelMatrix,
      revenue: {
        attributed: totalRevenue,
        mrr: totalMRR,
        adSpend: totalAdSpend,
        blendedROAS,
      },
      seo: {
        keywordsCount: seoKeywords.length,
        keywords: seoKeywords,
        traffic: '142,000 visits/mo',
      },
      whatsapp: {
        conversationsCount: waConvs.length,
        replyRate: '75.6%',
        readRate: '88.9%',
      },
      email: {
        openRate: '34.2%',
        clickRate: '5.8%',
      },
      social: {
        sentiment: '84.2% Positive',
        postsPublished: 342,
      },
      billing: {
        mrr: totalMRR,
        contractsCount: contracts.length,
      },
      team: {
        activeMembers: 12,
        firstTouchSla: '45 seconds',
      },
      health,
      insights,
      recommendations,
      anomalies,
      forecast,
    });
  },

  /**
   * 1. Get Top-Level Executive KPI Overview
   */
  async getAgencyIntelligence() {
    return Promise.resolve(JSON.parse(JSON.stringify(intelligenceState.agencyOverview)));
  },

  /**
   * 2. Get Client-by-Client Intelligence Dossier
   * Dynamically calculates performance metrics for all 7 clients (c1–c7) or single client.
   */
  async getClientIntelligence(clientId = 'all') {
    const clients = JSON.parse(JSON.stringify(intelligenceState.clientIntelligence || []));

    if (clientId === 'all') {
      return Promise.resolve(clients);
    }

    const client = clients.find((c) => c.clientId === clientId);
    if (!client) {
      return Promise.resolve(null);
    }

    return Promise.resolve(JSON.parse(JSON.stringify(client)));
  },

  /**
   * 3. Get Lead & Pipeline Velocity Intelligence
   */
  async getLeadIntelligence(filters = {}) {
    const { clientId = 'all' } = filters;
    let data = JSON.parse(JSON.stringify(intelligenceState.leadIntelligence));

    if (clientId && clientId !== 'all') {
      const client = intelligenceState.clientIntelligence.find((c) => c.clientId === clientId);
      if (client) {
        data.totalLeads = client.leadVolume || 800;
        data.leadsThisMonth = Math.round((client.leadVolume || 800) * 0.28);
      }
    }

    return Promise.resolve(data);
  },

  /**
   * 4. Get Lead Velocity & Pipeline Transition Stages
   */
  async getLeadVelocityIntelligence(filters = {}) {
    const { clientId = 'all' } = filters;
    const base = JSON.parse(JSON.stringify(intelligenceState.leadIntelligence));

    if (clientId && clientId !== 'all') {
      const client = intelligenceState.clientIntelligence.find((c) => c.clientId === clientId);
      if (client) {
        const factor = (client.leadVolume || 800) / (intelligenceState.agencyOverview.totalLeadsThisMonth || 4820);
        base.pipelineStages = base.pipelineStages.map((s) => ({
          ...s,
          count: Math.max(5, Math.round(s.count * factor)),
          prevCount: Math.max(3, Math.round(s.prevCount * factor)),
        }));
      }
    }

    return Promise.resolve(base);
  },

  /**
   * 5. Get Cross-Channel Campaign Intelligence
   */
  async getCampaignIntelligence(filters = {}) {
    const { clientId = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.campaignIntelligence || []));

    if (clientId && clientId !== 'all') {
      list = list.filter((camp) => camp.clientId === clientId);
    }

    return Promise.resolve(list);
  },

  /**
   * 6. Get Channel Attribution & ROI Intelligence
   */
  async getChannelIntelligence(filters = {}) {
    const { clientId = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.channelIntelligence || []));

    if (clientId && clientId !== 'all') {
      const client = intelligenceState.clientIntelligence.find((c) => c.clientId === clientId);
      if (client) {
        const factor = (client.revenue || 2000000) / 12840000;
        list = list.map((c) => ({
          ...c,
          revenue: Math.round((c.revenue || 100000) * factor),
          spend: Math.round((c.spend || 20000) * factor),
          leads: Math.max(10, Math.round((c.leads || 50) * factor)),
        }));
      }
    }

    return Promise.resolve(list);
  },

  /**
   * 7. Get Content & Creative Intelligence
   */
  async getContentIntelligence(filters = {}) {
    return Promise.resolve(JSON.parse(JSON.stringify(intelligenceState.contentIntelligence)));
  },

  /**
   * 8. Get SEO & Organic Growth Intelligence
   */
  async getSEOIntelligence(filters = {}) {
    return Promise.resolve(JSON.parse(JSON.stringify(intelligenceState.seoIntelligence)));
  },

  /**
   * 9. Get Comprehensive Revenue Attribution
   */
  async getRevenueAttribution(filters = {}) {
    const { clientId = 'all' } = filters;
    let data = JSON.parse(JSON.stringify(intelligenceState.revenueIntelligence));

    if (clientId && clientId !== 'all') {
      const client = intelligenceState.clientIntelligence.find((c) => c.clientId === clientId);
      if (client) {
        data.byClient = data.byClient.filter((c) =>
          c.clientName.toLowerCase().includes(client.clientName.toLowerCase())
        );
      }
    }

    return Promise.resolve(data);
  },

  /**
   * 10. Dynamic Business Health Calculation (0–100)
   * Evaluates across 7 key operational domains.
   */
  async getBusinessHealth(filters = {}) {
    const { clientId = 'all' } = filters;
    let base = JSON.parse(JSON.stringify(intelligenceState.businessHealth));

    if (clientId && clientId !== 'all') {
      const client = intelligenceState.clientIntelligence.find((c) => c.clientId === clientId);
      if (client) {
        const score = client.healthScore || 90;
        base.overall.score = score;
        base.overall.label = score >= 90 ? 'Excellent' : score >= 75 ? 'Healthy' : 'Watch';
      }
    }

    return Promise.resolve(base);
  },

  /**
   * 11. Multi-Horizon Predictive Forecasts (7d, 30d, 90d)
   */
  async getForecast(filters = {}) {
    const { timeframe = '30d' } = filters;
    const model =
      intelligenceState.forecastData[timeframe] || intelligenceState.forecastData['30d'];
    return Promise.resolve(JSON.parse(JSON.stringify(model)));
  },

  /**
   * 12. Dynamic Anomaly Detection Engine
   * Detects SLA spikes, checkout abandonment, viral surges, and CPL inflation.
   */
  async getAnomalies(filters = {}) {
    const { clientId = 'all', severity = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.anomalyIntelligence || []));

    if (clientId && clientId !== 'all') {
      list = list.filter((a) => a.clientId === clientId);
    }
    if (severity && severity !== 'all') {
      list = list.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
    }

    return Promise.resolve(list);
  },

  /**
   * 13. Dynamic AI Strategic Insights Generator
   * Generates prioritized strategic insights (P0, P1, P2, P3).
   */
  async getAIInsights(filters = {}) {
    const { clientId = 'all', priority = 'all', status = 'all', search = '' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.aiInsights || []));

    if (clientId && clientId !== 'all') {
      list = list.filter((ins) => ins.clientId === clientId);
    }
    if (priority && priority !== 'all') {
      list = list.filter((ins) => ins.priority.toLowerCase() === priority.toLowerCase());
    }
    if (status && status !== 'all') {
      list = list.filter((ins) => ins.status.toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (ins) =>
          ins.title.toLowerCase().includes(q) ||
          ins.summary.toLowerCase().includes(q) ||
          ins.clientName.toLowerCase().includes(q) ||
          ins.category.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(list);
  },

  /**
   * 14. AI Prescriptive Growth Playbook Recommendations
   */
  async getAIRecommendations(filters = {}) {
    const { clientId = 'all', priority = 'all', status = 'all', search = '' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.aiRecommendations || []));

    if (clientId && clientId !== 'all') {
      list = list.filter((r) => r.clientId === clientId);
    }
    if (priority && priority !== 'all') {
      list = list.filter((r) => r.priority.toLowerCase() === priority.toLowerCase());
    }
    if (status && status !== 'all') {
      list = list.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.problem.toLowerCase().includes(q) ||
          r.recommendation.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(list);
  },

  /**
   * 15. Executive Daily Intelligence Briefing
   */
  async getDailyBriefing(filters = {}) {
    return Promise.resolve(JSON.parse(JSON.stringify(intelligenceState.dailyBriefing)));
  },

  /**
   * 16. Executive Decision Scoreboard (0–100)
   */
  async getExecutiveDecisionScore() {
    return Promise.resolve(JSON.parse(JSON.stringify(intelligenceState.decisionScoreboard || {})));
  },

  /**
   * 17. Cross-Module Opportunity Map
   */
  async getOpportunityMap(filters = {}) {
    const { category = 'all', clientId = 'all', urgency = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.opportunityMap || []));

    if (clientId && clientId !== 'all') {
      list = list.filter((opp) => opp.clientId === clientId);
    }
    if (category && category !== 'all') {
      list = list.filter((opp) => opp.category.toLowerCase() === category.toLowerCase());
    }
    if (urgency && urgency !== 'all') {
      list = list.filter((opp) => opp.urgency.toLowerCase() === urgency.toLowerCase());
    }

    return Promise.resolve(list);
  },

  /**
   * 18. Client Risk Radar Matrix
   */
  async getClientRiskRadar(filters = {}) {
    const { riskLevel = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.clientRiskRadar || []));

    if (riskLevel && riskLevel !== 'all') {
      list = list.filter((c) => c.overallRisk.toLowerCase() === riskLevel.toLowerCase());
    }

    return Promise.resolve(list);
  },

  /**
   * 19. Revenue Leakage Detection Items
   */
  async getRevenueLeakage(filters = {}) {
    const { severity = 'all', clientId = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.revenueLeakage || []));

    if (clientId && clientId !== 'all') {
      list = list.filter((l) => l.clientId === clientId);
    }
    if (severity && severity !== 'all') {
      list = list.filter((l) => l.severity.toLowerCase() === severity.toLowerCase());
    }

    return Promise.resolve(list);
  },

  /**
   * 20. Prioritized Next Best Actions
   */
  async getNextBestActions(filters = {}) {
    const { priority = 'all', clientId = 'all' } = filters;
    let list = JSON.parse(JSON.stringify(intelligenceState.nextBestActions || []));

    if (clientId && clientId !== 'all') {
      list = list.filter((a) => a.clientId === clientId);
    }
    if (priority && priority !== 'all') {
      list = list.filter((a) => a.priority.toLowerCase() === priority.toLowerCase());
    }

    return Promise.resolve(list);
  },

  /**
   * 21. Interactive What-If Scenario Simulator
   */
  async simulateScenario(inputs = {}) {
    const baselines = intelligenceState.scenarioBaselines || {
      adSpend: 1845000,
      leadVolume: 4820,
      conversionRate: 28.4,
      averageDealValue: 9370,
      followUpCompletionRate: 78.5,
    };

    const spend = Math.max(0, safeNumber(inputs.adSpend ?? baselines.adSpend, baselines.adSpend));
    const leads = Math.max(0, safeNumber(inputs.leadVolume ?? baselines.leadVolume, baselines.leadVolume));
    const convRate = Math.min(100, Math.max(0, safeNumber(inputs.conversionRate ?? baselines.conversionRate, baselines.conversionRate)));
    const dealValue = Math.max(0, safeNumber(inputs.averageDealValue ?? baselines.averageDealValue, baselines.averageDealValue));
    const followUpRate = Math.min(100, Math.max(0, safeNumber(inputs.followUpCompletionRate ?? baselines.followUpCompletionRate, baselines.followUpCompletionRate)));

    const followUpFactor = followUpRate > 0 ? followUpRate / 78.5 : 1;
    const effectiveConvRate = (convRate / 100) * followUpFactor;
    const projectedQualifiedLeads = Math.round(leads * 0.58);
    const projectedWins = Math.round(leads * effectiveConvRate);
    const projectedRevenue = Math.round(projectedWins * dealValue);
    const projectedROAS = safeRoas(projectedRevenue, spend);

    const baseRevenue = 12840000;
    const revenueDifference = projectedRevenue - baseRevenue;
    const estimatedGrowthPct = safeGrowthRate(projectedRevenue, baseRevenue);

    return Promise.resolve({
      inputs: {
        adSpend: spend,
        leadVolume: leads,
        conversionRate: convRate,
        averageDealValue: dealValue,
        followUpCompletionRate: followUpRate,
      },
      projectedLeads: leads,
      projectedQualifiedLeads,
      projectedWins,
      projectedRevenue,
      projectedROAS,
      revenueDifference,
      estimatedGrowthPct,
      disclaimer: 'Scenario Simulation — Not a live forecast',
    });
  },

  /**
   * 22. Client Comparison Matrix
   */
  async getClientComparison(filters = {}) {
    const list = JSON.parse(JSON.stringify(intelligenceState.clientIntelligence || []));
    const radar = JSON.parse(JSON.stringify(intelligenceState.clientRiskRadar || []));

    const merged = list.map((c) => {
      const r = radar.find((rad) => rad.clientId === c.clientId) || {};
      return {
        ...c,
        overallRisk: r.overallRisk || 'LOW',
        riskScore: r.riskScore || 20,
        pipelineValue: Math.round((c.revenue || 1000000) * 1.45),
      };
    });

    return Promise.resolve(merged);
  },

  /**
   * 23. AI-Synthesized Executive Summary
   */
  async generateExecutiveSummary(filters = {}) {
    const overview = await this.getAgencyIntelligence();
    const leakage = await this.getRevenueLeakage(filters);
    const opportunities = await this.getOpportunityMap(filters);
    const actions = await this.getNextBestActions(filters);

    return Promise.resolve({
      todayBusinessState: `Agency revenue momentum is pacing at +29.5% MoM with ₹${(overview.totalRevenueAttributed || 12840000).toLocaleString()} in attributed GMV across 7 active clients and an overall health score of ${overview.overallHealthScore}/100.`,
      whatIsWorking: 'Meta Click-to-WhatsApp (11.1x ROAS) and Google Search Ads are driving record high-intent lead volume with sub-45s first touch SLA.',
      whatIsUnderperforming: 'Proposal stage technical SOC2 security review stalls and evening 6–9 PM chat queue SLA latency at Apex Fitness Club.',
      biggestOpportunity: opportunities[0] ? `${opportunities[0].title} (${opportunities[0].impact})` : 'Scale high-ROAS lookalike campaigns',
      biggestRisk: leakage[0] ? `${leakage[0].leakTitle} (₹${(leakage[0].revenueAtRisk || 0).toLocaleString()} at risk)` : 'Proposal stage stall',
      topActions: actions.slice(0, 3),
      expectedImpact: '+₹2,190,000 projected monthly revenue expansion across top 3 actionable interventions.',
      disclaimer: 'AI-generated summary — Demo Intelligence',
    });
  },

  /**
   * 24. Universal Cross-Entity Search
   */
  async searchIntelligence(query = '') {
    if (!query || !query.trim()) {
      return Promise.resolve({
        clients: [],
        leads: [],
        campaigns: [],
        channels: [],
        insights: [],
        recommendations: [],
        anomalies: [],
        followUps: [],
        templates: [],
        automations: [],
      });
    }

    const q = query.toLowerCase().trim();

    const clients = (intelligenceState.clientIntelligence || []).filter(
      (c) =>
        c.clientName.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.topChannel.toLowerCase().includes(q)
    );

    const leads = (initialMockLeads || []).filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.source?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q)
    ).slice(0, 5);

    const campaigns = (intelligenceState.campaignIntelligence || []).filter(
      (camp) =>
        camp.name.toLowerCase().includes(q) ||
        camp.channel.toLowerCase().includes(q) ||
        camp.clientName.toLowerCase().includes(q)
    );

    const channels = (intelligenceState.channelIntelligence || []).filter(
      (chan) => chan.channel.toLowerCase().includes(q)
    );

    const insights = (intelligenceState.aiInsights || []).filter(
      (ins) =>
        ins.title.toLowerCase().includes(q) ||
        ins.summary.toLowerCase().includes(q) ||
        ins.clientName.toLowerCase().includes(q) ||
        ins.category.toLowerCase().includes(q)
    );

    const recommendations = (intelligenceState.aiRecommendations || []).filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.problem.toLowerCase().includes(q) ||
        r.recommendation.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q)
    );

    const anomalies = (intelligenceState.anomalyIntelligence || []).filter(
      (a) =>
        a.anomalyType.toLowerCase().includes(q) ||
        a.metric.toLowerCase().includes(q) ||
        a.clientName.toLowerCase().includes(q) ||
        a.explanation.toLowerCase().includes(q)
    );

    const followUps = (initialMockFollowUps || []).filter(
      (f) =>
        f.contactName?.toLowerCase().includes(q) ||
        f.reason?.toLowerCase().includes(q)
    ).slice(0, 5);

    const templates = (initialMockWhatsAppTemplates || []).filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    ).slice(0, 5);

    const automations = (initialMockWhatsAppAutomationFlows || []).filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.trigger?.toLowerCase().includes(q)
    ).slice(0, 5);

    return Promise.resolve({
      clients,
      leads,
      campaigns,
      channels,
      insights,
      recommendations,
      anomalies,
      followUps,
      templates,
      automations,
    });
  },

  /**
   * 25. Generate 16-Section Comprehensive Executive Intelligence Report
   */
  async generateExecutiveReport(filters = {}) {
    const snapshot = await this.getUnifiedIntelligenceSnapshot(filters);
    const briefing = await this.getDailyBriefing(filters);
    const summary = await this.generateExecutiveSummary(filters);
    const decisionScore = await this.getExecutiveDecisionScore();

    return Promise.resolve({
      reportId: `AI-REP-${Date.now()}`,
      generatedDate: 'Aug 28, 2026',
      engineStatus: 'AI Intelligence Engine — Demo / API Ready',
      scope: filters.clientId === 'all' || !filters.clientId ? 'Agency-Wide (7 Clients)' : `Client Workspace [${filters.clientId}]`,
      // 16 Structured Sections
      executiveSummary: summary,
      businessHealth: snapshot.health,
      decisionScore,
      clientPortfolio: snapshot.clients,
      marketingPerformance: snapshot.campaigns,
      leadPipeline: snapshot.leads,
      salesPerformance: {
        totalWonDeals: 320,
        winRate: '28.4%',
        avgDealValue: '₹9,370',
      },
      revenueAttribution: snapshot.revenue,
      seoPerformance: snapshot.seo,
      whatsappPerformance: snapshot.whatsapp,
      emailSmsPerformance: snapshot.email,
      teamOperations: snapshot.team,
      anomalies: snapshot.anomalies,
      aiInsights: snapshot.insights,
      recommendations: snapshot.recommendations,
      forecast: snapshot.forecast,
      priorityActionPlan: summary.topActions,
      briefing,
    });
  },

  /**
   * State Mutation Simulation Helpers
   */
  async dismissInsight(id) {
    if (!id) return Promise.resolve(false);
    intelligenceState.aiInsights = intelligenceState.aiInsights.map((ins) =>
      ins.id === id ? { ...ins, status: 'Dismissed' } : ins
    );
    return Promise.resolve(true);
  },

  async snoozeInsight(id) {
    if (!id) return Promise.resolve(false);
    intelligenceState.aiInsights = intelligenceState.aiInsights.map((ins) =>
      ins.id === id ? { ...ins, status: 'Snoozed' } : ins
    );
    return Promise.resolve(true);
  },

  async completeRecommendation(id) {
    if (!id) return Promise.resolve(false);
    intelligenceState.aiRecommendations = intelligenceState.aiRecommendations.map((rec) =>
      rec.id === id ? { ...rec, status: 'Completed' } : rec
    );
    return Promise.resolve(true);
  },

  async dismissRecommendation(id) {
    if (!id) return Promise.resolve(false);
    intelligenceState.aiRecommendations = intelligenceState.aiRecommendations.map((rec) =>
      rec.id === id ? { ...rec, status: 'Dismissed' } : rec
    );
    return Promise.resolve(true);
  },

  async resolveAnomaly(id) {
    if (!id) return Promise.resolve(false);
    intelligenceState.anomalyIntelligence = intelligenceState.anomalyIntelligence.map((a) =>
      a.id === id ? { ...a, status: 'Resolved' } : a
    );
    return Promise.resolve(true);
  },

  /**
   * 26. Action Orchestration & Lifecycle Methods (Step 5)
   */
  async getActionQueue(filters = {}) {
    return aiActionOrchestrator.getActionQueue(filters);
  },

  async getActionById(id) {
    return aiActionOrchestrator.getActionById(id);
  },

  async createAction(data) {
    return aiActionOrchestrator.createAction(data);
  },

  async previewAction(id) {
    return aiActionOrchestrator.previewAction(id);
  },

  async approveAction(id) {
    return aiActionOrchestrator.approveAction(id);
  },

  async rejectAction(id, reason) {
    return aiActionOrchestrator.rejectAction(id, reason);
  },

  async executeAction(id, payload) {
    return aiActionOrchestrator.executeAction(id, payload);
  },

  async rollbackAction(id) {
    return aiActionOrchestrator.rollbackAction(id);
  },

  async snoozeAction(id, duration) {
    return aiActionOrchestrator.snoozeAction(id, duration);
  },

  async getActionHistory(filters = {}) {
    return aiActionOrchestrator.getActionHistory(filters);
  },

  async getExecutionLogs(filters = {}) {
    return aiActionOrchestrator.getActionHistory(filters);
  },

  async getActivityStream(filters = {}) {
    return aiActionOrchestrator.getActivityStream(filters);
  },

  async getPendingApprovals(filters = {}) {
    return aiActionOrchestrator.getPendingApprovals(filters);
  },
};

export default aiIntelligenceService;
