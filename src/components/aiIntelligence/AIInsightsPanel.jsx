import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Eye,
  X,
  TrendingUp,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';

export function AIInsightsPanel({
  insights = [],
  onDismissInsight,
  onSnoozeInsight,
  onTakeAction,
  loading = false,
}) {
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const priorities = [
    { id: 'all', label: 'All Insights' },
    { id: 'p0', label: '🔴 P0 Critical' },
    { id: 'p1', label: '🟡 P1 High' },
    { id: 'p2', label: '🔵 P2 Medium' },
    { id: 'p3', label: '⚪ P3 Low' },
  ];

  let filtered = [...insights];

  if (selectedPriority !== 'all') {
    filtered = filtered.filter((ins) => ins.priority.toLowerCase() === selectedPriority.toLowerCase());
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (ins) =>
        ins.title.toLowerCase().includes(q) ||
        ins.summary.toLowerCase().includes(q) ||
        ins.clientName.toLowerCase().includes(q) ||
        ins.category.toLowerCase().includes(q)
    );
  }

  return (
    <div className="ai-insights-card">
      {/* Header & Filter Row */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="ai-insights-icon-badge">
            <Sparkles size={16} className="text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Strategic Growth Insights ({filtered.length})
            </h3>
            <p className="text-xs text-muted">
              Prescriptive machine intelligence identifying cross-channel revenue expansion and efficiency angles
            </p>
          </div>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {priorities.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`filter-chip-btn ${selectedPriority === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPriority(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Cards List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="ai-insight-item-box skeleton-card h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="wa-empty-conversations-box py-8">
          <CheckCircle2 size={32} className="text-success mb-2" />
          <strong className="text-white text-sm block">All Insights Reviewed</strong>
          <p className="text-xs text-muted">No pending strategic insights match your active filter criteria.</p>
        </div>
      ) : (
        <div className="ai-insights-stack">
          {filtered.map((ins) => {
            const isP0 = ins.priority === 'P0';
            const isP1 = ins.priority === 'P1';

            return (
              <div
                key={ins.id}
                className={`ai-insight-item-box ${isP0 ? 'priority-p0-border' : isP1 ? 'priority-p1-border' : ''}`}
              >
                {/* Top Meta Bar */}
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`ai-priority-badge ${ins.priority.toLowerCase()}`}>
                      {ins.priority} {isP0 ? '• Critical' : isP1 ? '• High' : ''}
                    </span>
                    <span className="ai-category-tag">📂 {ins.category}</span>
                    <span className="ai-client-tag">🏢 {ins.clientName}</span>
                    <span className="text-[10px] text-dim">• {ins.detectedAt}</span>
                  </div>

                  <span className="text-[11px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {ins.confidence} Confidence
                  </span>
                </div>

                {/* Title & Summary */}
                <h4 className="insight-title text-white">{ins.title}</h4>
                <p className="insight-summary-text">{ins.summary}</p>

                {/* Quantitative Evidence Box */}
                <div className="insight-evidence-box mt-2">
                  <span className="text-[10px] text-dim block uppercase font-bold">Quantitative Validation:</span>
                  <span className="text-xs text-emerald-300 font-medium">{ins.evidence}</span>
                </div>

                {/* Impact & Actions Footer */}
                <div className="insight-footer-row mt-3 pt-2.5 border-t border-white/6 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-dim">Projected Impact:</span>
                    <strong className="text-success font-bold">{ins.impact}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="btn-saas-secondary text-xs"
                      onClick={() => onSnoozeInsight && onSnoozeInsight(ins.id)}
                      title="Snooze insight for 24h"
                    >
                      <Clock size={11} />
                      <span>Snooze</span>
                    </button>

                    <button
                      type="button"
                      className="btn-saas-secondary text-xs text-danger hover:bg-danger/20"
                      onClick={() => onDismissInsight && onDismissInsight(ins.id)}
                      title="Dismiss insight"
                    >
                      <X size={11} />
                      <span>Dismiss</span>
                    </button>

                    <button
                      type="button"
                      className="btn-ai-action"
                      onClick={() => onTakeAction && onTakeAction(ins)}
                    >
                      <span>{ins.actionType || 'Execute Action'}</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AIInsightsPanel;
