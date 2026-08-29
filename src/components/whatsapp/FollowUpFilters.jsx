import React from 'react';
import { Search, Building, Users, Clock, AlertTriangle, X, Flame, Tag } from 'lucide-react';
import { whatsappClients, whatsappTeamMembers } from '../../data/mockWhatsApp.js';

export function FollowUpFilters({
  filters = {},
  onFilterChange,
  onResetFilters,
  clients = whatsappClients,
  teamMembers = whatsappTeamMembers,
}) {
  const statuses = ['Overdue', 'Due Today', 'Due Tomorrow', 'Upcoming', 'Completed'];
  const priorities = ['VIP', 'High', 'Medium', 'Low'];
  const types = ['Call', 'WhatsApp', 'Email', 'Demo', 'Proposal', 'Payment', 'Appointment', 'General'];

  const activeCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search' || key === 'clientId') return false;
    return val && val !== 'all';
  }).length;

  return (
    <div className="wa-followup-filters-bar">
      <div className="flex items-center gap-2 flex-wrap flex-1">
        {/* Search Input */}
        <div className="followup-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search contact, phone, email, notes, staff..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="followup-search-input"
          />
        </div>

        {/* Client Workspace Selector */}
        <div className="followup-mini-select-wrap">
          <Building size={13} className="text-dim" />
          <select
            value={filters.clientId || 'all'}
            onChange={(e) => onFilterChange('clientId', e.target.value)}
            className="followup-mini-select"
          >
            <option value="all">All Client Workspaces</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Staff Selector */}
        <div className="followup-mini-select-wrap">
          <Users size={13} className="text-dim" />
          <select
            value={filters.assignedStaff || 'all'}
            onChange={(e) => onFilterChange('assignedStaff', e.target.value)}
            className="followup-mini-select"
          >
            <option value="all">All Assignees</option>
            {teamMembers.map((tm) => (
              <option key={tm.id} value={tm.name}>
                {tm.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status / Bucket Selector */}
        <div className="followup-mini-select-wrap">
          <Clock size={13} className="text-dim" />
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="followup-mini-select"
          >
            <option value="all">All Time Buckets</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'Overdue' ? '⚠️ Overdue' : s === 'Due Today' ? '⏰ Due Today' : s}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Selector */}
        <div className="followup-mini-select-wrap">
          <Flame size={13} className="text-dim" />
          <select
            value={filters.priority || 'all'}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="followup-mini-select"
          >
            <option value="all">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Type Selector */}
        <div className="followup-mini-select-wrap">
          <Tag size={13} className="text-dim" />
          <select
            value={filters.type || 'all'}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="followup-mini-select"
          >
            <option value="all">All Action Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {activeCount > 0 && (
        <button
          type="button"
          className="btn-clear-followup-filters"
          onClick={onResetFilters}
        >
          <X size={13} />
          <span>Clear Filters ({activeCount})</span>
        </button>
      )}
    </div>
  );
}

export default FollowUpFilters;
