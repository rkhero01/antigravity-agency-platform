import React from 'react';
import { Trophy, Heart, MessageCircle, Share2, Bookmark, Eye, Zap } from 'lucide-react';

export function TopContentLeaderboard({ posts = [], onInspectPost }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="analytics-leaderboard-card">
      <div className="leaderboard-header">
        <div className="leaderboard-title-group">
          <Trophy size={16} className="text-warning" />
          <h3 className="leaderboard-main-title">Top Performing Content Leaderboard</h3>
        </div>
        <span className="leaderboard-subtext">Ranked by Engagement & Viral Reach</span>
      </div>

      <div className="leaderboard-grid">
        {posts.map((post, idx) => (
          <div key={post.id || idx} className="top-post-card">
            <div className="top-post-thumb-box">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="top-post-img"
              />
              <span className="rank-badge-ribbon">#{idx + 1}</span>
              <span className="platform-format-pill">{post.platform}</span>
            </div>

            <div className="top-post-content-body">
              <span className="post-client-tag">🏢 {post.clientName}</span>
              <h4 className="top-post-title">{post.title}</h4>

              {/* Engagement Rate Badge */}
              <div className="top-post-eng-strip">
                <span className="eng-rate-badge">
                  <Zap size={11} /> {post.engagementRate} Eng. Rate
                </span>
                <span className="views-count">
                  <Eye size={12} /> {post.views} Views
                </span>
              </div>

              {/* Interaction Metrics */}
              <div className="interactions-row">
                <span title="Likes"><Heart size={12} className="text-danger" /> {post.likes}</span>
                <span title="Comments"><MessageCircle size={12} className="text-cyan" /> {post.comments}</span>
                <span title="Shares"><Share2 size={12} className="text-primary" /> {post.shares}</span>
                <span title="Saves"><Bookmark size={12} className="text-warning" /> {post.saves}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopContentLeaderboard;
