import React from 'react';
import { mockUpcomingTasks } from '../../data/mockDashboard.js';
import { CheckSquare, Clock, ArrowUpRight, AlertCircle, User } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function UpcomingTasks({ onNavigateToTasks }) {
  return (
    <div className="dashboard-widget-card upcoming-tasks-card">
      <div className="widget-header-row">
        <div className="widget-header-text">
          <div className="widget-title-with-icon">
            <CheckSquare size={16} className="text-emerald" />
            <h3 className="widget-title">Upcoming Tasks & Approvals</h3>
          </div>
          <p className="widget-subtitle">Priority client deadlines and approval actions</p>
        </div>
        <button
          type="button"
          className="widget-action-link"
          onClick={onNavigateToTasks}
        >
          <span>View Task Board</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="tasks-feed-list">
        {mockUpcomingTasks.map((task) => (
          <div key={task.id} className="task-feed-card">
            <div className="task-left-section">
              <div className="task-checkbox-mock" />
              <div className="task-title-details">
                <h4 className="task-name">{task.task}</h4>
                <div className="task-subtags-row">
                  <span className="task-client-tag">🏢 {task.client}</span>
                  <span className="task-assignee-pill">
                    <User size={11} /> {task.assignee}
                  </span>
                  <span className="task-due-pill">
                    <Clock size={11} /> {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="task-right-badges">
              <Badge
                variant={
                  task.priority === 'Urgent'
                    ? 'danger'
                    : task.priority === 'High'
                    ? 'warning'
                    : 'info'
                }
                size="sm"
              >
                {task.priority}
              </Badge>
              <span className="task-status-tag">{task.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingTasks;
