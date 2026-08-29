import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Share2,
  Target,
  DollarSign,
  Zap,
} from 'lucide-react';

const ICON_MAP = {
  Users,
  Share2,
  Target,
  DollarSign,
  TrendingUp,
  Zap,
};

export function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  sublabel,
  icon = 'TrendingUp',
  badge,
}) {
  const IconComponent = ICON_MAP[icon] || TrendingUp;

  return (
    <div className="kpi-metric-card">
      <div className="kpi-top-row">
        <div className="kpi-title-block">
          <span className="kpi-title-text">{title}</span>
          {badge && <span className="kpi-badge-chip">{badge}</span>}
        </div>
        <div className="kpi-icon-pill">
          <IconComponent size={18} className="kpi-icon" />
        </div>
      </div>

      <div className="kpi-main-number-wrapper">
        <span className="kpi-main-value">{value}</span>
      </div>

      <div className="kpi-footer-row">
        <div className={`kpi-trend-pill ${isPositive ? 'trend-positive' : 'trend-neutral'}`}>
          {isPositive ? (
            <TrendingUp size={13} className="trend-arrow" />
          ) : (
            <TrendingDown size={13} className="trend-arrow" />
          )}
          <span className="trend-pct">{change}</span>
        </div>
        {sublabel && <span className="kpi-sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}

export default KpiCard;
