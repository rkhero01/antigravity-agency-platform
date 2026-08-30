/**
 * Automation Execution Repository
 * Task 14 — Phase 6 (Task 6 Phase 3): Persistent Execution Tracking, Retry State & Idempotency
 */

import { BaseRepository } from './baseRepository.js';
import { AuthorizationError, NotFoundError } from '../utils/errors.js';

export class AutomationExecutionRepository extends BaseRepository {
  constructor() {
    super('AutomationExecution');
    this.executionIndex = new Set();
  }

  getExecutionKey(agencyId, eventId, automationId) {
    return `${agencyId}:${eventId}:${automationId}`;
  }

  hasExecution(agencyId, eventId, automationId) {
    if (!eventId || !automationId) return false;
    return this.executionIndex.has(this.getExecutionKey(agencyId, eventId, automationId));
  }

  async list(agencyId, filters = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');
    const { automationId, status, leadId } = filters;
    const all = await this.findMany({ agencyId });

    let filtered = all.filter((e) => !e.deletedAt);

    if (automationId && automationId !== 'all') {
      filtered = filtered.filter((e) => e.automationId === automationId);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((e) => (e.status || '').toUpperCase() === status.toUpperCase());
    }
    if (leadId && leadId !== 'all') {
      filtered = filtered.filter((e) => e.leadId === leadId);
    }

    // Sort descending by startedAt
    filtered.sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));

    return filtered;
  }

  async recordExecution({
    agencyId,
    automationId,
    automationName,
    eventId,
    leadId,
    triggerType,
    actionType,
    status = 'SUCCESS',
    result = {},
    error = null,
    startedAt = new Date(),
    completedAt = new Date(),
    attemptCount = 1,
    failureCategory = null,
    nextRetryAt = null,
    retryHistory = [],
  }) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');

    const key = this.getExecutionKey(agencyId, eventId, automationId);
    if (eventId && automationId) {
      this.executionIndex.add(key);
    }

    const payload = {
      agencyId,
      automationId,
      automationName: automationName || 'Automation Rule',
      eventId: eventId || null,
      leadId: leadId || null,
      triggerType: triggerType || 'LEAD_CREATED',
      actionType: actionType || 'GENERIC',
      status: status.toUpperCase(),
      result: result || {},
      error: error ? String(error) : null,
      attemptCount: attemptCount || 1,
      failureCategory: failureCategory || null,
      nextRetryAt: nextRetryAt ? (nextRetryAt instanceof Date ? nextRetryAt.toISOString() : nextRetryAt) : null,
      retryHistory: retryHistory || [],
      startedAt: startedAt instanceof Date ? startedAt : new Date(startedAt),
      completedAt: completedAt instanceof Date ? completedAt : new Date(completedAt),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    return await this.create(payload, agencyId);
  }

  async updateExecution(id, agencyId, updates = {}) {
    if (!agencyId) throw new AuthorizationError('Agency tenant ID is required.');

    const existing = await this.findById(id, agencyId);
    if (!existing) {
      throw new NotFoundError(`Automation execution "${id}" not found.`);
    }

    const updated = await this.update(id, updates, agencyId);
    return updated;
  }
}

export const automationExecutionRepository = new AutomationExecutionRepository();
export default automationExecutionRepository;
