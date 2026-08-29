import React, { useState, useEffect } from 'react';
import {
  Share2,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  SlidersHorizontal,
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
  ];

  return (
    <div className="social-header-container">
      {/* Top Banner */}
      <div className="social-top-banner">
        <div className="social-title-box">
          <div className="social-badge">
            <Share2 size={14} />
            <span>Multi-Tenant Channel Access & OAuth Gateway</span>
          </div>
          <h1 className="social-main-title">Social Accounts & Platform Connections</h1>
          <p className="social-subtext">
            Manage authenticated social media channel assets, page tokens, and publishing permissions bound to client workspaces.
          </p>
        </div>

        <div className="social-header-actions">
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
            className="btn-add-client-primary"
            onClick={onOpenConnectModal}
          >
            <PlusCircle size={16} />
            <span>Connect Channel Asset</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="team-toolbar-row">
        {/* Search */}
        <div className="team-search-wrapper">
          <Search size={16} className="search-icon-muted" />
          <input
            type="text"
            placeholder="Search by channel, handle, or client workspace..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="team-search-input"
          />
        </div>

        {/* Client Filter */}
        <div className="team-filter-select-wrapper">
          <select
            value={selectedClient}
            onChange={(e) => onClientChange(e.target.value)}
            className="team-filter-select"
            aria-label="Filter by Client"
          >
            <option value="all">All Client Workspaces</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.clientName}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div className="team-filter-select-wrapper">
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformChange(e.target.value)}
            className="team-filter-select"
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
        <div className="team-filter-select-wrapper">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="team-filter-select"
            aria-label="Filter by Status"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active & Healthy</option>
            <option value="Needs Re-auth">Needs Re-auth</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Disconnected">Disconnected</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="team-view-toggle-group">
          <button
            type="button"
            className={`team-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            <LayoutGrid size={15} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`team-view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Table View"
          >
            <List size={15} />
            <span>Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialHeader;
