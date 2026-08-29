import React from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
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
      value: overview.totalLeads || '1,480',
      subtitle: 'Aggregate captured contacts',
      change: overview.totalLeadsMoM || '+24.5% vs Last Mo',
      icon: Users,
      color: '#3b82f6',
    },
    {
      id: 'today',
      title: 'New Leads Today',
      value: overview.newLeadsToday || '38 Leads',
      subtitle: 'Inbound ads & website forms',
      change: overview.newLeadsMoM || '+12 Today',
      icon: UserPlus,
      color: '#06b6d4',
    },
    {
      id: 'qualified',
      title: 'Qualified Sales Leads',
      value: overview.qualifiedLeads || '624 Leads',
      subtitle: 'Passed AI scoring threshold',
      change: overview.qualifiedMoM || '48.2% Qual Rate',
      icon: CheckCircle2,
      color: '#6366f1',
    },
    {
      id: 'followups',
      title: 'Follow-ups Due Today',
      value: overview.followUpsDue || '18 Due Today',
      subtitle: 'High-priority sales touches',
      change: overview.followUpsMoM || '2 Overdue Priority',
      icon: Clock,
      color: '#f59e0b',
    },
    {
      id: 'won',
      title: 'Deals Closed Won',
      value: overview.wonLeads || '215 Deals',
      subtitle: 'Executed client contracts',
      change: overview.wonLeadsMoM || '+34 Deals Won',
      icon: Award,
      color: '#10b981',
    },
    {
      id: 'rate',
      title: 'Lead Conversion Rate',
      value: overview.conversionRate || '16.8%',
      subtitle: 'Visitor to closed customer',
      change: overview.conversionMoM || '+3.2% Lift',
      icon: TrendingUp,
      color: '#a855f7',
    },
    {
      id: 'pipeline',
      title: 'Active Pipeline Value',
      value: overview.pipelineValue || '$1,840,000',
      subtitle: 'Total unclosed deal size',
      change: overview.pipelineMoM || '+18.2% Pipeline',
      icon: Briefcase,
      color: '#ec4899',
    },
    {
      id: 'revenue',
      title: 'Total Revenue Won',
      value: overview.revenueWon || '$642,500',
      subtitle: 'Direct closed sales revenue',
      change: overview.revenueMoM || '+$148,000 Won',
      icon: DollarSign,
      color: '#10b981',
    },
  ];

  return (
    <div className="crm-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="crm-kpi-card">
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

export default CRMKpiCards;
