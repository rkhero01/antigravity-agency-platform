import React from 'react';
import { Plus, Sparkles, UserPlus, Calendar } from 'lucide-react';

export function DashboardHeader({
  dateRange = '30d',
  onDateRangeChange,
  onCreateContent,
  onAddClient,
}) {
  return (
    <div className="dashboard-hero-header">
      <div className="hero-greeting-block">
        <div className="greeting-badge">
          <span className="live-pulse" />
          <span>Agency Operations Live</span>
        </div>
        <h1 className="hero-title">Good morning 👋</h1>
        <p className="hero-subtitle">
          Here's what's happening across your marketing workspace.
        </p>
      </div>

      <div className="hero-actions-toolbar">
        {/* Quick Date Range Pills */}
        <div className="date-pills-selector" role="group" aria-label="Date Range">
          <button
            type="button"
            className={`date-pill-btn ${dateRange === '7d' ? 'active' : ''}`}
            onClick={() => onDateRangeChange?.('7d')}
          >
            7D
          </button>
          <button
            type="button"
            className={`date-pill-btn ${dateRange === '30d' ? 'active' : ''}`}
            onClick={() => onDateRangeChange?.('30d')}
          >
            30D
          </button>
          <button
            type="button"
            className={`date-pill-btn ${dateRange === '90d' ? 'active' : ''}`}
            onClick={() => onDateRangeChange?.('90d')}
          >
            90D
          </button>
        </div>

        {/* Secondary Action: Add Client */}
        <button
          type="button"
          className="btn-saas-secondary"
          onClick={onAddClient}
          title="Add a new client account"
        >
          <UserPlus size={16} />
          <span>Add Client</span>
        </button>

        {/* Primary Action: Create Content */}
        <button
          type="button"
          className="btn-saas-primary"
          onClick={onCreateContent}
          title="Create a new post or campaign"
        >
          <Plus size={16} />
          <span>Create Content</span>
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;
