/**
 * Production Campaigns & Ads Management Service Layer
 * Task 6: Database-Connected Paid Media Campaigns Management
 */

import { apiClient } from './api/apiClient.js';

export const CAMPAIGN_PLATFORMS = [
  { value: 'META', label: 'Meta Ads (FB & IG)', color: '#1877f2' },
  { value: 'GOOGLE', label: 'Google Ads', color: '#4285f4' },
  { value: 'LINKEDIN', label: 'LinkedIn Ads', color: '#0a66c2' },
  { value: 'TIKTOK', label: 'TikTok Ads', color: '#000000' },
  { value: 'TWITTER', label: 'X (Twitter) Ads', color: '#1da1f2' },
];

export const CAMPAIGN_OBJECTIVES = [
  { value: 'LEAD_GENERATION', label: 'Lead Generation' },
  { value: 'CONVERSIONS', label: 'Direct Conversions' },
  { value: 'TRAFFIC', label: 'Website Traffic' },
  { value: 'BRAND_AWARENESS', label: 'Brand Awareness' },
  { value: 'CATALOG_SALES', label: 'Catalog Sales / E-commerce' },
  { value: 'ENGAGEMENT', label: 'Engagement & Reach' },
  { value: 'APP_PROMOTION', label: 'App Installs' },
];

/**
 * Normalizes PostgreSQL campaign record for UI rendering
 */
export function normalizeCampaign(dbRecord) {
  if (!dbRecord) return null;

  const rawStatus = (dbRecord.status || 'ACTIVE').toUpperCase();
  let statusVariant = 'primary';
  if (rawStatus === 'ACTIVE') statusVariant = 'success';
  else if (rawStatus === 'PAUSED') statusVariant = 'warning';
  else if (rawStatus === 'ARCHIVED' || dbRecord.deletedAt) statusVariant = 'danger';

  const spend = Number(dbRecord.totalSpend) || 0;
  const impressions = parseInt(dbRecord.impressions, 10) || 0;
  const clicks = parseInt(dbRecord.clicks, 10) || 0;
  const conversions = parseInt(dbRecord.conversions, 10) || 0;
  const revenue = Number(dbRecord.revenue) || 0;
  const dailyBudget = Number(dbRecord.dailyBudget) || 0;

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + '%' : '0.00%';
  const cpc = clicks > 0 ? Number((spend / clicks).toFixed(2)) : 0;
  const cpa = conversions > 0 ? Number((spend / conversions).toFixed(2)) : 0;
  const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;

  return {
    id: dbRecord.id,
    agencyId: dbRecord.agencyId,
    clientId: dbRecord.clientId,
    clientName: dbRecord.clientName || 'Assigned Client',
    socialAccountId: dbRecord.socialAccountId || null,
    socialAccountName: dbRecord.socialAccountName || null,
    platform: (dbRecord.platform || 'META').toUpperCase(),
    name: dbRecord.name || 'Unnamed Campaign',
    campaignName: dbRecord.name || 'Unnamed Campaign',
    title: dbRecord.name || 'Unnamed Campaign',
    objective: dbRecord.objective || 'LEAD_GENERATION',
    primaryGoal: dbRecord.objective || 'LEAD_GENERATION',
    status: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase(),
    statusRaw: rawStatus,
    statusVariant,
    dailyBudget,
    budget: `$${dailyBudget.toLocaleString()}/day`,
    budgetType: dbRecord.budgetType || 'DAILY',
    startDate: dbRecord.startDate,
    endDate: dbRecord.endDate,
    externalCampaignId: dbRecord.externalCampaignId || 'ext-unassigned',
    spend,
    totalSpend: spend,
    impressions,
    clicks,
    conversions,
    leads: conversions,
    revenue,
    metrics: {
      ctr,
      cpc,
      cpa,
      roas,
    },
    ctr,
    cpc: `$${cpc}`,
    roas: `${roas}x`,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  };
}

/**
 * Maps form input to backend payload
 */
export function toDbCampaignPayload(formData = {}) {
  return {
    clientId: formData.clientId,
    socialAccountId: formData.socialAccountId || null,
    platform: (formData.platform || 'META').toUpperCase(),
    name: String(formData.name || formData.campaignName || formData.title || '').trim(),
    objective: formData.objective || formData.primaryGoal || 'LEAD_GENERATION',
    dailyBudget: formData.dailyBudget !== undefined ? Number(formData.dailyBudget) : Number(formData.budget) || 0,
    budgetType: formData.budgetType || 'DAILY',
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
    externalCampaignId: formData.externalCampaignId || null,
    status: formData.status ? formData.status.toUpperCase() : 'ACTIVE',
  };
}

export const campaignsService = {
  /**
   * Fetch all campaigns from live API
   */
  async getCampaigns(filters = {}) {
    const params = {};
    if (filters.clientId && filters.clientId !== 'all') params.clientId = filters.clientId;
    if (filters.platform && filters.platform !== 'all') params.platform = filters.platform;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.objective && filters.objective !== 'all') params.objective = filters.objective;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    const response = await apiClient.campaigns.list(params);
    const rawList = Array.isArray(response.data?.campaigns)
      ? response.data.campaigns
      : Array.isArray(response.data)
      ? response.data
      : [];

    return rawList.map(normalizeCampaign);
  },

  /**
   * Get single campaign by ID
   */
  async getCampaignById(id) {
    if (!id) return null;
    const response = await apiClient.campaigns.get(id);
    const raw = response.data?.campaign || response.data;
    return normalizeCampaign(raw);
  },

  /**
   * Create new campaign in database
   */
  async createCampaign(data) {
    const payload = toDbCampaignPayload(data);
    const response = await apiClient.campaigns.create(payload);
    const raw = response.data?.campaign || response.data;
    return normalizeCampaign(raw);
  },

  /**
   * Update existing campaign
   */
  async updateCampaign(id, updates) {
    if (!id) throw new Error('Campaign ID is required');
    const payload = toDbCampaignPayload(updates);
    const response = await apiClient.campaigns.update(id, payload);
    const raw = response.data?.campaign || response.data;
    return normalizeCampaign(raw);
  },

  /**
   * Archive / soft-delete campaign
   */
  async archiveCampaign(id) {
    if (!id) throw new Error('Campaign ID is required');
    const response = await apiClient.campaigns.delete(id);
    return response.data;
  },

  /**
   * Calculate live KPI metrics from database records
   */
  calculateCampaignKPIs(campaignsList = []) {
    const total = campaignsList.length;
    const active = campaignsList.filter((c) => (c.statusRaw || c.status).toUpperCase() === 'ACTIVE').length;
    const totalSpend = campaignsList.reduce((acc, c) => acc + (Number(c.spend || c.totalSpend) || 0), 0);
    const totalRevenue = campaignsList.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
    const totalConversions = campaignsList.reduce((acc, c) => acc + (Number(c.conversions || c.leads) || 0), 0);
    const totalDailyBudget = campaignsList.reduce((acc, c) => acc + (Number(c.dailyBudget) || 0), 0);

    const roas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;

    return {
      total,
      active,
      totalSpend,
      totalRevenue,
      totalConversions,
      totalDailyBudget,
      roas,
    };
  },
};

export const campaignService = campaignsService;
export const adsService = campaignsService;
export default campaignsService;
