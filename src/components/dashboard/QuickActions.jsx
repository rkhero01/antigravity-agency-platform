import React from 'react';
import { mockQuickActions } from '../../data/mockDashboard.js';
import {
  PlusCircle,
  Sparkles,
  UserPlus,
  Link2,
  FileText,
  ArrowRight,
  Zap,
} from 'lucide-react';

const ICON_MAP = {
  PlusCircle,
  Sparkles,
  UserPlus,
  Link2,
  FileText,
};

export function QuickActions({ onNavigate }) {
  return (
    <div className="dashboard-widget-card quick-actions-widget">
      <div className="widget-header-row">
        <div className="widget-header-text">
          <div className="widget-title-with-icon">
            <Zap size={16} className="text-gold" />
            <h3 className="widget-title">Agency Quick Actions</h3>
          </div>
          <p className="widget-subtitle">One-click shortcuts to common workflows</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        {mockQuickActions.map((action) => {
          const IconComp = ICON_MAP[action.icon] || Sparkles;
          return (
            <button
              key={action.id}
              type="button"
              className="quick-action-card"
              onClick={() => onNavigate?.(action.targetModule)}
            >
              <div
                className="action-icon-circle"
                style={{
                  backgroundColor: `${action.color}15`,
                  color: action.color,
                  borderColor: `${action.color}35`,
                }}
              >
                <IconComp size={20} />
              </div>
              <div className="action-text-content">
                <span className="action-title">{action.title}</span>
                <span className="action-desc">{action.description}</span>
              </div>
              <ArrowRight size={15} className="action-arrow-icon" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;
