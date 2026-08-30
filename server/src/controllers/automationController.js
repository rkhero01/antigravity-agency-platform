/**
 * Automation Controller
 * Task 14 — Phase 6: REST Endpoints with RBAC for Automation Workflows & Action Testing
 */

import { automationService } from '../services/automationService.js';
import { sendSuccess } from '../utils/response.js';
import { AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage automation workflows.');
  }
}

export async function listAutomations(req, res, next) {
  try {
    const automations = await automationService.listAutomations(req.agencyId, req.query);
    return sendSuccess(res, { automations });
  } catch (err) {
    next(err);
  }
}

export async function getAutomationById(req, res, next) {
  try {
    const id = req.params.id || req.params.automationId;
    const automation = await automationService.getAutomation(id, req.agencyId);
    return sendSuccess(res, { automation });
  } catch (err) {
    next(err);
  }
}

export async function createAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const created = await automationService.createAutomation(req.body, req.agencyId, req.user);
    return sendSuccess(res, { automation: created }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.automationId;
    const updated = await automationService.updateAutomation(id, req.body, req.agencyId, req.user);
    return sendSuccess(res, { automation: updated });
  } catch (err) {
    next(err);
  }
}

export async function enableAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.automationId;
    const enabled = await automationService.enableAutomation(id, req.agencyId, req.user);
    return sendSuccess(res, { automation: enabled });
  } catch (err) {
    next(err);
  }
}

export async function disableAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.automationId;
    const disabled = await automationService.disableAutomation(id, req.agencyId, req.user);
    return sendSuccess(res, { automation: disabled });
  } catch (err) {
    next(err);
  }
}

export async function deleteAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.automationId;
    const result = await automationService.deleteAutomation(id, req.agencyId, req.user);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function testAutomationAction(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const id = req.params.id || req.params.automationId;
    const testResult = await automationService.testAction(id, req.body, req.agencyId, req.user);
    return sendSuccess(res, testResult);
  } catch (err) {
    next(err);
  }
}

export async function listExecutions(req, res, next) {
  try {
    const executions = await automationService.listExecutions(req.agencyId, req.query);
    return sendSuccess(res, { executions });
  } catch (err) {
    next(err);
  }
}

export async function getExecutionById(req, res, next) {
  try {
    const id = req.params.id || req.params.executionId;
    const execution = await automationService.getExecution(id, req.agencyId);
    return sendSuccess(res, { execution });
  } catch (err) {
    next(err);
  }
}

export const automationController = {
  listAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  enableAutomation,
  disableAutomation,
  deleteAutomation,
  testAutomationAction,
  listExecutions,
  getExecutionById,
};

export default automationController;
