import React from 'react';
import { Rocket, DollarSign, TrendingUp, Target, CheckCircle2 } from 'lucide-react';

export function CampaignKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'active',
      title: 'Active Brand Campaigns',
      value: metrics.activeCount || '4 Campaigns',
      subtitle: 'Multi-phase strategic launches',
      change: '100% On Schedule',
      icon: Rocket,
      color: '#6366f1',
    },
    {
      id: 'budget',
      title: 'Total Allocated Budget',
      value: metrics.totalBudget || '$145,000',
      subtitle: 'Across Meta, TikTok & Creators',
      change: 'Strict Guardrails Active',
      icon: DollarSign,
      color: '#06b6d4',
    },
    {
      id: 'revenue',
      title: 'Projected Pipeline Revenue',
      value: metrics.targetRevenue || '$890,000',
      subtitle: 'E-commerce & Membership ARR',
      change: '+22.4% Target Growth',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      id: 'roas',
      title: 'Target Campaign ROAS',
      value: metrics.projectedRoas || '5.8x ROAS',
      subtitle: 'Projected return on ad spend',
      change: 'High-Efficiency Target',
      icon: Target,
      color: '#ec4899',
    },
    {
      id: 'pacing',
      title: 'Deliverables On Track',
      value: metrics.deliverablesPacing || '94.2%',
      subtitle: 'Creative assets approved on time',
      change: 'Zero Blocked Milestones',
      icon: CheckCircle2,
      color: '#a855f7',
    },
  ];

  return (
    <div className="campaign-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="campaign-kpi-card">
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
              <span className="kpi-change-tag positive">{card.change}</span>
              <span className="kpi-subtext">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CampaignKpiCards;
