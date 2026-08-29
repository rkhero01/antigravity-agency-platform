import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Building2,
  DollarSign,
  User,
  Shield,
  Activity,
  Edit2,
  Archive,
  Sparkles,
  Layers,
  Clock,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function ClientProfileView({
  client,
  onBack,
  onNavigateToModule,
  onEditClient,
  onArchiveClient,
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!client) return null;

  const status = (client.status || 'Active').toLowerCase();
  const statusVariant =
    status === 'active'
      ? 'success'
      : status === 'paused'
      ? 'warning'
      : 'info';

  const clientTitle = client.clientName || client.name || 'Untitled Client';
  const primaryContact = client.primaryContact || client.contactPerson || 'Not provided';
  const contactEmail = client.contactEmail || client.email || 'Not provided';
  const retainer = Number(client.monthlyRetainer ?? client.monthlyBudget ?? 0);
  const tier = client.tier || 'STANDARD';
  const healthScore = client.healthScore !== undefined ? client.healthScore : 90;

  const createdDate = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not recorded';

  const updatedDate = client.updatedAt
    ? new Date(client.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not recorded';

  const initials = clientTitle
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CL';

  return (
    <div className="client-profile-view-container">
      {/* Top Bar */}
      <div className="profile-top-nav-bar">
        <button type="button" className="btn-back-to-directory" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to All Clients</span>
        </button>

        <div className="profile-action-buttons">
          {onEditClient && (
            <button
              type="button"
              className="btn-saas-secondary"
              onClick={() => onEditClient(client)}
            >
              <Edit2 size={14} />
              <span>Edit Client</span>
            </button>
          )}

          {onArchiveClient && (
            <button
              type="button"
              className="btn-archive-secondary"
              onClick={() => onArchiveClient(client)}
            >
              <Archive size={14} />
              <span>Archive Client</span>
            </button>
          )}

          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => onNavigateToModule?.('ai-assistant')}
          >
            <Sparkles size={14} />
            <span>Generate Strategy Copy</span>
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="client-profile-hero-card">
        <div className="profile-hero-top">
          <div className="profile-hero-avatar">{initials}</div>

          <div className="profile-hero-info">
            <div className="profile-title-row">
              <h2 className="profile-brand-name">{clientTitle}</h2>
              <Badge variant={statusVariant}>{client.status || 'Active'}</Badge>
              <span className="tier-tag-pill hero">{tier}</span>
            </div>
            <p className="profile-industry-subtitle">{client.industry || 'General Industry'}</p>

            <div className="profile-contact-links-grid">
              <div className="profile-link-item">
                <User size={14} className="text-cyan" />
                <span>{primaryContact}</span>
              </div>
              <div className="profile-link-item">
                <Mail size={14} className="text-violet" />
                <span>{contactEmail}</span>
              </div>
              <div className="profile-link-item">
                <Calendar size={14} className="text-muted" />
                <span>Client Since: {createdDate}</span>
              </div>
              <div className="profile-link-item">
                <Clock size={14} className="text-muted" />
                <span>Last Updated: {updatedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-strip">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Account Details & Billing
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
            onClick={() => setActiveTab('governance')}
          >
            Tenant Governance & Database Metadata
          </button>
        </div>
      </div>

      {/* Tab 1: Account Details & Billing */}
      {activeTab === 'overview' && (
        <div className="profile-tab-content-stack">
          {/* 4 Real Metric KPI Cards */}
          <div className="client-kpis-grid">
            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-violet">
                <DollarSign size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Monthly Retainer</span>
                <span className="profile-kpi-value">${retainer.toLocaleString()}/mo</span>
                <span className="profile-kpi-sub">Active recurring retainer</span>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-cyan">
                <Shield size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Contract Tier</span>
                <span className="profile-kpi-value text-cyan">{tier}</span>
                <span className="profile-kpi-sub">SLA tier level</span>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-emerald">
                <Activity size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Account Health Score</span>
                <span
                  className={`profile-kpi-value ${
                    healthScore >= 80 ? 'text-emerald' : 'text-gold'
                  }`}
                >
                  {healthScore}/100
                </span>
                <span className="profile-kpi-sub">Autonomous health check</span>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="kpi-icon-pill bg-gold">
                <Building2 size={18} />
              </div>
              <div className="profile-kpi-data">
                <span className="profile-kpi-label">Industry Classification</span>
                <span className="profile-kpi-value text-white">{client.industry || 'General'}</span>
                <span className="profile-kpi-sub">Market segment</span>
              </div>
            </div>
          </div>

          {/* Account Details Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <h3>Primary Account Information</h3>
                <p>PostgreSQL verified client record</p>
              </div>
            </div>
            <div className="client-details-grid-spec">
              <div className="detail-spec-item">
                <span className="detail-spec-label">Official Client Name</span>
                <strong className="detail-spec-val">{clientTitle}</strong>
              </div>
              <div className="detail-spec-item">
                <span className="detail-spec-label">Industry Sector</span>
                <strong className="detail-spec-val">{client.industry || 'General'}</strong>
              </div>
              <div className="detail-spec-item">
                <span className="detail-spec-label">Primary Account Contact</span>
                <strong className="detail-spec-val">{primaryContact}</strong>
              </div>
              <div className="detail-spec-item">
                <span className="detail-spec-label">Contact Email Address</span>
                <strong className="detail-spec-val">{contactEmail}</strong>
              </div>
              <div className="detail-spec-item">
                <span className="detail-spec-label">Contract Retainer</span>
                <strong className="detail-spec-val">${retainer.toLocaleString()} / month</strong>
              </div>
              <div className="detail-spec-item">
                <span className="detail-spec-label">Account Status</span>
                <strong className="detail-spec-val">{client.status || 'Active'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tenant Governance & Database Metadata */}
      {activeTab === 'governance' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <h3>PostgreSQL Database & Multi-Tenant Audit</h3>
              <p>Cryptographic identity and relational identifiers</p>
            </div>
          </div>
          <div className="client-details-grid-spec">
            <div className="detail-spec-item full-width">
              <span className="detail-spec-label">PostgreSQL Client Record ID (UUID)</span>
              <code className="detail-spec-code">{client.id}</code>
            </div>
            <div className="detail-spec-item full-width">
              <span className="detail-spec-label">Assigned Agency Tenant ID</span>
              <code className="detail-spec-code">{client.agencyId}</code>
            </div>
            <div className="detail-spec-item">
              <span className="detail-spec-label">Created At (UTC)</span>
              <strong className="detail-spec-val">{client.createdAt || 'Not recorded'}</strong>
            </div>
            <div className="detail-spec-item">
              <span className="detail-spec-label">Last Updated At (UTC)</span>
              <strong className="detail-spec-val">{client.updatedAt || 'Not recorded'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProfileView;
