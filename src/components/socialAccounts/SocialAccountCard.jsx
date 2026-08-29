import React from 'react';
import {
  Share2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Trash2,
  Shield,
  Activity,
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
  const isExpiringSoon = account.tokenDaysRemaining <= 14 && account.tokenDaysRemaining > 0;

  const getPlatformHeaderColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)';
      case 'facebook':
        return 'linear-gradient(135deg, #1877f2, #0d65d9)';
      case 'linkedin':
        return 'linear-gradient(135deg, #0a66c2, #004182)';
      case 'youtube':
        return 'linear-gradient(135deg, #ff0000, #cc0000)';
      case 'tiktok':
        return 'linear-gradient(135deg, #00f2fe, #4facfe)';
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
            <span className="platform-tag-pill">{account.platform}</span>
            <h4 className="account-handle-text">{account.handle}</h4>
            <span className="account-client-tag">🏢 {account.clientName}</span>
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

        {/* Followers & Growth Row */}
        <div className="account-followers-box">
          <div className="followers-left">
            <span className="followers-label">Audience Size</span>
            <strong className="followers-number">{account.followers}</strong>
          </div>
          <span className="followers-growth-tag positive">
            {account.followersDelta || '+12.4%'}
          </span>
        </div>

        {/* Token Diagnostics & Quota */}
        <div className="account-diagnostics-grid">
          <div className="diag-item">
            <span className="diag-label">
              <Clock size={11} className="inline-icon" /> Token Expiry
            </span>
            <strong className={`diag-val ${isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}`}>
              {isExpired ? 'Expired' : `${account.tokenDaysRemaining} Days Left`}
            </strong>
          </div>

          <div className="diag-item">
            <span className="diag-label">
              <Activity size={11} className="inline-icon" /> API Quota
            </span>
            <strong className="diag-val">{account.apiQuotaUsage || '18%'}</strong>
          </div>
        </div>

        {/* Scopes Preview */}
        <div className="scopes-preview-row">
          <Key size={11} className="text-muted" />
          <span className="scopes-count-text">
            {account.scopes?.length || 3} Authorized OAuth Permissions
          </span>
          <span className="last-sync-time">Synced {account.lastSync}</span>
        </div>

        {/* Action Buttons */}
        <div className="card-actions-footer">
          {isExpired || isExpiringSoon ? (
            <button
              type="button"
              className="btn-reconnect-primary"
              onClick={() => onReconnectAccount(account.id)}
            >
              <RefreshCw size={13} />
              <span>Reconnect OAuth</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-sync-action"
              onClick={() => onSyncAccount(account.id)}
              title="Sync metrics and token status"
            >
              <RefreshCw size={13} />
              <span>Sync</span>
            </button>
          )}

          <button
            type="button"
            className="btn-inspect-action"
            onClick={() => onInspectAccount(account)}
            title="Inspect OAuth Scopes & Diagnostics"
          >
            <Shield size={13} />
            <span>Permissions</span>
          </button>

          <button
            type="button"
            className="btn-disconnect-action"
            onClick={() => onDisconnectAccount(account.id)}
            title="Disconnect Channel"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialAccountCard;
