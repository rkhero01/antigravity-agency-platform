import React, { useState } from 'react';
import { AlertTriangle, X, Archive, Loader2 } from 'lucide-react';

export function ArchiveClientModal({ isOpen, onClose, client, onConfirmArchive }) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (!isOpen || !client) return null;

  const handleConfirm = async () => {
    setIsArchiving(true);
    setApiError(null);
    try {
      await onConfirmArchive(client.id);
      onClose();
    } catch (err) {
      setApiError(
        err.message || 'Failed to archive client in database. Please try again.'
      );
      setIsArchiving(false);
    }
  };

  const clientTitle = client.clientName || client.name || 'this client';

  return (
    <div className="modal-backdrop-overlay" onClick={isArchiving ? undefined : onClose}>
      <div className="modal-dialog-card archive-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge warning">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="modal-title">Archive Client Workspace</h3>
              <p className="modal-subtitle">Soft-delete and exclude from active agency directory</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            aria-label="Close"
            disabled={isArchiving}
          >
            <X size={18} />
          </button>
        </div>

        {apiError && (
          <div className="modal-error-banner" role="alert">
            <span>{apiError}</span>
          </div>
        )}

        <div className="modal-confirm-body">
          <p>
            Are you sure you want to archive <strong>{clientTitle}</strong>?
          </p>
          <div className="archive-warning-callout">
            <p>
              • The client workspace will be safely marked as archived in PostgreSQL (soft-deleted).
            </p>
            <p>• Historical invoices, audit logs, and analytics will remain preserved.</p>
            <p>• Active campaign automations for this tenant will be paused.</p>
          </div>
        </div>

        <div className="modal-dialog-footer">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onClose}
            disabled={isArchiving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-archive-danger"
            onClick={handleConfirm}
            disabled={isArchiving}
          >
            {isArchiving ? (
              <span>Archiving in Database...</span>
            ) : (
              <>
                <Archive size={14} />
                <span>Confirm Archive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArchiveClientModal;
