import React from 'react';
import {
  MessageSquare,
  Send,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  Users,
  Award,
  DollarSign,
  Eye,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export function WhatsAppKpiCards({
  analytics = {},
  loading = false,
}) {
  const cards = [
    {
      id: 'active-conv',
      title: 'Active Conversations',
      value: analytics.activeConversations !== undefined ? analytics.activeConversations : 142,
      change: analytics.activeConversationsMoM || '+28.4% vs Last Month',
      subtitle: 'Open & in-progress customer chats',
      icon: MessageSquare,
      color: '#22c55e',
      isPositive: true,
    },
    {
      id: 'sent',
      title: 'Messages Sent',
      value: analytics.messagesSent ? Number(analytics.messagesSent).toLocaleString() : '48,650',
      change: analytics.messagesSentMoM || '+18.2% Volume',
      subtitle: 'Campaigns & direct staff replies',
      icon: Send,
      color: '#3b82f6',
      isPositive: true,
    },
    {
      id: 'received',
      title: 'Messages Received',
      value: analytics.messagesReceived ? Number(analytics.messagesReceived).toLocaleString() : '36,820',
      change: analytics.messagesReceivedMoM || '+22.5% Inbound',
      subtitle: 'Direct customer incoming chats',
      icon: MessageCircle,
      color: '#06b6d4',
      isPositive: true,
    },
    {
      id: 'reply-rate',
      title: 'Customer Reply Rate',
      value: analytics.replyRate || '75.6%',
      change: analytics.replyRateMoM || '+4.8% Engagement Lift',
      subtitle: 'Broadcast & template interactions',
      icon: TrendingUp,
      color: '#a855f7',
      isPositive: true,
    },
    {
      id: 'delivery-rate',
      title: 'Message Delivery Rate',
      value: analytics.deliveryRate || '99.4%',
      change: analytics.deliveryRateMoM || 'Tier 3 Meta API Health',
      subtitle: 'Verified deliverability rate',
      icon: ShieldCheck,
      color: '#10b981',
      isPositive: true,
    },
    {
      id: 'leads',
      title: 'Leads Generated',
      value: analytics.leadsGenerated || '1,240',
      change: analytics.leadsGeneratedMoM || '+310 High-Intent Leads',
      subtitle: 'Captured via Click-to-WhatsApp ads',
      icon: Users,
      color: '#6366f1',
      isPositive: true,
    },
    {
      id: 'conversions',
      title: 'Closed Conversions',
      value: analytics.conversions || '418',
      change: analytics.conversionsMoM || '33.7% Conversion Rate',
      subtitle: 'Orders & contracts signed via chat',
      icon: Award,
      color: '#ec4899',
      isPositive: true,
    },
    {
      id: 'revenue',
      title: 'Attributed Revenue',
      value: analytics.revenueAttributed
        ? `₹${Number(analytics.revenueAttributed).toLocaleString()}`
        : '₹3,684,000',
      change: analytics.revenueAttributedMoM || '+₹840,000 MoM Revenue',
      subtitle: 'Direct WhatsApp sales attribution',
      icon: DollarSign,
      color: '#f59e0b',
      isPositive: true,
    },
  ];

  if (loading) {
    return (
      <div className="wa-kpis-grid loading-state">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="wa-kpi-card skeleton-card">
            <div className="skeleton-line w-24 h-4 mb-2" />
            <div className="skeleton-line w-36 h-8 mb-2" />
            <div className="skeleton-line w-20 h-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="wa-kpis-section">
      {/* 8 Primary KPI Cards */}
      <div className="wa-kpis-grid">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.id} className="wa-kpi-card">
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
                <span className={`kpi-change-tag ${card.isPositive ? 'positive' : 'neutral'}`}>
                  {card.change}
                </span>
                <span className="kpi-subtext">{card.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Telemetry Strip */}
      <div className="wa-secondary-telemetry-card">
        <div className="telemetry-item">
          <div className="telemetry-icon-box cyan">
            <Eye size={14} />
          </div>
          <div>
            <span className="telemetry-lbl">Message Read Rate</span>
            <strong className="telemetry-val">{analytics.readRate || '88.9%'}</strong>
          </div>
        </div>

        <div className="telemetry-item">
          <div className="telemetry-icon-box warning">
            <AlertCircle size={14} />
          </div>
          <div>
            <span className="telemetry-lbl">Pending Follow-ups</span>
            <strong className="telemetry-val text-warning">{analytics.pendingFollowUps || 24} Touches</strong>
          </div>
        </div>

        <div className="telemetry-item">
          <div className="telemetry-icon-box purple">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="telemetry-lbl">AI-Assisted Replies</span>
            <strong className="telemetry-val text-purple">{analytics.aiAssistedReplies || '68.2%'}</strong>
          </div>
        </div>

        <div className="telemetry-item">
          <div className="telemetry-icon-box green">
            <Clock size={14} />
          </div>
          <div>
            <span className="telemetry-lbl">Avg. Response Time</span>
            <strong className="telemetry-val text-success">
              {analytics.averageResponseTime || '1.2m'} <small className="text-muted text-xs font-normal">({analytics.averageResponseTimeMoM || '42s Faster vs Human'})</small>
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppKpiCards;
