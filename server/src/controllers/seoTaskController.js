/**
 * SEO Task Management Controller
 * Task 28 — Step 3: SEO Task CRUD
 * Task 16 — Multi-Tenant Scoped SEO Optimization Task Pipeline
 */

import { seoTaskRepository } from '../repositories/seoTaskRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { auditService, AUDIT_ACTIONS } from '../services/auditService.js';
import { parsePaginationParams, paginateArray } from '../utils/pagination.js';
import { validator } from '../utils/validation.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import { ROLES } from '../middleware/auth.js';

const ALLOWED_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ALLOWED_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED'];

function checkMutationPermissions(role) {
  const allowed = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
  if (!allowed.includes(role)) {
    throw new AuthorizationError('Insufficient privileges: Operational role required to manage SEO tasks.');
  }
}

export async function listTasks(req, res, next) {
  try {
    const pagination = parsePaginationParams(req.query);
    const { clientId, priority, status, search } = req.query;

    let tasks = await seoTaskRepository.findMany({}, req.agencyId);

    if (clientId && clientId !== 'all') {
      const client = await clientRepository.findById(clientId, req.agencyId);
      if (!client) {
        throw new AuthorizationError('Tenant isolation violation: Specified client does not belong to your agency.');
      }
      tasks = tasks.filter((t) => t.clientId === clientId);
    }

    if (priority && priority !== 'all') {
      tasks = tasks.filter((t) => t.priority.toUpperCase() === priority.toUpperCase());
    }

    if (status && status !== 'all') {
      tasks = tasks.filter((t) => t.status.toUpperCase() === status.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }

    const result = paginateArray(tasks, pagination);
    return sendSuccess(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const { taskId } = req.params;
    validator.validateId(taskId, 'taskId');

    const task = await seoTaskRepository.findById(taskId, req.agencyId);
    if (!task) {
      const existsInOther = await seoTaskRepository.findById(taskId);
      if (existsInOther) {
        throw new AuthorizationError('Tenant isolation violation: Access to external agency SEO task is strictly prohibited.');
      }
      throw new NotFoundError(`SEO Task with ID "${taskId}" not found.`);
    }

    return sendSuccess(res, { task });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { clientId, keywordId, title, description, assignedTo, priority = 'MEDIUM', dueDate, status = 'TODO', completion = 0, notes } = req.body || {};

    validator.validateId(clientId, 'clientId');
    validator.validateString(title, 'title', 3, 200);

    const client = await clientRepository.findById(clientId, req.agencyId);
    if (!client) {
      throw new AuthorizationError('Tenant isolation violation: Cannot attach SEO task to an external agency client.');
    }

    const validPriority = validator.validateEnum(priority.toUpperCase(), ALLOWED_PRIORITIES, 'priority');
    const validStatus = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');

    const newTask = await seoTaskRepository.create({
      agencyId: req.agencyId,
      clientId,
      keywordId: keywordId ? String(keywordId).trim() : null,
      title: title.trim(),
      description: description ? String(description).trim() : null,
      assignedTo: assignedTo ? String(assignedTo).trim() : req.user.name,
      priority: validPriority,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: validStatus,
      completion: validator.validateNumber(completion, 'completion', 0, 100),
      notes: notes ? String(notes).trim() : null,
    });

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'SEO_TASK',
      entityId: newTask.id,
      before: null,
      after: newTask,
      requestId: req.id,
    });

    return sendSuccess(res, { task: newTask }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { taskId } = req.params;
    validator.validateId(taskId, 'taskId');

    const existing = await seoTaskRepository.findById(taskId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`SEO Task with ID "${taskId}" not found.`);
    }

    const { title, description, assignedTo, priority, dueDate, status, completion, notes } = req.body || {};
    const updates = {};

    if (title !== undefined) updates.title = validator.validateString(title, 'title', 3, 200);
    if (description !== undefined) updates.description = String(description).trim();
    if (assignedTo !== undefined) updates.assignedTo = String(assignedTo).trim();
    if (priority !== undefined) updates.priority = validator.validateEnum(priority.toUpperCase(), ALLOWED_PRIORITIES, 'priority');
    if (dueDate !== undefined) updates.dueDate = new Date(dueDate);
    if (status !== undefined) updates.status = validator.validateEnum(status.toUpperCase(), ALLOWED_STATUSES, 'status');
    if (completion !== undefined) updates.completion = validator.validateNumber(completion, 'completion', 0, 100);
    if (notes !== undefined) updates.notes = String(notes).trim();

    const updated = await seoTaskRepository.update(taskId, updates, req.agencyId);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'SEO_TASK',
      entityId: taskId,
      before: existing,
      after: updated,
      requestId: req.id,
    });

    return sendSuccess(res, { task: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    checkMutationPermissions(req.user.role);
    const { taskId } = req.params;
    validator.validateId(taskId, 'taskId');

    const existing = await seoTaskRepository.findById(taskId, req.agencyId);
    if (!existing) {
      throw new NotFoundError(`SEO Task with ID "${taskId}" not found.`);
    }

    await seoTaskRepository.delete(taskId, req.agencyId, true);

    await auditService.log({
      actorId: req.user.userId,
      agencyId: req.agencyId,
      clientId: existing.clientId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'SEO_TASK',
      entityId: taskId,
      before: existing,
      after: { ...existing, deletedAt: new Date() },
      requestId: req.id,
    });

    return sendSuccess(res, { message: `SEO Task "${existing.title}" removed successfully.` });
  } catch (err) {
    next(err);
  }
}

export const seoTaskController = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default seoTaskController;
