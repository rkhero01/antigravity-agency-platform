import React from 'react';
import { LeadCard } from './LeadCard.jsx';
import { CRM_STAGES } from '../../services/crmService.js';

export function LeadPipeline({
  leads = [],
  onInspectLead,
  onEditLead,
  onDeleteLead,
  onStatusChange,
}) {
  return (
    <div className="crm-pipeline-board">
      {CRM_STAGES.map((col) => {
        const colLeads = leads.filter((l) => l.stage === col.value);
        const colValue = colLeads.reduce((acc, l) => acc + (Number(l.value) || 0), 0);

        return (
          <div key={col.value} className="crm-pipeline-column">
            {/* Column Header */}
            <div className="pipeline-col-header">
              <div className="pipeline-col-title-row">
                <span
                  className="pipeline-col-dot"
                  style={{ background: col.color }}
                />
                <h4 className="pipeline-col-name">{col.label}</h4>
                <span className="pipeline-col-count">{colLeads.length}</span>
              </div>
              <span className="pipeline-col-value">
                ${colValue.toLocaleString()}
              </span>
            </div>

            {/* Leads List */}
            <div className="pipeline-cards-container">
              {colLeads.length === 0 ? (
                <div className="pipeline-empty-column-box">
                  <span>No leads in stage</span>
                </div>
              ) : (
                colLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onInspect={onInspectLead}
                    onEdit={onEditLead}
                    onDelete={onDeleteLead}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LeadPipeline;
