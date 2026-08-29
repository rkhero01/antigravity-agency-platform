import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  RotateCw,
} from 'lucide-react';

export function DailyBriefingPanel({
  dailyBriefing = {},
  onRefreshBriefing,
  loading = false,
}) {
  const [activeSubTab, setActiveSubTab] = useState('all');

  const {
    date = 'Friday, Aug 28, 2026',
    summary = 'Agency marketing operations are pacing 18.4% above Q3 targets.',
    goodNews = [],
    attentionRequired = [],
    opportunities = [],
    topActions = [],
    criticalAlerts = [],
  } = dailyBriefing;

  return (
    <div className="daily-briefing-card">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="daily-briefing-icon-badge">
            <Sparkles size={16} className="text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Executive Daily Intelligence Briefing
              </h3>
              <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {date}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{summary}</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-saas-secondary text-xs"
          onClick={onRefreshBriefing}
          disabled={loading}
          title="Regenerate Executive Briefing (Demo Simulation)"
        >
          <RotateCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Regenerate (Demo)</span>
        </button>
      </div>

      {/* Structured Briefing Sections */}
      <div className="briefing-sections-grid">
        {/* 1. Good News */}
        <div className="briefing-block good-news-block">
          <div className="briefing-block-header">
            <CheckCircle2 size={13} className="text-success" />
            <h4 className="briefing-block-title text-success">Good News &amp; Growth Wins</h4>
          </div>
          <ul className="briefing-items-list">
            {goodNews.map((item, idx) => (
              <li key={idx} className="briefing-bullet-item">
                <span className="bullet-dot bg-success" />
                <span className="briefing-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Attention Required */}
        <div className="briefing-block attention-block">
          <div className="briefing-block-header">
            <AlertTriangle size={13} className="text-warning" />
            <h4 className="briefing-block-title text-warning">Attention &amp; SLA Friction</h4>
          </div>
          <ul className="briefing-items-list">
            {attentionRequired.map((item, idx) => (
              <li key={idx} className="briefing-bullet-item">
                <span className="bullet-dot bg-warning" />
                <span className="briefing-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Opportunities */}
        <div className="briefing-block opportunities-block">
          <div className="briefing-block-header">
            <Lightbulb size={13} className="text-cyan" />
            <h4 className="briefing-block-title text-cyan">Scalable Growth Opportunities</h4>
          </div>
          <ul className="briefing-items-list">
            {opportunities.map((item, idx) => (
              <li key={idx} className="briefing-bullet-item">
                <span className="bullet-dot bg-cyan" />
                <span className="briefing-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Top Actions */}
        <div className="briefing-block actions-block">
          <div className="briefing-block-header">
            <ArrowRight size={13} className="text-pink" />
            <h4 className="briefing-block-title text-pink">Prioritized Executive Actions</h4>
          </div>
          <div className="space-y-1.5 mt-1">
            {topActions.map((act) => (
              <div key={act.id} className="top-action-pill-row">
                <span className={`priority-tag ${act.priority.toLowerCase()}`}>
                  {act.priority}
                </span>
                <span className="action-title-text truncate">{act.title}</span>
                <span className="action-time-text">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyBriefingPanel;
