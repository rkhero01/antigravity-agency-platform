import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Building,
  DollarSign,
  Phone,
  Mail,
  Target,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';
import { campaignsService } from '../../services/campaignsService.js';
import { CRM_STAGES, CRM_SOURCES } from '../../services/crmService.js';

export function AddLeadModal({
  isOpen,
  onClose,
  onCreateLead,
}) {
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    campaignId: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'DIRECT',
    stage: 'NEW',
    value: '50000',
    owner: '',
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
        campaignId: '',
        name: '',
        company: '',
        email: '',
        phone: '',
        source: 'DIRECT',
        stage: 'NEW',
        value: '50000',
        owner: '',
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const loadPrerequisites = async () => {
    try {
      const [clientList, campList] = await Promise.all([
        clientsService.getClients(),
        campaignsService.getCampaigns(),
      ]);
      setClients(clientList);
      setCampaigns(campList);
      if (clientList.length > 0) {
        setFormData((prev) => ({ ...prev, clientId: clientList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load prerequisites in add lead modal:', e);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Lead contact name is required (min 2 characters).';
    }
    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client workspace.';
    }
    if (formData.value === '' || isNaN(Number(formData.value)) || Number(formData.value) < 0) {
      newErrors.value = 'Deal value must be a positive number.';
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
      await onCreateLead({
        clientId: formData.clientId,
        campaignId: formData.campaignId || null,
        name: formData.name.trim(),
        company: formData.company ? formData.company.trim() : null,
        email: formData.email ? formData.email.trim().toLowerCase() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        source: formData.source,
        stage: formData.stage,
        value: Number(formData.value),
        owner: formData.owner ? formData.owner.trim() : null,
      });

      setSuccessMessage(`Lead "${formData.name.trim()}" created successfully in PostgreSQL!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setApiError(err.message || 'Failed to create lead in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const compatibleCampaigns = campaigns.filter((c) => !formData.clientId || c.clientId === formData.clientId);

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
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="modal-title">Add New Inbound Lead</h3>
              <p className="modal-subtitle">
                Register contact opportunity bound to client CRM pipeline
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
              <label className="form-label" htmlFor="add-lead-client">
                Client Workspace <span className="text-danger">*</span>
              </label>
              <select
                id="add-lead-client"
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

            {/* Campaign Attribution */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-campaign">
                Campaign Attribution
              </label>
              <select
                id="add-lead-campaign"
                value={formData.campaignId}
                onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                <option value="">Direct / Organic (No Campaign)</option>
                {compatibleCampaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name || camp.title} ({camp.platform})
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-name">
                Contact Name <span className="text-danger">*</span>
              </label>
              <input
                id="add-lead-name"
                type="text"
                placeholder="e.g. Karan Mehra"
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

            {/* Company Name */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-company">
                Company / Organization
              </label>
              <input
                id="add-lead-company"
                type="text"
                placeholder="e.g. Gold Fit Gyms Pvt Ltd"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Email */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-email">
                Email Address
              </label>
              <input
                id="add-lead-email"
                type="email"
                placeholder="karan@goldfit.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Phone */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-phone">
                Phone Number
              </label>
              <input
                id="add-lead-phone"
                type="tel"
                placeholder="+91 98111 22334"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isSubmitting}
                className="form-text-input"
              />
            </div>

            {/* Source */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-source">
                Channel Source <span className="text-danger">*</span>
              </label>
              <select
                id="add-lead-source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                {CRM_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Initial Stage */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-stage">
                Pipeline Stage <span className="text-danger">*</span>
              </label>
              <select
                id="add-lead-stage"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                disabled={isSubmitting}
                className="form-select-input"
              >
                {CRM_STAGES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Deal Value */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-value">
                Estimated Deal Value ($) <span className="text-danger">*</span>
              </label>
              <input
                id="add-lead-value"
                type="number"
                min="0"
                step="500"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                disabled={isSubmitting}
                className={`form-text-input ${errors.value ? 'error' : ''}`}
                required
              />
              {errors.value && <span className="form-error-msg">{errors.value}</span>}
            </div>

            {/* Lead Owner */}
            <div className="form-field-group">
              <label className="form-label" htmlFor="add-lead-owner">
                Assigned Sales Operator
              </label>
              <input
                id="add-lead-owner"
                type="text"
                placeholder="e.g. Diya Patel"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
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
              className="btn-add-client-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Persisting to PostgreSQL...</span>
              ) : (
                <span>Register Opportunity</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLeadModal;
