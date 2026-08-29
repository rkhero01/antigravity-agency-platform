import React, { useState } from 'react';
import { X, Radio, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function TrackKeywordModal({
  isOpen,
  onClose,
  onAddMention,
}) {
  const [formData, setFormData] = useState({
    author: '@AustinGrowthLead',
    clientId: 'c1',
    platform: 'Twitter',
    sentiment: 'Positive',
    sentimentScore: 94,
    topic: 'Product Launch',
    reach: '35K Impressions',
    text: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.text.trim()) newErrors.text = 'Mention content or tracked text is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddMention(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card track-keyword-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="modal-title">Track Brand Keyword / Social Mention</h3>
              <p className="modal-subtitle">Index live chatter across Reddit, Twitter/X, TikTok, and Review sites</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="track-keyword-form">
          <div className="form-grid-two-col">
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
              <label className="form-label">Media Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="form-select-input"
              >
                <option value="Reddit">Reddit</option>
                <option value="Twitter">Twitter / X</option>
                <option value="TikTok">TikTok</option>
                <option value="Trustpilot">Trustpilot</option>
              </select>
            </div>
          </div>

          <div className="form-grid-three-col">
            <div className="form-field-group">
              <label className="form-label">Author Handle / User</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Sentiment</label>
              <select
                value={formData.sentiment}
                onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
                className="form-select-input"
              >
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Topic / Category</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">
              Mention Snippet / Discussion Text <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Enter brand chatter or social mention quote..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className={`form-textarea-input ${errors.text ? 'error' : ''}`}
            />
            {errors.text && <span className="form-error-msg">{errors.text}</span>}
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Index Mention to Stream</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TrackKeywordModal;
