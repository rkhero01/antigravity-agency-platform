import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  MessageSquare,
  Users,
  Inbox,
  Filter,
} from 'lucide-react';
import { ConversationListItem } from './ConversationListItem.jsx';
import { ConversationFilters } from './ConversationFilters.jsx';

export function ConversationList({
  conversations = [],
  selectedConversation,
  onSelectConversation,
  filters = {},
  onFilterChange,
  onResetFilters,
  loading = false,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'Open', label: 'Open' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Resolved', label: 'Resolved' },
  ];

  const currentStatus = filters.status || 'all';

  const counts = {
    all: conversations.length,
    Open: conversations.filter((c) => c.status === 'Open').length,
    Pending: conversations.filter((c) => c.status === 'Pending').length,
    Resolved: conversations.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <div className="wa-conversation-list-pane">
      {/* Search & Quick Filter Bar */}
      <div className="wa-list-header-box">
        <div className="wa-list-search-bar">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts, phone, messages..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="wa-list-search-input"
          />
          <button
            type="button"
            className={`btn-toggle-filters ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle advanced filters"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>

        {/* Quick Status Tabs */}
        <div className="wa-quick-status-tabs">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`status-tab-btn ${currentStatus === tab.id ? 'active' : ''}`}
              onClick={() => onFilterChange('status', tab.id)}
            >
              <span>{tab.label}</span>
              <span className="status-count-chip">{counts[tab.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      {showFilters && (
        <ConversationFilters
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      )}

      {/* Conversations Scroll List */}
      <div className="wa-conversations-scroll-container">
        {loading ? (
          <div className="wa-list-loading-state">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="wa-list-skeleton-item">
                <div className="skeleton-avatar" />
                <div className="skeleton-lines">
                  <div className="skeleton-line w-32 h-3.5 mb-1.5" />
                  <div className="skeleton-line w-48 h-3 mb-1.5" />
                  <div className="skeleton-line w-24 h-2.5" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="wa-empty-conversations-box">
            <Inbox size={36} className="text-dim mb-2" />
            <strong className="text-white text-sm block">No Conversations Found</strong>
            <p className="text-xs text-muted max-w-[220px]">
              No active WhatsApp chats match your current filter and search criteria.
            </p>
            <button
              type="button"
              className="btn-saas-secondary mt-3"
              onClick={onResetFilters}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedConversation && selectedConversation.id === conv.id}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ConversationList;
