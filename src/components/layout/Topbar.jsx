import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Sparkles,
  ChevronDown,
  Building,
  Check,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function Topbar({
  activeTitle = 'Dashboard',
  selectedDateRange = '30d',
  onDateRangeChange,
  activeClient = 'all',
  onClientChange,
  onOpenQuickAction,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dateRangeLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last Quarter (90D)',
    ytd: 'Year to Date (YTD)',
  };

  return (
    <header className="saas-topbar">
      {/* Left: Page Title & Breadcrumb */}
      <div className="topbar-left">
        <div className="topbar-title-section">
          <h2 className="topbar-page-title">{activeTitle}</h2>
          <span className="topbar-breadcrumb-chip">Live Agency Hub</span>
        </div>

        {/* Client Workspace Quick Selector */}
        <div className="client-dropdown-container">
          <Building size={15} className="client-icon" />
          <select
            className="client-select-input"
            value={activeClient}
            onChange={(e) => onClientChange?.(e.target.value)}
            aria-label="Select Client Account"
          >
            <option value="all">🏢 All Client Accounts (Portfolio)</option>
            {mockClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center/Right: Search, Date Range, Notifications & Profile */}
      <div className="topbar-right">
        {/* Global Omnisearch */}
        <div className="topbar-search-box">
          <Search size={16} className="search-glass-icon" />
          <input
            type="text"
            placeholder="Search campaigns, content, clients... (⌘K)"
            className="search-text-field"
          />
        </div>

        {/* Global Date Range Selector */}
        <div className="date-selector-wrapper">
          <Calendar size={14} className="date-icon" />
          <select
            className="date-select-input"
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value)}
            aria-label="Select Date Range"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>

        {/* AI Quick Assistant Trigger */}
        <button
          type="button"
          className="topbar-ai-btn"
          onClick={() => onOpenQuickAction?.('ai-assistant')}
          title="Open AI Studio"
        >
          <Sparkles size={15} className="ai-btn-icon" />
          <span className="ai-btn-text">AI Studio</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="notification-wrapper">
          <button
            type="button"
            className="topbar-icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="unread-dot" />
          </button>

          {showNotifications && (
            <div className="notifications-dropdown-menu">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <span className="badge-new-count">3 New</span>
              </div>
              <div className="notifications-list">
                <div className="notification-item unread">
                  <span className="notif-dot" />
                  <div>
                    <p className="notif-text">
                      <strong>Apex Fitness:</strong> Meta Ad ROAS exceeded 4.0x target!
                    </p>
                    <span className="notif-time">10m ago</span>
                  </div>
                </div>
                <div className="notification-item unread">
                  <span className="notif-dot" />
                  <div>
                    <p className="notif-text">
                      <strong>Verde Organics:</strong> Reel approved by client.
                    </p>
                    <span className="notif-time">25m ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div>
                    <p className="notif-text">
                      <strong>NovaTech SaaS:</strong> YouTube token synced.
                    </p>
                    <span className="notif-time">2h ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User / Profile Menu */}
        <div className="user-menu-wrapper">
          <button
            type="button"
            className="user-profile-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User Profile Menu"
          >
            <div className="user-avatar-badge">AM</div>
            <div className="user-text-info">
              <span className="user-display-name">Alex Morgan</span>
              <span className="user-role-label">Agency Director</span>
            </div>
            <ChevronDown size={14} className="chevron-icon" />
          </button>

          {showUserMenu && (
            <div className="user-dropdown-card">
              <div className="user-card-head">
                <strong>Alex Morgan</strong>
                <span>alex@pulseagency.ai</span>
              </div>
              <div className="user-card-links">
                <button type="button" className="user-card-item">
                  Workspace Settings
                </button>
                <button type="button" className="user-card-item">
                  Team Members & Roles
                </button>
                <button type="button" className="user-card-item">
                  API & Integrations
                </button>
                <div className="user-divider" />
                <button type="button" className="user-card-item signout">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
