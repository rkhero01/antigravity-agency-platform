import React, { useState } from 'react';
import { X, Target, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function AddCompetitorModal({
  isOpen,
  onClose,
  onAddCompetitor,
}) {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    platform: 'Instagram',
    clientId: 'c1',
    followers: '250.0K',
    postingFrequency: '5.0 posts / week',
    engagementRate: '4.2%',
    estimatedAdSpend: '$8,500 / mo',
    shareOfVoice: '30%',
    strengths: 'Consistent daily lifestyle reels',
    weaknesses: 'Slow comment response times',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Competitor name is required';
    if (!formData.handle.trim()) newErrors.handle = 'Social handle is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddCompetitor(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card add-competitor-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Target size={18} />
            </div>
            <div>
              <h3 className="modal-title">Track New Competitor Brand</h3>
              <p className="modal-subtitle">Add rival business to continuous benchmark radar</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="add-competitor-form">
          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">
                Competitor Brand Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Life Time Fitness"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`form-text-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Social Handle <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. @lifetimefitness"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className={`form-text-input ${errors.handle ? 'error' : ''}`}
              />
              {errors.handle && <span className="form-error-msg">{errors.handle}</span>}
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Primary Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="form-select-input"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Benchmark Against Client Workspace</label>
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
          </div>

          <div className="form-grid-three-col">
            <div className="form-field-group">
              <label className="form-label">Followers</label>
              <input
                type="text"
                value={formData.followers}
                onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Posting Pacing</label>
              <input
                type="text"
                value={formData.postingFrequency}
                onChange={(e) => setFormData({ ...formData, postingFrequency: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Avg Engagement</label>
              <input
                type="text"
                value={formData.engagementRate}
                onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Observed Strengths</label>
              <input
                type="text"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Vulnerabilities & Weaknesses</label>
              <input
                type="text"
                value={formData.weaknesses}
                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Start Tracking Competitor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCompetitorModal;
