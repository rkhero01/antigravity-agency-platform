import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { ROLE_DEFINITIONS } from '../../services/teamService.js';

export function UserProfileTab({
  user,
  onSaveUser,
}) {
  const [name, setName] = useState(user?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const roleMeta = ROLE_DEFINITIONS[user?.role] || ROLE_DEFINITIONS.OPERATOR;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setApiError('Full name must be at least 2 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveUser({ name: name.trim() });
      setSuccessMessage('Your profile name has been updated in database!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setApiError(err.message || 'Failed to update user profile in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = (name || user?.name || 'OP')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

      {/* Profile Overview Card */}
      <div className="settings-section-card">
        <div className="user-profile-hero-head">
          <div className="user-profile-avatar-large">{initials}</div>
          <div className="user-profile-title-group">
            <div className="user-name-role-row">
              <h2 className="user-profile-name">{user?.name}</h2>
              <Badge variant={roleMeta.badgeVariant || 'primary'}>
                {user?.role}
              </Badge>
            </div>
            <p className="user-profile-role-title">{roleMeta.title}</p>
            <span className="user-profile-email-badge">
              <Mail size={13} /> {user?.email}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form-body">
          <div className="settings-form-grid-two">
            {/* Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="operator-name-input">
                Operator Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="operator-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="form-text-input"
                required
              />
            </div>

            {/* Email (Read-Only) */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="operator-email-input">
                Corporate Email Address (Identity)
              </label>
              <input
                id="operator-email-input"
                type="email"
                value={user?.email || ''}
                disabled
                className="form-text-input disabled"
              />
              <span className="form-field-note">
                🔒 Corporate email address is immutable and managed by agency tenant identity.
              </span>
            </div>

            {/* Security Role (Read-Only) */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="operator-role-input">
                Assigned RBAC Security Role
              </label>
              <input
                id="operator-role-input"
                type="text"
                value={`${user?.role} — ${roleMeta.title}`}
                disabled
                className="form-text-input disabled"
              />
            </div>

            {/* Assigned Tenant ID */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="operator-tenant-input">
                Assigned Agency Tenant ID
              </label>
              <input
                id="operator-tenant-input"
                type="text"
                value={user?.agencyId || ''}
                disabled
                className="form-text-input disabled"
              />
            </div>
          </div>

          <div className="settings-form-actions">
            <button
              type="submit"
              className="btn-saas-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Saving Profile...</span>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Role Capabilities Explainer */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Key size={20} />
          </div>
          <div>
            <h3 className="section-title">Active Security Privileges & Scope</h3>
            <p className="section-desc">
              Cryptographically signed capabilities bound to your JWT session
            </p>
          </div>
        </div>

        <div className="role-explainer-card">
          <div className="role-explainer-header">
            <Shield size={16} className="text-cyan" />
            <strong>Role Summary: {roleMeta.title}</strong>
          </div>
          <p className="role-explainer-desc">{roleMeta.description}</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfileTab;
