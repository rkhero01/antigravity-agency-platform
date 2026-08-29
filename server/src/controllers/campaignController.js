/**
 * Paid Media Campaign Management Controller
 * Task 28 — Step 2: Campaign CRUD & Metric Computation
 */

import { campaignRepository } from '../repositories/campaignRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { metricsUtils } from '../utils/metrics.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

const ALLOWED_PLATFORMS = ['META', 'GOOGLE', 'LINKEDIN', 'TWITTER', 'TIKTOK'];

export async function listCampaigns(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, platform, status, search } = req.query;

    let campaigns = await campaignRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      campaigns = campaigns.filter((c) => c.clientId === clientId);
    }

    if (platform && platform !== 'all') {
      campaigns = campaigns.filter((c) => c.platform.toUpperCase() === platform.toUpperCase());
    }

    if (status && status !== 'all') {
      campaigns = campaigns.filter((c) => c.status.toUpperCase() === status.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      campaigns = campaigns.filter((c) => c.name.toLowerCase().includes(q));
    }

    const result = paginateArray(campaigns, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getCampaignById(req, res, next) {
  try {
    const { campaignId } = req.params;
    validator.validateId(campaignId, 'campaignId');

    const campaign = await campaignRepository.findById(campaignId, req.agencyId);
    if (!campaign) {
      const existsInOther = await campaignRepository.findById(campaignId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency campaign is strictly prohibited.');
      }
      throw new NotFoundError(`Campaign with ID "${campaignId}" not found.`);
    }

    return sendSuccess(res, { campaign });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req, res, next) {
  try {
    const { clientId, platform, name, objective, dailyBudget, status } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(name, 'name', 2, 120);
    const validPlatform = validator.validateEnum(platform?.toUpperCase(), ALLOWED_PLATFORMS, 'platform');

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach campaign to an external agency client.');
    }

    const newCampaign = await campaignRepository.create({
      agencyId: req.agencyId,
      clientId,
      platform: validPlatform,
      name: name.trim(),
      objective: objective ? String(objective).trim() : 'LEAD_GENERATION',
      dailyBudget: dailyBudget !== undefined ? validator.validateNumber(dailyBudget, 'dailyBudget', 0) : 1000,
      totalSpend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      metrics: { ctr: 0, cpc: 0, cpa: 0, roas: 0 },
      status: status ? validator.validateEnum(status.toUpperCase(), ['ACTIVE', 'PAUSED', 'COMPLETED'], 'status') : 'ACTIVE',
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'CAMPAIGN',
      entityId: newCampaign.id,
      before: null,
      after: newCampaign,
      requestId: req.id,
    });

    return sendSuccess(res, { campaign: newCampaign }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req, res, next) {
  try {
    const { campaignId } = req.params;
    validator.validateId(campaignId, 'campaignId');

    const existing = await campaignRepository.findById(campaignId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Campaign with ID "${campaignId}" not found.`);
    }

    const { name, dailyBudget, totalSpend, impressions, clicks, conversions, revenue, status } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = validator.validateString(name, 'name', 2, 120);
    if (dailyBudget !== undefined) updates.dailyBudget = validator.validateNumber(dailyBudget, 'dailyBudget', 0);
    if (totalSpend !== undefined) updates.totalSpend = validator.validateNumber(totalSpend, 'totalSpend', 0);
    if (impressions !== undefined) updates.impressions = validator.validateNumber(impressions, 'impressions', 0);
    if (clicks !== undefined) updates.clicks = validator.validateNumber(clicks, 'clicks', 0);
    if (conversions !== undefined) updates.conversions = validator.validateNumber(conversions, 'conversions', 0);
    if (revenue !== undefined) updates.revenue = validator.validateNumber(revenue, 'revenue', 0);
    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ['ACTIVE', 'PAUSED', 'COMPLETED'], 'status');

    // Recompute safe derived metrics
    const spend = updates.totalSpend !== undefined ? updates.totalSpend : existing.totalSpend;
    const imp = updates.impressions !== undefined ? updates.impressions : existing.impressions;
    const clk = updates.clicks !== undefined ? updates.clicks : existing.clicks;
    const conv = updates.conversions !== undefined ? updates.conversions : existing.conversions;
    const rev = updates.revenue !== undefined ? updates.revenue : existing.revenue;

    updates.metrics = {
      ctr: metricsUtils.calculateCTR(clk, imp),
      cpc: metricsUtils.calculateCPC(spend, clk),
      cpa: metricsUtils.calculateCPA(spend, conv),
      roas: metricsUtils.calculateROAS(rev, spend),
    };

    const updated = await campaignRepository.update(campaignId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'CAMPAIGN',
      entityId: campaignId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { campaign: updated });
  } catch (err) {
    next(err);
  }
}

export const campaignController = {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
};

export default campaignController;
