import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, DollarSign, Globe, MapPin, Sparkles } from 'lucide-react';
import { mockTeam } from '../../data/mockTeam.js';

export function AddClientModal({ isOpen, onClose, onAddClient }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Health & Fitness',
    contactPerson: '',
    email: '',
    phone: '',
    website: 'https://',
    location: '',
    monthlyBudget: 3000,
    assignedMember: 'Alex Morgan',
    platforms: ['instagram', 'facebook'],
    strategyNote: '',
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email.trim() || !formData.email.includes('@'))
      newErrors.email = 'Valid email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddClient({
      name: formData.name.trim(),
      industry: formData.industry,
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '+1 (555) 000-0000',
      website: formData.website.trim(),
      location: formData.location.trim() || 'Remote',
      monthlyBudget: Number(formData.monthlyBudget) || 2500,
      assignedMember: formData.assignedMember,
      connectedPlatforms: formData.platforms,
      strategyNote: formData.strategyNote.trim() || 'New client onboarding phase.',
    });

    onClose();
  };

  const platformOptions = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'google-business', label: 'Google Business Profile' },
  ];

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="modal-title">Onboard New Client Workspace</h3>
              <p className="modal-subtitle">Add a business account and link social channels</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-grid-two-col">
            {/* Business Name */}
            <div className="form-field-group">
              <label className="form-label">
                Business Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Health & Wellness"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`form-text-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            {/* Industry */}
            <div className="form-field-group">
              <label className="form-label">Industry Category</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
              <label className="form-label">
                Primary Contact Person <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className={`form-text-input ${errors.contactPerson ? 'error' : ''}`}
              />
              {errors.contactPerson && (
                <span className="form-error-msg">{errors.contactPerson}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-field-group">
              <label className="form-label">
                Business Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                placeholder="jane@acme.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`form-text-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="form-field-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-text-input"
              />
            </div>

            {/* Monthly Budget */}
            <div className="form-field-group">
              <label className="form-label">Monthly Retainer ($)</label>
              <input
                type="number"
                placeholder="3000"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                className="form-text-input"
              />
            </div>

            {/* Website */}
            <div className="form-field-group">
              <label className="form-label">Website URL</label>
              <input
                type="text"
                placeholder="https://client.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="form-text-input"
              />
            </div>

            {/* Assigned Member */}
            <div className="form-field-group">
              <label className="form-label">Assigned Account Lead</label>
              <select
                value={formData.assignedMember}
                onChange={(e) => setFormData({ ...formData, assignedMember: e.target.value })}
                className="form-select-input"
              >
                {mockTeam.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role.split('/')[0].trim()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Social Platforms Selection */}
          <div className="form-platforms-section">
            <label className="form-label">Connect Social Channels</label>
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
            <label className="form-label">Initial Marketing Strategy / Goals</label>
            <textarea
              rows={2}
              placeholder="e.g. Lead generation via Meta Ads and brand awareness on Instagram Reels..."
              value={formData.strategyNote}
              onChange={(e) => setFormData({ ...formData, strategyNote: e.target.value })}
              className="form-textarea-input"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <span>Create Client Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClientModal;
