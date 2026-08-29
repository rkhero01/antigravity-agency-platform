import React from 'react';
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  RotateCcw,
  User,
  DollarSign,
  CalendarCheck,
  Flame,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { whatsappTeamMembers } from '../../data/mockWhatsApp.js';

export function FollowUpDetailModal({
  item,
  isOpen,
  onClose,
  onComplete,
  onReschedule,
  onReassign,
  onDelete,
  onOpenConversation,
  teamMembers = whatsappTeamMembers,
}) {
  if (!isOpen || !item) return null;

  const isOverdue = item.status === 'Overdue';
  const isDueToday = item.status === 'Due Today';
  const isCompleted = item.status === 'Completed';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card wa-followup-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3">
            <img
              src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={item.customerName}
              className="w-12 h-12 rounded-full object-cover border border-white/20"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title">{item.customerName}</h3>
                <span
                  className={`fu-urgency-badge ${
                    isOverdue ? 'overdue' : isDueToday ? 'today' : isCompleted ? 'completed' : 'upcoming'
                  }`}
                >
                  {isOverdue ? `⚠️ ${item.overdueDuration || 'Overdue'}` : item.dueDate}
                </span>
              </div>
              <p className="modal-subtitle">
                🏢 {item.clientName} • {item.phone} • {item.email}
              </p>
            </div>
          </div>

          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="wa-followup-detail-body">
          {/* Telemetry Strip */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">1. Deal Telemetry & CRM Context</h4>
            <div className="financial-telemetry-grid">
              <div className="fin-stat-box">
                <span className="fin-lbl">Deal Value</span>
                <strong className="fin-val text-success">
                  ₹{(item.dealValue || 0).toLocaleString()}
                </strong>
                <span className="fin-sub">Pipeline opportunity</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">CRM Deal Stage</span>
                <strong className="fin-val text-cyan">{item.leadStage}</strong>
                <span className="fin-sub">Active pipeline status</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">AI Lead Score</span>
                <strong className="fin-val text-purple">{item.leadScore} / 100</strong>
                <span className="fin-sub">{item.sentiment} Sentiment</span>
              </div>

              <div className="fin-stat-box">
                <span className="fin-lbl">Priority Level</span>
                <strong
                  className={`fin-val ${
                    item.priority === 'VIP' ? 'text-pink' : item.priority === 'High' ? 'text-warning' : 'text-white'
                  }`}
                >
                  {item.priority} Priority
                </strong>
                <span className="fin-sub">Channel: {item.type}</span>
              </div>
            </div>
          </div>

          {/* Agenda & Instructions */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">2. Follow-up Agenda & Reason</h4>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-white/5">
              <p className="text-xs text-white leading-relaxed">{item.reason}</p>
            </div>
            <div className="mt-2 text-xs text-dim">
              <strong>Last Interaction:</strong> {item.lastInteraction}
            </div>
          </div>

          {/* Operator Assignment */}
          <div className="detail-card-panel">
            <div className="flex justify-between items-center mb-2">
              <h4 className="detail-panel-title mb-0">3. Assigned Operator</h4>
              <select
                value={item.assignedStaff}
                onChange={(e) => onReassign && onReassign(item.id, e.target.value)}
                className="wa-stage-select-box"
              >
                {teamMembers.map((tm) => (
                  <option key={tm.id} value={tm.name}>
                    {tm.name} ({tm.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="detail-card-panel">
            <h4 className="detail-panel-title">4. Follow-up Activity History</h4>
            <div className="followup-timeline-list">
              {item.timeline?.map((evt, idx) => (
                <div key={idx} className="timeline-item-row">
                  <div className="timeline-node-bullet" />
                  <div className="timeline-content-body">
                    <div className="flex justify-between items-center text-[11px]">
                      <strong className="text-white">{evt.event}</strong>
                      <span className="text-dim">{evt.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted">{evt.note}</p>
                    <span className="text-[10px] text-cyan block mt-0.5">By: {evt.staff}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-dialog-footer">
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="btn-saas-secondary text-xs text-success"
            >
              <MessageSquare size={13} />
              <span>WhatsApp Direct</span>
            </a>

            <a
              href={`tel:${item.phone}`}
              className="btn-saas-secondary text-xs text-cyan"
            >
              <Phone size={13} />
              <span>Call</span>
            </a>

            <button
              type="button"
              className="btn-saas-secondary text-xs text-danger"
              onClick={() => {
                onClose();
                onDelete && onDelete(item.id);
              }}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <>
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={() => {
                    onClose();
                    onReschedule && onReschedule(item);
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Reschedule</span>
                </button>

                <button
                  type="button"
                  className="btn-wa-primary"
                  onClick={() => {
                    onClose();
                    onComplete && onComplete(item.id);
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Mark Completed</span>
                </button>
              </>
            )}

            <button type="button" className="btn-saas-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FollowUpDetailModal;
