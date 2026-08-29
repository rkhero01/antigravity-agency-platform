import React, { useState, useEffect, useMemo } from 'react';
import {
  TeamHeader,
  TeamKpiCards,
  TeamDirectoryGrid,
  PermissionMatrixTable,
  TeamActivityLog,
  InviteMemberModal,
  EditMemberModal,
} from '../../components/team/index.js';
import { teamService } from '../../services/teamService.js';
import { CheckCircle2 } from 'lucide-react';

export function TeamManagementPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('directory'); // 'directory' | 'matrix' | 'logs'
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingTab, setEditingTab] = useState('permissions');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadTeamData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadTeamData = async () => {
    setLoading(true);
    const [teamList, activityList] = await Promise.all([
      teamService.getTeamMembers(),
      teamService.getTeamActivityLogs(),
    ]);
    setMembers(teamList);
    setLogs(activityList);
    setLoading(false);
  };

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesRole =
        selectedRole === 'all'
          ? true
          : m.roleType.toLowerCase() === selectedRole.toLowerCase();
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : m.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [members, selectedRole, selectedStatus, searchQuery]);

  // Dynamic KPI Metrics
  const calculatedMetrics = useMemo(() => {
    return teamService.calculateTeamMetrics(filteredMembers);
  }, [filteredMembers]);

  // Handlers
  const handleInviteMember = async (memberData) => {
    const newMember = await teamService.inviteMember(memberData);
    setMembers((prev) => [newMember, ...prev]);
    const updatedLogs = await teamService.getTeamActivityLogs();
    setLogs(updatedLogs);
    showToast(`🎉 Invited ${newMember.name} as ${newMember.role}!`);
  };

  const handleSaveMember = async (id, updatedFields) => {
    const updated = await teamService.updateMember(id, updatedFields);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    showToast(`Updated profile and permissions for ${updated.name}`);
  };

  const handleTogglePermission = async (memberId, permKey, newValue) => {
    const updated = await teamService.updateMemberPermissions(memberId, {
      [permKey]: newValue,
    });
    setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    showToast(`Updated capability for ${updated.name}`);
  };

  const handleDeleteMember = async (id) => {
    await teamService.deleteMember(id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Member removed from agency workspace');
  };

  const handleOpenEditModal = (member, tab = 'permissions') => {
    setEditingMember(member);
    setEditingTab(tab);
  };

  return (
    <div className="team-management-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <TeamHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
      />

      {/* 6 Top KPI Metrics */}
      <TeamKpiCards metrics={calculatedMetrics} />

      {/* Main Content Area */}
      {viewMode === 'directory' && (
        <TeamDirectoryGrid
          members={filteredMembers}
          onEditPermissions={(member) => handleOpenEditModal(member, 'permissions')}
          onAssignClients={(member) => handleOpenEditModal(member, 'clients')}
          onDeleteMember={handleDeleteMember}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />
      )}

      {viewMode === 'matrix' && (
        <PermissionMatrixTable
          members={filteredMembers}
          onTogglePermission={handleTogglePermission}
        />
      )}

      {viewMode === 'logs' && <TeamActivityLog logs={logs} />}

      {/* Invite Team Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteMember={handleInviteMember}
      />

      {/* Edit Member & Permissions Modal */}
      <EditMemberModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        initialTab={editingTab}
        onClose={() => setEditingMember(null)}
        onSaveMember={handleSaveMember}
      />
    </div>
  );
}

export default TeamManagementPage;
