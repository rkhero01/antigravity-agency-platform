import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  Target,
  DollarSign,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { CRM_STAGES } from '../../services/crmService.js';

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onDeleteLead,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !lead) return null;

  const handleDelete = async () => {
    const confirm = window.confirm(
      `Are you sure you want to archive lead "${lead.name}"? It will be soft-deleted in PostgreSQL.`
    );
    if (!confirm) return;

    setIsDeleting(true);
    setFeedback(null);
    try {
      await onDeleteLead(lead.id);
      onClose();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to archive lead.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStageSelect = async (newStage) => {
    try {
      await onStatusChange(lead.id, newStage);
      setFeedback({ type: 'success', text: `Stage updated to ${newStage}` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update stage.' });
    }
  };

  const createdDate = lead.createdAt
    ? new Date(lead.createdAt).toLocaleDateString(undefined, {
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
              <User size={18} />
            </div>
            <div>
              <h3 className="modal-title">{lead.name}</h3>
              <p className="modal-subtitle">{lead.company || 'Private Contact'}</p>
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
          {/* Details Grid */}
          <div className="client-details-grid-spec">
            <div className="detail-spec-item">
              <span className="detail-spec-label">Assigned Client</span>
              <strong className="detail-spec-val">{lead.clientName || 'Assigned Client'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Current Pipeline Stage</span>
              <div>
                <Badge variant={lead.statusVariant || 'primary'}>
                  {lead.status || lead.stage}
                </Badge>
              </div>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Estimated Deal Value</span>
              <strong className="detail-spec-val text-emerald">
                ${(lead.value || 0).toLocaleString()}
              </strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Acquisition Channel</span>
              <strong className="detail-spec-val">{lead.source}</strong>
            </div>

            {lead.campaignName && (
              <div className="detail-spec-item">
                <span className="detail-spec-label">Campaign Attribution</span>
                <strong className="detail-spec-val text-cyan">{lead.campaignName}</strong>
              </div>
            )}

            <div className="detail-spec-item">
              <span className="detail-spec-label">Lead Qualification Score</span>
              <strong className="detail-spec-val">{lead.score || 50} / 100</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Sales Owner</span>
              <strong className="detail-spec-val">{lead.owner || 'Unassigned'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Email Address</span>
              <strong className="detail-spec-val">{lead.email || 'Not provided'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Phone Number</span>
              <strong className="detail-spec-val">{lead.phone || 'Not provided'}</strong>
            </div>

            <div className="detail-spec-item">
              <span className="detail-spec-label">Captured Date</span>
              <strong className="detail-spec-val">{createdDate}</strong>
            </div>
          </div>

          {/* Quick Stage Transition */}
          <div className="detail-scopes-section mt-3">
            <span className="detail-spec-label">
              <Briefcase size={13} className="inline-icon" /> Move Opportunity Stage:
            </span>
            <div className="client-tags-cloud mt-2">
              {CRM_STAGES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  className={`client-pill-tag clickable ${lead.stage === st.value ? 'active' : ''}`}
                  onClick={() => handleStageSelect(st.value)}
                  style={{
                    cursor: 'pointer',
                    background: lead.stage === st.value ? `${st.color}30` : undefined,
                    borderColor: lead.stage === st.value ? st.color : undefined,
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-dialog-footer between mt-4">
            <button
              type="button"
              className="btn-delete-member"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Archive Lead"
            >
              <Trash2 size={15} />
              <span>{isDeleting ? 'Archiving...' : 'Archive Lead'}</span>
            </button>

            <button
              type="button"
              className="btn-saas-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadDetailModal;
