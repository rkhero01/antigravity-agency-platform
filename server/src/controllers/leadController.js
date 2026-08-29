/**
 * CRM Lead Management Controller
 * Task 28 — Step 2: Lead Pipeline CRUD
 */

import { leadRepository } from '../repositories/leadRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

const ALLOWED_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST'];

export async function listLeads(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, stage, search } = req.query;

    let leads = await leadRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      // Validate client belongs to user's agency
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      leads = leads.filter((l) => l.clientId === clientId);
    }

    if (stage && stage !== 'all') {
      leads = leads.filter((l) => l.stage.toUpperCase() === stage.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)
      );
    }

    const result = paginateArray(leads, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getLeadById(req, res, next) {
  try {
    const { leadId } = req.params;
    validator.validateId(leadId, 'leadId');

    const lead = await leadRepository.findById(leadId, req.agencyId);
    if (!lead) {
      const existsInOther = await leadRepository.findById(leadId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency lead is strictly prohibited.');
      }
      throw new NotFoundError(`Lead with ID "${leadId}" not found.`);
    }

    return sendSuccess(res, { lead });
  } catch (err) {
    next(err);
  }
}

export async function createLead(req, res, next) {
  try {
    const { clientId, name, company, email, phone, source, stage, owner, value } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(name, 'name', 2, 100);

    // CRITICAL: Verify client belongs to authenticated agency
    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach lead to an external agency client.');
    }

    const newLead = await leadRepository.create({
      agencyId: req.agencyId,
      clientId,
      name: name.trim(),
      company: company ? String(company).trim() : null,
      email: email ? validator.validateEmail(email, 'email') : null,
      phone: phone ? String(phone).trim() : null,
      source: source ? String(source).trim() : 'DIRECT',
      stage: stage ? validator.validateEnum(stage.toUpperCase(), ALLOWED_STAGES, 'stage') : 'NEW',
      owner: owner ? String(owner).trim() : req.user.name,
      value: value !== undefined ? validator.validateNumber(value, 'value', 0) : 0,
      status: 'ACTIVE',
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'LEAD',
      entityId: newLead.id,
      before: null,
      after: newLead,
      requestId: req.id,
    });

    return sendSuccess(res, { lead: newLead }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateLead(req, res, next) {
  try {
    const { leadId } = req.params;
    validator.validateId(leadId, 'leadId');

    const existing = await leadRepository.findById(leadId, req.agencyId);
    if (!existing) {
      const existsInOther = await leadRepository.findById(leadId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Cannot update external agency lead.');
      }
      throw new NotFoundError(`Lead with ID "${leadId}" not found.`);
    }

    const { name, company, email, phone, source, stage, owner, value, status } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = validator.validateString(name, 'name', 2, 100);
    if (company !== undefined) updates.company = String(company).trim();
    if (email !== undefined) updates.email = validator.validateEmail(email, 'email');
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (source !== undefined) updates.source = String(source).trim();
    if (stage !== undefined) updates.stage = validator.validateEnum(stage.toUpperCase(), ALLOWED_STAGES, 'stage');
    if (owner !== undefined) updates.owner = String(owner).trim();
    if (value !== undefined) updates.value = validator.validateNumber(value, 'value', 0);
    if (status !== undefined) updates.status = validator.validateEnum(status, ['ACTIVE', 'ARCHIVED'], 'status');

    const updated = await leadRepository.update(leadId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'LEAD',
      entityId: leadId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { lead: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteLead(req, res, next) {
  try {
    const { leadId } = req.params;
    validator.validateId(leadId, 'leadId');

    const existing = await leadRepository.findById(leadId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Lead with ID "${leadId}" not found.`);
    }

    await leadRepository.delete(leadId, req.agencyId, true);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'LEAD',
      entityId: leadId,
      before: existing,
      after: { ...existing, deletedAt: new Date() },
      requestId: req.id,
    });

    return sendSuccess(res, { message: `Lead "${existing.name}" archived successfully.` });
  } catch (err) {
    next(err);
  }
}

export const leadController = {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};

export default leadController;
