import React, { useState } from 'react';
import { X, PlusSquare, CheckCircle2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CreateTaskModal({
  isOpen,
  onClose,
  initialStage = 'To Do',
  onCreateTask,
}) {
  const [formData, setFormData] = useState({
    title: '',
    clientId: 'c1',
    category: 'Content Production',
    assignee: 'Alex Morgan',
    priority: 'High',
    status: initialStage || 'To Do',
    dueDate: '2026-08-30',
    description: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const categories = [
    'Content Production',
    'AI Copywriting',
    'Client Sign-off',
    'Paid Media',
    'Analytics & Reporting',
    'Technical Integration',
    'Client Strategy',
    'General Operations',
  ];

  const assignees = ['Alex Morgan', 'Elena Rostova', 'Sarah Vance', 'Devon Miles'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedClient = mockClients.find((c) => c.id === formData.clientId);

    onCreateTask({
      title: formData.title.trim(),
      clientId: formData.clientId,
      clientName: selectedClient ? selectedClient.name : 'Agency Client',
      category: formData.category,
      assignee: formData.assignee,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      description: formData.description.trim(),
      subtasks: [
        { id: 'sub-1', title: 'Review deliverable requirements', completed: false },
        { id: 'sub-2', title: 'Complete primary milestone', completed: false },
        { id: 'sub-3', title: 'Obtain team/client sign-off', completed: false },
      ],
    });

    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card create-task-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <PlusSquare size={18} />
            </div>
            <div>
              <h3 className="modal-title">Create New Agency Task</h3>
              <p className="modal-subtitle">Assign deliverables, priority milestones, and client review stages</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="create-task-form">
          {/* Task Title */}
          <div className="form-field-group">
            <label className="form-label">
              Task Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Produce and schedule 8 high-energy workout reels for Apex"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`form-text-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="form-error-msg">{errors.title}</span>}
          </div>

          <div className="form-grid-two-col">
            {/* Client */}
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

            {/* Category */}
            <div className="form-field-group">
              <label className="form-label">Task Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select-input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-three-col">
            {/* Assignee */}
            <div className="form-field-group">
              <label className="form-label">Assigned Member</label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="form-select-input"
              >
                {assignees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="form-field-group">
              <label className="form-label">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="form-select-input"
              >
                <option value="Urgent">🔥 Urgent</option>
                <option value="High">⚡ High</option>
                <option value="Medium">✨ Medium</option>
                <option value="Low">💤 Low</option>
              </select>
            </div>

            {/* Initial Stage */}
            <div className="form-field-group">
              <label className="form-label">Initial Stage</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select-input"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-field-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="form-text-input"
            />
          </div>

          {/* Description */}
          <div className="form-field-group">
            <label className="form-label">Scope & Instructions</label>
            <textarea
              rows={3}
              placeholder="Outline deliverables, assets needed, and links to creative guidelines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
