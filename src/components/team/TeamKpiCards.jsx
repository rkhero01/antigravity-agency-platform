import React from 'react';
import {
  Users,
  Shield,
  Briefcase,
  Activity,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function TeamKpiCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="team-kpi-cards-grid">
      {/* 1. Total Team Size */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-violet">
          <Users size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Active Agency Seats</span>
          <span className="team-kpi-val">{metrics.total}</span>
          <span className="team-kpi-sub">Total provisioned seats</span>
        </div>
      </div>

      {/* 2. Active Operators */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-emerald">
          <CheckCircle2 size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Active Status</span>
          <span className="team-kpi-val text-emerald">{metrics.activeCount}</span>
          <span className="team-kpi-sub">Online & operational</span>
        </div>
      </div>

      {/* 3. Agency Governance (Owners & Admins) */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-danger">
          <Shield size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Owners & Admins</span>
          <span className="team-kpi-val text-gold">
            {(metrics.ownerCount || 0) + (metrics.adminCount || 0)}
          </span>
          <span className="team-kpi-sub">Full system governance</span>
        </div>
      </div>

      {/* 4. Creative Managers */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-gold">
          <Briefcase size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Campaign Managers</span>
          <span className="team-kpi-val text-white">{metrics.managerCount || 0}</span>
          <span className="team-kpi-sub">Client & deliverable leads</span>
        </div>
      </div>

      {/* 5. Operators */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-cyan">
          <Activity size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Marketing Operators</span>
          <span className="team-kpi-val text-cyan">{metrics.operatorCount || 0}</span>
          <span className="team-kpi-sub">Funnels & automation</span>
        </div>
      </div>

      {/* 6. Analysts & Viewers */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-info">
          <Lock size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Analysts & Viewers</span>
          <span className="team-kpi-val text-muted">
            {(metrics.analystCount || 0) + (metrics.viewerCount || 0)}
          </span>
          <span className="team-kpi-sub">Audit & read-only access</span>
        </div>
      </div>
    </div>
  );
}

export default TeamKpiCards;
