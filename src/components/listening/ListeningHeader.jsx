import React from 'react';
import {
  Radio,
  Plus,
  Sparkles,
  LayoutGrid,
  ShieldAlert,
  Search,
  Building,
  Filter,
  Smile,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function ListeningHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  selectedSentiment,
  onSentimentChange,
  searchQuery,
  onSearchChange,
  onOpenTrackModal,
  onOpenAIModal,
}) {
  const platforms = ['all', 'Reddit', 'Twitter', 'TikTok', 'Trustpilot'];
  const sentiments = ['all', 'Positive', 'Neutral', 'Negative'];

  return (
    <div className="listening-header-container">
      {/* Top Banner */}
      <div className="listening-top-banner">
        <div className="listening-title-block">
          <div className="listening-badge-tag">
            <Radio size={14} />
            <span>Real-Time Web Intelligence & Brand Sentiment Radar</span>
          </div>
          <h1 className="listening-main-title">Social Listening & Brand Sentiment Hub</h1>
          <p className="listening-subtitle-text">
            Monitor real-time brand chatter, customer sentiment, competitor discussions, and PR crisis telemetry across Reddit, Twitter/X, TikTok, and Trustpilot.
          </p>
        </div>

        <div className="listening-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Listening View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'feed' ? 'active' : ''}`}
              onClick={() => onViewModeChange('feed')}
            >
              <LayoutGrid size={15} />
              <span>Live Mentions Feed</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'alerts' ? 'active' : ''}`}
              onClick={() => onViewModeChange('alerts')}
            >
              <ShieldAlert size={15} />
              <span>Crisis Alerts Radar</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ai-crisis-action"
            onClick={onOpenAIModal}
          >
            <Sparkles size={15} />
            <span>AI Crisis Mitigation</span>
          </button>

          <button
            type="button"
            className="btn-track-keyword-primary"
            onClick={onOpenTrackModal}
          >
            <Plus size={16} />
            <span>Track Keyword / Topic</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="listening-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="listening-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search mentions by keyword, author, or topic..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="listening-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="listening-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="listening-select-field"
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
          <div className="listening-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="listening-select-field"
              aria-label="Filter by Platform"
            >
              <option value="all">🌐 All Media Platforms</option>
              {platforms.filter((p) => p !== 'all').map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="listening-select-wrapper">
            <Smile size={14} className="icon-muted" />
            <select
              value={selectedSentiment}
              onChange={(e) => onSentimentChange(e.target.value)}
              className="listening-select-field"
              aria-label="Filter by Sentiment"
            >
              <option value="all">🎭 All Sentiments</option>
              {sentiments.filter((s) => s !== 'all').map((sentiment) => (
                <option key={sentiment} value={sentiment}>
                  {sentiment === 'Positive' ? '🟢 Positive' : sentiment === 'Neutral' ? '⚪ Neutral' : '🔴 Negative'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListeningHeader;
