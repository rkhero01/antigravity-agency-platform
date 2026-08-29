import React, { useState } from 'react';
import { X, Hash, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function SaveHashtagSetModal({
  isOpen,
  onClose,
  onSaveSet,
}) {
  const [formData, setFormData] = useState({
    name: '',
    clientId: 'c1',
    hashtags: '#ApexFitness #WorkoutMotivation #AustinGyms #HIITTraining #MobilityDaily',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Set name is required';
    if (!formData.hashtags.trim()) newErrors.hashtags = 'At least one hashtag is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSaveSet(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card save-set-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Hash size={18} />
            </div>
            <div>
              <h3 className="modal-title">Save Client Hashtag Bundle</h3>
              <p className="modal-subtitle">Save reusable hashtag clusters for fast multi-channel composition</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="save-set-form">
          <div className="form-field-group">
            <label className="form-label">
              Bundle / Set Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex High-Volume Recovery Pack"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`form-text-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

          <div className="form-field-group">
            <label className="form-label">Target Client Workspace</label>
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
            <label className="form-label">
              Hashtags List (Space or Comma Separated) <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="#BrandName #NicheKeyword #CommunityTag #Location"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              className={`form-textarea-input ${errors.hashtags ? 'error' : ''}`}
            />
            {errors.hashtags && <span className="form-error-msg">{errors.hashtags}</span>}
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Save Hashtag Set</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaveHashtagSetModal;
