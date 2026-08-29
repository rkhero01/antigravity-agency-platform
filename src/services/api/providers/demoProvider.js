/**
 * Demo / Sandbox Provider Implementation
 * Task 27 — Step 6: Safe in-memory simulation provider
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

import { BaseProvider } from './baseProvider.js';

export class DemoProvider extends BaseProvider {
  constructor() {
    super('DemoProvider', 'DEMO');
  }

  async executeAction(action, payload = {}) {
    const executedAt = new Date().toISOString();
    return Promise.resolve({
      success: true,
      actionId: action.actionId,
      executionState: 'COMPLETED',
      executedAt,
      completedAt: executedAt,
      provider: this.name,
      mode: 'DEMO',
      auditMessage: 'Demo action executed successfully in sandbox. No external API action was performed.',
      rollbackAvailable: true,
      data: {
        affectedRecords: action.recordsAffected || 1,
        beforeState: action.beforeState,
        afterState: action.proposedState,
      },
    });
  }

  async rollbackAction(action) {
    return Promise.resolve({
      success: true,
      actionId: action.actionId,
      executionState: 'ROLLED_BACK',
      provider: this.name,
      mode: 'DEMO',
      restoredState: action.beforeState,
      auditMessage: 'Sandbox state restored successfully. Previous parameters reinstated.',
    });
  }

  async getHealthStatus() {
    return Promise.resolve({
      provider: this.name,
      status: 'Sandbox Active',
      latencyMs: 15,
      availabilityPct: 100,
      mode: 'DEMO',
      lastChecked: new Date().toISOString(),
    });
  }
}

export const demoProvider = new DemoProvider();
export default demoProvider;
