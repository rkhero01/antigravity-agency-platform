/**
 * WhatsApp Conversation & Inbox Controller
 * Task 28 — Step 3: WhatsApp Inbox CRUD & Message History
 * Task 15 — Multi-Tenant Scoped Conversation Engine
 */

import { conversationRepository } from '../repositories/conversationRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

const ALLOWED_STATUSES = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage conversations.');
  }
}

export async function listConversations(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, status, assignedTo, search } = req.query;

    let convs = await conversationRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      convs = convs.filter((c) => c.clientId === clientId);
    }

    if (status && status !== 'all') {
      convs = convs.filter((c) => c.status.toUpperCase() === status.toUpperCase());
    }

    if (assignedTo && assignedTo !== 'all') {
      convs = convs.filter((c) => c.assignedTo?.toLowerCase() === assignedTo.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      convs = convs.filter(
        (c) =>
          c.contactName.toLowerCase().includes(q) ||
          c.contactPhone.includes(q) ||
          c.lastMessage?.toLowerCase().includes(q) ||
          c.tags?.toLowerCase().includes(q)
      );
    }

    const result = paginateArray(convs, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getConversationById(req, res, next) {
  try {
    const { conversationId } = req.params;
    validator.validateId(conversationId, 'conversationId');

    const conv = await conversationRepository.findById(conversationId, req.agencyId);
    if (!conv) {
      const existsInOther = await conversationRepository.findById(conversationId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency conversation is strictly prohibited.');
      }
      throw new NotFoundError(`Conversation with ID "${conversationId}" not found.`);
    }

    const messages = await conversationRepository.getMessages(conversationId, req.agencyId);

    return sendSuccess(res, { conversation: conv, messages });
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { clientId, contactId, contactPhone, contactName, channel, assignedTo, tags, initialMessage } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(contactPhone, 'contactPhone', 5, 30);
    validator.validateString(contactName, 'contactName', 2, 100);

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach conversation to an external agency client.');
    }

    const newConv = await conversationRepository.create({
      agencyId: req.agencyId,
      clientId,
      contactId: contactId ? String(contactId).trim() : null,
      contactPhone: contactPhone.trim(),
      contactName: contactName.trim(),
      unreadCount: initialMessage ? 1 : 0,
      channel: channel ? String(channel).trim().toUpperCase() : 'WHATSAPP',
      status: 'OPEN',
      assignedTo: assignedTo ? String(assignedTo).trim() : req.user.name,
      tags: tags ? String(tags).trim() : null,
      lastMessage: initialMessage ? String(initialMessage).trim() : 'Conversation initiated',
      lastMessageAt: new Date(),
    });

    if (initialMessage) {
      await conversationRepository.addMessage({
        agencyId: req.agencyId,
        conversationId: newConv.id,
        direction: 'INBOUND',
        messageType: 'text',
        body: String(initialMessage).trim(),
        status: 'RECEIVED',
      });
    }

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'CONVERSATION',
      entityId: newConv.id,
      before: null,
      after: newConv,
      requestId: req.id,
    });

    return sendSuccess(res, { conversation: newConv }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateConversation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { conversationId } = req.params;
    validator.validateId(conversationId, 'conversationId');

    const existing = await conversationRepository.findById(conversationId, req.agencyId);
    if (!existing) {
      const existsInOther = await conversationRepository.findById(conversationId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Cannot update external agency conversation.');
      }
      throw new NotFoundError(`Conversation with ID "${conversationId}" not found.`);
    }

    const { status, assignedTo, tags, unreadCount } = req.body || {};
    const updates = {};

    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');
    if (assignedTo !== undefined) updates.assignedTo = String(assignedTo).trim();
    if (tags !== undefined) updates.tags = String(tags).trim();
    if (unreadCount !== undefined) updates.unreadCount = validator.validateNumber(unreadCount, 'unreadCount', 0);

    const updated = await conversationRepository.update(conversationId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'CONVERSATION',
      entityId: conversationId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { conversation: updated });
  } catch (err) {
    next(err);
  }
}

export async function addMessage(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { conversationId } = req.params;
    const { body, direction = 'OUTBOUND', messageType = 'text' } = req.body || {};

    validator.validateId(conversationId, 'conversationId');
    validator.validateString(body, 'body', 1, 4000);

    const conv = await conversationRepository.findById(conversationId, req.agencyId);
    if (!conv) {
      throw new NotFoundError(`Conversation with ID "${conversationId}" not found.`);
    }

    const msg = await conversationRepository.addMessage({
      agencyId: req.agencyId,
      conversationId,
      direction: direction.toUpperCase() === 'INBOUND' ? 'INBOUND' : 'OUTBOUND',
      messageType: String(messageType).trim(),
      body: body.trim(),
      status: direction.toUpperCase() === 'INBOUND' ? 'RECEIVED' : 'SENT',
    });

    return sendSuccess(res, { message: msg }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { conversationId } = req.params;
    validator.validateId(conversationId, 'conversationId');

    const existing = await conversationRepository.findById(conversationId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Conversation with ID "${conversationId}" not found.`);
    }

    await conversationRepository.delete(conversationId, req.agencyId, true);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'CONVERSATION',
      entityId: conversationId,
      before: existing,
      after: { ...existing, deletedAt: new Date() },
      requestId: req.id,
    });

    return sendSuccess(res, { message: `Conversation with "${existing.contactName}" successfully closed and archived.` });
  } catch (err) {
    next(err);
  }
}

export const conversationController = {
  listConversations,
  getConversationById,
  createConversation,
  updateConversation,
  addMessage,
  deleteConversation,
};

export default conversationController;
