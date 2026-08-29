import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Briefcase,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { TEAM_ROLES, ROLE_DEFINITIONS } from '../../services/teamService.js';

export function EditMemberModal({
  member,
  isOpen,
  onClose,
  onSaveMember,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: TEAM_ROLES.OPERATOR,
    department: 'Operations & Paid Media',
    shiftHours: '09:00 - 18:00',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        role: member.role || TEAM_ROLES.OPERATOR,
        department: member.department || 'General Operations',
        shiftHours: member.shiftHours || '09:00 - 18:00',
        status: (member.statusRaw || member.status || 'ACTIVE').toUpperCase(),
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Full name is required (min 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Valid corporate email address is required.';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSaveMember(member.id, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        department: formData.department.trim(),
        shiftHours: formData.shiftHours.trim(),
        status: formData.status,
      });

      setSuccessMessage(`Team member "${formData.name.trim()}" updated successfully!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(
        err.message || 'Failed to update member in database. Please check inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { role: TEAM_ROLES.ADMIN, ...ROLE_DEFINITIONS.ADMIN },
    { role: TEAM_ROLES.MANAGER, ...ROLE_DEFINITIONS.MANAGER },
    { role: TEAM_ROLES.OPERATOR, ...ROLE_DEFINITIONS.OPERATOR },
    { role: TEAM_ROLES.ANALYST, ...ROLE_DEFINITIONS.ANALYST },
    { role: TEAM_ROLES.VIEWER, ...ROLE_DEFINITIONS.VIEWER },
  ];

  return (
    <div className="modal-backdrop-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div
        className="modal-dialog-card edit-member-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <User size={18} />
            </div>
            <div>
              <h3 className="modal-title">Edit Team Member</h3>
              <p className="modal-subtitle">
                Update account details and role permissions in PostgreSQL
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-grid-two-col">
            {/* Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-member-name">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="edit-member-name"
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

            {/* Email */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-member-email">
                Agency Email Address <span className="text-danger">*</span>
              </label>
              <input
                id="edit-member-email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.email ? 'error' : ''}`}
                required
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>

            {/* Role */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-member-role">
                Agency Role
              </label>
              <select
                id="edit-member-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={isSubmitting || member.role === TEAM_ROLES.OWNER}
                className="form-select-input"
              >
                {member.role === TEAM_ROLES.OWNER && (
                  <option value={TEAM_ROLES.OWNER}>Agency Owner (OWNER)</option>
                )}
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role}>
                    {opt.title} ({opt.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-member-dept">
                Department Sector
              </label>
              <select
                id="edit-member-dept"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="Operations & Paid Media">Operations & Paid Media</option>
                <option value="Creative Strategy & Copy">Creative Strategy & Copy</option>
                <option value="Client Success & Accounts">Client Success & Accounts</option>
                <option value="Engineering & AI Studio">Engineering & AI Studio</option>
                <option value="Executive Leadership">Executive Leadership</option>
                <option value="General Operations">General Operations</option>
              </select>
            </div>

            {/* Shift Hours */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-member-shift">
                Operating Shift Hours
              </label>
              <input
                id="edit-member-shift"
                type="text"
                value={formData.shiftHours}
                onChange={(e) => setFormData({ ...formData, shiftHours: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Status */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-member-status">
                Account Status
              </label>
              <select
                id="edit-member-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Role Explainer Card */}
          <div className="role-explainer-card">
            <div className="role-explainer-header">
              <Shield size={15} className="text-cyan" />
              <strong>{ROLE_DEFINITIONS[formData.role]?.title || 'Role'} Permissions:</strong>
            </div>
            <p className="role-explainer-desc">
              {ROLE_DEFINITIONS[formData.role]?.description || 'Agency workspace access.'}
            </p>
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

export default EditMemberModal;
