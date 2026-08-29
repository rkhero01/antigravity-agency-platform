import React from 'react';
import { Search, Filter, X, Building, Megaphone, CheckCircle2 } from 'lucide-react';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function CampaignFilters({
  filters = {},
  onFilterChange,
  onResetFilters,
  clients = whatsappClients,
}) {
  const campaignTypes = [
    'Promotional',
    'Lead Follow-up',
    'Abandoned Cart',
    'Win-back',
    'Broadcast',
  ];

  const campaignStatuses = ['Draft', 'Scheduled', 'Running', 'Paused', 'Completed'];

  const activeCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search' || key === 'clientId') return false;
    return val && val !== 'all';
  }).length;

  return (
    <div className="campaign-filters-bar">
      <div className="flex items-center gap-2.5 flex-wrap flex-1">
        {/* Search Input */}
        <div className="campaign-search-input-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search campaigns, audience, templates..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="campaign-search-input"
          />
        </div>

        {/* Client Selector */}
        <div className="campaign-mini-select-wrap">
          <Building size={13} className="text-dim" />
          <select
            value={filters.clientId || 'all'}
            onChange={(e) => onFilterChange('clientId', e.target.value)}
            className="campaign-mini-select"
          >
            <option value="all">All Client Accounts</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Type Selector */}
        <div className="campaign-mini-select-wrap">
          <Megaphone size={13} className="text-dim" />
          <select
            value={filters.type || 'all'}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="campaign-mini-select"
          >
            <option value="all">All Campaign Types</option>
            {campaignTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Status Selector */}
        <div className="campaign-mini-select-wrap">
          <CheckCircle2 size={13} className="text-dim" />
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="campaign-mini-select"
          >
            <option value="all">All Statuses</option>
            {campaignStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Count & Clear Button */}
      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <button
            type="button"
            className="btn-clear-campaign-filters"
            onClick={onResetFilters}
          >
            <X size={13} />
            <span>Clear Filters ({activeCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default CampaignFilters;
