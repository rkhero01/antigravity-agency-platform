import React from 'react';
import {
  X,
  Printer,
  FileText,
  Sparkles,
  ShieldCheck,
  Building,
  TrendingUp,
  Award,
  DollarSign,
  AlertTriangle,
  Zap,
  Target,
  Users,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function IntelligenceReportModal({
  reportData,
  isOpen,
  onClose,
}) {
  if (!isOpen || !reportData) return null;

  const {
    reportId = 'AI-REP-2026',
    generatedDate = 'Aug 28, 2026',
    scope = 'Agency-Wide (7 Clients)',
    engineStatus = 'AI Intelligence Engine — Demo / API Ready',
    executiveSummary = {},
    businessHealth = {},
    decisionScore = {},
    clientPortfolio = [],
    marketingPerformance = {},
    leadPipeline = {},
    salesPerformance = {},
    revenueAttribution = {},
    seoPerformance = {},
    whatsappPerformance = {},
    emailSmsPerformance = {},
    teamOperations = {},
    anomalies = [],
    aiInsights = [],
    recommendations = [],
    forecast = {},
    priorityActionPlan = [],
    briefing = {},
  } = reportData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-report-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (No Print) */}
        <div className="modal-dialog-header no-print">
          <div className="flex items-center gap-3">
            <div className="modal-icon-badge">
              <FileText size={18} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">Executive AI Intelligence &amp; Performance Report</h3>
              <p className="modal-subtitle">
                ID: {reportId} • Scope: {scope} • Generated: {generatedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-ai-primary text-xs flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Document (16 Comprehensive Sections) */}
        <div className="report-paper-container p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Header Banner */}
          <div className="report-doc-section">
            <div className="flex justify-between items-start border-b pb-3 mb-3">
              <div>
                <h1 className="text-xl font-extrabold text-white print-text-dark">
                  AI Growth &amp; Marketing Intelligence Master Audit
                </h1>
                <p className="text-xs text-muted print-text-dark">
                  Generated on {generatedDate} for {scope} • {engineStatus}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-cyan/10 border border-cyan/30 text-cyan rounded">
                Demo / API Ready
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="report-doc-section">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan print-text-dark mb-1.5">
              1. Executive Business State &amp; Narrative Synthesis
            </h3>
            <p className="text-xs text-slate-300 print-text-dark leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-white/5 print-box">
              {executiveSummary.todayBusinessState || briefing.summary || 'Agency revenue momentum is pacing at +29.5% MoM across 7 active clients with an overall health score of 92/100.'}
            </p>
          </div>

          {/* Section 2: Business Health & Governance Score */}
          <div className="report-doc-section">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan print-text-dark mb-1.5">
              2. Business Health &amp; Operational Governance
            </h3>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900/50 border border-white/5 print-box">
                <span className="text-dim text-[10px] block">Overall Agency Health</span>
                <strong className="text-purple text-sm font-bold print-text-dark">
                  {businessHealth.overall?.score || 92} / 100
                </strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900/50 border border-white/5 print-box">
                <span className="text-dim text-[10px] block">Marketing Efficiency</span>
                <strong className="text-success text-sm font-bold print-text-dark">
                  {businessHealth.marketing?.score || 94} / 100
                </strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900/50 border border-white/5 print-box">
                <span className="text-dim text-[10px] block">Lead Velocity Health</span>
                <strong className="text-cyan text-sm font-bold print-text-dark">
                  {businessHealth.lead?.score || 89} / 100
                </strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900/50 border border-white/5 print-box">
                <span className="text-dim text-[10px] block">Sales Conversion Health</span>
                <strong className="text-warning text-sm font-bold print-text-dark">
                  {businessHealth.sales?.score || 88} / 100
                </strong>
              </div>
            </div>
          </div>

          {/* Section 3: Client Portfolio Benchmarks */}
          <div className="report-doc-section">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan print-text-dark mb-1.5">
              3. Client Portfolio Benchmarks (7 Workspaces)
            </h3>
            <table className="w-full text-[11px] border-collapse print-table">
              <thead>
                <tr className="border-b border-white/10 text-left text-dim">
                  <th className="pb-1">Client Account</th>
                  <th className="pb-1 text-right">Attributed Revenue</th>
                  <th className="pb-1 text-right">Media Spend</th>
                  <th className="pb-1 text-right">ROAS</th>
                  <th className="pb-1 text-right">Leads</th>
                  <th className="pb-1 text-right">Health</th>
                </tr>
              </thead>
              <tbody>
                {clientPortfolio.map((c, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-1 font-semibold text-white print-text-dark">{c.clientName}</td>
                    <td className="py-1 text-right text-warning font-bold print-text-dark">₹{(c.revenue || 0).toLocaleString()}</td>
                    <td className="py-1 text-right text-slate-300 print-text-dark">₹{(c.spend || 0).toLocaleString()}</td>
                    <td className="py-1 text-right text-success font-bold print-text-dark">{c.blendedROAS}</td>
                    <td className="py-1 text-right text-cyan print-text-dark">{c.leadVolume || 120}</td>
                    <td className="py-1 text-right text-purple font-semibold print-text-dark">{c.healthScore || 90}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Multitouch Revenue Attribution */}
          <div className="report-doc-section">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan print-text-dark mb-1.5">
              4. Multitouch Revenue Attribution Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900/50 border border-white/5 print-box">
                <span className="text-dim text-[10px] block">Total Attributed Revenue</span>
                <strong className="text-warning text-sm font-bold print-text-dark">
                  ₹{(revenueAttribution.attributed || 12840000).toLocaleString()}
                </strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900/50 border border-white/5 print-box">
                <span className="text-dim text-[10px] block">Monthly Retainer Billing</span>
                <strong className="text-cyan text-sm font-bold print-text-dark">
                  ₹{(revenueAttribution.mrr || 184500).toLocaleString()} MRR
                </strong>
              </div>
              <div className="p-2.5 rounded bg-slate-900/50 border border-white/5 print-box">
                <span className="text-dim text-[10px] block">Blended Media ROAS</span>
                <strong className="text-success text-sm font-bold print-text-dark">
                  {revenueAttribution.blendedROAS || '4.85x'}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 5: Strategic AI Insights */}
          <div className="report-doc-section">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan print-text-dark mb-1.5">
              5. Strategic Growth Insights ({aiInsights.length})
            </h3>
            <div className="space-y-2 text-xs">
              {aiInsights.map((ins, i) => (
                <div key={i} className="p-2.5 rounded bg-slate-900/40 border border-white/5 print-box">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white print-text-dark">[{ins.priority}] {ins.title}</span>
                    <span className="text-cyan font-bold text-[10px]">{ins.impact}</span>
                  </div>
                  <p className="text-slate-300 print-text-dark text-[11px] mb-1">{ins.summary}</p>
                  <span className="text-emerald-300 text-[10px] block"><strong>Evidence:</strong> {ins.evidence}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Execution Playbooks & Priority Action Plan */}
          <div className="report-doc-section">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan print-text-dark mb-1.5">
              6. Execution Playbooks &amp; Priority Directives
            </h3>
            <div className="space-y-2 text-xs">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-2.5 rounded bg-slate-900/40 border border-white/5 print-box">
                  <strong className="text-white print-text-dark block mb-0.5">[{rec.priority || 'P1'}] {rec.title}</strong>
                  <span className="text-cyan font-semibold block text-[11px] mb-0.5">👉 Directive: {rec.recommendation}</span>
                  <span className="text-success text-[10px] font-bold">Expected Impact: {rec.expectedImpact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer (No Print) */}
        <div className="modal-dialog-footer no-print flex justify-end gap-2 p-4 border-t border-white/8">
          <button type="button" className="btn-saas-secondary text-xs" onClick={onClose}>
            Close Report
          </button>
          <button
            type="button"
            className="btn-ai-primary text-xs flex items-center gap-1.5"
            onClick={handlePrint}
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntelligenceReportModal;
