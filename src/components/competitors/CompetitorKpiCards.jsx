import React from 'react';
import { Target, TrendingUp, Radio, Sparkles, PieChart } from 'lucide-react';

export function CompetitorKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'tracked',
      title: 'Competitors Monitored',
      value: `${metrics.total || 5} Rivals`,
      subtitle: 'Instagram, TikTok & LinkedIn',
      change: 'Continuous Scraping',
      icon: Target,
      color: '#6366f1',
    },
    {
      id: 'sov',
      title: 'Client Share of Voice',
      value: metrics.shareOfVoice || '34.2% Lead',
      subtitle: 'Total category social impressions',
      change: '+4.8% vs last month',
      icon: PieChart,
      color: '#10b981',
    },
    {
      id: 'advantage',
      title: 'Engagement Advantage',
      value: metrics.engagementAdvantage || '+2.4% Delta',
      subtitle: 'vs Competitor average ER',
      change: 'Client Leads Category',
      icon: TrendingUp,
      color: '#06b6d4',
    },
    {
      id: 'viral',
      title: 'Viral Breakouts Tracked',
      value: metrics.viralBreakouts || '12 Breakouts',
      subtitle: 'High-performing competitor formats',
      change: 'Actionable Insights',
      icon: Radio,
      color: '#a855f7',
    },
    {
      id: 'gaps',
      title: 'AI Gap Opportunities',
      value: metrics.gapOpportunities || '4 Actionable Briefs',
      subtitle: 'Vulnerabilities detected by AI',
      change: 'Ready for Counter-Campaign',
      icon: Sparkles,
      color: '#ec4899',
    },
  ];

  return (
    <div className="competitor-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="competitor-kpi-card">
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

export default CompetitorKpiCards;
