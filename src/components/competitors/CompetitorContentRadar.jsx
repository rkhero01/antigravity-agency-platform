import React from 'react';
import { Radio, Sparkles, Heart, MessageSquare, TrendingUp, Lightbulb } from 'lucide-react';

export function CompetitorContentRadar({ contentList = [] }) {
  if (contentList.length === 0) {
    return (
      <div className="competitors-empty-state-card">
        <Radio size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No viral content radar data</h4>
        <p className="empty-state-subtitle">Select a different client account or refresh social listening scans.</p>
      </div>
    );
  }

  return (
    <div className="competitor-content-radar-pane">
      <div className="radar-pane-header">
        <div>
          <h3 className="section-title">Viral Competitor Creative Radar</h3>
          <p className="section-desc">Deconstructed high-engagement creative formats, hook analyses, and actionable counter-angles</p>
        </div>
        <span className="radar-live-chip">● Live Trend Radar Active</span>
      </div>

      <div className="radar-assets-grid">
        {contentList.map((item) => (
          <div key={item.id} className="radar-asset-card">
            <div className="asset-media-box">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="asset-media-img"
              />
              <span className="asset-platform-pill">{item.platform}</span>
            </div>

            <div className="asset-card-body">
              <span className="asset-competitor-name">By {item.competitorName}</span>
              <h4 className="asset-title">{item.title}</h4>

              {/* Engagement Stats */}
              <div className="asset-stats-row">
                <div className="stat-pill">
                  <Heart size={12} className="inline-icon" />
                  <span>{item.likes} Likes</span>
                </div>
                <div className="stat-pill">
                  <MessageSquare size={12} className="inline-icon" />
                  <span>{item.comments} Comments</span>
                </div>
                <div className="stat-pill text-success">
                  <TrendingUp size={12} className="inline-icon" />
                  <span>{item.engagementRate} ER</span>
                </div>
              </div>

              {/* Breakout Reason */}
              <div className="asset-hook-box">
                <span className="hook-lbl">Why It Went Viral:</span>
                <p className="hook-desc">{item.breakoutReason}</p>
              </div>

              {/* Agency Counter Strategy */}
              <div className="asset-takeaway-box">
                <div className="takeaway-head">
                  <Lightbulb size={13} className="text-warning" />
                  <span>Agency Counter-Strategy</span>
                </div>
                <p className="takeaway-text">{item.agencyTakeaway}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompetitorContentRadar;
