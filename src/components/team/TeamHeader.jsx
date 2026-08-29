import React from 'react';
import {
  Users,
  Shield,
  History,
  Plus,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';

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
}) {
  const roles = ['all', 'Admin', 'Manager', 'Analyst', 'Creator'];
  const statuses = ['all', 'Active', 'Invited', 'Suspended'];

  return (
    <div className="team-header-container">
      {/* Top Banner */}
      <div className="team-top-banner">
        <div className="team-title-block">
          <div className="team-badge-tag">
            <Shield size={14} />
            <span>Role-Based Access & Team Governance</span>
          </div>
          <h1 className="team-main-title">Team Management & Access Permissions</h1>
          <p className="team-subtitle-text">
            Configure agency staff roles, granular module permissions, multi-client workspace allocations, and security audit trails.
          </p>
        </div>

        <div className="team-banner-actions">
          {/* View Mode Tabs */}
          <div className="view-mode-tabs-group" role="group" aria-label="Team View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'directory' ? 'active' : ''}`}
              onClick={() => onViewModeChange('directory')}
            >
              <Users size={15} />
              <span>Team Directory</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => onViewModeChange('matrix')}
            >
              <Shield size={15} />
              <span>Permission Matrix</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'logs' ? 'active' : ''}`}
              onClick={() => onViewModeChange('logs')}
            >
              <History size={15} />
              <span>Activity Log</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-invite-member-primary"
            onClick={onOpenInviteModal}
          >
            <Plus size={16} />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="team-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="team-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search team members by name, email, or role..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="team-search-input"
            />
          </div>

          {/* Role Filter */}
          <div className="team-select-wrapper">
            <Shield size={14} className="icon-muted" />
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="team-select-field"
              aria-label="Filter by Role"
            >
              <option value="all">🛡️ All Role Tiers</option>
              {roles.filter((r) => r !== 'all').map((role) => (
                <option key={role} value={role}>
                  {role} Tier
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="team-select-wrapper">
            <UserCheck size={14} className="icon-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="team-select-field"
              aria-label="Filter by Status"
            >
              <option value="all">⚡ All Statuses</option>
              {statuses.filter((s) => s !== 'all').map((st) => (
                <option key={st} value={st}>
                  {st} Status
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamHeader;
