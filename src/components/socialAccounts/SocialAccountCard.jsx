import React from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Trash2,
  Shield,
  Building,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function SocialAccountCard({
  account,
  onSyncAccount,
  onReconnectAccount,
  onInspectAccount,
  onDisconnectAccount,
}) {
  const isExpired = account.status === 'Needs Re-auth';
  const isExpiringSoon = account.status === 'Expiring Soon';

  const getPlatformHeaderColor = (platform) => {
    switch ((platform || '').toLowerCase()) {
      case 'instagram':
        return 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)';
      case 'facebook':
        return 'linear-gradient(135deg, #1877f2, #0d65d9)';
      case 'google_business':
        return 'linear-gradient(135deg, #4285f4, #34a853)';
      case 'linkedin':
        return 'linear-gradient(135deg, #0a66c2, #004182)';
      case 'youtube':
        return 'linear-gradient(135deg, #ff0000, #cc0000)';
      default:
        return 'linear-gradient(135deg, #6366f1, #3b82f6)';
    }
  };

  return (
    <div className={`social-account-card ${isExpired ? 'card-expired' : ''}`}>
      {/* Top Platform Gradient Strip */}
      <div
        className="card-platform-strip"
        style={{ background: getPlatformHeaderColor(account.platform) }}
      />

      <div className="card-main-body">
        {/* Header with Handle and Client */}
        <div className="card-header-row">
          <div className="account-handle-block">
            <span className="platform-tag-pill">{account.platformLabel || account.platform}</span>
            <h4 className="account-handle-text">{account.handle || account.accountName}</h4>
            <span className="account-client-tag">
              <Building size={12} className="inline-icon" /> {account.clientName || 'Agency Workspace'}
            </span>
          </div>

          <div className="account-status-badge-box">
            {isExpired ? (
              <span className="status-pill-badge reauth">
                <AlertTriangle size={11} /> Re-auth Required
              </span>
            ) : isExpiringSoon ? (
              <span className="status-pill-badge expiring">
                <Clock size={11} /> Expires in {account.tokenDaysRemaining}d
              </span>
            ) : (
              <span className="status-pill-badge connected">
                <CheckCircle2 size={11} /> Connected
              </span>
            )}
          </div>
        </div>

        {/* Display Name */}
        <span className="account-display-name">{account.accountName}</span>

        {/* Token Diagnostics */}
        <div className="account-diagnostics-grid">
          <div className="diag-item">
            <span className="diag-label">
              <Clock size={11} className="inline-icon" /> Token Health
            </span>
            <strong className={`diag-val ${isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : 'text-emerald'}`}>
              {isExpired ? 'Expired' : `${account.tokenDaysRemaining} Days Active`}
            </strong>
          </div>

          <div className="diag-item">
            <span className="diag-label">
              <Key size={11} className="inline-icon" /> Scopes Granted
            </span>
            <strong className="diag-val">{account.scopes?.length || 2} Capabilities</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions-footer">
          <button
            type="button"
            className="btn-sync-action"
            onClick={() => onReconnectAccount ? onReconnectAccount(account.id) : onSyncAccount(account.id)}
            title="Refresh Token & State"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn-inspect-action"
            onClick={() => onInspectAccount(account)}
            title="Inspect OAuth Scopes & Details"
          >
            <Shield size={13} />
            <span>Details</span>
          </button>

          <button
            type="button"
            className="btn-disconnect-action"
            onClick={() => onDisconnectAccount(account.id)}
            title="Disconnect Social Asset"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialAccountCard;
