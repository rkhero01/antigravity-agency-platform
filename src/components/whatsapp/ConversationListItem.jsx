import React from 'react';
import { Star, Flame, Award, CheckCircle2, MessageCircle } from 'lucide-react';

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
}) {
  const getScorePill = (score, leadStage) => {
    let category = 'COLD';
    let styleClass = 'cold';
    if (score >= 90) {
      category = 'VIP';
      styleClass = 'vip';
    } else if (score >= 80) {
      category = 'HOT';
      styleClass = 'hot';
    } else if (score >= 60) {
      category = 'WARM';
      styleClass = 'warm';
    }

    return (
      <span className={`wa-score-chip ${styleClass}`}>
        {score >= 90 ? <Star size={10} className="fill-warning text-warning" /> : null}
        {score >= 80 && score < 90 ? <Flame size={10} /> : null}
        <span>{score} — {category}</span>
      </span>
    );
  };

  const getSentimentIndicator = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return <span className="sentiment-dot positive" title="Positive Customer Sentiment" />;
      case 'Negative':
        return <span className="sentiment-dot negative" title="Negative / At Risk Sentiment" />;
      default:
        return <span className="sentiment-dot neutral" title="Neutral Customer Sentiment" />;
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Won':
        return <span className="wa-stage-badge won"><Award size={10} /> Won</span>;
      case 'Proposal':
      case 'Negotiation':
        return <span className="wa-stage-badge active">{stage}</span>;
      case 'Qualified':
        return <span className="wa-stage-badge qualified">Qualified</span>;
      default:
        return <span className="wa-stage-badge">{stage}</span>;
    }
  };

  return (
    <div
      className={`wa-conversation-list-item ${isSelected ? 'selected' : ''} ${conversation.unreadCount > 0 ? 'unread' : ''}`}
      onClick={() => onSelect(conversation)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(conversation);
        }
      }}
    >
      {/* Avatar with Status & Sentiment */}
      <div className="wa-item-avatar-wrap">
        <img
          src={conversation.avatar}
          alt={conversation.contactName}
          className="wa-item-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
          }}
        />
        {getSentimentIndicator(conversation.sentiment)}
      </div>

      {/* Item Content */}
      <div className="wa-item-content">
        <div className="wa-item-top-row">
          <div className="flex items-center gap-1.5 min-w-0">
            {conversation.isPriority && (
              <Star size={12} className="fill-warning text-warning flex-shrink-0" />
            )}
            <strong className="wa-contact-name truncate">{conversation.contactName}</strong>
          </div>
          <span className="wa-item-time flex-shrink-0">{conversation.lastMessageTime}</span>
        </div>

        {/* Client Tag & Phone */}
        <div className="wa-item-sub-row">
          <span className="wa-client-sub">{conversation.clientName}</span>
          <span className="wa-phone-sub">{conversation.phone}</span>
        </div>

        {/* Message Snippet */}
        <p className="wa-last-message-snippet truncate">
          {conversation.lastMessage}
        </p>

        {/* Bottom Metadata Badges */}
        <div className="wa-item-bottom-row">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getScorePill(conversation.leadScore, conversation.leadStage)}
            {getStageBadge(conversation.leadStage)}
            {conversation.tags && conversation.tags[0] && (
              <span className="wa-mini-tag">🏷️ {conversation.tags[0]}</span>
            )}
          </div>

          {conversation.unreadCount > 0 && (
            <span className="wa-unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationListItem;
