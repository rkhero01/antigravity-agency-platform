import React, { useState, useEffect } from 'react';
import {
  X,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Rocket,
  Building,
  Target,
  DollarSign,
} from 'lucide-react';
import { CAMPAIGN_PLATFORMS, CAMPAIGN_OBJECTIVES } from '../../services/campaignsService.js';
import { socialAccountsService } from '../../services/socialAccountsService.js';

export function EditCampaignModal({
  campaign,
  isOpen,
  onClose,
  onUpdateCampaign,
}) {
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    status: 'ACTIVE',
    dailyBudget: '0',
    objective: 'LEAD_GENERATION',
    socialAccountId: '',
    externalCampaignId: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isOpen && campaign) {
      loadSocialAccounts();
      setFormData({
        name: campaign.name || campaign.title || '',
        status: (campaign.statusRaw || campaign.status || 'ACTIVE').toUpperCase(),
        dailyBudget: String(campaign.dailyBudget || 0),
        objective: campaign.objective || 'LEAD_GENERATION',
        socialAccountId: campaign.socialAccountId || '',
        externalCampaignId: campaign.externalCampaignId || '',
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, campaign]);

  const loadSocialAccounts = async () => {
    try {
      const list = await socialAccountsService.getAccounts();
      setSocialAccounts(list);
    } catch (e) {
      console.error('Failed to load social accounts in edit modal:', e);
    }
  };

  if (!isOpen || !campaign) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Campaign name is required (min 2 characters).';
    }
    if (formData.dailyBudget === '' || isNaN(Number(formData.dailyBudget)) || Number(formData.dailyBudget) < 0) {
      newErrors.dailyBudget = 'Daily budget must be a positive number.';
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
      await onUpdateCampaign(campaign.id, {
        name: formData.name.trim(),
        status: formData.status,
        dailyBudget: Number(formData.dailyBudget),
        objective: formData.objective,
        socialAccountId: formData.socialAccountId || null,
        externalCampaignId: formData.externalCampaignId ? formData.externalCampaignId.trim() : null,
      });

      setSuccessMessage('Campaign updated successfully!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      setApiError(err.message || 'Failed to update campaign in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="modal-dialog-card connect-account-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Edit2 size={18} />
            </div>
            <div>
              <h3 className="modal-title">Edit Campaign Settings</h3>
              <p className="modal-subtitle">
                Modify delivery parameters, budget allocation, and asset links
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

        {/* API Error */}
        {apiError && (
          <div className="modal-error-banner" role="alert">
            <AlertCircle size={18} className="error-banner-icon" />
            <span className="error-banner-text">{apiError}</span>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="modal-success-banner" role="status">
            <CheckCircle2 size={18} className="success-banner-icon" />
            <span className="success-banner-text">{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-grid-two-col">
            {/* Campaign Name */}
            <div className="form-field-group full-width">
              <label className="form-label" htmlFor="edit-camp-name">
                Campaign Name <span className="text-danger">*</span>
              </label>
              <input
                id="edit-camp-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.name ? 'error' : ''}`}
                required
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            {/* Delivery Status */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-camp-status">
                Delivery Status <span className="text-danger">*</span>
              </label>
              <select
                id="edit-camp-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="ACTIVE">Active & Delivering</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Daily Budget */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-camp-budget">
                Daily Budget ($ USD) <span className="text-danger">*</span>
              </label>
              <input
                id="edit-camp-budget"
                type="number"
                min="0"
                step="10"
                value={formData.dailyBudget}
                onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                disabled={isSubmitting}
                className={`form-text-input ${errors.dailyBudget ? 'error' : ''}`}
                required
              />
              {errors.dailyBudget && <span className="form-error-msg">{errors.dailyBudget}</span>}
            </div>

            {/* Objective */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-camp-obj">
                Campaign Objective
              </label>
              <select
                id="edit-camp-obj"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                {CAMPAIGN_OBJECTIVES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Social Account */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-camp-social">
                Linked Ad Asset Channel
              </label>
              <select
                id="edit-camp-social"
                value={formData.socialAccountId}
                onChange={(e) => setFormData({ ...formData, socialAccountId: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="">No linked channel (Direct Agency Account)</option>
                {socialAccounts.map((sa) => (
                  <option key={sa.id} value={sa.id}>
                    {sa.accountName} ({sa.platform})
                  </option>
                ))}
              </select>
            </div>

            {/* External Campaign ID */}
            <div className="form-field-group full-width">
              <label className="form-label" htmlFor="edit-camp-extid">
                External Ad Account Campaign ID
              </label>
              <input
                id="edit-camp-extid"
                type="text"
                value={formData.externalCampaignId}
                onChange={(e) => setFormData({ ...formData, externalCampaignId: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
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
              className="btn-connect-account-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Saving to Database...</span>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCampaignModal;
