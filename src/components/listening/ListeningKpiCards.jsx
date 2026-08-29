import React from 'react';
import { Radio, Smile, Heart, ShieldAlert, Globe } from 'lucide-react';

export function ListeningKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'mentions',
      title: 'Total Brand Mentions',
      value: metrics.totalMentions || '18,420 Mentions',
      subtitle: 'Reddit, X, TikTok & Reviews',
      change: '+34.2% vs Last Mo',
      icon: Radio,
      color: '#6366f1',
    },
    {
      id: 'sentiment',
      title: 'Positive Sentiment Rate',
      value: metrics.positiveSentiment || '84.2%',
      subtitle: 'Algorithmic NLP classification',
      change: 'High Brand Affinity',
      icon: Smile,
      color: '#10b981',
    },
    {
      id: 'nps',
      title: 'Brand Health & Net Promoter',
      value: metrics.npsScore || '+68 NPS',
      subtitle: 'Advocacy & satisfaction index',
      change: 'World-Class Tier',
      icon: Heart,
      color: '#ec4899',
    },
    {
      id: 'crisis',
      title: 'PR Crisis Risk Level',
      value: metrics.activeAlerts || '0 Critical / 2 Monitored',
      subtitle: 'Real-time velocity anomaly scanner',
      change: 'All Green / Nominal',
      icon: ShieldAlert,
      color: '#06b6d4',
    },
    {
      id: 'reach',
      title: 'Aggregate Media Reach',
      value: metrics.mediaReach || '4.2M Reach',
      subtitle: 'Total impressions across chatter',
      change: '+18.9% Viral Velocity',
      icon: Globe,
      color: '#a855f7',
    },
  ];

  return (
    <div className="listening-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="listening-kpi-card">
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

export default ListeningKpiCards;
