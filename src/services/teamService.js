/**
 * Production Team Management Service Layer
 * Task 3: Real Database-Connected Team Members & Roles Management
 */

import { apiClient } from './api/apiClient.js';

export const TEAM_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER',
};

export const ROLE_DEFINITIONS = {
  OWNER: {
    title: 'Agency Owner',
    description: 'Full agency governance, billing, client portfolios, security matrix, and team administration.',
    badgeVariant: 'danger',
    color: '#ef4444',
  },
  ADMIN: {
    title: 'Agency Admin',
    description: 'Operational management, client provisioning, and team member management.',
    badgeVariant: 'danger',
    color: '#f97316',
  },
  MANAGER: {
    title: 'Campaign & Client Manager',
    description: 'Can manage client deliverables, approve copy, and supervise operations.',
    badgeVariant: 'warning',
    color: '#f59e0b',
  },
  OPERATOR: {
    title: 'Marketing Operator',
    description: 'Handles CRM, messaging funnels, and automated campaign workflows.',
    badgeVariant: 'primary',
    color: '#6366f1',
  },
  ANALYST: {
    title: 'Performance Analyst',
    description: 'Inspects performance analytics, AI intelligence metrics, and ROAS reports.',
    badgeVariant: 'cyan',
    color: '#06b6d4',
  },
  VIEWER: {
    title: 'Read-Only Viewer',
    description: 'Read-only access to agency dashboard and client metrics.',
    badgeVariant: 'info',
    color: '#64748b',
  },
};

/**
 * Normalizes PostgreSQL team member record from backend into rich UI model
 */
export function normalizeTeamMember(dbRecord) {
  if (!dbRecord) return null;

  const rawRole = (dbRecord.role || 'OPERATOR').toUpperCase();
  const validRole = Object.values(TEAM_ROLES).includes(rawRole)
    ? rawRole
    : 'OPERATOR';

  const rawStatus = (dbRecord.status || 'ACTIVE').toUpperCase();
  const status =
    rawStatus === 'ACTIVE'
      ? 'Active'
      : rawStatus === 'ON_LEAVE'
      ? 'On Leave'
      : rawStatus === 'INACTIVE'
      ? 'Inactive'
      : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

  const name = dbRecord.name || 'Team Member';
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TM';

  const roleMeta = ROLE_DEFINITIONS[validRole] || ROLE_DEFINITIONS.OPERATOR;

  return {
    id: dbRecord.id,
    agencyId: dbRecord.agencyId,
    name,
    email: dbRecord.email || '',
    role: validRole,
    roleTitle: roleMeta.title,
    roleDescription: roleMeta.description,
    badgeVariant: roleMeta.badgeVariant,
    department: dbRecord.department || 'General Operations',
    shiftHours: dbRecord.shiftHours || '09:00 - 18:00',
    status,
    statusRaw: rawStatus,
    avatar: initials,
    createdAt: dbRecord.createdAt,
    updatedAt: dbRecord.updatedAt,
  };
}

/**
 * Maps frontend UI form payload into backend PostgreSQL schema
 */
export function toDbPayload(formData = {}, isPartial = false) {
  const payload = {};

  if (formData.name !== undefined) {
    payload.name = String(formData.name).trim();
  } else if (!isPartial) {
    payload.name = '';
  }

  if (formData.email !== undefined) {
    payload.email = String(formData.email).trim().toLowerCase();
  } else if (!isPartial) {
    payload.email = '';
  }

  if (formData.role !== undefined) {
    const rawRole = String(formData.role).toUpperCase();
    payload.role = Object.values(TEAM_ROLES).includes(rawRole)
      ? rawRole
      : 'OPERATOR';
  } else if (!isPartial) {
    payload.role = 'OPERATOR';
  }

  if (formData.department !== undefined) {
    payload.department = String(formData.department).trim();
  } else if (!isPartial) {
    payload.department = 'General Operations';
  }

  if (formData.shiftHours !== undefined) {
    payload.shiftHours = String(formData.shiftHours).trim();
  } else if (!isPartial) {
    payload.shiftHours = '09:00 - 18:00';
  }

  if (formData.status !== undefined) {
    const rawStatus = String(formData.status).toUpperCase();
    payload.status = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'].includes(rawStatus)
      ? rawStatus
      : 'ACTIVE';
  } else if (!isPartial) {
    payload.status = 'ACTIVE';
  }

  return payload;
}

export const teamService = {
  /**
   * Fetch all team members from live PostgreSQL database
   */
  async getTeamMembers(filters = {}) {
    const response = await apiClient.team.list(filters);
    const rawList = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.members)
      ? response.data.members
      : [];

    return rawList.map(normalizeTeamMember);
  },

  /**
   * Add / create a new team member in live PostgreSQL database
   */
  async addMember(memberData) {
    const payload = toDbPayload(memberData);
    const response = await apiClient.team.create(payload);
    const rawMember = response.data?.member || response.data;
    return normalizeTeamMember(rawMember);
  },

  /**
   * Alias for addMember (compatible with existing invite calls)
   */
  async inviteMember(memberData) {
    return this.addMember(memberData);
  },

  /**
   * Update an existing team member in live PostgreSQL database
   */
  async updateMember(id, updates) {
    if (!id) throw new Error('Member ID is required');
    const payload = toDbPayload(updates, true);
    const response = await apiClient.team.update(id, payload);
    const rawMember = response.data?.member || response.data;
    return normalizeTeamMember(rawMember);
  },

  /**
   * Soft-delete / remove team member from live PostgreSQL database
   */
  async deleteMember(id) {
    if (!id) throw new Error('Member ID is required');
    const response = await apiClient.team.delete(id);
    return response.data;
  },

  /**
   * Calculate summary KPI metrics from real team list
   */
  calculateTeamMetrics(membersList = []) {
    const total = membersList.length;
    const ownerCount = membersList.filter((m) => m.role === 'OWNER').length;
    const adminCount = membersList.filter((m) => m.role === 'ADMIN').length;
    const managerCount = membersList.filter((m) => m.role === 'MANAGER').length;
    const operatorCount = membersList.filter((m) => m.role === 'OPERATOR').length;
    const analystCount = membersList.filter((m) => m.role === 'ANALYST').length;
    const viewerCount = membersList.filter((m) => m.role === 'VIEWER').length;
    const activeCount = membersList.filter((m) => (m.status || '').toLowerCase() === 'active').length;
    const onLeaveCount = membersList.filter((m) => (m.status || '').toLowerCase() === 'on leave').length;

    return {
      total,
      ownerCount,
      adminCount,
      managerCount,
      operatorCount,
      analystCount,
      viewerCount,
      activeCount,
      onLeaveCount,
    };
  },
};

export default teamService;
