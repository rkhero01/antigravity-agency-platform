import React, { useState } from 'react';
import { X, Rocket, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CreateCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
}) {
  const [formData, setFormData] = useState({
    title: '',
    clientId: 'c1',
    status: 'Strategy & Concept',
    budget: '$25,000',
    targetRevenue: '$140,000',
    projectedRoas: '5.6x',
    startDate: 'Oct 01, 2026',
    endDate: 'Nov 15, 2026',
    primaryGoal: 'Drive Q4 E-commerce & Membership Conversions',
    audiencePersona: 'Affluent urban demographic (25-45) focused on health and quality',
    valueProposition: 'Experience unmatched quality and results with our signature new release.',
    aesthetic: 'Moody luxury aesthetic with high-contrast studio lighting',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Campaign title is required';
    if (!formData.budget.trim()) newErrors.budget = 'Budget is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreateCampaign(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-campaign-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Rocket size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Strategic Campaign Brief</h3>
              <p className="modal-subtitle">Define omnichannel objectives, financial guardrails, and audience personas</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-campaign-form">
          <div className="form-field-group">
            <label className="form-label">
              Campaign Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Black Friday Omnichannel Launch Blitz"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`form-text-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="form-error-msg">{errors.title}</span>}
          </div>

          <div className="form-grid-three-col">
            <div className="form-field-group">
              <label className="form-label">Client Workspace</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="form-select-input"
              >
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Allocated Budget</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Target Revenue</label>
              <input
                type="text"
                value={formData.targetRevenue}
                onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">End Date</label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Primary Campaign Goal</label>
            <input
              type="text"
              placeholder="e.g. Generate 500 VIP Membership Sign-Ups"
              value={formData.primaryGoal}
              onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
              className="form-text-input"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Target Audience Persona</label>
            <textarea
              rows={2}
              placeholder="Describe demographics, pain points, and buyer behaviors..."
              value={formData.audiencePersona}
              onChange={(e) => setFormData({ ...formData, audiencePersona: e.target.value })}
              className="form-textarea-input"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Core Value Proposition / Hook</label>
            <input
              type="text"
              placeholder="e.g. Austin's premier recovery suite with 0 hidden fees"
              value={formData.valueProposition}
              onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
              className="form-text-input"
            />
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Initialize Campaign Brief</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
