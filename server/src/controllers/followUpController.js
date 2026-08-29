/**
 * Follow-Up Management Controller
 * Task 28 — Step 3: Follow-Up System CRUD
 */

import { followUpRepository } from '../repositories/followUpRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

const ALLOWED_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED', 'OVERDUE'];
const ALLOWED_CHANNELS = ['WHATSAPP', 'CALL', 'EMAIL', 'SMS', 'OTHER'];
const ALLOWED_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export async function listFollowUps(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, status, channel, priority } = req.query;

    let items = await followUpRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      items = items.filter((f) => f.clientId === clientId);
    }

    if (status && status !== 'all') {
      items = items.filter((f) => f.status.toUpperCase() === status.toUpperCase());
    }

    if (channel && channel !== 'all') {
      items = items.filter((f) => f.channel.toUpperCase() === channel.toUpperCase());
    }

    if (priority && priority !== 'all') {
      items = items.filter((f) => f.priority.toUpperCase() === priority.toUpperCase());
    }

    const result = paginateArray(items, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getFollowUpById(req, res, next) {
  try {
    const { followUpId } = req.params;
    validator.validateId(followUpId, 'followUpId');

    const followUp = await followUpRepository.findById(followUpId, req.agencyId);
    if (!followUp) {
      const existsInOther = await followUpRepository.findById(followUpId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency follow-up is strictly prohibited.');
      }
      throw new NotFoundError(`Follow-up with ID "${followUpId}" not found.`);
    }

    return sendSuccess(res, { followUp });
  } catch (err) {
    next(err);
  }
}

export async function createFollowUp(req, res, next) {
  try {
    const { clientId, leadId, contactId, conversationId, assignedTo, contactPhone, scheduledAt, note, channel = 'WHATSAPP', priority = 'MEDIUM' } = req.body || {};

    validator.validateId(clientId, 'clientId');

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach follow-up to an external agency client.');
    }

    const validChannel = validator.validateEnum(channel.toUpperCase(), ALLOWED_CHANNELS, 'channel');
    const validPriority = validator.validateEnum(priority.toUpperCase(), ALLOWED_PRIORITIES, 'priority');

    const newFollowUp = await followUpRepository.create({
      agencyId: req.agencyId,
      clientId,
      leadId: leadId ? String(leadId).trim() : null,
      contactId: contactId ? String(contactId).trim() : null,
      conversationId: conversationId ? String(conversationId).trim() : null,
      assignedTo: assignedTo ? String(assignedTo).trim() : req.user.name,
      contactPhone: contactPhone ? String(contactPhone).trim() : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      note: note ? String(note).trim() : null,
      channel: validChannel,
      status: 'PENDING',
      priority: validPriority,
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'FOLLOW_UP',
      entityId: newFollowUp.id,
      before: null,
      after: newFollowUp,
      requestId: req.id,
    });

    return sendSuccess(res, { followUp: newFollowUp }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateFollowUp(req, res, next) {
  try {
    const { followUpId } = req.params;
    validator.validateId(followUpId, 'followUpId');

    const existing = await followUpRepository.findById(followUpId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Follow-up with ID "${followUpId}" not found.`);
    }

    const { status, scheduledAt, note, channel, priority, assignedTo } = req.body || {};
    const updates = {};

    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');
    if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
    if (note !== undefined) updates.note = String(note).trim();
    if (channel !== undefined) updates.channel = validator.validateEnum(channel.toUpperCase(), ALLOWED_CHANNELS, 'channel');
    if (priority !== undefined) updates.priority = validator.validateEnum(priority.toUpperCase(), ALLOWED_PRIORITIES, 'priority');
    if (assignedTo !== undefined) updates.assignedTo = String(assignedTo).trim();

    const updated = await followUpRepository.update(followUpId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'FOLLOW_UP',
      entityId: followUpId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { followUp: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteFollowUp(req, res, next) {
  try {
    const { followUpId } = req.params;
    validator.validateId(followUpId, 'followUpId');

    const existing = await followUpRepository.findById(followUpId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Follow-up with ID "${followUpId}" not found.`);
    }

    await followUpRepository.delete(followUpId, req.agencyId, true);

    return sendSuccess(res, { message: `Follow-up #${followUpId} deleted successfully.` });
  } catch (err) {
    next(err);
  }
}

export const followUpController = {
  listFollowUps,
  getFollowUpById,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
};

export default followUpController;
