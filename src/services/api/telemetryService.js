/**
 * Execution Telemetry & Observability Layer
 * Task 27 — Step 6: Structured Observability with Secret Redaction
 *
 * Engine Status: "AI Intelligence Engine — Demo / API Ready"
 */

import { redactSecrets } from '../../utils/envConfig.js';

let telemetryLogs = [
  {
    logId: 'TLM-101',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actionId: 'ACT-HIST-101',
    clientId: 'c1',
    provider: 'TeamProvider',
    actionType: 'assignOperator',
    mode: 'DEMO',
    status: 'COMPLETED',
    durationMs: 42,
    requestId: 'REQ-1787940589132',
    errorCode: null,
  },
  {
    logId: 'TLM-100',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    actionId: 'ACT-HIST-100',
    clientId: 'c2',
    provider: 'AdsProvider',
    actionType: 'updateCampaignBudget',
    mode: 'DEMO',
    status: 'COMPLETED',
    durationMs: 65,
    requestId: 'REQ-1787940129481',
    errorCode: null,
  },
];

export const telemetryService = {
  /**
   * Log an execution event
   */
  logExecution(entry = {}) {
    const logId = `TLM-${Date.now()}`;
    const cleanEntry = {
      logId,
      timestamp: new Date().toISOString(),
      actionId: entry.actionId || 'ACT-UNKNOWN',
      clientId: entry.clientId || 'c1',
      provider: entry.provider || 'DemoProvider',
      actionType: entry.actionType || 'directive',
      mode: entry.mode || 'DEMO',
      status: entry.status || 'COMPLETED',
      durationMs: Number(entry.durationMs) || 25,
      requestId: entry.requestId || `REQ-${Date.now()}`,
      errorCode: entry.errorCode || null,
      metadata: redactSecrets(entry.metadata || {}),
    };

    telemetryLogs = [cleanEntry, ...telemetryLogs.slice(0, 49)];
    return cleanEntry;
  },

  /**
   * Get filtered telemetry logs
   */
  getTelemetryLogs(filters = {}) {
    const { clientId = 'all', status = 'all' } = filters;
    let list = [...telemetryLogs];

    if (clientId && clientId !== 'all') {
      list = list.filter((l) => l.clientId === clientId);
    }
    if (status && status !== 'all') {
      list = list.filter((l) => l.status.toLowerCase() === status.toLowerCase());
    }

    return JSON.parse(JSON.stringify(list));
  },
};

export default telemetryService;
