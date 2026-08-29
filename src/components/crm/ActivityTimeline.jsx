import React from 'react';
import {
  Activity,
  Phone,
  MessageSquare,
  Mail,
  Video,
  FileText,
  DollarSign,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  Calendar,
} from 'lucide-react';

export function ActivityTimeline({
  activities = [],
  onOpenLead,
}) {
  const getActivityIcon = (iconName) => {
    switch (iconName) {
      case 'Phone':
        return <Phone size={14} className="text-cyan" />;
      case 'MessageSquare':
        return <MessageSquare size={14} className="text-success" />;
      case 'Mail':
        return <Mail size={14} className="text-primary" />;
      case 'Video':
        return <Video size={14} className="text-pink" />;
      case 'FileText':
        return <FileText size={14} className="text-purple" />;
      case 'DollarSign':
        return <DollarSign size={14} className="text-success" />;
      case 'CheckCircle2':
        return <CheckCircle2 size={14} className="text-success" />;
      case 'UserPlus':
        return <UserPlus size={14} className="text-cyan" />;
      case 'Calendar':
        return <Calendar size={14} className="text-warning" />;
      default:
        return <RefreshCw size={14} className="text-primary" />;
    }
  };

  return (
    <div className="crm-activity-pane">
      <div className="activity-header-bar">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <h3 className="section-title-clean">Sales Team Activity & Inbound Event Log</h3>
        </div>
        <span className="text-xs text-muted">Showing real-time audit entries across accounts</span>
      </div>

      <div className="activity-timeline-feed">
        {activities.map((act) => (
          <div key={act.id} className="timeline-entry-card">
            <div className="timeline-icon-box">
              {getActivityIcon(act.icon)}
            </div>

            <div className="timeline-content-block">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <strong
                    className="timeline-lead-name cursor-pointer"
                    onClick={() => onOpenLead && onOpenLead(act.leadId)}
                  >
                    {act.leadName}
                  </strong>
                  <span className="timeline-type-badge">{act.type}</span>
                </div>
                <span className="timeline-time-text">{act.timestamp}</span>
              </div>

              <p className="timeline-details-text">{act.details}</p>

              <span className="timeline-staff-sub">Logged by <strong>{act.staff}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityTimeline;
