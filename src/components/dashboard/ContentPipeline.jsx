import React from 'react';
import { mockContentPipeline } from '../../data/mockDashboard.js';
import {
  CalendarDays,
  FileEdit,
  Eye,
  CheckCircle,
  Clock,
  Send,
  ArrowUpRight,
} from 'lucide-react';

const STAGE_ICONS = {
  Draft: FileEdit,
  'In Review': Eye,
  Approved: CheckCircle,
  Scheduled: Clock,
  Published: Send,
};

export function ContentPipeline({ onNavigateToContent }) {
  const totalInPipeline = mockContentPipeline
    .filter((s) => s.stage !== 'Published')
    .reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="dashboard-widget-card content-pipeline-card">
      <div className="widget-header-row">
        <div className="widget-header-text">
          <div className="widget-title-with-icon">
            <CalendarDays size={16} className="text-violet" />
            <h3 className="widget-title">Content Pipeline</h3>
          </div>
          <p className="widget-subtitle">
            {totalInPipeline} active content assets moving through agency production
          </p>
        </div>
        <button
          type="button"
          className="widget-action-link"
          onClick={onNavigateToContent}
        >
          <span>Content Hub</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Visual Stage Progress Bars & Counters */}
      <div className="pipeline-stages-grid">
        {mockContentPipeline.map((stage) => {
          const IconComponent = STAGE_ICONS[stage.stage] || FileEdit;
          return (
            <div key={stage.stage} className="pipeline-stage-box">
              <div className="stage-top-meta">
                <div
                  className="stage-icon-circle"
                  style={{ color: stage.color, borderColor: `${stage.color}40` }}
                >
                  <IconComponent size={15} />
                </div>
                <span className="stage-name-label">{stage.stage}</span>
              </div>

              <div className="stage-counter-display">
                <span className="stage-count-number">{stage.count}</span>
                <span className="stage-unit">posts</span>
              </div>

              <div className="stage-progress-track">
                <div
                  className="stage-progress-fill"
                  style={{
                    width: `${Math.min(stage.percentage, 100)}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContentPipeline;
