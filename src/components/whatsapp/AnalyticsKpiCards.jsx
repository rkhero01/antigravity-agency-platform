import React from 'react';
import {
  Send,
  MessageSquare,
  CheckCircle2,
  Eye,
  RotateCcw,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export function AnalyticsKpiCards({
  analytics = {},
  loading = false,
}) {
  const cards = [
    {
      key: 'messagesSent',
      label: 'Messages Sent',
      icon: Send,
      data: analytics.messagesSent || { value: '48,650', prevValue: '41,150', change: '+18.2%', isPositive: true },
      colorClass: 'text-primary',
    },
    {
      key: 'messagesReceived',
      label: 'Messages Received',
      icon: MessageSquare,
      data: analytics.messagesReceived || { value: '36,820', prevValue: '30,050', change: '+22.5%', isPositive: true },
      colorClass: 'text-cyan',
    },
    {
      key: 'deliveryRate',
      label: 'Delivery Rate',
      icon: CheckCircle2,
      data: analytics.deliveryRate || { value: '99.4%', prevValue: '98.8%', change: '+0.6%', isPositive: true },
      colorClass: 'text-success',
    },
    {
      key: 'readRate',
      label: 'Read Rate',
      icon: Eye,
      data: analytics.readRate || { value: '88.9%', prevValue: '85.8%', change: '+3.1%', isPositive: true },
      colorClass: 'text-purple',
    },
    {
      key: 'replyRate',
      label: 'Reply Rate',
      icon: RotateCcw,
      data: analytics.replyRate || { value: '75.6%', prevValue: '70.8%', change: '+4.8%', isPositive: true },
      colorClass: 'text-pink',
    },
    {
      key: 'newLeads',
      label: 'New Leads',
      icon: Users,
      data: analytics.newLeads || { value: '1,240', prevValue: '930', change: '+33.3%', isPositive: true },
      colorClass: 'text-primary',
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      icon: Award,
      data: analytics.conversionRate || { value: '33.7%', prevValue: '28.5%', change: '+5.2%', isPositive: true },
      colorClass: 'text-success',
    },
    {
      key: 'revenue',
      label: 'Total Revenue',
      icon: DollarSign,
      data: analytics.revenue || { value: '₹3,684,000', prevValue: '₹2,844,000', change: '+29.5%', isPositive: true },
      colorClass: 'text-warning',
      isHighlight: true,
    },
    {
      key: 'roas',
      label: 'Blended ROAS',
      icon: TrendingUp,
      data: analytics.roas || { value: '4.8x', prevValue: '3.9x', change: '+0.9x', isPositive: true },
      colorClass: 'text-cyan',
    },
    {
      key: 'avgResponseTime',
      label: 'Avg Response Time',
      icon: Clock,
      data: analytics.avgResponseTime || { value: '45s', prevValue: '1.2m', change: '-27s', isPositive: true },
      colorClass: 'text-purple',
    },
    {
      key: 'activeConversations',
      label: 'Active Conversations',
      icon: Zap,
      data: analytics.activeConversations || { value: '142', prevValue: '110', change: '+29.0%', isPositive: true },
      colorClass: 'text-primary',
    },
    {
      key: 'followUpsCompleted',
      label: 'Follow-ups Completed',
      icon: CalendarCheck,
      data: analytics.followUpsCompleted || { value: '92.5%', prevValue: '84.0%', change: '+8.5%', isPositive: true },
      colorClass: 'text-success',
    },
  ];

  if (loading) {
    return (
      <div className="wa-analytics-kpi-grid">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="analytics-kpi-card skeleton-card">
            <div className="skeleton-line w-20 h-3 mb-2" />
            <div className="skeleton-line w-28 h-6 mb-2" />
            <div className="skeleton-line w-16 h-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="wa-analytics-kpi-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        const d = card.data;

        return (
          <div
            key={card.key}
            className={`analytics-kpi-card ${card.isHighlight ? 'highlight-revenue' : ''}`}
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="kpi-card-lbl">{card.label}</span>
              <div className="kpi-card-icon-pill">
                <Icon size={13} className={card.colorClass} />
              </div>
            </div>

            <div className="kpi-card-val-row">
              <strong className="kpi-card-val">{d.value}</strong>
            </div>

            <div className="kpi-card-sub-row">
              <span className={`kpi-change-pill ${d.isPositive ? 'positive' : 'negative'}`}>
                {d.isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                <span>{d.change}</span>
              </span>
              <span className="kpi-prev-text">vs prev ({d.prevValue})</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AnalyticsKpiCards;
