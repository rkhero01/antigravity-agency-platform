/**
 * SEO Rank Tracking & Site Audit Controller
 * Task 17 — Production Live SERP Checks, Site Audit Execution, History & Provider Status
 */

import { rankTrackingService } from '../services/seo/rankTrackingService.js';
import { siteAuditService } from '../services/seo/siteAuditService.js';
import { getSeoProvidersStatus } from '../services/seo/providers/index.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { ROLES } from '../middleware/auth.js';
import { AuthorizationError } from '../utils/errors.js';

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to execute SEO rank checks and site audits.');
  }
}

export async function checkRank(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const keywordId = req.params.keywordId || req.body.keywordId;
    validator.validateId(keywordId, 'keywordId');

    const { provider = 'DATAFORSEO' } = req.body || {};

    const result = await rankTrackingService.checkKeywordRank(keywordId, req.agencyId, {
      providerName: provider,
      actorId: req.user.userId,
      requestId: req.id,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getRankHistory(req, res, next) {
  try {
    const { keywordId } = req.params;
    validator.validateId(keywordId, 'keywordId');

    const history = await rankTrackingService.getRankHistory(keywordId, req.agencyId);
    return sendSuccess(res, { history });
  } catch (err) {
    next(err);
  }
}

export async function runSiteAudit(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { url, clientId, autoCreateTasks } = req.body || {};
    validator.validateString(url, 'url', 5, 500);

    const result = await siteAuditService.runAudit(url.trim(), req.agencyId, {
      clientId,
      actorId: req.user.userId,
      autoCreateTasks: Boolean(autoCreateTasks),
      requestId: req.id,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getAuditHistory(req, res, next) {
  try {
    const history = await siteAuditService.getAuditHistory(req.agencyId);
    return sendSuccess(res, { history });
  } catch (err) {
    next(err);
  }
}

export async function getProvidersStatus(req, res, next) {
  try {
    const status = await getSeoProvidersStatus();
    return sendSuccess(res, { providers: status });
  } catch (err) {
    next(err);
  }
}

export const seoRankController = {
  checkRank,
  getRankHistory,
  runSiteAudit,
  getAuditHistory,
  getProvidersStatus,
};

export default seoRankController;
