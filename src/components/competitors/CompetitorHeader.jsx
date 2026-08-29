import React from 'react';
import {
  Target,
  Plus,
  Sparkles,
  LayoutGrid,
  Radio,
  Eye,
  Building,
  Filter,
  Search,
  Share2,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CompetitorHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenGapModal,
}) {
  const platforms = ['all', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Facebook'];

  return (
    <div className="competitor-header-container">
      {/* Top Banner */}
      <div className="competitor-top-banner">
        <div className="competitor-title-block">
          <div className="competitor-badge-tag">
            <Target size={14} />
            <span>Competitive Benchmarks & Intelligence Radar</span>
          </div>
          <h1 className="competitor-main-title">Competitor Radar & Social Listening</h1>
          <p className="competitor-subtitle-text">
            Monitor rival brand engagement pacing, discover viral competitor creative hooks, spy on active paid ad campaigns, and unlock AI counter-positioning opportunities.
          </p>
        </div>

        <div className="competitor-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Competitor View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'benchmarks' ? 'active' : ''}`}
              onClick={() => onViewModeChange('benchmarks')}
            >
              <LayoutGrid size={15} />
              <span>Benchmarks</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'radar' ? 'active' : ''}`}
              onClick={() => onViewModeChange('radar')}
            >
              <Radio size={15} />
              <span>Content Radar</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'ads' ? 'active' : ''}`}
              onClick={() => onViewModeChange('ads')}
            >
              <Eye size={15} />
              <span>Ad Spies</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ai-gap-analysis"
            onClick={onOpenGapModal}
          >
            <Sparkles size={15} />
            <span>AI Gap Analysis</span>
          </button>

          <button
            type="button"
            className="btn-add-competitor-primary"
            onClick={onOpenAddModal}
          >
            <Plus size={16} />
            <span>Track Competitor</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="competitor-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="competitor-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search competitors by brand name, handle, or strengths..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="competitor-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="competitor-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="competitor-select-field"
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

          {/* Platform Filter */}
          <div className="competitor-select-wrapper">
            <Share2 size={14} className="icon-muted" />
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="competitor-select-field"
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
        </div>
      </div>
    </div>
  );
}

export default CompetitorHeader;
