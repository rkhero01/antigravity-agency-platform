import React, { useState } from 'react';
import { X, Share2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function ConnectAccountModal({
  isOpen,
  onClose,
  onConnectAccount,
}) {
  const [formData, setFormData] = useState({
    platform: 'Instagram',
    clientId: 'c1',
    handle: '',
    accountName: '',
    followers: '5.4K',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const platforms = [
    { name: 'Instagram', desc: 'Auto-publish Reels, Carousels & Stories via Graph API' },
    { name: 'Facebook', desc: 'Page feeds, video posts, and Meta ad accounts' },
    { name: 'LinkedIn', desc: 'Company page updates, newsletters, and thought leadership' },
    { name: 'YouTube', desc: 'Channel video uploads, Shorts, and analytics' },
    { name: 'TikTok', desc: 'Short-form video scheduling and TikTok Ads Manager' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.handle.trim()) newErrors.handle = 'Account handle is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConnectAccount(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card connect-account-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="modal-title">Connect Client Social Channel</h3>
              <p className="modal-subtitle">Authorize OAuth permissions for automated publishing & analytics</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="connect-account-form">
          {/* Platform Choice Cards */}
          <div className="form-field-group">
            <label className="form-label">Select Social Network Platform</label>
            <div className="platforms-selector-grid">
              {platforms.map((p) => {
                const isSelected = formData.platform === p.name;
                return (
                  <div
                    key={p.name}
                    className={`platform-choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, platform: p.name })}
                  >
                    <strong className="platform-pname">{p.name}</strong>
                    <span className="platform-pdesc">{p.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-grid-two-col">
            {/* Client Account */}
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

            {/* Account Handle */}
            <div className="form-field-group">
              <label className="form-label">
                Account Handle <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. @apexfitness_hq"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className={`form-text-input ${errors.handle ? 'error' : ''}`}
              />
              {errors.handle && <span className="form-error-msg">{errors.handle}</span>}
            </div>
          </div>

          <div className="form-grid-two-col">
            {/* Account Display Name */}
            <div className="form-field-group">
              <label className="form-label">Account Display Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Fitness HQ Official"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="form-text-input"
              />
            </div>

            {/* Initial Followers */}
            <div className="form-field-group">
              <label className="form-label">Audience Size</label>
              <input
                type="text"
                placeholder="e.g. 24.5K"
                value={formData.followers}
                onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          {/* OAuth Notice */}
          <div className="oauth-consent-box">
            <ShieldCheck size={16} className="text-success" />
            <p>
              By authorizing, you grant PulseAI permission to read engagement analytics, upload scheduled video media, and query comments via secure OAuth 2.0.
            </p>
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Authorize & Connect Channel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConnectAccountModal;
