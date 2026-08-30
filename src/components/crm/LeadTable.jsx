import React from 'react';
import {
  Building,
  Target,
  DollarSign,
  User,
  Phone,
  Mail,
  Trash2,
  Edit2,
  Eye,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function LeadTable({
  leads = [],
  onInspectLead,
  onEditLead,
  onDeleteLead,
  onStatusChange,
}) {
  return (
    <div className="social-table-card">
      <div className="social-table-responsive">
        <table className="saas-table social-audit-table">
          <thead>
            <tr>
              <th>Lead & Company</th>
              <th>Client Workspace</th>
              <th>Stage / Status</th>
              <th>Deal Value</th>
              <th>Source / Campaign</th>
              <th>Lead Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="social-row-item">
                  {/* Lead & Company */}
                  <td>
                    <div className="table-platform-cell">
                      <div>
                        <strong
                          className="table-handle-link clickable"
                          onClick={() => onInspectLead(lead)}
                        >
                          {lead.name}
                        </strong>
                        <span className="table-account-name">
                          {lead.company || 'Private Contact'} &bull; {lead.email || lead.phone || 'No email'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Client Workspace */}
                  <td>
                    <span className="table-client-name">
                      <Building size={12} className="inline-icon" /> {lead.clientName || 'Assigned Client'}
                    </span>
                  </td>

                  {/* Stage / Status */}
                  <td>
                    <select
                      value={lead.stage}
                      onChange={(e) => onStatusChange && onStatusChange(lead.id, e.target.value)}
                      className="team-filter-select text-xs py-1 px-2"
                      style={{ maxWidth: '170px' }}
                      aria-label="Change Lead Stage"
                    >
                      <option value="NEW">New Lead</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUALIFIED">Qualified (SQL)</option>
                      <option value="PROPOSAL_SENT">Proposal Sent</option>
                      <option value="WON">Closed Won</option>
                      <option value="LOST">Closed Lost</option>
                    </select>
                  </td>

                  {/* Deal Value */}
                  <td>
                    <strong className="text-emerald">
                      ${(lead.value || 0).toLocaleString()}
                    </strong>
                  </td>

                  {/* Source */}
                  <td>
                    <span className="platform-tag-pill">{lead.source}</span>
                    {lead.campaignName && (
                      <span className="text-xs text-muted block mt-1">
                        🎯 {lead.campaignName}
                      </span>
                    )}
                  </td>

                  {/* Owner */}
                  <td>
                    <span className="table-client-name">
                      <User size={12} className="inline-icon" /> {lead.owner || 'Unassigned'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onInspectLead(lead)}
                        title="Inspect Lead Details"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onEditLead ? onEditLead(lead) : onInspectLead(lead)}
                        title="Edit Lead"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-table-action danger"
                        onClick={() => onDeleteLead(lead.id)}
                        title="Archive Lead"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadTable;
