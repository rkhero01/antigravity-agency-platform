import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  Share2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function PortalContentReviewTab({
  posts = [],
  onApprovePost,
  onRequestRevision,
}) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredPosts = posts.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="portal-content-review-pane">
      {/* Pane Header & Filter */}
      <div className="review-pane-header-row">
        <div>
          <h3 className="pane-title">Scheduled Content Pipeline</h3>
          <p className="pane-desc">
            Review upcoming posts and reels. Click "Approve Post" to authorize publishing or request adjustments.
          </p>
        </div>

        <div className="status-filter-pills-row">
          <button
            type="button"
            className={`filter-pill-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Posts ({posts.length})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${filterStatus === 'Needs Approval' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Needs Approval')}
          >
            Needs Approval ({posts.filter((p) => p.status === 'Needs Approval').length})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${filterStatus === 'Approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Approved')}
          >
            Approved ({posts.filter((p) => p.status === 'Approved').length})
          </button>
        </div>
      </div>

      {/* Posts Review Grid */}
      <div className="portal-posts-review-grid">
        {filteredPosts.map((post) => {
          const isApproved = post.status === 'Approved';
          const isPending = post.status === 'Needs Approval';
          const isRevision = post.status === 'Changes Requested';

          return (
            <div
              key={post.id}
              className={`portal-post-review-card ${isApproved ? 'post-approved' : ''}`}
            >
              {/* Media Preview */}
              <div className="post-media-box">
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="post-media-img"
                />
                <span className="post-platform-ribbon">{post.platform} • {post.type}</span>
              </div>

              {/* Body */}
              <div className="post-review-body">
                <div className="post-meta-row">
                  <span className="post-schedule-tag">
                    <Clock size={11} className="inline-icon" /> {post.scheduledDate}
                  </span>
                  {isApproved ? (
                    <span className="status-pill-badge connected">
                      <CheckCircle2 size={11} /> Approved
                    </span>
                  ) : isRevision ? (
                    <span className="status-pill-badge reauth">
                      <MessageSquare size={11} /> Changes Requested
                    </span>
                  ) : (
                    <span className="status-pill-badge expiring">
                      <AlertCircle size={11} /> Needs Approval
                    </span>
                  )}
                </div>

                <h4 className="post-review-title">{post.title}</h4>

                <p className="post-review-caption">{post.caption}</p>
                <div className="post-review-hashtags">{post.hashtags}</div>

                {/* Feedback Bubble if exists */}
                {post.feedback && (
                  <div className="post-feedback-bubble">
                    <MessageSquare size={13} className="text-primary" />
                    <span><strong>Client Feedback:</strong> {post.feedback}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="post-review-actions-footer">
                  {!isApproved ? (
                    <>
                      <button
                        type="button"
                        className="btn-request-revision"
                        onClick={() => onRequestRevision(post)}
                      >
                        <MessageSquare size={13} />
                        <span>Request Edits</span>
                      </button>

                      <button
                        type="button"
                        className="btn-approve-post-primary"
                        onClick={() => onApprovePost(post.id)}
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve Post</span>
                      </button>
                    </>
                  ) : (
                    <div className="approved-confirmed-box">
                      <CheckCircle2 size={14} className="text-success" />
                      <span>Authorized for Automated Publishing</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PortalContentReviewTab;
