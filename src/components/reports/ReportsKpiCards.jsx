import React from 'react';
import { FileText, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

export function ReportsKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Client Reports',
      value: `${metrics.total || 6} Documents`,
      subtitle: 'Across 6 Client Workspaces',
      change: '100% On schedule',
      icon: FileText,
      color: '#6366f1',
    },
    {
      id: 'exec',
      title: 'Executive Summaries',
      value: `${metrics.executiveSummariesCount || 2} Ready`,
      subtitle: 'C-suite presentation PDFs',
      change: 'August 2026 Deliverables',
      icon: Sparkles,
      color: '#ec4899',
    },
    {
      id: 'paid',
      title: 'Paid Media Audits',
      value: `${metrics.paidAuditsCount || 1} Audits`,
      subtitle: 'ROAS & CPL attribution',
      change: 'Meta & Google Ads data',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      id: 'forecast',
      title: 'Strategic AI Roadmaps',
      value: '2 Forecasts',
      subtitle: 'Q3 & Q4 Growth pipelines',
      change: 'AI Trend Projections',
      icon: BarChart3,
      color: '#06b6d4',
    },
  ];

  return (
    <div className="reports-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="reports-kpi-card">
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

export default ReportsKpiCards;
