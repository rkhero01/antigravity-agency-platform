import React from 'react';
import {
  Zap,
  Play,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

export function AutomationRuleCard({
  automation,
  onToggleStatus,
  onTriggerTest,
  onDeleteAutomation,
}) {
  const isActive = automation.status === 'Active';

  return (
    <div className={`automation-rule-card ${isActive ? 'active-rule' : 'paused-rule'}`}>
      {/* Header */}
      <div className="rule-card-header">
        <div className="rule-meta-badges">
          <span className="rule-category-pill">{automation.category}</span>
          <span className="rule-client-scope-pill">🏢 {automation.clientScope}</span>
        </div>

        {/* Toggle Switch */}
        <label className="saas-toggle-switch" title={`Toggle rule ${isActive ? 'off' : 'on'}`}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => onToggleStatus(automation.id)}
          />
          <span className="toggle-slider round" />
        </label>
      </div>

      {/* Title & Description */}
      <div className="rule-info-block">
        <h3 className="rule-card-title">{automation.name}</h3>
        <p className="rule-card-desc">{automation.description}</p>
      </div>

      {/* Visual Trigger -> Action Connector */}
      <div className="rule-flow-connector-box">
        <div className="flow-step-block trigger-step">
          <span className="flow-step-lbl">WHEN EVENT</span>
          <strong className="flow-step-text">{automation.trigger}</strong>
        </div>

        <div className="flow-arrow-icon">
          <ArrowRight size={14} />
        </div>

        <div className="flow-step-block action-step">
          <span className="flow-step-lbl">THEN EXECUTE</span>
          <strong className="flow-step-text">{automation.action}</strong>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="rule-card-footer">
        <div className="rule-exec-stats">
          <span className="exec-count">⚡ {automation.executionsCount} runs</span>
          <span className="exec-time">• Last: {automation.lastRun}</span>
        </div>

        <div className="rule-footer-actions">
          <button
            type="button"
            className="btn-test-run-action"
            onClick={() => onTriggerTest(automation.id)}
            title="Execute simulated test run"
          >
            <Play size={12} />
            <span>Test Run</span>
          </button>

          <button
            type="button"
            className="btn-delete-rule"
            onClick={() => onDeleteAutomation(automation.id)}
            title="Delete rule"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AutomationRuleCard;
