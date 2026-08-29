import React from 'react';
import {
  TrendingUp,
  Plus,
  Download,
  Filter,
  Building,
  Layers,
  Search,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function AdsHeader({
  dateRange,
  onDateRangeChange,
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onExportReport,
}) {
  const platforms = ['all', 'Meta Ads', 'Google Ads', 'LinkedIn Ads'];
  const statuses = ['all', 'Active', 'Paused', 'Completed'];

  return (
    <div className="ads-header-container">
      {/* Top Banner */}
      <div className="ads-top-banner">
        <div className="ads-title-block">
          <div className="ads-badge-tag">
            <TrendingUp size={14} />
            <span>Paid Media & Conversion Hub</span>
          </div>
          <h1 className="ads-main-title">Ads & Performance Tracker</h1>
          <p className="ads-subtitle-text">
            Monitor real-time Meta Ads, Google Ads, and LinkedIn campaigns, lead acquisition funnels, CPL efficiency, and ROAS.
          </p>
        </div>

        <div className="ads-banner-actions">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onExportReport}
            title="Export Performance Report"
          >
            <Download size={15} />
            <span>Export Report</span>
          </button>

          <button
            type="button"
            className="btn-create-campaign-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="ads-toolbar-card">
        <div className="toolbar-filters-grid">
          {/* Search Box */}
          <div className="ads-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search campaigns, clients, or objectives..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="ads-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="ads-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="ads-select-field"
              aria-label="Filter by Client"
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
          <div className="ads-select-wrapper">
            <Layers size={14} className="icon-muted" />
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="ads-select-field"
              aria-label="Filter by Platform"
            >
              <option value="all">🌐 All Ad Networks</option>
              {platforms.filter((p) => p !== 'all').map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="ads-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="ads-select-field"
              aria-label="Filter by Status"
            >
              <option value="all">⚡ All Statuses</option>
              {statuses.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Buttons */}
          <div className="ads-date-range-pills" role="group" aria-label="Date Range">
            <button
              type="button"
              className={`range-pill-btn ${dateRange === '7d' ? 'active' : ''}`}
              onClick={() => onDateRangeChange('7d')}
            >
              7D
            </button>
            <button
              type="button"
              className={`range-pill-btn ${dateRange === '30d' ? 'active' : ''}`}
              onClick={() => onDateRangeChange('30d')}
            >
              30D
            </button>
            <button
              type="button"
              className={`range-pill-btn ${dateRange === '90d' ? 'active' : ''}`}
              onClick={() => onDateRangeChange('90d')}
            >
              90D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdsHeader;
