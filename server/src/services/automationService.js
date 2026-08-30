/**
 * Automation Service
 * Task 14 — Phase 5: Business Logic & Access Control for Automation Workflows
 */

import { automationRepository } from '../repositories/automationRepository.js';
import { automationExecutionRepository } from '../repositories/automationExecutionRepository.js';
import { auditService } from './auditService.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

export class AutomationService {
  async listAutomations(agencyId, filters = {}) {
    return await automationRepository.list(agencyId, filters);
  }

  async getAutomation(id, agencyId) {
    const automation = await automationRepository.findById(id, agencyId);
    if (!automation) {
      throw new NotFoundError(`Automation rule "${id}" not found.`);
    }
    return automation;
  }

  async createAutomation(data, agencyId, user) {
    const created = await automationRepository.create(data, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: created.clientId,
      action: 'AUTOMATION_CREATED',
      entityType: 'AUTOMATION_RULE',
      entityId: created.id,
      metadata: { name: created.name, triggerType: created.triggerType },
    });

    return created;
  }

  async updateAutomation(id, updates, agencyId, user) {
    const existing = await this.getAutomation(id, agencyId);
    const updated = await automationRepository.update(id, updates, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'AUTOMATION_UPDATED',
      entityType: 'AUTOMATION_RULE',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async enableAutomation(id, agencyId, user) {
    return await this.updateAutomation(id, { status: 'ACTIVE' }, agencyId, user);
  }

  async disableAutomation(id, agencyId, user) {
    return await this.updateAutomation(id, { status: 'DISABLED' }, agencyId, user);
  }

  async deleteAutomation(id, agencyId, user) {
    const existing = await this.getAutomation(id, agencyId);
    const archived = await automationRepository.archive(id, agencyId);

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: existing.clientId,
      action: 'AUTOMATION_DELETED',
      entityType: 'AUTOMATION_RULE',
      entityId: id,
    });

    return {
      message: `Automation rule "${existing.name}" archived successfully.`,
      automation: archived,
    };
  }

  async listExecutions(agencyId, filters = {}) {
    return await automationExecutionRepository.list(agencyId, filters);
  }

  async getExecution(id, agencyId) {
    const execution = await automationExecutionRepository.findById(id, agencyId);
    if (!execution) {
      throw new NotFoundError(`Automation execution "${id}" not found.`);
    }
    return execution;
  }
}

export const automationService = new AutomationService();
export default automationService;
