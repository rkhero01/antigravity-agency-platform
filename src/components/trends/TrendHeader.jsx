import React from 'react';
import {
  Flame,
  Music,
  Hash,
  Sparkles,
  Plus,
  Compass,
  Search,
  Building,
  Filter,
  Share2,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function TrendHeader({
  activeTab,
  onTabChange,
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  searchQuery,
  onSearchChange,
  onOpenSaveSetModal,
  onOpenAIModal,
}) {
  const platforms = ['all', 'TikTok', 'Instagram', 'LinkedIn', 'YouTube'];

  return (
    <div className="trend-header-container">
      {/* Top Banner */}
      <div className="trend-top-banner">
        <div className="trend-title-block">
          <div className="trend-badge-tag">
            <Flame size={14} />
            <span>Viral Trend Radar & Algorithmic Hashtag Engine</span>
          </div>
          <h1 className="trend-main-title">Trend Discovery & Hashtag Research Hub</h1>
          <p className="trend-subtitle-text">
            Discover breakout TikTok & Reels audio sounds, research low-competition high-reach hashtags, and forecast viral topic trends across client industries.
          </p>
        </div>

        <div className="trend-banner-actions">
          {/* Tabs Group */}
          <div className="view-mode-tabs-group" role="group" aria-label="Trend View Mode">
            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
              onClick={() => onTabChange('audio')}
            >
              <Music size={15} />
              <span>Trending Audio</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'hashtags' ? 'active' : ''}`}
              onClick={() => onTabChange('hashtags')}
            >
              <Hash size={15} />
              <span>Hashtags & Sets</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeTab === 'forecasts' ? 'active' : ''}`}
              onClick={() => onTabChange('forecasts')}
            >
              <Compass size={15} />
              <span>Topic Forecasts</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ai-hashtag-action"
            onClick={onOpenAIModal}
          >
            <Sparkles size={15} />
            <span>AI Hashtag Generator</span>
          </button>

          <button
            type="button"
            className="btn-add-trend-primary"
            onClick={onOpenSaveSetModal}
          >
            <Plus size={16} />
            <span>Save Hashtag Set</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="trend-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="trend-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search audio sounds, hashtags, or topics..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="trend-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="trend-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="trend-select-field"
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
          <div className="trend-select-wrapper">
            <Share2 size={14} className="icon-muted" />
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="trend-select-field"
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
        </div>
      </div>
    </div>
  );
}

export default TrendHeader;
