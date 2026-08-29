/**
 * Centralized Audit Logging Service
 * Task 28 — Step 2: Mutation Audit Trail & Security Logging
 */

import { redactSecrets } from '../utils/redaction.js';

let auditStore = [];

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  ACTION_EXECUTION: 'ACTION_EXECUTION',
  ACTION_ROLLBACK: 'ACTION_ROLLBACK',
};

export class AuditService {
  async log(params = {}) {
    const {
      actorId = 'SYSTEM',
      agencyId,
      clientId = null,
      action = AUDIT_ACTIONS.UPDATE,
      entityType = 'UNKNOWN',
      entityId = null,
      before = null,
      after = null,
      requestId = null,
    } = params;

    const auditEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      agencyId,
      clientId,
      action,
      entityType,
      entityId,
      before: redactSecrets(before),
      after: redactSecrets(after),
      requestId: requestId || `REQ-${Date.now()}`,
      createdAt: new Date(),
    };

    auditStore.unshift(auditEntry);
    if (auditStore.length > 500) {
      auditStore = auditStore.slice(0, 500);
    }

    return auditEntry;
  }

  async getAuditLogs(filters = {}, agencyId = null) {
    let logs = [...auditStore];

    if (agencyId) {
      logs = logs.filter((l) => l.agencyId === agencyId);
    }
    if (filters.clientId) {
      logs = logs.filter((l) => l.clientId === filters.clientId);
    }
    if (filters.entityType) {
      logs = logs.filter((l) => l.entityType.toLowerCase() === filters.entityType.toLowerCase());
    }
    if (filters.action) {
      logs = logs.filter((l) => l.action.toLowerCase() === filters.action.toLowerCase());
    }

    return JSON.parse(JSON.stringify(logs));
  }
}

export const auditService = new AuditService();
export default auditService;
