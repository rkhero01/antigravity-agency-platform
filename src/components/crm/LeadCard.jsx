import React from 'react';
import {
  Building,
  DollarSign,
  User,
  Trash2,
  Edit2,
  Eye,
} from 'lucide-react';
import { CRM_STAGES } from '../../services/crmService.js';

export function LeadCard({
  lead,
  onInspect,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <div className="crm-lead-card">
      <div className="lead-card-top-row">
        <span className="platform-tag-pill text-xs">{lead.source}</span>
        <span className="lead-card-score-tag">
          Score: {lead.score || 50}/100
        </span>
      </div>

      <h5
        className="lead-card-name clickable"
        onClick={() => onInspect(lead)}
      >
        {lead.name}
      </h5>

      <span className="lead-card-company">
        {lead.company || 'Private Account'} &bull; <Building size={11} className="inline-icon" /> {lead.clientName}
      </span>

      <div className="lead-card-value-box mt-2">
        <span className="text-xs text-muted">Deal Value</span>
        <strong className="text-emerald text-sm">
          ${(lead.value || 0).toLocaleString()}
        </strong>
      </div>

      <div className="lead-card-owner-row mt-2">
        <span className="text-xs text-muted">
          <User size={11} className="inline-icon" /> {lead.owner || 'Unassigned'}
        </span>
      </div>

      {/* Stage Selector & Actions */}
      <div className="lead-card-footer-row mt-3">
        <select
          value={lead.stage}
          onChange={(e) => onStatusChange && onStatusChange(lead.id, e.target.value)}
          className="team-filter-select text-xs py-1 px-1"
          style={{ maxWidth: '140px' }}
          aria-label="Move Stage"
        >
          {CRM_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="lead-card-actions">
          <button
            type="button"
            className="btn-table-action"
            onClick={() => onInspect(lead)}
            title="Inspect"
          >
            <Eye size={12} />
          </button>

          <button
            type="button"
            className="btn-table-action"
            onClick={() => onEdit ? onEdit(lead) : onInspect(lead)}
            title="Edit"
          >
            <Edit2 size={12} />
          </button>

          <button
            type="button"
            className="btn-table-action danger"
            onClick={() => onDelete(lead.id)}
            title="Archive"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadCard;
