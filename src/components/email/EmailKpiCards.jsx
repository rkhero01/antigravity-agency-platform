import React from 'react';
import { Mail, Eye, MousePointerClick, DollarSign, UserCheck } from 'lucide-react';

export function EmailKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'subs',
      title: 'Total Active Subscribers',
      value: metrics.subscribers || '142,500 Contacts',
      subtitle: 'Email list & SMS phone opted-in',
      change: '+14.2% List Growth',
      icon: UserCheck,
      color: '#6366f1',
    },
    {
      id: 'open',
      title: 'Average Email Open Rate',
      value: metrics.avgOpenRate || '42.8%',
      subtitle: 'Inbox delivery & subject line power',
      change: '2.1x Industry Avg',
      icon: Eye,
      color: '#06b6d4',
    },
    {
      id: 'ctr',
      title: 'Click-Through Rate (CTR)',
      value: metrics.avgCtr || '6.4%',
      subtitle: 'High-intent click engagement',
      change: 'Strong Conversion',
      icon: MousePointerClick,
      color: '#a855f7',
    },
    {
      id: 'rev',
      title: 'Attributed CRM Revenue',
      value: metrics.attributedRevenue || '$348,200',
      subtitle: 'Directly attributed e-commerce sales',
      change: '+28.4% MoM Revenue',
      icon: DollarSign,
      color: '#10b981',
    },
    {
      id: 'unsub',
      title: 'Average Unsubscribe Rate',
      value: metrics.unsubscribeRate || '0.12%',
      subtitle: 'List retention & low spam rate',
      change: 'Optimal List Health',
      icon: Mail,
      color: '#ec4899',
    },
  ];

  return (
    <div className="email-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="email-kpi-card">
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

export default EmailKpiCards;
