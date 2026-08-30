import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Table,
  Plus,
  RefreshCw,
  Search,
  Building,
  LayoutGrid,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';

export function CRMHeader({
  activeTab,
  onTabChange,
  selectedClient,
  onClientChange,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
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
      console.error('Failed to load clients in CRM header:', e);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'pipeline', label: 'Pipeline Board', icon: Kanban },
    { id: 'leads', label: 'Lead Directory', icon: Table },
  ];

  return (
    <div className="crm-header-container">
      {/* Top Banner */}
      <div className="crm-top-banner">
        <div className="crm-title-block">
          <div className="crm-badge-tag">
            <Kanban size={14} />
            <span>Lead Generation & CRM Pipeline Command Center</span>
          </div>
          <h1 className="crm-main-title">Lead Generation & CRM Pipeline Hub</h1>
          <p className="crm-subtitle-text">
            Capture, score, assign, and convert inbound leads generated across Meta Ads, Google Ads, WhatsApp, and Organic Search directly backed by PostgreSQL.
          </p>
        </div>

        <div className="crm-banner-actions">
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
            onClick={onOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Tabs & Client Filter Row */}
      <div className="crm-nav-controls-row">
        <div className="crm-tabs-nav-list" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`crm-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="crm-right-filters-group">
          {/* Search */}
          <div className="crm-search-box">
            <Search size={15} className="crm-search-icon" />
            <input
              type="text"
              placeholder="Search leads by name, company, email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="crm-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="crm-client-select-wrapper">
            <Building size={14} className="crm-filter-icon" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="crm-client-select"
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
        </div>
      </div>
    </div>
  );
}

export default CRMHeader;
