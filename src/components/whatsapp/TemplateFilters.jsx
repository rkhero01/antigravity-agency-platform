import React from 'react';
import { Search, Filter, X, Building, Tag, Globe, CheckCircle2 } from 'lucide-react';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function TemplateFilters({
  filters = {},
  onFilterChange,
  onResetFilters,
  clients = whatsappClients,
}) {
  const categories = [
    'Marketing',
    'Utility',
    'Authentication',
    'Follow-up',
    'Welcome',
    'Appointment',
    'Payment',
  ];

  const languages = ['Hinglish', 'Hindi', 'English'];
  const statuses = ['Approved', 'Pending', 'Rejected'];

  const activeCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'search' || key === 'clientId') return false;
    return val && val !== 'all';
  }).length;

  return (
    <div className="wa-template-filters-bar">
      <div className="flex items-center gap-2.5 flex-wrap flex-1">
        {/* Search Input */}
        <div className="template-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search templates, variables, text..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="template-search-input"
          />
        </div>

        {/* Client Selector */}
        <div className="template-mini-select-wrap">
          <Building size={13} className="text-dim" />
          <select
            value={filters.clientId || 'all'}
            onChange={(e) => onFilterChange('clientId', e.target.value)}
            className="template-mini-select"
          >
            <option value="all">All Client Workspaces</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="template-mini-select-wrap">
          <Tag size={13} className="text-dim" />
          <select
            value={filters.category || 'all'}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="template-mini-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div className="template-mini-select-wrap">
          <Globe size={13} className="text-dim" />
          <select
            value={filters.language || 'all'}
            onChange={(e) => onFilterChange('language', e.target.value)}
            className="template-mini-select"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Approval Status Selector */}
        <div className="template-mini-select-wrap">
          <CheckCircle2 size={13} className="text-dim" />
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="template-mini-select"
          >
            <option value="all">All Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st === 'Approved' ? '✓ Meta Approved' : st === 'Pending' ? '◷ Pending' : '× Rejected'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {activeCount > 0 && (
        <button
          type="button"
          className="btn-clear-template-filters"
          onClick={onResetFilters}
        >
          <X size={13} />
          <span>Clear Filters ({activeCount})</span>
        </button>
      )}
    </div>
  );
}

export default TemplateFilters;
