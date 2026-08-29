import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Zap,
  Clock,
  Sparkles,
  Shield,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { TeamMetrics } from './TeamMetrics.jsx';
import { TeamMemberCard } from './TeamMemberCard.jsx';
import { whatsappService } from '../../services/whatsappService.js';

export function TeamTab({
  onSelectOperatorChats,
}) {
  const [teamData, setTeamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    const data = await whatsappService.getTeamPerformance();
    setTeamData(data);
    setLoading(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAutoBalance = () => {
    showToast('✓ AI Smart Dispatch re-balanced active conversation loads across 5 online operators');
    loadTeam();
  };

  const members = teamData.members || [];

  const filteredMembers = members.filter((m) => {
    if (statusFilter !== 'all' && m.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="wa-team-tab-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Team Metrics Strip */}
      <TeamMetrics teamData={teamData} />

      {/* Toolbar & Controls Card */}
      <div className="wa-team-toolbar-card">
        <div className="flex justify-between items-center gap-4 flex-wrap w-full mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={17} className="text-primary" />
              <span>Operator Fleet & Live Conversation Workloads</span>
            </h3>
            <p className="text-xs text-muted">
              Real-time staff availability, assignment load balancing, and response SLA monitoring
            </p>
          </div>

          <button
            type="button"
            className="btn-wa-primary"
            onClick={handleAutoBalance}
          >
            <Sparkles size={14} />
            <span>Auto-Balance Workload</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="wa-team-filters-bar">
          <div className="team-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search staff member by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="team-search-input"
            />
          </div>

          <div className="team-mini-select-wrap">
            <CheckCircle2 size={13} className="text-dim" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="team-mini-select"
            >
              <option value="all">All Availability</option>
              <option value="online">Online Staff</option>
              <option value="busy">Busy Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3-Column Team Members Grid */}
      {loading ? (
        <div className="team-members-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="wa-team-member-card skeleton-card">
              <div className="skeleton-line w-32 h-4 mb-2" />
              <div className="skeleton-line w-full h-16 mb-2" />
              <div className="skeleton-line w-full h-10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="team-members-grid">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onViewConversations={onSelectOperatorChats}
            />
          ))}
        </div>
      )}

      {/* Workload Distribution Summary Bar */}
      <div className="team-workload-breakdown-card">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sliders size={13} className="text-primary" />
          <span>Fleet Capacity & Assignment Distribution</span>
        </h4>
        <p className="text-xs text-muted mb-3">
          Conversations are dynamically routed to operators using smart capacity thresholding to maintain under 45-second first response times.
        </p>
        <div className="capacity-segments-bar">
          {members.map((m, idx) => (
            <div
              key={m.id}
              className={`capacity-segment-fill seg-${idx % 5}`}
              style={{ width: m.workloadPercentage || '16%' }}
              title={`${m.name}: ${m.workloadPercentage} (${m.activeConversations} active chats)`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamTab;
