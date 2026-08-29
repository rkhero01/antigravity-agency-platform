import React from 'react';
import {
  Share2,
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Building,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function SocialHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onSyncAll,
  onOpenConnectModal,
  isSyncingAll,
}) {
  const platforms = ['all', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'TikTok'];
  const statuses = ['all', 'Connected', 'Needs Re-auth', 'Expiring Soon'];

  return (
    <div className="social-header-container">
      {/* Top Banner */}
      <div className="social-top-banner">
        <div className="social-title-block">
          <div className="social-badge-tag">
            <Share2 size={14} />
            <span>Multi-Channel OAuth & Health Hub</span>
          </div>
          <h1 className="social-main-title">Connected Social Accounts</h1>
          <p className="social-subtitle-text">
            Monitor API health status, refresh expiring OAuth tokens, audit permissions, and connect client publishing endpoints.
          </p>
        </div>

        <div className="social-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="View Mode">
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
              <span>Audit Table</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onSyncAll}
            disabled={isSyncingAll}
            title="Sync all account credentials and followers"
          >
            <RefreshCw size={15} className={isSyncingAll ? 'spin-icon' : ''} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All Accounts'}</span>
          </button>

          <button
            type="button"
            className="btn-connect-account-primary"
            onClick={onOpenConnectModal}
          >
            <Plus size={16} />
            <span>Connect New Account</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="social-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="social-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search by handle, brand, or client name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="social-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="social-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="social-select-field"
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
          <div className="social-select-wrapper">
            <Share2 size={14} className="icon-muted" />
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="social-select-field"
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

          {/* Health Status Filter */}
          <div className="social-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="social-select-field"
              aria-label="Filter by Health Status"
            >
              <option value="all">⚡ All Health States</option>
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

export default SocialHeader;
