/**
 * Analytics & Reporting Service
 * Task 10: Multi-Tenant Real-Data Analytics & Safe Metric Calculation
 */

import { analyticsRepository } from '../repositories/analyticsRepository.js';

/**
 * Defensive division helper to prevent NaN and Infinity
 */
function safeDivide(numerator, denominator, multiplier = 1, decimals = 2) {
  const num = Number(numerator) || 0;
  const den = Number(denominator) || 0;
  if (den === 0 || isNaN(num) || isNaN(den)) return 0;
  const val = (num / den) * multiplier;
  return Number(val.toFixed(decimals));
}

export class AnalyticsService {
  /**
   * Executive Overview Analytics
   */
  async getOverview(agencyId, filters = {}) {
    const { range, startDate, endDate, clientId } = filters;
    const data = await analyticsRepository.getTenantData(agencyId, clientId, range, startDate, endDate);

    const { campaigns, leads, content, socialAccounts, publishingJobs, dateWindow } = data;

    // 1. Paid Media Aggregations
    const totalSpend = campaigns.reduce((acc, c) => acc + (Number(c.totalSpend) || 0), 0);
    const totalImpressions = campaigns.reduce((acc, c) => acc + (Number(c.impressions) || 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (Number(c.clicks) || 0), 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + (Number(c.conversions) || 0), 0);
    const campaignRevenue = campaigns.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);

    const ctr = safeDivide(totalClicks, totalImpressions, 100);
    const cpc = safeDivide(totalSpend, totalClicks, 1);
    const roas = safeDivide(campaignRevenue, totalSpend, 1);

    // 2. Lead & CRM Aggregations
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(
      (l) => (l.stage || '').toUpperCase() === 'QUALIFIED' || (l.stage || '').toUpperCase() === 'PROPOSAL_SENT'
    ).length;
    const wonLeads = leads.filter((l) => (l.stage || '').toUpperCase() === 'WON');
    const wonCount = wonLeads.length;
    const lostLeads = leads.filter((l) => (l.stage || '').toUpperCase() === 'LOST').length;

    const wonRevenue = wonLeads.reduce((acc, l) => acc + (Number(l.value) || 0), 0);
    const pipelineValue = leads
      .filter((l) => {
        const s = (l.stage || '').toUpperCase();
        return s !== 'WON' && s !== 'LOST';
      })
      .reduce((acc, l) => acc + (Number(l.value) || 0), 0);

    const totalRevenue = campaignRevenue + wonRevenue;
    const cpl = safeDivide(totalSpend, totalLeads, 1);
    const conversionRate = safeDivide(wonCount, totalLeads, 100);
    const qualificationRate = safeDivide(qualifiedLeads, totalLeads, 100);

    // 3. Content & Publishing Aggregations
    const totalContent = content.length;
    const publishedContent = content.filter(
      (p) => (p.status || '').toUpperCase() === 'PUBLISHED' || (p.statusRaw || '').toUpperCase() === 'PUBLISHED'
    ).length;
    const scheduledContent = content.filter(
      (p) => (p.status || '').toUpperCase() === 'SCHEDULED' || (p.statusRaw || '').toUpperCase() === 'SCHEDULED'
    ).length;
    const failedJobs = publishingJobs.filter((j) => j.status === 'FAILED').length;
    const publishedJobs = publishingJobs.filter((j) => j.status === 'PUBLISHED').length;
    const publishingSuccessRate = safeDivide(publishedJobs, publishingJobs.length, 100);

    // 4. Timeseries Distribution (grouped by day)
    const timeseriesMap = new Map();
    for (let d = new Date(dateWindow.startDate); d <= dateWindow.endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      timeseriesMap.set(dateKey, {
        date: dateKey,
        spend: 0,
        revenue: 0,
        leads: 0,
        content: 0,
      });
    }

    for (const c of campaigns) {
      const k = c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : null;
      if (k && timeseriesMap.has(k)) {
        timeseriesMap.get(k).spend += Number(c.totalSpend) || 0;
        timeseriesMap.get(k).revenue += Number(c.revenue) || 0;
      }
    }

    for (const l of leads) {
      const k = l.createdAt ? new Date(l.createdAt).toISOString().split('T')[0] : null;
      if (k && timeseriesMap.has(k)) {
        timeseriesMap.get(k).leads += 1;
      }
    }

    for (const p of content) {
      const k = p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : null;
      if (k && timeseriesMap.has(k)) {
        timeseriesMap.get(k).content += 1;
      }
    }

    const timeseries = Array.from(timeseriesMap.values());

    return {
      dateWindow,
      summary: {
        totalSpend,
        totalRevenue,
        campaignRevenue,
        wonRevenue,
        roas: `${roas.toFixed(2)}x`,
        roasMultiple: roas,
        totalImpressions,
        totalClicks,
        ctr: `${ctr}%`,
        cpc: `$${cpc.toFixed(2)}`,
        totalLeads,
        qualifiedLeads,
        wonDeals: wonCount,
        lostLeads,
        cpl: `$${cpl.toFixed(2)}`,
        conversionRate: `${conversionRate}%`,
        qualificationRate: `${qualificationRate}%`,
        pipelineValue,
        activeCampaigns: campaigns.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length,
        totalCampaigns: campaigns.length,
        totalContent,
        publishedContent,
        scheduledContent,
        connectedSocialAccounts: socialAccounts.length,
        publishingSuccessRate: `${publishingSuccessRate}%`,
      },
      timeseries,
    };
  }

  /**
   * Detailed Campaign Performance Analytics
   */
  async getCampaignAnalytics(agencyId, filters = {}) {
    const { range, startDate, endDate, clientId, platform } = filters;
    const data = await analyticsRepository.getTenantData(agencyId, clientId, range, startDate, endDate);

    let list = data.campaigns;
    if (platform && platform !== 'all') {
      list = list.filter((c) => (c.platform || '').toUpperCase() === platform.toUpperCase());
    }

    return list.map((c) => {
      const spend = Number(c.totalSpend) || 0;
      const impressions = Number(c.impressions) || 0;
      const clicks = Number(c.clicks) || 0;
      const conversions = Number(c.conversions) || 0;
      const revenue = Number(c.revenue) || 0;

      return {
        id: c.id,
        name: c.name || c.title,
        clientId: c.clientId,
        clientName: c.clientName || 'Assigned Client',
        platform: c.platform,
        status: c.status,
        dailyBudget: Number(c.dailyBudget) || 0,
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        ctr: `${safeDivide(clicks, impressions, 100)}%`,
        cpc: `$${safeDivide(spend, clicks, 1).toFixed(2)}`,
        cpa: `$${safeDivide(spend, conversions, 1).toFixed(2)}`,
        roas: `${safeDivide(revenue, spend, 1).toFixed(2)}x`,
      };
    });
  }

  /**
   * Detailed Lead Pipeline & Attribution Analytics
   */
  async getLeadAnalytics(agencyId, filters = {}) {
    const { range, startDate, endDate, clientId } = filters;
    const data = await analyticsRepository.getTenantData(agencyId, clientId, range, startDate, endDate);

    const { leads, campaigns } = data;
    const total = leads.length;
    const totalSpend = campaigns.reduce((acc, c) => acc + (Number(c.totalSpend) || 0), 0);

    const stageFunnel = {
      NEW: leads.filter((l) => (l.stage || '').toUpperCase() === 'NEW').length,
      CONTACTED: leads.filter((l) => (l.stage || '').toUpperCase() === 'CONTACTED').length,
      QUALIFIED: leads.filter((l) => (l.stage || '').toUpperCase() === 'QUALIFIED').length,
      PROPOSAL_SENT: leads.filter((l) => (l.stage || '').toUpperCase() === 'PROPOSAL_SENT').length,
      WON: leads.filter((l) => (l.stage || '').toUpperCase() === 'WON').length,
      LOST: leads.filter((l) => (l.stage || '').toUpperCase() === 'LOST').length,
    };

    const sourceBreakdown = {};
    for (const l of leads) {
      const src = l.source || 'DIRECT';
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    }

    const wonCount = stageFunnel.WON;
    const wonRevenue = leads
      .filter((l) => (l.stage || '').toUpperCase() === 'WON')
      .reduce((acc, l) => acc + (Number(l.value) || 0), 0);

    const pipelineValue = leads
      .filter((l) => {
        const s = (l.stage || '').toUpperCase();
        return s !== 'WON' && s !== 'LOST';
      })
      .reduce((acc, l) => acc + (Number(l.value) || 0), 0);

    return {
      totalLeads: total,
      stageFunnel,
      sourceBreakdown,
      qualificationRate: `${safeDivide(stageFunnel.QUALIFIED + stageFunnel.PROPOSAL_SENT, total, 100)}%`,
      winRate: `${safeDivide(wonCount, total, 100)}%`,
      cpl: `$${safeDivide(totalSpend, total, 1).toFixed(2)}`,
      pipelineValue,
      wonRevenue,
    };
  }

  /**
   * Detailed Content Performance & Editorial Analytics
   */
  async getContentAnalytics(agencyId, filters = {}) {
    const { range, startDate, endDate, clientId } = filters;
    const data = await analyticsRepository.getTenantData(agencyId, clientId, range, startDate, endDate);

    const { content, publishingJobs } = data;
    const total = content.length;

    const statusCounts = {
      DRAFT: content.filter((p) => (p.status || '').toUpperCase() === 'DRAFT' || (p.statusRaw || '').toUpperCase() === 'DRAFT').length,
      PENDING_APPROVAL: content.filter(
        (p) => (p.status || '').toUpperCase() === 'PENDING_APPROVAL' || (p.statusRaw || '').toUpperCase() === 'PENDING_APPROVAL'
      ).length,
      APPROVED: content.filter((p) => (p.status || '').toUpperCase() === 'APPROVED' || (p.statusRaw || '').toUpperCase() === 'APPROVED').length,
      SCHEDULED: content.filter((p) => (p.status || '').toUpperCase() === 'SCHEDULED' || (p.statusRaw || '').toUpperCase() === 'SCHEDULED').length,
      PUBLISHED: content.filter((p) => (p.status || '').toUpperCase() === 'PUBLISHED' || (p.statusRaw || '').toUpperCase() === 'PUBLISHED').length,
      REJECTED: content.filter((p) => (p.status || '').toUpperCase() === 'REJECTED' || (p.statusRaw || '').toUpperCase() === 'REJECTED').length,
    };

    const formatBreakdown = {};
    for (const p of content) {
      const f = p.format || 'CAROUSEL';
      formatBreakdown[f] = (formatBreakdown[f] || 0) + 1;
    }

    const platformBreakdown = {};
    for (const p of content) {
      const plat = p.platform || 'INSTAGRAM';
      platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1;
    }

    const publishedJobs = publishingJobs.filter((j) => j.status === 'PUBLISHED').length;
    const failedJobs = publishingJobs.filter((j) => j.status === 'FAILED').length;
    const totalJobs = publishingJobs.length;

    return {
      totalContent: total,
      statusCounts,
      formatBreakdown,
      platformBreakdown,
      publishing: {
        totalJobs,
        publishedJobs,
        failedJobs,
        successRate: `${safeDivide(publishedJobs, totalJobs, 100)}%`,
      },
    };
  }

  /**
   * Client-Level Rollup Analytics
   */
  async getClientAnalytics(agencyId, filters = {}) {
    const { range, startDate, endDate } = filters;
    const data = await analyticsRepository.getTenantData(agencyId, null, range, startDate, endDate);

    const { clients, campaigns, leads, content } = data;

    return clients.map((client) => {
      const cCampaigns = campaigns.filter((c) => c.clientId === client.id);
      const cLeads = leads.filter((l) => l.clientId === client.id);
      const cContent = content.filter((p) => p.clientId === client.id);

      const spend = cCampaigns.reduce((acc, c) => acc + (Number(c.totalSpend) || 0), 0);
      const revenue = cCampaigns.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
      const leadsCount = cLeads.length;
      const qualified = cLeads.filter(
        (l) => (l.stage || '').toUpperCase() === 'QUALIFIED' || (l.stage || '').toUpperCase() === 'PROPOSAL_SENT'
      ).length;

      return {
        id: client.id,
        name: client.clientName || client.name,
        industry: client.industry,
        monthlyRetainer: Number(client.monthlyRetainer) || 0,
        activeCampaigns: cCampaigns.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length,
        spend,
        revenue,
        roas: `${safeDivide(revenue, spend, 1).toFixed(2)}x`,
        totalLeads: leadsCount,
        qualifiedLeads: qualified,
        cpl: `$${safeDivide(spend, leadsCount, 1).toFixed(2)}`,
        publishedContent: cContent.filter((p) => (p.status || '').toUpperCase() === 'PUBLISHED').length,
      };
    });
  }

  /**
   * Generate CSV export from performance records
   */
  async generateCsvReport(agencyId, reportType = 'overview', filters = {}) {
    if (reportType === 'clients') {
      const clientsData = await this.getClientAnalytics(agencyId, filters);
      const headers = ['Client Name', 'Industry', 'Monthly Retainer', 'Ad Spend', 'Revenue', 'ROAS', 'Leads', 'Qualified Leads', 'CPL'];
      const rows = clientsData.map((c) => [
        `"${c.name}"`,
        `"${c.industry}"`,
        c.monthlyRetainer,
        c.spend,
        c.revenue,
        c.roas,
        c.totalLeads,
        c.qualifiedLeads,
        c.cpl,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (reportType === 'campaigns') {
      const campData = await this.getCampaignAnalytics(agencyId, filters);
      const headers = ['Campaign Name', 'Client', 'Platform', 'Status', 'Daily Budget', 'Spend', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'Revenue', 'ROAS'];
      const rows = campData.map((c) => [
        `"${c.name}"`,
        `"${c.clientName}"`,
        c.platform,
        c.status,
        c.dailyBudget,
        c.spend,
        c.impressions,
        c.clicks,
        c.ctr,
        c.conversions,
        c.revenue,
        c.roas,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    // Default Overview
    const overview = await this.getOverview(agencyId, filters);
    const s = overview.summary;
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Ad Spend', s.totalSpend],
      ['Total Revenue', s.totalRevenue],
      ['Blended ROAS', s.roas],
      ['Total Inbound Leads', s.totalLeads],
      ['Qualified Leads', s.qualifiedLeads],
      ['Cost Per Lead (CPL)', s.cpl],
      ['Sales Conversion Rate', s.conversionRate],
      ['Active Pipeline Value', s.pipelineValue],
      ['Published Content Items', s.publishedContent],
      ['Active Campaigns', s.activeCampaigns],
    ];
    return [headers.join(','), ...rows.map((r) => `${r[0]},${r[1]}`)].join('\n');
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
