import React from 'react';
import {
  Search,
  Plus,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  TrendingUp,
  FileCheck2,
  GitPullRequest,
  Link2,
  MapPin,
  FileText,
  Building,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function SEOHeader({
  activeTab,
  onTabChange,
  selectedClient,
  onClientChange,
  searchQuery,
  onSearchChange,
  onOpenAddKeywordModal,
  onRunAudit,
  onOpenAIStrategyModal,
  onOpenOnPageOptimizer,
  onOpenAIBriefModal,
  onOpenReportModal,
  isAuditing,
}) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'keywords', label: 'Keyword Rankings', icon: TrendingUp },
    { id: 'audit', label: 'Site Audit', icon: ShieldCheck },
    { id: 'content-gap', label: 'Content Gap', icon: GitPullRequest },
    { id: 'backlinks', label: 'Backlink Monitor', icon: Link2 },
    { id: 'local-seo', label: 'Local SEO', icon: MapPin },
  ];

  return (
    <div className="seo-header-container">
      {/* Top Banner */}
      <div className="seo-top-banner">
        <div className="seo-title-block">
          <div className="seo-badge-tag">
            <Search size={14} />
            <span>Search Engine Optimization & Organic Growth Command Center</span>
          </div>
          <h1 className="seo-main-title">SEO & Organic Growth Command Center</h1>
          <p className="seo-subtitle-text">
            Monitor real-time SERP rankings, technical crawl health, competitor content gaps, high-authority backlink velocity, and multi-location Google Business visibility.
          </p>
        </div>

        <div className="seo-banner-actions">
          <button
            type="button"
            className="btn-seo-action secondary"
            onClick={onOpenOnPageOptimizer}
            title="On-Page Content Optimizer"
          >
            <Zap size={15} />
            <span>On-Page Analyzer</span>
          </button>

          <button
            type="button"
            className="btn-seo-action secondary"
            onClick={onOpenAIBriefModal}
            title="Generate AI Content Brief"
          >
            <FileCheck2 size={15} />
            <span>AI Content Brief</span>
          </button>

          <button
            type="button"
            className="btn-seo-action ai-highlight"
            onClick={onOpenAIStrategyModal}
          >
            <Sparkles size={15} />
            <span>AI SEO Strategy</span>
          </button>

          <button
            type="button"
            className="btn-seo-action secondary"
            onClick={onOpenReportModal}
          >
            <FileText size={15} />
            <span>SEO Report</span>
          </button>

          <button
            type="button"
            className="btn-seo-primary"
            onClick={onOpenAddKeywordModal}
          >
            <Plus size={16} />
            <span>Track Keyword</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation & Filters Bar */}
      <div className="seo-toolbar-card">
        <div className="seo-tabs-row">
          <div className="seo-nav-tabs" role="tablist">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`seo-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <IconComp size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="seo-controls-group">
            {/* Run Audit Action */}
            <button
              type="button"
              className="btn-run-audit-quick"
              disabled={isAuditing}
              onClick={onRunAudit}
            >
              <RefreshCw size={14} className={isAuditing ? 'spin' : ''} />
              <span>{isAuditing ? 'Crawling...' : 'Run Site Audit'}</span>
            </button>

            {/* Client Filter */}
            <div className="seo-select-wrapper">
              <Building size={14} className="icon-muted" />
              <select
                value={selectedClient}
                onChange={(e) => onClientChange(e.target.value)}
                className="seo-select-field"
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

            {/* Search Box */}
            <div className="seo-search-field-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search keywords, URLs, audit issues..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="seo-search-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SEOHeader;
