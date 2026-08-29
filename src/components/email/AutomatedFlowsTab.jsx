import React from 'react';
import { Zap, CheckCircle2, ArrowRight, DollarSign, Layers } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AutomatedFlowsTab({
  automations = [],
  onToggleStatus,
}) {
  return (
    <div className="automated-flows-pane">
      <div className="flows-top-banner">
        <Zap size={20} className="text-warning flex-shrink-0" />
        <div>
          <strong className="text-white text-sm block">Automated Event-Triggered Lifecycle Sequences</strong>
          <span className="text-xs text-muted">Intelligent automated flows that trigger instantly based on customer behavioral events (abandoned checkout, high-value orders, customer winback).</span>
        </div>
      </div>

      <div className="flows-cards-list">
        {automations.map((flow) => (
          <div key={flow.id} className="automated-flow-card">
            <div className="flow-header-row">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">⚡ {flow.type}</Badge>
                <span className="flow-client-tag">🏢 {flow.clientName}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`status-pill-small ${flow.status === 'Active' ? 'text-success' : 'text-muted'}`}>
                  {flow.status === 'Active' ? '● Live Automated' : '○ Paused'}
                </span>
                <label className="saas-toggle-switch">
                  <input
                    type="checkbox"
                    checked={flow.status === 'Active'}
                    onChange={() => onToggleStatus(flow.id)}
                  />
                  <span className="toggle-slider round" />
                </label>
              </div>
            </div>

            <h4 className="flow-title">{flow.title}</h4>

            <div className="flow-trigger-box">
              <span className="text-xs text-muted">Behavioral Trigger Event:</span>
              <strong className="text-xs text-cyan block">{flow.trigger}</strong>
            </div>

            <div className="flow-telemetry-grid">
              <div className="ft-block">
                <span className="ft-lbl">Sequence Steps</span>
                <strong className="ft-val text-white">{flow.steps} Emails / SMS</strong>
              </div>
              <div className="ft-block">
                <span className="ft-lbl">Conversion Rate</span>
                <strong className="ft-val text-cyan">{flow.conversionRate}</strong>
              </div>
              <div className="ft-block">
                <span className="ft-lbl">Attributed Revenue</span>
                <strong className="ft-val text-success">{flow.revenueGenerated}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutomatedFlowsTab;
