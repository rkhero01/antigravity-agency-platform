import React, { useState } from 'react';
import { X, Users2, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function AddInfluencerModal({
  isOpen,
  onClose,
  onAddInfluencer,
}) {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    platform: 'Instagram',
    clientId: 'c1',
    campaign: 'Fall Product Launch Campaign',
    niche: 'Fitness & Conditioning',
    followers: '45.0K',
    engagementRate: '6.8%',
    rate: '$750 / Reel',
    promoCode: 'CREATOR15',
    deliverables: '1 Sponsored Reel + 2 Stories',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Creator name is required';
    if (!formData.handle.trim()) newErrors.handle = 'Social handle is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddInfluencer(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card add-influencer-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Users2 size={18} />
            </div>
            <div>
              <h3 className="modal-title">Onboard Creator & Influencer Partner</h3>
              <p className="modal-subtitle">Add brand ambassador to client collaboration roster</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="add-influencer-form">
          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">
                Creator Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Hayes"
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
                placeholder="e.g. @jordanhayes_fit"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className={`form-text-input ${errors.handle ? 'error' : ''}`}
              />
              {errors.handle && <span className="form-error-msg">{errors.handle}</span>}
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Primary Social Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="form-select-input"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
              </select>
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
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Campaign Name</label>
              <input
                type="text"
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Content Niche / Category</label>
              <input
                type="text"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                className="form-text-input"
              />
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
              <label className="form-label">Engagement Rate</label>
              <input
                type="text"
                value={formData.engagementRate}
                onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Post Rate / Fee</label>
              <input
                type="text"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Affiliate Promo Code</label>
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Agreed Deliverables</label>
              <input
                type="text"
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
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
              <span>Onboard Creator Partner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInfluencerModal;
