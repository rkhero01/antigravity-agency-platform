import React from 'react';
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
  Settings,
  Zap,
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../utils/constants.js';

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Share2,
  CalendarDays,
  Sparkles,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Shield,
  Settings,
};

export function Sidebar({ activeModule, onNavigate }) {
  return (
    <aside className="agency-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-badge">
          <Zap size={20} className="brand-icon" />
        </div>
        <div className="brand-info">
          <span className="brand-title">PulseAI</span>
          <span className="brand-badge">Agency Pro</span>
        </div>
      </div>

      <div className="sidebar-nav-container">
        <div className="nav-section-title">MANAGEMENT MODULES</div>
        <nav className="sidebar-nav">
          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <IconComponent size={18} className="nav-item-icon" />
                <span className="nav-item-label">{item.label}</span>
                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="agency-status-indicator">
          <span className="status-dot online"></span>
          <div className="agency-plan-info">
            <span className="plan-name">Enterprise Workspace</span>
            <span className="plan-meta">4 Clients Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
