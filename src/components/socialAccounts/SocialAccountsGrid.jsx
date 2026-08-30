import React from 'react';
import { SocialAccountCard } from './SocialAccountCard.jsx';
import { Share2, PlusCircle } from 'lucide-react';

export function SocialAccountsGrid({
  accounts = [],
  onSyncAccount,
  onReconnectAccount,
  onInspectAccount,
  onDisconnectAccount,
  onOpenConnectModal,
  canMutate = true,
}) {
  if (accounts.length === 0) {
    return (
      <div className="team-empty-state-card">
        <div className="empty-state-icon">
          <Share2 size={36} />
        </div>
        <h3 className="team-empty-title">No social accounts connected</h3>
        <p className="team-empty-desc">
          No social media assets matched your filters. Connect client channels to begin scheduling posts and monitoring engagement.
        </p>
        {canMutate && (
          <button
            type="button"
            className="btn-saas-primary"
            onClick={onOpenConnectModal}
          >
            <PlusCircle size={16} />
            <span>Connect Social Channel</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="team-members-grid">
      {accounts.map((account) => (
        <SocialAccountCard
          key={account.id}
          account={account}
          onSyncAccount={onSyncAccount}
          onReconnectAccount={onReconnectAccount}
          onInspectAccount={onInspectAccount}
          onDisconnectAccount={onDisconnectAccount}
          canMutate={canMutate}
        />
      ))}
    </div>
  );
}

export default SocialAccountsGrid;
