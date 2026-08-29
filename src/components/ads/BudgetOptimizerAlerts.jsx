import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Zap, AlertTriangle } from 'lucide-react';

export function BudgetOptimizerAlerts({ recommendations = [], onApplyRecommendation }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="optimizer-card all-optimized">
        <div className="optimizer-header">
          <Sparkles size={16} className="text-success" />
          <h4>AI Budget Optimizer</h4>
        </div>
        <p className="all-clear-text">
          <CheckCircle2 size={15} className="text-success inline-icon" /> All active campaigns are operating within peak algorithmic efficiency. No budget bottlenecks detected.
        </p>
      </div>
    );
  }

  return (
    <div className="optimizer-card">
      <div className="optimizer-header">
        <div className="optimizer-title-group">
          <div className="optimizer-icon-badge">
            <Zap size={15} />
          </div>
          <div>
            <h4 className="optimizer-main-title">AI Campaign Budget Optimizer</h4>
            <p className="optimizer-subtext">Real-time algorithmic scaling and cost-efficiency recommendations</p>
          </div>
        </div>
        <span className="rec-count-tag">{recommendations.length} Available</span>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec) => (
          <div key={rec.id} className="rec-item-card">
            <div className="rec-top-row">
              <div className="rec-title-box">
                <strong className="rec-title">{rec.title}</strong>
                <span className="rec-campaign-name">📍 {rec.campaignName}</span>
              </div>
              <span className="rec-impact-badge">{rec.impact}</span>
            </div>

            <p className="rec-description">{rec.description}</p>

            <div className="rec-action-row">
              <button
                type="button"
                className="btn-apply-rec"
                onClick={() => onApplyRecommendation(rec.id)}
              >
                <Sparkles size={13} />
                <span>{rec.actionLabel}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BudgetOptimizerAlerts;
