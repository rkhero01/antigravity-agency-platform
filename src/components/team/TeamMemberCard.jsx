import React from 'react';
import {
  Shield,
  Mail,
  Clock,
  Trash2,
  Edit2,
  Building,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function TeamMemberCard({
  member,
  onEditMember,
  onDeleteMember,
}) {
  const status = (member.status || 'Active').toLowerCase();
  const statusVariant =
    status === 'active'
      ? 'success'
      : status === 'on leave'
      ? 'warning'
      : 'info';

  const roleVariant = member.badgeVariant || 'primary';

  const createdDate = member.createdAt
    ? new Date(member.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not recorded';

  return (
    <div className="team-member-card">
      {/* Top Profile Header */}
      <div className="team-card-header">
        <div className="team-avatar-wrapper">
          <div className="team-avatar-circle">{member.avatar}</div>
          <span
            className={`online-indicator-dot ${status === 'active' ? 'active' : ''}`}
            title={member.status}
          />
        </div>

        <div className="team-info-column">
          <div className="team-name-row">
            <h4 className="team-member-name">{member.name}</h4>
            <Badge variant={roleVariant} size="sm">
              {member.role}
            </Badge>
          </div>
          <span className="team-job-title">{member.roleTitle || member.role}</span>
        </div>
      </div>

      {/* Contact & Department */}
      <div className="team-contact-list">
        <div className="team-contact-item">
          <Mail size={13} className="text-muted" />
          <span className="contact-text truncate-text">{member.email}</span>
        </div>
        <div className="team-contact-item">
          <Briefcase size={13} className="text-cyan" />
          <span className="contact-text truncate-text">{member.department || 'General Operations'}</span>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="team-card-meta-bar">
        <div className="meta-perm-badge">
          <Clock size={12} className="text-muted" />
          <span>Shift: {member.shiftHours || '09:00 - 18:00'}</span>
        </div>
        <Badge variant={statusVariant} size="sm">
          {member.status || 'Active'}
        </Badge>
      </div>

      {/* Card Action Buttons */}
      <div className="team-card-actions-row">
        <button
          type="button"
          className="btn-team-secondary"
          onClick={() => onEditMember(member)}
        >
          <Edit2 size={13} />
          <span>Edit Profile & Role</span>
        </button>

        {member.role !== 'OWNER' && (
          <button
            type="button"
            className="btn-delete-member"
            onClick={() => onDeleteMember(member.id)}
            title="Remove Team Member"
            aria-label="Remove Team Member"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default TeamMemberCard;
