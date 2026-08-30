import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Building, Share2, Target, Calendar } from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';
import { socialAccountsService } from '../../services/socialAccountsService.js';
import { campaignsService } from '../../services/campaignsService.js';
import { CONTENT_FORMATS, CONTENT_PLATFORMS } from '../../services/contentService.js';

export function PostComposerModal({
  isOpen,
  onClose,
  initialDate,
  initialClient,
  initialTitle,
  initialCaption,
  onCreatePost,
}) {
  const [clients, setClients] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [formData, setFormData] = useState({
    clientId: initialClient || '',
    socialAccountId: '',
    campaignId: '',
    format: 'CAROUSEL',
    platform: 'INSTAGRAM',
    title: initialTitle || '',
    caption: initialCaption || '',
    scheduledDate: initialDate || new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    mediaPreview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    status: 'SCHEDULED',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
      setFormData({
        clientId: initialClient && initialClient !== 'all' ? initialClient : '',
        socialAccountId: '',
        campaignId: '',
        format: 'CAROUSEL',
        platform: 'INSTAGRAM',
        title: initialTitle || '',
        caption: initialCaption || '',
        scheduledDate: initialDate || new Date().toISOString().split('T')[0],
        scheduledTime: '10:00',
        mediaPreview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        status: 'SCHEDULED',
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialDate, initialClient]);

  const loadPrerequisites = async () => {
    try {
      const [clientList, socialList, campList] = await Promise.all([
        clientsService.getClients(),
        socialAccountsService.getAccounts(),
        campaignsService.getCampaigns(),
      ]);
      setClients(clientList);
      setSocialAccounts(socialList);
      setCampaigns(campList);

      if (!formData.clientId && clientList.length > 0) {
        setFormData((prev) => ({ ...prev, clientId: clientList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load prerequisites in post composer:', e);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      newErrors.title = 'Post title is required (min 2 characters).';
    }
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client workspace.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onCreatePost({
        clientId: formData.clientId,
        socialAccountId: formData.socialAccountId || null,
        campaignId: formData.campaignId || null,
        title: formData.title.trim(),
        caption: formData.caption ? formData.caption.trim() : '',
        format: formData.format,
        platform: formData.platform,
        mediaUrl: formData.mediaPreview || null,
        status: formData.status,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
      });

      setSuccessMessage(`Post "${formData.title.trim()}" created successfully in PostgreSQL!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(err.message || 'Failed to create post in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter compatible social accounts and campaigns
  const compatibleSocialAccounts = socialAccounts.filter((sa) => {
    const matchesClient = !formData.clientId || sa.clientId === formData.clientId;
    const matchesPlatform =
      formData.platform === 'META'
        ? sa.platform === 'META' || sa.platform === 'FACEBOOK' || sa.platform === 'INSTAGRAM'
        : sa.platform === formData.platform;
    return matchesClient && matchesPlatform;
  });

  const compatibleCampaigns = campaigns.filter((c) => !formData.clientId || c.clientId === formData.clientId);

  return (
    <div className="modal-backdrop-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="modal-dialog-card composer-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Social Asset & Editorial Post</h3>
              <p className="modal-subtitle">
                Compose, schedule, and assign multi-platform content to client pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="modal-error-banner" role="alert">
            <AlertCircle size={18} className="error-banner-icon" />
            <span className="error-banner-text">{apiError}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="modal-success-banner" role="status">
            <CheckCircle2 size={18} className="success-banner-icon" />
            <span className="success-banner-text">{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="composer-form-grid">
            {/* Left Column: Post Details */}
            <div className="composer-fields-col">
              <div className="form-grid-two-col">
                {/* Client Workspace */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-client">
                    Client Workspace <span className="text-danger">*</span>
                  </label>
                  <select
                    id="composer-client"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    disabled={isSubmitting}
                    className="form-select-input"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.clientName}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && <span className="form-error-msg">{errors.clientId}</span>}
                </div>

                {/* Target Platform */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-platform">
                    Primary Target Platform <span className="text-danger">*</span>
                  </label>
                  <select
                    id="composer-platform"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    disabled={isSubmitting}
                    className="form-select-input"
                  >
                    {CONTENT_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title / Topic */}
              <div className="form-field-group full-width">
                <label className="form-label" htmlFor="composer-title">
                  Post Title / Editorial Headline <span className="text-danger">*</span>
                </label>
                <input
                  id="composer-title"
                  type="text"
                  placeholder="e.g. Apex High-Intensity Summer Strength Challenge"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: null });
                  }}
                  disabled={isSubmitting}
                  className={`form-text-input ${errors.title ? 'error' : ''}`}
                  required
                />
                {errors.title && <span className="form-error-msg">{errors.title}</span>}
              </div>

              {/* Caption / Copy */}
              <div className="form-field-group full-width">
                <label className="form-label" htmlFor="composer-caption">
                  Post Caption & Body Copy
                </label>
                <textarea
                  id="composer-caption"
                  rows={4}
                  placeholder="Write captivating caption copy with value proposition and clear call to action..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  disabled={isSubmitting}
                  className="form-textarea-input"
                />
              </div>

              <div className="form-grid-two-col">
                {/* Format */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-format">
                    Content Format <span className="text-danger">*</span>
                  </label>
                  <select
                    id="composer-format"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    disabled={isSubmitting}
                    className="form-select-input"
                  >
                    {CONTENT_FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-status">
                    Initial Publishing Status
                  </label>
                  <select
                    id="composer-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={isSubmitting}
                    className="form-select-input"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_APPROVAL">Pending Approval (In Review)</option>
                    <option value="SCHEDULED">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-two-col">
                {/* Linked Social Account */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-social">
                    Linked Social Asset Channel
                  </label>
                  <select
                    id="composer-social"
                    value={formData.socialAccountId}
                    onChange={(e) => setFormData({ ...formData, socialAccountId: e.target.value })}
                    disabled={isSubmitting}
                    className="form-select-input"
                  >
                    <option value="">Direct Channel / Standard Account</option>
                    {compatibleSocialAccounts.map((sa) => (
                      <option key={sa.id} value={sa.id}>
                        {sa.accountName} ({sa.platform})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Linked Campaign */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-campaign">
                    Linked Marketing Campaign
                  </label>
                  <select
                    id="composer-campaign"
                    value={formData.campaignId}
                    onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                    disabled={isSubmitting}
                    className="form-select-input"
                  >
                    <option value="">No Campaign (Organic Content)</option>
                    {compatibleCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || c.title} ({c.platform})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule Date & Time */}
              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-date">
                    Scheduled Publish Date
                  </label>
                  <input
                    id="composer-date"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    disabled={isSubmitting}
                    className="form-text-input"
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label" htmlFor="composer-time">
                    Scheduled Time
                  </label>
                  <input
                    id="composer-time"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    disabled={isSubmitting}
                    className="form-text-input"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview */}
            <div className="composer-preview-col">
              <span className="composer-preview-title">Asset Live Preview</span>
              <div className="composer-preview-card">
                <img
                  src={formData.mediaPreview}
                  alt="Post preview"
                  className="composer-preview-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="composer-preview-meta">
                  <div className="preview-tags-row">
                    <span className="platform-tag-pill">{formData.platform}</span>
                    <span className="format-tag-pill">{formData.format}</span>
                  </div>
                  <strong className="preview-headline">{formData.title || 'Untitled Post'}</strong>
                  <p className="preview-body">{formData.caption || 'No caption text provided yet.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-dialog-footer">
            <button
              type="button"
              className="btn-saas-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-create-post-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Persisting to PostgreSQL...</span>
              ) : (
                <span>Schedule & Save Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostComposerModal;
