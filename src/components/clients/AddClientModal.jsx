import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  DollarSign,
  Globe,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { mockTeam } from '../../data/mockTeam.js';

export function AddClientModal({ isOpen, onClose, onAddClient }) {
  const initialForm = {
    name: '',
    industry: 'Health & Fitness',
    contactPerson: '',
    email: '',
    phone: '',
    website: 'https://',
    location: '',
    monthlyBudget: 25000,
    tier: 'STANDARD',
    assignedMember: 'Alex Morgan',
    platforms: ['instagram', 'facebook'],
    strategyNote: '',
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

  const handlePlatformToggle = (plat) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(plat);
      return {
        ...prev,
        platforms: exists ? prev.platforms.filter((p) => p !== plat) : [...prev.platforms, plat],
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Business name is required (min 2 characters).';
    }
    if (!formData.contactPerson.trim() || formData.contactPerson.trim().length < 2) {
      newErrors.contactPerson = 'Primary contact person is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Valid business email is required (e.g. name@company.com).';
    }
    const budgetNum = Number(formData.monthlyBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      newErrors.monthlyBudget = 'Monthly retainer must be a positive number or 0.';
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
      await onAddClient({
        name: formData.name.trim(),
        clientName: formData.name.trim(),
        industry: formData.industry,
        contactPerson: formData.contactPerson.trim(),
        primaryContact: formData.contactPerson.trim(),
        email: formData.email.trim(),
        contactEmail: formData.email.trim(),
        phone: formData.phone.trim() || '+1 (555) 000-0000',
        website: formData.website.trim(),
        location: formData.location.trim() || 'Remote',
        monthlyBudget: Number(formData.monthlyBudget) || 0,
        monthlyRetainer: Number(formData.monthlyBudget) || 0,
        tier: formData.tier,
        assignedMember: formData.assignedMember,
        connectedPlatforms: formData.platforms,
        strategyNote: formData.strategyNote.trim() || 'New client onboarding phase.',
      });

      setSuccessMessage(`Client "${formData.name.trim()}" successfully created!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(
        err.message ||
          'Failed to create client workspace in database. Please check your network and inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const platformOptions = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'google-business', label: 'Google Business Profile' },
  ];

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
              <h3 className="modal-title">Onboard New Client Workspace</h3>
              <p className="modal-subtitle">
                Create a persistent client workspace in PostgreSQL database
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

        {/* Success Feedback */}
        {successMessage && (
          <div className="modal-success-banner" role="status">
            <CheckCircle2 size={18} className="success-banner-icon" />
            <span className="success-banner-text">{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-grid-two-col">
            {/* Business Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-business-name">
                Business Name <span className="text-danger">*</span>
              </label>
              <input
                id="client-business-name"
                type="text"
                placeholder="e.g. Acme Health & Wellness"
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

            {/* Industry */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-industry">
                Industry Category <span className="text-danger">*</span>
              </label>
              <select
                id="client-industry"
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

            {/* Contact Person */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-contact-person">
                Primary Contact Person <span className="text-danger">*</span>
              </label>
              <input
                id="client-contact-person"
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.contactPerson}
                onChange={(e) => {
                  setFormData({ ...formData, contactPerson: e.target.value });
                  if (errors.contactPerson) setErrors({ ...errors, contactPerson: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.contactPerson ? 'error' : ''}`}
                required
              />
              {errors.contactPerson && (
                <span className="form-error-msg">{errors.contactPerson}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-contact-email">
                Business Email <span className="text-danger">*</span>
              </label>
              <input
                id="client-contact-email"
                type="email"
                placeholder="jane@acme.com"
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

            {/* Monthly Retainer */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-monthly-retainer">
                Monthly Retainer ($/mo) <span className="text-danger">*</span>
              </label>
              <input
                id="client-monthly-retainer"
                type="number"
                min="0"
                step="500"
                placeholder="25000"
                value={formData.monthlyBudget}
                onChange={(e) => {
                  setFormData({ ...formData, monthlyBudget: e.target.value });
                  if (errors.monthlyBudget) setErrors({ ...errors, monthlyBudget: null });
                }}
                disabled={isSubmitting}
                className={`form-text-input ${errors.monthlyBudget ? 'error' : ''}`}
                required
              />
              {errors.monthlyBudget && (
                <span className="form-error-msg">{errors.monthlyBudget}</span>
              )}
            </div>

            {/* Tier */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-tier">
                Client Tier
              </label>
              <select
                id="client-tier"
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

            {/* Phone */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-phone">
                Phone Number
              </label>
              <input
                id="client-phone"
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Website */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="client-website">
                Website URL
              </label>
              <input
                id="client-website"
                type="text"
                placeholder="https://client.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Social Platforms Selection */}
          <div className="form-platforms-section">
            <label className="form-label">Connect Marketing Channels</label>
            <div className="platform-checkboxes-grid">
              {platformOptions.map((opt) => {
                const isChecked = formData.platforms.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`platform-checkbox-label ${isChecked ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handlePlatformToggle(opt.id)}
                      disabled={isSubmitting}
                      className="hidden-checkbox"
                    />
                    <span className="checkbox-custom-dot" />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Strategy Note */}
          <div className="form-field-group full-width">
            <label className="form-label" htmlFor="client-strategy-note">
              Initial Strategy & Growth Goals
            </label>
            <textarea
              id="client-strategy-note"
              rows={2}
              placeholder="e.g. Lead generation via Meta Ads and brand awareness on Instagram Reels..."
              value={formData.strategyNote}
              onChange={(e) => setFormData({ ...formData, strategyNote: e.target.value })}
              disabled={isSubmitting}
              className="form-textarea-input"
            />
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
                <span>Creating in Database...</span>
              ) : (
                <span>Create Client Workspace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClientModal;
