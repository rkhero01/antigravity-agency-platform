import React from 'react';
import { Building, Globe, Mail, Phone, Clock, DollarSign, ShieldCheck } from 'lucide-react';

export function GeneralSettingsTab({ data = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="settings-tab-content-pane">
      {/* Card 1: Agency Identity */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Building size={18} />
          </div>
          <div>
            <h3 className="section-title">Agency Identity & Contact Details</h3>
            <p className="section-desc">Primary business details displayed across client invoices and portals</p>
          </div>
        </div>

        <div className="settings-form-grid-two">
          <div className="form-field-group">
            <label className="form-label">Agency Workspace Name</label>
            <input
              type="text"
              value={data.agencyName || ''}
              onChange={(e) => handleChange('agencyName', e.target.value)}
              className="form-text-input"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Legal Registered Entity</label>
            <input
              type="text"
              value={data.legalEntity || ''}
              onChange={(e) => handleChange('legalEntity', e.target.value)}
              className="form-text-input"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Primary Support Email</label>
            <input
              type="email"
              value={data.supportEmail || ''}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              className="form-text-input"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Support Phone Number</label>
            <input
              type="text"
              value={data.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="form-text-input"
            />
          </div>

          <div className="form-field-group full-width">
            <label className="form-label">Agency Public Website URL</label>
            <input
              type="url"
              value={data.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className="form-text-input"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Localization & Regional */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="section-title">Localization, Timezone & Currency</h3>
            <p className="section-desc">Standardizes reporting periods, scheduled post times, and budget currency symbols</p>
          </div>
        </div>

        <div className="settings-form-grid-three">
          <div className="form-field-group">
            <label className="form-label">Primary Timezone</label>
            <select
              value={data.primaryTimezone || 'America/New_York'}
              onChange={(e) => handleChange('primaryTimezone', e.target.value)}
              className="form-select-input"
            >
              <option value="America/New_York">Eastern Time (America/New_York - UTC-5)</option>
              <option value="America/Chicago">Central Time (America/Chicago - UTC-6)</option>
              <option value="America/Denver">Mountain Time (America/Denver - UTC-7)</option>
              <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles - UTC-8)</option>
              <option value="Europe/London">London (Europe/London - UTC+0)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-label">Reporting Currency</label>
            <select
              value={data.currency || 'USD ($)'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="form-select-input"
            >
              <option value="USD ($)">USD ($) - United States Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="GBP (£)">GBP (£) - British Pound</option>
              <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
              <option value="AUD ($)">AUD ($) - Australian Dollar</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-label">Date Format Standard</label>
            <select
              value={data.dateFormat || 'YYYY-MM-DD'}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="form-select-input"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-28)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (08/28/2026)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (28/08/2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card 3: White-label Portal Domain */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="section-title">White-Label Client Portal Domain</h3>
            <p className="section-desc">Custom domain configuration for client review links and branded exports</p>
          </div>
        </div>

        <div className="settings-form-grid-two">
          <div className="form-field-group">
            <label className="form-label">Custom CNAME Domain</label>
            <input
              type="text"
              value={data.whiteLabelDomain || ''}
              onChange={(e) => handleChange('whiteLabelDomain', e.target.value)}
              className="form-text-input"
            />
            <span className="helper-text-sub">DNS CNAME target: cname.pulseagency.ai</span>
          </div>

          <div className="form-field-group switch-field-group">
            <label className="form-label">Enforce Agency Custom Branding</label>
            <div
              className={`perm-toggle-row ${data.customBranding ? 'enabled' : ''}`}
              onClick={() => handleChange('customBranding', !data.customBranding)}
            >
              <div>
                <strong className="perm-label">Remove PulseAI Powered-By Badges</strong>
                <span className="perm-desc">Show only agency brand logos on client portals</span>
              </div>
              <div className={`perm-switch-box ${data.customBranding ? 'on' : 'off'}`}>
                <div className="perm-switch-handle" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettingsTab;
