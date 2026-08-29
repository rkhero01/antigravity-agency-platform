import React, { useState } from 'react';
import { X, Clock, Plus, Trash2, CheckCircle2, Mail, Calendar } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function ScheduleReportModal({
  isOpen,
  onClose,
  schedules = [],
  onAddSchedule,
  onDeleteSchedule,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    clientId: 'c1',
    recipientEmail: '',
    frequency: 'Weekly (Monday 09:00 AM)',
    format: 'Executive Summary PDF',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSchedule(formData);
    setIsAdding(false);
    setFormData({
      clientId: 'c1',
      recipientEmail: '',
      frequency: 'Weekly (Monday 09:00 AM)',
      format: 'Executive Summary PDF',
    });
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card schedule-reports-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="modal-title">Automated Client Report Schedules</h3>
              <p className="modal-subtitle">Configure recurring PDF performance reports delivered directly to clients</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="schedules-modal-body">
          {/* Top Actions */}
          <div className="schedules-top-bar">
            <span className="active-schedules-count">{schedules.length} Active Schedules</span>
            {!isAdding && (
              <button
                type="button"
                className="btn-add-schedule-trigger"
                onClick={() => setIsAdding(true)}
              >
                <Plus size={14} />
                <span>Add New Schedule</span>
              </button>
            )}
          </div>

          {/* Add New Schedule Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="add-schedule-form-box">
              <h4 className="add-form-heading">Create Recurring Delivery</h4>

              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">Client Account</label>
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
                  <label className="form-label">Recipient Email</label>
                  <input
                    type="email"
                    required
                    placeholder="client.executive@brand.com"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="form-text-input"
                  />
                </div>
              </div>

              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">Delivery Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="form-select-input"
                  >
                    <option value="Weekly (Monday 09:00 AM)">Weekly (Every Monday 09:00 AM)</option>
                    <option value="Bi-Weekly (1st & 15th)">Bi-Weekly (1st & 15th of month)</option>
                    <option value="Monthly (1st of month)">Monthly (1st of each month)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="form-label">Report Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="form-select-input"
                  >
                    <option value="Executive Summary PDF">Executive Summary PDF</option>
                    <option value="Full Performance Pack + CSV">Full Performance Pack + CSV</option>
                  </select>
                </div>
              </div>

              <div className="form-actions-inline">
                <button
                  type="button"
                  className="btn-saas-secondary btn-sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-saas-primary btn-sm">
                  <CheckCircle2 size={14} />
                  <span>Save Schedule</span>
                </button>
              </div>
            </form>
          )}

          {/* Schedules List */}
          <div className="schedules-cards-list">
            {schedules.map((item) => (
              <div key={item.id} className="schedule-item-card">
                <div className="schedule-card-left">
                  <div className="sched-client-row">
                    <strong className="sched-client-name">🏢 {item.clientName}</strong>
                    <span className="sched-status-badge active">{item.status}</span>
                  </div>
                  <div className="sched-meta-details">
                    <span><Mail size={12} className="inline-icon" /> {item.email}</span>
                    <span>•</span>
                    <span><Calendar size={12} className="inline-icon" /> {item.frequency}</span>
                    <span>•</span>
                    <span>Format: <strong>{item.format}</strong></span>
                  </div>
                  <span className="sched-last-sent">Last Dispatched: {item.lastSent}</span>
                </div>

                <div className="schedule-card-actions">
                  <button
                    type="button"
                    className="btn-delete-schedule"
                    onClick={() => onDeleteSchedule(item.id)}
                    title="Remove Schedule"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleReportModal;
