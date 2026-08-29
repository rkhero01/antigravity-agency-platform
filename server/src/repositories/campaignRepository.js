/**
 * Campaign Repository with Performance Metrics & Multi-Tenant Scoping
 * Task 6: Paid Media Campaigns Data Access Layer
 */

import { BaseRepository } from './baseRepository.js';
import { clientRepository } from './clientRepository.js';
import { socialAccountRepository } from './socialAccountRepository.js';
import { metricsUtils } from '../utils/metrics.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors.js';

export const CAMPAIGN_PLATFORMS = ['META', 'GOOGLE', 'LINKEDIN', 'TIKTOK', 'TWITTER'];
export const CAMPAIGN_STATUSES = ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
export const CAMPAIGN_OBJECTIVES = [
  'LEAD_GENERATION',
  'CONVERSIONS',
  'TRAFFIC',
  'BRAND_AWARENESS',
  'CATALOG_SALES',
  'ENGAGEMENT',
  'APP_PROMOTION',
];

export class CampaignRepository extends BaseRepository {
  constructor() {
    super('Campaign');
  }

  /**
   * List campaigns for a tenant with filtering and enriched relations
   */
  async list(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    const { clientId, platform, status, objective, search } = filters;
    const all = await this.findMany({ agencyId });

    let filtered = all.filter((c) => !c.deletedAt);

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((c) => c.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      const pUpper = platform.toUpperCase();
      filtered = filtered.filter((c) => (c.platform || '').toUpperCase() === pUpper);
    }

    if (status && status !== 'all') {
      const sUpper = status.toUpperCase();
      filtered = filtered.filter((c) => (c.status || '').toUpperCase() === sUpper);
    }

    if (objective && objective !== 'all') {
      const oUpper = objective.toUpperCase();
      filtered = filtered.filter((c) => (c.objective || '').toUpperCase() === oUpper);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((c) => {
        const name = (c.name || '').toLowerCase();
        const obj = (c.objective || '').toLowerCase();
        const ext = (c.externalCampaignId || '').toLowerCase();
        return name.includes(q) || obj.includes(q) || ext.includes(q);
      });
    }

    // Attach client details
    const clients = await clientRepository.findMany({ agencyId });
    const clientMap = new Map(clients.map((cl) => [cl.id, cl.clientName]));

    // Attach social accounts details if linked
    const socialAccounts = await socialAccountRepository.findMany({ agencyId });
    const socialMap = new Map(socialAccounts.map((sa) => [sa.id, sa.accountName]));

    return filtered.map((c) => ({
      ...c,
      clientName: clientMap.get(c.clientId) || 'Unknown Client',
      socialAccountName: c.socialAccountId ? socialMap.get(c.socialAccountId) || null : null,
    }));
  }

  /**
   * Find single campaign scoped to agency
   */
  async findById(id, agencyId = null) {
    if (!id) return null;
    const campaign = await super.findById(id, agencyId);
    if (!campaign || campaign.deletedAt) return null;

    if (agencyId) {
      if (campaign.clientId) {
        const client = await clientRepository.findById(campaign.clientId, agencyId);
        campaign.clientName = client?.clientName || 'Unknown Client';
      }
      if (campaign.socialAccountId) {
        const social = await socialAccountRepository.findById(campaign.socialAccountId, agencyId);
        campaign.socialAccountName = social?.accountName || null;
      }
    }

    return campaign;
  }

  /**
   * Create campaign with tenant isolation and client verification
   */
  async create(data, agencyId) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required');

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      throw new ValidationError('Campaign name is required (min 2 characters).');
    }

    if (!data.clientId) {
      throw new ValidationError('Client association (clientId) is required.');
    }

    const client = await clientRepository.findById(data.clientId, agencyId);
    if (!client) {
      throw new NotFoundError(`Client "${data.clientId}" not found in this agency.`);
    }

    const platform = (data.platform || 'META').toUpperCase();
    if (!CAMPAIGN_PLATFORMS.includes(platform)) {
      throw new ValidationError(`Invalid platform "${data.platform}". Supported: ${CAMPAIGN_PLATFORMS.join(', ')}`);
    }

    // Verify socialAccountId if provided
    if (data.socialAccountId) {
      const social = await socialAccountRepository.findById(data.socialAccountId, agencyId);
      if (!social) {
        throw new NotFoundError(`Social account connection "${data.socialAccountId}" not found in this agency.`);
      }
    }

    const dailyBudget = data.dailyBudget !== undefined ? Math.max(0, Number(data.dailyBudget) || 0) : 0;
    const totalSpend = data.totalSpend !== undefined ? Math.max(0, Number(data.totalSpend) || 0) : 0;
    const impressions = data.impressions !== undefined ? Math.max(0, parseInt(data.impressions, 10) || 0) : 0;
    const clicks = data.clicks !== undefined ? Math.max(0, parseInt(data.clicks, 10) || 0) : 0;
    const conversions = data.conversions !== undefined ? Math.max(0, parseInt(data.conversions, 10) || 0) : 0;
    const revenue = data.revenue !== undefined ? Math.max(0, Number(data.revenue) || 0) : 0;

    const ctr = metricsUtils.calculateCTR(clicks, impressions);
    const cpc = metricsUtils.calculateCPC(totalSpend, clicks);
    const cpa = metricsUtils.calculateCPA(totalSpend, conversions);
    const roas = metricsUtils.calculateROAS(revenue, totalSpend);

    const payload = {
      agencyId,
      clientId: data.clientId,
      socialAccountId: data.socialAccountId || null,
      platform,
      name: data.name.trim(),
      objective: data.objective ? String(data.objective).toUpperCase().trim() : 'LEAD_GENERATION',
      dailyBudget,
      budgetType: data.budgetType && ['DAILY', 'LIFETIME'].includes(data.budgetType.toUpperCase()) ? data.budgetType.toUpperCase() : 'DAILY',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      externalCampaignId: data.externalCampaignId ? String(data.externalCampaignId).trim() : `ext-camp-${Date.now().toString(36)}`,
      totalSpend,
      impressions,
      clicks,
      conversions,
      revenue,
      metrics: { ctr, cpc, cpa, roas },
      status: data.status && CAMPAIGN_STATUSES.includes(data.status.toUpperCase()) ? data.status.toUpperCase() : 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const created = await super.create(payload, agencyId);
    created.clientName = client.clientName;
    return created;
  }

  /**
   * Update campaign fields
   */
  async update(id, updates, agencyId) {
    if (!id || !agencyId) throw new ValidationError('Campaign ID and agency ID are required');

    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Campaign "${id}" not found.`);
    }

    const safeUpdates = {};

    if (updates.name !== undefined) {
      const name = String(updates.name).trim();
      if (name.length < 2) throw new ValidationError('Campaign name must be at least 2 characters.');
      safeUpdates.name = name;
    }

    if (updates.clientId !== undefined) {
      const client = await clientRepository.findById(updates.clientId, agencyId);
      if (!client) throw new NotFoundError(`Client "${updates.clientId}" not found.`);
      safeUpdates.clientId = updates.clientId;
    }

    if (updates.socialAccountId !== undefined) {
      if (updates.socialAccountId) {
        const social = await socialAccountRepository.findById(updates.socialAccountId, agencyId);
        if (!social) throw new NotFoundError(`Social account "${updates.socialAccountId}" not found.`);
        safeUpdates.socialAccountId = updates.socialAccountId;
      } else {
        safeUpdates.socialAccountId = null;
      }
    }

    if (updates.platform !== undefined) {
      const pUpper = updates.platform.toUpperCase();
      if (!CAMPAIGN_PLATFORMS.includes(pUpper)) {
        throw new ValidationError(`Invalid platform "${updates.platform}".`);
      }
      safeUpdates.platform = pUpper;
    }

    if (updates.objective !== undefined) {
      safeUpdates.objective = String(updates.objective).toUpperCase().trim();
    }

    if (updates.status !== undefined) {
      const sUpper = updates.status.toUpperCase();
      if (!CAMPAIGN_STATUSES.includes(sUpper)) {
        throw new ValidationError(`Invalid status "${updates.status}".`);
      }
      safeUpdates.status = sUpper;
    }

    if (updates.dailyBudget !== undefined) {
      safeUpdates.dailyBudget = Math.max(0, Number(updates.dailyBudget) || 0);
    }

    if (updates.budgetType !== undefined) {
      safeUpdates.budgetType = ['DAILY', 'LIFETIME'].includes(updates.budgetType.toUpperCase())
        ? updates.budgetType.toUpperCase()
        : 'DAILY';
    }

    if (updates.startDate !== undefined) {
      safeUpdates.startDate = updates.startDate ? new Date(updates.startDate) : null;
    }

    if (updates.endDate !== undefined) {
      safeUpdates.endDate = updates.endDate ? new Date(updates.endDate) : null;
    }

    if (updates.externalCampaignId !== undefined) {
      safeUpdates.externalCampaignId = updates.externalCampaignId ? String(updates.externalCampaignId).trim() : null;
    }

    if (updates.totalSpend !== undefined) safeUpdates.totalSpend = Math.max(0, Number(updates.totalSpend) || 0);
    if (updates.impressions !== undefined) safeUpdates.impressions = Math.max(0, parseInt(updates.impressions, 10) || 0);
    if (updates.clicks !== undefined) safeUpdates.clicks = Math.max(0, parseInt(updates.clicks, 10) || 0);
    if (updates.conversions !== undefined) safeUpdates.conversions = Math.max(0, parseInt(updates.conversions, 10) || 0);
    if (updates.revenue !== undefined) safeUpdates.revenue = Math.max(0, Number(updates.revenue) || 0);

    // Recompute metrics safely
    const spend = safeUpdates.totalSpend !== undefined ? safeUpdates.totalSpend : existing.totalSpend;
    const imp = safeUpdates.impressions !== undefined ? safeUpdates.impressions : existing.impressions;
    const clk = safeUpdates.clicks !== undefined ? safeUpdates.clicks : existing.clicks;
    const conv = safeUpdates.conversions !== undefined ? safeUpdates.conversions : existing.conversions;
    const rev = safeUpdates.revenue !== undefined ? safeUpdates.revenue : existing.revenue;

    safeUpdates.metrics = {
      ctr: metricsUtils.calculateCTR(clk, imp),
      cpc: metricsUtils.calculateCPC(spend, clk),
      cpa: metricsUtils.calculateCPA(spend, conv),
      roas: metricsUtils.calculateROAS(rev, spend),
    };

    return await super.update(id, safeUpdates, agencyId);
  }

  /**
   * Archive / soft delete campaign
   */
  async archive(id, agencyId) {
    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Campaign "${id}" not found.`);
    }

    return await super.update(
      id,
      {
        status: 'ARCHIVED',
        deletedAt: new Date(),
      },
      agencyId
    );
  }
}

export const campaignRepository = new CampaignRepository();
export default campaignRepository;
