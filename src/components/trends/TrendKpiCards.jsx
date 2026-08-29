import React from 'react';
import { Flame, Music, Hash, TrendingUp, Sparkles } from 'lucide-react';

export function TrendKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'trends',
      title: 'Active Trends Monitored',
      value: metrics.trendsTracked || '24 Trends',
      subtitle: 'Real-time social listening scans',
      change: '100% Online',
      icon: Flame,
      color: '#f97316',
    },
    {
      id: 'audio',
      title: 'Breakout Audio Tracks',
      value: metrics.audioTracks || '4 Sounds',
      subtitle: 'TikTok & Reels trending audio',
      change: 'Fast Rising Velocity',
      icon: Music,
      color: '#ec4899',
    },
    {
      id: 'sets',
      title: 'Saved Hashtag Bundles',
      value: metrics.savedSets || '3 Sets',
      subtitle: 'Niche algorithmic clusters',
      change: '1-Click Composer Ready',
      icon: Hash,
      color: '#06b6d4',
    },
    {
      id: 'velocity',
      title: 'Virality Velocity Index',
      value: metrics.trendVelocity || '+280% Surge',
      subtitle: 'Average weekly engagement spike',
      change: 'Explosive Reach',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      id: 'forecasts',
      title: 'AI Trend Forecasts',
      value: metrics.aiForecasts || '3 Forecasts',
      subtitle: 'Pre-breakout content briefs',
      change: 'Q3 & Q4 Projections',
      icon: Sparkles,
      color: '#a855f7',
    },
  ];

  return (
    <div className="trend-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="trend-kpi-card">
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

export default TrendKpiCards;
