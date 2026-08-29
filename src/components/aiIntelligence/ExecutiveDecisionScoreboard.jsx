import React from 'react';
import {
  Award,
  TrendingUp,
  ShieldCheck,
  Activity,
  DollarSign,
  UserCheck,
  Zap,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export function ExecutiveDecisionScoreboard({
  decisionData = {},
  loading = false,
}) {
  const {
    agencyDecisionScore = 92,
    statusLabel = 'Excellent',
    dimensions = [
      { id: 'dim-1', key: 'businessHealth', label: 'Overall Business Health', score: 92, prevScore: 88, change: '+4 pts', trend: 'up', status: 'Excellent', explanation: 'Agency portfolio expanding 18.4% above Q3 baseline targets.' },
      { id: 'dim-2', key: 'revenueMomentum', label: 'Revenue Momentum', score: 94, prevScore: 86, change: '+8 pts', trend: 'up', status: 'Excellent', explanation: 'Attributed gross revenue up 29.5% MoM across Meta & WhatsApp.' },
      { id: 'dim-3', key: 'leadVelocity', label: 'Lead Velocity', score: 89, prevScore: 86, change: '+3 pts', trend: 'up', status: 'Healthy', explanation: '4,820 pipeline leads with 45s first touch SLA on Click-to-WhatsApp.' },
      { id: 'dim-4', key: 'salesConversion', label: 'Sales Conversion', score: 88, prevScore: 83, change: '+5 pts', trend: 'up', status: 'Healthy', explanation: 'Lead-to-won close rate improved to 28.4% across client portfolios.' },
      { id: 'dim-5', key: 'marketingEfficiency', label: 'Marketing Efficiency', score: 91, prevScore: 87, change: '+4 pts', trend: 'up', status: 'Excellent', explanation: 'Blended agency ROAS is 4.85x with strong multi-channel return.' },
      { id: 'dim-6', key: 'customerEngagement', label: 'Customer Engagement', score: 95, prevScore: 88, change: '+7 pts', trend: 'up', status: 'Excellent', explanation: 'WhatsApp read rate 88.9% and reply rate 75.6% show elite audience affinity.' },
      { id: 'dim-7', key: 'operationalEfficiency', label: 'Operational Efficiency', score: 87, prevScore: 85, change: '+2 pts', trend: 'up', status: 'Healthy', explanation: 'Team operator workloads auto-balanced with sub-minute SLA compliance.' },
      { id: 'dim-8', key: 'riskExposure', label: 'Risk Exposure Defense', score: 82, prevScore: 78, change: '+4 pts', trend: 'up', status: 'Healthy', explanation: '₹480,000 in delayed proposal deals mitigated by consultative decks.' },
    ],
  } = decisionData;

  const getScoreClassification = (score) => {
    if (score >= 90) return { label: 'Excellent', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' };
    if (score >= 75) return { label: 'Healthy', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
    if (score >= 60) return { label: 'Watch', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.3)' };
    if (score >= 40) return { label: 'At Risk', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' };
    return { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
  };

  const decisionClass = getScoreClassification(agencyDecisionScore);

  if (loading) {
    return <div className="decision-scoreboard-card skeleton-card h-80" />;
  }

  return (
    <div className="decision-scoreboard-card">
      {/* Header with Hero Score Badge */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="decision-icon-badge">
            <Award size={18} className="text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Executive Decision Scoreboard
              </h3>
              <span className="text-[10px] text-cyan font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Synthesis Engine
              </span>
            </div>
            <p className="text-xs text-muted">
              Holistic agency governance index synthesizing operational momentum, revenue stability, and risk exposure
            </p>
          </div>
        </div>

        {/* Hero Agency Decision Score Pill */}
        <div
          className="hero-decision-score-pill"
          style={{
            background: decisionClass.bg,
            borderColor: decisionClass.border,
          }}
        >
          <Sparkles size={16} style={{ color: decisionClass.color }} />
          <div>
            <span className="text-[10px] text-dim uppercase font-bold block">Agency Decision Score</span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl font-extrabold" style={{ color: decisionClass.color }}>
                {agencyDecisionScore}
              </strong>
              <span className="text-xs font-bold text-slate-300">/ 100 ({decisionClass.label})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Dimension Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {dimensions.map((dim) => {
          const dimClass = getScoreClassification(dim.score);

          return (
            <div key={dim.id || dim.key} className="decision-dimension-card">
              <div className="flex justify-between items-start mb-2">
                <span className="dimension-label">{dim.label}</span>
                <span
                  className="dimension-status-badge"
                  style={{ color: dimClass.color, background: dimClass.bg, borderColor: dimClass.border }}
                >
                  {dim.status || dimClass.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-1.5">
                <strong className="text-xl font-extrabold text-white">{dim.score}</strong>
                <span className="text-xs font-bold text-success flex items-center gap-0.5">
                  <ArrowUpRight size={11} /> {dim.change}
                </span>
                <span className="text-[10px] text-dim">(Prev: {dim.prevScore})</span>
              </div>

              {/* Score Bar */}
              <div className="dimension-bar-track">
                <div
                  className="dimension-bar-fill"
                  style={{ width: `${dim.score}%`, backgroundColor: dimClass.color }}
                />
              </div>

              <p className="dimension-explanation text-[11px] text-slate-300 mt-2 leading-tight">
                {dim.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExecutiveDecisionScoreboard;
