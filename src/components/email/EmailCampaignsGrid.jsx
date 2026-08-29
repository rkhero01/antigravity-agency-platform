import React from 'react';
import { Mail, Plus } from 'lucide-react';
import { EmailCampaignCard } from './EmailCampaignCard.jsx';

export function EmailCampaignsGrid({
  campaigns = [],
  onInspect,
  onDeleteCampaign,
  onOpenCreateModal,
}) {
  if (campaigns.length === 0) {
    return (
      <div className="email-empty-state-card">
        <Mail size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No broadcasts found</h4>
        <p className="empty-state-subtitle">Adjust your filter criteria or schedule a new Email or SMS broadcast.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenCreateModal}
        >
          <Plus size={15} />
          <span>New Broadcast Campaign</span>
        </button>
      </div>
    );
  }

  return (
    <div className="email-cards-grid">
      {campaigns.map((camp) => (
        <EmailCampaignCard
          key={camp.id}
          campaign={camp}
          onInspect={onInspect}
          onDeleteCampaign={onDeleteCampaign}
        />
      ))}
    </div>
  );
}

export default EmailCampaignsGrid;
