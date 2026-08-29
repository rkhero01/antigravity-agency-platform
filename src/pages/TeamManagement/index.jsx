import React, { useState, useEffect, useMemo } from 'react';
import {
  TeamHeader,
  TeamKpiCards,
  TeamDirectoryGrid,
  PermissionMatrixTable,
  InviteMemberModal,
  EditMemberModal,
} from '../../components/team/index.js';
import { teamService } from '../../services/teamService.js';
import { Users, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export function TeamManagementPage({ onNavigate }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('directory'); // 'directory' | 'matrix'
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
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

  const loadTeamData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const teamList = await teamService.getTeamMembers();
      setMembers(teamList);
    } catch (err) {
      console.error('Failed to load team data from PostgreSQL:', err);
      setError(
        err.message ||
          'Unable to connect to database or retrieve team members. Please verify connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesRole =
        selectedRole === 'all'
          ? true
          : (m.role || '').toLowerCase() === selectedRole.toLowerCase();

      const status = (m.status || '').toLowerCase().replace(' ', '_');
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : status === selectedStatus.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.role || '').toLowerCase().includes(q) ||
        (m.department || '').toLowerCase().includes(q);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [members, selectedRole, selectedStatus, searchQuery]);

  // Dynamic KPI Metrics
  const calculatedMetrics = useMemo(() => {
    return teamService.calculateTeamMetrics(members);
  }, [members]);

  // Handlers
  const handleInviteMember = async (memberData) => {
    await teamService.addMember(memberData);
    await loadTeamData(true);
    showToast(`🎉 Successfully onboarded ${memberData.name} as ${memberData.role}!`);
  };

  const handleSaveMember = async (id, updatedFields) => {
    const updated = await teamService.updateMember(id, updatedFields);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    showToast(`Updated profile and role for ${updated.name}`);
  };

  const handleDeleteMember = async (id) => {
    const target = members.find((m) => m.id === id);
    const confirmDelete = window.confirm(
      `Are you sure you want to remove team member "${target?.name || 'this operator'}"? The record will be soft-deleted in PostgreSQL.`
    );
    if (!confirmDelete) return;

    try {
      await teamService.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      showToast('Team member removed from agency workspace');
    } catch (err) {
      console.error('Failed to remove team member:', err);
      alert(err.message || 'Failed to remove team member.');
    }
  };

  return (
    <div className="team-management-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification" role="status">
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
        onRefresh={() => loadTeamData(true)}
        isRefreshing={isRefreshing}
      />

      {/* 6 Top KPI Metrics */}
      <TeamKpiCards metrics={calculatedMetrics} />

      {/* Main Content: Loading, Error, Empty, or Data Grid/Matrix */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">Loading team members from PostgreSQL database...</p>
          <span className="clients-state-sub">Fetching live agency operator directory</span>
        </div>
      ) : error ? (
        <div className="clients-state-box error" role="alert">
          <div className="state-icon-badge error">
            <AlertCircle size={28} />
          </div>
          <h3 className="clients-state-title">Database Connection Error</h3>
          <p className="clients-state-desc">{error}</p>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => loadTeamData(false)}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : viewMode === 'directory' ? (
        <TeamDirectoryGrid
          members={filteredMembers}
          onEditMember={(member) => setEditingMember(member)}
          onDeleteMember={handleDeleteMember}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />
      ) : (
        <PermissionMatrixTable members={filteredMembers} />
      )}

      {/* Invite / Add Team Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteMember={handleInviteMember}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        onSaveMember={handleSaveMember}
      />
    </div>
  );
}

export default TeamManagementPage;
