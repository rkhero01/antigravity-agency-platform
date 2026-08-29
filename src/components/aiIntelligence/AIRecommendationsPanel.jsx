import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Flame,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

export function AIRecommendationsPanel({
  recommendations = [],
  onCompleteRecommendation,
  onDismissRecommendation,
  onExecuteRecommendation,
  loading = false,
}) {
  const [selectedPriority, setSelectedPriority] = useState('all');

  let filtered = [...recommendations];

  if (selectedPriority !== 'all') {
    filtered = filtered.filter((r) => r.priority.toLowerCase() === selectedPriority.toLowerCase());
  }

  return (
    <div className="ai-recommendations-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="ai-recommendations-icon-badge">
            <Zap size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Prescriptive Growth Recommendations ({filtered.length})
            </h3>
            <p className="text-xs text-muted">
              Data-backed execution playbooks across media spend, lead workflows, and customer retention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {['all', 'p0', 'p1', 'p2'].map((p) => (
            <button
              key={p}
              type="button"
              className={`filter-chip-btn ${selectedPriority === p ? 'active' : ''}`}
              onClick={() => setSelectedPriority(p)}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Stack */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="ai-recommendation-item-box skeleton-card h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="wa-empty-conversations-box py-8">
          <CheckCircle2 size={32} className="text-success mb-2" />
          <strong className="text-white text-sm block">Recommendations Queue Empty</strong>
          <p className="text-xs text-muted">No pending tactical recommendations match your active filter.</p>
        </div>
      ) : (
        <div className="ai-recommendations-stack">
          {filtered.map((rec) => {
            const isP0 = rec.priority === 'P0';

            return (
              <div
                key={rec.id}
                className={`ai-recommendation-item-box ${isP0 ? 'priority-p0-border' : ''}`}
              >
                {/* Meta Row */}
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`ai-priority-badge ${rec.priority.toLowerCase()}`}>
                      {rec.priority}
                    </span>
                    <span className="ai-module-tag">🔗 {rec.relatedModule}</span>
                    <span className="ai-client-tag">🏢 {rec.clientName}</span>
                  </div>

                  <span className="text-[11px] text-success font-bold bg-success/10 px-2 py-0.5 rounded">
                    {rec.confidence} Confidence
                  </span>
                </div>

                {/* Title */}
                <h4 className="recommendation-title text-white">{rec.title}</h4>

                {/* Problem & Evidence */}
                <div className="rec-problem-box mt-1.5">
                  <span className="text-[11px] text-danger font-semibold">⚠️ Problem: </span>
                  <span className="text-xs text-slate-300">{rec.problem}</span>
                </div>

                {/* Directive */}
                <div className="rec-directive-box mt-1.5">
                  <span className="text-[11px] text-cyan font-bold">💡 Directive: </span>
                  <span className="text-xs text-white leading-relaxed">{rec.recommendation}</span>
                </div>

                {/* Footer: Impact & Execution */}
                <div className="rec-footer-row mt-3 pt-2.5 border-t border-white/6 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-dim">Expected Impact:</span>
                    <strong className="text-success font-bold">{rec.expectedImpact}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="btn-saas-secondary text-xs text-success"
                      onClick={() => onCompleteRecommendation && onCompleteRecommendation(rec.id)}
                      title="Mark as Completed"
                    >
                      <Check size={12} />
                      <span>Complete</span>
                    </button>

                    <button
                      type="button"
                      className="btn-saas-secondary text-xs text-danger"
                      onClick={() => onDismissRecommendation && onDismissRecommendation(rec.id)}
                      title="Dismiss Recommendation"
                    >
                      <X size={12} />
                    </button>

                    <button
                      type="button"
                      className="btn-ai-action"
                      onClick={() => onExecuteRecommendation && onExecuteRecommendation(rec)}
                    >
                      <span>Take Action (Demo)</span>
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

export default AIRecommendationsPanel;
