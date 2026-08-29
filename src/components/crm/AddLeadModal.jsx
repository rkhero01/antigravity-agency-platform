import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { CRM_STAGES } from './LeadPipeline.jsx';

export function AddLeadModal({
  isOpen,
  onClose,
  onAddLead,
}) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    clientId: 'c1',
    source: 'Meta Ads',
    campaign: 'VIP Acquisition Blitz',
    value: '12000',
    status: 'New Lead',
    priority: 'High',
    assignedStaff: 'Elena Rostova',
    nextFollowUp: 'Tomorrow at 10:00 AM',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Contact name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddLead(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card add-lead-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create Inbound Sales Lead</h3>
              <p className="modal-subtitle">Register new contact, assign sales rep, and set automated follow-up cadence</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="add-lead-form">
          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alexander Wright"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`form-text-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            <div className="form-field-group">
              <label className="form-label">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Wright Capital Partners"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-two-col">
            <div className="form-field-group">
              <label className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="alex@wrightcapital.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`form-text-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>

            <div className="form-field-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (512) 555-0199"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-text-input"
              />
            </div>
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
              <label className="form-label">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="form-select-input"
              >
                <option value="Meta Ads">Meta Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website">Website</option>
                <option value="Organic Search">Organic Search</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Est. Deal Value ($)</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-three-col">
            <div className="form-field-group">
              <label className="form-label">Initial Stage</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select-input"
              >
                {CRM_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="form-select-input"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Assigned Staff</label>
              <select
                value={formData.assignedStaff}
                onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                className="form-select-input"
              >
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Marcus Chen">Marcus Chen</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Sarah Jenkins">Sarah Jenkins</option>
                <option value="David Vance">David Vance</option>
              </select>
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-label">Initial Sales Notes</label>
            <textarea
              rows={2}
              placeholder="Enter discovery notes, lead requirements, or referral context..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea-input"
            />
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Register Lead & Start Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLeadModal;
