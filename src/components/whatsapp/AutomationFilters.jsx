import React from 'react';
import { Search, Filter, X, Building, Zap, CheckCircle2 } from 'lucide-react';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function AutomationFilters({
  filters = {},
  onFilterChange,
  onResetFilters,
  clients = whatsappClients,
}) {
  const triggerTypes = [
    'New Lead',
    'Message Received',
    'Lead Stage Changed',
    'Cart Abandoned',
    'Appointment Booked',
    'Payment Pending',
    'Purchase Completed',
    'Inactive Customer',
    'Manual Enrollment',
  ];

  const statuses = ['Active', 'Paused', 'Draft'];

  const activeCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search' || key === 'clientId') return false;
    return val && val !== 'all';
  }).length;

  return (
    <div className="wa-automation-filters-bar">
      <div className="flex items-center gap-2.5 flex-wrap flex-1">
        {/* Search Input */}
        <div className="automation-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search journeys, triggers, actions..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="automation-search-input"
          />
        </div>

        {/* Client Workspace Selector */}
        <div className="automation-mini-select-wrap">
          <Building size={13} className="text-dim" />
          <select
            value={filters.clientId || 'all'}
            onChange={(e) => onFilterChange('clientId', e.target.value)}
            className="automation-mini-select"
          >
            <option value="all">All Client Workspaces</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="automation-mini-select-wrap">
          <CheckCircle2 size={13} className="text-dim" />
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="automation-mini-select"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'Active' ? '✓ Active' : s === 'Paused' ? 'Ⅱ Paused' : '● Draft'}
              </option>
            ))}
          </select>
        </div>

        {/* Trigger Type Selector */}
        <div className="automation-mini-select-wrap">
          <Zap size={13} className="text-dim" />
          <select
            value={filters.trigger || 'all'}
            onChange={(e) => onFilterChange('trigger', e.target.value)}
            className="automation-mini-select"
          >
            <option value="all">All Trigger Events</option>
            {triggerTypes.map((t) => (
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
          className="btn-clear-automation-filters"
          onClick={onResetFilters}
        >
          <X size={13} />
          <span>Clear Filters ({activeCount})</span>
        </button>
      )}
    </div>
  );
}

export default AutomationFilters;
