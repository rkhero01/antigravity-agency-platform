import React from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Trash2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function SocialAccountsTable({
  accounts = [],
  onSyncAccount,
  onReconnectAccount,
  onInspectAccount,
  onDisconnectAccount,
}) {
  return (
    <div className="social-table-card">
      <div className="social-table-responsive">
        <table className="saas-table social-audit-table">
          <thead>
            <tr>
              <th>Platform & Handle</th>
              <th>Client Workspace</th>
              <th>Audience Followers</th>
              <th>Connection Health</th>
              <th>Publishing State</th>
              <th>OAuth Expiry</th>
              <th>Last Synced</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted">
                  No social accounts match your filter criteria.
                </td>
              </tr>
            ) : (
              accounts.map((account) => {
                const isExpired = account.status === 'Needs Re-auth';
                const isExpiringSoon =
                  account.tokenDaysRemaining <= 14 && account.tokenDaysRemaining > 0;

                return (
                  <tr key={account.id} className="social-row-item">
                    {/* Platform & Handle */}
                    <td>
                      <div className="table-platform-cell">
                        <span className={`table-platform-pill ${account.platform.toLowerCase()}`}>
                          {account.platform}
                        </span>
                        <div>
                          <strong
                            className="table-handle-link clickable"
                            onClick={() => onInspectAccount(account)}
                          >
                            {account.handle}
                          </strong>
                          <span className="table-account-name">{account.accountName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td>
                      <span className="table-client-name">🏢 {account.clientName}</span>
                    </td>

                    {/* Followers */}
                    <td>
                      <div className="table-followers-cell">
                        <strong>{account.followers}</strong>
                        <span className="table-delta-tag positive">{account.followersDelta || '+12%'}</span>
                      </div>
                    </td>

                    {/* Connection Health */}
                    <td>
                      {isExpired ? (
                        <span className="status-pill-badge reauth">
                          <AlertTriangle size={11} /> Needs Re-auth
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="status-pill-badge expiring">
                          <Clock size={11} /> Expiring ({account.tokenDaysRemaining}d)
                        </span>
                      ) : (
                        <span className="status-pill-badge connected">
                          <CheckCircle2 size={11} /> Connected
                        </span>
                      )}
                    </td>

                    {/* Publishing Pipeline */}
                    <td>
                      <Badge
                        variant={account.publishingStatus === 'Active' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {account.publishingStatus}
                      </Badge>
                    </td>

                    {/* OAuth Expiry */}
                    <td>
                      <span className={`table-expiry-date ${isExpired ? 'expired' : isExpiringSoon ? 'expiring' : ''}`}>
                        {account.tokenExpires}
                      </span>
                    </td>

                    {/* Last Synced */}
                    <td>
                      <span className="table-sync-time">{account.lastSync}</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions-cell">
                        {isExpired ? (
                          <button
                            type="button"
                            className="btn-table-action reconnect"
                            onClick={() => onReconnectAccount(account.id)}
                            title="Reconnect OAuth Token"
                          >
                            <RefreshCw size={13} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => onSyncAccount(account.id)}
                            title="Sync Now"
                          >
                            <RefreshCw size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onInspectAccount(account)}
                          title="Inspect Scopes"
                        >
                          <Shield size={13} />
                        </button>

                        <button
                          type="button"
                          className="btn-table-action danger"
                          onClick={() => onDisconnectAccount(account.id)}
                          title="Disconnect Channel"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SocialAccountsTable;
