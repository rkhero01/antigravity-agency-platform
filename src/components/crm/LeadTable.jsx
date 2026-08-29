import React, { useState } from 'react';
import {
  Table,
  Phone,
  Mail,
  Trash2,
  ExternalLink,
  Star,
  Flame,
  CheckCircle2,
  Users,
  Download,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { CRM_STAGES } from './LeadPipeline.jsx';

export function LeadTable({
  leads = [],
  sourceFilter,
  onSourceFilterChange,
  statusFilter,
  onStatusFilterChange,
  staffFilter,
  onStaffFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onOpenDetails,
  onOpenScoreModal,
  onMoveStatus,
  onDeleteLead,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCsv = () => {
    const headers = 'ID,Name,Company,Email,Phone,Client,Source,Status,Score,Value,Staff\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.company}","${l.email}","${l.phone}","${l.clientName}","${l.source}","${l.status}","${l.leadScore}","${l.value}","${l.assignedStaff}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_crm_export_${Date.now()}.csv`;
    a.click();
  };

  const getScoreBadge = (score, category) => {
    if (category === 'VIP') {
      return <span className="lead-score-pill vip"><Star size={11} className="fill-warning text-warning" /> VIP {score}</span>;
    }
    if (category === 'Hot') {
      return <span className="lead-score-pill hot"><Flame size={11} /> Hot {score}</span>;
    }
    return <span className="lead-score-pill neutral">{category} {score}</span>;
  };

  return (
    <div className="crm-table-pane">
      {/* Filters Bar */}
      <div className="table-controls-bar">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source Filter */}
          <div className="crm-mini-select-wrap">
            <span className="mini-lbl">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => onSourceFilterChange(e.target.value)}
              className="crm-mini-select"
            >
              <option value="all">All Sources</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Instagram">Instagram</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Website">Website</option>
              <option value="Organic Search">Organic Search</option>
              <option value="Referral">Referral</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="crm-mini-select-wrap">
            <span className="mini-lbl">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="crm-mini-select"
            >
              <option value="all">All Stages</option>
              {CRM_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="crm-mini-select-wrap">
            <span className="mini-lbl">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="crm-mini-select"
            >
              <option value="all">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">⚡ Medium Priority</option>
              <option value="Low">⚪ Low Priority</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div className="crm-mini-select-wrap">
            <span className="mini-lbl">Staff:</span>
            <select
              value={staffFilter}
              onChange={(e) => onStaffFilterChange(e.target.value)}
              className="crm-mini-select"
            >
              <option value="all">All Staff</option>
              <option value="Elena Rostova">Elena Rostova</option>
              <option value="Marcus Chen">Marcus Chen</option>
              <option value="Alex Rivera">Alex Rivera</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="David Vance">David Vance</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <span className="text-xs text-primary font-bold">
              {selectedIds.length} leads selected
            </span>
          )}
          <button
            type="button"
            className="btn-export-crm-csv"
            onClick={handleExportCsv}
            title="Export filtered leads to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="crm-table-card">
        <div className="crm-table-scroll">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={leads.length > 0 && selectedIds.length === leads.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Lead / Contact</th>
                <th>Client Workspace</th>
                <th>Source / Channel</th>
                <th>Pipeline Stage</th>
                <th>AI Score</th>
                <th>Deal Value</th>
                <th>Assigned Staff</th>
                <th>Next Follow-up</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="crm-table-row">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lead.id)}
                      onChange={() => toggleSelectOne(lead.id)}
                    />
                  </td>
                  <td>
                    <div
                      className="lead-table-contact cursor-pointer"
                      onClick={() => onOpenDetails(lead)}
                    >
                      <strong className="text-white block">{lead.name}</strong>
                      <span className="text-xs text-muted">{lead.company}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-primary font-medium">🏢 {lead.clientName}</span>
                  </td>
                  <td>
                    <span className="lead-source-chip">{lead.source}</span>
                  </td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) => onMoveStatus(lead.id, e.target.value)}
                      className="stage-inline-select"
                    >
                      {CRM_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div
                      className="cursor-pointer inline-block"
                      onClick={() => onOpenScoreModal(lead)}
                    >
                      {getScoreBadge(lead.leadScore, lead.scoreCategory)}
                    </div>
                  </td>
                  <td>
                    <strong className="text-success text-sm">${(lead.value || 0).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className="text-xs text-white">{lead.assignedStaff}</span>
                  </td>
                  <td>
                    <span className="text-xs text-muted">{lead.nextFollowUp}</span>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn-table-delete-icon"
                      onClick={() => onDeleteLead(lead.id)}
                      title="Delete lead"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeadTable;
