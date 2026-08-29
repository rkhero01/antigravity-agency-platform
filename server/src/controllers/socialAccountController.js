/**
 * Social Account Controller
 * Task 5: REST Endpoints for Social Platform Connection Management
 */

import { socialAccountService } from '../services/socialAccountService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError, ValidationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage social accounts.');
  }
}

export async function listSocialAccounts(req, res, next) {
  try {
    const filters = {
      clientId: req.query.clientId,
      platform: req.query.platform,
      status: req.query.status,
      search: req.query.search,
    };
    const accounts = await socialAccountService.listAccounts(req.agencyId, filters);
    const oauthStatus = socialAccountService.getOAuthStatus();
    return sendSuccess(res, { accounts, oauthStatus });
  } catch (err) {
    next(err);
  }
}

export async function getSocialAccount(req, res, next) {
  try {
    const account = await socialAccountService.getAccount(req.params.id, req.agencyId);
    return sendSuccess(res, { account });
  } catch (err) {
    next(err);
  }
}

export async function connectSocialAccount(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const created = await socialAccountService.connectAccount(req.body, req.agencyId, req.user);
    return sendSuccess(res, { account: created }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateSocialAccount(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const updated = await socialAccountService.updateAccount(req.params.id, req.body, req.agencyId, req.user);
    return sendSuccess(res, { account: updated });
  } catch (err) {
    next(err);
  }
}

export async function reconnectSocialAccount(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const result = await socialAccountService.reconnectAccount(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function disconnectSocialAccount(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const result = await socialAccountService.disconnectAccount(req.params.id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getOAuthStatus(req, res, next) {
  try {
    const oauthStatus = socialAccountService.getOAuthStatus();
    return sendSuccess(res, { oauthStatus });
  } catch (err) {
    next(err);
  }
}

export const socialAccountController = {
  listSocialAccounts,
  getSocialAccount,
  connectSocialAccount,
  updateSocialAccount,
  reconnectSocialAccount,
  disconnectSocialAccount,
  getOAuthStatus,
};

export default socialAccountController;
