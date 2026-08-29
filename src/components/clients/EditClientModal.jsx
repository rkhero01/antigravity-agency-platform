import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Layers,
  Activity,
} from 'lucide-react';

export function EditClientModal({ isOpen, onClose, client, onUpdateClient }) {
  const [formData, setFormData] = useState({
    clientName: '',
    industry: 'Health & Fitness',
    primaryContact: '',
    contactEmail: '',
    monthlyRetainer: 0,
    tier: 'STANDARD',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        clientName: client.clientName || client.name || '',
        industry: client.industry || 'Health & Fitness',
        primaryContact: client.primaryContact || client.contactPerson || '',
        contactEmail: client.contactEmail || client.email || '',
        monthlyRetainer: client.monthlyRetainer ?? client.monthlyBudget ?? 0,
        tier: client.tier || 'STANDARD',
        status: (client.statusRaw || client.status || 'ACTIVE').toUpperCase(),
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.clientName.trim() || formData.clientName.trim().length < 2) {
      newErrors.clientName = 'Business name is required (min 2 characters).';
    }
    if (formData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail.trim())) {
        newErrors.contactEmail = 'Valid business email is required.';
      }
    }
    const retainerNum = Number(formData.monthlyRetainer);
    if (isNaN(retainerNum) || retainerNum < 0) {
      newErrors.monthlyRetainer = 'Monthly retainer must be a non-negative number.';
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
      await onUpdateClient(client.id, {
        clientName: formData.clientName.trim(),
        name: formData.clientName.trim(),
        industry: formData.industry,
        primaryContact: formData.primaryContact.trim() || null,
        contactPerson: formData.primaryContact.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        email: formData.contactEmail.trim() || null,
        monthlyRetainer: Number(formData.monthlyRetainer) || 0,
        monthlyBudget: Number(formData.monthlyRetainer) || 0,
        tier: formData.tier,
        status: formData.status,
      });

      setSuccessMessage(`Client "${formData.clientName.trim()}" updated successfully!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(
        err.message || 'Failed to update client in database. Please check your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="modal-title">Edit Client Workspace</h3>
              <p className="modal-subtitle">
                Update account details and contract tier in PostgreSQL
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

        {/* API Error Message */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-grid-two-col">
            {/* Business Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-client-name">
                Business Name <span className="text-danger">*</span>
              </label>
              <input
                id="edit-client-name"
                type="text"
                value={formData.clientName}
                onChange={(e) => {
                  setFormData({ ...formData, clientName: e.target.value });
                  if (errors.clientName) setErrors({ ...errors, clientName: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.clientName ? 'error' : ''}`}
                required
              />
              {errors.clientName && <span className="form-error-msg">{errors.clientName}</span>}
            </div>

            {/* Industry */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-industry">
                Industry Category <span className="text-danger">*</span>
              </label>
              <select
                id="edit-industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="E-commerce & Retail">E-commerce & Retail</option>
                <option value="Professional Services">Professional Services</option>
                <option value="B2B Software">B2B Software</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Primary Contact */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-contact-person">
                Primary Contact Person
              </label>
              <input
                id="edit-contact-person"
                type="text"
                value={formData.primaryContact}
                onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Contact Email */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-contact-email">
                Business Contact Email
              </label>
              <input
                id="edit-contact-email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => {
                  setFormData({ ...formData, contactEmail: e.target.value });
                  if (errors.contactEmail) setErrors({ ...errors, contactEmail: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.contactEmail ? 'error' : ''}`}
              />
              {errors.contactEmail && (
                <span className="form-error-msg">{errors.contactEmail}</span>
              )}
            </div>

            {/* Monthly Retainer */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-monthly-retainer">
                Monthly Retainer ($/mo) <span className="text-danger">*</span>
              </label>
              <input
                id="edit-monthly-retainer"
                type="number"
                min="0"
                step="500"
                value={formData.monthlyRetainer}
                onChange={(e) => {
                  setFormData({ ...formData, monthlyRetainer: e.target.value });
                  if (errors.monthlyRetainer) setErrors({ ...errors, monthlyRetainer: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.monthlyRetainer ? 'error' : ''}`}
                required
              />
              {errors.monthlyRetainer && (
                <span className="form-error-msg">{errors.monthlyRetainer}</span>
              )}
            </div>

            {/* Tier */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-tier">
                Client Tier
              </label>
              <select
                id="edit-tier"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="STANDARD">Standard Tier</option>
                <option value="GROWTH">Growth Tier</option>
                <option value="ENTERPRISE">Enterprise Tier</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="edit-status">
                Account Status
              </label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Modal Footer Actions */}
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

export default EditClientModal;
