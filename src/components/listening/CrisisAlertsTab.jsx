import React from 'react';
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function CrisisAlertsTab({
  alerts = [],
  onResolveAlert,
  onOpenAIDialog,
}) {
  const getSeverityBadge = (sev) => {
    if (sev === 'High') return <Badge variant="danger" size="sm">🚨 High Severity</Badge>;
    if (sev === 'Medium') return <Badge variant="warning" size="sm">⚠️ Medium Risk</Badge>;
    return <Badge variant="primary" size="sm">ℹ️ Low Monitoring</Badge>;
  };

  return (
    <div className="crisis-alerts-pane">
      <div className="alerts-top-notice">
        <ShieldAlert size={20} className="text-warning flex-shrink-0" />
        <div>
          <strong className="text-white text-sm block">Automated Sentiment Velocity Anomaly Detection</strong>
          <span className="text-xs text-muted">Antigravity AI continuously detects negative discussion velocity spikes and alerts account leads before brand escalation occurs.</span>
        </div>
      </div>

      <div className="alerts-cards-list">
        {alerts.length === 0 ? (
          <div className="alerts-empty-card">
            <CheckCircle2 size={36} className="text-success" />
            <h4 className="text-white font-bold">Zero PR Crisis Anomalies Detected</h4>
            <p className="text-muted text-xs">All monitored client workspaces are operating within healthy sentiment parameters.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="crisis-alert-card">
              <div className="alert-header-row">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="alert-client-tag">🏢 {alert.clientName}</span>
                </div>
                <span className="alert-velocity-tag">{alert.sentimentTrend}</span>
              </div>

              <h4 className="alert-title">{alert.title}</h4>
              <p className="alert-summary-text">{alert.summary}</p>

              <div className="alert-rec-box">
                <strong className="text-xs text-warning block mb-0.5">Recommended Mitigation Strategy:</strong>
                <span className="text-xs text-white leading-relaxed">{alert.recommendedAction}</span>
              </div>

              <div className="alert-card-footer">
                <span className="text-xs text-muted">Triggered by {alert.mentionsCount} correlated social posts</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-resolve-alert"
                    onClick={() => onResolveAlert(alert.id)}
                  >
                    <CheckCircle2 size={13} />
                    <span>Resolve Alert</span>
                  </button>

                  <button
                    type="button"
                    className="btn-draft-pr-statement"
                    onClick={() => onOpenAIDialog(alert)}
                  >
                    <Sparkles size={13} />
                    <span>Draft AI PR Mitigation</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CrisisAlertsTab;
