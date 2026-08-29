import React from 'react';
import {
  Rocket,
  Plus,
  Sparkles,
  LayoutGrid,
  Calendar,
  Search,
  Building,
  Filter,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CampaignHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenAIModal,
}) {
  const statuses = ['all', 'Live Blitz', 'Creative Production', 'Pre-Launch Teaser', 'Strategy & Concept'];

  return (
    <div className="campaign-header-container">
      {/* Top Banner */}
      <div className="campaign-top-banner">
        <div className="campaign-title-block">
          <div className="campaign-badge-tag">
            <Rocket size={14} />
            <span>Strategic Campaign Architecture & Omnichannel Launch OS</span>
          </div>
          <h1 className="campaign-main-title">Brand Campaign Strategy & Launch Planner</h1>
          <p className="campaign-subtitle-text">
            Orchestrate multi-phase marketing blitzes across Meta, TikTok, Influencers, and Search. Manage visual moodboards, audience personas, budget splits, and creative deliverables.
          </p>
        </div>

        <div className="campaign-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Campaign View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => onViewModeChange('cards')}
            >
              <LayoutGrid size={15} />
              <span>Strategy Cards</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => onViewModeChange('timeline')}
            >
              <Calendar size={15} />
              <span>Roadmap Timeline</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ai-roadmap-action"
            onClick={onOpenAIModal}
          >
            <Sparkles size={15} />
            <span>AI Launch Roadmap</span>
          </button>

          <button
            type="button"
            className="btn-create-campaign-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>New Campaign Brief</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="campaign-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="campaign-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search campaigns by title, client, or target goal..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="campaign-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="campaign-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="campaign-select-field"
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

          {/* Status Filter */}
          <div className="campaign-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="campaign-select-field"
              aria-label="Filter by Campaign Status"
            >
              <option value="all">⚡ All Campaign Stages</option>
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

export default CampaignHeader;
