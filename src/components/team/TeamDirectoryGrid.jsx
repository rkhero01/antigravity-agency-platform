import React from 'react';
import { TeamMemberCard } from './TeamMemberCard.jsx';
import { Users, UserPlus } from 'lucide-react';

export function TeamDirectoryGrid({
  members,
  onEditMember,
  onDeleteMember,
  onOpenInviteModal,
}) {
  if (!members || members.length === 0) {
    return (
      <div className="team-empty-state-card">
        <div className="empty-state-icon">
          <Users size={36} />
        </div>
        <h3 className="team-empty-title">No team members match your filter</h3>
        <p className="team-empty-desc">
          No active seats found matching your criteria. Add new operators or reset filters.
        </p>
        <button
          type="button"
          className="btn-saas-primary"
          onClick={onOpenInviteModal}
        >
          <UserPlus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>
    );
  }

  return (
    <div className="team-members-grid">
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          onEditMember={onEditMember}
          onDeleteMember={onDeleteMember}
        />
      ))}
    </div>
  );
}

export default TeamDirectoryGrid;
