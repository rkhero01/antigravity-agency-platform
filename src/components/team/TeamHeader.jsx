import React from 'react';
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { TEAM_ROLES } from '../../services/teamService.js';

export function TeamHeader({
  viewMode,
  onViewModeChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onOpenInviteModal,
  onRefresh,
  isRefreshing,
}) {
  const rolesList = [
    { value: 'all', label: 'All Roles' },
    { value: TEAM_ROLES.OWNER, label: 'Owner (OWNER)' },
    { value: TEAM_ROLES.ADMIN, label: 'Admin (ADMIN)' },
    { value: TEAM_ROLES.MANAGER, label: 'Manager (MANAGER)' },
    { value: TEAM_ROLES.OPERATOR, label: 'Operator (OPERATOR)' },
    { value: TEAM_ROLES.ANALYST, label: 'Analyst (ANALYST)' },
    { value: TEAM_ROLES.VIEWER, label: 'Viewer (VIEWER)' },
  ];

  return (
    <div className="team-header-container">
      {/* Top Banner */}
      <div className="team-top-banner">
        <div className="team-title-box">
          <div className="team-badge">
            <Users size={14} />
            <span>Multi-Tenant Access Control & Governance</span>
          </div>
          <h1 className="team-main-title">Team Members & Role Permissions</h1>
          <p className="team-subtext">
            Manage agency operator seats, RBAC security privileges, departments, and audit governance backed by PostgreSQL.
          </p>
        </div>

        <div className="team-header-actions">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh team members from database"
            aria-label="Refresh team members from database"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className="btn-add-client-primary"
            onClick={onOpenInviteModal}
          >
            <UserPlus size={16} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Controls and Filters */}
      <div className="team-toolbar-row">
        {/* Search */}
        <div className="team-search-wrapper">
          <Search size={16} className="search-icon-muted" />
          <input
            type="text"
            placeholder="Search by name, email, role, or department..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="team-search-input"
          />
        </div>

        {/* Role Filter */}
        <div className="team-filter-select-wrapper">
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="team-filter-select"
            aria-label="Filter by Role"
          >
            {rolesList.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Pills */}
        <div className="team-status-pills" role="group" aria-label="Status Filters">
          <button
            type="button"
            className={`team-status-pill ${selectedStatus === 'all' ? 'active' : ''}`}
            onClick={() => onStatusChange('all')}
          >
            All Statuses
          </button>
          <button
            type="button"
            className={`team-status-pill ${selectedStatus === 'active' ? 'active' : ''}`}
            onClick={() => onStatusChange('active')}
          >
            Active
          </button>
          <button
            type="button"
            className={`team-status-pill ${selectedStatus === 'on_leave' ? 'active' : ''}`}
            onClick={() => onStatusChange('on_leave')}
          >
            On Leave
          </button>
          <button
            type="button"
            className={`team-status-pill ${selectedStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => onStatusChange('inactive')}
          >
            Inactive
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="team-view-toggle-group">
          <button
            type="button"
            className={`team-view-btn ${viewMode === 'directory' ? 'active' : ''}`}
            onClick={() => onViewModeChange('directory')}
            title="Team Directory Grid"
            aria-label="Team Directory Grid"
          >
            <LayoutGrid size={15} />
            <span>Directory</span>
          </button>
          <button
            type="button"
            className={`team-view-btn ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => onViewModeChange('matrix')}
            title="RBAC Security Matrix"
            aria-label="RBAC Security Matrix"
          >
            <ShieldCheck size={15} />
            <span>RBAC Matrix</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamHeader;
