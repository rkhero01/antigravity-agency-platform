import React from 'react';
import { CalendarDays, CheckCircle2, AlertCircle, TrendingUp, Zap } from 'lucide-react';

export function PortalKpiCards({ stats = {} }) {
  const cards = [
    {
      id: 'deliverables',
      title: 'Scheduled Deliverables',
      value: `${stats.totalDeliverables || 12} Assets`,
      subtitle: 'Posts, Reels & Stories',
      change: 'September 2026 Batch',
      icon: CalendarDays,
      color: '#6366f1',
    },
    {
      id: 'pending',
      title: 'Pending Client Sign-Offs',
      value: `${stats.pendingApproval || 0} Posts`,
      subtitle: stats.pendingApproval > 0 ? 'Awaiting your approval' : 'All content approved',
      change: stats.pendingApproval > 0 ? 'Action Required' : '100% Signed Off',
      icon: AlertCircle,
      color: stats.pendingApproval > 0 ? '#f59e0b' : '#10b981',
      isWarning: stats.pendingApproval > 0,
    },
    {
      id: 'reach',
      title: 'Estimated Monthly Reach',
      value: stats.reach || '94.2K',
      subtitle: 'Organic & Paid impressions',
      change: stats.reachDelta || '+14.2% YoY',
      icon: TrendingUp,
      color: '#06b6d4',
    },
    {
      id: 'conversions',
      title: 'Attributed Return (ROAS)',
      value: `${stats.roas || '5.56x'} Yield`,
      subtitle: `${stats.leads || '184 Leads'} generated`,
      change: 'Active Campaigns',
      icon: Zap,
      color: '#10b981',
    },
  ];

  return (
    <div className="portal-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`portal-kpi-card ${card.isWarning ? 'warning-card' : ''}`}
          >
            <div className="kpi-top-row">
              <span className="kpi-title-label">{card.title}</span>
              <div
                className="kpi-icon-pill"
                style={{ background: `${card.color}20`, color: card.color }}
              >
                <IconComponent size={16} />
              </div>
            </div>

            <div className="kpi-value-block">
              <span className="kpi-main-number">{card.value}</span>
            </div>

            <div className="kpi-bottom-row">
              <span className={`kpi-change-tag ${card.isWarning ? 'urgent' : 'positive'}`}>
                {card.change}
              </span>
              <span className="kpi-subtext">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PortalKpiCards;
