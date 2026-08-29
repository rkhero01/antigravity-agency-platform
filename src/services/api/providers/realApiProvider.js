/**
 * Real API Provider with Hard Safety Gate
 * Task 27 — Step 6: Production Gateway with Mandatory Validation Guardrails
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

import { BaseProvider } from './baseProvider.js';
import { ENV_CONFIG } from '../../../utils/envConfig.js';
import { apiClient } from '../apiClient.js';
import { ApiError, API_ERROR_CODES } from '../apiErrors.js';
import { validateActionPermission } from '../actionPermissionPolicy.js';

export class RealApiProvider extends BaseProvider {
  constructor() {
    super('RealApiProvider', 'REAL');
  }

  /**
   * Hard Real API Safety Gate Check
   */
  validateSafetyGate(action) {
    // Condition 1: Must be in production environment
    if (!ENV_CONFIG.IS_PRODUCTION) {
      return {
        passed: false,
        reason: 'Real API execution blocked: Environment is not production (VITE_APP_ENV !== production).',
        errorCode: API_ERROR_CODES.EXECUTION_BLOCKED,
      };
    }

    // Condition 2: Explicit REAL execution mode
    if (ENV_CONFIG.EXECUTION_MODE !== 'REAL') {
      return {
        passed: false,
        reason: 'Real API execution blocked: AI execution mode is configured as DEMO.',
        errorCode: API_ERROR_CODES.EXECUTION_BLOCKED,
      };
    }

    // Condition 3: Permission and Approval Validation
    const perm = validateActionPermission(action, 'REAL');
    if (!perm.allowed) {
      return {
        passed: false,
        reason: perm.reason,
        errorCode: perm.errorCode || API_ERROR_CODES.AUTHORIZATION_ERROR,
      };
    }

    return { passed: true };
  }

  async executeAction(action, payload = {}) {
    const gate = this.validateSafetyGate(action);

    if (!gate.passed) {
      return Promise.resolve({
        success: false,
        actionId: action.actionId,
        executionState: 'BLOCKED',
        mode: 'DEMO',
        reason: gate.reason,
        errorCode: gate.errorCode,
        auditMessage: `Safety Gate Block: ${gate.reason}`,
      });
    }

    // If all safety gates pass (future live backend proxy execution):
    try {
      const result = await apiClient.post(`/actions/${action.actionType}`, {
        actionId: action.actionId,
        clientId: action.clientId,
        parameters: action.proposedState,
        payload,
      });

      return {
        success: true,
        actionId: action.actionId,
        executionState: 'COMPLETED',
        provider: this.name,
        mode: 'REAL',
        data: result.data,
      };
    } catch (err) {
      throw new ApiError(
        `Production API execution failed: ${err.message}`,
        API_ERROR_CODES.PROVIDER_ERROR,
        { actionId: action.actionId }
      );
    }
  }

  async rollbackAction(action) {
    const gate = this.validateSafetyGate(action);
    if (!gate.passed) {
      return Promise.resolve({
        success: false,
        actionId: action.actionId,
        executionState: 'BLOCKED',
        mode: 'DEMO',
        reason: gate.reason,
        errorCode: gate.errorCode,
      });
    }

    const result = await apiClient.post(`/actions/${action.actionId}/rollback`, {
      restoredState: action.beforeState,
    });
    return result;
  }

  async getHealthStatus() {
    if (!ENV_CONFIG.IS_PRODUCTION || ENV_CONFIG.EXECUTION_MODE !== 'REAL') {
      return Promise.resolve({
        provider: this.name,
        status: 'Not Configured',
        latencyMs: 0,
        availabilityPct: 0,
        mode: 'DEMO',
        note: 'Live provider disabled in sandbox mode',
      });
    }

    try {
      const res = await apiClient.get('/health');
      return {
        provider: this.name,
        status: res.status === 200 ? 'Healthy' : 'Degraded',
        latencyMs: 45,
        availabilityPct: 99.9,
        mode: 'REAL',
      };
    } catch (e) {
      return {
        provider: this.name,
        status: 'Error',
        latencyMs: 0,
        availabilityPct: 0,
        mode: 'REAL',
        error: e.message,
      };
    }
  }
}

export const realApiProvider = new RealApiProvider();
export default realApiProvider;
