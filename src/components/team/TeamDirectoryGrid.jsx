import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard.jsx';

export function TeamDirectoryGrid({
  members = [],
  onEditPermissions,
  onAssignClients,
  onDeleteMember,
  onOpenInviteModal,
}) {
  if (members.length === 0) {
    return (
      <div className="team-empty-state-card">
        <Users size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No team members found</h4>
        <p className="empty-state-subtitle">Try adjusting your search query or role filter.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenInviteModal}
        >
          <UserPlus size={15} />
          <span>Invite New Member</span>
        </button>
      </div>
    );
  }

  return (
    <div className="team-directory-grid">
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          onEditPermissions={onEditPermissions}
          onAssignClients={onAssignClients}
          onDeleteMember={onDeleteMember}
        />
      ))}
    </div>
  );
}

export default TeamDirectoryGrid;
