import React from 'react';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function NotificationsSettingsTab({ data = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="settings-tab-content-pane">
      {/* Card 1: Email Alert Channels */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Mail size={18} />
          </div>
          <div>
            <h3 className="section-title">Email Notification Triggers</h3>
            <p className="section-desc">Configure automated operational and approval alert emails sent to agency staff</p>
          </div>
        </div>

        <div className="settings-form-grid-two">
          <div
            className={`perm-toggle-row ${data.emailPostApproval ? 'enabled' : ''}`}
            onClick={() => handleChange('emailPostApproval', !data.emailPostApproval)}
          >
            <div>
              <strong className="perm-label">Client Sign-off & Post Approvals</strong>
              <span className="perm-desc">Notify when a client approves or requests revisions on content</span>
            </div>
            <div className={`perm-switch-box ${data.emailPostApproval ? 'on' : 'off'}`}>
              <div className="perm-switch-handle" />
            </div>
          </div>

          <div
            className={`perm-toggle-row ${data.emailTaskAssigned ? 'enabled' : ''}`}
            onClick={() => handleChange('emailTaskAssigned', !data.emailTaskAssigned)}
          >
            <div>
              <strong className="perm-label">Task Assignments & Milestones</strong>
              <span className="perm-desc">Notify staff members when tasks or deliverables are assigned to them</span>
            </div>
            <div className={`perm-switch-box ${data.emailTaskAssigned ? 'on' : 'off'}`}>
              <div className="perm-switch-handle" />
            </div>
          </div>

          <div
            className={`perm-toggle-row ${data.emailBudgetAlerts ? 'enabled' : ''}`}
            onClick={() => handleChange('emailBudgetAlerts', !data.emailBudgetAlerts)}
          >
            <div>
              <strong className="perm-label">Ad Budget Overspending & Pacing Alerts</strong>
              <span className="perm-desc">Instant alert when paid campaigns exceed monthly pacing limits</span>
            </div>
            <div className={`perm-switch-box ${data.emailBudgetAlerts ? 'on' : 'off'}`}>
              <div className="perm-switch-handle" />
            </div>
          </div>

          <div
            className={`perm-toggle-row ${data.emailWeeklyDigest ? 'enabled' : ''}`}
            onClick={() => handleChange('emailWeeklyDigest', !data.emailWeeklyDigest)}
          >
            <div>
              <strong className="perm-label">Executive Weekly Performance Digest</strong>
              <span className="perm-desc">Summary recap of all client growth, published posts, and revenue ROAS</span>
            </div>
            <div className={`perm-switch-box ${data.emailWeeklyDigest ? 'on' : 'off'}`}>
              <div className="perm-switch-handle" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Slack Integration & Budget Threshold */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="section-title">Real-Time Slack Integration & Thresholds</h3>
            <p className="section-desc">Broadcast instant messages to agency Slack channels</p>
          </div>
        </div>

        <div className="settings-form-grid-two">
          <div
            className={`perm-toggle-row ${data.slackRealtimeAlerts ? 'enabled' : ''}`}
            onClick={() => handleChange('slackRealtimeAlerts', !data.slackRealtimeAlerts)}
          >
            <div>
              <strong className="perm-label">Broadcast Alerts to #agency-alerts in Slack</strong>
              <span className="perm-desc">Sends formatted message cards for client approvals & urgent tasks</span>
            </div>
            <div className={`perm-switch-box ${data.slackRealtimeAlerts ? 'on' : 'off'}`}>
              <div className="perm-switch-handle" />
            </div>
          </div>

          {/* Budget Pacing Slider */}
          <div className="form-field-group">
            <div className="slider-label-row">
              <label className="form-label">Ad Budget Warning Threshold</label>
              <strong className="slider-val-badge">{data.budgetThresholdPercent || 85}%</strong>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={data.budgetThresholdPercent || 85}
              onChange={(e) => handleChange('budgetThresholdPercent', parseInt(e.target.value, 10))}
              className="settings-range-slider"
            />
            <span className="helper-text-sub">Trigger alert when campaign reaches this percentage of total budget</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsSettingsTab;
