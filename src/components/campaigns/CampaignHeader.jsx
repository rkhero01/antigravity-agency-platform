import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Plus,
  LayoutGrid,
  List,
  Search,
  RefreshCw,
  Building,
  Filter,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';
import { CAMPAIGN_PLATFORMS, CAMPAIGN_OBJECTIVES } from '../../services/campaignsService.js';

export function CampaignHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedPlatform,
  onPlatformChange,
  selectedStatus,
  onStatusChange,
  selectedObjective,
  onObjectiveChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
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
      console.error('Failed to load clients in campaign header:', e);
    }
  };

  return (
    <div className="campaign-header-container">
      {/* Top Banner */}
      <div className="campaign-top-banner">
        <div className="campaign-title-block">
          <div className="campaign-badge-tag">
            <Rocket size={14} />
            <span>Multi-Tenant Campaign Architecture & Paid Media Gateway</span>
          </div>
          <h1 className="campaign-main-title">Campaign & Paid Ads Management</h1>
          <p className="campaign-subtitle-text">
            Plan, launch, track, and optimize paid marketing campaigns across Meta, Google, LinkedIn, and TikTok directly persisted to PostgreSQL.
          </p>
        </div>

        <div className="campaign-banner-actions">
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
            className="btn-connect-account-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Create Campaign</span>
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
            placeholder="Search campaigns by name, objective, or external ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="team-search-input"
          />
        </div>

        {/* Client Workspace Filter */}
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
            <option value="all">All Platforms</option>
            {CAMPAIGN_PLATFORMS.map((p) => (
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
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Objective Filter */}
        <div className="team-filter-select-wrapper">
          <select
            value={selectedObjective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            className="team-filter-select"
            aria-label="Filter by Objective"
          >
            <option value="all">All Objectives</option>
            {CAMPAIGN_OBJECTIVES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="team-view-toggle-group">
          <button
            type="button"
            className={`team-view-btn ${viewMode === 'grid' || viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid Cards View"
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

export default CampaignHeader;
