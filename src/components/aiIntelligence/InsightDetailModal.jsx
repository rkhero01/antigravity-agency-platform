import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Building,
  Layers,
  Flame,
  Activity,
  Target,
  Zap,
} from 'lucide-react';

export function InsightDetailModal({
  insight,
  isOpen,
  onClose,
  onSnooze,
  onDismiss,
  onExecute,
}) {
  if (!isOpen || !insight) return null;

  const isP0 = insight.priority === 'P0';

  // Structured Decision Trace
  const trace = {
    signal: insight.title || 'Significant velocity signal detected in media attribution data.',
    metrics: insight.evidence || 'Conversion rate and dwell time spread exceeds normal baseline by +24%.',
    riskOrOpportunity: insight.impact || 'Opportunity to capture unmet demand and improve campaign ROAS.',
    recommendedAction: insight.recommendedAction || 'Execute targeted optimization playbook.',
    expectedOutcome: insight.impact || '+18% expected lift in qualified conversions.',
    confidence: insight.confidence || '94.2%',
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-insight-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3 min-w-0">
            <div className="modal-icon-badge">
              <Sparkles size={18} className="text-warning" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`ai-priority-badge ${insight.priority?.toLowerCase() || 'p1'}`}>
                  {insight.priority} {isP0 ? '• Critical' : ''}
                </span>
                <span className="ai-category-tag">📂 {insight.category}</span>
                <span className="ai-client-tag">🏢 {insight.clientName}</span>
              </div>
              <h3 className="modal-title mt-1">{insight.title}</h3>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="insight-modal-body p-5 space-y-4">
          {/* Executive Synthesis */}
          <div className="insight-modal-section">
            <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-1">
              Executive Synthesis
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-white/5">
              {insight.summary}
            </p>
          </div>

          {/* AI Decision Trace Section */}
          <div className="decision-trace-box p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Target size={14} className="text-cyan" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                AI Decision Trace &amp; Diagnostic Rationale
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="trace-step-badge">1</span>
                <div>
                  <strong className="text-slate-300 block">Signal Detected:</strong>
                  <span className="text-white font-medium">{trace.signal}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="trace-step-badge">2</span>
                <div>
                  <strong className="text-slate-300 block">Supporting Metrics &amp; Evidence:</strong>
                  <span className="text-emerald-300 font-medium">{trace.metrics}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="trace-step-badge">3</span>
                <div>
                  <strong className="text-slate-300 block">Business Risk / Opportunity:</strong>
                  <span className="text-warning font-semibold">{trace.riskOrOpportunity}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="trace-step-badge">4</span>
                <div>
                  <strong className="text-slate-300 block">Recommended Action Directive:</strong>
                  <span className="text-cyan-200 font-medium">{trace.recommendedAction}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="trace-step-badge">5</span>
                <div>
                  <strong className="text-slate-300 block">Expected Business Outcome:</strong>
                  <span className="text-success font-bold">{trace.expectedOutcome}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="trace-step-badge">6</span>
                <div>
                  <strong className="text-slate-300 block">Statistical Confidence:</strong>
                  <span className="text-purple font-bold">{trace.confidence} Statistical Reliability</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="metric-box-sub">
              <span className="text-[10px] text-dim block uppercase font-bold">Projected Impact</span>
              <strong className="text-xs text-success font-bold block mt-0.5">{insight.impact}</strong>
            </div>

            <div className="metric-box-sub">
              <span className="text-[10px] text-dim block uppercase font-bold">Confidence Score</span>
              <strong className="text-xs text-cyan font-bold block mt-0.5">{insight.confidence}</strong>
            </div>

            <div className="metric-box-sub">
              <span className="text-[10px] text-dim block uppercase font-bold">Discovery Pacing</span>
              <span className="text-xs text-white block mt-0.5">{insight.detectedAt}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-dialog-footer flex justify-between items-center p-4 border-t border-white/8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-saas-secondary text-xs"
              onClick={() => {
                if (onSnooze) onSnooze(insight.id);
                onClose();
              }}
            >
              <Clock size={12} />
              <span>Snooze (24h)</span>
            </button>

            <button
              type="button"
              className="btn-saas-secondary text-xs text-danger"
              onClick={() => {
                if (onDismiss) onDismiss(insight.id);
                onClose();
              }}
            >
              <X size={12} />
              <span>Dismiss</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn-saas-secondary text-xs" onClick={onClose}>
              Close
            </button>

            <button
              type="button"
              className="btn-ai-action text-xs"
              onClick={() => {
                if (onExecute) onExecute(insight);
                onClose();
              }}
            >
              <span>{insight.actionType || 'Execute Action (Demo)'}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightDetailModal;
