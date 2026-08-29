import React from 'react';
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
} from 'lucide-react';

export function SocialHealthKpiCards({ metrics = {} }) {
  return (
    <div className="team-kpi-cards-grid">
      {/* 1. Total Connections */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-violet">
          <Share2 size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Connected Assets</span>
          <span className="team-kpi-val">{metrics.total || 0}</span>
          <span className="team-kpi-sub">Total social channels</span>
        </div>
      </div>

      {/* 2. Active & Healthy */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-emerald">
          <CheckCircle2 size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Active & Healthy</span>
          <span className="team-kpi-val text-emerald">{metrics.active || 0}</span>
          <span className="team-kpi-sub">Tokens valid (&gt;14 days)</span>
        </div>
      </div>

      {/* 3. Needs Re-auth */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-danger">
          <AlertTriangle size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Needs Re-auth</span>
          <span className="team-kpi-val text-danger">{metrics.needsReauth || 0}</span>
          <span className="team-kpi-sub">Tokens expired/revoked</span>
        </div>
      </div>

      {/* 4. Expiring Soon */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-gold">
          <Clock size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Expiring Soon</span>
          <span className="team-kpi-val text-gold">{metrics.expiringSoon || 0}</span>
          <span className="team-kpi-sub">Expires in &le;14 days</span>
        </div>
      </div>

      {/* 5. Client Coverage */}
      <div className="team-kpi-card">
        <div className="team-kpi-icon-pill bg-cyan">
          <Building size={18} />
        </div>
        <div className="team-kpi-body">
          <span className="team-kpi-label">Client Coverage</span>
          <span className="team-kpi-val text-cyan">{metrics.clientCount || 0}</span>
          <span className="team-kpi-sub">Client workspaces active</span>
        </div>
      </div>
    </div>
  );
}

export default SocialHealthKpiCards;
