import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, CheckCircle2, ShieldAlert, FileText, MessageSquare } from 'lucide-react';
import { listeningService } from '../../services/listeningService.js';

export function AICrisisResponseModal({
  alert,
  isOpen,
  onClose,
}) {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [responsePlan, setResponsePlan] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (alert) {
      setTopic(alert.title);
      handleGenerate(alert);
    } else {
      setTopic('Customer Service Escalation');
    }
  }, [alert, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (customAlert) => {
    setGenerating(true);
    const target = customAlert || { title: topic, clientName: 'Our Brand' };
    const plan = await listeningService.generateAICrisisResponse(target);
    setResponsePlan(plan);
    setGenerating(false);
  };

  const handleCopy = () => {
    if (!responsePlan) return;
    const text = `Crisis Mitigation Protocol: ${responsePlan.crisisTopic}\n\nOfficial Public Statement:\n"${responsePlan.publicStatement}"\n\nSocial Reply Macro:\n"${responsePlan.socialReplyMacro}"\n\nInternal Escalation Steps:\n` +
      responsePlan.internalEscalationSteps.join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-crisis-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Crisis Mitigation & PR Statement Studio</h3>
              <p className="modal-subtitle">Synthesize brand-safe public statements, social macros, and escalation runbooks</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ai-crisis-body">
          <div className="form-field-group">
            <label className="form-label">Crisis Topic / Anomaly Summary</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="form-text-input flex-1"
                placeholder="e.g. Courier Shipping Delay Spike"
              />
              <button
                type="button"
                disabled={generating}
                onClick={() => handleGenerate(null)}
                className="btn-saas-primary"
              >
                <Sparkles size={14} />
                <span>{generating ? 'Drafting...' : 'Regenerate'}</span>
              </button>
            </div>
          </div>

          {/* Response Plan Output */}
          {responsePlan && (
            <div className="crisis-output-container">
              <div className="crisis-output-header">
                <strong className="text-white text-sm">Crisis Mitigation Protocol: {responsePlan.crisisTopic}</strong>
                <button
                  type="button"
                  className="btn-copy-crisis"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} className="text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Full Protocol</span>
                    </>
                  )}
                </button>
              </div>

              {/* Official Statement */}
              <div className="crisis-block">
                <div className="flex items-center gap-1.5 mb-1 text-xs text-primary font-bold">
                  <FileText size={13} />
                  <span>Official Executive Brand Statement:</span>
                </div>
                <p className="crisis-text-box">"{responsePlan.publicStatement}"</p>
              </div>

              {/* Social Macro */}
              <div className="crisis-block">
                <div className="flex items-center gap-1.5 mb-1 text-xs text-cyan font-bold">
                  <MessageSquare size={13} />
                  <span>Frontline Social Media Reply Macro:</span>
                </div>
                <p className="crisis-text-box">"{responsePlan.socialReplyMacro}"</p>
              </div>

              {/* Runbook Steps */}
              <div className="crisis-block">
                <strong className="text-xs text-warning block mb-1">Internal Escalation Runbook:</strong>
                <ul className="crisis-steps-list">
                  {responsePlan.internalEscalationSteps.map((step, i) => (
                    <li key={i} className="text-xs text-muted">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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

export default AICrisisResponseModal;
