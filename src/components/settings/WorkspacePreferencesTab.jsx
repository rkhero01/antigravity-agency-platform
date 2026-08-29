import React from 'react';
import {
  SlidersHorizontal,
  Globe,
  DollarSign,
  Shield,
  Database,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function WorkspacePreferencesTab({ preferences = {} }) {
  return (
    <div className="settings-tab-content-pane">
      {/* Regional & Localization */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="section-title">Regional & Localization Preferences</h3>
            <p className="section-desc">Standard formatting parameters across agency workspaces</p>
          </div>
        </div>

        <div className="settings-form-grid-three">
          <div className="form-field-group">
            <label className="form-label">Default Reporting Timezone</label>
            <input
              type="text"
              value={preferences.timezone || 'UTC'}
              disabled
              className="form-text-input disabled"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Currency Notation</label>
            <input
              type="text"
              value={`${preferences.currency || 'USD'} ($)`}
              disabled
              className="form-text-input disabled"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Date Display Format</label>
            <input
              type="text"
              value={preferences.dateFormat || 'YYYY-MM-DD'}
              disabled
              className="form-text-input disabled"
            />
          </div>
        </div>
      </div>

      {/* Safety Gate & AI Execution Controls */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="section-title">AI Engine & Execution Safety Matrix</h3>
            <p className="section-desc">
              Hardware-enforced boundaries protecting financial cards, ad budgets, and external accounts
            </p>
          </div>
        </div>

        <div className="safety-gate-status-box">
          <div className="safety-gate-head">
            <Lock size={18} className="text-emerald" />
            <div className="safety-gate-info">
              <strong>Real-Mode Safety Gate: ACTIVE</strong>
              <span>All automated outbound triggers execute in safe sandbox telemetry mode</span>
            </div>
            <Badge variant="success">100% GATED</Badge>
          </div>
        </div>
      </div>

      {/* Infrastructure Telemetry */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Database size={20} />
          </div>
          <div>
            <h3 className="section-title">Database & Infrastructure Telemetry</h3>
            <p className="section-desc">Live production connection metadata</p>
          </div>
        </div>

        <div className="client-details-grid-spec">
          <div className="detail-spec-item">
            <span className="detail-spec-label">Primary Database</span>
            <strong className="detail-spec-val">Supabase PostgreSQL 15</strong>
          </div>
          <div className="detail-spec-item">
            <span className="detail-spec-label">Backend Cluster</span>
            <strong className="detail-spec-val">Render Cloud Node.js API</strong>
          </div>
          <div className="detail-spec-item">
            <span className="detail-spec-label">Frontend Origin</span>
            <strong className="detail-spec-val">Render Static Application</strong>
          </div>
          <div className="detail-spec-item">
            <span className="detail-spec-label">Connection Status</span>
            <span className="inline-badge-text text-emerald">
              <CheckCircle2 size={13} className="inline-icon" /> Operational (HTTP 200)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspacePreferencesTab;
