import React, { useState } from 'react';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CreateBroadcastModal({
  isOpen,
  onClose,
  onCreateCampaign,
}) {
  const [formData, setFormData] = useState({
    title: '',
    clientId: 'c1',
    type: 'Email Broadcast',
    status: 'Scheduled',
    subject: '',
    previewText: 'Exclusive perks and special releases for our VIP community.',
    segment: 'All Active VIP Subscribers (15,000 contacts)',
    recipients: '15000',
    bodySnippet: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Broadcast title is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject line is required';

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
        className="modal-dialog-card create-broadcast-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Email / SMS Broadcast</h3>
              <p className="modal-subtitle">Compose high-converting newsletters and SMS drop notifications</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-broadcast-form">
          <div className="form-field-group">
            <label className="form-label">
              Campaign Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Black Friday VIP Early Bird Drop"
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
              <label className="form-label">Channel Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form-select-input"
              >
                <option value="Email Broadcast">Email Broadcast</option>
                <option value="SMS Blast">SMS Blast</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Campaign Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select-input"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent Immediately</option>
              </select>
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">
              Subject Line / SMS Alert Header <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 🔥 VIP Early Access: 20% Off Your Entire Order"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`form-text-input ${errors.subject ? 'error' : ''}`}
            />
            {errors.subject && <span className="form-error-msg">{errors.subject}</span>}
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Preview Text Snippet</label>
              <input
                type="text"
                value={formData.previewText}
                onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Target Audience Segment</label>
              <input
                type="text"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Email Body Copy / SMS Message</label>
            <textarea
              rows={3}
              placeholder="Enter newsletter copy or SMS drop message..."
              value={formData.bodySnippet}
              onChange={(e) => setFormData({ ...formData, bodySnippet: e.target.value })}
              className="form-textarea-input"
            />
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Schedule & Initialize Broadcast</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBroadcastModal;
