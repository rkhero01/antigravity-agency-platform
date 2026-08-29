import React from 'react';
import {
  User,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react';

export function TeamMemberCard({
  member,
  onViewConversations,
}) {
  const isOnline = member.status === 'Online';
  const isBusy = member.status === 'Busy';

  return (
    <div className="wa-team-member-card">
      {/* Top Bar: Avatar, Name, Status */}
      <div className="member-card-header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={member.name}
              className="w-11 h-11 rounded-full object-cover border border-white/20"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <span
              className={`status-indicator-dot ${
                isOnline ? 'online' : isBusy ? 'busy' : 'offline'
              }`}
            />
          </div>
          <div>
            <h4 className="member-name">{member.name}</h4>
            <span className="member-role-title">{member.role}</span>
          </div>
        </div>

        <span
          className={`member-status-pill ${
            isOnline ? 'online' : isBusy ? 'busy' : 'offline'
          }`}
        >
          {isOnline ? '✓ Online' : isBusy ? '⏳ Busy' : '● Offline'}
        </span>
      </div>

      {/* Workload Progress */}
      <div className="member-workload-wrap">
        <div className="flex justify-between items-center text-[11px] mb-1">
          <span className="text-dim font-semibold uppercase">Capacity Workload:</span>
          <span className="text-white font-bold">{member.workloadPercentage || '18.5%'}</span>
        </div>
        <div className="member-workload-track">
          <div
            className="member-workload-fill"
            style={{ width: member.workloadPercentage || '20%' }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="member-metrics-grid">
        <div className="m-stat-box">
          <span className="m-stat-lbl">Active Chats</span>
          <strong className="m-stat-val text-cyan">{member.activeConversations || 0}</strong>
        </div>

        <div className="m-stat-box">
          <span className="m-stat-lbl">Resolved</span>
          <strong className="m-stat-val text-success">{member.resolvedConversations || 0}</strong>
        </div>

        <div className="m-stat-box">
          <span className="m-stat-lbl">Response Rate</span>
          <strong className="m-stat-val text-purple">{member.responseRate || '98.0%'}</strong>
        </div>

        <div className="m-stat-box">
          <span className="m-stat-lbl">Avg Speed</span>
          <strong className="m-stat-val text-warning">{member.avgResponseTime || '45s'}</strong>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="member-card-footer">
        <div className="flex items-center gap-1 text-[11px] text-muted">
          <Clock size={11} className="text-dim" />
          <span>{member.pendingFollowUps || 3} follow-ups due</span>
        </div>

        <button
          type="button"
          className="btn-view-member-chats"
          onClick={() => onViewConversations && onViewConversations(member.name)}
        >
          <span>View Chats</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

export default TeamMemberCard;
