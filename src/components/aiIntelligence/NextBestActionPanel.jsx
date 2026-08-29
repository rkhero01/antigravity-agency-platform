import React from 'react';
import {
  Zap,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

export function NextBestActionPanel({
  actions = [],
  onExecuteAction,
  onNavigateModule,
  onSnoozeAction,
  onDismissAction,
  loading = false,
}) {
  return (
    <div className="next-best-action-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="next-action-icon-badge">
            <Zap size={17} className="text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Next Best Action (NBA) Decision Engine
            </h3>
            <p className="text-xs text-muted">
              Context-aware cross-module prescriptive interventions ranked by revenue upside, operator SLA, and execution readiness
            </p>
          </div>
        </div>

        <span className="text-xs text-warning font-bold bg-warning/10 px-2.5 py-1 rounded border border-warning/20">
          Ranked Prescriptive Directives ({actions.length})
        </span>
      </div>

      {/* Action Cards */}
      <div className="space-y-3.5">
        {actions.map((act) => {
          const isP0 = act.priority === 'P0';

          return (
            <div
              key={act.id}
              className={`nba-item-card ${isP0 ? 'p0-urgency' : ''}`}
            >
              <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`ai-priority-badge ${act.priority.toLowerCase()}`}>
                    {act.priority}
                  </span>
                  <span className="ai-client-tag">🏢 {act.clientName}</span>
                  <span className="ai-module-tag">🔗 {act.moduleLabel || act.relatedModule}</span>
                </div>

                <span className="text-[11px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {act.confidence} Confidence
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-1">{act.title}</h4>
              <p className="text-xs text-slate-300 mb-2 leading-snug">{act.problem}</p>

              {/* Directive */}
              <div className="nba-directive-box mb-2.5">
                <div className="flex items-start gap-1.5 text-xs">
                  <strong className="text-cyan font-bold flex-shrink-0">Directive:</strong>
                  <span className="text-white font-medium">{act.recommendedAction}</span>
                </div>
              </div>

              {/* Footer with Cross-Module Navigation & Execution */}
              <div className="flex justify-between items-center flex-wrap gap-2 pt-2.5 border-t border-white/6 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-dim">Expected Impact:</span>
                  <strong className="text-success font-bold">{act.expectedImpact}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-saas-secondary text-xs py-1 px-2.5"
                    onClick={() => onSnoozeAction && onSnoozeAction(act.id)}
                    title="Snooze for 24 hours"
                  >
                    <Clock size={11} />
                    <span>Snooze</span>
                  </button>

                  <button
                    type="button"
                    className="btn-saas-secondary text-xs py-1 px-2 text-danger"
                    onClick={() => onDismissAction && onDismissAction(act.id)}
                    title="Dismiss"
                  >
                    <X size={11} />
                  </button>

                  {act.relatedModule && (
                    <button
                      type="button"
                      className="btn-saas-secondary text-xs py-1 px-2.5 text-cyan"
                      onClick={() => onNavigateModule && onNavigateModule(act.relatedModule)}
                      title="Navigate directly to application module"
                    >
                      <span>Open in {act.moduleLabel || 'Module'}</span>
                      <ExternalLink size={10} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-ai-action text-xs py-1 px-3"
                    onClick={() => onExecuteAction && onExecuteAction(act)}
                  >
                    <span>Execute (Demo)</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NextBestActionPanel;
