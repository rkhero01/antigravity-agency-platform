import React, { useState } from 'react';
import { X, FileCheck, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CreateContractModal({
  isOpen,
  onClose,
  onCreateContract,
}) {
  const [formData, setFormData] = useState({
    title: '',
    clientId: 'c1',
    status: 'Draft Proposal',
    monthlyFee: '$10,000',
    billingCycle: 'Monthly Auto-Charge (1st of month)',
    termMonths: '12',
    signatory: 'Authorized Client Officer',
    startDate: 'Oct 01, 2026',
    renewalDate: 'Sep 30, 2027',
    scopeDeliverables: '24 Multi-Channel Posts / month\nManaged Meta & TikTok Ad Campaigns ($35K budget limit)\nBi-Weekly Executive Strategy & Analytics Audits\n24/7 AI-Powered Community Response Moderation',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Agreement title is required';
    if (!formData.monthlyFee.trim()) newErrors.monthlyFee = 'Monthly fee is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreateContract(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-contract-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <FileCheck size={18} />
            </div>
            <div>
              <h3 className="modal-title">Draft Client Retainer / Proposal</h3>
              <p className="modal-subtitle">Establish commercial terms, monthly billing fees, and scope deliverables</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-contract-form">
          <div className="form-field-group">
            <label className="form-label">
              Agreement Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Omnichannel Growth & TikTok Performance Retainer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`form-text-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="form-error-msg">{errors.title}</span>}
          </div>

          <div className="form-grid-three-col">
            <div className="form-field-group">
              <label className="form-label">Client Workspace</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="form-select-input"
              >
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Monthly Retainer Fee</label>
              <input
                type="text"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Agreement Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select-input"
              >
                <option value="Draft Proposal">Draft Proposal</option>
                <option value="Active Retainer">Active Retainer</option>
                <option value="Expiring Soon">Expiring Soon</option>
              </select>
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="form-select-input"
              >
                <option value="Monthly Auto-Charge (1st of month)">Monthly Auto-Charge (1st of month)</option>
                <option value="Monthly Net 15">Monthly Net 15</option>
                <option value="Monthly Net 30">Monthly Net 30</option>
                <option value="Quarterly Advance">Quarterly Advance</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Signatory Representative</label>
              <input
                type="text"
                value={formData.signatory}
                onChange={(e) => setFormData({ ...formData, signatory: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Scope Deliverables (1 per line)</label>
            <textarea
              rows={4}
              value={formData.scopeDeliverables}
              onChange={(e) => setFormData({ ...formData, scopeDeliverables: e.target.value })}
              className="form-textarea-input font-mono text-xs"
            />
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Initialize Agreement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateContractModal;
