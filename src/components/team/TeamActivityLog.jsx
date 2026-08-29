import React from 'react';
import { History, Clock, Shield, Building, User } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function TeamActivityLog({ logs = [] }) {
  const getCategoryVariant = (cat) => {
    switch (cat) {
      case 'Sign-off':
        return 'warning';
      case 'Paid Media':
        return 'success';
      case 'AI Studio':
        return 'primary';
      case 'Publishing':
        return 'cyan';
      case 'Security & Access':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="activity-log-card">
      <div className="activity-header-bar">
        <div className="activity-title-group">
          <History size={16} className="text-primary" />
          <h3 className="activity-main-title">Agency Security & Operational Audit Log</h3>
        </div>
        <span className="log-records-count">{logs.length} Recent Events Tracked</span>
      </div>

      <div className="activity-timeline-list">
        {logs.map((item, idx) => (
          <div key={item.id || idx} className="activity-log-item">
            <div className="activity-actor-avatar">
              {item.avatar || 'US'}
            </div>

            <div className="activity-content-box">
              <div className="activity-top-line">
                <strong className="actor-name">{item.user}</strong>
                <Badge variant={getCategoryVariant(item.category)} size="sm">
                  {item.category}
                </Badge>
                <span className="activity-client-tag">
                  <Building size={11} className="inline-icon" /> {item.client}
                </span>
                <span className="activity-time-stamp">
                  <Clock size={11} className="inline-icon" /> {item.time}
                </span>
              </div>

              <p className="activity-description-text">{item.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamActivityLog;
