import React from 'react';
import { Users, Shield, Award, BarChart3, Video, Building } from 'lucide-react';

export function TeamKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Active Staff',
      value: `${metrics.total || 6} Members`,
      subtitle: '100% Verified accounts',
      change: 'Full agency strength',
      icon: Users,
      color: '#6366f1',
    },
    {
      id: 'admins',
      title: 'Admins & Partners',
      value: `${metrics.adminCount || 1} Superuser`,
      subtitle: 'System & billing governance',
      change: 'Full OS access',
      icon: Shield,
      color: '#ec4899',
    },
    {
      id: 'managers',
      title: 'Creative Managers',
      value: `${metrics.managerCount || 1} Director`,
      subtitle: 'Campaign review & approvals',
      change: 'Approval authority',
      icon: Award,
      color: '#f59e0b',
    },
    {
      id: 'analysts',
      title: 'Performance Analysts',
      value: `${metrics.analystCount || 2} Analysts`,
      subtitle: 'Paid media & attribution',
      change: 'Budget scaling',
      icon: BarChart3,
      color: '#06b6d4',
    },
    {
      id: 'creators',
      title: 'Content Creators',
      value: `${metrics.creatorCount || 2} Creators`,
      subtitle: 'Reels, copy & carousels',
      change: 'Drafting & AI Studio',
      icon: Video,
      color: '#10b981',
    },
    {
      id: 'coverage',
      title: 'Workspaces Covered',
      value: '6/6 Accounts',
      subtitle: 'Zero unassigned clients',
      change: '100% SLA Coverage',
      icon: Building,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="team-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="team-kpi-card">
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

export default TeamKpiCards;
