import React from 'react';
import { Plus, ListTodo } from 'lucide-react';
import { TaskCard } from './TaskCard.jsx';

export function TasksKanbanBoard({
  tasks = [],
  onSelectTask,
  onMoveStage,
  onQuickAddTask,
}) {
  const columns = [
    { id: 'To Do', title: 'To Do', color: '#64748b' },
    { id: 'In Progress', title: 'In Progress', color: '#6366f1' },
    { id: 'Pending Approval', title: 'Pending Approval', color: '#f59e0b' },
    { id: 'Completed', title: 'Completed', color: '#10b981' },
  ];

  return (
    <div className="tasks-kanban-board-grid">
      {columns.map((col) => {
        const tasksInCol = tasks.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="kanban-stage-column">
            {/* Column Header */}
            <div className="kanban-stage-header">
              <div className="stage-title-group">
                <span className="stage-dot" style={{ background: col.color }} />
                <h3 className="stage-name">{col.title}</h3>
                <span className="stage-count-pill">{tasksInCol.length}</span>
              </div>

              <button
                type="button"
                className="btn-quick-add-col"
                onClick={() => onQuickAddTask(col.id)}
                title={`Add new task to ${col.title}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Task Cards Stack */}
            <div className="kanban-cards-stack">
              {tasksInCol.length === 0 ? (
                <div className="kanban-empty-column-card">
                  <ListTodo size={24} className="empty-col-icon" />
                  <p>No tasks in this stage</p>
                  <button
                    type="button"
                    className="btn-empty-add-action"
                    onClick={() => onQuickAddTask(col.id)}
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                tasksInCol.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSelectTask={onSelectTask}
                    onMoveStage={onMoveStage}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TasksKanbanBoard;
