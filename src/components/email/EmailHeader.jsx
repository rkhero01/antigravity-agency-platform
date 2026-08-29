import React from 'react';
import {
  Mail,
  Plus,
  Sparkles,
  LayoutGrid,
  Zap,
  Search,
  Building,
  Filter,
  MessageSquare,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function EmailHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenAIModal,
}) {
  const types = ['all', 'Email', 'SMS'];
  const statuses = ['all', 'Sent', 'Scheduled', 'Draft'];

  return (
    <div className="email-header-container">
      {/* Top Banner */}
      <div className="email-top-banner">
        <div className="email-title-block">
          <div className="email-badge-tag">
            <Mail size={14} />
            <span>Omnichannel Email Marketing & SMS Automation Studio</span>
          </div>
          <h1 className="email-main-title">Email Marketing & SMS CRM Hub</h1>
          <p className="email-subtitle-text">
            Execute high-converting newsletter broadcasts, SMS drops, and automated lifecycle trigger flows with AI subject line optimization and real-time revenue attribution.
          </p>
        </div>

        <div className="email-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Email View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'campaigns' ? 'active' : ''}`}
              onClick={() => onViewModeChange('campaigns')}
            >
              <LayoutGrid size={15} />
              <span>Broadcasts</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'flows' ? 'active' : ''}`}
              onClick={() => onViewModeChange('flows')}
            >
              <Zap size={15} />
              <span>Automated Flows</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ai-copy-action"
            onClick={onOpenAIModal}
          >
            <Sparkles size={15} />
            <span>AI Copy Studio</span>
          </button>

          <button
            type="button"
            className="btn-create-email-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="email-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="email-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search campaigns by subject, client, or segment..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="email-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="email-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="email-select-field"
              aria-label="Filter by Client Workspace"
            >
              <option value="all">🏢 All Client Workspaces</option>
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="email-select-wrapper">
            <MessageSquare size={14} className="icon-muted" />
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="email-select-field"
              aria-label="Filter by Channel Type"
            >
              <option value="all">📬 All Channels (Email & SMS)</option>
              <option value="Email">📧 Email Only</option>
              <option value="SMS">💬 SMS Blast Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="email-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="email-select-field"
              aria-label="Filter by Status"
            >
              <option value="all">⚡ All Statuses</option>
              {statuses.filter((s) => s !== 'all').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailHeader;
