import React from 'react';
import {
  CheckSquare,
  Plus,
  LayoutGrid,
  List,
  Building,
  Filter,
  User,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function TasksHeader({
  metrics,
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
}) {
  const priorities = ['all', 'Urgent', 'High', 'Medium', 'Low'];
  const assignees = ['all', 'Alex Morgan', 'Elena Rostova', 'Sarah Vance', 'Devon Miles'];

  return (
    <div className="tasks-header-container">
      {/* Top Banner */}
      <div className="tasks-top-banner">
        <div className="tasks-title-block">
          <div className="tasks-badge-tag">
            <CheckSquare size={14} />
            <span>Agency Task & Approval Pipeline</span>
          </div>
          <h1 className="tasks-main-title">Tasks & Approval Workflows</h1>
          <p className="tasks-subtitle-text">
            Coordinate team deliverables, creative production, client content sign-offs, and deadline tracking.
          </p>
        </div>

        <div className="tasks-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => onViewModeChange('kanban')}
            >
              <LayoutGrid size={15} />
              <span>Kanban Board</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              <List size={15} />
              <span>Table View</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-create-task-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Quick Stage Counters Strip */}
      <div className="tasks-metrics-strip">
        <div className="task-metric-pill total">
          <span>All Tasks:</span>
          <strong>{metrics.total || 0}</strong>
        </div>
        <div className="task-metric-pill todo">
          <span>To Do:</span>
          <strong>{metrics.todoCount || 0}</strong>
        </div>
        <div className="task-metric-pill progress">
          <span>In Progress:</span>
          <strong>{metrics.inProgressCount || 0}</strong>
        </div>
        <div className="task-metric-pill approval">
          <span>Pending Client Approval:</span>
          <strong>{metrics.pendingApprovalCount || 0}</strong>
        </div>
        <div className="task-metric-pill completed">
          <span>Completed:</span>
          <strong>{metrics.completedCount || 0}</strong>
        </div>
        {metrics.urgentCount > 0 && (
          <div className="task-metric-pill urgent">
            <AlertCircle size={13} />
            <span>{metrics.urgentCount} Urgent Priority</span>
          </div>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="tasks-toolbar-card">
        <div className="toolbar-filters-grid">
          {/* Search Box */}
          <div className="tasks-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks, clients, categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="tasks-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="tasks-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="tasks-select-field"
              aria-label="Filter by Client Account"
            >
              <option value="all">🏢 All Client Accounts</option>
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="tasks-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="tasks-select-field"
              aria-label="Filter by Priority"
            >
              <option value="all">⚡ All Priorities</option>
              {priorities.filter((p) => p !== 'all').map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="tasks-select-wrapper">
            <User size={14} className="icon-muted" />
            <select
              value={selectedAssignee}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="tasks-select-field"
              aria-label="Filter by Assignee"
            >
              <option value="all">👤 All Team Members</option>
              {assignees.filter((a) => a !== 'all').map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TasksHeader;
