import { initialMockCampaigns, mockAdsRecommendations, mockAdsPerformanceTimeseries } from '../data/mockAds.js';

let campaignsState = [...initialMockCampaigns];
let recommendationsState = [...mockAdsRecommendations];

export const adsService = {
  /**
   * Fetch all campaigns with optional filtering
   */
  async getCampaigns(filters = {}) {
    const { clientId, platform, status, search } = filters;

    let filtered = [...campaignsState];

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      filtered = filtered.filter((c) => c.platform.toLowerCase() === platform.toLowerCase());
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.campaignName.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.objective.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single campaign by ID
   */
  async getCampaignById(id) {
    const campaign = campaignsState.find((c) => c.id === id);
    return Promise.resolve(campaign || null);
  },

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    const newCamp = {
      id: `camp-${Date.now()}`,
      status: 'Active',
      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: '0.00%',
      cpc: 0,
      leads: 0,
      cpl: 0,
      conversionRate: '0.00%',
      revenue: 0,
      roas: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-09-30',
      adCreative: {
        headline: campaignData.headline || 'Exclusive Offer for Local Customers',
        primaryText: campaignData.primaryText || 'Experience top-tier service tailored to your goals.',
        mediaUrl: campaignData.mediaUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
      },
      adSets: [
        { name: 'Broad Audience Targeting', spend: 0, leads: 0, cpl: 0, roas: 0 },
      ],
      ...campaignData,
    };

    campaignsState = [newCamp, ...campaignsState];
    return Promise.resolve(newCamp);
  },

  /**
   * Toggle or update campaign status (Active / Paused / Completed)
   */
  async updateCampaignStatus(id, newStatus) {
    campaignsState = campaignsState.map((c) =>
      c.id === id ? { ...c, status: newStatus } : c
    );
    const updated = campaignsState.find((c) => c.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Update daily budget
   */
  async updateCampaignBudget(id, newDailyBudget) {
    campaignsState = campaignsState.map((c) =>
      c.id === id ? { ...c, dailyBudget: Number(newDailyBudget) } : c
    );
    const updated = campaignsState.find((c) => c.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Delete campaign
   */
  async deleteCampaign(id) {
    campaignsState = campaignsState.filter((c) => c.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Time series data for charts
   */
  async getPerformanceTimeSeries(range = '30d') {
    const data = mockAdsPerformanceTimeseries[range] || mockAdsPerformanceTimeseries['30d'];
    return Promise.resolve(data);
  },

  /**
   * AI Recommendations
   */
  async getRecommendations() {
    return Promise.resolve([...recommendationsState]);
  },

  async applyRecommendation(recId) {
    const rec = recommendationsState.find((r) => r.id === recId);
    if (rec && rec.campaignId) {
      if (rec.type === 'scale') {
        campaignsState = campaignsState.map((c) =>
          c.id === rec.campaignId ? { ...c, dailyBudget: c.dailyBudget + 60 } : c
        );
      }
      recommendationsState = recommendationsState.filter((r) => r.id !== recId);
    }
    return Promise.resolve(true);
  },

  /**
   * Compute aggregated metrics
   */
  calculateMetrics(campaigns) {
    const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const totalLeads = campaigns.reduce((acc, c) => acc + (c.leads || 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
    const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);

    const overallRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00';
    const averageCpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : '0.00';
    const averageCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const averageCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00';

    return {
      totalSpend,
      totalRevenue,
      totalLeads,
      overallRoas,
      averageCpl,
      averageCtr,
      averageCpc,
      activeCount: campaigns.filter((c) => c.status === 'Active').length,
      pausedCount: campaigns.filter((c) => c.status === 'Paused').length,
    };
  },
};

export default adsService;
