import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  CheckCircle2,
  Send,
  User,
  Share2,
} from 'lucide-react';
import { influencerService } from '../../services/influencerService.js';

export function OutreachPitchModal({
  influencer,
  isOpen,
  onClose,
}) {
  const [pitchText, setPitchText] = useState('');
  const [customAngle, setCustomAngle] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (influencer) {
      loadInitialPitch();
    }
  }, [influencer]);

  if (!isOpen || !influencer) return null;

  const loadInitialPitch = async () => {
    setIsGenerating(true);
    const text = await influencerService.generatePitch(influencer.id, customAngle);
    setPitchText(text);
    setIsGenerating(false);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    const text = await influencerService.generatePitch(influencer.id, customAngle);
    setPitchText(text);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pitchText).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card outreach-pitch-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Creator Outreach Pitch</h3>
              <p className="modal-subtitle">Generate brand-aligned sponsorship proposals for {influencer.name}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="outreach-pitch-body">
          {/* Creator Profile Snippet */}
          <div className="pitch-creator-strip">
            <img
              src={influencer.avatar}
              alt={influencer.name}
              className="pitch-creator-avatar"
            />
            <div className="pitch-creator-info">
              <strong>{influencer.name} ({influencer.handle})</strong>
              <div className="pitch-meta-pills">
                <span className="pitch-pill">🏢 {influencer.clientName}</span>
                <span className="pitch-pill">Platform: {influencer.platform}</span>
                <span className="pitch-pill">Niche: {influencer.niche}</span>
                <span className="pitch-pill text-success">{influencer.rate}</span>
              </div>
            </div>
          </div>

          {/* Custom Angle Input */}
          <div className="form-field-group">
            <label className="form-label">Custom Campaign Angle / Specific Gifting Hook</label>
            <div className="angle-input-row">
              <input
                type="text"
                placeholder="e.g. We will send you our complete VIP Athlete Gym Bag & Shaker Kit..."
                value={customAngle}
                onChange={(e) => setCustomAngle(e.target.value)}
                className="form-text-input"
              />
              <button
                type="button"
                className="btn-saas-secondary"
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                <Sparkles size={13} />
                <span>{isGenerating ? 'Updating...' : 'Update Pitch'}</span>
              </button>
            </div>
          </div>

          {/* Pitch Textarea */}
          <div className="form-field-group">
            <div className="pitch-label-row">
              <label className="form-label">Generated Outreach Pitch Copy</label>
              <button
                type="button"
                className="btn-copy-pitch-link"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={13} className="text-success" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Pitch</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              className="form-textarea-input pitch-textarea"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-saas-primary" onClick={handleCopy}>
            <CheckCircle2 size={15} />
            <span>Copy & Mark Outreach Sent</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OutreachPitchModal;
