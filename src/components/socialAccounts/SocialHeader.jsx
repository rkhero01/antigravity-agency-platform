import React, { useState, useEffect } from 'react';
import {
  Share2,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Building,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';

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
  onOpenConnectModal,
  onRefresh,
  isRefreshing,
}) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientList = await clientsService.getClients();
      setClients(clientList);
    } catch (e) {
      console.error('Failed to load clients in social header:', e);
    }
  };

  const platformsList = [
    { value: 'all', label: 'All Channels' },
    { value: 'META', label: 'Meta (FB & IG)' },
    { value: 'FACEBOOK', label: 'Facebook Pages' },
    { value: 'INSTAGRAM', label: 'Instagram Business' },
    { value: 'GOOGLE_BUSINESS', label: 'Google Business Profile' },
    { value: 'YOUTUBE', label: 'YouTube Channels' },
    { value: 'LINKEDIN', label: 'LinkedIn Company' },
    { value: 'TWITTER', label: 'X (Twitter)' },
  ];

  const statusesList = [
    { value: 'all', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active / Connected' },
    { value: 'NEEDS_REAUTH', label: 'Needs Re-auth' },
    { value: 'DISCONNECTED', label: 'Disconnected' },
  ];

  return (
    <div className="social-header-container">
      {/* Top Banner */}
      <div className="social-top-banner">
        <div className="social-title-box">
          <div className="social-badge">
            <Share2 size={14} />
            <span>Connection Center</span>
          </div>
          <h1 className="social-main-title">Social Accounts</h1>
          <p className="social-subtext">
            Connect and manage your clients' social media channels.
          </p>
        </div>

        <div className="social-top-actions">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh database records"
            aria-label="Refresh database records"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className="btn-saas-primary"
            onClick={onOpenConnectModal}
          >
            <PlusCircle size={16} />
            <span>Connect Channel</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Client Workspace, Platform, Status, Search, View Switcher */}
      <div className="social-controls-row">
        <div className="social-left-filters">
          {/* Client Selector */}
          <div className="social-filter-select-wrapper">
            <Building size={14} className="filter-inline-icon" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="social-select-input"
              aria-label="Filter by Client Workspace"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.clientName}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div className="social-filter-select-wrapper">
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="social-select-input"
              aria-label="Filter by Platform"
            >
              {platformsList.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="social-filter-select-wrapper">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="social-select-input"
              aria-label="Filter by Status"
            >
              {statusesList.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="social-right-controls">
          {/* Search Input */}
          <div className="social-search-wrapper">
            <Search size={14} className="social-search-icon" />
            <input
              type="text"
              placeholder="Search channels, handles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="social-search-input"
            />
          </div>

          {/* View Toggle */}
          <div className="social-view-mode-toggle" role="group" aria-label="View Mode">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Table View"
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialHeader;
