import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export function TeamMetrics({
  teamData = {},
}) {
  const {
    totalTeamMembers = 6,
    totalActiveConversations = 121,
    totalResolvedConversations = 917,
    avgResponseTime = '45s',
    suggestedAssignee = null,
    members = [],
  } = teamData;

  const onlineCount = members.filter((m) => m.status === 'Online').length;
  const totalPendingFollowUps = members.reduce((acc, m) => acc + (m.pendingFollowUps || 0), 0);

  return (
    <div className="wa-team-metrics-strip">
      <div className="team-metric-item">
        <span className="team-metric-lbl">Total Operators</span>
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-primary" />
          <strong className="team-metric-val text-white">{totalTeamMembers}</strong>
        </div>
        <span className="team-metric-sub text-success">
          {onlineCount} Online & Active
        </span>
      </div>

      <div className="team-metric-item">
        <span className="team-metric-lbl">Active Chats</span>
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-cyan" />
          <strong className="team-metric-val text-cyan">{totalActiveConversations}</strong>
        </div>
        <span className="team-metric-sub text-dim">In progress right now</span>
      </div>

      <div className="team-metric-item">
        <span className="team-metric-lbl">Resolved Tickets</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-success" />
          <strong className="team-metric-val text-success">{totalResolvedConversations}</strong>
        </div>
        <span className="team-metric-sub text-dim">Closed customer queries</span>
      </div>

      <div className="team-metric-item">
        <span className="team-metric-lbl">Avg Response Speed</span>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-purple" />
          <strong className="team-metric-val text-purple">{avgResponseTime}</strong>
        </div>
        <span className="team-metric-sub text-success">Tier 1 velocity</span>
      </div>

      <div className="team-metric-item">
        <span className="team-metric-lbl">Pending Follow-ups</span>
        <div className="flex items-center gap-1.5">
          <RotateCcw size={14} className="text-warning" />
          <strong className="team-metric-val text-warning">{totalPendingFollowUps}</strong>
        </div>
        <span className="team-metric-sub text-warning">Scheduled touches</span>
      </div>

      {suggestedAssignee && (
        <div className="team-metric-item highlight">
          <span className="team-metric-lbl">Suggested Auto-Assignee</span>
          <div className="flex items-center gap-1.5">
            <UserCheck size={14} className="text-warning" />
            <strong className="team-metric-val text-warning truncate text-xs" title={suggestedAssignee.name}>
              {suggestedAssignee.name}
            </strong>
          </div>
          <span className="team-metric-sub text-muted">
            {suggestedAssignee.activeConversations} chats ({suggestedAssignee.workloadPercentage} load)
          </span>
        </div>
      )}
    </div>
  );
}

export default TeamMetrics;
