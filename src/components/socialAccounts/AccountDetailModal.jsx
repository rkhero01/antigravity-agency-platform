import React from 'react';
import {
  X,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Key,
  RefreshCw,
  Activity,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AccountDetailModal({
  account,
  isOpen,
  onClose,
  onSyncAccount,
  onReconnectAccount,
}) {
  if (!isOpen || !account) return null;

  const isExpired = account.status === 'Needs Re-auth';
  const isExpiringSoon = account.tokenDaysRemaining <= 14 && account.tokenDaysRemaining > 0;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card account-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Share2 size={18} />
            </div>
            <div>
              <div className="account-detail-tags-row">
                <span className="platform-tag-pill">{account.platform}</span>
                <span className="account-client-tag">🏢 {account.clientName}</span>
              </div>
              <h3 className="modal-title">{account.handle}</h3>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="account-detail-modal-body">
          {/* Health Alert if needed */}
          {isExpired && (
            <div className="oauth-warning-banner-mini">
              <AlertTriangle size={16} className="text-danger" />
              <div>
                <strong>OAuth Refresh Token Expired</strong>
                <p>Automated publishing is paused. Click Reconnect below to refresh token with provider.</p>
              </div>
            </div>
          )}

          {/* Diagnostic Metrics Grid */}
          <div className="account-diag-grid-four">
            <div className="diag-stat-card">
              <span className="stat-label">Health Status</span>
              <strong className={`stat-val ${isExpired ? 'text-danger' : 'text-success'}`}>
                {account.status}
              </strong>
            </div>

            <div className="diag-stat-card">
              <span className="stat-label">Token Validity</span>
              <strong className={`stat-val ${isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : 'text-primary'}`}>
                {isExpired ? 'Expired' : `${account.tokenDaysRemaining} Days`}
              </strong>
            </div>

            <div className="diag-stat-card">
              <span className="stat-label">Token Expiration Date</span>
              <strong className="stat-val">{account.tokenExpires}</strong>
            </div>

            <div className="diag-stat-card">
              <span className="stat-label">API Quota Usage</span>
              <strong className="stat-val text-cyan">{account.apiQuotaUsage || '18%'}</strong>
            </div>
          </div>

          {/* Granular OAuth Scopes List */}
          <div className="scopes-section-box">
            <div className="scopes-header-row">
              <Key size={14} className="text-primary" />
              <h4 className="scopes-title">Authorized OAuth 2.0 Scopes & Permissions</h4>
            </div>

            <div className="scopes-chips-list">
              {account.scopes?.map((scope) => (
                <div key={scope} className="scope-chip-item">
                  <ShieldCheck size={12} className="text-success" />
                  <code>{scope}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Metadata */}
          <div className="channel-meta-box">
            <div className="meta-line">
              <span className="meta-lbl">Account Display Name:</span>
              <strong className="meta-v">{account.accountName}</strong>
            </div>
            <div className="meta-line">
              <span className="meta-lbl">Audience Size:</span>
              <strong className="meta-v">{account.followers} ({account.followersDelta})</strong>
            </div>
            <div className="meta-line">
              <span className="meta-lbl">Last Synced:</span>
              <strong className="meta-v">{account.lastSync}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer account-modal-footer">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={() => {
              onSyncAccount(account.id);
            }}
          >
            <RefreshCw size={14} />
            <span>Sync Live Metrics</span>
          </button>

          <div className="footer-right-actions">
            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Close
            </button>
            {isExpired || isExpiringSoon ? (
              <button
                type="button"
                className="btn-saas-primary"
                onClick={() => {
                  onReconnectAccount(account.id);
                  onClose();
                }}
              >
                <RefreshCw size={14} />
                <span>Reconnect OAuth Token</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailModal;
