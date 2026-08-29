import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MessageSquare,
  Star,
  Flame,
  Award,
  CheckCircle2,
  Check,
  RotateCcw,
  ExternalLink,
  UserCheck,
  Tag,
  Info,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ConversationComposer } from './ConversationComposer.jsx';
import { whatsappTeamMembers } from '../../data/mockWhatsApp.js';

export function ConversationChat({
  conversation,
  onSendMessage,
  onSendTemplate,
  onTogglePriority,
  onUpdateStatus,
  onUpdateLeadStage,
  onAssignStaff,
  teamMembers = whatsappTeamMembers,
}) {
  const [showIntelligence, setShowIntelligence] = useState(true);
  const [messagesHistory, setMessagesHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      // Build realistic message thread history
      const initialThread = [
        {
          id: 'msg-1',
          sender: 'contact',
          text: `Hi, I saw your ${conversation.campaign || 'campaign'} on ${conversation.source || 'WhatsApp'}. I had a few questions regarding pricing and availability.`,
          time: '10:14 AM',
          status: 'read',
        },
        {
          id: 'msg-2',
          sender: 'agent',
          text: `Namaste ${conversation.contactName}! 🙏 Thanks for connecting with ${conversation.clientName}. We are glad to help you. Here is our overview brochure and pricing guide.`,
          time: '10:15 AM',
          status: 'read',
        },
        {
          id: 'msg-3',
          sender: 'contact',
          text: conversation.lastMessage,
          time: conversation.lastMessageTime || '10:18 AM',
          status: 'read',
        },
      ];
      setMessagesHistory(initialThread);
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messagesHistory]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendNewMessage = (text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      text,
      time: 'Just now',
      status: 'sent',
    };
    setMessagesHistory((prev) => [...prev, newMsg]);
    onSendMessage(text);
  };

  const handleSendTemplateMessage = (templateId, vars) => {
    onSendTemplate(templateId, vars);
    const templateMsg = {
      id: `msg-tmpl-${Date.now()}`,
      sender: 'agent',
      text: `[Meta Template: ${templateId}] Verified broadcast parameters applied.`,
      time: 'Just now',
      status: 'delivered',
    };
    setMessagesHistory((prev) => [...prev, templateMsg]);
  };

  if (!conversation) {
    return (
      <div className="wa-empty-chat-placeholder">
        <div className="empty-chat-inner">
          <MessageSquare size={48} className="text-success opacity-40 mb-3" />
          <h3 className="text-white text-base font-bold">Select a WhatsApp Conversation</h3>
          <p className="text-xs text-muted max-w-[280px]">
            Choose a contact from the inbox list on the left to start live chatting, send Meta templates, and update CRM lead stages.
          </p>
        </div>
      </div>
    );
  }

  const isResolved = conversation.status === 'Resolved';

  return (
    <div className="wa-conversation-chat-pane">
      {/* Active Chat Header */}
      <div className="wa-chat-header-bar">
        <div className="flex items-center gap-3 min-w-0">
          <div className="wa-chat-avatar-wrap">
            <img
              src={conversation.avatar}
              alt={conversation.contactName}
              className="wa-chat-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <span className="wa-online-dot" title="Online on WhatsApp" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="wa-chat-name truncate">{conversation.contactName}</h3>
              <button
                type="button"
                className={`btn-toggle-priority ${conversation.isPriority ? 'active' : ''}`}
                onClick={() => onTogglePriority(conversation.id)}
                title={conversation.isPriority ? 'VIP Priority Lead' : 'Mark as VIP'}
              >
                <Star size={13} className={conversation.isPriority ? 'fill-warning text-warning' : ''} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{conversation.phone}</span>
              <span>•</span>
              <span className="text-primary font-medium">🏢 {conversation.clientName}</span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="wa-chat-header-actions">
          {/* Quick Staff Reassignment */}
          <div className="wa-staff-select-pill">
            <UserCheck size={12} className="text-cyan" />
            <select
              value={conversation.assignedTo}
              onChange={(e) => onAssignStaff(conversation.id, e.target.value)}
              className="wa-mini-staff-select"
            >
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.name}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Assign to Me */}
          <button
            type="button"
            className="btn-chat-action text-xs"
            onClick={async () => {
              await whatsappService.assignConversationToMe(conversation.id);
              onAssignStaff(conversation.id, 'Elena Rostova');
            }}
            title="Assign this conversation to me"
          >
            <UserCheck size={13} className="text-primary" />
            <span className="hidden md:inline">Assign to Me</span>
          </button>

          {/* Auto-Assign */}
          <button
            type="button"
            className="btn-chat-action text-xs"
            onClick={async () => {
              const res = await whatsappService.autoAssignConversation(conversation.id);
              if (res) onAssignStaff(conversation.id, res.assignedTo);
            }}
            title="AI Smart Auto-Assign"
          >
            <Sparkles size={13} className="text-warning" />
            <span className="hidden md:inline">Auto-Assign</span>
          </button>

          {/* WhatsApp Direct Link */}
          <a
            href={`https://wa.me/${conversation.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="btn-chat-action whatsapp"
            title="Open in WhatsApp Web"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">WhatsApp Web</span>
          </a>

          {/* Call Link */}
          <a
            href={`tel:${conversation.phone}`}
            className="btn-chat-action call"
            title="Call Contact"
          >
            <Phone size={13} />
          </a>

          {/* Resolve / Reopen Button */}
          <button
            type="button"
            className={`btn-chat-action ${isResolved ? 'reopen' : 'resolve'}`}
            onClick={() => onUpdateStatus(conversation.id, isResolved ? 'Open' : 'Resolved')}
          >
            {isResolved ? (
              <>
                <RotateCcw size={13} />
                <span>Reopen</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>Resolve</span>
              </>
            )}
          </button>

          {/* Toggle Intelligence Sidebar */}
          <button
            type="button"
            className={`btn-chat-action info ${showIntelligence ? 'active' : ''}`}
            onClick={() => setShowIntelligence(!showIntelligence)}
            title="Toggle Contact Intelligence"
          >
            <Info size={14} />
          </button>
        </div>
      </div>

      {/* Main Chat Body & Intelligence Split */}
      <div className="wa-chat-main-split">
        {/* Messages Thread Column */}
        <div className="wa-messages-thread-column">
          <div className="wa-messages-scroll-area">
            <div className="wa-date-divider">
              <span>Today</span>
            </div>

            {messagesHistory.map((msg) => {
              const isAgent = msg.sender === 'agent';
              const isTemplate = msg.text.startsWith('[Meta Template:');

              return (
                <div
                  key={msg.id}
                  className={`wa-message-bubble-row ${isAgent ? 'outgoing' : 'incoming'}`}
                >
                  <div className={`wa-bubble ${isAgent ? 'agent-bubble' : 'contact-bubble'}`}>
                    {isTemplate && (
                      <div className="template-indicator-tag">
                        <Sparkles size={11} /> Meta Verified Template
                      </div>
                    )}
                    <p className="wa-bubble-text">{msg.text}</p>
                    <div className="wa-bubble-meta">
                      <span className="wa-msg-time">{msg.time}</span>
                      {isAgent && (
                        <span className="wa-msg-ticks" title="Delivered & Read">
                          <Check size={12} className="text-cyan -mr-1.5" />
                          <Check size={12} className="text-cyan" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <ConversationComposer
            onSendMessage={handleSendNewMessage}
            onSendTemplate={handleSendTemplateMessage}
          />
        </div>

        {/* Right-side Contact Intelligence Panel */}
        {showIntelligence && (
          <div className="wa-contact-intelligence-panel">
            <div className="intelligence-header">
              <h4 className="intelligence-title">Contact Intelligence</h4>
              <span className="text-xs text-muted">WhatsApp CRM</span>
            </div>

            {/* CRM Synchronization Card */}
            <div className="intelligence-card-box highlight-crm">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <UserCheck size={13} />
                  <span>CRM Lead Sync</span>
                </span>
                <span className="text-[10px] text-success font-bold bg-success/15 px-2 py-0.5 rounded border border-success/30">
                  {conversation.crmSync?.synced ? '✓ Active Sync' : 'Ready'}
                </span>
              </div>
              <p className="text-[11px] text-muted mb-2">
                Bi-directional sync with Lead Generation &amp; CRM Pipeline
              </p>
              <button
                type="button"
                className="btn-wa-primary w-full justify-center text-xs py-1.5"
                onClick={async () => {
                  await whatsappService.syncConversationToCRM(conversation.id);
                  alert(`✓ Contact ${conversation.contactName} successfully synchronized to CRM Lead Pipeline!`);
                }}
              >
                <Sparkles size={12} />
                <span>Sync to CRM Lead</span>
              </button>
            </div>

            {/* Score & Stage Box */}
            <div className="intelligence-card-box">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-dim">AI Lead Score:</span>
                <span className={`wa-score-chip ${conversation.leadScore >= 90 ? 'vip' : 'hot'}`}>
                  {conversation.leadScore} / 100
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-dim">CRM Deal Stage:</span>
                <select
                  value={conversation.leadStage}
                  onChange={(e) => onUpdateLeadStage(conversation.id, e.target.value)}
                  className="wa-stage-select-box"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">🎉 Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-dim">Deal Value:</span>
                <strong className="text-success text-sm">
                  ₹{(conversation.revenue || 0).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Follow-up Management Card */}
            <div className="intelligence-card-box">
              <div className="flex justify-between items-center mb-1.5">
                <strong className="text-xs text-warning font-bold uppercase flex items-center gap-1">
                  <Clock size={12} /> Next Follow-up
                </strong>
                <span className="text-[10px] text-warning bg-warning/15 px-1.5 py-0.5 rounded border border-warning/30 font-bold">
                  {conversation.followUpStatus || 'Scheduled'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-white/5 mb-2 text-xs">
                <span className="text-white font-medium block">
                  {conversation.nextFollowUp || 'Tomorrow at 11:00 AM'}
                </span>
                <span className="text-dim text-[11px] block mt-0.5">
                  {conversation.followUpReason || 'High-intent demo consultation briefing'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="btn-saas-secondary text-[11px] flex-1 justify-center py-1"
                  onClick={async () => {
                    await whatsappService.completeFollowUp(conversation.id);
                    alert('✓ Follow-up marked as Completed in CRM timeline');
                  }}
                >
                  <CheckCircle2 size={11} className="text-success" />
                  <span>Complete</span>
                </button>
                <button
                  type="button"
                  className="btn-saas-secondary text-[11px] flex-1 justify-center py-1"
                  onClick={async () => {
                    const newDate = prompt('Enter new follow-up date/time:', 'Friday at 03:00 PM');
                    if (newDate) {
                      await whatsappService.scheduleFollowUp(conversation.id, {
                        followUpDate: newDate,
                        followUpTime: '',
                        reason: 'Rescheduled client consultation call',
                      });
                      alert(`✓ Follow-up rescheduled to ${newDate}`);
                    }
                  }}
                >
                  <RotateCcw size={11} />
                  <span>Reschedule</span>
                </button>
              </div>
            </div>

            {/* Attribution & Campaign Info */}
            <div className="intelligence-card-box">
              <strong className="text-xs text-primary block mb-2 font-bold uppercase">Attribution Source</strong>
              <div className="meta-info-item">
                <span className="lbl">Channel:</span>
                <span className="val text-white">{conversation.source}</span>
              </div>
              <div className="meta-info-item">
                <span className="lbl">Campaign:</span>
                <span className="val text-cyan truncate">{conversation.campaign}</span>
              </div>
              <div className="meta-info-item">
                <span className="lbl">Avg Response:</span>
                <span className="val text-success">{conversation.responseTime}</span>
              </div>
            </div>

            {/* Tags List */}
            <div className="intelligence-card-box">
              <strong className="text-xs text-white block mb-2 font-bold uppercase">Contact Tags</strong>
              <div className="flex items-center gap-1.5 flex-wrap">
                {conversation.tags?.map((tag, idx) => (
                  <span key={idx} className="wa-tag-pill">
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="intelligence-card-box">
              <strong className="text-xs text-dim block mb-2 font-bold uppercase">Quick Actions</strong>
              <button
                type="button"
                className="btn-saas-secondary w-full justify-center text-xs mb-2"
                onClick={() => onTogglePriority(conversation.id)}
              >
                <Star size={12} className={conversation.isPriority ? 'fill-warning text-warning' : ''} />
                <span>{conversation.isPriority ? 'Remove VIP Priority' : 'Set as VIP Priority'}</span>
              </button>

              <button
                type="button"
                className="btn-saas-secondary w-full justify-center text-xs"
                onClick={() => onUpdateStatus(conversation.id, isResolved ? 'Open' : 'Resolved')}
              >
                <CheckCircle2 size={12} />
                <span>{isResolved ? 'Reopen Conversation' : 'Mark Conversation Resolved'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConversationChat;
