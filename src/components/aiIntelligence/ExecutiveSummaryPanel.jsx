import React from 'react';
import {
  FileText,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';

export function ExecutiveSummaryPanel({
  summaryData = {},
  onExecuteAction,
  loading = false,
}) {
  const {
    todayBusinessState = 'Agency revenue momentum is pacing at +29.5% MoM with ₹12,840,000 in attributed GMV across 7 active clients and an overall health score of 92/100.',
    whatIsWorking = 'Meta Click-to-WhatsApp (11.1x ROAS) and Google Search Ads are driving record high-intent lead volume with sub-45s first touch SLA.',
    whatIsUnderperforming = 'Proposal stage technical SOC2 security review stalls and evening 6–9 PM chat queue SLA latency at Apex Fitness Club.',
    biggestOpportunity = 'Scale High-ROAS Meta Ad Sets by 25% (+₹380,000 / mo)',
    biggestRisk = 'Unassisted Payment Link Abandonment (₹240,000 at risk)',
    topActions = [],
    expectedImpact = '+₹2,190,000 projected monthly revenue expansion across top 3 actionable interventions.',
    disclaimer = 'AI-generated summary — Demo Intelligence',
  } = summaryData;

  return (
    <div className="executive-summary-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="summary-icon-badge">
            <Sparkles size={17} className="text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Executive Intelligence Briefing
              </h3>
              <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {disclaimer}
              </span>
            </div>
            <p className="text-xs text-muted">
              Consolidated agency-wide narrative synthesizing operational signals, revenue velocity, and critical interventions
            </p>
          </div>
        </div>

        <span className="text-xs text-success font-bold bg-success/10 px-2.5 py-1 rounded border border-success/20">
          Daily Synthesis Updated
        </span>
      </div>

      {/* 2-Column Executive Synthesis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* 1. Today's Business State */}
          <div className="summary-section-box">
            <span className="summary-section-title text-dim">
              📊 Today's Business State
            </span>
            <p className="summary-section-body">{todayBusinessState}</p>
          </div>

          {/* 2. What Is Working vs Underperforming */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="summary-section-box border-l-2 border-l-success">
              <span className="summary-section-title text-success">
                🟢 What Is Working
              </span>
              <p className="summary-section-body">{whatIsWorking}</p>
            </div>

            <div className="summary-section-box border-l-2 border-l-warning">
              <span className="summary-section-title text-warning">
                ⚠️ Areas Needing Attention
              </span>
              <p className="summary-section-body">{whatIsUnderperforming}</p>
            </div>
          </div>

          {/* 3. Biggest Opportunity & Risk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="summary-section-box border-l-2 border-l-cyan">
              <span className="summary-section-title text-cyan">
                💎 Top Revenue Opportunity
              </span>
              <p className="summary-section-body font-semibold text-white">{biggestOpportunity}</p>
            </div>

            <div className="summary-section-box border-l-2 border-l-danger">
              <span className="summary-section-title text-danger">
                🛡️ Top Operational Risk
              </span>
              <p className="summary-section-body font-semibold text-white">{biggestRisk}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Top 3 Prescriptive Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/40 p-4 rounded-xl border border-white/5">
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Top 3 Priority Actions
              </span>
              <span className="text-[10px] text-cyan font-bold">P0 / P1 Directives</span>
            </div>

            <div className="space-y-2.5">
              {topActions.map((act, i) => (
                <div key={act.id || i} className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`ai-priority-badge ${act.priority?.toLowerCase() || 'p1'}`}>
                      {act.priority || 'P1'}
                    </span>
                    <span className="text-[10px] text-dim">{act.clientName}</span>
                  </div>
                  <strong className="text-xs text-white block mb-1">{act.title}</strong>
                  <span className="text-[11px] text-cyan-200 block mb-2 leading-tight">
                    👉 {act.recommendedAction}
                  </span>

                  <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-[10px]">
                    <span className="text-success font-semibold">{act.expectedImpact}</span>
                    <button
                      type="button"
                      className="btn-ai-action text-[10px] py-0.5 px-2"
                      onClick={() => onExecuteAction && onExecuteAction(act)}
                    >
                      <span>Execute (Demo)</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Cumulative Impact */}
          <div className="mt-3 pt-2.5 border-t border-white/6 flex items-center justify-between text-xs">
            <span className="text-dim">Cumulative Projected Lift:</span>
            <strong className="text-success font-extrabold text-xs">{expectedImpact}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveSummaryPanel;
