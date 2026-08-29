import React, { useState } from 'react';
import { X, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function GenerateReportModal({
  isOpen,
  onClose,
  onGenerateReport,
}) {
  const [formData, setFormData] = useState({
    clientId: 'c1',
    category: 'executive',
    title: '',
    period: 'August 2026 (Monthly Review)',
    customNotes: '',
  });

  if (!isOpen) return null;

  const categories = [
    { id: 'executive', label: 'Executive Performance Summary', desc: 'Full-funnel C-suite overview with reach, engagement, ROAS, and revenue.' },
    { id: 'ads', label: 'Paid Media & ROAS Audit', desc: 'Meta Ads vs Google Ads spend, cost-per-lead, and attribution metrics.' },
    { id: 'organic', label: 'Organic Growth & Follower Reach', desc: 'Follower velocity, reel engagement rate, and viral hooks breakdown.' },
    { id: 'forecast', label: 'Strategic AI Growth Roadmap', desc: 'Predictive lead modeling and next month content allocation strategy.' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerateReport(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card generate-report-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">Generate AI Executive Report</h3>
              <p className="modal-subtitle">Synthesize multi-channel analytics and ad performance into client deliverable</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="generate-report-form">
          {/* Target Client Workspace */}
          <div className="form-field-group">
            <label className="form-label">Client Workspace</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="form-select-input"
            >
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.industry})
                </option>
              ))}
            </select>
          </div>

          {/* Report Category Template Selection */}
          <div className="form-field-group">
            <label className="form-label">Select Report Template & Structure</label>
            <div className="report-templates-selector-grid">
              {categories.map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`template-choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                  >
                    <strong className="template-label">{cat.label}</strong>
                    <span className="template-desc">{cat.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reporting Period & Custom Title */}
          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Reporting Period</label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="e.g. August 2026 (Monthly Review)"
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Custom Document Title (Optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Auto-generated if left blank"
                className="form-text-input"
              />
            </div>
          </div>

          {/* Custom Notes / Strategic Commentary */}
          <div className="form-field-group">
            <label className="form-label">Strategic Commentary & Highlights Prompt</label>
            <textarea
              rows={3}
              value={formData.customNotes}
              onChange={(e) => setFormData({ ...formData, customNotes: e.target.value })}
              placeholder="Highlight specific wins, new product launches, or ad optimizations to emphasize in the executive brief..."
              className="form-textarea-input"
            />
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <Sparkles size={16} />
              <span>Generate & Compile Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenerateReportModal;
