import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  Zap,
  Image,
} from 'lucide-react';

export function InboxChatView({
  conversation,
  onSendReply,
  onUpdateStatus,
  onAssignStaff,
}) {
  const [replyText, setReplyText] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  if (!conversation) {
    return (
      <div className="inbox-chat-empty-viewport">
        <MessageSquare size={36} className="empty-icon-muted" />
        <h4>Select a conversation to engage</h4>
        <p>View customer inquiries, AI reply suggestions, and full response histories</p>
      </div>
    );
  }

  const handleSend = (e) => {
    e?.preventDefault();
    if (!replyText.trim()) return;

    onSendReply(conversation.id, replyText.trim());
    setReplyText('');
  };

  const handleInsertAISuggestion = (suggestionText) => {
    setReplyText(suggestionText);
  };

  const handleGenerateAI = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setReplyText(
        `Hi ${conversation.customer.name}! Thank you for reaching out to ${conversation.clientName}. We are glad to help! Please let us know if you need any further assistance.`
      );
      setIsGeneratingAI(false);
    }, 400);
  };

  return (
    <div className="inbox-chat-view-container">
      {/* Thread Header */}
      <div className="chat-view-header">
        <div className="chat-customer-info-block">
          <img
            src={conversation.customer.avatar}
            alt={conversation.customer.name}
            className="chat-header-avatar"
          />
          <div>
            <div className="chat-customer-name-row">
              <strong className="chat-customer-name">{conversation.customer.name}</strong>
              <span className="chat-customer-handle">{conversation.customer.handle}</span>
            </div>
            <div className="chat-meta-pills">
              <span className="chat-client-tag">🏢 {conversation.clientName}</span>
              <span className="chat-platform-tag">{conversation.platform} • {conversation.type}</span>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          {/* Status Dropdown */}
          <select
            value={conversation.status}
            onChange={(e) => onUpdateStatus(conversation.id, e.target.value)}
            className="chat-status-select"
          >
            <option value="Open">Status: Open</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Resolved">Status: Resolved</option>
          </select>

          {/* Assigned Staff */}
          <select
            value={conversation.assignedTo}
            onChange={(e) => onAssignStaff(conversation.id, e.target.value)}
            className="chat-staff-select"
          >
            <option value="Alex Morgan">Lead: Alex Morgan</option>
            <option value="Sarah Vance">Lead: Sarah Vance</option>
            <option value="Elena Rostova">Lead: Elena Rostova</option>
            <option value="Devon Miles">Lead: Devon Miles</option>
          </select>
        </div>
      </div>

      {/* Target Post Context (if comment) */}
      {conversation.postContext && (
        <div className="chat-post-context-banner">
          <img
            src={conversation.postContext.thumbnail}
            alt={conversation.postContext.title}
            className="context-post-thumb"
          />
          <div className="context-post-info">
            <span className="context-post-lbl">Comment on {conversation.postContext.platform}:</span>
            <strong className="context-post-title">{conversation.postContext.title}</strong>
          </div>
        </div>
      )}

      {/* Message History Feed */}
      <div className="chat-messages-feed">
        {conversation.messages.map((msg) => {
          const isAgency = msg.sender === 'agency';
          return (
            <div
              key={msg.id}
              className={`chat-message-row ${isAgency ? 'agency-row' : 'customer-row'}`}
            >
              <div className={`chat-message-bubble ${isAgency ? 'agency-bubble' : 'customer-bubble'}`}>
                <p className="msg-text">{msg.text}</p>
                <span className="msg-timestamp">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Smart Reply Assistant Box */}
      <div className="ai-smart-reply-box">
        <div className="ai-reply-header-row">
          <div className="ai-reply-title">
            <Sparkles size={14} className="text-primary" />
            <span>AI Smart Reply Suggestions</span>
          </div>
          <button
            type="button"
            className="btn-regenerate-ai"
            onClick={handleGenerateAI}
            disabled={isGeneratingAI}
          >
            <Zap size={12} />
            <span>{isGeneratingAI ? 'Generating...' : 'Auto-Draft AI'}</span>
          </button>
        </div>

        {conversation.aiSuggestions && conversation.aiSuggestions.length > 0 ? (
          <div className="ai-suggestions-chips-grid">
            {conversation.aiSuggestions.map((sug, idx) => (
              <div
                key={idx}
                className="ai-suggestion-chip-card"
                onClick={() => handleInsertAISuggestion(sug.text)}
                title="Click to insert into reply composer"
              >
                <span className="sug-tone-badge">{sug.tone}</span>
                <p className="sug-text-excerpt">{sug.text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Reply Composer Form */}
      <form onSubmit={handleSend} className="chat-reply-composer-form">
        <div className="composer-textarea-wrapper">
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${conversation.customer.name} as ${conversation.clientName}...`}
            className="chat-reply-textarea"
          />
          <button
            type="submit"
            className="btn-send-chat-reply"
            disabled={!replyText.trim()}
          >
            <Send size={15} />
            <span>Send Reply</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default InboxChatView;
