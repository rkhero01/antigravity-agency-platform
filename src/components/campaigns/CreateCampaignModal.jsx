import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Building,
  Target,
  DollarSign,
  Calendar,
  Share2,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';
import { socialAccountsService } from '../../services/socialAccountsService.js';
import { CAMPAIGN_PLATFORMS, CAMPAIGN_OBJECTIVES } from '../../services/campaignsService.js';

export function CreateCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
}) {
  const [clients, setClients] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    socialAccountId: '',
    platform: 'META',
    name: '',
    objective: 'LEAD_GENERATION',
    dailyBudget: '1500',
    budgetType: 'DAILY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    externalCampaignId: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
      setFormData({
        clientId: '',
        socialAccountId: '',
        platform: 'META',
        name: '',
        objective: 'LEAD_GENERATION',
        dailyBudget: '1500',
        budgetType: 'DAILY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        externalCampaignId: '',
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const loadPrerequisites = async () => {
    try {
      const [clientList, socialList] = await Promise.all([
        clientsService.getClients(),
        socialAccountsService.getAccounts(),
      ]);
      setClients(clientList);
      setSocialAccounts(socialList);
      if (clientList.length > 0) {
        setFormData((prev) => ({ ...prev, clientId: clientList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load clients/social accounts in campaign modal:', e);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Campaign name is required (min 2 characters).';
    }
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client workspace.';
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
      await onCreateCampaign({
        clientId: formData.clientId,
        socialAccountId: formData.socialAccountId || null,
        platform: formData.platform,
        name: formData.name.trim(),
        objective: formData.objective,
        dailyBudget: Number(formData.dailyBudget),
        budgetType: formData.budgetType,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        externalCampaignId: formData.externalCampaignId ? formData.externalCampaignId.trim() : null,
      });

      setSuccessMessage(`Campaign "${formData.name.trim()}" created successfully in PostgreSQL!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(err.message || 'Failed to create campaign in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter social accounts compatible with current client & platform
  const compatibleSocialAccounts = socialAccounts.filter((sa) => {
    const matchesClient = !formData.clientId || sa.clientId === formData.clientId;
    const matchesPlatform =
      formData.platform === 'META'
        ? sa.platform === 'META' || sa.platform === 'FACEBOOK' || sa.platform === 'INSTAGRAM'
        : sa.platform === formData.platform;
    return matchesClient && matchesPlatform;
  });

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
              <Rocket size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Paid Media Campaign</h3>
              <p className="modal-subtitle">
                Configure campaign architecture bound to client workspace & ad accounts
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
          <div className="form-grid-two-col">
            {/* Client Workspace */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="create-camp-client">
                Client Workspace <span className="text-danger">*</span>
              </label>
              <select
                id="create-camp-client"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.clientName} ({c.industry || 'Client'})
                  </option>
                ))}
              </select>
              {errors.clientId && <span className="form-error-msg">{errors.clientId}</span>}
            </div>

            {/* Platform Channel */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="create-camp-platform">
                Ad Network / Platform <span className="text-danger">*</span>
              </label>
              <select
                id="create-camp-platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                {CAMPAIGN_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Name */}
            <div className="form-field-group full-width">
              <label className="form-label" htmlFor="create-camp-name">
                Campaign Name <span className="text-danger">*</span>
              </label>
              <input
                id="create-camp-name"
                type="text"
                placeholder="e.g. Apex High-Intent Search Surge Q3"
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

            {/* Objective */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="create-camp-obj">
                Campaign Objective <span className="text-danger">*</span>
              </label>
              <select
                id="create-camp-obj"
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

            {/* Linked Social/Ad Account */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="create-camp-social">
                Linked Ad Asset Channel
              </label>
              <select
                id="create-camp-social"
                value={formData.socialAccountId}
                onChange={(e) => setFormData({ ...formData, socialAccountId: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="">No linked channel (Direct Agency Account)</option>
                {compatibleSocialAccounts.map((sa) => (
                  <option key={sa.id} value={sa.id}>
                    {sa.accountName} ({sa.platform})
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Budget */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="create-camp-budget">
                Daily Budget ($ USD) <span className="text-danger">*</span>
              </label>
              <input
                id="create-camp-budget"
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

            {/* External Campaign ID */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="create-camp-extid">
                External Ad Account Campaign ID
              </label>
              <input
                id="create-camp-extid"
                type="text"
                placeholder="e.g. cmp_meta_9812903"
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
                <span>Persisting to PostgreSQL...</span>
              ) : (
                <span>Launch Campaign</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaignModal;
