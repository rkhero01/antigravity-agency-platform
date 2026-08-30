import React, { useState } from 'react';
import {
  X,
  Calendar,
  Building,
  Target,
  Share2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  Share,
  Edit2,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { CONTENT_STATUSES } from '../../services/contentService.js';
import { publishingService } from '../../services/publishingService.js';

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onUpdateStatus,
  onDeletePost,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !post) return null;

  const handleDelete = async () => {
    const confirm = window.confirm(
      `Are you sure you want to archive post "${post.title}"? It will be soft-deleted in PostgreSQL.`
    );
    if (!confirm) return;

    setIsDeleting(true);
    setFeedback(null);
    try {
      await onDeletePost(post.id);
      onClose();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to archive post.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateStatus(post.id, newStatus);
      setFeedback({ type: 'success', text: `Post status updated to ${newStatus}` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update post status.' });
    }
  };

  const handlePublishNow = async () => {
    if (!post.socialAccountId) {
      setFeedback({
        type: 'error',
        text: 'No linked social channel account assigned to this post. Please edit the post to attach an authorized channel.',
      });
      return;
    }

    setIsPublishing(true);
    setFeedback(null);
    try {
      // 1. Queue job
      const job = await publishingService.queuePublish({
        contentItemId: post.id,
        socialAccountId: post.socialAccountId,
        platform: post.platformRaw || post.platform,
      });

      // 2. Dispatch job
      const dispatchRes = await publishingService.publishNow(job.id);
      if (dispatchRes.result?.status === 'CONFIGURATION_REQUIRED') {
        setFeedback({
          type: 'warning',
          text: `[OAuth Gated]: ${dispatchRes.result.error}`,
        });
      } else if (dispatchRes.result?.success) {
        setFeedback({
          type: 'success',
          text: `Successfully published to ${post.platform}! External ID: ${dispatchRes.result.externalPostId}`,
        });
        await onUpdateStatus(post.id, 'Published');
      } else {
        setFeedback({
          type: 'error',
          text: dispatchRes.result?.error || 'Publishing attempt failed.',
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Publishing failed.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const scheduledDisplay = post.scheduledAt
    ? new Date(post.scheduledAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not scheduled';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card post-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="modal-title">{post.title}</h3>
              <p className="modal-subtitle">{post.platform} &bull; {post.type || post.format}</p>
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
            className={`modal-${feedback.type === 'error' ? 'error' : feedback.type === 'warning' ? 'error' : 'success'}-banner`}
            role="status"
          >
            {feedback.type === 'error' || feedback.type === 'warning' ? (
              <AlertCircle size={16} className="error-banner-icon" />
            ) : (
              <CheckCircle2 size={16} className="success-banner-icon" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="modal-form-body">
          {/* Post Image & Metadata Layout */}
          <div className="post-detail-grid-layout">
            <div className="post-detail-media-box">
              <img
                src={post.mediaPreview || post.mediaUrl}
                alt={post.title}
                className="post-detail-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            <div className="post-detail-info-col">
              <div className="client-details-grid-spec">
                <div className="detail-spec-item">
                  <span className="detail-spec-label">Assigned Client</span>
                  <strong className="detail-spec-val">{post.clientName || 'Assigned Client'}</strong>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Current Stage</span>
                  <div>
                    <Badge variant={post.statusVariant || 'primary'}>
                      {post.status}
                    </Badge>
                  </div>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Scheduled Publish</span>
                  <strong className="detail-spec-val text-cyan">{scheduledDisplay}</strong>
                </div>

                <div className="detail-spec-item">
                  <span className="detail-spec-label">Author / Creator</span>
                  <strong className="detail-spec-val">{post.author || 'Alex Morgan'}</strong>
                </div>

                {post.socialAccountName && (
                  <div className="detail-spec-item">
                    <span className="detail-spec-label">Linked Social Channel</span>
                    <strong className="detail-spec-val text-cyan">{post.socialAccountName}</strong>
                  </div>
                )}

                {post.campaignName && (
                  <div className="detail-spec-item">
                    <span className="detail-spec-label">Campaign Link</span>
                    <strong className="detail-spec-val text-gold">{post.campaignName}</strong>
                  </div>
                )}
              </div>

              {/* Caption Box */}
              <div className="post-caption-box mt-3">
                <span className="detail-spec-label">Caption & Copy:</span>
                <p className="post-caption-text">{post.caption || 'No caption text.'}</p>
              </div>

              {/* Status Transition Action Buttons */}
              <div className="detail-scopes-section mt-3">
                <span className="detail-spec-label">
                  <Edit2 size={13} className="inline-icon" /> Editorial Stage Transition:
                </span>
                <div className="client-tags-cloud mt-2">
                  {CONTENT_STATUSES.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      className={`client-pill-tag clickable ${
                        (post.statusRaw || '').toUpperCase() === st.value || post.status === st.label
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleStatusChange(st.label)}
                      style={{ cursor: 'pointer' }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-dialog-footer between mt-4">
            <button
              type="button"
              className="btn-delete-member"
              onClick={handleDelete}
              disabled={isDeleting || isPublishing}
              title="Archive Post"
            >
              <Trash2 size={15} />
              <span>{isDeleting ? 'Archiving...' : 'Archive Post'}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn-saas-secondary"
                onClick={onClose}
              >
                Close
              </button>

              <button
                type="button"
                className="btn-saas-primary"
                onClick={handlePublishNow}
                disabled={isPublishing}
              >
                <Send size={14} className={isPublishing ? 'animate-spin' : ''} />
                <span>{isPublishing ? 'Dispatching...' : 'Publish to Channel Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailModal;
