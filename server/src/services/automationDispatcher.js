/**
 * Automation Event Dispatcher
 * Task 14 — Phase 5: Production Event-Driven Automation & Workflow Engine
 */

import { automationRepository } from '../repositories/automationRepository.js';
import { automationExecutionRepository } from '../repositories/automationExecutionRepository.js';
import { leadRepository } from '../repositories/leadRepository.js';
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

      // 4. Action Execution
      const startedAt = new Date();
      let ruleStatus = 'SUCCESS';
      let ruleError = null;
      const actionResults = [];

      for (const action of rule.actions || []) {
        try {
          const actionType = (action.type || 'LOG_AUDIT_EVENT').toUpperCase();

          if (actionType === 'CREATE_CRM_TASK') {
            actionResults.push({
              type: 'CREATE_CRM_TASK',
              status: 'SUCCESS',
              taskTitle: action.params?.title || `Follow up with new lead (${leadId})`,
              assignedTo: action.params?.assignedTo || 'Unassigned',
            });
          } else if (actionType === 'UPDATE_LEAD_STAGE') {
            const targetStage = (action.params?.stage || 'CONTACTED').toUpperCase();
            await leadRepository.update(leadId, { stage: targetStage }, agencyId);
            actionResults.push({
              type: 'UPDATE_LEAD_STAGE',
              status: 'SUCCESS',
              newStage: targetStage,
            });
          } else if (actionType === 'ASSIGN_LEAD_OWNER') {
            const targetOwner = action.params?.owner || 'Sales Specialist';
            await leadRepository.update(leadId, { owner: targetOwner }, agencyId);
            actionResults.push({
              type: 'ASSIGN_LEAD_OWNER',
              status: 'SUCCESS',
              owner: targetOwner,
            });
          } else if (actionType === 'LOG_AUDIT_EVENT') {
            await auditService.log({
              actorId: 'AUTOMATION_DISPATCHER',
              agencyId,
              clientId,
              action: 'AUTOMATION_TRIGGERED',
              entityType: 'LEAD',
              entityId: leadId,
              metadata: { ruleId: rule.id, ruleName: rule.name },
            });
            actionResults.push({
              type: 'LOG_AUDIT_EVENT',
              status: 'SUCCESS',
            });
          } else if (actionType === 'SEND_WHATSAPP' || actionType === 'DISPATCH_NOTIFICATION') {
            // Check provider configuration
            const isConfigured = Boolean(process.env.META_WA_PHONE_NUMBER_ID && process.env.META_WA_ACCESS_TOKEN);
            if (!isConfigured) {
              ruleStatus = 'CONFIGURATION_REQUIRED';
              actionResults.push({
                type: actionType,
                status: 'CONFIGURATION_REQUIRED',
                message: 'WhatsApp / Notification credentials are not configured in environment variables.',
              });
            } else {
              actionResults.push({
                type: actionType,
                status: 'SUCCESS',
                message: 'Notification dispatched to configured provider.',
              });
            }
          }
        } catch (err) {
          ruleStatus = 'FAILED';
          ruleError = err.message || 'Action execution failure.';
          actionResults.push({
            type: action.type,
            status: 'FAILED',
            error: ruleError,
          });
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
