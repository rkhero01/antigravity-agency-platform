import React from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';

export function ClientDirectoryHeader({
  totalCount,
  activeCount,
  pausedCount,
  inactiveCount,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  industryFilter,
  onIndustryFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  onRefresh,
  isRefreshing,
}) {
  const industries = [
    'All Industries',
    'Health & Fitness',
    'E-commerce & Retail',
    'Professional Services',
    'B2B Software',
    'Food & Beverage',
    'Real Estate',
    'Other',
  ];

  return (
    <div className="client-directory-header">
      {/* Top Banner */}
      <div className="directory-top-banner">
        <div className="directory-title-box">
          <div className="directory-badge">
            <Building2 size={14} />
            <span>PostgreSQL Multi-Tenant Directory</span>
          </div>
          <h1 className="directory-main-title">Client Accounts & Workspaces</h1>
          <p className="directory-subtext">
            Manage agency client accounts, contact profiles, contract retainers, and SLA tiers backed by live PostgreSQL.
          </p>
        </div>

        <div className="directory-header-actions">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh clients from database"
            aria-label="Refresh clients from database"
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
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="directory-toolbar-row">
        {/* Search Bar */}
        <div className="directory-search-input-wrapper">
          <Search size={16} className="search-icon-muted" />
          <input
            type="text"
            placeholder="Search by client name, industry, contact, email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="directory-search-field"
          />
        </div>

        {/* Industry Filter Dropdown */}
        <div className="directory-filter-select-wrapper">
          <select
            value={industryFilter}
            onChange={(e) => onIndustryFilterChange(e.target.value)}
            className="directory-filter-select"
            aria-label="Filter by Industry"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="directory-sort-select-wrapper">
          <ArrowUpDown size={14} className="sort-icon-muted" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="directory-sort-select"
            aria-label="Sort Clients"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="retainer_desc">Highest Retainer</option>
            <option value="health_desc">Highest Health Score</option>
          </select>
        </div>

        {/* Status Filter Pills */}
        <div className="directory-status-filters" role="group" aria-label="Status Filters">
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('active')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'paused' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('paused')}
          >
            Paused ({pausedCount})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => onStatusFilterChange('inactive')}
          >
            Inactive ({inactiveCount})
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
