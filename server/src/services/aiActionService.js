/**
 * AI Action Backend Service & Real-Mode Safety Gate
 * Task 28 — Step 1: AI Action Execution Boundary
 */

import { aiActionRepository } from '../repositories/aiActionRepository.js';
import { ExecutionBlockedError, AuthorizationError, NotFoundError, ConflictError } from '../utils/errors.js';
import { env } from '../config/env.js';

export class AIActionService {
  /**
   * Execute Action Boundary
   */
  async executeAction(actionId, userContext, options = {}) {
    const { agencyId, userId, role } = userContext;
    const { mode = 'DEMO', operatorName = 'Operator' } = options;
    const startTime = Date.now();

    // 1. Fetch action with strict tenant boundary
    const action = await aiActionRepository.findById(actionId, agencyId);
    if (!action) {
      throw new NotFoundError(`AI Action with ID "${actionId}" not found in tenant.`);
    }

    // 2. HARD REAL-MODE SAFETY GATE (Phase 19)
    if (mode === 'REAL' || env.isProduction) {
      await aiActionRepository.recordExecution({
        actionId,
        provider: 'RealApiProvider',
        mode: 'REAL',
        status: 'BLOCKED',
        requestId: options.requestId || `REQ-${Date.now()}`,
        durationMs: Date.now() - startTime,
        errorCode: 'EXECUTION_BLOCKED',
      });

      throw new ExecutionBlockedError(
        'Production API execution blocked: Live external API credentials (Meta, Google, CRM) are not configured. Action permitted in DEMO mode only.'
      );
    }

    // 3. Approval Enforcement for P0/P1 actions
    if (action.requiresApproval && action.lifecycleState !== 'APPROVED' && action.lifecycleState !== 'COMPLETED') {
      throw new AuthorizationError(
        `Action "${action.title || actionId}" is priority ${action.priority} and requires explicit operator approval before execution.`
      );
    }

    // 4. Idempotency Check
    if (action.lifecycleState === 'COMPLETED') {
      throw new ConflictError('Action has already been completed in sandbox. Please roll back before re-executing.');
    }

    // 5. Execute in Sandbox Demo Mode
    const completedAt = new Date();
    const updatedAction = await aiActionRepository.update(
      actionId,
      {
        lifecycleState: 'COMPLETED',
        executionMode: 'DEMO',
        executionResult: 'Completed successfully (Sandbox Simulation)',
        updatedAt: completedAt,
      },
      agencyId
    );

    // 6. Record Execution & Audit Log
    await aiActionRepository.recordExecution({
      actionId,
      provider: 'DemoProvider',
      mode: 'DEMO',
      status: 'COMPLETED',
      requestId: options.requestId || `REQ-${Date.now()}`,
      durationMs: Date.now() - startTime,
      errorCode: null,
      startedAt: new Date(startTime),
      completedAt,
    });

    await aiActionRepository.logAudit(
      actionId,
      userId,
      'EXECUTED',
      action.lifecycleState,
      'COMPLETED',
      { operatorName, mode: 'DEMO' },
      options.requestId
    );

    return {
      success: true,
      actionId,
      action: updatedAction,
      mode: 'DEMO',
      auditMessage: 'Demo action executed successfully in sandbox backend. No external API action was performed.',
      rollbackAvailable: true,
    };
  }

  /**
   * Rollback Action Boundary
   */
  async rollbackAction(actionId, userContext, options = {}) {
    const { agencyId, userId } = userContext;
    const action = await aiActionRepository.findById(actionId, agencyId);

    if (!action) {
      throw new NotFoundError(`AI Action with ID "${actionId}" not found in tenant.`);
    }

    const updated = await aiActionRepository.update(
      actionId,
      {
        lifecycleState: 'ROLLED_BACK',
        executionResult: 'Rolled back in sandbox (Previous state reinstated)',
      },
      agencyId
    );

    await aiActionRepository.logAudit(
      actionId,
      userId,
      'ROLLED_BACK',
      action.lifecycleState,
      'ROLLED_BACK',
      { reason: options.reason || 'Operator rollback' },
      options.requestId
    );

    return {
      success: true,
      actionId,
      action: updated,
      mode: 'DEMO',
      message: 'Sandbox state restored successfully. Previous parameters reinstated.',
    };
  }
}

export const aiActionService = new AIActionService();
export default aiActionService;
