import React from 'react';
import {
  UserCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

export function LeadVelocityPanel({
  leadVelocityData = {},
  loading = false,
}) {
  const stages = leadVelocityData.pipelineStages || [
    { id: 'stage-1', stage: 'New Leads', count: 1120, prevCount: 840, growth: '+33.3%', avgTime: '45s (WhatsApp)', nextConversion: '83.9%', health: 'Optimal', color: '#3b82f6' },
    { id: 'stage-2', stage: 'Contacted', count: 940, prevCount: 780, growth: '+20.5%', avgTime: '1.2 days', nextConversion: '72.4%', health: 'Optimal', color: '#06b6d4' },
    { id: 'stage-3', stage: 'Qualified', count: 1240, prevCount: 960, growth: '+29.2%', avgTime: '2.8 days', nextConversion: '62.9%', health: 'Strong', color: '#10b981' },
    { id: 'stage-4', stage: 'Proposal / Offer', count: 780, prevCount: 650, growth: '+20.0%', avgTime: '4.5 days', nextConversion: '53.8%', health: 'Watch', isBottleneck: true, color: '#f59e0b' },
    { id: 'stage-5', stage: 'Negotiation', count: 420, prevCount: 360, growth: '+16.7%', avgTime: '3.2 days', nextConversion: '76.2%', health: 'Strong', color: '#8b5cf6' },
    { id: 'stage-6', stage: 'Won Deals', count: 320, prevCount: 240, growth: '+33.3%', avgTime: '18.4 days total', nextConversion: '100%', health: 'Optimal', color: '#22c55e' },
    { id: 'stage-7', stage: 'Lost / Closed', count: 180, prevCount: 160, growth: '+12.5%', avgTime: 'N/A', nextConversion: '0%', health: 'Normal', color: '#ef4444' },
  ];

  const highlights = leadVelocityData.highlights || {
    biggestBottleneck: 'Proposal / Offer Stage (Avg 4.5 days due to enterprise technical & security review)',
    fastestMovingStage: 'New Lead to Contacted (45s first touch SLA on Click-to-WhatsApp)',
    largestDropOff: 'Proposal to Negotiation (26.2% drop on unassisted price objections)',
    revenueAtRisk: '₹480,000 (14 deals paused in Proposal stage > 10 days)',
  };

  return (
    <div className="lead-velocity-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="lead-velocity-icon-badge">
            <UserCheck size={17} className="text-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Lead Velocity &amp; Stage Transition Intelligence
            </h3>
            <p className="text-xs text-muted">
              Real-time pipeline dwell times, stage conversion efficiency, bottleneck diagnostics, and revenue at risk
            </p>
          </div>
        </div>

        <span className="text-xs text-success font-bold bg-success/10 px-2.5 py-1 rounded border border-success/20">
          Avg Lead Velocity: 18.5 days to close
        </span>
      </div>

      {/* 4 Critical Strategic Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        {/* 1. Biggest Bottleneck */}
        <div className="velocity-highlight-box bottleneck">
          <div className="flex items-center gap-1.5 text-warning mb-1">
            <AlertTriangle size={13} />
            <span className="text-[11px] font-bold uppercase">Biggest Bottleneck</span>
          </div>
          <p className="text-xs text-slate-200 leading-snug">{highlights.biggestBottleneck}</p>
        </div>

        {/* 2. Fastest Moving */}
        <div className="velocity-highlight-box fastest">
          <div className="flex items-center gap-1.5 text-success mb-1">
            <Zap size={13} />
            <span className="text-[11px] font-bold uppercase">Fastest Velocity</span>
          </div>
          <p className="text-xs text-slate-200 leading-snug">{highlights.fastestMovingStage}</p>
        </div>

        {/* 3. Largest Drop-off */}
        <div className="velocity-highlight-box dropoff">
          <div className="flex items-center gap-1.5 text-pink mb-1">
            <TrendingUp size={13} className="rotate-180" />
            <span className="text-[11px] font-bold uppercase">Largest Drop-Off</span>
          </div>
          <p className="text-xs text-slate-200 leading-snug">{highlights.largestDropOff}</p>
        </div>

        {/* 4. Revenue at Risk */}
        <div className="velocity-highlight-box risk">
          <div className="flex items-center gap-1.5 text-danger mb-1">
            <ShieldAlert size={13} />
            <span className="text-[11px] font-bold uppercase">Revenue At Risk</span>
          </div>
          <p className="text-xs text-slate-200 leading-snug">{highlights.revenueAtRisk}</p>
        </div>
      </div>

      {/* Pipeline Stage Flow Visual */}
      <div className="pipeline-flow-track-wrap">
        <div className="pipeline-flow-track">
          {stages.map((stg, idx) => (
            <div key={stg.id} className={`pipeline-stage-node ${stg.isBottleneck ? 'is-bottleneck' : ''}`}>
              <div className="stage-node-header">
                <span className="stage-num-badge">{idx + 1}</span>
                <strong className="stage-title truncate">{stg.stage}</strong>
              </div>

              <div className="stage-count-row">
                <span className="stage-count-val">{stg.count.toLocaleString()}</span>
                <span className="stage-growth-val positive">{stg.growth}</span>
              </div>

              <div className="stage-dwell-row">
                <span className="text-[10px] text-dim flex items-center gap-1">
                  <Clock size={10} /> Dwell:
                </span>
                <span className="text-[11px] text-white font-semibold">{stg.avgTime}</span>
              </div>

              <div className="stage-conversion-footer">
                <span className="text-[10px] text-dim">Pass Rate:</span>
                <span className="text-[11px] text-cyan font-bold">{stg.nextConversion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeadVelocityPanel;
