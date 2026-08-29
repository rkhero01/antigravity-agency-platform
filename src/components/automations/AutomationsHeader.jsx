import React from 'react';
import {
  Zap,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  Search,
  BookOpen,
} from 'lucide-react';

export function AutomationsHeader({
  viewMode,
  onViewModeChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenRecipesModal,
}) {
  const categories = [
    'all',
    'Content & Publishing',
    'Paid Media & ROAS',
    'Social Inbox & Leads',
    'Influencer & UGC',
    'Executive Reporting',
  ];

  const statuses = ['all', 'Active', 'Paused'];

  return (
    <div className="automations-header-container">
      {/* Top Banner */}
      <div className="automations-top-banner">
        <div className="automations-title-block">
          <div className="automations-badge-tag">
            <Zap size={14} />
            <span>Workflow Orchestration & Event Triggers Engine</span>
          </div>
          <h1 className="automations-main-title">Automations & Smart Workflows</h1>
          <p className="automations-subtitle-text">
            Automate routine agency operations: cross-platform publishing upon client approval, ROAS budget guardrails, CRM lead routing, and recurring executive reports.
          </p>
        </div>

        <div className="automations-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Automations View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid size={15} />
              <span>Active Rules</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'logs' ? 'active' : ''}`}
              onClick={() => onViewModeChange('logs')}
            >
              <List size={15} />
              <span>Execution Logs</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-browse-recipes"
            onClick={onOpenRecipesModal}
          >
            <Sparkles size={15} />
            <span>Recipe Templates</span>
          </button>

          <button
            type="button"
            className="btn-create-automation-primary"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="automations-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="automations-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search automation rules by name, trigger, or action..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="automations-search-input"
            />
          </div>

          {/* Category Filter */}
          <div className="automations-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="automations-select-field"
              aria-label="Filter by Category"
            >
              <option value="all">⚡ All Automation Categories</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="automations-select-wrapper">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="automations-select-field"
              aria-label="Filter by Rule Status"
            >
              <option value="all">Status: All</option>
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

export default AutomationsHeader;
