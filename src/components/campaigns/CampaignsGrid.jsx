import React from 'react';
import { CampaignCard } from './CampaignCard.jsx';
import { Rocket, Plus } from 'lucide-react';

export function CampaignsGrid({
  campaigns = [],
  onInspect,
  onEdit,
  onArchive,
  onOpenCreateModal,
}) {
  if (campaigns.length === 0) {
    return (
      <div className="team-empty-state-card">
        <div className="empty-state-icon">
          <Rocket size={36} />
        </div>
        <h3 className="team-empty-title">No campaigns found</h3>
        <p className="team-empty-desc">
          No paid campaigns matched your filters. Create a new campaign to begin deploying and optimizing multi-channel ad spend.
        </p>
        <button
          type="button"
          className="btn-saas-primary"
          onClick={onOpenCreateModal}
        >
          <Plus size={16} />
          <span>Create Campaign</span>
        </button>
      </div>
    );
  }

  return (
    <div className="team-members-grid">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onInspect={onInspect}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}

export default CampaignsGrid;
