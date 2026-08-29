import React from 'react';
import {
  Building2,
  User,
  Lock,
  SlidersHorizontal,
  Settings as SettingsIcon,
  RefreshCw,
} from 'lucide-react';

export function SettingsHeader({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
}) {
  const tabs = [
    {
      id: 'agency',
      label: 'Agency Workspace',
      icon: Building2,
      desc: 'Multi-tenant identity & billing plan',
    },
    {
      id: 'user',
      label: 'My Profile',
      icon: User,
      desc: 'Operator credentials & role',
    },
    {
      id: 'security',
      label: 'Password & Security',
      icon: Lock,
      desc: 'Password changes & JWT session',
    },
    {
      id: 'preferences',
      label: 'Governance & Preferences',
      icon: SlidersHorizontal,
      desc: 'Telemetry & safety gate',
    },
  ];

  return (
    <div className="settings-header-wrapper">
      {/* Top Banner */}
      <div className="settings-hero-banner">
        <div className="settings-hero-title-box">
          <div className="settings-badge-pill">
            <SettingsIcon size={14} />
            <span>PostgreSQL Multi-Tenant Workspace & Security</span>
          </div>
          <h1 className="settings-main-heading">Agency Workspace & Profile Settings</h1>
          <p className="settings-subheading-text">
            Configure multi-tenant agency metadata, operator credentials, and cryptographic security safeguards.
          </p>
        </div>

        <div className="settings-hero-actions">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh database records"
            aria-label="Refresh database records"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs-nav-bar" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              className={`settings-nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="tab-btn-icon-box">
                <Icon size={16} />
              </div>
              <div className="tab-btn-text-box">
                <span className="tab-btn-label">{tab.label}</span>
                <span className="tab-btn-desc">{tab.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SettingsHeader;
