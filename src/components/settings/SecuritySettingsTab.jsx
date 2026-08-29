import React, { useState } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export function SecuritySettingsTab({ onChangePassword }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!formData.currentPassword) {
      setApiError('Current password is required.');
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 8) {
      setApiError('New password must be at least 8 characters long.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setApiError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onChangePassword(formData.currentPassword, formData.newPassword);
      setSuccessMessage('Password successfully changed and updated in database!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setApiError(
        err.message || 'Failed to change password. Please verify current password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Change Password Card */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="section-title">Change Account Password</h3>
            <p className="section-desc">
              Update your operator credentials using cryptographic scrypt verification
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form-body">
          <div className="settings-form-grid-two">
            {/* Current Password */}
            <div className="form-field-group full-width">
              <label className="form-label" htmlFor="current-password-input">
                Current Password <span className="text-danger">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="current-password-input"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="form-text-input"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="new-password-input">
                New Password (min 8 characters) <span className="text-danger">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="new-password-input"
                  type={showNew ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="form-text-input"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="confirm-password-input">
                Confirm New Password <span className="text-danger">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-password-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-type new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="form-text-input"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="settings-form-actions">
            <button
              type="submit"
              className="btn-saas-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Verifying & Updating...</span>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Architecture Info */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <div className="section-header-icon-box">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="section-title">Cryptographic Security Safeguards</h3>
            <p className="section-desc">Active session protections and hashing standards</p>
          </div>
        </div>

        <div className="security-specs-list">
          <div className="security-spec-item">
            <strong className="spec-item-title">Scrypt Salted Password Hashing</strong>
            <p className="spec-item-desc">
              Passwords are cryptographically salted and hashed using CPU/memory hard scrypt primitives. Plaintext is never persisted.
            </p>
          </div>
          <div className="security-spec-item">
            <strong className="spec-item-title">HMAC-SHA256 JWT Authentication</strong>
            <p className="spec-item-desc">
              Every API transaction requires a cryptographically verified bearer token bound to your tenant agency ID.
            </p>
          </div>
          <div className="security-spec-item">
            <strong className="spec-item-title">Hard Real-Mode Safety Gate</strong>
            <p className="spec-item-desc">
              External real execution systems (WhatsApp, Paid Ads, SEO crawlers) remain safely locked in sandbox simulation mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettingsTab;
