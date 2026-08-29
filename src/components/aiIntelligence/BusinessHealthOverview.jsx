import React from 'react';
import {
  Activity,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

export function BusinessHealthOverview({
  businessHealth = {},
  loading = false,
}) {
  const overall = businessHealth.overall || {
    score: 92,
    label: 'Excellent',
    trend: 'up',
    change: '+4 pts',
    explanation: 'Agency performance across all 7 clients is pacing 18.4% ahead of Q3 targets.',
  };

  const domains = [
    { key: 'marketing', label: 'Marketing Health', data: businessHealth.marketing || { score: 94, label: 'High Velocity', change: '+6 pts', explanation: 'Meta Click-to-WhatsApp and Google Search driving high qualified volume.' } },
    { key: 'lead', label: 'Lead & Pipeline', data: businessHealth.lead || { score: 89, label: 'Strong Pipeline', change: '+3 pts', explanation: 'Over 4,820 active leads captured with 50% in VIP or Hot qualification tiers.' } },
    { key: 'sales', label: 'Sales & Win Rate', data: businessHealth.sales || { score: 88, label: 'Solid Conversion', change: '+5 pts', explanation: 'Lead-to-won win rate improved to 28.4% across B2C and enterprise portfolios.' } },
    { key: 'customerEngagement', label: 'Customer Engagement', data: businessHealth.customerEngagement || { score: 95, label: 'Optimal', change: '+7 pts', explanation: 'WhatsApp read rate of 88.9% and reply rate of 75.6% indicate elite audience affinity.' } },
    { key: 'campaign', label: 'Campaign & ROAS', data: businessHealth.campaign || { score: 91, label: 'High ROAS', change: '+4 pts', explanation: 'Blended agency ROAS is 4.85x with zero underperforming campaigns.' } },
    { key: 'revenue', label: 'Revenue Expansion', data: businessHealth.revenue || { score: 93, label: 'Robust Growth', change: '+8 pts', explanation: '₹12,840,000 attributed sales revenue generated with 29.5% MoM expansion.' } },
    { key: 'operations', label: 'Operations & SLAs', data: businessHealth.operations || { score: 87, label: 'SLA Compliant', change: '+2 pts', explanation: 'First response time average is 45 seconds, with evening shift auto-balancing active.' } },
  ];

  if (loading) {
    return (
      <div className="business-health-card skeleton-card h-64">
        <div className="skeleton-line w-40 h-5 mb-4" />
        <div className="skeleton-line w-full h-32" />
      </div>
    );
  }

  // Calculate SVG Circle Stroke for Overall Score
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall.score / 100) * circumference;

  return (
    <div className="business-health-card">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="business-health-icon-badge">
            <Activity size={17} className="text-success" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multidimensional Business Health Matrix
            </h3>
            <p className="text-xs text-muted">
              Holistic AI diagnostic evaluating cross-channel marketing velocity, conversion efficiency, and financial health
            </p>
          </div>
        </div>

        <span className="text-xs text-success font-bold bg-success/10 px-2.5 py-1 rounded border border-success/20 flex items-center gap-1">
          <ShieldCheck size={13} />
          <span>Status: {overall.label}</span>
        </span>
      </div>

      <div className="business-health-layout-grid">
        {/* Left: Overall Ring Gauge */}
        <div className="overall-score-hero-box">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated fill circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#22c55e"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <strong className="text-2xl font-extrabold text-white leading-none">
                {overall.score}
              </strong>
              <span className="text-[10px] text-dim uppercase font-bold mt-0.5">/ 100</span>
            </div>
          </div>

          <div className="text-center mt-2">
            <div className="flex items-center justify-center gap-1 text-xs text-success font-bold">
              <ArrowUpRight size={12} />
              <span>{overall.change} this month</span>
            </div>
            <p className="text-[11px] text-muted max-w-[180px] mt-1 leading-snug">
              {overall.explanation}
            </p>
          </div>
        </div>

        {/* Right: 7-Domain Health Breakdown */}
        <div className="domain-health-grid">
          {domains.map((dom) => (
            <div key={dom.key} className="domain-health-item">
              <div className="flex justify-between items-center mb-1">
                <span className="domain-lbl">{dom.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="domain-score-pill">{dom.data.score}%</span>
                  <span className="text-[10px] text-success font-semibold">{dom.data.change}</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="domain-progress-track">
                <div
                  className="domain-progress-fill"
                  style={{
                    width: `${dom.data.score}%`,
                    backgroundColor:
                      dom.data.score >= 90 ? '#22c55e' : dom.data.score >= 80 ? '#3b82f6' : '#f59e0b',
                  }}
                />
              </div>

              <p className="domain-desc-text">{dom.data.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BusinessHealthOverview;
