import React from 'react';
import { Badge } from '../common/Badge.jsx';
import { Clock, Heart, MessageCircle } from 'lucide-react';

export function ContentGridView({ posts, onSelectPost }) {
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
    <div className="content-media-grid">
      {posts.map((post) => (
        <div
          key={post.id}
          className="content-media-card"
          onClick={() => onSelectPost(post)}
        >
          {/* Media Container with Badges */}
          <div className="media-preview-box">
            <img
              src={post.mediaPreview}
              alt={post.title}
              className="media-card-img"
            />
            <div className="media-top-badges">
              <span className="media-format-pill">{post.type}</span>
              <Badge variant={getStatusVariant(post.status)} size="sm">
                {post.status}
              </Badge>
            </div>
            <div className="media-bottom-platforms">
              {post.platforms?.map((p) => (
                <span key={p} className="media-platform-dot-tag">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="media-card-body">
            <div className="media-client-meta">
              <span className="media-client-name">🏢 {post.clientName}</span>
              <span className="media-schedule-time">
                <Clock size={11} /> {post.scheduledDate} ({post.scheduledTime})
              </span>
            </div>

            <h4 className="media-card-title">{post.title}</h4>
            <p className="media-card-caption">{post.caption}</p>

            <div className="media-card-hashtags">
              {post.hashtags?.slice(0, 3).map((h) => (
                <span key={h} className="hashtag-mini-chip">
                  {h}
                </span>
              ))}
            </div>

            {post.likesCount > 0 && (
              <div className="media-engagement-strip">
                <span><Heart size={12} className="text-danger" /> {post.likesCount}</span>
                <span><MessageCircle size={12} className="text-cyan" /> {post.commentsCount}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContentGridView;
