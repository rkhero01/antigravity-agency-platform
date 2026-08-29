import React from 'react';
import {
  Filter,
  X,
  Building,
  CheckCircle2,
  Clock,
  UserCheck,
  Star,
  Tag,
  Smile,
} from 'lucide-react';
import { whatsappClients, whatsappTeamMembers, whatsappTags } from '../../data/mockWhatsApp.js';

export function ConversationFilters({
  filters = {},
  onFilterChange,
  onResetFilters,
  clients = whatsappClients,
  teamMembers = whatsappTeamMembers,
  tags = whatsappTags,
}) {
  const leadStages = [
    'New Lead',
    'Contacted',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];

  const activeFilterCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search' || key === 'clientId') return false;
    return val && val !== 'all';
  }).length;

  return (
    <div className="wa-filters-container">
      <div className="wa-filters-header">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-success" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Conversation Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="active-filter-badge">{activeFilterCount}</span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            className="btn-clear-filters"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="wa-filters-grid">
        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-lbl">Chat Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="Open">🟢 Open</option>
            <option value="Pending">🟡 Pending</option>
            <option value="Resolved">⚪ Resolved</option>
          </select>
        </div>

        {/* Lead Stage Filter */}
        <div className="filter-group">
          <label className="filter-lbl">CRM Lead Stage</label>
          <select
            value={filters.leadStage || 'all'}
            onChange={(e) => onFilterChange('leadStage', e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Stages</option>
            {leadStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Sentiment Filter */}
        <div className="filter-group">
          <label className="filter-lbl">Sentiment</label>
          <select
            value={filters.sentiment || 'all'}
            onChange={(e) => onFilterChange('sentiment', e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Sentiments</option>
            <option value="Positive">😊 Positive</option>
            <option value="Neutral">😐 Neutral</option>
            <option value="Negative">😠 Negative</option>
          </select>
        </div>

        {/* Staff Assignment Filter */}
        <div className="filter-group">
          <label className="filter-lbl">Assigned Staff</label>
          <select
            value={filters.assignedTo || 'all'}
            onChange={(e) => onFilterChange('assignedTo', e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Staff Members</option>
            {teamMembers.map((tm) => (
              <option key={tm.id} value={tm.name}>
                {tm.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div className="filter-group">
          <label className="filter-lbl">Contact Tag</label>
          <select
            value={filters.tag || 'all'}
            onChange={(e) => onFilterChange('tag', e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.label}>
                🏷️ {t.label} ({t.count})
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="filter-group">
          <label className="filter-lbl">VIP Priority</label>
          <select
            value={filters.isPriority !== undefined ? String(filters.isPriority) : 'all'}
            onChange={(e) => onFilterChange('isPriority', e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="true">⭐ VIP Priority Only</option>
            <option value="false">Standard Priority</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="filter-group">
          <label className="filter-lbl">Lead Source</label>
          <select
            value={filters.source || 'all'}
            onChange={(e) => onFilterChange('source', e.target.value)}
            className="wa-filter-select"
          >
            <option value="all">All Sources</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Instagram">Instagram</option>
            <option value="Website">Website</option>
            <option value="WhatsApp Campaign">WhatsApp Campaign</option>
            <option value="Referral">Referral</option>
            <option value="Organic">Organic</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ConversationFilters;
