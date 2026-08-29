import React from 'react';
import { Badge } from '../common/Badge.jsx';
import { ArrowUpRight, Edit2, Archive, Shield, Activity } from 'lucide-react';

export function ClientTable({
  clients,
  onSelectClient,
  onEditClient,
  onArchiveClient,
}) {
  return (
    <div className="client-table-container">
      <table className="saas-table client-data-table">
        <thead>
          <tr>
            <th>Client Name & Industry</th>
            <th>Primary Contact</th>
            <th>Monthly Retainer</th>
            <th>Tier</th>
            <th>Health Score</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
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
              <tr key={client.id} className="client-table-row">
                <td>
                  <div className="client-table-name-cell">
                    <div className="client-table-avatar">{initials}</div>
                    <div>
                      <strong className="client-name-bold">{clientTitle}</strong>
                      <div className="client-industry-sub">{client.industry || 'General'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="client-contact-cell">
                    <span>{primaryContact}</span>
                    <span className="contact-sub-email">{contactEmail}</span>
                  </div>
                </td>
                <td>
                  <strong className="text-white">
                    ${retainer.toLocaleString()}
                  </strong>
                  <span className="text-muted text-xs">/mo</span>
                </td>
                <td>
                  <span className="tier-tag-pill">{tier}</span>
                </td>
                <td>
                  <span
                    className={`health-score-cell ${
                      healthScore >= 80 ? 'text-emerald' : 'text-gold'
                    }`}
                  >
                    {healthScore}/100
                  </span>
                </td>
                <td>
                  <Badge variant={statusVariant} size="sm">
                    {client.status || 'Active'}
                  </Badge>
                </td>
                <td>
                  <div className="table-actions-group">
                    <button
                      type="button"
                      className="btn-table-action-icon"
                      onClick={() => onSelectClient(client)}
                      title="View Workspace Details"
                      aria-label="View Workspace Details"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                    {onEditClient && (
                      <button
                        type="button"
                        className="btn-table-action-icon edit"
                        onClick={() => onEditClient(client)}
                        title="Edit Client"
                        aria-label="Edit Client"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                    {onArchiveClient && (
                      <button
                        type="button"
                        className="btn-table-action-icon archive"
                        onClick={() => onArchiveClient(client)}
                        title="Archive Client"
                        aria-label="Archive Client"
                      >
                        <Archive size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ClientTable;
