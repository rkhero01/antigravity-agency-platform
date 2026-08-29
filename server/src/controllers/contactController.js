/**
 * Client Contact Management Controller
 * Task 28 — Step 2: Contact CRUD
 */

import { contactRepository } from '../repositories/contactRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

export async function listContacts(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, search } = req.query;

    let contacts = await contactRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      contacts = contacts.filter((c) => c.clientId === clientId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      contacts = contacts.filter((c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
    }

    const result = paginateArray(contacts, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getContactById(req, res, next) {
  try {
    const { contactId } = req.params;
    validator.validateId(contactId, 'contactId');

    const contact = await contactRepository.findById(contactId, req.agencyId);
    if (!contact) {
      const existsInOther = await contactRepository.findById(contactId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency contact is strictly prohibited.');
      }
      throw new NotFoundError(`Contact with ID "${contactId}" not found.`);
    }

    return sendSuccess(res, { contact });
  } catch (err) {
    next(err);
  }
}

export async function createContact(req, res, next) {
  try {
    const { clientId, name, phone, email, source } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(name, 'name', 2, 100);

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach contact to an external agency client.');
    }

    const newContact = await contactRepository.create({
      agencyId: req.agencyId,
      clientId,
      name: name.trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? validator.validateEmail(email, 'email') : null,
      source: source ? String(source).trim() : 'DIRECT',
      status: 'ACTIVE',
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'CONTACT',
      entityId: newContact.id,
      before: null,
      after: newContact,
      requestId: req.id,
    });

    return sendSuccess(res, { contact: newContact }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req, res, next) {
  try {
    const { contactId } = req.params;
    validator.validateId(contactId, 'contactId');

    const existing = await contactRepository.findById(contactId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Contact with ID "${contactId}" not found.`);
    }

    const { name, phone, email, source, status } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = validator.validateString(name, 'name', 2, 100);
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (email !== undefined) updates.email = validator.validateEmail(email, 'email');
    if (source !== undefined) updates.source = String(source).trim();
    if (status !== undefined) updates.status = validator.validateEnum(status, ['ACTIVE', 'INACTIVE'], 'status');

    const updated = await contactRepository.update(contactId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'CONTACT',
      entityId: contactId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { contact: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteContact(req, res, next) {
  try {
    const { contactId } = req.params;
    validator.validateId(contactId, 'contactId');

    const existing = await contactRepository.findById(contactId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Contact with ID "${contactId}" not found.`);
    }

    await contactRepository.delete(contactId, req.agencyId, true);

    return sendSuccess(res, { message: `Contact "${existing.name}" removed successfully.` });
  } catch (err) {
    next(err);
  }
}

export const contactController = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};

export default contactController;
