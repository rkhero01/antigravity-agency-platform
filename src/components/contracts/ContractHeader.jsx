import React from 'react';
import {
  FileCheck,
  Plus,
  Sparkles,
  LayoutGrid,
  Receipt,
  Search,
  Building,
  Filter,
  DollarSign,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function ContractHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenAIModal,
}) {
  const statuses = ['all', 'Active Retainer', 'Expiring Soon', 'Draft Proposal'];

  return (
    <div className="contract-header-container">
      {/* Top Banner */}
      <div className="contract-top-banner">
        <div className="contract-title-block">
          <div className="contract-badge-tag">
            <FileCheck size={14} />
            <span>Commercial Contracts, Retainer Billing & Proposal Engine</span>
          </div>
          <h1 className="contract-main-title">Client Contracts & Retainer Billing Hub</h1>
          <p className="contract-subtitle-text">
            Manage agency monthly retainers, annual contract values (ACV), automated invoice schedules, scope deliverables, and synthesize AI-generated client proposals.
          </p>
        </div>

        <div className="contract-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Contracts View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'contracts' ? 'active' : ''}`}
              onClick={() => onViewModeChange('contracts')}
            >
              <LayoutGrid size={15} />
              <span>Retainers & Proposals</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'invoices' ? 'active' : ''}`}
              onClick={() => onViewModeChange('invoices')}
            >
              <Receipt size={15} />
              <span>Invoices Schedule</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-ai-proposal-action"
            onClick={onOpenAIModal}
          >
            <Sparkles size={15} />
            <span>AI Proposal Synthesizer</span>
          </button>

          <button
            type="button"
            className="btn-create-contract-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>New Agreement</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="contract-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="contract-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search contracts by client, title, or signatory..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="contract-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="contract-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="contract-select-field"
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

          {/* Status Filter */}
          <div className="contract-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="contract-select-field"
              aria-label="Filter by Contract Status"
            >
              <option value="all">📜 All Contract Statuses</option>
              {statuses.filter((s) => s !== 'all').map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractHeader;
