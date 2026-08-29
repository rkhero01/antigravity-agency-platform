import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Info,
  Building,
} from 'lucide-react';

export function RevenueLeakagePanel({
  leakageItems = [],
  onFixLeakage,
  loading = false,
}) {
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <span className="leakage-severity-badge critical">🔥 Critical</span>;
      case 'high':
        return <span className="leakage-severity-badge high">⚠️ High</span>;
      case 'medium':
        return <span className="leakage-severity-badge medium">⏳ Medium</span>;
      default:
        return <span className="leakage-severity-badge low">🟢 Low</span>;
    }
  };

  const totalAtRisk = leakageItems.reduce((sum, item) => sum + (item.revenueAtRisk || 0), 0);

  return (
    <div className="revenue-leakage-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="leakage-icon-badge">
            <TrendingDown size={17} className="text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Revenue Leakage Detector &amp; Prevention Engine
            </h3>
            <p className="text-xs text-muted">
              Identifies abandoned checkout sessions, stalled enterprise proposals, overdue follow-up tasks, and SLA latency
            </p>
          </div>
        </div>

        {/* Total Revenue at Risk Badge */}
        <div className="total-risk-highlight-pill">
          <span className="text-[10px] text-dim block uppercase font-bold">Total Pipeline At Risk</span>
          <strong className="text-sm font-extrabold text-danger">
            ₹{totalAtRisk.toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Leakage Items Table / Cards */}
      <div className="space-y-3">
        {leakageItems.map((item) => (
          <div key={item.id} className="revenue-leak-item-row">
            <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {getSeverityBadge(item.severity)}
                <strong className="text-white text-xs font-bold">{item.leakTitle}</strong>
                <span className="ai-client-tag">🏢 {item.clientName}</span>
                <span className="ai-module-tag">🔗 {item.relatedModule}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-dim">Est. Value at Risk:</span>
                <strong className="text-danger font-extrabold">
                  ₹{(item.revenueAtRisk || 0).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Evidence */}
            <p className="text-xs text-slate-300 mb-2 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
              <strong className="text-dim font-semibold uppercase text-[10px] block mb-0.5">Vulnerability Evidence:</strong>
              {item.evidence}
            </p>

            {/* Directive & Fix Action */}
            <div className="flex justify-between items-center flex-wrap gap-2 pt-2 border-t border-white/6 text-xs">
              <div className="flex items-center gap-1.5">
                <strong className="text-cyan font-bold">Remediation:</strong>
                <span className="text-cyan-200">{item.recommendedAction}</span>
              </div>

              <button
                type="button"
                className="btn-ai-action text-xs py-1 px-3"
                onClick={() => onFixLeakage && onFixLeakage(item)}
              >
                <span>Plug Leak (Demo)</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Disclaimer */}
      <div className="forecast-disclaimer-box mt-4 flex items-center gap-2">
        <Info size={13} className="text-dim flex-shrink-0" />
        <span className="text-[11px] text-dim">
          Calculations labeled as Estimated / Demo Intelligence based on current pipeline dwell times and checkout abandonment analytics.
        </span>
      </div>
    </div>
  );
}

export default RevenueLeakagePanel;
