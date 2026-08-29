import React from 'react';
import { MessageSquare, AlertTriangle, Zap, CheckCircle2, Clock } from 'lucide-react';

export function InboxKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'active',
      title: 'Inbound Conversations',
      value: `${metrics.total || 5} Threads`,
      subtitle: 'Across 6 Client Brands',
      change: 'Real-time sync active',
      icon: MessageSquare,
      color: '#6366f1',
    },
    {
      id: 'urgent',
      title: 'Action Required / Urgent',
      value: `${metrics.urgentCount || 2} Inquiries`,
      subtitle: 'Response queued',
      change: metrics.urgentCount > 0 ? 'Needs Attention' : 'Zero Backlog',
      icon: AlertTriangle,
      color: '#ef4444',
      isWarning: metrics.urgentCount > 0,
    },
    {
      id: 'leads',
      title: 'High-Intent Leads',
      value: `${metrics.leadsCount || 1} Opportunities`,
      subtitle: 'Wholesale & VIP inquiries',
      change: 'Priority Routing',
      icon: Zap,
      color: '#a855f7',
    },
    {
      id: 'resolved',
      title: 'Resolved Inquiries',
      value: `${metrics.resolvedCount || 2} Closed`,
      subtitle: 'Client inquiries resolved',
      change: '98% Customer CSAT',
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      id: 'speed',
      title: 'Avg Response Speed',
      value: metrics.avgResponseTime || '4.2 Mins',
      subtitle: 'AI Smart Reply Assisted',
      change: '4x faster than SLA',
      icon: Clock,
      color: '#06b6d4',
    },
  ];

  return (
    <div className="inbox-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`inbox-kpi-card ${card.isWarning ? 'warning-card' : ''}`}
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

export default InboxKpiCards;
