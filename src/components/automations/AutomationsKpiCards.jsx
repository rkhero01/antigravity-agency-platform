import React from 'react';
import { Zap, Clock, CheckCircle2, TrendingUp, Cpu } from 'lucide-react';

export function AutomationsKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'active',
      title: 'Active Workflow Rules',
      value: `${metrics.activeCount || 5} Active`,
      subtitle: 'Continuous Event Monitoring',
      change: '100% Online',
      icon: Zap,
      color: '#6366f1',
    },
    {
      id: 'executions',
      title: 'Total Automated Actions',
      value: metrics.totalExecutions || '559 Runs',
      subtitle: 'Executed across all clients',
      change: '+18.4% this month',
      icon: Cpu,
      color: '#10b981',
    },
    {
      id: 'time',
      title: 'Agency Hours Saved',
      value: metrics.hoursSaved || '184 Hours / mo',
      subtitle: 'Automated repetitive tasks',
      change: '1.2 FTE equivalent',
      icon: Clock,
      color: '#a855f7',
    },
    {
      id: 'rate',
      title: 'Execution Reliability',
      value: metrics.successRate || '99.8%',
      subtitle: 'Fault-tolerant retry queue',
      change: 'Zero Dropped Events',
      icon: CheckCircle2,
      color: '#06b6d4',
    },
    {
      id: 'today',
      title: 'Triggered Actions Today',
      value: metrics.triggeredToday || '30 Actions',
      subtitle: 'Publishing, CRM & Alerts',
      change: 'Real-time Webhook Pacing',
      icon: TrendingUp,
      color: '#ec4899',
    },
  ];

  return (
    <div className="automations-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="automations-kpi-card">
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

export default AutomationsKpiCards;
