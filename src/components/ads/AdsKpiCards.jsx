import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Target,
  MousePointerClick,
  Zap,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export function AdsKpiCards({ metrics }) {
  const cards = [
    {
      id: 'spend',
      title: 'Total Ad Spend',
      value: formatCurrency(metrics.totalSpend || 0),
      subtitle: `${metrics.activeCount || 0} active campaigns pacing normally`,
      change: '+14.2% vs last period',
      isPositive: true,
      icon: DollarSign,
      color: '#6366f1',
    },
    {
      id: 'revenue',
      title: 'Attributed Revenue',
      value: formatCurrency(metrics.totalRevenue || 0),
      subtitle: 'Verified conversion value across funnels',
      change: '+24.5% MoM Growth',
      isPositive: true,
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      id: 'roas',
      title: 'Overall Portfolio ROAS',
      value: `${metrics.overallRoas || '0.00'}x`,
      subtitle: 'Target Benchmark: > 4.00x',
      change: '+0.85x Above Target',
      isPositive: true,
      icon: Zap,
      color: '#06b6d4',
    },
    {
      id: 'leads',
      title: 'Total Leads Generated',
      value: (metrics.totalLeads || 0).toLocaleString(),
      subtitle: 'High-intent form fills & signups',
      change: '+28.4% Lead Volume',
      isPositive: true,
      icon: Target,
      color: '#a855f7',
    },
    {
      id: 'cpl',
      title: 'Avg Cost Per Lead (CPL)',
      value: `$${metrics.averageCpl || '0.00'}`,
      subtitle: 'Across Meta, Google & LinkedIn',
      change: '-12.8% (Cost Reduction)',
      isPositive: true,
      icon: DollarSign,
      color: '#f59e0b',
    },
    {
      id: 'ctr',
      title: 'Avg CTR & CPC',
      value: `${metrics.averageCtr || '0.00'}%`,
      subtitle: `Avg CPC: $${metrics.averageCpc || '0.00'}`,
      change: '+0.64% Engagement',
      isPositive: true,
      icon: MousePointerClick,
      color: '#ec4899',
    },
  ];

  return (
    <div className="ads-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="ads-kpi-card">
            <div className="kpi-top-row">
              <span className="kpi-title-label">{card.title}</span>
              <div className="kpi-icon-pill" style={{ background: `${card.color}20`, color: card.color }}>
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

export default AdsKpiCards;
