import React from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Award,
  TrendingUp,
  DollarSign,
  Briefcase,
} from 'lucide-react';

export function CRMKpiCards({ overview = {} }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Inbound Leads',
      value: overview.totalLeads || '0',
      subtitle: 'Total pipeline contacts',
      change: overview.totalLeadsMoM || 'Database records',
      icon: Users,
      color: '#3b82f6',
    },
    {
      id: 'today',
      title: 'New Inbound',
      value: overview.newLeadsToday || '0 Leads',
      subtitle: 'Awaiting discovery contact',
      change: overview.newLeadsMoM || 'Awaiting First Touch',
      icon: UserPlus,
      color: '#06b6d4',
    },
    {
      id: 'qualified',
      title: 'Qualified Leads (SQL)',
      value: overview.qualifiedLeads || '0 Leads',
      subtitle: 'Active opportunities',
      change: overview.qualifiedMoM || '0% Qual Rate',
      icon: CheckCircle2,
      color: '#6366f1',
    },
    {
      id: 'won',
      title: 'Deals Closed Won',
      value: overview.wonLeads || '0 Deals',
      subtitle: 'Executed client contracts',
      change: overview.wonLeadsMoM || '0 Closed Won',
      icon: Award,
      color: '#10b981',
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: overview.conversionRate || '0.0%',
      subtitle: 'Inbound to closed win ratio',
      change: overview.conversionMoM || '0.0% Win Rate',
      icon: TrendingUp,
      color: '#ec4899',
    },
    {
      id: 'pipeline',
      title: 'Active Pipeline Value',
      value: overview.pipelineValue || '$0',
      subtitle: 'In-flight potential revenue',
      change: overview.pipelineMoM || '$0 Pipeline',
      icon: Briefcase,
      color: '#8b5cf6',
    },
    {
      id: 'revenue',
      title: 'Closed Won Revenue',
      value: overview.revenueWon || '$0',
      subtitle: 'Realized contract ARR/MRR',
      change: overview.revenueMoM || '$0 Won Revenue',
      icon: DollarSign,
      color: '#10b981',
    },
  ];

  return (
    <div className="crm-kpis-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className="crm-kpi-card">
            <div className="crm-kpi-header">
              <div
                className="crm-kpi-icon-pill"
                style={{
                  background: `${card.color}20`,
                  color: card.color,
                  border: `1px solid ${card.color}40`,
                }}
              >
                <Icon size={16} />
              </div>
              <span className="crm-kpi-change-tag">{card.change}</span>
            </div>

            <div className="crm-kpi-body">
              <span className="crm-kpi-title">{card.title}</span>
              <strong className="crm-kpi-value">{card.value}</strong>
              <span className="crm-kpi-subtitle">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CRMKpiCards;
