import React from 'react';
import { Users2, CheckCircle2, Clock, Zap, TrendingUp } from 'lucide-react';

export function InfluencerKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'active',
      title: 'Active Creator Roster',
      value: `${metrics.total || 6} Creators`,
      subtitle: 'Instagram, TikTok & YouTube',
      change: 'Multi-tiered partnerships',
      icon: Users2,
      color: '#6366f1',
    },
    {
      id: 'review',
      title: 'Drafts in Review',
      value: `${metrics.reviewCount || 2} In Review`,
      subtitle: 'Awaiting agency approval',
      change: 'Quality QA Check',
      icon: Clock,
      color: '#f59e0b',
      isWarning: metrics.reviewCount > 0,
    },
    {
      id: 'published',
      title: 'Published & Live Deliverables',
      value: `${metrics.publishedCount || 2} Campaigns`,
      subtitle: 'Generating affiliate sales',
      change: '100% Tracking active',
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      id: 'sales',
      title: 'Attributed Creator Sales',
      value: metrics.totalSalesGenerated || '$54,200',
      subtitle: 'Tracked via custom promo codes',
      change: '+24.5% MoM Growth',
      icon: Zap,
      color: '#a855f7',
    },
    {
      id: 'roi',
      title: 'Creator Campaign ROI',
      value: metrics.avgRoi || '8.4x Yield',
      subtitle: 'Portfolio return multiplier',
      change: 'High-performing UGC',
      icon: TrendingUp,
      color: '#06b6d4',
    },
  ];

  return (
    <div className="influencer-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`influencer-kpi-card ${card.isWarning ? 'warning-card' : ''}`}
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

export default InfluencerKpiCards;
