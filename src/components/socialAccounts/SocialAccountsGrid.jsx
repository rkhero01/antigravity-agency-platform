import React from 'react';
import { Share2, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { SocialAccountCard } from './SocialAccountCard.jsx';

export function SocialAccountsGrid({
  accounts = [],
  onSyncAccount,
  onReconnectAccount,
  onInspectAccount,
  onDisconnectAccount,
  onOpenConnectModal,
}) {
  const expiredAccounts = accounts.filter((a) => a.status === 'Needs Re-auth');
  const expiringAccounts = accounts.filter(
    (a) => a.tokenDaysRemaining <= 14 && a.tokenDaysRemaining > 0
  );

  return (
    <div className="social-grid-wrapper">
      {/* Alert Banner if any account needs re-auth */}
      {expiredAccounts.length > 0 && (
        <div className="oauth-warning-banner">
          <div className="warning-banner-left">
            <AlertTriangle size={18} className="warning-icon-alert" />
            <div>
              <strong className="warning-title">
                {expiredAccounts.length} Channel Requires Immediate Re-Authentication
              </strong>
              <p className="warning-desc">
                {expiredAccounts.map((a) => `${a.clientName} (${a.platform} - ${a.handle})`).join(', ')} OAuth token has expired. Automated publishing is temporarily paused.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-reconnect-all-warning"
            onClick={() => onReconnectAccount(expiredAccounts[0].id)}
          >
            <RefreshCw size={14} />
            <span>Reconnect Account</span>
          </button>
        </div>
      )}

      {/* Cards Grid */}
      {accounts.length === 0 ? (
        <div className="social-empty-state-card">
          <Share2 size={36} className="empty-icon-muted" />
          <h4 className="empty-state-title">No social channels found</h4>
          <p className="empty-state-subtitle">Try adjusting your filters or connect a new social account.</p>
          <button
            type="button"
            className="btn-saas-primary mt-2"
            onClick={onOpenConnectModal}
          >
            <Plus size={15} />
            <span>Connect Social Account</span>
          </button>
        </div>
      ) : (
        <div className="social-accounts-grid">
          {accounts.map((account) => (
            <SocialAccountCard
              key={account.id}
              account={account}
              onSyncAccount={onSyncAccount}
              onReconnectAccount={onReconnectAccount}
              onInspectAccount={onInspectAccount}
              onDisconnectAccount={onDisconnectAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialAccountsGrid;
