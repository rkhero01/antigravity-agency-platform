/**
 * Client Management CRUD Controller with Tenant Scoping & Pagination
 * Task 28 — Step 2: Client CRUD Foundation
 */

import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

export async function listClients(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { search, status, tier } = req.query;

    let clients = await clientRepository.findMany({}, req.agencyId);

    // Apply search and status filters
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      clients = clients.filter(
        (c) =>
          c.clientName.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.primaryContact?.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      clients = clients.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    if (tier && tier !== 'all') {
      clients = clients.filter((c) => c.tier.toLowerCase() === tier.toLowerCase());
    }

    const result = paginateArray(clients, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getClientById(req, res, next) {
  try {
    const { clientId } = req.params;
    validator.validateId(clientId, 'clientId');

    const client = await clientRepository.findById(clientId, req.agencyId);

    if (!client) {
      const existsInOther = await clientRepository.findById(clientId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency client is strictly prohibited.');
      }
      throw new NotFoundError(`Client with ID "${clientId}" not found.`);
    }

    return sendSuccess(res, { client });
  } catch (err) {
    next(err);
  }
}

export async function createClient(req, res, next) {
  try {
    const { clientName, industry, monthlyRetainer, tier, primaryContact, contactEmail } = req.body || {};

    validator.validateString(clientName, 'clientName', 2, 100);
    validator.validateString(industry, 'industry', 2, 100);

    // CRITICAL SECURITY RULE: agencyId is strictly assigned from authenticated identity
    const clientData = {
      agencyId: req.agencyId,
      clientName: clientName.trim(),
      industry: industry.trim(),
      monthlyRetainer: monthlyRetainer !== undefined ? validator.validateNumber(monthlyRetainer, 'monthlyRetainer', 0) : 0,
      tier: tier ? validator.validateEnum(tier, ['STANDARD', 'GROWTH', 'ENTERPRISE'], 'tier') : 'STANDARD',
      healthScore: 90,
      primaryContact: primaryContact ? String(primaryContact).trim() : null,
      contactEmail: contactEmail ? validator.validateEmail(contactEmail, 'contactEmail') : null,
      status: 'ACTIVE',
    };

    const newClient = await clientRepository.create(clientData);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: newClient.id,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'CLIENT',
      entityId: newClient.id,
      before: null,
      after: newClient,
      requestId: req.id,
    });

    return sendSuccess(res, { client: newClient }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateClient(req, res, next) {
  try {
    const { clientId } = req.params;
    validator.validateId(clientId, 'clientId');

    const existing = await clientRepository.findById(clientId, req.agencyId);
    if (!existing) {
      const existsInOther = await clientRepository.findById(clientId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Cannot update external agency client.');
      }
      throw new NotFoundError(`Client with ID "${clientId}" not found.`);
    }

    const { clientName, industry, monthlyRetainer, tier, healthScore, primaryContact, contactEmail, status } =
      req.body || {};

    const updates = {};
    if (clientName !== undefined) updates.clientName = validator.validateString(clientName, 'clientName', 2, 100);
    if (industry !== undefined) updates.industry = validator.validateString(industry, 'industry', 2, 100);
    if (monthlyRetainer !== undefined) updates.monthlyRetainer = validator.validateNumber(monthlyRetainer, 'monthlyRetainer', 0);
    if (tier !== undefined) updates.tier = validator.validateEnum(tier, ['STANDARD', 'GROWTH', 'ENTERPRISE'], 'tier');
    if (healthScore !== undefined) updates.healthScore = validator.validateNumber(healthScore, 'healthScore', 0, 100);
    if (primaryContact !== undefined) updates.primaryContact = String(primaryContact).trim();
    if (contactEmail !== undefined) updates.contactEmail = validator.validateEmail(contactEmail, 'contactEmail');
    if (status !== undefined) updates.status = validator.validateEnum(status, ['ACTIVE', 'PAUSED', 'INACTIVE'], 'status');

    const updated = await clientRepository.update(clientId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'CLIENT',
      entityId: clientId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { client: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteClient(req, res, next) {
  try {
    const { clientId } = req.params;
    validator.validateId(clientId, 'clientId');

    const existing = await clientRepository.findById(clientId, req.agencyId);
    if (!existing) {
      const existsInOther = await clientRepository.findById(clientId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Cannot delete external agency client.');
      }
      throw new NotFoundError(`Client with ID "${clientId}" not found.`);
    }

    await clientRepository.delete(clientId, req.agencyId, true); // soft deletion

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'CLIENT',
      entityId: clientId,
      before: existing,
      after: { ...existing, deletedAt: new Date() },
      requestId: req.id,
    });

    return sendSuccess(res, { message: `Client "${existing.clientName}" successfully archived.` });
  } catch (err) {
    next(err);
  }
}

export const clientController = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};

export default clientController;
