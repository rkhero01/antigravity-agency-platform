/**
 * Agency Contract Management Controller
 * Task 28 — Step 3: Contract Lifecycle CRUD
 */

import { contractRepository } from '../repositories/contractRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError, ConflictError, ValidationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

const ALLOWED_STATUSES = ['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_RENEWAL'];
const ALLOWED_CYCLES = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'];
const CONTRACT_MANAGERS = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER];

export async function listContracts(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, status, billingCycle, search } = req.query;

    let contracts = await contractRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      contracts = contracts.filter((c) => c.clientId === clientId);
    }

    if (status && status !== 'all') {
      contracts = contracts.filter((c) => c.status.toUpperCase() === status.toUpperCase());
    }

    if (billingCycle && billingCycle !== 'all') {
      contracts = contracts.filter((c) => c.billingCycle.toUpperCase() === billingCycle.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      contracts = contracts.filter(
        (c) => c.contractNumber.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
      );
    }

    const result = paginateArray(contracts, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getContractById(req, res, next) {
  try {
    const { contractId } = req.params;
    validator.validateId(contractId, 'contractId');

    const contract = await contractRepository.findById(contractId, req.agencyId);
    if (!contract) {
      const existsInOther = await contractRepository.findById(contractId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency contract is strictly prohibited.');
      }
      throw new NotFoundError(`Contract with ID "${contractId}" not found.`);
    }

    return sendSuccess(res, { contract });
  } catch (err) {
    next(err);
  }
}

export async function createContract(req, res, next) {
  try {
    if (!CONTRACT_MANAGERS.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER, ADMIN, or MANAGER can create agency contracts.');
    }

    const { clientId, contractNumber, title, startDate, endDate, value, billingCycle = 'MONTHLY', status = 'ACTIVE', renewalDate, notes } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(contractNumber, 'contractNumber', 3, 50);
    validator.validateString(title, 'title', 2, 150);

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach contract to an external agency client.');
    }

    const existingNum = await contractRepository.findByContractNumber(contractNumber.trim(), req.agencyId);
    if (existingNum) {
      throw new ConflictError(`Contract with number "${contractNumber}" already exists in agency.`);
    }

    const start = new Date(startDate || Date.now());
    const end = new Date(endDate);
    if (isNaN(end.getTime()) || end < start) {
      throw new ValidationError('Contract "endDate" must be a valid date after "startDate".');
    }

    const validCycle = validator.validateEnum(billingCycle.toUpperCase(), ALLOWED_CYCLES, 'billingCycle');
    const validStatus = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');

    const newContract = await contractRepository.create({
      agencyId: req.agencyId,
      clientId,
      contractNumber: contractNumber.trim(),
      title: title.trim(),
      startDate: start,
      endDate: end,
      value: validator.validateNumber(value, 'value', 0),
      billingCycle: validCycle,
      status: validStatus,
      renewalDate: renewalDate ? new Date(renewalDate) : null,
      notes: notes ? String(notes).trim() : null,
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'CONTRACT',
      entityId: newContract.id,
      before: null,
      after: newContract,
      requestId: req.id,
    });

    return sendSuccess(res, { contract: newContract }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateContract(req, res, next) {
  try {
    if (!CONTRACT_MANAGERS.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER, ADMIN, or MANAGER can update agency contracts.');
    }

    const { contractId } = req.params;
    validator.validateId(contractId, 'contractId');

    const existing = await contractRepository.findById(contractId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Contract with ID "${contractId}" not found.`);
    }

    const { title, value, billingCycle, status, endDate, renewalDate, notes } = req.body || {};
    const updates = {};

    if (title !== undefined) updates.title = validator.validateString(title, 'title', 2, 150);
    if (value !== undefined) updates.value = validator.validateNumber(value, 'value', 0);
    if (billingCycle !== undefined) updates.billingCycle = validator.validateEnum(billingCycle.toUpperCase(), ALLOWED_CYCLES, 'billingCycle');
    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');
    if (endDate !== undefined) {
      const end = new Date(endDate);
      if (isNaN(end.getTime()) || end < new Date(existing.startDate)) {
        throw new ValidationError('Contract "endDate" must be after "startDate".');
      }
      updates.endDate = end;
    }
    if (renewalDate !== undefined) updates.renewalDate = new Date(renewalDate);
    if (notes !== undefined) updates.notes = String(notes).trim();

    const updated = await contractRepository.update(contractId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'CONTRACT',
      entityId: contractId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { contract: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteContract(req, res, next) {
  try {
    if (req.user.role !== ROLES.OWNER && req.user.role !== ROLES.ADMIN) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER or ADMIN can delete contracts.');
    }

    const { contractId } = req.params;
    validator.validateId(contractId, 'contractId');

    const existing = await contractRepository.findById(contractId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Contract with ID "${contractId}" not found.`);
    }

    await contractRepository.delete(contractId, req.agencyId, true);

    return sendSuccess(res, { message: `Contract "${existing.contractNumber}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
}

export const contractController = {
  listContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
};

export default contractController;
