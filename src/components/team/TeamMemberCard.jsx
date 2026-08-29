import React from 'react';
import {
  Shield,
  Mail,
  Phone,
  Building,
  Key,
  Clock,
  Trash2,
  Settings,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { mockClients } from '../../data/mockClients.js';

export function TeamMemberCard({
  member,
  onEditPermissions,
  onAssignClients,
  onDeleteMember,
}) {
  const getRoleVariant = (roleType) => {
    switch (roleType) {
      case 'Admin':
        return 'danger';
      case 'Manager':
        return 'warning';
      case 'Analyst':
        return 'cyan';
      default:
        return 'primary';
    }
  };

  const assignedClientNames = (member.assignedClientIds || [])
    .map((cid) => mockClients.find((c) => c.id === cid)?.name)
    .filter(Boolean);

  const totalPermissions = Object.keys(member.permissions || {}).length;
  const activePermissions = Object.values(member.permissions || {}).filter(Boolean).length;

  return (
    <div className="team-member-card">
      {/* Top Profile Header */}
      <div className="team-card-header">
        <div className="team-avatar-wrapper">
          <div
            className="team-avatar-circle"
            style={{ background: member.avatarGradient || 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          >
            {member.avatar}
          </div>
          <span className="online-indicator-dot" title="Online now" />
        </div>

        <div className="team-info-column">
          <div className="team-name-row">
            <h4 className="team-member-name">{member.name}</h4>
            <Badge variant={getRoleVariant(member.roleType)} size="sm">
              {member.roleType}
            </Badge>
          </div>
          <span className="team-job-title">{member.jobTitle}</span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="team-contact-list">
        <div className="team-contact-item">
          <Mail size={13} className="text-muted" />
          <span className="contact-text">{member.email}</span>
        </div>
        {member.phone && (
          <div className="team-contact-item">
            <Phone size={13} className="text-muted" />
            <span className="contact-text">{member.phone}</span>
          </div>
        )}
      </div>

      {/* Assigned Client Workspaces */}
      <div className="team-assigned-clients-section">
        <div className="section-label-row">
          <span className="section-label">
            <Building size={12} className="inline-icon" /> Assigned Workspaces ({assignedClientNames.length})
          </span>
          <button
            type="button"
            className="btn-text-link"
            onClick={() => onAssignClients(member)}
          >
            Manage
          </button>
        </div>

        <div className="client-tags-cloud">
          {assignedClientNames.length === 0 ? (
            <span className="no-clients-tag">No clients assigned</span>
          ) : (
            assignedClientNames.slice(0, 3).map((cname) => (
              <span key={cname} className="client-pill-tag">
                {cname}
              </span>
            ))
          )}
          {assignedClientNames.length > 3 && (
            <span className="client-pill-tag more">
              +{assignedClientNames.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Permissions Summary & Activity */}
      <div className="team-card-meta-bar">
        <div className="meta-perm-badge">
          <Key size={12} />
          <span>{activePermissions}/{totalPermissions} Module Capabilities</span>
        </div>
        <span className="meta-active-time">
          <Clock size={11} /> {member.lastActive}
        </span>
      </div>

      {/* Card Action Buttons */}
      <div className="team-card-actions-row">
        <button
          type="button"
          className="btn-team-secondary"
          onClick={() => onEditPermissions(member)}
        >
          <Settings size={13} />
          <span>Permissions</span>
        </button>

        <button
          type="button"
          className="btn-team-secondary"
          onClick={() => onAssignClients(member)}
        >
          <Building size={13} />
          <span>Clients</span>
        </button>

        {member.roleType !== 'Admin' && (
          <button
            type="button"
            className="btn-delete-member"
            onClick={() => onDeleteMember(member.id)}
            title="Remove Member"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default TeamMemberCard;
