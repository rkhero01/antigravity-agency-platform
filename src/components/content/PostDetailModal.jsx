import React from 'react';
import {
  X,
  Clock,
  CheckCircle,
  Trash2,
  User,
  Calendar,
  Send,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  onUpdateStatus,
  onDeletePost,
}) {
  if (!isOpen || !post) return null;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'success';
      case 'Approved':
        return 'info';
      case 'In Review':
        return 'warning';
      case 'Published':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card post-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div>
              <div className="detail-top-tags">
                <span className="post-format-badge">{post.type}</span>
                <Badge variant={getStatusVariant(post.status)} size="sm">
                  {post.status}
                </Badge>
              </div>
              <h3 className="modal-title">{post.title}</h3>
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

        {/* Content Body */}
        <div className="post-detail-modal-body">
          <div className="detail-preview-layout">
            <div className="detail-media-pane">
              <img
                src={post.mediaPreview}
                alt={post.title}
                className="detail-main-media-img"
              />
            </div>

            <div className="detail-info-pane">
              <div className="detail-meta-box">
                <div className="meta-line">
                  <span className="meta-label">Client Workspace:</span>
                  <strong>🏢 {post.clientName}</strong>
                </div>
                <div className="meta-line">
                  <span className="meta-label">Scheduled Date:</span>
                  <span>
                    <Calendar size={13} /> {post.scheduledDate} at {post.scheduledTime}
                  </span>
                </div>
                <div className="meta-line">
                  <span className="meta-label">Author:</span>
                  <span>
                    <User size={13} /> {post.author}
                  </span>
                </div>
              </div>

              <div className="detail-platforms-box">
                <span className="meta-label">Target Channels:</span>
                <div className="platforms-row-pills">
                  {post.platforms?.map((plat) => (
                    <span key={plat} className="channel-mini-pill">
                      {plat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-caption-box">
                <span className="meta-label">Caption:</span>
                <p className="detail-caption-text">{post.caption}</p>
              </div>

              <div className="detail-hashtags-box">
                {post.hashtags?.map((h) => (
                  <span key={h} className="hashtag-mini-chip">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-dialog-footer post-detail-footer">
          <button
            type="button"
            className="btn-delete-icon-only"
            onClick={() => {
              onDeletePost(post.id);
              onClose();
            }}
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>

          <div className="detail-workflow-btns">
            {post.status !== 'Approved' && (
              <button
                type="button"
                className="btn-saas-secondary"
                onClick={() => {
                  onUpdateStatus(post.id, 'Approved');
                  onClose();
                }}
              >
                <CheckCircle size={14} />
                <span>Mark as Approved</span>
              </button>
            )}
            {post.status !== 'Scheduled' && (
              <button
                type="button"
                className="btn-saas-primary"
                onClick={() => {
                  onUpdateStatus(post.id, 'Scheduled');
                  onClose();
                }}
              >
                <Clock size={14} />
                <span>Lock & Schedule</span>
              </button>
            )}
            {post.status !== 'Published' && (
              <button
                type="button"
                className="btn-saas-primary"
                onClick={() => {
                  onUpdateStatus(post.id, 'Published');
                  onClose();
                }}
              >
                <Send size={14} />
                <span>Publish Now</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailModal;
