/**
 * Automation Rules Repository
 * Task 14 — Phase 5: Tenant-Scoped Automation Workflows
 */

import { BaseRepository } from './baseRepository.js';
import { clientRepository } from './clientRepository.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors.js';

export const ALLOWED_TRIGGERS = ['LEAD_CREATED', 'STAGE_CHANGED', 'WEBHOOK_RECEIVED'];
export const ALLOWED_ACTION_TYPES = [
  'CREATE_CRM_TASK',
  'UPDATE_LEAD_STAGE',
  'ASSIGN_LEAD_OWNER',
  'LOG_AUDIT_EVENT',
  'DISPATCH_NOTIFICATION',
  'SEND_WHATSAPP',
];

export class AutomationRepository extends BaseRepository {
  constructor() {
    super('AutomationRule');
  }

  async list(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');

    const { clientId, triggerType, status } = filters;
    const all = await this.findMany({ agencyId });

    let filtered = all.filter((a) => !a.deletedAt);

    if (clientId && clientId !== 'all') {
      filtered = filtered.filter((a) => a.clientId === clientId || a.clientId === null);
    }
    if (triggerType && triggerType !== 'all') {
      filtered = filtered.filter((a) => (a.triggerType || '').toUpperCase() === triggerType.toUpperCase());
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((a) => (a.status || '').toUpperCase() === status.toUpperCase());
    }

    return filtered;
  }

  async create(data, agencyId) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      throw new ValidationError('Automation name is required (min 2 characters).');
    }

    const triggerType = (data.triggerType || 'LEAD_CREATED').toUpperCase();
    if (!ALLOWED_TRIGGERS.includes(triggerType)) {
      throw new ValidationError(`Invalid triggerType "${data.triggerType}". Supported: ${ALLOWED_TRIGGERS.join(', ')}`);
    }

    if (data.clientId && data.clientId !== 'all') {
      const client = await clientRepository.findById(data.clientId, agencyId);
      if (!client) {
        throw new NotFoundError(`Client workspace "${data.clientId}" not found in this agency.`);
      }
    }

    const actions = Array.isArray(data.actions) && data.actions.length > 0 ? data.actions : [{ type: 'LOG_AUDIT_EVENT' }];

    const payload = {
      agencyId,
      clientId: data.clientId && data.clientId !== 'all' ? data.clientId : null,
      name: data.name.trim(),
      description: data.description ? String(data.description).trim() : null,
      triggerType,
      conditions: data.conditions || {},
      actions,
      status: data.status === 'DISABLED' ? 'DISABLED' : 'ACTIVE',
      executionCount: 0,
      lastExecutedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    return await super.create(payload, agencyId);
  }

  async update(id, updates, agencyId) {
    if (!id || !agencyId) throw new ValidationError('Automation ID and agency ID are required.');
    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Automation rule "${id}" not found.`);
    }

    const safeUpdates = {};
    if (updates.name !== undefined) {
      const name = String(updates.name).trim();
      if (name.length < 2) throw new ValidationError('Automation name must be at least 2 characters.');
      safeUpdates.name = name;
    }
    if (updates.description !== undefined) {
      safeUpdates.description = updates.description ? String(updates.description).trim() : null;
    }
    if (updates.conditions !== undefined) {
      safeUpdates.conditions = updates.conditions;
    }
    if (updates.actions !== undefined) {
      if (!Array.isArray(updates.actions) || updates.actions.length === 0) {
        throw new ValidationError('Actions must be a non-empty array.');
      }
      safeUpdates.actions = updates.actions;
    }
    if (updates.status !== undefined) {
      const statusUpper = updates.status.toUpperCase();
      if (!['ACTIVE', 'DISABLED'].includes(statusUpper)) {
        throw new ValidationError('Status must be ACTIVE or DISABLED.');
      }
      safeUpdates.status = statusUpper;
    }

    safeUpdates.updatedAt = new Date();
    return await super.update(id, safeUpdates, agencyId);
  }

  async setStatus(id, status, agencyId) {
    return await this.update(id, { status }, agencyId);
  }

  async recordExecution(id, agencyId) {
    const existing = await this.findById(id, agencyId);
    if (existing) {
      existing.executionCount = (existing.executionCount || 0) + 1;
      existing.lastExecutedAt = new Date();
      await super.update(id, {
        executionCount: existing.executionCount,
        lastExecutedAt: existing.lastExecutedAt,
      }, agencyId);
    }
  }

  async archive(id, agencyId) {
    const existing = await this.findById(id, agencyId);
    if (!existing) throw new NotFoundError(`Automation rule "${id}" not found.`);
    return await super.update(id, { deletedAt: new Date(), status: 'DISABLED' }, agencyId);
  }
}

export const automationRepository = new AutomationRepository();
export default automationRepository;
