import React from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Trash2,
  Building,
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
              <th>Connection Status</th>
              <th>Token Health</th>
              <th>Granted Capabilities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  No social accounts match your filter criteria.
                </td>
              </tr>
            ) : (
              accounts.map((account) => {
                const isExpired = account.status === 'Needs Re-auth';
                const isExpiringSoon = account.status === 'Expiring Soon';

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
                            {account.handle || account.accountName}
                          </strong>
                          <span className="table-account-name">{account.accountName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td>
                      <span className="table-client-name">
                        <Building size={12} className="inline-icon" /> {account.clientName || 'Agency Workspace'}
                      </span>
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

                    {/* Token Health */}
                    <td>
                      <span className={`table-expiry-date ${isExpired ? 'expired' : isExpiringSoon ? 'expiring' : 'text-emerald'}`}>
                        {isExpired ? 'Expired' : `${account.tokenDaysRemaining} Days Active`}
                      </span>
                    </td>

                    {/* Scopes */}
                    <td>
                      <span className="text-muted text-xs">
                        {account.scopes?.length || 2} Scopes Authorized
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onReconnectAccount ? onReconnectAccount(account.id) : onSyncAccount(account.id)}
                          title="Refresh Connection State"
                        >
                          <RefreshCw size={13} />
                        </button>

                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onInspectAccount(account)}
                          title="Inspect Scopes & Details"
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
