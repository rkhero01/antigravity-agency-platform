import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Building,
  Shield,
  Mail,
  User,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { TEAM_ROLES, ROLE_DEFINITIONS } from '../../services/teamService.js';

export function InviteMemberModal({ isOpen, onClose, onInviteMember }) {
  const initialForm = {
    name: '',
    email: '',
    role: TEAM_ROLES.OPERATOR,
    department: 'Operations & Paid Media',
    shiftHours: '09:00 - 18:00',
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      await onInviteMember({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        department: formData.department.trim(),
        shiftHours: formData.shiftHours.trim() || '09:00 - 18:00',
      });

      setSuccessMessage(`Team member "${formData.name.trim()}" onboarded successfully!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(
        err.message || 'Failed to add team member to database. Please check inputs.'
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
        className="modal-dialog-card invite-member-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="modal-title">Add Team Member</h3>
              <p className="modal-subtitle">
                Provision role-based access in PostgreSQL database
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
            {/* Full Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="member-full-name">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="member-full-name"
                type="text"
                placeholder="e.g. Rachel Green"
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
              <label className="form-label" htmlFor="member-email">
                Agency Email Address <span className="text-danger">*</span>
              </label>
              <input
                id="member-email"
                type="email"
                placeholder="rachel@antigravity.agency"
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
              <label className="form-label" htmlFor="member-role">
                Assigned Agency Role <span className="text-danger">*</span>
              </label>
              <select
                id="member-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.role} value={opt.role}>
                    {opt.title} ({opt.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="member-department">
                Department Sector <span className="text-danger">*</span>
              </label>
              <select
                id="member-department"
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
              <label className="form-label" htmlFor="member-shift">
                Operating Shift Hours
              </label>
              <input
                id="member-shift"
                type="text"
                placeholder="09:00 - 18:00"
                value={formData.shiftHours}
                onChange={(e) => setFormData({ ...formData, shiftHours: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Role Explainer Card */}
          <div className="role-explainer-card">
            <div className="role-explainer-header">
              <Shield size={15} className="text-cyan" />
              <strong>{ROLE_DEFINITIONS[formData.role]?.title} Privileges:</strong>
            </div>
            <p className="role-explainer-desc">
              {ROLE_DEFINITIONS[formData.role]?.description}
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
                <span>Adding to Database...</span>
              ) : (
                <span>Add Team Member</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteMemberModal;
