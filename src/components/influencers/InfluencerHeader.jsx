import React from 'react';
import {
  Users2,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  Building,
  Filter,
  Search,
  Share2,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function InfluencerHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  selectedStage,
  onStageChange,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
}) {
  const platforms = ['all', 'Instagram', 'TikTok', 'YouTube'];
  const stages = [
    'all',
    'Outreach Sent',
    'Contract Signed',
    'Content Draft Review',
    'Published & Paid',
  ];

  return (
    <div className="influencer-header-container">
      {/* Top Banner */}
      <div className="influencer-top-banner">
        <div className="influencer-title-block">
          <div className="influencer-badge-tag">
            <Users2 size={14} />
            <span>Creator Partnerships & UGC Campaign Manager</span>
          </div>
          <h1 className="influencer-main-title">Influencer & Creator Collaborations</h1>
          <p className="influencer-subtitle-text">
            Manage creator discovery, automated AI outreach pitches, content draft reviews, and affiliate promo code attribution.
          </p>
        </div>

        <div className="influencer-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Influencers View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid size={15} />
              <span>Cards Grid</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              <List size={15} />
              <span>Pipeline Table</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-add-influencer-primary"
            onClick={onOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Creator Partner</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="influencer-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="influencer-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search creators by name, handle, campaign, or code..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="influencer-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="influencer-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="influencer-select-field"
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
          <div className="influencer-select-wrapper">
            <Share2 size={14} className="icon-muted" />
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="influencer-select-field"
              aria-label="Filter by Platform"
            >
              <option value="all">🌐 All Platforms</option>
              {platforms.filter((p) => p !== 'all').map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="influencer-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedStage}
              onChange={(e) => onStageChange(e.target.value)}
              className="influencer-select-field"
              aria-label="Filter by Collaboration Stage"
            >
              <option value="all">⚡ All Campaign Stages</option>
              {stages.filter((s) => s !== 'all').map((st) => (
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

export default InfluencerHeader;
