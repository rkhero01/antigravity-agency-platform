/**
 * Automation Event Dispatcher
 * Task 14 — Phase 6: Production Event-Driven Automation & Action Engine
 */

import { automationRepository } from '../repositories/automationRepository.js';
import { automationExecutionRepository } from '../repositories/automationExecutionRepository.js';
import { actionExecutor } from './automation/actionExecutor.js';
import { auditService } from './auditService.js';

export class AutomationDispatcher {
  /**
   * Dispatch a LEAD_CREATED event to all matching tenant automation workflows
   */
  async dispatchLeadCreated(event = {}) {
    const {
      eventId,
      leadId,
      agencyId,
      clientId,
      campaignId,
      source,
      createdAt = new Date().toISOString(),
    } = event;

    if (!agencyId || !leadId) {
      return {
        dispatched: false,
        reason: 'Missing agencyId or leadId in dispatch payload.',
      };
    }

    // 1. Fetch active rules for the agency
    const activeRules = await automationRepository.list(agencyId, {
      triggerType: 'LEAD_CREATED',
      status: 'ACTIVE',
    });

    const executionResults = [];

    for (const rule of activeRules) {
      // 2. Rule Matching
      // Client scoping check
      if (rule.clientId && rule.clientId !== clientId) {
        continue; // Rule is scoped to a different client workspace
      }

      // Condition: source check
      if (rule.conditions?.source && rule.conditions.source.toUpperCase() !== (source || '').toUpperCase()) {
        continue;
      }

      // Condition: campaign check
      if (rule.conditions?.campaignId && rule.conditions.campaignId !== campaignId) {
        continue;
      }

      // 3. Persistent Idempotency Protection
      const isDuplicate = automationExecutionRepository.hasExecution(agencyId, eventId, rule.id);
      if (isDuplicate) {
        await automationExecutionRepository.recordExecution({
          agencyId,
          automationId: rule.id,
          automationName: rule.name,
          eventId,
          leadId,
          triggerType: 'LEAD_CREATED',
          actionType: 'IDEMPOTENT_CHECK',
          status: 'DUPLICATE',
          result: { message: 'Duplicate automation execution skipped.' },
        });

        executionResults.push({
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'DUPLICATE',
          message: 'Automation execution skipped due to duplicate event delivery.',
        });
        continue;
      }

      // 4. Action Execution via Centralized Action Executor
      const startedAt = new Date();
      let ruleStatus = 'SUCCESS';
      let ruleError = null;
      const actionResults = [];

      for (const action of rule.actions || []) {
        const actionResult = await actionExecutor.executeAction(action, {
          leadId,
          agencyId,
          clientId,
          eventId,
          source,
          ruleId: rule.id,
          ruleName: rule.name,
        });

        actionResults.push(actionResult);

        // Aggregate overall rule status
        if (actionResult.status === 'FAILED') {
          ruleStatus = 'FAILED';
          ruleError = actionResult.error || 'Action execution failure.';
        } else if (actionResult.status === 'NEEDS_REAUTH' && ruleStatus !== 'FAILED') {
          ruleStatus = 'NEEDS_REAUTH';
          ruleError = actionResult.error || 'Provider authorization required.';
        } else if (actionResult.status === 'RATE_LIMITED' && ruleStatus !== 'FAILED') {
          ruleStatus = 'RATE_LIMITED';
          ruleError = actionResult.error || 'Provider rate limit exceeded.';
        } else if (actionResult.status === 'CONFIGURATION_REQUIRED' && ruleStatus === 'SUCCESS') {
          ruleStatus = 'CONFIGURATION_REQUIRED';
        }
      }

      // 5. Record Execution & Update Stats
      const completedAt = new Date();
      await automationExecutionRepository.recordExecution({
        agencyId,
        automationId: rule.id,
        automationName: rule.name,
        eventId,
        leadId,
        triggerType: 'LEAD_CREATED',
        actionType: rule.actions?.[0]?.type || 'MULTI_ACTION',
        status: ruleStatus,
        result: { actions: actionResults },
        error: ruleError,
        startedAt,
        completedAt,
      });

      await automationRepository.recordExecution(rule.id, agencyId);

      executionResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        status: ruleStatus,
        actions: actionResults,
      });
    }

    return {
      dispatched: true,
      matchedRulesCount: executionResults.length,
      executions: executionResults,
    };
  }
}

export const automationDispatcher = new AutomationDispatcher();
export default automationDispatcher;
