import React from 'react';
import {
  CalendarDays,
  List,
  LayoutGrid,
  Plus,
  Filter,
  Building,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

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
}) {
  const formats = ['All Formats', 'Post', 'Reel', 'Story', 'Carousel', 'Video'];

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
            Plan, review, schedule, and auto-publish multi-network marketing assets across Meta, LinkedIn, YouTube, and Google.
          </p>
        </div>

        <div className="content-top-actions">
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
          className={`stage-pill-btn scheduled ${currentStage === 'Scheduled' ? 'active' : ''}`}
          onClick={() => onStageChange('Scheduled')}
        >
          <span className="dot-scheduled" />
          Scheduled ({stageCounts.scheduled})
        </button>
        <button
          type="button"
          className={`stage-pill-btn approved ${currentStage === 'Approved' ? 'active' : ''}`}
          onClick={() => onStageChange('Approved')}
        >
          <span className="dot-approved" />
          Approved ({stageCounts.approved})
        </button>
        <button
          type="button"
          className={`stage-pill-btn review ${currentStage === 'In Review' ? 'active' : ''}`}
          onClick={() => onStageChange('In Review')}
        >
          <span className="dot-review" />
          In Review ({stageCounts.inReview})
        </button>
        <button
          type="button"
          className={`stage-pill-btn draft ${currentStage === 'Draft' ? 'active' : ''}`}
          onClick={() => onStageChange('Draft')}
        >
          <span className="dot-draft" />
          Drafts ({stageCounts.draft})
        </button>
        <button
          type="button"
          className={`stage-pill-btn published ${currentStage === 'Published' ? 'active' : ''}`}
          onClick={() => onStageChange('Published')}
        >
          <span className="dot-published" />
          Published ({stageCounts.published})
        </button>
      </div>

      {/* Filter and View Control Toolbar */}
      <div className="content-controls-toolbar">
        <div className="toolbar-left-filters">
          {/* Client Filter */}
          <div className="toolbar-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="toolbar-select-field"
              aria-label="Filter by Client"
            >
              <option value="all">🏢 All Client Accounts</option>
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format Filter */}
          <div className="toolbar-select-wrapper">
            <Filter size={14} className="icon-muted" />
            <select
              value={currentFormat}
              onChange={(e) => onFormatChange(e.target.value)}
              className="toolbar-select-field"
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

        {/* View Switcher: Calendar / List / Grid */}
        <div className="view-mode-tabs-group" role="group" aria-label="View Mode">
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => onViewModeChange('calendar')}
          >
            <CalendarDays size={15} />
            <span>Calendar</span>
          </button>
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
          >
            <List size={15} />
            <span>List & Feed</span>
          </button>
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid size={15} />
            <span>Media Grid</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentHeader;
