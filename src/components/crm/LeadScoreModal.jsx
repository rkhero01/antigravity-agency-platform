import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Star, Flame, ShieldAlert, RefreshCw } from 'lucide-react';
import { crmService } from '../../services/crmService.js';

export function LeadScoreModal({
  lead,
  isOpen,
  onClose,
  onUpdateScore,
}) {
  const [recalculating, setRecalculating] = useState(false);
  const [currentLead, setCurrentLead] = useState(lead);

  if (!isOpen || !lead) return null;

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      const res = crmService.calculateLeadScore(lead);
      const updated = {
        ...lead,
        leadScore: res.score,
        scoreCategory: res.category,
        scoreReasons: res.reasons,
      };
      setCurrentLead(updated);
      if (onUpdateScore) onUpdateScore(lead.id, updated);
      setRecalculating(false);
    }, 800);
  };

  const activeLead = currentLead || lead;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card lead-score-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Lead Scoring & Intent Breakdown</h3>
              <p className="modal-subtitle">Algorithmic scoring based on behavioral touchpoints and buying signals</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="lead-score-body">
          {/* Top Score Card */}
          <div className="score-summary-display-box">
            <div className="score-ring-crm">
              <span className="score-val-big">{activeLead.leadScore}</span>
              <span className="score-sub-pct">/ 100</span>
            </div>

            <div className="score-tier-details">
              <div className="flex items-center gap-2 mb-1">
                <span className={`score-badge-large ${activeLead.scoreCategory.toLowerCase()}`}>
                  {activeLead.scoreCategory === 'VIP' ? <Star size={14} className="fill-warning text-warning" /> : <Flame size={14} />}
                  {activeLead.scoreCategory} Tier Lead
                </span>
                <span className="text-xs text-muted">🏢 {activeLead.clientName}</span>
              </div>
              <h4 className="text-white text-base font-bold">{activeLead.name}</h4>
              <span className="text-xs text-muted">{activeLead.company} • Est. Deal Size: ${(activeLead.value || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Scoring Signals List */}
          <div className="score-signals-section">
            <strong className="text-xs text-primary block mb-2 font-bold uppercase">Active Intent & Scoring Signals:</strong>
            <div className="signals-list">
              {activeLead.scoreReasons?.map((reason, idx) => (
                <div key={idx} className="signal-item">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span className="text-xs text-white leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recalculate Button */}
          <button
            type="button"
            disabled={recalculating}
            onClick={handleRecalculate}
            className="btn-saas-primary w-full justify-center"
          >
            <RefreshCw size={14} className={recalculating ? 'spin' : ''} />
            <span>{recalculating ? 'Analyzing Telemetry Signals...' : 'AI Recalculate Lead Score'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadScoreModal;
