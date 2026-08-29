/**
 * Invoice & Billing Management Controller with Defensive Calculations
 * Task 28 — Step 3: Invoice CRUD & Billing Computations
 */

import { invoiceRepository } from '../repositories/invoiceRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError, ConflictError, ValidationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

const ALLOWED_STATUSES = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'];
const INVOICE_MANAGERS = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER];

export async function listInvoices(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, status, contractId, search } = req.query;

    let invoices = await invoiceRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      invoices = invoices.filter((inv) => inv.clientId === clientId);
    }

    if (contractId && contractId !== 'all') {
      invoices = invoices.filter((inv) => inv.contractId === contractId);
    }

    if (status && status !== 'all') {
      invoices = invoices.filter((inv) => inv.status.toUpperCase() === status.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      invoices = invoices.filter(
        (inv) => inv.invoiceNumber.toLowerCase().includes(q) || inv.notes?.toLowerCase().includes(q)
      );
    }

    const result = paginateArray(invoices, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getInvoiceById(req, res, next) {
  try {
    const { invoiceId } = req.params;
    validator.validateId(invoiceId, 'invoiceId');

    const invoice = await invoiceRepository.findById(invoiceId, req.agencyId);
    if (!invoice) {
      const existsInOther = await invoiceRepository.findById(invoiceId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency invoice is strictly prohibited.');
      }
      throw new NotFoundError(`Invoice with ID "${invoiceId}" not found.`);
    }

    return sendSuccess(res, { invoice });
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req, res, next) {
  try {
    if (!INVOICE_MANAGERS.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER, ADMIN, or MANAGER can create invoices.');
    }

    const { clientId, contractId, invoiceNumber, issueDate, dueDate, subtotal, tax = 0, discount = 0, amountPaid = 0, currency = 'INR', status, notes } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(invoiceNumber, 'invoiceNumber', 3, 50);

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach invoice to an external agency client.');
    }

    const existingNum = await invoiceRepository.findByInvoiceNumber(invoiceNumber.trim(), req.agencyId);
    if (existingNum) {
      throw new ConflictError(`Invoice with number "${invoiceNumber}" already exists in agency.`);
    }

    const validSubtotal = validator.validateNumber(subtotal, 'subtotal', 0);
    const validTax = validator.validateNumber(tax, 'tax', 0);
    const validDiscount = validator.validateNumber(discount, 'discount', 0);
    const validAmountPaid = validator.validateNumber(amountPaid, 'amountPaid', 0);

    const calc = invoiceRepository.computeInvoiceTotals(validSubtotal, validTax, validDiscount, validAmountPaid);
    const finalStatus = status ? validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status') : calc.status;

    const newInvoice = await invoiceRepository.create({
      agencyId: req.agencyId,
      clientId,
      contractId: contractId ? String(contractId).trim() : null,
      invoiceNumber: invoiceNumber.trim(),
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subtotal: validSubtotal,
      tax: validTax,
      discount: validDiscount,
      total: calc.total,
      amountPaid: validAmountPaid,
      balanceDue: calc.balanceDue,
      currency: String(currency).trim().toUpperCase(),
      status: finalStatus,
      notes: notes ? String(notes).trim() : null,
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'INVOICE',
      entityId: newInvoice.id,
      before: null,
      after: newInvoice,
      requestId: req.id,
    });

    return sendSuccess(res, { invoice: newInvoice }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req, res, next) {
  try {
    if (!INVOICE_MANAGERS.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER, ADMIN, or MANAGER can update invoices.');
    }

    const { invoiceId } = req.params;
    validator.validateId(invoiceId, 'invoiceId');

    const existing = await invoiceRepository.findById(invoiceId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Invoice with ID "${invoiceId}" not found.`);
    }

    const { subtotal, tax, discount, amountPaid, dueDate, status, notes } = req.body || {};
    const updates = {};

    if (dueDate !== undefined) updates.dueDate = new Date(dueDate);
    if (notes !== undefined) updates.notes = String(notes).trim();

    const finalSub = subtotal !== undefined ? validator.validateNumber(subtotal, 'subtotal', 0) : existing.subtotal;
    const finalTax = tax !== undefined ? validator.validateNumber(tax, 'tax', 0) : existing.tax;
    const finalDisc = discount !== undefined ? validator.validateNumber(discount, 'discount', 0) : existing.discount;
    const finalPaid = amountPaid !== undefined ? validator.validateNumber(amountPaid, 'amountPaid', 0) : existing.amountPaid;

    updates.subtotal = finalSub;
    updates.tax = finalTax;
    updates.discount = finalDisc;
    updates.amountPaid = finalPaid;

    const calc = invoiceRepository.computeInvoiceTotals(finalSub, finalTax, finalDisc, finalPaid);
    updates.total = calc.total;
    updates.balanceDue = calc.balanceDue;

    if (status !== undefined) {
      updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');
    } else {
      updates.status = calc.status;
    }

    const updated = await invoiceRepository.update(invoiceId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'INVOICE',
      entityId: invoiceId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { invoice: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteInvoice(req, res, next) {
  try {
    if (req.user.role !== ROLES.OWNER && req.user.role !== ROLES.ADMIN) {
      throw new AuthorizationError('Insufficient privileges: Only OWNER or ADMIN can delete invoices.');
    }

    const { invoiceId } = req.params;
    validator.validateId(invoiceId, 'invoiceId');

    const existing = await invoiceRepository.findById(invoiceId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`Invoice with ID "${invoiceId}" not found.`);
    }

    await invoiceRepository.delete(invoiceId, req.agencyId, true);

    return sendSuccess(res, { message: `Invoice "${existing.invoiceNumber}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
}

export const invoiceController = {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};

export default invoiceController;
