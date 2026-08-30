/**
 * Social Publishing & Automation Controller
 * Task 9: REST Controller with RBAC for Social Publishing Queue & Dispatch
 */

import { publishingService } from '../services/publishingService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage publishing queue.');
  }
}

export async function listJobs(req, res, next) {
  try {
    const filters = {
      contentItemId: req.query.contentItemId,
      socialAccountId: req.query.socialAccountId,
      platform: req.query.platform,
      status: req.query.status,
    };
    const jobs = await publishingService.listJobs(req.agencyId, filters);
    const kpis = publishingService.calculatePublishingKPIs(jobs);
    return sendSuccess(res, { jobs, kpis });
  } catch (err) {
    next(err);
  }
}

export async function getQueue(req, res, next) {
  try {
    const all = await publishingService.listJobs(req.agencyId);
    const queue = all.filter((j) => j.status === 'QUEUED' || j.status === 'PUBLISHING');
    return sendSuccess(res, { queue });
  } catch (err) {
    next(err);
  }
}

export async function getFailed(req, res, next) {
  try {
    const all = await publishingService.listJobs(req.agencyId);
    const failed = all.filter((j) => j.status === 'FAILED');
    return sendSuccess(res, { failed });
  } catch (err) {
    next(err);
  }
}

export async function getJobById(req, res, next) {
  try {
    const job = await publishingService.getJobById(req.params.id, req.agencyId);
    return sendSuccess(res, { job });
  } catch (err) {
    next(err);
  }
}

export async function queueJob(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const job = await publishingService.queuePublishJob(req.body, req.agencyId, req.user);
    return sendSuccess(res, { job }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function publishNow(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const result = await publishingService.executePublishJob(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function retryJob(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const result = await publishingService.retryPublishJob(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function cancelJob(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const result = await publishingService.cancelPublishJob(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export const publishingController = {
  listJobs,
  getQueue,
  getFailed,
  getJobById,
  queueJob,
  publishNow,
  retryJob,
  cancelJob,
};

export default publishingController;
