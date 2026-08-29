import React from 'react';
import {
  MessageSquare,
  Search,
  Building,
  Filter,
  Share2,
  Sparkles,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function InboxHeader({
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  selectedSentiment,
  onSentimentChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}) {
  const platforms = ['all', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'TikTok'];
  const sentiments = ['all', 'Question', 'Lead Opportunity', 'Urgent Issue', 'Positive'];
  const statuses = ['all', 'Open', 'In Progress', 'Resolved'];

  return (
    <div className="inbox-header-container">
      {/* Top Banner */}
      <div className="inbox-top-banner">
        <div className="inbox-title-block">
          <div className="inbox-badge-tag">
            <MessageSquare size={14} />
            <span>Omnichannel Community Engagement & Inbound Inbox</span>
          </div>
          <h1 className="inbox-main-title">Unified Social Inbox & AI Reply Studio</h1>
          <p className="inbox-subtitle-text">
            Engage customer comments, DMs, and lead inquiries across all client channels with automated sentiment routing and AI smart replies.
          </p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="inbox-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="inbox-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations by user, keyword, or message..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="inbox-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="inbox-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="inbox-select-field"
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

          {/* Platform Filter */}
          <div className="inbox-select-wrapper">
            <Share2 size={14} className="icon-muted" />
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="inbox-select-field"
              aria-label="Filter by Platform"
            >
              <option value="all">🌐 All Channels</option>
              {platforms.filter((p) => p !== 'all').map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="inbox-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedSentiment}
              onChange={(e) => onSentimentChange(e.target.value)}
              className="inbox-select-field"
              aria-label="Filter by Sentiment"
            >
              <option value="all">❤️ All Sentiments</option>
              {sentiments.filter((s) => s !== 'all').map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="inbox-select-wrapper">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="inbox-select-field"
              aria-label="Filter by Ticket Status"
            >
              <option value="all">Status: All</option>
              {statuses.filter((s) => s !== 'all').map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InboxHeader;
