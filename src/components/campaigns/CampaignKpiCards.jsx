import React from 'react';
import {
  Rocket,
  Activity,
  DollarSign,
  TrendingUp,
  Target,
} from 'lucide-react';

export function CampaignKpiCards({ kpis = {} }) {
  return (
    <div className="team-kpi-cards-grid">
      {/* 1. Total Campaigns */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-violet">
          <Rocket size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Total Campaigns</span>
          <span className="team-kpi-val">{kpis.total || 0}</span>
          <span className="team-kpi-sub">Managed in workspace</span>
        </div>
      </div>

      {/* 2. Active Blitzes */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-emerald">
          <Activity size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Active Campaigns</span>
          <span className="team-kpi-val text-emerald">{kpis.active || 0}</span>
          <span className="team-kpi-sub">Currently delivering</span>
        </div>
      </div>

      {/* 3. Total Daily Budget */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-gold">
          <DollarSign size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Allocated Daily Budget</span>
          <span className="team-kpi-val text-gold">
            ${(kpis.totalDailyBudget || 0).toLocaleString()}
          </span>
          <span className="team-kpi-sub">Daily run-rate</span>
        </div>
      </div>

      {/* 4. Total Conversions */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-cyan">
          <Target size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Total Conversions</span>
          <span className="team-kpi-val text-cyan">
            {(kpis.totalConversions || 0).toLocaleString()}
          </span>
          <span className="team-kpi-sub">Acquired leads & sales</span>
        </div>
      </div>

      {/* 5. Overall ROAS */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-indigo">
          <TrendingUp size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Overall ROAS</span>
          <span className="team-kpi-val text-indigo">
            {kpis.roas ? `${kpis.roas}x` : 'N/A'}
          </span>
          <span className="team-kpi-sub">Return on ad spend</span>
        </div>
      </div>
    </div>
  );
}

export default CampaignKpiCards;
