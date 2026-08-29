import React from 'react';
import { MessageSquare, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export function InboxThreadList({
  conversations = [],
  selectedConvId,
  onSelectConversation,
}) {
  const getSentimentVariant = (sentiment) => {
    switch (sentiment) {
      case 'Lead Opportunity':
        return 'leads';
      case 'Urgent Issue':
        return 'urgent';
      case 'Question':
        return 'question';
      case 'Positive':
        return 'positive';
      default:
        return 'default';
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="inbox-threads-empty">
        <MessageSquare size={28} className="empty-icon-muted" />
        <span>No matching conversations found</span>
      </div>
    );
  }

  return (
    <div className="inbox-threads-list-scroll">
      {conversations.map((conv) => {
        const isSelected = selectedConvId === conv.id;
        const sentimentClass = getSentimentVariant(conv.sentiment);

        return (
          <div
            key={conv.id}
            className={`inbox-thread-item ${isSelected ? 'selected' : ''} ${conv.unread ? 'unread-thread' : ''}`}
            onClick={() => onSelectConversation(conv)}
          >
            <div className="thread-avatar-box">
              <img
                src={conv.customer.avatar}
                alt={conv.customer.name}
                className="customer-avatar-img"
              />
              {conv.unread && <span className="thread-unread-dot" />}
            </div>

            <div className="thread-content-box">
              <div className="thread-top-line">
                <strong className="thread-customer-name">{conv.customer.name}</strong>
                <span className="thread-time-text">{conv.lastMessageTime}</span>
              </div>

              <div className="thread-meta-tags-line">
                <span className="thread-client-pill">🏢 {conv.clientName}</span>
                <span className="thread-platform-pill">{conv.platform}</span>
                <span className={`sentiment-pill ${sentimentClass}`}>
                  {conv.sentiment}
                </span>
              </div>

              <p className="thread-last-msg-snippet">{conv.lastMessage}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default InboxThreadList;
