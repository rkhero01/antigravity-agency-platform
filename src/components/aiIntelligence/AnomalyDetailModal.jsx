import React from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Activity,
} from 'lucide-react';

export function AnomalyDetailModal({
  anomaly,
  isOpen,
  onClose,
  onResolve,
  onRemediate,
}) {
  if (!isOpen || !anomaly) return null;

  const isCritical = anomaly.severity === 'Critical';
  const isPositive = anomaly.severity === 'Positive Spike';
  const isWarning = anomaly.severity === 'Warning';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-anomaly-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`modal-icon-badge ${
                isCritical ? 'bg-danger/20 text-danger' : isPositive ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
              }`}
            >
              {isCritical ? <ShieldAlert size={18} /> : isPositive ? <Sparkles size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`anomaly-severity-pill ${
                    isCritical ? 'critical' : isPositive ? 'positive' : 'warning'
                  }`}
                >
                  {anomaly.severity}
                </span>
                <span className="ai-client-tag">🏢 {anomaly.clientName}</span>
                <span className="text-[10px] text-dim">• {anomaly.detectedAt}</span>
              </div>
              <h3 className="modal-title mt-1">{anomaly.anomalyType}</h3>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Metric Comparison Box */}
          <div className="grid grid-cols-3 gap-3">
            <div className="metric-box-sub">
              <span className="text-[10px] text-dim block uppercase font-bold">Observed Metric</span>
              <strong className="text-xs text-white font-bold block mt-0.5">{anomaly.metric}</strong>
            </div>

            <div className="metric-box-sub">
              <span className="text-[10px] text-dim block uppercase font-bold">Current vs Target</span>
              <strong
                className={`text-xs font-bold block mt-0.5 ${
                  isPositive ? 'text-success' : 'text-danger'
                }`}
              >
                {anomaly.currentValue}{' '}
                <span className="text-dim text-[10px] font-normal">(Exp {anomaly.expectedValue})</span>
              </strong>
            </div>

            <div className="metric-box-sub">
              <span className="text-[10px] text-dim block uppercase font-bold">Deviation Spread</span>
              <strong
                className={`text-xs font-bold block mt-0.5 ${
                  isPositive ? 'text-success' : 'text-danger'
                }`}
              >
                {anomaly.deviation}
              </strong>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-1">
              Diagnostic Root-Cause Explanation
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-white/5">
              {anomaly.explanation}
            </p>
          </div>

          {/* Recommended Action */}
          <div>
            <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-1">
              Recommended Remediation Directive
            </h4>
            <div className="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl flex items-start gap-2">
              <span className="text-cyan font-bold">👉</span>
              <span className="text-xs text-cyan-100 font-medium leading-relaxed">
                {anomaly.recommendedAction}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer flex justify-between items-center p-4 border-t border-white/8">
          <button
            type="button"
            className="btn-saas-secondary text-xs text-success"
            onClick={() => {
              if (onResolve) onResolve(anomaly.id);
              onClose();
            }}
          >
            <CheckCircle2 size={12} />
            <span>Mark Resolved (Demo)</span>
          </button>

          <div className="flex items-center gap-2">
            <button type="button" className="btn-saas-secondary text-xs" onClick={onClose}>
              Close
            </button>

            <button
              type="button"
              className="btn-ai-action text-xs"
              onClick={() => {
                if (onRemediate) onRemediate(anomaly);
                onClose();
              }}
            >
              <span>Auto-Remediate (Demo)</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnomalyDetailModal;
