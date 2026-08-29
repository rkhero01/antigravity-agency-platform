import React from 'react';
import { Palette, Type, FileText, Eye } from 'lucide-react';

export function BrandKitSettingsTab({ data = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="settings-tab-content-pane">
      {/* Card 1: Colors & Typography */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="section-title">Agency Master Palette & Typography</h3>
            <p className="section-desc">Default color schemes and font standards applied to client presentations and reports</p>
          </div>
        </div>

        <div className="settings-form-grid-three">
          {/* Primary Color */}
          <div className="form-field-group">
            <label className="form-label">Primary Brand Color</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={data.primaryColor || '#6366f1'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="color-picker-square"
              />
              <input
                type="text"
                value={data.primaryColor || '#6366f1'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="form-text-input hex-input"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="form-field-group">
            <label className="form-label">Secondary / Cyan Accent</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={data.secondaryColor || '#06b6d4'}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="color-picker-square"
              />
              <input
                type="text"
                value={data.secondaryColor || '#06b6d4'}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="form-text-input hex-input"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="form-field-group">
            <label className="form-label">Vibrant Highlight / Pink Accent</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={data.accentColor || '#ec4899'}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="color-picker-square"
              />
              <input
                type="text"
                value={data.accentColor || '#ec4899'}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="form-text-input hex-input"
              />
            </div>
          </div>
        </div>

        {/* Font Family */}
        <div className="form-field-group mt-3">
          <label className="form-label">Agency Typography System</label>
          <select
            value={data.fontFamily || 'Outfit, sans-serif'}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="form-select-input"
          >
            <option value="Outfit, sans-serif">Outfit (Modern, Geometric, Premium)</option>
            <option value="Inter, sans-serif">Inter (Clean, High-Readability SaaS)</option>
            <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (High-End Editorial)</option>
          </select>
        </div>
      </div>

      {/* Card 2: Executive Report Disclaimers & Watermarks */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="section-title">Report Watermarks & Confidentiality Disclaimers</h3>
            <p className="section-desc">Default header watermarks and legal footer notes on client PDF deliverables</p>
          </div>
        </div>

        <div className="settings-form-grid-two">
          <div className="form-field-group full-width">
            <label className="form-label">Default Document Watermark & Header Tag</label>
            <input
              type="text"
              value={data.watermarkText || ''}
              onChange={(e) => handleChange('watermarkText', e.target.value)}
              className="form-text-input"
            />
          </div>

          <div className="form-field-group full-width">
            <label className="form-label">Legal Footer Confidentiality Disclaimer</label>
            <textarea
              rows={2}
              value={data.footerDisclaimer || ''}
              onChange={(e) => handleChange('footerDisclaimer', e.target.value)}
              className="form-textarea-input"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Live Brand Kit Visual Preview */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Eye size={18} />
          </div>
          <div>
            <h3 className="section-title">Live Brand Kit Preview</h3>
            <p className="section-desc">Instant rendering of applied agency theme tokens</p>
          </div>
        </div>

        <div className="brand-preview-sheet">
          <div
            className="brand-preview-top-strip"
            style={{
              background: `linear-gradient(90deg, ${data.primaryColor || '#6366f1'}, ${data.secondaryColor || '#06b6d4'})`,
            }}
          />
          <div className="brand-preview-body">
            <div className="brand-preview-header">
              <span className="brand-badge-preview" style={{ background: `${data.primaryColor || '#6366f1'}30`, color: data.primaryColor || '#6366f1' }}>
                {data.watermarkText || 'PulseAI Marketing OS'}
              </span>
              <strong style={{ color: data.accentColor || '#ec4899' }}>Confidential Deliverable</strong>
            </div>
            <h4 style={{ fontFamily: data.fontFamily || 'Outfit, sans-serif' }}>
              Quarterly Omnichannel Growth & Attribution Blueprint
            </h4>
            <p className="preview-disclaimer-text">{data.footerDisclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandKitSettingsTab;
