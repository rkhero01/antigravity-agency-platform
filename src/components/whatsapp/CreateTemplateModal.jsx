import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Plus,
  Sparkles,
  Layers,
  Globe,
  Tag,
  Building,
} from 'lucide-react';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function CreateTemplateModal({
  isOpen,
  onClose,
  onSubmitTemplate,
  editingTemplate = null,
  clients = whatsappClients,
}) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    clientId: 'c1',
    category: 'Marketing',
    language: 'Hinglish',
    content: '',
    variables: ['Customer_Name'],
    status: 'Approved',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name || '',
        code: editingTemplate.name.toUpperCase() || '',
        clientId: editingTemplate.clientId || 'c1',
        category: editingTemplate.category || 'Marketing',
        language: editingTemplate.language || 'Hinglish',
        content: editingTemplate.content || '',
        variables: editingTemplate.variables || ['Customer_Name'],
        status: editingTemplate.status || 'Approved',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        clientId: 'c1',
        category: 'Marketing',
        language: 'Hinglish',
        content: 'Hi {{1}} 👋, thank you for contacting us regarding your inquiry. Would you like to schedule a quick consultation?',
        variables: ['Customer_Name'],
        status: 'Approved',
      });
    }
  }, [editingTemplate, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
    setFormData((prev) => ({
      ...prev,
      name: val,
      code: slug.toUpperCase(),
    }));
  };

  const handleAddVariable = () => {
    const nextNum = formData.variables.length + 1;
    const varToken = `{{${nextNum}}}`;
    const defaultLabel = nextNum === 2 ? 'Offer_Discount' : nextNum === 3 ? 'Expiry_Date' : `Param_${nextNum}`;

    setFormData((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content} ${varToken}` : varToken,
      variables: [...prev.variables, defaultLabel],
    }));
  };

  const handleVariableLabelChange = (index, label) => {
    const updated = [...formData.variables];
    updated[index] = label;
    setFormData((prev) => ({
      ...prev,
      variables: updated,
    }));
  };

  const handleRemoveVariable = (index) => {
    const updated = formData.variables.filter((_, idx) => idx !== index);
    setFormData((prev) => ({
      ...prev,
      variables: updated,
    }));
  };

  const getPreviewText = () => {
    let text = formData.content;
    formData.variables.forEach((v, idx) => {
      text = text.split(`{{${idx + 1}}}`).join(`[${v || `Var ${idx + 1}`}]`);
    });
    return text;
  };

  const handleSubmit = (statusToSubmit = 'Approved') => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    if (!formData.content.trim()) newErrors.content = 'Message content is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      status: statusToSubmit,
      id: editingTemplate ? editingTemplate.id : undefined,
    };

    onSubmitTemplate(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-template-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="modal-title">
                {editingTemplate ? 'Edit Message Template' : 'Create Meta-Approved WhatsApp Template'}
              </h3>
              <p className="modal-subtitle">
                Configure template categorization, dynamic placeholder parameters, and automated compliance checks
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Body */}
        <div className="create-template-body">
          <div className="create-template-split-two">
            {/* Form Fields Left */}
            <div className="template-form-column">
              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">
                    Template Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. festive_diwali_flash_offer"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`form-text-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="form-error-msg">{errors.name}</span>}
                </div>

                <div className="form-field-group">
                  <label className="form-label">Client Workspace</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="form-select-input"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select-input"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Utility">Utility</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Welcome">Welcome</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Payment">Payment</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="form-select-input"
                  >
                    <option value="Hinglish">Hinglish</option>
                    <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                    <option value="English (US)">English (US)</option>
                  </select>
                </div>
              </div>

              {/* Message Content Editor */}
              <div className="form-field-group mt-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label mb-0">
                    Message Content <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-add-var-pill"
                    onClick={handleAddVariable}
                  >
                    <Plus size={11} />
                    <span>Add Variable {`{{${formData.variables.length + 1}}}`}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="Write your WhatsApp message body with {{1}}, {{2}} placeholders..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`form-textarea ${errors.content ? 'error' : ''}`}
                />
                {errors.content && <span className="form-error-msg">{errors.content}</span>}
              </div>

              {/* Variable Definitions List */}
              {formData.variables.length > 0 && (
                <div className="variables-manager-box">
                  <span className="text-xs text-dim block mb-1.5 font-bold">
                    Define Variable Names:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {formData.variables.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-primary font-mono w-14">{`{{${idx + 1}}}`}:</span>
                        <input
                          type="text"
                          value={v}
                          onChange={(e) => handleVariableLabelChange(idx, e.target.value)}
                          placeholder={`Variable ${idx + 1} description`}
                          className="form-text-input-mini"
                        />
                        <button
                          type="button"
                          className="text-dim hover:text-danger text-xs px-1"
                          onClick={() => handleRemoveVariable(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Real-time WhatsApp Preview Right */}
            <div className="template-preview-column">
              <span className="text-xs text-primary font-bold block mb-2">
                Real-Time WhatsApp Live Simulation
              </span>

              <div className="create-preview-sandbox">
                <div className="sandbox-incoming-bubble">
                  <span>Inbound trigger message...</span>
                </div>

                <div className="sandbox-outgoing-bubble">
                  <div className="template-verified-meta-tag">
                    <Sparkles size={11} /> Meta Verified
                  </div>
                  <p className="sandbox-bubble-text whitespace-pre-wrap leading-relaxed">
                    {getPreviewText() || 'Your message preview will appear here...'}
                  </p>
                  <span className="sandbox-time-stamp">12:30 PM ✓✓</span>
                </div>
              </div>

              <div className="meta-policy-notice-box mt-3">
                <strong className="text-xs text-success block mb-1">
                  ✓ Meta API Compliance Checklist:
                </strong>
                <ul className="text-[11px] text-muted space-y-1 list-disc pl-4">
                  <li>No promotional spam in Authentication category</li>
                  <li>Variable placeholders strictly sequential</li>
                  <li>Opt-out instructions included for promotional blasts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => handleSubmit('Pending')}
          >
            Save as Draft
          </button>

          <button
            type="button"
            className="btn-wa-primary"
            onClick={() => handleSubmit('Approved')}
          >
            <CheckCircle2 size={15} />
            <span>{editingTemplate ? 'Save Changes' : 'Submit for Meta Approval'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTemplateModal;
