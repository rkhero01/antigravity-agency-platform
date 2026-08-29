import React from 'react';
import { Badge } from '../common/Badge.jsx';
import {
  Mail,
  ArrowRight,
  User,
  Building2,
  Edit2,
  Archive,
  Shield,
  Activity,
  Calendar,
} from 'lucide-react';

export function ClientCard({
  client,
  onSelectClient,
  onEditClient,
  onArchiveClient,
}) {
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

  const initials = clientTitle
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CL';

  return (
    <div className="client-portfolio-card">
      {/* Top Header */}
      <div className="client-card-header">
        <div className="client-brand-meta">
          <div className="client-avatar-monogram">{initials}</div>
          <div className="client-title-block">
            <h3 className="client-brand-title">{clientTitle}</h3>
            <span className="client-industry-tag">{client.industry || 'General'}</span>
          </div>
        </div>
        <div className="client-card-badges">
          <Badge variant={statusVariant}>{client.status || 'Active'}</Badge>
        </div>
      </div>

      {/* Contact Summary */}
      <div className="client-contact-snippet">
        <div className="contact-item">
          <User size={13} className="contact-icon" />
          <span className="truncate-text">{primaryContact}</span>
        </div>
        <div className="contact-item">
          <Mail size={13} className="contact-icon" />
          <span className="truncate-text">{contactEmail}</span>
        </div>
      </div>

      {/* Real PostgreSQL Metrics Grid */}
      <div className="client-stats-compact-grid">
        <div className="stat-compact-box">
          <span className="stat-compact-label">Monthly Retainer</span>
          <span className="stat-compact-val text-white">
            ${retainer.toLocaleString()}/mo
          </span>
        </div>
        <div className="stat-compact-box">
          <span className="stat-compact-label">Contract Tier</span>
          <span className="stat-compact-val text-cyan">{tier}</span>
        </div>
        <div className="stat-compact-box">
          <span className="stat-compact-label">Health Score</span>
          <span
            className={`stat-compact-val ${
              healthScore >= 80 ? 'text-emerald' : 'text-gold'
            }`}
          >
            {healthScore}/100
          </span>
        </div>
        <div className="stat-compact-box">
          <span className="stat-compact-label">Workspace ID</span>
          <span className="stat-compact-val text-muted text-xs truncate-text" title={client.id}>
            {client.id?.substring(0, 10)}...
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="client-card-footer-action">
        <div className="client-card-subactions">
          {onEditClient && (
            <button
              type="button"
              className="btn-card-icon-action"
              onClick={(e) => {
                e.stopPropagation();
                onEditClient(client);
              }}
              title="Edit Client"
              aria-label="Edit Client"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onArchiveClient && (
            <button
              type="button"
              className="btn-card-icon-action archive"
              onClick={(e) => {
                e.stopPropagation();
                onArchiveClient(client);
              }}
              title="Archive Client"
              aria-label="Archive Client"
            >
              <Archive size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-open-client-profile"
          onClick={() => onSelectClient(client)}
        >
          <span>Open Workspace</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default ClientCard;
