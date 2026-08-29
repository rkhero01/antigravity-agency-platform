import React from 'react';
import { Badge } from '../common/Badge.jsx';
import {
  Clock,
  CheckCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';

export function ContentListView({ posts, onSelectPost, onUpdateStatus }) {
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
    <div className="content-list-table-container">
      <table className="saas-table content-feed-table">
        <thead>
          <tr>
            <th>Creative Asset & Caption</th>
            <th>Client</th>
            <th>Format</th>
            <th>Target Platforms</th>
            <th>Scheduled For</th>
            <th>Author</th>
            <th>Status</th>
            <th>Workflow Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="content-feed-row">
              {/* Asset & Caption */}
              <td>
                <div className="content-asset-cell">
                  <img
                    src={post.mediaPreview}
                    alt={post.title}
                    className="content-row-thumb"
                  />
                  <div className="content-text-group">
                    <strong
                      className="post-row-title clickable"
                      onClick={() => onSelectPost(post)}
                    >
                      {post.title}
                    </strong>
                    <p className="post-row-caption-snippet">{post.caption}</p>
                    <div className="post-row-hashtags">
                      {post.hashtags?.slice(0, 3).map((h) => (
                        <span key={h} className="hashtag-mini-chip">
                          {h}
                        </span>
                      ))}
                      {post.hashtags?.length > 3 && (
                        <span className="hashtag-more-count">
                          +{post.hashtags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              {/* Client */}
              <td>
                <span className="post-client-name">🏢 {post.clientName}</span>
              </td>

              {/* Format */}
              <td>
                <span className="post-format-badge">{post.type}</span>
              </td>

              {/* Target Platforms */}
              <td>
                <div className="post-platforms-cell">
                  {post.platforms?.map((plat) => (
                    <span key={plat} className="channel-mini-pill">
                      {plat}
                    </span>
                  ))}
                </div>
              </td>

              {/* Scheduled For */}
              <td>
                <div className="schedule-time-cell">
                  <span className="schedule-date-text">{post.scheduledDate}</span>
                  <span className="schedule-hour-text">
                    <Clock size={11} /> {post.scheduledTime}
                  </span>
                </div>
              </td>

              {/* Author */}
              <td>
                <span className="author-text">{post.author}</span>
              </td>

              {/* Status */}
              <td>
                <Badge variant={getStatusVariant(post.status)} size="sm">
                  {post.status}
                </Badge>
              </td>

              {/* Quick Actions */}
              <td>
                <div className="post-row-actions">
                  {post.status === 'In Review' && (
                    <button
                      type="button"
                      className="btn-action-pill approve"
                      onClick={() => onUpdateStatus(post.id, 'Approved')}
                      title="Approve Post"
                    >
                      <CheckCircle size={13} />
                      <span>Approve</span>
                    </button>
                  )}
                  {post.status === 'Approved' && (
                    <button
                      type="button"
                      className="btn-action-pill schedule"
                      onClick={() => onUpdateStatus(post.id, 'Scheduled')}
                      title="Lock & Schedule"
                    >
                      <Clock size={13} />
                      <span>Schedule</span>
                    </button>
                  )}
                  {post.status === 'Draft' && (
                    <button
                      type="button"
                      className="btn-action-pill review"
                      onClick={() => onUpdateStatus(post.id, 'In Review')}
                      title="Send for Review"
                    >
                      <Eye size={13} />
                      <span>Review</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-icon-more"
                    onClick={() => onSelectPost(post)}
                    title="Inspect Details"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContentListView;
