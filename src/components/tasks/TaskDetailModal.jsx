import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Clock,
  User,
  Calendar,
  Building,
  Trash2,
  CheckCircle2,
  Plus,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onMoveStage,
  onToggleSubtask,
  onDeleteTask,
}) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen || !task) return null;

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const stages = ['To Do', 'In Progress', 'Pending Approval', 'Completed'];

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card task-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <CheckSquare size={18} />
            </div>
            <div>
              <div className="task-detail-top-tags">
                <Badge variant={getPriorityVariant(task.priority)} size="sm">
                  {task.priority} Priority
                </Badge>
                <span className="task-category-pill">{task.category}</span>
                <span className={`status-pill-mini status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {task.status}
                </span>
              </div>
              <h3 className="modal-title">{task.title}</h3>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="task-detail-modal-body">
          {/* Metadata Row */}
          <div className="task-meta-box-grid">
            <div className="task-meta-item">
              <span className="label">Client Account</span>
              <strong>🏢 {task.clientName}</strong>
            </div>

            <div className="task-meta-item">
              <span className="label">Assigned Member</span>
              <span>👤 {task.assignee}</span>
            </div>

            <div className="task-meta-item">
              <span className="label">Due Date</span>
              <span><Clock size={13} className="inline-icon" /> {task.dueDate}</span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="task-description-section">
              <h4 className="detail-section-heading">Task Scope & Brief</h4>
              <p className="task-description-text">{task.description}</p>
            </div>
          )}

          {/* Subtasks Checklist */}
          <div className="task-subtasks-section">
            <div className="subtasks-section-header">
              <div className="subtasks-title-group">
                <ListTodo size={16} className="text-primary" />
                <h4 className="detail-section-heading">Subtasks & Deliverables Checklist</h4>
              </div>
              <span className="subtasks-count-pill">
                {task.subtasks?.filter((s) => s.completed).length || 0} / {task.subtasks?.length || 0} Completed
              </span>
            </div>

            <div className="subtasks-interactive-list">
              {task.subtasks?.map((sub) => (
                <label key={sub.id} className={`subtask-check-row ${sub.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => onToggleSubtask(task.id, sub.id)}
                    className="subtask-checkbox"
                  />
                  <span className="subtask-text">{sub.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Workflow Stage Transitions */}
          <div className="task-stage-advance-section">
            <h4 className="detail-section-heading">Advance Workflow Stage</h4>
            <div className="stage-buttons-row">
              {stages.map((stage) => {
                const isCurrent = task.status === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    className={`btn-stage-advance-pill ${isCurrent ? 'current' : ''}`}
                    onClick={() => {
                      onMoveStage(task.id, stage);
                    }}
                  >
                    {isCurrent && <CheckCircle2 size={13} className="text-success inline-icon" />}
                    <span>{stage}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer task-modal-footer">
          <button
            type="button"
            className="btn-delete-icon-only"
            onClick={() => {
              onDeleteTask(task.id);
              onClose();
            }}
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>

          <div className="task-footer-right-actions">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Close
            </button>
            {task.status !== 'Completed' && (
              <button
                type="button"
                className="btn-saas-primary"
                onClick={() => {
                  onMoveStage(task.id, 'Completed');
                  onClose();
                }}
              >
                <CheckCircle2 size={15} />
                <span>Mark Completed</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
