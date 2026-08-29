import React from 'react';
import { Target, Plus } from 'lucide-react';
import { CompetitorCard } from './CompetitorCard.jsx';

export function CompetitorsGrid({
  competitors = [],
  onDeleteCompetitor,
  onOpenAddModal,
}) {
  if (competitors.length === 0) {
    return (
      <div className="competitors-empty-state-card">
        <Target size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No tracked competitors found</h4>
        <p className="empty-state-subtitle">Adjust your filter criteria or start tracking a new rival brand.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenAddModal}
        >
          <Plus size={15} />
          <span>Track Competitor</span>
        </button>
      </div>
    );
  }

  return (
    <div className="competitors-cards-grid">
      {competitors.map((comp) => (
        <CompetitorCard
          key={comp.id}
          competitor={comp}
          onDeleteCompetitor={onDeleteCompetitor}
        />
      ))}
    </div>
  );
}

export default CompetitorsGrid;
