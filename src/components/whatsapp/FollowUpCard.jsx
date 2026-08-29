import React from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Phone,
  MessageSquare,
  DollarSign,
  User,
  Flame,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Building,
} from 'lucide-react';

export function FollowUpCard({
  item,
  onComplete,
  onReschedule,
  onEdit,
  onDelete,
  onOpenDetails,
  onOpenConversation,
}) {
  const isOverdue = item.status === 'Overdue';
  const isDueToday = item.status === 'Due Today';
  const isCompleted = item.status === 'Completed';

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Call':
        return <span className="fu-type-chip call"><Phone size={10} /> Call</span>;
      case 'WhatsApp':
        return <span className="fu-type-chip wa"><MessageSquare size={10} /> WhatsApp</span>;
      case 'Demo':
        return <span className="fu-type-chip demo">💻 Live Demo</span>;
      case 'Payment':
        return <span className="fu-type-chip pay">💳 Payment</span>;
      default:
        return <span className="fu-type-chip gen">📋 {type}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'VIP':
        return <span className="fu-priority-chip vip"><Flame size={10} /> VIP</span>;
      case 'High':
        return <span className="fu-priority-chip high">High</span>;
      case 'Medium':
        return <span className="fu-priority-chip med">Med</span>;
      default:
        return <span className="fu-priority-chip low">Low</span>;
    }
  };

  return (
    <div
      className={`wa-followup-card ${isOverdue ? 'card-overdue' : isDueToday ? 'card-today' : isCompleted ? 'card-completed' : ''}`}
      onClick={() => onOpenDetails && onOpenDetails(item)}
    >
      {/* Top Bar: Urgency & Priority */}
      <div className="followup-card-header">
        <div className="flex items-center gap-1.5 flex-wrap">
          {getTypeBadge(item.type)}
          {getPriorityBadge(item.priority)}
          <span className="fu-client-tag">🏢 {item.clientName}</span>
        </div>

        {isOverdue ? (
          <span className="fu-urgency-badge overdue">
            <AlertTriangle size={11} /> {item.overdueDuration || 'Overdue'}
          </span>
        ) : isDueToday ? (
          <span className="fu-urgency-badge today">
            <Clock size={11} /> {item.dueDate}
          </span>
        ) : isCompleted ? (
          <span className="fu-urgency-badge completed">
            <CheckCircle2 size={11} /> Completed
          </span>
        ) : (
          <span className="fu-urgency-badge upcoming">
            <Clock size={11} /> {item.dueDate}
          </span>
        )}
      </div>

      {/* Customer Info */}
      <div className="followup-customer-row">
        <img
          src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
          alt={item.customerName}
          className="w-9 h-9 rounded-full object-cover border border-white/15 flex-shrink-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
          }}
        />
        <div className="min-w-0 flex-1">
          <h4 className="customer-name truncate">{item.customerName}</h4>
          <span className="customer-contact-text truncate block">{item.phone}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-dim block">Deal Value</span>
          <strong className="text-success text-xs font-bold">
            ₹{(item.dealValue || 0).toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Agenda Reason Box */}
      <div className="followup-reason-box">
        <p className="reason-text">{item.reason}</p>
      </div>

      {/* Telemetry Row: Assignee & Stage */}
      <div className="followup-telemetry-row">
        <div className="flex items-center gap-1 text-[11px] text-muted">
          <User size={11} className="text-cyan" />
          <span className="truncate">{item.assignedStaff}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-dim font-bold bg-white/5 px-1.5 py-0.5 rounded">
            Stage: {item.leadStage}
          </span>
          <span className="text-[10px] text-purple font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">
            Score: {item.leadScore}
          </span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="followup-card-footer" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {/* Quick Call */}
          <a
            href={`tel:${item.phone}`}
            className="btn-fu-icon call"
            title="Call Contact"
          >
            <Phone size={12} />
          </a>

          {/* Quick WhatsApp Direct */}
          <a
            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="btn-fu-icon wa"
            title="Chat on WhatsApp"
          >
            <MessageSquare size={12} />
          </a>

          {/* Open Conversation in app */}
          {onOpenConversation && (
            <button
              type="button"
              className="btn-fu-icon chat"
              onClick={() => onOpenConversation(item.conversationId)}
              title="Open Conversation in Inbox"
            >
              <ExternalLink size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isCompleted ? (
            <>
              <button
                type="button"
                className="btn-fu-action complete"
                onClick={() => onComplete && onComplete(item.id)}
                title="Mark Follow-up as Completed"
              >
                <CheckCircle2 size={12} />
                <span>Complete</span>
              </button>

              <button
                type="button"
                className="btn-fu-action reschedule"
                onClick={() => onReschedule && onReschedule(item)}
                title="Reschedule Task"
              >
                <RotateCcw size={12} />
                <span>Reschedule</span>
              </button>
            </>
          ) : (
            <span className="text-[11px] text-success font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Closed
            </span>
          )}

          <button
            type="button"
            className="btn-fu-icon view"
            onClick={() => onOpenDetails && onOpenDetails(item)}
            title="View Details"
          >
            <Eye size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FollowUpCard;
