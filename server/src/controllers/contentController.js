/**
 * Content Management & Editorial Controller
 * Task 8 & 18: REST Controller with RBAC for Multi-Tenant Content Command Center
 */

import { contentService } from '../services/contentService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage content.');
  }
}

function checkApprovalPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Manager or Admin role required to approve/reject content.');
  }
}

export async function listContent(req, res, next) {
  try {
    const filters = {
      clientId: req.query.clientId,
      socialAccountId: req.query.socialAccountId,
      campaignId: req.query.campaignId,
      platform: req.query.platform,
      format: req.query.format,
      status: req.query.status,
      editorialStatus: req.query.editorialStatus,
      searchIntent: req.query.searchIntent,
      primaryKeyword: req.query.primaryKeyword,
      search: req.query.search,
    };
    const content = await contentService.listContent(req.agencyId, filters);
    const kpis = contentService.calculateContentKPIs(content);
    return sendSuccess(res, { content, kpis });
  } catch (err) {
    next(err);
  }
}

export async function getCalendar(req, res, next) {
  try {
    const filters = {
      clientId: req.query.clientId,
      socialAccountId: req.query.socialAccountId,
      campaignId: req.query.campaignId,
      platform: req.query.platform,
      format: req.query.format,
      status: req.query.status,
      editorialStatus: req.query.editorialStatus,
    };
    const events = await contentService.getCalendar(req.agencyId, filters);
    return sendSuccess(res, { events });
  } catch (err) {
    next(err);
  }
}

export async function getContentById(req, res, next) {
  try {
    const item = await contentService.getContentById(req.params.id, req.agencyId);
    return sendSuccess(res, { content: item });
  } catch (err) {
    next(err);
  }
}

export async function createContent(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const created = await contentService.createContent(req.body, req.agencyId, req.user);
    return sendSuccess(res, { content: created }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateContent(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const updated = await contentService.updateContent(req.params.id, req.body, req.agencyId, req.user);
    return sendSuccess(res, { content: updated });
  } catch (err) {
    next(err);
  }
}

export async function saveBrief(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const updated = await contentService.saveBrief(req.params.id, req.body, req.agencyId, req.user);
    return sendSuccess(res, { content: updated });
  } catch (err) {
    next(err);
  }
}

export async function saveSeoMetadata(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const updated = await contentService.saveSeoMetadata(req.params.id, req.body, req.agencyId, req.user);
    return sendSuccess(res, { content: updated });
  } catch (err) {
    next(err);
  }
}

export async function submitReview(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const updated = await contentService.submitForReview(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, { content: updated });
  } catch (err) {
    next(err);
  }
}

export async function scheduleContent(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { scheduledAt } = req.body || {};
    const scheduled = await contentService.scheduleContent(req.params.id, scheduledAt, req.agencyId, req.user);
    return sendSuccess(res, { content: scheduled });
  } catch (err) {
    next(err);
  }
}

export async function approveContent(req, res, next) {
  try {
    checkApprovalPermissions(req.user.role);
    const approved = await contentService.approveContent(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, { content: approved });
  } catch (err) {
    next(err);
  }
}

export async function rejectContent(req, res, next) {
  try {
    checkApprovalPermissions(req.user.role);
    const { reason } = req.body || {};
    const rejected = await contentService.rejectContent(req.params.id, reason, req.agencyId, req.user);
    return sendSuccess(res, { content: rejected });
  } catch (err) {
    next(err);
  }
}

export async function archiveContent(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const result = await contentService.archiveContent(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function deleteContent(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const result = await contentService.archiveContent(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export const contentController = {
  listContent,
  getCalendar,
  getContentById,
  createContent,
  updateContent,
  saveBrief,
  saveSeoMetadata,
  submitReview,
  scheduleContent,
  approveContent,
  rejectContent,
  archiveContent,
  deleteContent,
};

export default contentController;

