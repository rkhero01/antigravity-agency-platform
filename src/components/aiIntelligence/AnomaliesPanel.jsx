import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react';

export function AnomaliesPanel({
  anomalies = [],
  onFixAnomaly,
  loading = false,
}) {
  return (
    <div className="ai-anomalies-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="ai-anomalies-icon-badge">
            <AlertTriangle size={16} className="text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Outliers &amp; Anomaly Detection ({anomalies.length})
            </h3>
            <p className="text-xs text-muted">
              Continuous machine learning scans monitoring SLA breaches, checkout friction, and positive viral spikes
            </p>
          </div>
        </div>

        <span className="text-[11px] text-cyan font-bold bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
          Automated Pattern Scanner Active
        </span>
      </div>

      {/* Anomalies List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="anomaly-item-card skeleton-card h-40" />
          ))}
        </div>
      ) : anomalies.length === 0 ? (
        <div className="wa-empty-conversations-box py-8">
          <CheckCircle2 size={32} className="text-success mb-2" />
          <strong className="text-white text-sm block">Zero Operational Anomalies</strong>
          <p className="text-xs text-muted">All active client marketing channels and response SLAs are within expected parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {anomalies.map((anom) => {
            const isCritical = anom.severity === 'Critical';
            const isPositive = anom.severity === 'Positive Spike';
            const isWarning = anom.severity === 'Warning';

            return (
              <div
                key={anom.id}
                className={`anomaly-item-card ${
                  isCritical ? 'severity-critical' : isPositive ? 'severity-positive' : 'severity-warning'
                }`}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5">
                    {isCritical && <ShieldAlert size={14} className="text-danger flex-shrink-0" />}
                    {isPositive && <Sparkles size={14} className="text-success flex-shrink-0" />}
                    {isWarning && <AlertTriangle size={14} className="text-warning flex-shrink-0" />}
                    <strong className="anomaly-type-title">{anom.anomalyType}</strong>
                  </div>

                  <span
                    className={`anomaly-severity-pill ${
                      isCritical ? 'critical' : isPositive ? 'positive' : 'warning'
                    }`}
                  >
                    {anom.severity}
                  </span>
                </div>

                {/* Client & Detection */}
                <div className="flex justify-between items-center text-[11px] text-dim mb-2">
                  <span>🏢 {anom.clientName}</span>
                  <span>{anom.detectedAt}</span>
                </div>

                {/* Value Matrix */}
                <div className="anomaly-metric-box">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-dim">Observed Metric:</span>
                    <strong className="text-white">{anom.metric}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-dim">Current vs Expected:</span>
                    <span className="font-bold">
                      <span className={isPositive ? 'text-success' : 'text-danger'}>
                        {anom.currentValue}
                      </span>
                      <span className="text-dim"> (Target {anom.expectedValue})</span>
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-right">
                    <span className={isPositive ? 'text-success' : 'text-danger'}>
                      Deviation: {anom.deviation}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <p className="anomaly-explanation-text mt-2">{anom.explanation}</p>

                {/* Directive Action Footer */}
                <div className="mt-3 pt-2 border-t border-white/6 flex justify-between items-center">
                  <span className="text-[10px] text-dim">Recommended Fix:</span>
                  <button
                    type="button"
                    className="btn-ai-action text-[11px] py-1 px-2"
                    onClick={() => onFixAnomaly && onFixAnomaly(anom)}
                  >
                    <span>Auto-Remediate (Demo)</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AnomaliesPanel;
