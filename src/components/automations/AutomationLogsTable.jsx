import React from 'react';
import { CheckCircle2, Clock, Zap } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AutomationLogsTable({ logs = [] }) {
  return (
    <div className="automation-logs-card">
      <div className="logs-card-header">
        <div className="logs-header-title">
          <Clock size={16} className="text-primary" />
          <span>Real-Time Workflow Execution & Webhook Audit Log</span>
        </div>
        <span className="logs-count-chip">{logs.length} Recent Runs</span>
      </div>

      <div className="logs-table-responsive">
        <table className="saas-table automation-audit-table">
          <thead>
            <tr>
              <th>Automation Rule</th>
              <th>Trigger Event Context</th>
              <th>Action Executed</th>
              <th>Client Scope</th>
              <th>Duration</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted">
                  No execution logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="log-row-item">
                  <td>
                    <strong className="log-rule-name">{log.automationName}</strong>
                  </td>
                  <td>
                    <span className="log-event-text">{log.triggerEvent}</span>
                  </td>
                  <td>
                    <span className="log-action-text text-cyan">{log.actionExecuted}</span>
                  </td>
                  <td>
                    <span className="log-client-text">🏢 {log.clientName}</span>
                  </td>
                  <td>
                    <span className="log-duration-text">{log.duration || '310ms'}</span>
                  </td>
                  <td>
                    <span className="log-time-text">{log.timestamp}</span>
                  </td>
                  <td>
                    <Badge variant="success" size="sm">
                      ✓ {log.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AutomationLogsTable;
