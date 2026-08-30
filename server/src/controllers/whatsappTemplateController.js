/**
 * WhatsApp Template Management Controller
 * Task 28 — Step 3: WhatsApp Templates CRUD
 * Task 15 — Multi-Tenant Scoped WhatsApp Template Engine
 */

import { whatsappTemplateRepository } from '../repositories/whatsappTemplateRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

const ALLOWED_CATEGORIES = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
const ALLOWED_STATUSES = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'DISABLED'];

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage WhatsApp templates.');
  }
}

export async function listTemplates(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { category, status, clientId, search } = req.query;

    let templates = await whatsappTemplateRepository.findMany({}, req.agencyId);

    if (category && category !== 'all') {
      templates = templates.filter((t) => t.category.toUpperCase() === category.toUpperCase());
    }

    if (status && status !== 'all') {
      templates = templates.filter((t) => t.status.toUpperCase() === status.toUpperCase());
    }

    if (clientId && clientId !== 'all') {
      templates = templates.filter((t) => t.clientId === clientId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      templates = templates.filter((t) => t.name.toLowerCase().includes(q) || t.body.toLowerCase().includes(q));
    }

    const result = paginateArray(templates, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getTemplateById(req, res, next) {
  try {
    const { templateId } = req.params;
    validator.validateId(templateId, 'templateId');

    const template = await whatsappTemplateRepository.findById(templateId, req.agencyId);
    if (!template) {
      const existsInOther = await whatsappTemplateRepository.findById(templateId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency template is strictly prohibited.');
      }
      throw new NotFoundError(`WhatsApp Template with ID "${templateId}" not found.`);
    }

    return sendSuccess(res, { template });
  } catch (err) {
    next(err);
  }
}

export async function createTemplate(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { name, category, language = 'en', body, variables, clientId, status = 'DRAFT' } = req.body || {};

    validator.validateString(name, 'name', 3, 100);
    validator.validateString(body, 'body', 5, 2000);
    const validCat = validator.validateEnum(category?.toUpperCase(), ALLOWED_CATEGORIES, 'category');
    const validStatus = validator.validateEnum(status?.toUpperCase(), ALLOWED_STATUSES, 'status');

    if (clientId) {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
    }

    const newTemplate = await whatsappTemplateRepository.create({
      agencyId: req.agencyId,
      clientId: clientId || null,
      name: name.trim().toLowerCase().replace(/\s+/g, '_'),
      category: validCat,
      language: String(language).trim().toLowerCase(),
      body: body.trim(),
      variables: variables ? (typeof variables === 'string' ? variables : JSON.stringify(variables)) : null,
      status: validStatus,
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: clientId || null,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'WHATSAPP_TEMPLATE',
      entityId: newTemplate.id,
      before: null,
      after: newTemplate,
      requestId: req.id,
    });

    return sendSuccess(res, { template: newTemplate }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTemplate(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { templateId } = req.params;
    validator.validateId(templateId, 'templateId');

    const existing = await whatsappTemplateRepository.findById(templateId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`WhatsApp Template with ID "${templateId}" not found.`);
    }

    const { name, category, body, variables, status } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = validator.validateString(name, 'name', 3, 100).toLowerCase().replace(/\s+/g, '_');
    if (category !== undefined) updates.category = validator.validateEnum(category.toUpperCase(), ALLOWED_CATEGORIES, 'category');
    if (body !== undefined) updates.body = validator.validateString(body, 'body', 5, 2000);
    if (variables !== undefined) updates.variables = typeof variables === 'string' ? variables : JSON.stringify(variables);
    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');

    const updated = await whatsappTemplateRepository.update(templateId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'WHATSAPP_TEMPLATE',
      entityId: templateId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { template: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteTemplate(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { templateId } = req.params;
    validator.validateId(templateId, 'templateId');

    const existing = await whatsappTemplateRepository.findById(templateId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`WhatsApp Template with ID "${templateId}" not found.`);
    }

    await whatsappTemplateRepository.delete(templateId, req.agencyId, true);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'WHATSAPP_TEMPLATE',
      entityId: templateId,
      before: existing,
      after: { ...existing, deletedAt: new Date() },
      requestId: req.id,
    });

    return sendSuccess(res, { message: `WhatsApp Template "${existing.name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
}

export const whatsappTemplateController = {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};

export default whatsappTemplateController;
