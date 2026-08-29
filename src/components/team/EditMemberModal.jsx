import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Shield,
  Building,
  Key,
  CheckCircle2,
  Check,
  User,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function EditMemberModal({
  member,
  isOpen,
  onClose,
  initialTab = 'permissions', // 'profile' | 'permissions' | 'clients'
  onSaveMember,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    roleType: 'Creator',
    assignedClientIds: [],
    permissions: {},
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        jobTitle: member.jobTitle || '',
        roleType: member.roleType || 'Creator',
        assignedClientIds: member.assignedClientIds || [],
        permissions: { ...member.permissions },
      });
      setActiveTab(initialTab);
    }
  }, [member, initialTab]);

  if (!isOpen || !member) return null;

  const capabilities = [
    { key: 'contentCreate', label: 'Create & Draft Content', desc: 'Can write, schedule, and assemble posts in Content Hub' },
    { key: 'contentPublish', label: 'Direct Live Publishing', desc: 'Can publish posts immediately without approval' },
    { key: 'contentApprove', label: 'Sign-off & Approvals', desc: 'Can approve client deliverables and lock calendars' },
    { key: 'aiStudio', label: 'AI Studio & Copy Generation', desc: 'Full access to prompt workspace, recipes, and models' },
    { key: 'adsManage', label: 'Manage Paid Campaigns', desc: 'Can create, pause, and inspect Meta & Google ads' },
    { key: 'adsBudget', label: 'Scale Daily Ad Budgets', desc: 'Authority to adjust campaign spend and financial limits' },
    { key: 'analyticsView', label: 'View Cross-Channel Analytics', desc: 'Access to performance charts and demographics' },
    { key: 'analyticsExport', label: 'Generate Client PDF Reports', desc: 'Can export branded PDF audits and schedule deliveries' },
    { key: 'clientAdmin', label: 'Client Workspace Administration', desc: 'Can create clients and edit brand kits' },
    { key: 'teamAdmin', label: 'Team & Role Governance', desc: 'Can invite members and alter security matrix' },
  ];

  const handleTogglePermission = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleToggleClient = (clientId) => {
    const current = formData.assignedClientIds;
    if (current.includes(clientId)) {
      setFormData({
        ...formData,
        assignedClientIds: current.filter((id) => id !== clientId),
      });
    } else {
      setFormData({
        ...formData,
        assignedClientIds: [...current, clientId],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveMember(member.id, {
      name: formData.name,
      jobTitle: formData.jobTitle,
      phone: formData.phone,
      roleType: formData.roleType,
      role: `${formData.roleType} Specialist`,
      assignedClientIds: formData.assignedClientIds,
      assignedClientsCount: formData.assignedClientIds.length,
      permissions: formData.permissions,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card edit-member-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="modal-title">Configure Member: {member.name}</h3>
              <p className="modal-subtitle">{member.jobTitle} • {member.email}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-subtabs-strip">
          <button
            type="button"
            className={`subtab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            <Key size={14} />
            <span>Granular Permissions</span>
          </button>
          <button
            type="button"
            className={`subtab-btn ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Building size={14} />
            <span>Assigned Workspaces ({formData.assignedClientIds.length})</span>
          </button>
          <button
            type="button"
            className={`subtab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={14} />
            <span>Profile & Role</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="edit-member-form-body">
          {/* TAB 1: Granular Permissions */}
          {activeTab === 'permissions' && (
            <div className="permissions-toggle-list">
              <p className="tab-instructions-text">
                Customize specific capabilities for this user. Overrides default role permissions.
              </p>
              {capabilities.map((cap) => {
                const isEnabled = Boolean(formData.permissions[cap.key]);
                return (
                  <div
                    key={cap.key}
                    className={`perm-toggle-row ${isEnabled ? 'enabled' : ''}`}
                    onClick={() => handleTogglePermission(cap.key)}
                  >
                    <div className="perm-text-block">
                      <strong className="perm-label">{cap.label}</strong>
                      <span className="perm-desc">{cap.desc}</span>
                    </div>

                    <div className={`perm-switch-box ${isEnabled ? 'on' : 'off'}`}>
                      <div className="perm-switch-handle" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Assigned Clients */}
          {activeTab === 'clients' && (
            <div className="clients-assign-list">
              <p className="tab-instructions-text">
                Select which agency client workspaces this member has access to operate within.
              </p>
              <div className="clients-picker-grid">
                {mockClients.map((client) => {
                  const isChecked = formData.assignedClientIds.includes(client.id);
                  return (
                    <div
                      key={client.id}
                      className={`client-picker-card ${isChecked ? 'active' : ''}`}
                      onClick={() => handleToggleClient(client.id)}
                    >
                      <div className="client-pick-left">
                        <div className="client-check-circle">
                          {isChecked && <Check size={12} />}
                        </div>
                        <div>
                          <strong className="client-pick-name">{client.name}</strong>
                          <span className="client-pick-industry">{client.industry}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Profile & Role Tier */}
          {activeTab === 'profile' && (
            <div className="profile-edit-fields">
              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-text-input"
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="form-text-input"
                  />
                </div>
              </div>

              <div className="form-grid-two-col">
                <div className="form-field-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-text-input"
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label">Role Tier</label>
                  <select
                    value={formData.roleType}
                    onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                    className="form-select-input"
                  >
                    <option value="Admin">Admin (Full System Authority)</option>
                    <option value="Manager">Manager (Review & Sign-off)</option>
                    <option value="Analyst">Analyst (Paid Media & Reports)</option>
                    <option value="Creator">Creator (Content & AI Studio)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="modal-dialog-footer">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-saas-primary">
              <CheckCircle2 size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMemberModal;
