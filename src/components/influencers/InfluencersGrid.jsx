import React from 'react';
import { Users2, Plus } from 'lucide-react';
import { InfluencerCard } from './InfluencerCard.jsx';

export function InfluencersGrid({
  influencers = [],
  onOpenPitchModal,
  onUpdateStage,
  onDeleteInfluencer,
  onOpenAddModal,
}) {
  if (influencers.length === 0) {
    return (
      <div className="influencers-empty-state-card">
        <Users2 size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No creator partnerships found</h4>
        <p className="empty-state-subtitle">Adjust your filter criteria or onboard a new creator partner.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenAddModal}
        >
          <Plus size={15} />
          <span>Add Creator Partner</span>
        </button>
      </div>
    );
  }

  return (
    <div className="influencers-cards-grid">
      {influencers.map((inf) => (
        <InfluencerCard
          key={inf.id}
          influencer={inf}
          onOpenPitchModal={onOpenPitchModal}
          onUpdateStage={onUpdateStage}
          onDeleteInfluencer={onDeleteInfluencer}
        />
      ))}
    </div>
  );
}

export default InfluencersGrid;
