import React from 'react';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function TaskCard({
  task,
  onSelectTask,
  onMoveStage,
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
  const currentStageIndex = stages.indexOf(task.status);
  const canMovePrev = currentStageIndex > 0;
  const canMoveNext = currentStageIndex < stages.length - 1;

  const completedSubtasksCount = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasksCount = task.subtasks?.length || 0;
  const subtaskProgressPercent = totalSubtasksCount > 0
    ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100)
    : 0;

  const isDueToday = task.dueDate === '2026-08-28';

  return (
    <div
      className="kanban-task-card"
      onClick={() => onSelectTask(task)}
    >
      {/* Top Meta Row */}
      <div className="task-card-top-row">
        <div className="task-tags-group">
          <Badge variant={getPriorityVariant(task.priority)} size="sm">
            {task.priority}
          </Badge>
          <span className="task-category-tag">{task.category}</span>
        </div>

        {/* Client Tag */}
        <span className="task-client-tag">🏢 {task.clientName}</span>
      </div>

      {/* Title */}
      <h4 className="task-card-title">{task.title}</h4>

      {/* Subtasks Progress */}
      {totalSubtasksCount > 0 && (
        <div className="task-subtasks-progress-box">
          <div className="subtask-label-row">
            <span className="subtask-icon-text">
              <ListTodo size={12} />
              <span>Subtasks</span>
            </span>
            <span className="subtask-count-text">
              {completedSubtasksCount}/{totalSubtasksCount}
            </span>
          </div>
          <div className="subtask-progress-track">
            <div
              className="subtask-progress-fill"
              style={{ width: `${subtaskProgressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info & Stage Move Arrows */}
      <div className="task-card-footer" onClick={(e) => e.stopPropagation()}>
        {/* Assignee & Due Date */}
        <div className="task-footer-left">
          <div className="assignee-avatar-mini" title={task.assignee}>
            {task.assigneeAvatar || 'AG'}
          </div>
          <span className={`task-due-date-pill ${isDueToday ? 'due-today' : ''}`}>
            <Clock size={11} />
            <span>{isDueToday ? 'Due Today' : task.dueDate}</span>
          </span>
        </div>

        {/* Quick Stage Controls */}
        <div className="task-stage-steppers">
          {canMovePrev && (
            <button
              type="button"
              className="btn-step-stage prev"
              onClick={() => onMoveStage(task.id, stages[currentStageIndex - 1])}
              title={`Move back to ${stages[currentStageIndex - 1]}`}
            >
              <ChevronLeft size={13} />
            </button>
          )}

          {canMoveNext && (
            <button
              type="button"
              className="btn-step-stage next"
              onClick={() => onMoveStage(task.id, stages[currentStageIndex + 1])}
              title={`Advance to ${stages[currentStageIndex + 1]}`}
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
