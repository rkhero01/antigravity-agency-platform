/**
 * Automation Service
 * Task 14 — Phase 6 (Task 6 Phase 3): Business Logic, Access Control, Action Testing & Retry Execution
 */

import { automationRepository } from '../repositories/automationRepository.js';
import { automationExecutionRepository } from '../repositories/automationExecutionRepository.js';
import { actionExecutor } from './automation/actionExecutor.js';
import { retryPolicy, RETRY_CATEGORIES } from './automation/retryPolicy.js';
import { auditService } from './auditService.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';

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

  async testAction(id, testPayload = {}, agencyId, user) {
    const rule = await this.getAutomation(id, agencyId);

    if (testPayload.confirmed !== true) {
      throw new ValidationError('Explicit confirmation (confirmed: true) is required to execute a manual action test.');
    }

    const leadId = testPayload.leadId || null;
    const actionResults = [];

    for (const action of rule.actions || []) {
      const result = await actionExecutor.executeAction(action, {
        leadId,
        agencyId,
        clientId: rule.clientId,
        eventId: `MANUAL_TEST_${Date.now()}`,
        source: 'MANUAL_TEST',
        ruleId: rule.id,
        ruleName: rule.name,
      });
      actionResults.push(result);
    }

    await auditService.log({
      actorId: user.userId,
      agencyId,
      clientId: rule.clientId,
      action: 'AUTOMATION_TEST_EXECUTED',
      entityType: 'AUTOMATION_RULE',
      entityId: rule.id,
      metadata: { actionCount: actionResults.length },
    });

    return {
      success: true,
      ruleId: rule.id,
      ruleName: rule.name,
      results: actionResults,
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

  async retryExecution(executionId, agencyId, user) {
    const execution = await this.getExecution(executionId, agencyId);

    if (execution.status === 'SUCCESS') {
      throw new ValidationError('Cannot retry an execution that has already succeeded.');
    }

    if (execution.status === 'DUPLICATE') {
      throw new ValidationError('Cannot retry a duplicate execution.');
    }

    const currentAttempts = execution.attemptCount || 1;
    if (currentAttempts >= 5) {
      throw new ValidationError('Maximum retry attempts (5) exceeded for this execution.');
    }

    // Lookup original rule
    let rule = null;
    if (execution.automationId) {
      try {
        rule = await automationRepository.findById(execution.automationId, agencyId);
      } catch (e) {
        // Fallback
      }
    }

    const actionToRun = rule?.actions?.[0] || { type: execution.actionType };
    const retryResult = await actionExecutor.executeAction(actionToRun, {
      leadId: execution.leadId,
      agencyId,
      eventId: execution.eventId,
      source: 'MANUAL_RETRY',
      ruleId: execution.automationId,
      ruleName: execution.automationName,
    });

    const newAttempts = currentAttempts + 1;
    const historyEntry = {
      attempt: newAttempts,
      executedAt: new Date().toISOString(),
      status: retryResult.status,
      error: retryResult.error || null,
    };

    const updatedExecution = await automationExecutionRepository.updateExecution(
      executionId,
      agencyId,
      {
        status: retryResult.status,
        attemptCount: newAttempts,
        result: { action: retryResult },
        error: retryResult.error || null,
        retryHistory: [...(execution.retryHistory || []), historyEntry],
        completedAt: new Date(),
      }
    );

    await auditService.log({
      actorId: user.userId,
      agencyId,
      action: retryResult.status === 'SUCCESS' ? 'AUTOMATION_RETRY_SUCCEEDED' : 'AUTOMATION_RETRY_FAILED',
      entityType: 'AUTOMATION_EXECUTION',
      entityId: executionId,
      metadata: { attempt: newAttempts, status: retryResult.status },
    });

    return {
      success: retryResult.status === 'SUCCESS',
      status: retryResult.status,
      execution: updatedExecution,
    };
  }
}

export const automationService = new AutomationService();
export default automationService;
