import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function UploadAssetModal({
  isOpen,
  onClose,
  onUploadAsset,
}) {
  const [formData, setFormData] = useState({
    title: '',
    clientId: 'c1',
    type: 'Image',
    aspectRatio: '1:1',
    resolution: '1080 x 1080',
    fileSize: '3.2 MB',
    format: 'WEBP',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    tagsInput: 'BrandCampaign, HighResolution, Marketing2026',
    enableAiTagging: true,
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Asset title is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const aiTags = formData.tagsInput
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, ''))
      .filter(Boolean);

    if (formData.enableAiTagging) {
      aiTags.push('AI Auto-Indexed', 'Visual Verified');
    }

    onUploadAsset({
      ...formData,
      aiTags,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card upload-asset-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 className="modal-title">Upload Creative Media Asset</h3>
              <p className="modal-subtitle">Add photography, 4K video, or vector branding assets to client cloud vault</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="upload-asset-form">
          {/* Simulated Dropzone */}
          <div className="upload-dropzone-box">
            <UploadCloud size={32} className="dropzone-icon" />
            <strong className="dropzone-text">Drag & drop 4K media files here, or click to browse</strong>
            <span className="dropzone-hint">Supports PNG, WEBP, JPEG, MP4 (up to 500MB per file)</span>
          </div>

          <div className="form-field-group">
            <label className="form-label">
              Asset Title / File Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Autumn HIIT Sprint Reel Master"
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
              <label className="form-label">Asset Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form-select-input"
              >
                <option value="Image">Image / Photography</option>
                <option value="Video">Video / Reel (4K)</option>
                <option value="Logo">Brand Logo / Vector</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Aspect Ratio</label>
              <select
                value={formData.aspectRatio}
                onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                className="form-select-input"
              >
                <option value="1:1">1:1 Square</option>
                <option value="9:16">9:16 Story / Reel</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="4:5">4:5 Portrait</option>
              </select>
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Custom Content Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Sauna, Recovery, Luxury, CampaignHero"
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              className="form-text-input"
            />
          </div>

          {/* AI Tagging Toggle */}
          <div className="ai-tagging-toggle-row">
            <div className="toggle-info">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
                <Sparkles size={14} className="text-warning" />
                <span>Enable Automated AI Computer Vision Tagging</span>
              </div>
              <span className="text-xs text-muted">Automatically generates semantic keywords and scene classifications for search</span>
            </div>
            <label className="saas-toggle-switch">
              <input
                type="checkbox"
                checked={formData.enableAiTagging}
                onChange={(e) => setFormData({ ...formData, enableAiTagging: e.target.checked })}
              />
              <span className="toggle-slider round" />
            </label>
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Upload & Index Media</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadAssetModal;
