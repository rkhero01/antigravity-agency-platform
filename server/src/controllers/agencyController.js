/**
 * Agency Management Controller
 * Task 28 — Step 2: Agency Profile & Settings Endpoints
 */

import { agencyRepository } from '../repositories/agencyRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

export async function getAgency(req, res, next) {
  try {
    const agency = await agencyRepository.findById(req.agencyId);
    if (!agency) {
      throw new NotFoundError('Agency tenant record not found.');
    }
    return sendSuccess(res, { agency });
  } catch (err) {
    next(err);
  }
}

export async function patchAgency(req, res, next) {
  try {
    // Only OWNER or ADMIN can mutate agency-level settings
    if (req.user.role !== ROLES.OWNER && req.user.role !== ROLES.ADMIN) {
      throw new AuthorizationError('Insufficient privileges: Only Agency OWNER or ADMIN can update agency settings.');
    }

    const existing = await agencyRepository.findById(req.agencyId);
    if (!existing) {
      throw new NotFoundError('Agency tenant record not found.');
    }

    const { name, domain, plan, status } = req.body || {};
    const updates = {};

    if (name !== undefined) updates.name = String(name).trim();
    if (domain !== undefined) updates.domain = String(domain).trim();
    if (plan !== undefined) updates.plan = String(plan).trim();
    if (status !== undefined) updates.status = String(status).trim();

    // Prevent unauthorized mutation of immutable tenant identifiers
    if (req.body.id && req.body.id !== req.agencyId) {
      throw new ValidationError('Forbidden: Tenant ID is immutable and cannot be altered.');
    }

    const updated = await agencyRepository.update(req.agencyId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'AGENCY',
      entityId: req.agencyId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { agency: updated });
  } catch (err) {
    next(err);
  }
}

export const agencyController = {
  getAgency,
  patchAgency,
};

export default agencyController;
