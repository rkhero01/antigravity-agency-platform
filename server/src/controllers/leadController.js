/**
 * CRM Lead Management Controller
 * Task 7: REST Controller with RBAC for CRM Leads
 */

import { leadService } from '../services/leadService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage CRM leads.');
  }
}

export async function listLeads(req, res, next) {
  try {
    const filters = {
      clientId: req.query.clientId,
      campaignId: req.query.campaignId,
      stage: req.query.stage,
      source: req.query.source,
      owner: req.query.owner,
      search: req.query.search,
    };
    const leads = await leadService.listLeads(req.agencyId, filters);
    const kpis = leadService.calculateLeadKPIs(leads);
    return sendSuccess(res, { leads, kpis });
  } catch (err) {
    next(err);
  }
}

export async function getLeadById(req, res, next) {
  try {
    const id = req.params.id || req.params.leadId;
    const lead = await leadService.getLead(id, req.agencyId);
    return sendSuccess(res, { lead });
  } catch (err) {
    next(err);
  }
}

export async function createLead(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const created = await leadService.createLead(req.body, req.agencyId, req.user);
    return sendSuccess(res, { lead: created }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateLead(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.leadId;
    const updated = await leadService.updateLead(id, req.body, req.agencyId, req.user);
    return sendSuccess(res, { lead: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteLead(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.leadId;
    const result = await leadService.archiveLead(id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export const leadController = {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};

export default leadController;
