import React from 'react';
import { Share2, CheckCircle2, AlertTriangle, Clock, Zap } from 'lucide-react';

export function SocialHealthKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'total',
      title: 'Connected Channels',
      value: `${metrics.total || 9} Accounts`,
      subtitle: 'Across 6 Client Workspaces',
      change: 'Omnichannel connected',
      icon: Share2,
      color: '#6366f1',
    },
    {
      id: 'healthy',
      title: 'Healthy & Synced',
      value: `${metrics.connectedCount || 8} Active`,
      subtitle: 'OAuth tokens valid & verified',
      change: '98.5% SLA Operational',
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      id: 'reauth',
      title: 'Needs Re-Authentication',
      value: `${metrics.reauthNeededCount || 1} Expired`,
      subtitle: 'Immediate action required',
      change: metrics.reauthNeededCount > 0 ? 'Publishing paused' : 'Zero issues',
      icon: AlertTriangle,
      color: '#ef4444',
      isWarning: metrics.reauthNeededCount > 0,
    },
    {
      id: 'expiring',
      title: 'Expiring Soon (<= 14d)',
      value: `${metrics.expiringSoonCount || 1} Token`,
      subtitle: 'Renewal prompt queued',
      change: '14-day safety window',
      icon: Clock,
      color: '#f59e0b',
    },
    {
      id: 'publishing',
      title: 'Publishing Pipelines',
      value: `${metrics.publishingActiveCount || 8} Active`,
      subtitle: 'Auto-publish reels & posts',
      change: '100% On schedule',
      icon: Zap,
      color: '#06b6d4',
    },
  ];

  return (
    <div className="social-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`social-kpi-card ${card.isWarning ? 'warning-card' : ''}`}
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

export default SocialHealthKpiCards;
