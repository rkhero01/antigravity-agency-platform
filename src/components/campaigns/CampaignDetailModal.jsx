import React, { useState } from 'react';
import {
  X,
  Rocket,
  Building,
  Target,
  DollarSign,
  TrendingUp,
  Calendar,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function CampaignDetailModal({
  campaign,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !campaign) return null;

  const handleArchive = async () => {
    const confirm = window.confirm(
      `Are you sure you want to archive campaign "${campaign.name || campaign.title}"? It will be soft-deleted in PostgreSQL.`
    );
    if (!confirm) return;

    setIsArchiving(true);
    setFeedback(null);
    try {
      await onArchive(campaign.id);
      onClose();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to archive campaign.' });
    } finally {
      setIsArchiving(false);
    }
  };

  const createdDate = campaign.createdAt
    ? new Date(campaign.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not recorded';

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
              <Rocket size={18} />
            </div>
            <div>
              <h3 className="modal-title">{campaign.name || campaign.title}</h3>
              <p className="modal-subtitle">{campaign.platform} &bull; {campaign.objective}</p>
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
          {/* Details Specification Grid */}
          <div className="client-details-grid-spec">
            <div className="detail-spec-item">
              <span className="detail-spec-label">Assigned Client</span>
              <strong className="detail-spec-val">{campaign.clientName || 'Assigned Client'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Delivery Status</span>
              <div>
                <Badge variant={campaign.statusVariant || 'primary'}>
                  {campaign.status}
                </Badge>
              </div>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Ad Network</span>
              <strong className="detail-spec-val">{campaign.platform}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Daily Budget</span>
              <strong className="detail-spec-val text-emerald">
                ${(campaign.dailyBudget || 0).toLocaleString()}
              </strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Total Spend</span>
              <strong className="detail-spec-val">
                ${(campaign.spend || campaign.totalSpend || 0).toLocaleString()}
              </strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Total Conversions</span>
              <strong className="detail-spec-val text-cyan">
                {(campaign.conversions || 0).toLocaleString()}
              </strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">ROAS Multiple</span>
              <strong className="detail-spec-val text-gold">
                {campaign.metrics?.roas || '0.00x'}
              </strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">External Campaign ID</span>
              <code className="detail-spec-code">{campaign.externalCampaignId || 'None'}</code>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Created In Database</span>
              <strong className="detail-spec-val">{createdDate}</strong>
            </div>

            {campaign.socialAccountName && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">Linked Asset Channel</span>
                <strong className="detail-spec-val text-cyan">{campaign.socialAccountName}</strong>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="modal-dialog-footer between mt-4">
            <button
              type="button"
              className="btn-delete-member"
              onClick={handleArchive}
              disabled={isArchiving}
              title="Archive Campaign"
            >
              <Trash2 size={15} />
              <span>{isArchiving ? 'Archiving...' : 'Archive Campaign'}</span>
            </button>

            <button
              type="button"
              className="btn-saas-primary"
              onClick={() => {
                onClose();
                onEdit(campaign);
              }}
            >
              <Edit2 size={14} />
              <span>Edit Delivery Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetailModal;
