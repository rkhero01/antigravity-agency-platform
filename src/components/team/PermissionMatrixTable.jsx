import React from 'react';
import { Shield, Check, X, Info } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function PermissionMatrixTable({
  members = [],
  onTogglePermission,
}) {
  const capabilities = [
    { key: 'contentCreate', label: 'Draft Content', module: 'Content' },
    { key: 'contentPublish', label: 'Publish Live', module: 'Content' },
    { key: 'contentApprove', label: 'Approve Sign-offs', module: 'Content' },
    { key: 'aiStudio', label: 'AI Studio & Models', module: 'AI Tools' },
    { key: 'adsManage', label: 'Manage Ads', module: 'Paid Ads' },
    { key: 'adsBudget', label: 'Scale Budgets', module: 'Paid Ads' },
    { key: 'analyticsView', label: 'View Analytics', module: 'Reports' },
    { key: 'analyticsExport', label: 'Export PDFs', module: 'Reports' },
    { key: 'clientAdmin', label: 'Client Admin', module: 'Admin' },
    { key: 'teamAdmin', label: 'Team Admin', module: 'Admin' },
  ];

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

  return (
    <div className="permission-matrix-card">
      <div className="matrix-header-strip">
        <div className="matrix-title-group">
          <Shield size={16} className="text-primary" />
          <h3 className="matrix-main-title">Granular Role-Based Access Control Matrix</h3>
        </div>
        <div className="matrix-legend-row">
          <span className="legend-badge-item">
            <span className="perm-toggle-icon active"><Check size={11} /></span> Authorized
          </span>
          <span className="legend-badge-item">
            <span className="perm-toggle-icon inactive"><X size={11} /></span> Restricted
          </span>
        </div>
      </div>

      <div className="matrix-table-wrapper">
        <table className="saas-table permission-table">
          <thead>
            <tr>
              <th className="sticky-col">Team Member</th>
              <th>Role Tier</th>
              {capabilities.map((cap) => (
                <th key={cap.key} className="cap-col-header" title={`${cap.module}: ${cap.label}`}>
                  <span className="cap-module-tag">{cap.module}</span>
                  <span className="cap-name-text">{cap.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="matrix-member-row">
                {/* Member Info Sticky Column */}
                <td className="sticky-col">
                  <div className="member-name-avatar-row">
                    <span
                      className="matrix-avatar-mini"
                      style={{ background: member.avatarGradient || '#6366f1' }}
                    >
                      {member.avatar}
                    </span>
                    <div>
                      <strong className="member-name-text">{member.name}</strong>
                      <span className="member-email-sub">{member.email}</span>
                    </div>
                  </div>
                </td>

                {/* Role Tier */}
                <td>
                  <Badge variant={getRoleVariant(member.roleType)} size="sm">
                    {member.roleType}
                  </Badge>
                </td>

                {/* Capability Toggle Cells */}
                {capabilities.map((cap) => {
                  const isAuthorized = Boolean(member.permissions?.[cap.key]);
                  const isAdminUser = member.roleType === 'Admin';

                  return (
                    <td key={cap.key} className="text-center">
                      <button
                        type="button"
                        className={`btn-perm-toggle ${isAuthorized ? 'active' : 'inactive'}`}
                        disabled={isAdminUser && cap.key === 'teamAdmin'} // Superuser protection
                        onClick={() =>
                          onTogglePermission(member.id, cap.key, !isAuthorized)
                        }
                        title={`Click to ${isAuthorized ? 'revoke' : 'grant'} ${cap.label} for ${member.name}`}
                      >
                        {isAuthorized ? <Check size={13} /> : <X size={13} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PermissionMatrixTable;
