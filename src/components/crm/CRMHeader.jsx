import React from 'react';
import {
  Kanban,
  Table,
  Clock,
  PieChart,
  Activity,
  Plus,
  UploadCloud,
  Sparkles,
  FileText,
  Search,
  Building,
  LayoutGrid,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function CRMHeader({
  activeTab,
  onTabChange,
  selectedClient,
  onClientChange,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenImportModal,
  onOpenAIModal,
  onOpenReportModal,
}) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'pipeline', label: 'Pipeline Board', icon: Kanban },
    { id: 'leads', label: 'Lead Directory', icon: Table },
    { id: 'follow-ups', label: 'Follow-ups', icon: Clock },
    { id: 'sources', label: 'Source Attribution', icon: PieChart },
    { id: 'activity', label: 'Activity Timeline', icon: Activity },
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
            Capture, score, assign, and convert inbound leads generated across Meta Ads, Google Ads, WhatsApp, Instagram, and Organic Search into closed agency retainer revenue.
          </p>
        </div>

        <div className="crm-banner-actions">
          <button
            type="button"
            className="btn-crm-action secondary"
            onClick={onOpenImportModal}
          >
            <UploadCloud size={15} />
            <span>Import Leads</span>
          </button>

          <button
            type="button"
            className="btn-crm-action ai-highlight"
            onClick={onOpenAIModal}
          >
            <Sparkles size={15} />
            <span>AI Sales Co-Pilot</span>
          </button>

          <button
            type="button"
            className="btn-crm-action secondary"
            onClick={onOpenReportModal}
          >
            <FileText size={15} />
            <span>CRM Report</span>
          </button>

          <button
            type="button"
            className="btn-crm-primary"
            onClick={onOpenAddModal}
          >
            <Plus size={16} />
            <span>New Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* Toolbar, Navigation Tabs & Filters */}
      <div className="crm-toolbar-card">
        <div className="crm-tabs-row">
          <div className="crm-nav-tabs" role="tablist">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`crm-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <IconComp size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="crm-controls-group">
            {/* Client Filter */}
            <div className="crm-select-wrapper">
              <Building size={14} className="icon-muted" />
              <select
                value={selectedClient}
                onChange={(e) => onClientChange(e.target.value)}
                className="crm-select-field"
                aria-label="Filter by Client Workspace"
              >
                <option value="all">🏢 All Client Accounts</option>
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="crm-search-field-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search leads, company, phone, email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="crm-search-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CRMHeader;
