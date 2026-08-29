import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Sparkles,
  ChevronDown,
  Building,
  Settings,
  Users,
  Key,
  LogOut,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { authSessionService } from '../../services/authSessionService.js';
import { MODULES } from '../../utils/constants.js';

export function Topbar({
  activeTitle = 'Dashboard',
  selectedDateRange = '30d',
  onDateRangeChange,
  activeClient = 'all',
  onClientChange,
  onOpenQuickAction,
  onNavigate,
  currentUser = null,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(() => currentUser || authSessionService.getCurrentUser());
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
    const unsubscribe = authSessionService.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
    return unsubscribe;
  }, [currentUser]);

  // Click outside to dismiss dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (module) => {
    setShowUserMenu(false);
    if (onNavigate) {
      onNavigate(module);
    } else if (onOpenQuickAction) {
      onOpenQuickAction(module);
    }
  };

  const handleSignOut = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setShowUserMenu(false);
    await authSessionService.logout();
  };

  const displayName = user?.name || 'Agency Operator';
  const displayEmail = user?.email || 'authenticated@antigravity.agency';
  const displayRole = user?.role || 'OPERATOR';
  const displayAgency = user?.agencyId || 'agency-demo-001';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AG';

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
          onClick={() => handleNavigation(MODULES.AI_ASSISTANT)}
          title="Open AI Studio"
        >
          <Sparkles size={15} className="ai-btn-icon" />
          <span className="ai-btn-text">AI Studio</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="notification-wrapper" ref={notifRef}>
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
        <div className="user-menu-wrapper" ref={menuRef}>
          <button
            type="button"
            className="user-profile-trigger"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User Profile Menu"
            aria-expanded={showUserMenu}
          >
            <div className="user-avatar-badge">{initials}</div>
            <div className="user-text-info">
              <span className="user-display-name">{displayName}</span>
              <span className="user-role-label">{displayRole}</span>
            </div>
            <ChevronDown size={14} className="chevron-icon" />
          </button>

          {showUserMenu && (
            <div className="user-dropdown-card" role="menu" aria-label="User profile options">
              <div className="user-card-head">
                <div className="user-card-avatar-lg">{initials}</div>
                <div className="user-card-info-group">
                  <strong className="user-card-title">{displayName}</strong>
                  <span className="user-card-email-sub">{displayEmail}</span>
                  <span className="user-card-tenant-badge">{displayAgency}</span>
                </div>
              </div>

              <div className="user-card-links">
                <button
                  type="button"
                  className="user-card-item"
                  onClick={() => handleNavigation(MODULES.SETTINGS)}
                >
                  <Settings size={15} className="user-card-item-icon" />
                  <span>Workspace Settings</span>
                </button>

                <button
                  type="button"
                  className="user-card-item"
                  onClick={() => handleNavigation(MODULES.TEAM)}
                >
                  <Users size={15} className="user-card-item-icon" />
                  <span>Team Members & Roles</span>
                </button>

                <button
                  type="button"
                  className="user-card-item"
                  onClick={() => handleNavigation(MODULES.SETTINGS)}
                >
                  <Key size={15} className="user-card-item-icon" />
                  <span>API & Integrations</span>
                </button>

                <div className="user-divider" />

                <button
                  type="button"
                  className="user-card-item signout"
                  onClick={handleSignOut}
                >
                  <LogOut size={15} className="user-card-item-icon" />
                  <span>Sign Out</span>
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
