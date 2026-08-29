import React, { useState } from 'react';
import { X, TrendingUp, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function AddKeywordModal({
  isOpen,
  onClose,
  onAddKeyword,
}) {
  const [formData, setFormData] = useState({
    keyword: '',
    clientId: 'c1',
    volume: '14200',
    difficulty: '34',
    position: '3',
    intent: 'Commercial',
    serpFeature: 'Map Pack, Reviews',
    url: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.keyword.trim()) newErrors.keyword = 'Keyword term is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddKeyword(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card add-keyword-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="modal-title">Track New Target Keyword</h3>
              <p className="modal-subtitle">Add keywords to daily SERP tracking, difficulty scoring, and SERP feature monitoring</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="add-keyword-form">
          <div className="form-field-group">
            <label className="form-label">
              Target Search Keyword <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. cold plunge therapy austin tx"
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              className={`form-text-input ${errors.keyword ? 'error' : ''}`}
            />
            {errors.keyword && <span className="form-error-msg">{errors.keyword}</span>}
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
              <label className="form-label">Search Intent</label>
              <select
                value={formData.intent}
                onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                className="form-select-input"
              >
                <option value="Commercial">Commercial</option>
                <option value="Transactional">Transactional</option>
                <option value="Informational">Informational</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Current Position</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Estimated Monthly Volume</label>
              <input
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Difficulty (KD 0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Target Destination URL</label>
            <input
              type="text"
              placeholder="https://client.com/target-page"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
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
              <span>Track Keyword in Rank Radar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddKeywordModal;
