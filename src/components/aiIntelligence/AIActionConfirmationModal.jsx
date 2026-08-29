import React from 'react';
import {
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

export function AIActionConfirmationModal({
  preview,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!isOpen || !preview) return null;

  const isBulk = Array.isArray(preview.items);
  const title = isBulk ? `Bulk Execute ${preview.items.length} Directives` : preview.title;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-action-confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3 min-w-0">
            <div className="modal-icon-badge bg-warning/20 text-warning">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="ai-module-tag">🔗 {preview.targetModule || 'Multi-Module'}</span>
                <span className="ai-client-tag">🏢 {preview.clientName || 'Agency-Wide'}</span>
                <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Simulation Ready
                </span>
              </div>
              <h3 className="modal-title mt-1">{title}</h3>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Mandatory Demo Transparency Banner */}
          <div className="action-confirm-disclaimer-banner">
            <Info size={16} className="text-warning flex-shrink-0" />
            <div>
              <strong className="text-xs text-white block">Demo Action — No external API call will be performed.</strong>
              <span className="text-[11px] text-slate-300">
                This operation will update the sandbox intelligence state and generate an audit record in memory.
              </span>
            </div>
          </div>

          {/* If Single Item: Detailed Before vs After and Rationale */}
          {!isBulk && (
            <>
              {/* Problem & Evidence */}
              <div>
                <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-1">
                  Why AI Recommended This Action
                </h4>
                <p className="text-xs text-slate-200 bg-slate-900/50 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                  {preview.problem}
                </p>
                <div className="mt-2 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-xs text-emerald-300 font-medium">
                  <strong>Evidence: </strong> {preview.evidence}
                </div>
              </div>

              {/* Before -> After State Preview */}
              <div>
                <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-1.5">
                  State Transformation Preview
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-dim font-bold uppercase block mb-0.5">Current State (Before):</span>
                    <p className="text-xs text-slate-300 leading-snug">{preview.beforeState}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
                    <span className="text-[10px] text-cyan font-bold uppercase block mb-0.5">Simulated State (After):</span>
                    <p className="text-xs text-white font-medium leading-snug">{preview.afterState}</p>
                  </div>
                </div>
              </div>

              {/* 3 Metrics Callouts */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="metric-box-sub">
                  <span className="text-[10px] text-dim uppercase font-bold block">Expected Impact</span>
                  <strong className="text-success font-bold text-xs">{preview.estimatedImpact}</strong>
                </div>
                <div className="metric-box-sub">
                  <span className="text-[10px] text-dim uppercase font-bold block">Confidence</span>
                  <strong className="text-cyan font-bold text-xs">{preview.confidence}</strong>
                </div>
                <div className="metric-box-sub">
                  <span className="text-[10px] text-dim uppercase font-bold block">Records Affected</span>
                  <strong className="text-white font-bold text-xs">{preview.recordsAffected || 1} Record(s)</strong>
                </div>
              </div>

              {/* Risk if ignored */}
              {preview.riskIfIgnored && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs">
                  <span className="text-[10px] text-rose-300 font-bold uppercase block">Risk if Ignored:</span>
                  <span className="text-rose-200">{preview.riskIfIgnored}</span>
                </div>
              )}
            </>
          )}

          {/* If Bulk Items: List of selected items */}
          {isBulk && (
            <div>
              <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-2">
                Selected Batch Operations ({preview.items.length})
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {preview.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`ai-priority-badge ${(it.priority || 'p1').toLowerCase()}`}>{it.priority || 'P1'}</span>
                        <strong className="text-white">{it.title}</strong>
                      </div>
                      <span className="text-[11px] text-dim">🏢 {it.clientName} • 🔗 {it.targetModule || it.relatedModule}</span>
                    </div>
                    <span className="text-success font-bold text-xs">{it.expectedImpact || it.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-dialog-footer flex justify-between items-center p-4 border-t border-white/8">
          <button type="button" className="btn-saas-secondary text-xs" onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button
            type="button"
            className="btn-ai-action text-xs px-4"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span>Simulating...</span>
            ) : (
              <>
                <span>Confirm &amp; Execute (Demo)</span>
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIActionConfirmationModal;
