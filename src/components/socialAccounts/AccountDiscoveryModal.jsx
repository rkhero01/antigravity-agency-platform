import React, { useState } from 'react';
import {
  X,
  Share2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Building,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Key,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AccountDiscoveryModal({
  isOpen,
  onClose,
  discoveryData,
  onConfirmSelection,
  isConnecting = false,
}) {
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !discoveryData) return null;

  const accounts = discoveryData.accounts || [];
  const selectedAccount = accounts.find((a) => a.platformAccountId === selectedAccountId);

  const handleProceedToConfirm = () => {
    if (!selectedAccountId) {
      setError('Please select an account or page to connect.');
      return;
    }
    setError(null);
    setIsConfirmStep(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedAccount) return;
    setError(null);
    try {
      await onConfirmSelection({
        provider: discoveryData.provider,
        discoveryToken: discoveryData.discoveryToken,
        platformAccountId: selectedAccount.platformAccountId,
        clientId: discoveryData.clientId,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect selected account.');
    }
  };

  // Mask platform account ID for safe presentation
  const maskedAccountId = selectedAccount?.platformAccountId
    ? selectedAccount.platformAccountId.length > 8
      ? `${selectedAccount.platformAccountId.slice(0, 4)}...${selectedAccount.platformAccountId.slice(-4)}`
      : selectedAccount.platformAccountId
    : 'N/A';

  return (
    <div className="modal-backdrop-overlay" onClick={isConnecting ? undefined : onClose}>
      <div
        className="modal-dialog-card account-discovery-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} className="text-cyan" />
            </div>
            <div>
              <h3 className="modal-title">
                {isConfirmStep ? 'Confirm Channel Connection' : `Select Discovered ${discoveryData.provider} Asset`}
              </h3>
              <p className="modal-subtitle">
                {isConfirmStep
                  ? 'Verify channel details before persisting encrypted credentials'
                  : `Found ${accounts.length} authorized channel${accounts.length > 1 ? 's' : ''} from provider`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close"
            disabled={isConnecting}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="modal-error-banner" role="alert">
            <AlertCircle size={16} className="error-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="modal-form-body">
          {!isConfirmStep ? (
            /* Step 1: Discovered Accounts List */
            <div className="discovered-accounts-list">
              <span className="form-field-hint mb-3">
                Choose the page, profile, or channel you wish to attach to this workspace:
              </span>

              <div className="discovered-items-grid">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.platformAccountId;
                  const maskedId = acc.platformAccountId.length > 8
                    ? `${acc.platformAccountId.slice(0, 4)}...${acc.platformAccountId.slice(-4)}`
                    : acc.platformAccountId;

                  return (
                    <div
                      key={acc.platformAccountId}
                      className={`discovered-card-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedAccountId(acc.platformAccountId);
                        setError(null);
                      }}
                    >
                      <div className="discovered-item-left">
                        {acc.avatarUrl ? (
                          <img
                            src={acc.avatarUrl}
                            alt={acc.accountName}
                            className="discovered-avatar-img"
                          />
                        ) : (
                          <div className="discovered-avatar-placeholder">
                            <Share2 size={16} />
                          </div>
                        )}
                        <div className="discovered-item-info">
                          <strong className="discovered-name">{acc.accountName}</strong>
                          <span className="discovered-handle">{acc.handle}</span>
                          <span className="discovered-cat">
                            {acc.platformLabel || acc.platform} &bull; ID: <span className="code-font">{maskedId}</span>
                          </span>
                        </div>
                      </div>

                      <div className="discovered-item-radio">
                        <div className={`custom-radio-circle ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <div className="custom-radio-inner" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="modal-dialog-footer end mt-4">
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={onClose}
                  disabled={isConnecting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-saas-primary"
                  onClick={handleProceedToConfirm}
                  disabled={!selectedAccountId || isConnecting}
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Connection Confirmation */
            <div className="connection-confirmation-pane">
              <div className="client-details-grid-spec">
                <div className="detail-spec-item">
                  <span className="detail-spec-label">Target Platform</span>
                  <strong className="detail-spec-val">{selectedAccount?.platformLabel || selectedAccount?.platform}</strong>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Client Workspace</span>
                  <strong className="detail-spec-val">{discoveryData.clientName || 'Assigned Workspace'}</strong>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Account / Page Name</span>
                  <strong className="detail-spec-val">{selectedAccount?.accountName}</strong>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Public Handle</span>
                  <strong className="detail-spec-val text-cyan">{selectedAccount?.handle}</strong>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Platform Account ID</span>
                  <strong className="detail-spec-val code-font">{maskedAccountId}</strong>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Encryption Mode</span>
                  <strong className="detail-spec-val text-success">AES-256-GCM (Server-Side)</strong>
                </div>
              </div>

              <div className="oauth-config-notice-card mt-3">
                <div className="oauth-notice-head">
                  <Shield size={14} className="text-emerald" />
                  <strong>Security Guarantee: Zero Plaintext Storage</strong>
                </div>
                <p className="oauth-notice-desc">
                  OAuth credentials will be immediately encrypted using AES-256-GCM before database persistence. Plaintext tokens are purged from memory and never returned to the frontend.
                </p>
              </div>

              <div className="modal-dialog-footer between mt-4">
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={() => setIsConfirmStep(false)}
                  disabled={isConnecting}
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  className="btn-saas-primary"
                  onClick={handleFinalSubmit}
                  disabled={isConnecting}
                >
                  <CheckCircle2 size={15} className={isConnecting ? 'animate-spin' : ''} />
                  <span>{isConnecting ? 'Encrypting & Connecting...' : 'Connect Account'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountDiscoveryModal;
