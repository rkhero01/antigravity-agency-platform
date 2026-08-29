import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Share2,
  CalendarDays,
  Sparkles,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Shield,
  FileText,
  Globe,
  MessageSquare,
  Users2,
  Target,
  Flame,
  FolderGit2,
  Rocket,
  Receipt,
  Radio,
  Mail,
  SearchCheck,
  UserCheck,
  PhoneCall,
  Brain,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NAVIGATION_ITEMS, APP_NAME, APP_SUBTITLE } from '../../utils/constants.js';

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Share2,
  MessageSquare,
  CalendarDays,
  Sparkles,
  Users2,
  TrendingUp,
  Target,
  Flame,
  FolderGit2,
  Rocket,
  Receipt,
  Radio,
  Mail,
  SearchCheck,
  UserCheck,
  PhoneCall,
  Brain,
  Zap,
  BarChart3,
  CheckSquare,
  Shield,
  FileText,
  Globe,
  Settings,
};

export function Sidebar({ activeModule, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`saas-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-container">
        <div className="brand-logo-icon">
          <Zap size={22} className="logo-spark" />
        </div>
        {!isCollapsed && (
          <div className="brand-text-block">
            <h1 className="brand-main-title">{APP_NAME}</h1>
            <span className="brand-subtitle">{APP_SUBTITLE}</span>
          </div>
        )}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="sidebar-menu-wrapper">
        {!isCollapsed && <div className="nav-group-label">WORKSPACE MODULES</div>}
        <nav className="sidebar-nav-list" aria-label="Main Navigation">
          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="nav-icon-container">
                  <IconComponent size={19} className="nav-icon" />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge && <span className="nav-pill-badge">{item.badge}</span>}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Workspace Status Footer */}
      <div className="sidebar-footer-container">
        <div className="workspace-status-card">
          <div className="status-indicator-dot" />
          {!isCollapsed && (
            <div className="status-info">
              <span className="status-title">Pulse Agency Workspace</span>
              <span className="status-desc">24 Clients • 68 Accounts</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
