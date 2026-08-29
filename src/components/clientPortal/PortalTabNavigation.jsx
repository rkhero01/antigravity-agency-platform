import React from 'react';
import { CheckSquare, BarChart3, Palette } from 'lucide-react';

export function PortalTabNavigation({ activeTab, onTabChange, pendingCount = 0 }) {
  const tabs = [
    {
      id: 'review',
      label: 'Content Review & Sign-Off',
      icon: CheckSquare,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : null,
    },
    {
      id: 'performance',
      label: 'Performance & ROI Insights',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'brand-assets',
      label: 'Brand Kit & Digital Assets',
      icon: Palette,
      badge: null,
    },
  ];

  return (
    <div className="portal-tabs-bar" role="tablist">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`portal-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <IconComponent size={15} />
            <span>{tab.label}</span>
            {tab.badge && <span className="tab-pending-pill">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default PortalTabNavigation;
