import React from 'react';
import {
  Globe,
  TrendingUp,
  Award,
  BarChart3,
  Compass,
  ShieldCheck,
  Target,
  DollarSign,
} from 'lucide-react';

export function SEOKpiCards({ overview = {} }) {
  const cards = [
    {
      id: 'traffic',
      title: 'Organic Search Traffic',
      value: overview.organicTraffic || '184,200',
      subtitle: 'Monthly search visitors',
      change: overview.trafficMoM || '+18.4% MoM',
      icon: Globe,
      color: '#3b82f6',
    },
    {
      id: 'keywords',
      title: 'Total Ranking Keywords',
      value: overview.organicKeywords || '4,850',
      subtitle: 'Indexed in Google Top 100',
      change: overview.keywordsMoM || '+320 Keywords',
      icon: TrendingUp,
      color: '#6366f1',
    },
    {
      id: 'top3',
      title: 'Keywords in Top 3',
      value: overview.top3Keywords || '482',
      subtitle: 'High CTR commercial positions',
      change: overview.top3MoM || '+42 Top 3',
      icon: Award,
      color: '#10b981',
    },
    {
      id: 'top10',
      title: 'Keywords in Top 10',
      value: overview.top10Keywords || '1,290',
      subtitle: 'First page search results',
      change: overview.top10MoM || '+118 Top 10',
      icon: BarChart3,
      color: '#06b6d4',
    },
    {
      id: 'avgPos',
      title: 'Average SERP Position',
      value: overview.avgPosition || '14.2',
      subtitle: 'Weighted ranking average',
      change: overview.avgPositionMoM || '+2.8 positions',
      icon: Compass,
      color: '#a855f7',
    },
    {
      id: 'health',
      title: 'SEO Health & Domain Auth',
      value: overview.healthScore || '92 / 100',
      subtitle: 'Technical crawl score & DA 64',
      change: 'World-Class Tier',
      icon: ShieldCheck,
      color: '#ec4899',
    },
    {
      id: 'conversions',
      title: 'Organic Conversions',
      value: overview.organicConversions || '3,840',
      subtitle: 'Form fills & trial signups',
      change: overview.conversionsMoM || '+22.6% MoM',
      icon: Target,
      color: '#f59e0b',
    },
    {
      id: 'revenue',
      title: 'Estimated Organic Revenue',
      value: overview.organicRevenue || '$294,500',
      subtitle: 'Direct organic search sales',
      change: overview.revenueMoM || '+19.8% MoM',
      icon: DollarSign,
      color: '#10b981',
    },
  ];

  return (
    <div className="seo-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="seo-kpi-card">
            <div className="kpi-top-row">
              <span className="kpi-title-label">{card.title}</span>
              <div
                className="kpi-icon-pill"
                style={{ background: `${card.color}20`, color: card.color }}
              >
                <IconComponent size={15} />
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

export default SEOKpiCards;
