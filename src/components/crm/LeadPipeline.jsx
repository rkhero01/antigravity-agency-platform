import React from 'react';
import { Kanban, Plus } from 'lucide-react';
import { LeadCard } from './LeadCard.jsx';

export const CRM_STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal / Offer',
  'Negotiation',
  'Won',
  'Lost',
];

export function LeadPipeline({
  leads = [],
  onOpenDetails,
  onOpenScoreModal,
  onMoveStatus,
  onOpenAddModal,
}) {
  const getStageHeaderColor = (stage) => {
    switch (stage) {
      case 'New Lead':
        return '#3b82f6';
      case 'Contacted':
        return '#06b6d4';
      case 'Qualified':
        return '#6366f1';
      case 'Proposal / Offer':
        return '#a855f7';
      case 'Negotiation':
        return '#f59e0b';
      case 'Won':
        return '#10b981';
      case 'Lost':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="crm-pipeline-container">
      <div className="pipeline-columns-scroll">
        {CRM_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage);
          const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);
          const accentColor = getStageHeaderColor(stage);

          return (
            <div key={stage} className="pipeline-column-card">
              {/* Column Header */}
              <div
                className="pipeline-column-header"
                style={{ borderTop: `3px solid ${accentColor}` }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="column-title-text">{stage}</span>
                  <span className="column-count-chip">{stageLeads.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-dim">Stage Value:</span>
                  <strong className="text-white">${stageValue.toLocaleString()}</strong>
                </div>
              </div>

              {/* Cards Body */}
              <div className="pipeline-cards-body">
                {stageLeads.length === 0 ? (
                  <div className="pipeline-empty-column">
                    <span className="text-xs text-dim">No leads in stage</span>
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      stages={CRM_STAGES}
                      onOpenDetails={onOpenDetails}
                      onOpenScoreModal={onOpenScoreModal}
                      onMoveStatus={onMoveStatus}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LeadPipeline;
