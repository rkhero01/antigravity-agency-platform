import React from 'react';
import {
  Users,
  Eye,
  Zap,
  FileCheck,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export function AnalyticsKpiCards({ summary = {} }) {
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const cards = [
    {
      id: 'reach',
      title: 'Total Audience Reach',
      value: formatNumber(summary.totalReach || 318500),
      change: summary.reachGrowth || '+18.4% vs last period',
      subtitle: 'Cross-network unique impressions',
      icon: Users,
      color: '#6366f1',
    },
    {
      id: 'engagement',
      title: 'Total Engagements',
      value: formatNumber(summary.totalEngagement || 64800),
      change: summary.engagementGrowth || '+19.2% Growth',
      subtitle: 'Likes, comments, shares & saves',
      icon: Eye,
      color: '#ec4899',
    },
    {
      id: 'rate',
      title: 'Avg Engagement Rate',
      value: summary.engagementRate || '5.42%',
      change: summary.rateBenchmark || '+2.1% above industry avg',
      subtitle: 'Benchmark target: > 3.50%',
      icon: Zap,
      color: '#06b6d4',
    },
    {
      id: 'published',
      title: 'Published Content',
      value: `${summary.totalPostsPublished || 86} Posts`,
      change: summary.publishingPacing || '100% on schedule',
      subtitle: 'Reels, Posts, Carousels & Stories',
      icon: FileCheck,
      color: '#10b981',
    },
    {
      id: 'revenue',
      title: 'Attributed Lead Value',
      value: formatCurrency(summary.attributedRevenue || 94200),
      change: summary.revenueGrowth || '+26.8% Revenue Yield',
      subtitle: 'Organic + Paid funnel conversions',
      icon: TrendingUp,
      color: '#a855f7',
    },
    {
      id: 'followers',
      title: 'Total Community Size',
      value: formatNumber(summary.totalFollowers || 174200),
      change: summary.followersGrowth || '+12.6% New Followers',
      subtitle: 'Verified followers & subscribers',
      icon: UserPlus,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="analytics-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="analytics-kpi-card">
            <div className="kpi-top-row">
              <span className="kpi-title-label">{card.title}</span>
              <div className="kpi-icon-pill" style={{ background: `${card.color}20`, color: card.color }}>
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

export default AnalyticsKpiCards;
