import React, { useState, useEffect } from 'react';
import {
  X,
  CalendarCheck,
  Clock,
  User,
  Building,
  DollarSign,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { whatsappClients, whatsappTeamMembers } from '../../data/mockWhatsApp.js';

export function CreateFollowUpModal({
  isOpen,
  onClose,
  onSubmitFollowUp,
  editingItem = null,
  clients = whatsappClients,
  teamMembers = whatsappTeamMembers,
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    clientId: 'c1',
    assignedStaff: 'Rajesh Sharma',
    dueDate: 'Today at 05:00 PM',
    type: 'WhatsApp',
    priority: 'High',
    dealValue: 25000,
    leadStage: 'Qualified',
    leadScore: 85,
    reason: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData({
        customerName: editingItem.customerName || '',
        phone: editingItem.phone || '',
        email: editingItem.email || '',
        clientId: editingItem.clientId || 'c1',
        assignedStaff: editingItem.assignedStaff || 'Rajesh Sharma',
        dueDate: editingItem.dueDate || 'Today at 05:00 PM',
        type: editingItem.type || 'WhatsApp',
        priority: editingItem.priority || 'High',
        dealValue: editingItem.dealValue || 25000,
        leadStage: editingItem.leadStage || 'Qualified',
        leadScore: editingItem.leadScore || 85,
        reason: editingItem.reason || '',
      });
    } else {
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        clientId: 'c1',
        assignedStaff: 'Rajesh Sharma',
        dueDate: 'Today at 05:00 PM',
        type: 'WhatsApp',
        priority: 'High',
        dealValue: 25000,
        leadStage: 'Qualified',
        leadScore: 85,
        reason: '',
      });
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.reason.trim()) newErrors.reason = 'Follow-up reason/agenda is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const client = clients.find((c) => c.id === formData.clientId) || clients[0];
    const payload = {
      ...formData,
      clientName: client.name,
      id: editingItem ? editingItem.id : undefined,
      status: formData.dueDate.toLowerCase().includes('today')
        ? 'Due Today'
        : formData.dueDate.toLowerCase().includes('tomorrow')
        ? 'Due Tomorrow'
        : 'Upcoming',
    };

    onSubmitFollowUp(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-followup-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <CalendarCheck size={18} />
            </div>
            <div>
              <h3 className="modal-title">
                {editingItem ? 'Edit Scheduled Follow-up' : 'Schedule WhatsApp Pipeline Follow-up'}
              </h3>
              <p className="modal-subtitle">
                Set customer touchpoint date, priority level, assigned operator, and CRM agenda
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-followup-form">
          <div className="form-grid-three-col">
            {/* Customer Name */}
            <div className="form-field-group">
              <label className="form-label">
                Customer Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rohit Sharma"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className={`form-text-input ${errors.customerName ? 'error' : ''}`}
              />
              {errors.customerName && <span className="form-error-msg">{errors.customerName}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-field-group">
              <label className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+91 98201 44556"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`form-text-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
            </div>

            {/* Email */}
            <div className="form-field-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-three-col">
            {/* Client Workspace */}
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

            {/* Assigned Staff */}
            <div className="form-field-group">
              <label className="form-label">Assigned Staff</label>
              <select
                value={formData.assignedStaff}
                onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                className="form-select-input"
              >
                {teamMembers.map((tm) => (
                  <option key={tm.id} value={tm.name}>
                    {tm.name} ({tm.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Timeline */}
            <div className="form-field-group">
              <label className="form-label">Due Date &amp; Time</label>
              <input
                type="text"
                placeholder="Today at 05:00 PM"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="form-text-input"
              />
            </div>
          </div>

          <div className="form-grid-four-col">
            {/* Type */}
            <div className="form-field-group">
              <label className="form-label">Action Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form-select-input"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Demo">Demo</option>
                <option value="Proposal">Proposal</option>
                <option value="Payment">Payment</option>
                <option value="Appointment">Appointment</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-field-group">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="form-select-input"
              >
                <option value="VIP">VIP Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Deal Value */}
            <div className="form-field-group">
              <label className="form-label">Deal Value (₹)</label>
              <input
                type="number"
                value={formData.dealValue}
                onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                className="form-text-input"
              />
            </div>

            {/* CRM Stage */}
            <div className="form-field-group">
              <label className="form-label">CRM Deal Stage</label>
              <select
                value={formData.leadStage}
                onChange={(e) => setFormData({ ...formData, leadStage: e.target.value })}
                className="form-select-input"
              >
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
              </select>
            </div>
          </div>

          {/* Agenda / Reason */}
          <div className="form-field-group">
            <label className="form-label">
              Follow-up Agenda / Strategic Objective <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Discuss Q3 Corporate IP Retainer discount, verify trial appointment time slot, and collect payment link..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className={`form-textarea ${errors.reason ? 'error' : ''}`}
            />
            {errors.reason && <span className="form-error-msg">{errors.reason}</span>}
          </div>

          {/* Dialog Footer */}
          <div className="modal-dialog-footer mt-4">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-wa-primary">
              <CheckCircle2 size={16} />
              <span>{editingItem ? 'Save Changes' : 'Schedule Follow-up'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateFollowUpModal;
