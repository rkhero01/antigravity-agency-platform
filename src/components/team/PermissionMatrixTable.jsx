import React from 'react';
import { Shield, CheckCircle2, XCircle, Key, Lock } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { TEAM_ROLES, ROLE_DEFINITIONS } from '../../services/teamService.js';

export function PermissionMatrixTable({ members = [] }) {
  const rbacCapabilities = [
    {
      key: 'billing_governance',
      label: 'Agency Billing & Plan Governance',
      desc: 'Authority to modify subscription plans and agency settings.',
      allowedRoles: [TEAM_ROLES.OWNER],
    },
    {
      key: 'team_provisioning',
      label: 'Team & RBAC Provisioning',
      desc: 'Ability to onboard, update roles, and manage team member seats.',
      allowedRoles: [TEAM_ROLES.OWNER, TEAM_ROLES.ADMIN],
    },
    {
      key: 'client_admin',
      label: 'Client Portfolio Administration',
      desc: 'Can create, edit retainers, and soft-delete client accounts.',
      allowedRoles: [TEAM_ROLES.OWNER, TEAM_ROLES.ADMIN],
    },
    {
      key: 'action_approval',
      label: 'Autonomous AI Action Approvals',
      desc: 'Can review and approve P0/P1 high-impact AI marketing executions.',
      allowedRoles: [TEAM_ROLES.OWNER, TEAM_ROLES.ADMIN, TEAM_ROLES.MANAGER],
    },
    {
      key: 'campaign_ops',
      label: 'Campaign & Content Execution',
      desc: 'Can create, edit, and publish multi-channel campaigns.',
      allowedRoles: [
        TEAM_ROLES.OWNER,
        TEAM_ROLES.ADMIN,
        TEAM_ROLES.MANAGER,
        TEAM_ROLES.OPERATOR,
      ],
    },
    {
      key: 'analytics_export',
      label: 'Analytics & Performance Telemetry',
      desc: 'Full access to ROAS tracking, client health scores, and export.',
      allowedRoles: [
        TEAM_ROLES.OWNER,
        TEAM_ROLES.ADMIN,
        TEAM_ROLES.MANAGER,
        TEAM_ROLES.OPERATOR,
        TEAM_ROLES.ANALYST,
      ],
    },
    {
      key: 'read_only_access',
      label: 'Dashboard & Workspace Read Access',
      desc: 'Can view client records and campaign dashboards in read-only mode.',
      allowedRoles: [
        TEAM_ROLES.OWNER,
        TEAM_ROLES.ADMIN,
        TEAM_ROLES.MANAGER,
        TEAM_ROLES.OPERATOR,
        TEAM_ROLES.ANALYST,
        TEAM_ROLES.VIEWER,
      ],
    },
  ];

  const rolesInTable = [
    TEAM_ROLES.OWNER,
    TEAM_ROLES.ADMIN,
    TEAM_ROLES.MANAGER,
    TEAM_ROLES.OPERATOR,
    TEAM_ROLES.ANALYST,
    TEAM_ROLES.VIEWER,
  ];

  return (
    <div className="permission-matrix-card">
      <div className="matrix-header">
        <div className="matrix-title-block">
          <div className="matrix-badge">
            <Key size={14} />
            <span>Backend Enforced RBAC Matrix</span>
          </div>
          <h3>Role-Based Security & Permission Matrix</h3>
          <p>
            Cryptographically enforced by backend API tokens and multi-tenant middleware.
          </p>
        </div>
      </div>

      <div className="matrix-table-container">
        <table className="saas-table matrix-table">
          <thead>
            <tr>
              <th>System Module Capability</th>
              {rolesInTable.map((r) => (
                <th key={r} className="text-center">
                  <Badge variant={ROLE_DEFINITIONS[r]?.badgeVariant || 'primary'} size="sm">
                    {r}
                  </Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rbacCapabilities.map((cap) => (
              <tr key={cap.key}>
                <td>
                  <div className="capability-title-cell">
                    <strong className="cap-label">{cap.label}</strong>
                    <span className="cap-desc">{cap.desc}</span>
                  </div>
                </td>
                {rolesInTable.map((roleKey) => {
                  const isAllowed = cap.allowedRoles.includes(roleKey);
                  return (
                    <td key={roleKey} className="text-center">
                      {isAllowed ? (
                        <CheckCircle2 size={18} className="text-emerald inline-icon" />
                      ) : (
                        <XCircle size={18} className="text-muted inline-icon opacity-30" />
                      )}
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
