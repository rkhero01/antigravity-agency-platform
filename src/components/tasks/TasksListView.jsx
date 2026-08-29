import React from 'react';
import { ExternalLink, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function TasksListView({
  tasks = [],
  onSelectTask,
  onMoveStage,
  onDeleteTask,
}) {
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
    <div className="tasks-table-card">
      <div className="tasks-table-responsive">
        <table className="saas-table tasks-feed-table">
          <thead>
            <tr>
              <th>Task Title & Scope</th>
              <th>Client Account</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Workflow Stage</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted">
                  No tasks found matching your filter criteria.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isDueToday = task.dueDate === '2026-08-28';
                const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <tr key={task.id} className="task-row-item">
                    {/* Title & Scope */}
                    <td>
                      <div className="task-title-cell">
                        <strong
                          className="task-title-link clickable"
                          onClick={() => onSelectTask(task)}
                        >
                          {task.title}
                        </strong>
                        <div className="task-meta-subrow">
                          <span className="task-category-pill">{task.category}</span>
                          {totalSubtasks > 0 && (
                            <span className="task-subtask-pill">
                              ✓ {completedSubtasks}/{totalSubtasks} Subtasks
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td>
                      <span className="task-client-name">🏢 {task.clientName}</span>
                    </td>

                    {/* Assignee */}
                    <td>
                      <div className="assignee-cell-row">
                        <span className="assignee-avatar-micro">{task.assigneeAvatar || 'AG'}</span>
                        <span className="assignee-name-text">{task.assignee}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td>
                      <Badge variant={getPriorityVariant(task.priority)} size="sm">
                        {task.priority}
                      </Badge>
                    </td>

                    {/* Workflow Stage */}
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => onMoveStage(task.id, e.target.value)}
                        className={`task-stage-select-input status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Due Date */}
                    <td>
                      <span className={`task-due-text ${isDueToday ? 'due-today-badge' : ''}`}>
                        <Clock size={11} /> {task.dueDate}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onSelectTask(task)}
                          title="Inspect Task & Checklist"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-action danger"
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TasksListView;
