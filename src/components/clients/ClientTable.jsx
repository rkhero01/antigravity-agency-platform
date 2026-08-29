import React from 'react';
import { Badge } from '../common/Badge.jsx';
import { ArrowUpRight, Mail, Phone, ExternalLink } from 'lucide-react';

export function ClientTable({ clients, onSelectClient }) {
  return (
    <div className="client-table-container">
      <table className="saas-table client-data-table">
        <thead>
          <tr>
            <th>Client Name & Industry</th>
            <th>Primary Contact</th>
            <th>Monthly Budget</th>
            <th>Avg ROAS</th>
            <th>Connected Platforms</th>
            <th>Assigned Lead</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const statusVariant =
              client.status === 'Active'
                ? 'success'
                : client.status === 'Onboarding'
                ? 'info'
                : 'warning';

            return (
              <tr key={client.id} className="client-table-row">
                <td>
                  <div className="client-table-name-cell">
                    <div className="client-table-avatar">
                      {client.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <strong className="client-name-bold">{client.name}</strong>
                      <div className="client-industry-sub">{client.industry}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="client-contact-cell">
                    <span>{client.contactPerson}</span>
                    <span className="contact-sub-email">{client.email}</span>
                  </div>
                </td>
                <td>
                  <strong className="text-white">
                    ${client.monthlyBudget?.toLocaleString()}
                  </strong>
                  <span className="text-muted text-xs">/mo</span>
                </td>
                <td>
                  <span className="roas-highlight">{client.roas}</span>
                </td>
                <td>
                  <div className="table-platforms-list">
                    {client.connectedPlatforms?.map((p) => (
                      <span key={p} className="channel-mini-pill">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="assigned-text">{client.assignedMember}</span>
                </td>
                <td>
                  <Badge variant={statusVariant} size="sm">
                    {client.status}
                  </Badge>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-table-action"
                    onClick={() => onSelectClient(client)}
                  >
                    <span>View</span>
                    <ArrowUpRight size={13} />
                  </button>
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
