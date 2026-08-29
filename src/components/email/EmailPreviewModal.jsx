import React, { useState } from 'react';
import { X, Mail, MessageSquare, Send, CheckCircle2, Smartphone, Monitor, Printer } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function EmailPreviewModal({
  campaign,
  isOpen,
  onClose,
}) {
  const [testSent, setTestSent] = useState(false);

  if (!isOpen || !campaign) return null;

  const isEmail = campaign.type.includes('Email');

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => {
      setTestSent(false);
    }, 2500);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card email-preview-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              {isEmail ? <Mail size={18} /> : <MessageSquare size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="modal-title">{campaign.title}</h3>
                <Badge variant="primary" size="sm">{campaign.type}</Badge>
              </div>
              <p className="modal-subtitle">🏢 {campaign.clientName} • Target Segment: {campaign.segment}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="email-preview-body">
          {/* Header Metadata */}
          <div className="preview-meta-strip">
            <div className="flex justify-between items-center text-xs text-muted mb-1">
              <span><strong>Subject:</strong> {campaign.subject}</span>
              <span>{campaign.sendDate}</span>
            </div>
            <p className="text-xs text-dim"><strong>Preview Snippet:</strong> {campaign.previewText}</p>
          </div>

          {/* Viewport Simulation */}
          {isEmail ? (
            <div className="email-newsletter-viewport">
              <div className="newsletter-frame">
                <div className="newsletter-brand-header">
                  <span className="newsletter-logo-text">✨ {campaign.clientName.toUpperCase()}</span>
                </div>
                <div className="newsletter-content-box">
                  <h2 className="newsletter-headline">{campaign.subject.replace(/^[^\w]+/, '')}</h2>
                  <p className="newsletter-body-text">{campaign.bodySnippet}</p>

                  <div className="newsletter-cta-box">
                    <button type="button" className="btn-newsletter-cta">
                      Claim Your VIP Access →
                    </button>
                  </div>
                </div>
                <div className="newsletter-footer-box">
                  <p className="text-xs text-muted">You are receiving this email because you opted into updates from {campaign.clientName}.</p>
                  <p className="text-xs text-dim">Unsubscribe | Update Preferences</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="sms-phone-viewport">
              <div className="phone-device-frame">
                <div className="phone-notch" />
                <div className="phone-header-title">{campaign.clientName}</div>
                <div className="phone-chat-area">
                  <div className="sms-bubble incoming">
                    <p className="sms-bubble-text">{campaign.bodySnippet}</p>
                    <span className="sms-bubble-time">11:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-saas-secondary" onClick={() => window.print()}>
            <Printer size={14} />
            <span>Print Proof</span>
          </button>
          <button type="button" className="btn-saas-primary" onClick={handleSendTest}>
            {testSent ? <CheckCircle2 size={15} className="text-success" /> : <Send size={15} />}
            <span>{testSent ? 'Test Broadcast Dispatched!' : 'Send Live Test Proof'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailPreviewModal;
