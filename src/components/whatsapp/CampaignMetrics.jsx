import React from 'react';
import {
  Send,
  Eye,
  MessageCircle,
  Award,
  DollarSign,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

export function CampaignMetrics({
  metrics = {},
  variant = 'grid', // 'grid' | 'compact' | 'funnel'
}) {
  const {
    deliveryRate = '0.0%',
    readRate = '0.0%',
    replyRate = '0.0%',
    conversionRate = '0.0%',
    revenue = 0,
    spend = 0,
    roas = 'N/A',
  } = metrics;

  const items = [
    {
      id: 'delivery',
      label: 'Delivery Rate',
      value: deliveryRate,
      icon: Send,
      color: '#10b981',
      sub: 'Verified via Meta API',
    },
    {
      id: 'read',
      label: 'Read Rate',
      value: readRate,
      icon: Eye,
      color: '#06b6d4',
      sub: 'Delivered vs opened',
    },
    {
      id: 'reply',
      label: 'Reply Rate',
      value: replyRate,
      icon: MessageCircle,
      color: '#8b5cf6',
      sub: 'Customer engagements',
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: conversionRate,
      icon: Award,
      color: '#ec4899',
      sub: 'Replies to sales closure',
    },
    {
      id: 'revenue',
      label: 'Attributed Revenue',
      value: `₹${Number(revenue).toLocaleString()}`,
      icon: DollarSign,
      color: '#f59e0b',
      sub: 'Direct WhatsApp sales',
    },
    {
      id: 'spend',
      label: 'Campaign Spend',
      value: `₹${Number(spend).toLocaleString()}`,
      icon: CreditCard,
      color: '#64748b',
      sub: 'Meta conversation fees',
    },
    {
      id: 'roas',
      label: 'Campaign ROAS',
      value: roas !== 'N/A' ? `${roas}` : 'N/A',
      icon: TrendingUp,
      color: '#22c55e',
      sub: 'Return on ad spend',
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="campaign-metrics-compact-row">
        {items.slice(0, 5).map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.id} className="compact-metric-col">
              <span className="compact-lbl">{m.label}</span>
              <div className="flex items-center gap-1">
                <Icon size={12} style={{ color: m.color }} />
                <strong className="compact-val">{m.value}</strong>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="campaign-metrics-grid">
      {items.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.id} className="campaign-metric-box">
            <div className="flex justify-between items-center mb-1">
              <span className="cm-lbl">{m.label}</span>
              <div
                className="cm-icon-pill"
                style={{ background: `${m.color}18`, color: m.color }}
              >
                <Icon size={13} />
              </div>
            </div>
            <strong className="cm-val">{m.value}</strong>
            <span className="cm-sub">{m.sub}</span>
          </div>
        );
      })}
    </div>
  );
}

export default CampaignMetrics;
