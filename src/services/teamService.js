import { initialMockTeam, mockTeamActivityLog } from '../data/mockTeam.js';

let teamState = [...initialMockTeam];
let activityLogsState = [...mockTeamActivityLog];

export const teamService = {
  /**
   * Fetch all team members with optional filters
   */
  async getTeamMembers(filters = {}) {
    const { roleType, status, search } = filters;

    let filtered = [...teamState];

    if (roleType && roleType !== 'all') {
      filtered = filtered.filter(
        (m) => m.roleType.toLowerCase() === roleType.toLowerCase()
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(
        (m) => m.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.jobTitle.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  },

  /**
   * Get single member by ID
   */
  async getTeamMemberById(id) {
    const member = teamState.find((m) => m.id === id);
    return Promise.resolve(member || null);
  },

  /**
   * Invite / Add new team member
   */
  async inviteMember(memberData) {
    const initials = memberData.name
      ? memberData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'TM';

    const defaultPermissions = {
      Admin: {
        contentCreate: true,
        contentPublish: true,
        contentApprove: true,
        aiStudio: true,
        adsManage: true,
        adsBudget: true,
        analyticsView: true,
        analyticsExport: true,
        clientAdmin: true,
        teamAdmin: true,
      },
      Manager: {
        contentCreate: true,
        contentPublish: true,
        contentApprove: true,
        aiStudio: true,
        adsManage: true,
        adsBudget: false,
        analyticsView: true,
        analyticsExport: true,
        clientAdmin: false,
        teamAdmin: false,
      },
      Creator: {
        contentCreate: true,
        contentPublish: false,
        contentApprove: false,
        aiStudio: true,
        adsManage: false,
        adsBudget: false,
        analyticsView: true,
        analyticsExport: false,
        clientAdmin: false,
        teamAdmin: false,
      },
      Analyst: {
        contentCreate: false,
        contentPublish: false,
        contentApprove: false,
        aiStudio: false,
        adsManage: true,
        adsBudget: true,
        analyticsView: true,
        analyticsExport: true,
        clientAdmin: false,
        teamAdmin: false,
      },
    };

    const role = memberData.roleType || 'Creator';

    const newMember = {
      id: `team-${Date.now()}`,
      name: memberData.name,
      role: memberData.role || `${role} Specialist`,
      roleType: role,
      jobTitle: memberData.jobTitle || `${role} Specialist`,
      email: memberData.email,
      phone: memberData.phone || '+1 (512) 555-0199',
      avatar: initials,
      avatarGradient: 'linear-gradient(135deg, #6366f1, #3b82f6)',
      assignedClientIds: memberData.assignedClientIds || ['c1'],
      assignedClientsCount: (memberData.assignedClientIds || ['c1']).length,
      status: 'Active',
      lastActive: 'Just invited',
      permissions: defaultPermissions[role] || defaultPermissions.Creator,
    };

    teamState = [newMember, ...teamState];

    // Append log
    activityLogsState = [
      {
        id: `act-${Date.now()}`,
        user: 'Admin',
        avatar: 'AD',
        action: `Invited new member ${newMember.name} as ${newMember.role}`,
        category: 'Access Control',
        time: 'Just now',
        client: 'Agency Workspace',
      },
      ...activityLogsState,
    ];

    return Promise.resolve(newMember);
  },

  /**
   * Update member details
   */
  async updateMember(id, updatedFields) {
    teamState = teamState.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
    const updated = teamState.find((m) => m.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Update granular permissions for a member
   */
  async updateMemberPermissions(id, permissions) {
    teamState = teamState.map((m) =>
      m.id === id ? { ...m, permissions: { ...m.permissions, ...permissions } } : m
    );
    const updated = teamState.find((m) => m.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Update assigned clients for a member
   */
  async updateMemberClients(id, clientIds) {
    teamState = teamState.map((m) =>
      m.id === id
        ? {
            ...m,
            assignedClientIds: clientIds,
            assignedClientsCount: clientIds.length,
          }
        : m
    );
    const updated = teamState.find((m) => m.id === id);
    return Promise.resolve(updated);
  },

  /**
   * Delete team member
   */
  async deleteMember(id) {
    teamState = teamState.filter((m) => m.id !== id);
    return Promise.resolve(true);
  },

  /**
   * Fetch activity audit logs
   */
  async getTeamActivityLogs() {
    return Promise.resolve([...activityLogsState]);
  },

  /**
   * Calculate summary KPI stats
   */
  calculateTeamMetrics(membersList) {
    const total = membersList.length;
    const adminCount = membersList.filter((m) => m.roleType === 'Admin').length;
    const managerCount = membersList.filter((m) => m.roleType === 'Manager').length;
    const creatorCount = membersList.filter((m) => m.roleType === 'Creator').length;
    const analystCount = membersList.filter((m) => m.roleType === 'Analyst').length;
    const activeCount = membersList.filter((m) => m.status === 'Active').length;

    return {
      total,
      adminCount,
      managerCount,
      creatorCount,
      analystCount,
      activeCount,
    };
  },
};

export default teamService;
