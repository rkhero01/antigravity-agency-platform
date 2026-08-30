import React, { useState } from 'react';
import {
  X,
  Shield,
  Clock,
  Calendar,
  Key,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  Globe,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AccountDetailModal({
  account,
  isOpen,
  onClose,
  onSync,
  onReconnect,
  onDisconnect,
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !account) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    setFeedback(null);
    try {
      await onSync(account.id);
      setFeedback({ type: 'success', text: 'Channel synchronized successfully with platform.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to synchronize channel.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setFeedback(null);
    try {
      const res = await onReconnect(account.id);
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        setFeedback({ type: 'success', text: res.message || 'OAuth authorization refreshed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to initiate re-authorization.' });
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const confirm = window.confirm(
      `Disconnecting "${account.accountName}" will stop publishing and synchronization for this channel. Are you sure?`
    );
    if (!confirm) return;

    setIsDisconnecting(true);
    setFeedback(null);
    try {
      await onDisconnect(account.id);
      onClose();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to disconnect account.' });
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Mask platform account ID for secure display
  const maskedAccountId = account.platformAccountId
    ? account.platformAccountId.length > 8
      ? `${account.platformAccountId.slice(0, 4)}...${account.platformAccountId.slice(-4)}`
      : account.platformAccountId
    : 'N/A';

  const expiryDisplay = account.tokenExpiresAt
    ? new Date(account.tokenExpiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '60-day OAuth token (Rolling)';

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
              <Shield size={18} />
            </div>
            <div>
              <h3 className="modal-title">{account.accountName}</h3>
              <p className="modal-subtitle">{account.platformLabel || account.platform} &bull; {account.handle}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`modal-${feedback.type === 'error' ? 'error' : 'success'}-banner`}
            role="status"
          >
            {feedback.type === 'error' ? (
              <AlertCircle size={16} className="error-banner-icon" />
            ) : (
              <CheckCircle2 size={16} className="success-banner-icon" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="modal-form-body">
          {/* Channel Specification Details */}
          <div className="client-details-grid-spec">
            <div className="detail-spec-item">
              <span className="detail-spec-label">Assigned Client Workspace</span>
              <strong className="detail-spec-val">{account.clientName || 'Agency Shared'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Connection Status</span>
              <div>
                <Badge variant={account.statusVariant || 'success'}>
                  {account.status}
                </Badge>
              </div>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Platform Account ID</span>
              <strong className="detail-spec-val code-font">{maskedAccountId}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Token Health</span>
              <strong className="detail-spec-val text-cyan">
                {account.tokenDaysRemaining !== undefined ? `${account.tokenDaysRemaining} days remaining` : 'Active'}
              </strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Token Renewal Window</span>
              <strong className="detail-spec-val">{expiryDisplay}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Encryption Standard</span>
              <strong className="detail-spec-val text-success">AES-256-GCM (Server-Side)</strong>
            </div>
          </div>

          {/* Scopes & Permissions Section */}
          <div className="detail-scopes-section mt-4">
            <span className="detail-spec-label">Authorized Platform Scopes:</span>
            <div className="client-tags-cloud mt-2">
              {Array.isArray(account.scopes) ? (
                account.scopes.map((s, idx) => (
                  <span key={idx} className="client-pill-tag">
                    {s}
                  </span>
                ))
              ) : (
                <span className="client-pill-tag">pages_manage_posts, publish_actions</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-dialog-footer between mt-4">
            <button
              type="button"
              className="btn-delete-member"
              onClick={handleDisconnect}
              disabled={isDisconnecting || isSyncing || isReconnecting}
              title="Disconnect Account"
            >
              <Trash2 size={15} />
              <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect Account'}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn-saas-secondary"
                onClick={handleSync}
                disabled={isSyncing || isReconnecting || isDisconnecting}
                title="Sync Profile with Platform"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                type="button"
                className="btn-saas-primary"
                onClick={handleReconnect}
                disabled={isReconnecting || isSyncing || isDisconnecting}
                title="Initiate OAuth Re-authorization"
              >
                <Zap size={14} className={isReconnecting ? 'animate-spin' : ''} />
                <span>{isReconnecting ? 'Initiating...' : 'Reconnect Channel'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailModal;
