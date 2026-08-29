import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, Building, Shield } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function InviteMemberModal({
  isOpen,
  onClose,
  onInviteMember,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    roleType: 'Creator',
    assignedClientIds: ['c1', 'c2'],
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const roles = [
    { type: 'Admin', title: 'Agency Admin', desc: 'Full access to billing, team roles, and all client workspaces' },
    { type: 'Manager', title: 'Creative Manager', desc: 'Can review content, approve sign-offs, and assign deliverables' },
    { type: 'Creator', title: 'Content Creator', desc: 'Can draft posts, use AI studio, and submit content for review' },
    { type: 'Analyst', title: 'Performance Analyst', desc: 'Can manage paid campaigns, scale budgets, and export analytics' },
  ];

  const handleToggleClient = (clientId) => {
    const current = formData.assignedClientIds;
    if (current.includes(clientId)) {
      setFormData({
        ...formData,
        assignedClientIds: current.filter((id) => id !== clientId),
      });
    } else {
      setFormData({
        ...formData,
        assignedClientIds: [...current, clientId],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onInviteMember({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '+1 (512) 555-0199',
      jobTitle: formData.jobTitle.trim() || `${formData.roleType} Specialist`,
      roleType: formData.roleType,
      role: `${formData.roleType} Specialist`,
      assignedClientIds: formData.assignedClientIds,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
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
              <h3 className="modal-title">Invite Agency Team Member</h3>
              <p className="modal-subtitle">Grant role-based access and assign client workspaces</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="invite-member-form">
          <div className="form-grid-two-col">
            {/* Full Name */}
            <div className="form-field-group">
              <label className="form-label">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Jordan Hayes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`form-text-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-field-group">
              <label className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                placeholder="jordan.h@agency.pulse"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`form-text-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>
          </div>

          <div className="form-grid-two-col">
            {/* Job Title */}
            <div className="form-field-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Motion Designer & Copywriter"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="form-text-input"
              />
            </div>

            {/* Phone */}
            <div className="form-field-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (512) 555-0199"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          {/* Role Tier Selection Cards */}
          <div className="form-field-group">
            <label className="form-label">Select Role Tier</label>
            <div className="role-tier-selector-grid">
              {roles.map((r) => (
                <div
                  key={r.type}
                  className={`role-option-card ${formData.roleType === r.type ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, roleType: r.type })}
                >
                  <div className="role-opt-top">
                    <Shield size={14} className="text-primary" />
                    <strong className="role-opt-title">{r.title}</strong>
                  </div>
                  <p className="role-opt-desc">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Client Workspaces Allocation */}
          <div className="form-field-group">
            <label className="form-label">Assign Client Workspaces</label>
            <div className="client-assign-checkboxes-grid">
              {mockClients.map((client) => {
                const isSelected = formData.assignedClientIds.includes(client.id);
                return (
                  <label
                    key={client.id}
                    className={`client-check-pill ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleClient(client.id)}
                    />
                    <span>{client.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteMemberModal;
