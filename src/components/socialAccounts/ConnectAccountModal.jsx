import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Building,
  Info,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';
import { PLATFORM_INFO } from '../../services/socialAccountsService.js';

export function ConnectAccountModal({
  isOpen,
  onClose,
  onConnectAccount,
  oauthStatus = {},
}) {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    platform: 'META',
    accountName: '',
    handle: '',
    platformAccountId: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadClients();
      setFormData({
        clientId: '',
        platform: 'META',
        accountName: '',
        handle: '',
        platformAccountId: '',
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      const clientList = await clientsService.getClients();
      setClients(clientList);
      if (clientList.length > 0) {
        setFormData((prev) => ({ ...prev, clientId: clientList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load clients in connect modal:', e);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.accountName.trim() || formData.accountName.trim().length < 2) {
      newErrors.accountName = 'Account or page name is required (min 2 characters).';
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
      await onConnectAccount({
        clientId: formData.clientId || null,
        platform: formData.platform,
        accountName: formData.accountName.trim(),
        handle: formData.handle ? formData.handle.trim() : null,
        platformAccountId: formData.platformAccountId
          ? formData.platformAccountId.trim()
          : `asset-${Date.now().toString(36)}`,
      });

      setSuccessMessage(`Connected "${formData.accountName.trim()}" successfully!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(err.message || 'Failed to connect social account in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const platformKey = formData.platform.toUpperCase();
  const isOAuthGated =
    (platformKey === 'META' || platformKey === 'FACEBOOK' || platformKey === 'INSTAGRAM')
      ? !oauthStatus.META
      : platformKey === 'GOOGLE_BUSINESS'
      ? !oauthStatus.GOOGLE_BUSINESS
      : platformKey === 'YOUTUBE'
      ? !oauthStatus.YOUTUBE
      : platformKey === 'LINKEDIN'
      ? !oauthStatus.LINKEDIN
      : true;

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
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 className="modal-title">Connect Social Platform Asset</h3>
              <p className="modal-subtitle">
                Provision social channel access bound to client workspaces
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

        {/* OAuth Requirement Diagnostic Banner */}
        {isOAuthGated && (
          <div className="oauth-config-notice-card">
            <div className="oauth-notice-head">
              <Info size={16} className="text-cyan" />
              <strong>External OAuth Configuration Status: CONFIGURATION REQUIRED</strong>
            </div>
            <p className="oauth-notice-desc">
              Live automated OAuth popup redirects for <strong>{formData.platform}</strong> require external provider client credentials (e.g. <code>META_APP_ID</code>, <code>META_APP_SECRET</code>) in the production environment. You can provision and register the account record directly into PostgreSQL below for workspace workflow management.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-grid-two-col">
            {/* Client Workspace */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="connect-client-select">
                Associated Client Workspace <span className="text-danger">*</span>
              </label>
              <select
                id="connect-client-select"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.clientName} ({c.industry || 'Client'})
                  </option>
                ))}
                <option value="">Agency Master Workspace</option>
              </select>
            </div>

            {/* Platform Selection */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="connect-platform-select">
                Social Platform Channel <span className="text-danger">*</span>
              </label>
              <select
                id="connect-platform-select"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="META">Meta Business Suite (FB & IG)</option>
                <option value="FACEBOOK">Facebook Page</option>
                <option value="INSTAGRAM">Instagram Business</option>
                <option value="GOOGLE_BUSINESS">Google Business Profile</option>
                <option value="YOUTUBE">YouTube Channel</option>
                <option value="LINKEDIN">LinkedIn Company Page</option>
              </select>
            </div>

            {/* Account / Page Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="connect-account-name">
                Account / Page Name <span className="text-danger">*</span>
              </label>
              <input
                id="connect-account-name"
                type="text"
                placeholder="e.g. Apex Global Growth"
                value={formData.accountName}
                onChange={(e) => {
                  setFormData({ ...formData, accountName: e.target.value });
                  if (errors.accountName) setErrors({ ...errors, accountName: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.accountName ? 'error' : ''}`}
                required
              />
              {errors.accountName && <span className="form-error-msg">{errors.accountName}</span>}
            </div>

            {/* Handle / Username */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="connect-handle">
                Social Handle / URL Slug
              </label>
              <input
                id="connect-handle"
                type="text"
                placeholder="@apex_global"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Platform Account / Page ID */}
            <div className="form-field-group full-width">
              <label className="form-label" htmlFor="connect-platform-id">
                Platform Asset / Page ID (Optional)
              </label>
              <input
                id="connect-platform-id"
                type="text"
                placeholder="e.g. act_182940182901 or 10928301928"
                value={formData.platformAccountId}
                onChange={(e) => setFormData({ ...formData, platformAccountId: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Modal Actions */}
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
              className="btn-saas-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Connecting to PostgreSQL...</span>
              ) : (
                <span>Register Platform Asset</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConnectAccountModal;
