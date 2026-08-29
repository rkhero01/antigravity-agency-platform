import React from 'react';
import { Rocket, Plus } from 'lucide-react';
import { CampaignCard } from './CampaignCard.jsx';

export function CampaignsGrid({
  campaigns = [],
  onInspect,
  onDeleteCampaign,
  onOpenCreateModal,
}) {
  if (campaigns.length === 0) {
    return (
      <div className="campaigns-empty-state-card">
        <Rocket size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No campaign briefs found</h4>
        <p className="empty-state-subtitle">Adjust your filter criteria or plan a new multi-channel marketing campaign.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenCreateModal}
        >
          <Plus size={15} />
          <span>New Campaign Brief</span>
        </button>
      </div>
    );
  }

  return (
    <div className="campaigns-cards-grid">
      {campaigns.map((camp) => (
        <CampaignCard
          key={camp.id}
          campaign={camp}
          onInspect={onInspect}
          onDeleteCampaign={onDeleteCampaign}
        />
      ))}
    </div>
  );
}

export default CampaignsGrid;
