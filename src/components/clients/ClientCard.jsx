import React from 'react';
import { Badge } from '../common/Badge.jsx';
import {
  ExternalLink,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
  Target,
  DollarSign,
  User,
  Share2,
} from 'lucide-react';

export function ClientCard({ client, onSelectClient }) {
  const statusVariant =
    client.status === 'Active'
      ? 'success'
      : client.status === 'Onboarding'
      ? 'info'
      : 'warning';

  return (
    <div className="client-portfolio-card">
      {/* Top Header */}
      <div className="client-card-header">
        <div className="client-brand-meta">
          <div className="client-avatar-monogram">
            {client.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <h3 className="client-brand-title">{client.name}</h3>
            <span className="client-industry-tag">{client.industry}</span>
          </div>
        </div>
        <Badge variant={statusVariant}>{client.status}</Badge>
      </div>

      {/* Contact Summary */}
      <div className="client-contact-snippet">
        <div className="contact-item">
          <User size={13} className="contact-icon" />
          <span>{client.contactPerson}</span>
        </div>
        <div className="contact-item">
          <Mail size={13} className="contact-icon" />
          <span className="truncate-text">{client.email}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="client-stats-compact-grid">
        <div className="stat-compact-box">
          <span className="stat-compact-label">Retainer Budget</span>
          <span className="stat-compact-val text-white">
            ${client.monthlyBudget?.toLocaleString()}/mo
          </span>
        </div>
        <div className="stat-compact-box">
          <span className="stat-compact-label">Avg ROAS</span>
          <span className="stat-compact-val text-gold">{client.roas}</span>
        </div>
        <div className="stat-compact-box">
          <span className="stat-compact-label">Total Leads</span>
          <span className="stat-compact-val text-emerald">
            {client.totalLeads?.toLocaleString()}
          </span>
        </div>
        <div className="stat-compact-box">
          <span className="stat-compact-label">Audience Reach</span>
          <span className="stat-compact-val text-cyan">{client.audienceSize}</span>
        </div>
      </div>

      {/* Connected Channels & Lead */}
      <div className="client-channels-lead-row">
        <div className="connected-channels-pill-list">
          {client.connectedPlatforms?.map((plat) => (
            <span key={plat} className="channel-mini-pill">
              {plat}
            </span>
          ))}
        </div>
        <span className="assigned-lead-tag">Lead: {client.assignedMember}</span>
      </div>

      {/* Footer Action */}
      <div className="client-card-footer-action">
        <button
          type="button"
          className="btn-open-client-profile"
          onClick={() => onSelectClient(client)}
        >
          <span>Open Client Workspace</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default ClientCard;
