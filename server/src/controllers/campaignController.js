/**
 * Campaign Management Controller
 * Task 6: REST Controller with RBAC for Paid Media Campaigns
 */

import { campaignService } from '../services/campaignService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage campaigns.');
  }
}

export async function listCampaigns(req, res, next) {
  try {
    const filters = {
      clientId: req.query.clientId,
      platform: req.query.platform,
      status: req.query.status,
      objective: req.query.objective,
      search: req.query.search,
    };
    const campaigns = await campaignService.listCampaigns(req.agencyId, filters);
    const kpis = campaignService.calculateCampaignKPIs(campaigns);
    return sendSuccess(res, { campaigns, kpis });
  } catch (err) {
    next(err);
  }
}

export async function getCampaignById(req, res, next) {
  try {
    const id = req.params.id || req.params.campaignId;
    const campaign = await campaignService.getCampaign(id, req.agencyId);
    return sendSuccess(res, { campaign });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const created = await campaignService.createCampaign(req.body, req.agencyId, req.user);
    return sendSuccess(res, { campaign: created }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.campaignId;
    const updated = await campaignService.updateCampaign(id, req.body, req.agencyId, req.user);
    return sendSuccess(res, { campaign: updated });
  } catch (err) {
    next(err);
  }
}

export async function archiveCampaign(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.campaignId;
    const result = await campaignService.archiveCampaign(id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export const campaignController = {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  archiveCampaign,
};

export default campaignController;
