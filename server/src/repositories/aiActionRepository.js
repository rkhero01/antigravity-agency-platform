/**
 * AI Action Repository & Idempotency Store
 * Task 28 — Step 1: AI Action Backend Boundary & Audit Store
 */

import { BaseRepository } from './baseRepository.js';
import { ConflictError } from '../utils/errors.js';

export class AIActionRepository extends BaseRepository {
  constructor() {
    super('AIAction');
    this.executions = new Map();
    this.auditLogs = [];
    this.idempotencyIndex = new Map();
  }

  async findByIdempotencyKey(key) {
    const actionId = this.idempotencyIndex.get(key);
    if (!actionId) return null;
    return this.findById(actionId);
  }

  async createActionWithIdempotency(actionData) {
    const { idempotencyKey } = actionData;
    if (idempotencyKey && this.idempotencyIndex.has(idempotencyKey)) {
      throw new ConflictError(`Duplicate execution conflict: Action with idempotency key "${idempotencyKey}" already exists.`);
    }

    const action = await this.create(actionData);
    if (idempotencyKey) {
      this.idempotencyIndex.set(idempotencyKey, action.id);
    }

    await this.logAudit(action.id, actionData.createdBy || 'SYSTEM', 'CREATED', null, action.lifecycleState, {
      title: action.title,
      priority: action.priority,
    });

    return action;
  }

  async logAudit(actionId, actorId, event, oldState, newState, metadata = {}, requestId = null) {
    const auditEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actionId,
      actorId,
      event,
      oldState,
      newState,
      metadata,
      requestId: requestId || `REQ-${Date.now()}`,
      timestamp: new Date(),
    };
    this.auditLogs.push(auditEntry);
    return auditEntry;
  }

  async recordExecution(executionData) {
    const id = `EXEC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const execution = {
      ...executionData,
      id,
      startedAt: executionData.startedAt || new Date(),
      completedAt: executionData.completedAt || new Date(),
    };
    this.executions.set(id, execution);
    return execution;
  }

  async getAuditLogs(actionId) {
    return this.auditLogs.filter((log) => log.actionId === actionId);
  }
}

export const aiActionRepository = new AIActionRepository();
export default aiActionRepository;
