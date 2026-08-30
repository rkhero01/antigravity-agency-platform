import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  List,
  LayoutGrid,
  Plus,
  RefreshCw,
  Building,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';

export function ContentHeader({
  stageCounts,
  currentStage,
  onStageChange,
  currentFormat,
  onFormatChange,
  selectedClient,
  onClientChange,
  viewMode,
  onViewModeChange,
  onOpenComposer,
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
      console.error('Failed to load clients in content header:', e);
    }
  };

  const formats = ['All Formats', 'Carousel', 'Reels / Shorts', 'Single Image', 'Video Post', 'Thread', 'Article / Newsletter', 'Story'];

  return (
    <div className="content-hub-header">
      {/* Top Banner */}
      <div className="content-top-banner">
        <div className="content-title-box">
          <div className="content-badge">
            <CalendarDays size={14} />
            <span>Omnichannel Publishing Hub</span>
          </div>
          <h1 className="content-main-title">Content Calendar & Pipeline</h1>
          <p className="content-subtext">
            Plan, review, schedule, and orchestrate multi-network marketing assets across Meta, LinkedIn, YouTube, and Google directly connected to PostgreSQL.
          </p>
        </div>

        <div className="content-top-actions">
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
            className="btn-create-post-primary"
            onClick={onOpenComposer}
          >
            <Plus size={16} />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* Stage Progression Filter Pills */}
      <div className="content-stage-pills-row">
        <button
          type="button"
          className={`stage-pill-btn ${currentStage === 'all' ? 'active' : ''}`}
          onClick={() => onStageChange('all')}
        >
          All Stages ({stageCounts.total})
        </button>

        <button
          type="button"
          className={`stage-pill-btn scheduled ${currentStage === 'scheduled' ? 'active' : ''}`}
          onClick={() => onStageChange('scheduled')}
        >
          <span className="stage-dot scheduled" />
          Scheduled ({stageCounts.scheduled})
        </button>

        <button
          type="button"
          className={`stage-pill-btn approved ${currentStage === 'approved' ? 'active' : ''}`}
          onClick={() => onStageChange('approved')}
        >
          <span className="stage-dot approved" />
          Approved ({stageCounts.approved})
        </button>

        <button
          type="button"
          className={`stage-pill-btn in-review ${currentStage === 'in review' ? 'active' : ''}`}
          onClick={() => onStageChange('in review')}
        >
          <span className="stage-dot in-review" />
          In Review ({stageCounts.inReview})
        </button>

        <button
          type="button"
          className={`stage-pill-btn draft ${currentStage === 'draft' ? 'active' : ''}`}
          onClick={() => onStageChange('draft')}
        >
          <span className="stage-dot draft" />
          Drafts ({stageCounts.draft})
        </button>

        <button
          type="button"
          className={`stage-pill-btn published ${currentStage === 'published' ? 'active' : ''}`}
          onClick={() => onStageChange('published')}
        >
          <span className="stage-dot published" />
          Published ({stageCounts.published})
        </button>
      </div>

      {/* Second Row Controls: Client Filter, Format Selector, View Switcher */}
      <div className="content-controls-secondary-row">
        <div className="content-left-filters">
          {/* Client Filter */}
          <div className="content-filter-select-wrapper">
            <Building size={14} className="filter-inline-icon" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="content-select-input"
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

          {/* Format Filter */}
          <div className="content-filter-select-wrapper">
            <select
              value={currentFormat}
              onChange={(e) => onFormatChange(e.target.value)}
              className="content-select-input"
              aria-label="Filter by Format"
            >
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="content-view-mode-toggle" role="group" aria-label="View Mode">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => onViewModeChange('calendar')}
            title="Calendar View"
          >
            <CalendarDays size={16} />
            <span>Calendar</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List / Table View"
          >
            <List size={16} />
            <span>List</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            <LayoutGrid size={16} />
            <span>Cards</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentHeader;
