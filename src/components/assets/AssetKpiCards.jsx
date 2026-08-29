import React from 'react';
import { FolderGit2, HardDrive, Video, Sparkles, Globe } from 'lucide-react';

export function AssetKpiCards({ metrics = {} }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Media Assets',
      value: metrics.totalAssets || '1,280 Files',
      subtitle: 'Photos, 4K video, vectors & audio',
      change: '100% Synced',
      icon: FolderGit2,
      color: '#6366f1',
    },
    {
      id: 'storage',
      title: 'Cloud Storage Used',
      value: `${metrics.storageUsed || '142.8 GB'} / ${metrics.totalQuota || '1.0 TB'}`,
      subtitle: `${metrics.percentageUsed || 14.2}% of total allocation`,
      change: '857.2 GB Available',
      icon: HardDrive,
      color: '#06b6d4',
    },
    {
      id: 'video',
      title: 'Video & Short-Form Library',
      value: metrics.videoAssets || '340 4K Assets',
      subtitle: 'TikTok, Reels & YouTube Shorts',
      change: 'H.265 / Pro-Res Encoded',
      icon: Video,
      color: '#ec4899',
    },
    {
      id: 'ai',
      title: 'AI Auto-Tagged Assets',
      value: metrics.aiTagged || '1,190 Items (93%)',
      subtitle: 'Automated visual recognition',
      change: 'Instant Search Ready',
      icon: Sparkles,
      color: '#a855f7',
    },
    {
      id: 'bandwidth',
      title: 'Global CDN Delivery',
      value: metrics.bandwidth || '14.2 TB Served',
      subtitle: 'Edge cached worldwide',
      change: '99.98% Cache Hit Rate',
      icon: Globe,
      color: '#10b981',
    },
  ];

  return (
    <div className="asset-kpis-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="asset-kpi-card">
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

export default AssetKpiCards;
