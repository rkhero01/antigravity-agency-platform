import React from 'react';
import { Target, Trash2, PieChart, TrendingUp, DollarSign } from 'lucide-react';

export function CompetitorCard({
  competitor,
  onDeleteCompetitor,
}) {
  return (
    <div className="competitor-card-item">
      {/* Top Header */}
      <div className="comp-card-header">
        <div className="comp-brand-profile">
          <img
            src={competitor.avatar}
            alt={competitor.name}
            className="comp-avatar-img"
          />
          <div>
            <div className="comp-name-row">
              <strong className="comp-brand-name">{competitor.name}</strong>
              <span className={`comp-platform-badge ${competitor.platform.toLowerCase()}`}>
                {competitor.platform}
              </span>
            </div>
            <span className="comp-handle-text">{competitor.handle}</span>
          </div>
        </div>

        <span className="comp-client-tag">🏢 {competitor.clientName}</span>
      </div>

      {/* 4 Metric Stats Grid */}
      <div className="comp-metrics-grid">
        <div className="comp-m-block">
          <span className="cm-lbl">Followers</span>
          <strong className="cm-val">{competitor.followers}</strong>
        </div>
        <div className="comp-m-block">
          <span className="cm-lbl">Posting Pacing</span>
          <strong className="cm-val text-cyan">{competitor.postingFrequency}</strong>
        </div>
        <div className="comp-m-block">
          <span className="cm-lbl">Avg Engagement</span>
          <strong className="cm-val text-primary">{competitor.engagementRate}</strong>
        </div>
        <div className="comp-m-block">
          <span className="cm-lbl">Est. Ad Spend</span>
          <strong className="cm-val text-warning">{competitor.estimatedAdSpend}</strong>
        </div>
      </div>

      {/* Share of Voice Progress Bar */}
      <div className="comp-sov-block">
        <div className="sov-header-row">
          <span className="sov-lbl">
            <PieChart size={12} className="inline-icon" /> Category Share of Voice
          </span>
          <strong className="sov-val">{competitor.shareOfVoice}</strong>
        </div>
        <div className="sov-progress-track">
          <div
            className="sov-progress-fill"
            style={{ width: competitor.shareOfVoice || '30%' }}
          />
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="comp-swot-box">
        <div className="swot-row">
          <span className="swot-tag positive">Strength:</span>
          <p className="swot-text">{competitor.strengths}</p>
        </div>
        <div className="swot-row">
          <span className="swot-tag negative">Weakness:</span>
          <p className="swot-text">{competitor.weaknesses}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="comp-card-footer">
        <span className="comp-status-live">● Live Tracking Active</span>
        <button
          type="button"
          className="btn-delete-comp"
          onClick={() => onDeleteCompetitor(competitor.id)}
          title="Stop tracking competitor"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default CompetitorCard;
