import React from 'react';
import {
  Rocket,
  Building,
  Target,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function CampaignsTable({
  campaigns = [],
  onInspect,
  onEdit,
  onArchive,
}) {
  return (
    <div className="social-table-card">
      <div className="social-table-responsive">
        <table className="saas-table social-audit-table">
          <thead>
            <tr>
              <th>Platform & Campaign Name</th>
              <th>Client Workspace</th>
              <th>Objective</th>
              <th>Status</th>
              <th>Daily Budget</th>
              <th>Total Spend</th>
              <th>Conversions</th>
              <th>ROAS</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-muted">
                  No campaigns match your filter criteria.
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="social-row-item">
                  {/* Platform & Campaign Name */}
                  <td>
                    <div className="table-platform-cell">
                      <span className={`table-platform-pill ${campaign.platform.toLowerCase()}`}>
                        {campaign.platform}
                      </span>
                      <div>
                        <strong
                          className="table-handle-link clickable"
                          onClick={() => onInspect(campaign)}
                        >
                          {campaign.name || campaign.title}
                        </strong>
                        <span className="table-account-name text-xs text-muted">
                          ID: {campaign.externalCampaignId || campaign.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Client */}
                  <td>
                    <span className="table-client-name">
                      <Building size={12} className="inline-icon" /> {campaign.clientName || 'Assigned Client'}
                    </span>
                  </td>

                  {/* Objective */}
                  <td>
                    <span className="table-account-name">{campaign.objective}</span>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant={campaign.statusVariant || 'primary'} size="sm">
                      {campaign.status}
                    </Badge>
                  </td>

                  {/* Daily Budget */}
                  <td>
                    <strong className="text-emerald">
                      ${(campaign.dailyBudget || 0).toLocaleString()}
                    </strong>
                  </td>

                  {/* Total Spend */}
                  <td>
                    <span>
                      ${(campaign.spend || campaign.totalSpend || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Conversions */}
                  <td>
                    <strong className="text-cyan">
                      {(campaign.conversions || 0).toLocaleString()}
                    </strong>
                  </td>

                  {/* ROAS */}
                  <td>
                    <strong className="text-gold">
                      {campaign.metrics?.roas || '0.00x'}
                    </strong>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onInspect(campaign)}
                        title="Inspect Campaign Details"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onEdit(campaign)}
                        title="Edit Campaign Settings"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-table-action danger"
                        onClick={() => onArchive(campaign.id)}
                        title="Archive Campaign"
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

export default CampaignsTable;
