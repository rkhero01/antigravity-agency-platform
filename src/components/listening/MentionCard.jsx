import React from 'react';
import { ExternalLink, Sparkles, MessageSquare, Globe } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function MentionCard({
  mention,
  onAiReply,
}) {
  const getSentimentBadge = (sentiment, score) => {
    if (sentiment === 'Positive') {
      return (
        <span className="sentiment-pill positive" title={`${score}% Positive Confidence`}>
          🟢 Positive ({score}%)
        </span>
      );
    }
    if (sentiment === 'Negative') {
      return (
        <span className="sentiment-pill negative" title={`${score}% Negative Confidence`}>
          🔴 Negative ({score}%)
        </span>
      );
    }
    return (
      <span className="sentiment-pill neutral" title={`${score}% Neutral Confidence`}>
        ⚪ Neutral ({score}%)
      </span>
    );
  };

  const getPlatformClass = (platform) => {
    if (platform === 'Reddit') return 'platform-reddit';
    if (platform === 'Twitter') return 'platform-twitter';
    if (platform === 'TikTok') return 'platform-tiktok';
    return 'platform-trustpilot';
  };

  return (
    <div className="mention-card-item">
      {/* Header */}
      <div className="mention-card-header">
        <div className="flex items-center gap-2">
          <div className="mention-author-avatar">
            {mention.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong className="mention-author-name">{mention.author}</strong>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className={`platform-badge-mini ${getPlatformClass(mention.platform)}`}>
                {mention.platform}
              </span>
              <span>• {mention.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mention-client-chip">🏢 {mention.clientName}</span>
          {getSentimentBadge(mention.sentiment, mention.sentimentScore)}
        </div>
      </div>

      {/* Mention Body */}
      <p className="mention-text-body">"{mention.text}"</p>

      {/* Footer */}
      <div className="mention-card-footer">
        <div className="flex items-center gap-2">
          <span className="mention-topic-chip">#{mention.topic}</span>
          <span className="mention-reach-chip">👁️ {mention.reach}</span>
        </div>

        <div className="mention-footer-actions">
          <a
            href={mention.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-mention-source"
            title="Open original thread"
          >
            <ExternalLink size={12} />
            <span>Source</span>
          </a>

          <button
            type="button"
            className="btn-ai-quick-reply"
            onClick={() => onAiReply(mention)}
          >
            <Sparkles size={12} />
            <span>AI Response</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MentionCard;
