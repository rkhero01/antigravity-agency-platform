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
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AccountDetailModal({
  account,
  isOpen,
  onClose,
  onReconnect,
  onDisconnect,
}) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !account) return null;

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setFeedback(null);
    try {
      const res = await onReconnect(account.id);
      setFeedback({ type: 'success', text: res.message || 'Token status refreshed.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to refresh token.' });
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const confirm = window.confirm(
      `Are you sure you want to disconnect "${account.accountName}"? The record will be safely archived in database.`
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

  const createdDate = account.createdAt
    ? new Date(account.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not recorded';

  const expiryDate = account.tokenExpiresAt
    ? new Date(account.tokenExpiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not applicable';

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
              <Globe size={18} />
            </div>
            <div>
              <h3 className="modal-title">{account.accountName}</h3>
              <p className="modal-subtitle">{account.platformLabel || account.platform}</p>
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

        {/* Feedback Alert */}
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
          {/* Details Grid */}
          <div className="client-details-grid-spec">
            <div className="detail-spec-item">
              <span className="detail-spec-label">Assigned Client</span>
              <strong className="detail-spec-val">{account.clientName || 'Agency Workspace'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Social Handle</span>
              <strong className="detail-spec-val">{account.handle || 'Not provided'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Platform Asset ID</span>
              <code className="detail-spec-code">{account.platformAccountId || 'Not recorded'}</code>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Connection Status</span>
              <div>
                <Badge variant={account.statusVariant || 'primary'}>
                  {account.status}
                </Badge>
              </div>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Token Expiration</span>
              <strong className="detail-spec-val">
                {expiryDate} ({account.tokenDaysRemaining} days remaining)
              </strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Connected Since</span>
              <strong className="detail-spec-val">{createdDate}</strong>
            </div>
          </div>

          {/* Scopes */}
          <div className="detail-scopes-section">
            <span className="detail-spec-label">
              <Key size={13} className="inline-icon" /> Authorized Permission Scopes:
            </span>
            <div className="client-tags-cloud mt-2">
              {(account.scopes || []).map((s) => (
                <span key={s} className="client-pill-tag">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-dialog-footer between mt-4">
            <button
              type="button"
              className="btn-delete-member"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              title="Disconnect Asset"
            >
              <Trash2 size={15} />
              <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect Asset'}</span>
            </button>

            <button
              type="button"
              className="btn-saas-primary"
              onClick={handleReconnect}
              disabled={isReconnecting}
            >
              <RefreshCw size={14} className={isReconnecting ? 'animate-spin' : ''} />
              <span>{isReconnecting ? 'Refreshing...' : 'Refresh Token Health'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailModal;
