import React from 'react';
import { DollarSign, FileCheck, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

export function ContractKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'mrr',
      title: 'Monthly Recurring Revenue',
      value: metrics.mrr || '$46,500 MRR',
      subtitle: 'Committed agency monthly billing',
      change: '+18.5% QoQ Growth',
      icon: DollarSign,
      color: '#10b981',
    },
    {
      id: 'active',
      title: 'Active Retainer Clients',
      value: metrics.activeRetainers || '3 Active Retainers',
      subtitle: 'Multi-month agency partnerships',
      change: '100% Retained',
      icon: FileCheck,
      color: '#6366f1',
    },
    {
      id: 'acv',
      title: 'Average Contract Value (ACV)',
      value: metrics.avgContractValue || '$15,500 / mo',
      subtitle: 'Average monthly billing per client',
      change: 'High-Value Tier',
      icon: TrendingUp,
      color: '#06b6d4',
    },
    {
      id: 'renewal',
      title: 'Retainer Renewal Rate',
      value: metrics.renewalRate || '98.2%',
      subtitle: 'Annual contract renewal pace',
      change: 'Industry Leading',
      icon: CheckCircle2,
      color: '#ec4899',
    },
    {
      id: 'overdue',
      title: 'Outstanding Overdue Billing',
      value: metrics.overdueInvoices || '$0 Overdue',
      subtitle: 'Stripe ACH & Card collections',
      change: 'Zero Bad Debt',
      icon: AlertCircle,
      color: '#3b82f6',
    },
  ];

  return (
    <div className="contract-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="contract-kpi-card">
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

export default ContractKpiCards;
