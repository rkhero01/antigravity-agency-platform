import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertOctagon,
  UserCheck,
  Building,
  Sparkles,
  Award,
} from 'lucide-react';
import { CRM_STAGES } from './LeadPipeline.jsx';

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignStaff,
  onAddNote,
}) {
  const [noteText, setNoteText] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !lead) return null;

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback(null);
    }, 2500);
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (onAddNote) onAddNote(lead.id, noteText);
    showToast('Note added to lead record.');
    setNoteText('');
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card lead-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3">
            <div className="lead-avatar-big">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title">{lead.name}</h3>
                <span className="lead-score-pill vip">Score {lead.leadScore} ({lead.scoreCategory})</span>
              </div>
              <p className="modal-subtitle">
                {lead.company} • 🏢 {lead.clientName} • Source: {lead.source}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="lead-quick-actions-bar">
          <a
            href={`tel:${lead.phone}`}
            className="btn-quick-touch call"
            onClick={() => showToast(`Initiating call to ${lead.phone}...`)}
          >
            <Phone size={14} />
            <span>Call Lead</span>
          </a>

          <a
            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="btn-quick-touch whatsapp"
            onClick={() => showToast('Opening WhatsApp Chat...')}
          >
            <MessageSquare size={14} />
            <span>WhatsApp</span>
          </a>

          <a
            href={`mailto:${lead.email}`}
            className="btn-quick-touch email"
            onClick={() => showToast(`Opening email composer for ${lead.email}...`)}
          >
            <Mail size={14} />
            <span>Email</span>
          </a>

          <button
            type="button"
            className="btn-quick-touch won"
            onClick={() => {
              onUpdateStatus(lead.id, 'Won');
              showToast('🎉 Deal marked as Closed Won!');
            }}
          >
            <Award size={14} />
            <span>Mark Won</span>
          </button>

          <button
            type="button"
            className="btn-quick-touch lost"
            onClick={() => {
              onUpdateStatus(lead.id, 'Lost');
              showToast('Deal marked as Lost.');
            }}
          >
            <AlertOctagon size={14} />
            <span>Mark Lost</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="lead-modal-feedback">
            <CheckCircle2 size={14} className="text-success" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Modal Body: Split Layout */}
        <div className="lead-detail-body-grid">
          {/* Left Column: Contact & Deal Data */}
          <div className="lead-details-left-pane">
            <div className="detail-section-card">
              <h4 className="detail-sec-title">Contact Information</h4>
              <div className="detail-meta-list">
                <div className="meta-item">
                  <span className="meta-lbl">Email:</span>
                  <span className="meta-val text-white">{lead.email}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Phone:</span>
                  <span className="meta-val text-white">{lead.phone}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Company:</span>
                  <span className="meta-val text-white">{lead.company}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Campaign:</span>
                  <span className="meta-val text-cyan">{lead.campaign}</span>
                </div>
              </div>
            </div>

            <div className="detail-section-card">
              <h4 className="detail-sec-title">Pipeline & Ownership</h4>
              <div className="detail-meta-list">
                <div className="meta-item">
                  <span className="meta-lbl">Deal Value:</span>
                  <strong className="meta-val text-success">${(lead.value || 0).toLocaleString()}</strong>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Pipeline Stage:</span>
                  <select
                    value={lead.status}
                    onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                    className="form-select-input-mini"
                  >
                    {CRM_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Assigned Staff:</span>
                  <select
                    value={lead.assignedStaff}
                    onChange={(e) => onAssignStaff(lead.id, e.target.value)}
                    className="form-select-input-mini"
                  >
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Marcus Chen">Marcus Chen</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="David Vance">David Vance</option>
                  </select>
                </div>
                <div className="meta-item">
                  <span className="meta-lbl">Next Follow-up:</span>
                  <span className="meta-val text-warning">{lead.nextFollowUp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Insights & Notes */}
          <div className="lead-details-right-pane">
            <div className="ai-lead-summary-box">
              <div className="flex items-center gap-2 mb-1.5 text-xs text-primary font-bold">
                <Sparkles size={14} />
                <span>AI Intent & Scoring Analysis</span>
              </div>
              <p className="text-xs text-white mb-2 leading-relaxed">
                Lead is flagged as <strong>{lead.scoreCategory} ({lead.leadScore}/100)</strong> based on {lead.scoreReasons?.join(', ')}.
              </p>
              <div className="ai-rec-action-chip">
                <strong>Suggested Next Touch:</strong> Pitch {lead.clientName} customized enterprise tier with 15% annual commitment incentive.
              </div>
            </div>

            {/* Notes Section */}
            <div className="detail-section-card flex-1">
              <h4 className="detail-sec-title">Sales Notes & History</h4>
              <p className="lead-saved-notes">{lead.notes}</p>

              <form onSubmit={handleNoteSubmit} className="mt-3">
                <textarea
                  rows={2}
                  placeholder="Add a new follow-up note or call summary..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="form-textarea-input"
                />
                <button type="submit" className="btn-saas-secondary mt-2 w-full justify-center">
                  Save Note to CRM Timeline
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadDetailModal;
