/**
 * WhatsApp Automation Management Controller
 * Task 28 — Step 3: WhatsApp Automations CRUD
 * Task 15 — Multi-Tenant Scoped Automation Sequences
 */

import { whatsappAutomationRepository } from '../repositories/whatsappAutomationRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

const ALLOWED_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'];

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage WhatsApp automations.');
  }
}

export async function listAutomations(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { status, clientId, search } = req.query;

    let autos = await whatsappAutomationRepository.findMany({}, req.agencyId);

    if (status && status !== 'all') {
      autos = autos.filter((a) => a.status.toUpperCase() === status.toUpperCase());
    }

    if (clientId && clientId !== 'all') {
      autos = autos.filter((a) => a.clientId === clientId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      autos = autos.filter((a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
    }

    const result = paginateArray(autos, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getAutomationById(req, res, next) {
  try {
    const { automationId } = req.params;
    validator.validateId(automationId, 'automationId');

    const auto = await whatsappAutomationRepository.findById(automationId, req.agencyId);
    if (!auto) {
      const existsInOther = await whatsappAutomationRepository.findById(automationId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency automation is strictly prohibited.');
      }
      throw new NotFoundError(`WhatsApp Automation with ID "${automationId}" not found.`);
    }

    return sendSuccess(res, { automation: auto });
  } catch (err) {
    next(err);
  }
}

export async function createAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { name, description, triggerType, actionType, steps, delayMinutes = 0, conditions, clientId, status = 'ACTIVE' } = req.body || {};

    validator.validateString(name, 'name', 3, 100);
    const validStatus = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');

    if (clientId) {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
    }

    const newAuto = await whatsappAutomationRepository.create({
      agencyId: req.agencyId,
      clientId: clientId || null,
      name: name.trim(),
      description: description ? String(description).trim() : null,
      triggerType: triggerType ? String(triggerType).trim().toUpperCase() : 'KEYWORD_MATCH',
      actionType: actionType ? String(actionType).trim().toUpperCase() : 'SEND_TEMPLATE',
      steps: steps ? (typeof steps === 'string' ? steps : JSON.stringify(steps)) : null,
      delayMinutes: validator.validateNumber(delayMinutes, 'delayMinutes', 0),
      conditions: conditions ? (typeof conditions === 'string' ? conditions : JSON.stringify(conditions)) : null,
      status: validStatus,
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: clientId || null,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'WHATSAPP_AUTOMATION',
      entityId: newAuto.id,
      before: null,
      after: newAuto,
      requestId: req.id,
    });

    return sendSuccess(res, { automation: newAuto }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { automationId } = req.params;
    validator.validateId(automationId, 'automationId');

    const existing = await whatsappAutomationRepository.findById(automationId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`WhatsApp Automation with ID "${automationId}" not found.`);
    }

    const { name, description, triggerType, actionType, steps, delayMinutes, conditions, status } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = validator.validateString(name, 'name', 3, 100);
    if (description !== undefined) updates.description = String(description).trim();
    if (triggerType !== undefined) updates.triggerType = String(triggerType).trim().toUpperCase();
    if (actionType !== undefined) updates.actionType = String(actionType).trim().toUpperCase();
    if (steps !== undefined) updates.steps = typeof steps === 'string' ? steps : JSON.stringify(steps);
    if (delayMinutes !== undefined) updates.delayMinutes = validator.validateNumber(delayMinutes, 'delayMinutes', 0);
    if (conditions !== undefined) updates.conditions = typeof conditions === 'string' ? conditions : JSON.stringify(conditions);
    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');

    const updated = await whatsappAutomationRepository.update(automationId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'WHATSAPP_AUTOMATION',
      entityId: automationId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { automation: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteAutomation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { automationId } = req.params;
    validator.validateId(automationId, 'automationId');

    const existing = await whatsappAutomationRepository.findById(automationId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`WhatsApp Automation with ID "${automationId}" not found.`);
    }

    await whatsappAutomationRepository.delete(automationId, req.agencyId, true);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'WHATSAPP_AUTOMATION',
      entityId: automationId,
      before: existing,
      after: { ...existing, deletedAt: new Date() },
      requestId: req.id,
    });

    return sendSuccess(res, { message: `WhatsApp Automation "${existing.name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
}

export const whatsappAutomationController = {
  listAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
};

export default whatsappAutomationController;
