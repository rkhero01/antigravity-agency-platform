import React from 'react';
import {
  FileText,
  Sparkles,
  Download,
  LayoutGrid,
  List,
  Building,
  Filter,
  Search,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function ReportsHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenGenerateModal,
  onBulkDownload,
}) {
  const categories = [
    'all',
    'Executive Summary',
    'Paid Media Audit',
    'Organic Growth',
    'Strategic Forecast',
    'Creative Performance',
  ];

  return (
    <div className="reports-header-container">
      {/* Top Banner */}
      <div className="reports-top-banner">
        <div className="reports-title-block">
          <div className="reports-badge-tag">
            <FileText size={14} />
            <span>Executive Client Deliverables & Public Exports</span>
          </div>
          <h1 className="reports-main-title">Client Reports & Presentation Hub</h1>
          <p className="reports-subtitle-text">
            Generate presentation-ready executive PDF summaries, cross-channel attribution audits, and shareable client links.
          </p>
        </div>

        <div className="reports-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Reports View Mode">
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
              <span>Table View</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onBulkDownload}
            title="Download all reports as ZIP"
          >
            <Download size={15} />
            <span>Bulk Export (ZIP)</span>
          </button>

          <button
            type="button"
            className="btn-generate-ai-report-primary"
            onClick={onOpenGenerateModal}
          >
            <Sparkles size={16} />
            <span>Generate AI Report</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="reports-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="reports-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search reports by title, client, or category..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="reports-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="reports-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="reports-select-field"
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

          {/* Category Filter */}
          <div className="reports-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="reports-select-field"
              aria-label="Filter by Report Type"
            >
              <option value="all">📑 All Report Types</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsHeader;
