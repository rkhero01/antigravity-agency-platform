import React from 'react';
import {
  Settings,
  Building,
  Sparkles,
  Plug,
  Palette,
  Bell,
  CreditCard,
  Save,
  RotateCcw,
} from 'lucide-react';

export function SettingsHeader({
  activeTab,
  onTabChange,
  onSaveAll,
  onDiscard,
  isDirty,
}) {
  const tabs = [
    { id: 'general', label: 'Agency Profile', icon: Building },
    { id: 'ai-engine', label: 'AI Model Engine', icon: Sparkles },
    { id: 'integrations', label: 'APIs & Webhooks', icon: Plug },
    { id: 'brand-kit', label: 'Agency Brand Kit', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Quotas', icon: CreditCard },
  ];

  return (
    <div className="settings-header-container">
      {/* Top Banner */}
      <div className="settings-top-banner">
        <div className="settings-title-block">
          <div className="settings-badge-tag">
            <Settings size={14} />
            <span>Workspace Preferences & Infrastructure</span>
          </div>
          <h1 className="settings-main-title">Agency & System Settings</h1>
          <p className="settings-subtitle-text">
            Configure white-label branding, AI creative engine parameters, API OAuth connections, webhooks, and billing quotas.
          </p>
        </div>

        <div className="settings-banner-actions">
          {isDirty && (
            <button
              type="button"
              className="btn-saas-secondary"
              onClick={onDiscard}
              title="Revert unsaved changes"
            >
              <RotateCcw size={15} />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            className="btn-save-settings-primary"
            onClick={onSaveAll}
          >
            <Save size={16} />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="settings-nav-tabs-bar" role="tablist">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`settings-nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <IconComponent size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SettingsHeader;
