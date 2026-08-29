import React from 'react';
import { Search, Plus, LayoutGrid, List, Filter, Building2 } from 'lucide-react';

export function ClientDirectoryHeader({
  totalCount,
  activeCount,
  onboardingCount,
  pausedCount,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onOpenAddModal,
}) {
  return (
    <div className="client-directory-header">
      {/* Top Banner */}
      <div className="directory-top-banner">
        <div className="directory-title-box">
          <div className="directory-badge">
            <Building2 size={14} />
            <span>Multi-Tenant Client Hub</span>
          </div>
          <h1 className="directory-main-title">Client Accounts & Portfolios</h1>
          <p className="directory-subtext">
            Manage agency client accounts, contact profiles, assigned team members, retainers, and integrated marketing channels.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-client-primary"
          onClick={onOpenAddModal}
        >
          <Plus size={16} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="directory-toolbar-row">
        {/* Search Bar */}
        <div className="directory-search-input-wrapper">
          <Search size={16} className="search-icon-muted" />
          <input
            type="text"
            placeholder="Search clients by name, industry, or contact..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="directory-search-field"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="directory-status-filters" role="group" aria-label="Status Filters">
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('all')}
          >
            All Clients ({totalCount})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('Active')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'Onboarding' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('Onboarding')}
          >
            Onboarding ({onboardingCount})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'Paused' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('Paused')}
          >
            Paused ({pausedCount})
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle-group">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Table View"
            aria-label="Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientDirectoryHeader;
