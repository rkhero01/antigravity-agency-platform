/**
 * Platform Integrations & OAuth Controller
 * Task 11: REST Handlers for Platform Authentication & Token Synchronization
 */

import { integrationService } from '../services/integrations/integrationService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError, ValidationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkIntegrationMutationPermission(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage external platform integrations.');
  }
}

export async function getProviderStatus(req, res, next) {
  try {
    const status = integrationService.getProviderStatus();
    return sendSuccess(res, { providers: status });
  } catch (err) {
    next(err);
  }
}

export async function initiateConnect(req, res, next) {
  try {
    checkIntegrationMutationPermission(req.user.role);
    const { provider } = req.params;
    const { clientId, redirectUri } = req.query;

    const result = await integrationService.initiateConnect({
      providerName: provider,
      clientId,
      agencyId: req.agencyId,
      user: req.user,
      redirectUri,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function handleCallback(req, res, next) {
  try {
    const { provider } = req.params;
    const { code, state, redirectUri } = req.query;

    if (!code || !state) {
      throw new ValidationError('Missing code or state parameters from OAuth callback.');
    }

    const result = await integrationService.handleCallback({
      providerName: provider,
      code,
      state,
      redirectUri,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function syncAccount(req, res, next) {
  try {
    checkIntegrationMutationPermission(req.user.role);
    const { id } = req.params;
    const result = await integrationService.syncAccount(id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function reconnectAccount(req, res, next) {
  try {
    checkIntegrationMutationPermission(req.user.role);
    const { id } = req.params;
    const { redirectUri } = req.body;

    const result = await integrationService.initiateConnect({
      providerName: req.body.platform || 'META',
      clientId: req.body.clientId,
      agencyId: req.agencyId,
      user: req.user,
      redirectUri,
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function disconnectAccount(req, res, next) {
  try {
    checkIntegrationMutationPermission(req.user.role);
    const { id } = req.params;
    const result = await integrationService.disconnectAccount(id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export const integrationController = {
  getProviderStatus,
  initiateConnect,
  handleCallback,
  syncAccount,
  reconnectAccount,
  disconnectAccount,
};

export default integrationController;
