import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Shield,
  Layers,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AgencyProfileTab({
  agency,
  currentUser,
  onSaveAgency,
}) {
  const [formData, setFormData] = useState({
    name: agency?.name || '',
    domain: agency?.domain || '',
    plan: agency?.plan || 'ENTERPRISE',
    status: agency?.status || 'ACTIVE',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const isPrivileged =
    currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';

  const handleCopyId = () => {
    if (agency?.id) {
      navigator.clipboard.writeText(agency.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPrivileged) return;

    setApiError(null);
    setSuccessMessage(null);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setApiError('Agency name must be at least 2 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveAgency({
        name: formData.name.trim(),
        domain: formData.domain.trim() || null,
        plan: formData.plan,
        status: formData.status,
      });
      setSuccessMessage('Agency workspace profile updated in PostgreSQL database!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setApiError(err.message || 'Failed to update agency profile in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createdDate = agency?.createdAt
    ? new Date(agency.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not recorded';

  const updatedDate = agency?.updatedAt
    ? new Date(agency.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not recorded';

  return (
    <div className="settings-tab-content-pane">
      {/* Alert Banners */}
      {apiError && (
        <div className="modal-error-banner" role="alert">
          <AlertCircle size={18} className="error-banner-icon" />
          <span className="error-banner-text">{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div className="modal-success-banner" role="status">
          <CheckCircle2 size={18} className="success-banner-icon" />
          <span className="success-banner-text">{successMessage}</span>
        </div>
      )}

      {/* Main Agency Profile Card */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="section-title">Agency Tenant Profile</h3>
            <p className="section-desc">
              Primary multi-tenant agency identity backed by PostgreSQL database
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form-body">
          <div className="settings-form-grid-two">
            {/* Agency Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="agency-name-input">
                Agency Workspace Name <span className="text-danger">*</span>
              </label>
              <input
                id="agency-name-input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isPrivileged || isSubmitting}
                className="form-text-input"
                required
              />
              {!isPrivileged && (
                <span className="form-field-note">
                  🔒 Only Agency OWNER or ADMIN can modify agency name.
                </span>
              )}
            </div>

            {/* Domain */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="agency-domain-input">
                Domain / Workspace Slug
              </label>
              <input
                id="agency-domain-input"
                type="text"
                placeholder="antigravity.agency"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                disabled={!isPrivileged || isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Plan */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="agency-plan-input">
                Subscription Plan
              </label>
              <select
                id="agency-plan-input"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                disabled={!isPrivileged || isSubmitting}
                className="form-select-input"
              >
                <option value="ENTERPRISE">Enterprise SLA Plan</option>
                <option value="PRO">Professional Growth Plan</option>
                <option value="STARTER">Starter Agency Plan</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="agency-status-input">
                Agency Account Status
              </label>
              <select
                id="agency-status-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={!isPrivileged || isSubmitting}
                className="form-select-input"
              >
                <option value="ACTIVE">Active (Provisioned)</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TRIAL">Trial Period</option>
              </select>
            </div>
          </div>

          {isPrivileged && (
            <div className="settings-form-actions">
              <button
                type="submit"
                className="btn-saas-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Saving to PostgreSQL...</span>
                ) : (
                  <span>Save Agency Changes</span>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Database Tenant Identifiers Card */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="section-title">Cryptographic Tenant Identification</h3>
            <p className="section-desc">
              Immutable PostgreSQL multi-tenant isolation identifiers
            </p>
          </div>
        </div>

        <div className="client-details-grid-spec">
          <div className="detail-spec-item full-width">
            <span className="detail-spec-label">Agency Tenant ID (UUID)</span>
            <div className="tenant-id-copy-row">
              <code className="detail-spec-code">{agency?.id || 'Not resolved'}</code>
              <button
                type="button"
                className="btn-copy-id"
                onClick={handleCopyId}
                title="Copy Tenant ID"
              >
                {copiedId ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="detail-spec-item">
            <span className="detail-spec-label">Tenant Provisioned Date</span>
            <strong className="detail-spec-val">{createdDate}</strong>
          </div>

          <div className="detail-spec-item">
            <span className="detail-spec-label">Last Database Sync</span>
            <strong className="detail-spec-val">{updatedDate}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgencyProfileTab;
