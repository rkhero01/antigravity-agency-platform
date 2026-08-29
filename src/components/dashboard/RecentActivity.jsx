import React from 'react';
import { mockRecentActivity } from '../../data/mockDashboard.js';
import { Clock, ArrowUpRight, Activity } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function RecentActivity({ onNavigateToClients }) {
  return (
    <div className="dashboard-widget-card recent-activity-card">
      <div className="widget-header-row">
        <div className="widget-header-text">
          <div className="widget-title-with-icon">
            <Activity size={16} className="text-cyan" />
            <h3 className="widget-title">Recent Client Activity</h3>
          </div>
          <p className="widget-subtitle">Real-time actions, approvals & campaign updates</p>
        </div>
        <button
          type="button"
          className="widget-action-link"
          onClick={onNavigateToClients}
        >
          <span>View All Clients</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="activity-timeline-feed">
        {mockRecentActivity.map((act) => (
          <div key={act.id} className="activity-feed-item">
            <div className="activity-avatar-badge">{act.avatar}</div>

            <div className="activity-body-content">
              <div className="activity-top-line">
                <span className="activity-client-name">{act.client}</span>
                <span className="activity-platform-badge">{act.platform}</span>
                <span className="activity-timestamp">
                  <Clock size={12} /> {act.time}
                </span>
              </div>

              <p className="activity-desc-text">{act.activity}</p>
            </div>

            <div className="activity-status-slot">
              <Badge variant={act.statusVariant} size="sm">
                {act.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
