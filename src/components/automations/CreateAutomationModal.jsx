import React, { useState } from 'react';
import { X, Zap, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CreateAutomationModal({
  isOpen,
  onClose,
  onCreateAutomation,
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Content & Publishing',
    trigger: 'Client Portal Sign-Off',
    action: 'Auto-Schedule Multi-Channel Post',
    clientScope: 'All Client Workspaces',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const triggerOptions = [
    'Client Portal Sign-Off',
    'ROAS Falls Below 2.5x Target',
    'Lead Opportunity DM Detected',
    'Influencer Contract Signed',
    'Negative Comment Sentiment Flagged',
    'Weekly Report Schedule (Mondays)',
  ];

  const actionOptions = [
    'Auto-Schedule Multi-Channel Post',
    'Throttle Ad Budget 30% & Alert Slack',
    'Dispatch HubSpot Webhook & Assign Staff',
    'Create Affiliate Promo Code & Email Brief',
    'Flag Urgent Ticket & Send SMS',
    'Compile Executive PDF & Email Client',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Rule name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreateAutomation(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-automation-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Workflow Automation Rule</h3>
              <p className="modal-subtitle">Define automated trigger $\rightarrow$ action recipes across agency operations</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-automation-form">
          <div className="form-field-group">
            <label className="form-label">
              Automation Rule Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Auto-Pause Underperforming Ad Sets"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`form-text-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          <div className="form-field-group">
            <label className="form-label">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Explain what this automation does and its operating conditions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`form-textarea-input ${errors.description ? 'error' : ''}`}
            />
            {errors.description && <span className="form-error-msg">{errors.description}</span>}
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select-input"
              >
                <option value="Content & Publishing">Content & Publishing</option>
                <option value="Paid Media & ROAS">Paid Media & ROAS</option>
                <option value="Social Inbox & Leads">Social Inbox & Leads</option>
                <option value="Influencer & UGC">Influencer & UGC</option>
                <option value="Executive Reporting">Executive Reporting</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Target Client Scope</label>
              <select
                value={formData.clientScope}
                onChange={(e) => setFormData({ ...formData, clientScope: e.target.value })}
                className="form-select-input"
              >
                <option value="All Client Workspaces">🏢 All Client Workspaces</option>
                {mockClients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">When Event Trigger Occurs (IF)</label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                className="form-select-input"
              >
                {triggerOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    ⚡ {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Then Execute Automated Action (THEN)</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="form-select-input"
              >
                {actionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    🎯 {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Save & Activate Rule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAutomationModal;
