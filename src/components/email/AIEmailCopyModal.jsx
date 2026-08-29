import React, { useState } from 'react';
import { X, Sparkles, Copy, CheckCircle2, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { emailMarketingService } from '../../services/emailMarketingService.js';

export function AIEmailCopyModal({
  isOpen,
  onClose,
}) {
  const [clientId, setClientId] = useState('c1');
  const [objective, setObjective] = useState('Labor Day VIP Contrast Therapy Sale');
  const [generating, setGenerating] = useState(false);
  const [copyResults, setCopyResults] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    const result = await emailMarketingService.generateAIEmailCopy({ clientId, objective });
    setCopyResults(result);
    setGenerating(false);
  };

  const handleCopyAll = () => {
    if (!copyResults) return;
    const text = `Subject Line Options:\n` +
      copyResults.subjectLineOptions.map((s, i) => `${i + 1}. ${s}`).join('\n') +
      `\n\nPreview Texts:\n` +
      copyResults.previewTextOptions.map((p, i) => `${i + 1}. ${p}`).join('\n') +
      `\n\nSMS Copy:\n${copyResults.smsMessageCopy}`;

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
        className="modal-dialog-card ai-email-copy-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Subject Line & SMS Copy Studio</h3>
              <p className="modal-subtitle">Synthesize high-open subject lines, preview snippets, and high-CTR SMS drop copy</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ai-email-body">
          <form onSubmit={handleGenerate} className="ai-generator-form">
            <div className="form-grid-two-col">
              <div className="form-field-group">
                <label className="form-label">Client Workspace</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="form-select-input"
                >
                  {mockClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-label">Campaign Objective / Offer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Fall Restock 20% Off"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="form-text-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="btn-saas-primary w-full justify-center"
            >
              <Sparkles size={15} />
              <span>{generating ? 'Generating High-Converting Copy...' : 'Synthesize Subject Lines & SMS Copy'}</span>
            </button>
          </form>

          {/* Copy Results Output */}
          {copyResults && (
            <div className="email-copy-results-box">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white font-bold">AI Copy Suite Output</span>
                <button
                  type="button"
                  className="btn-copy-email-suite"
                  onClick={handleCopyAll}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} className="text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              {/* Subject Lines */}
              <div className="copy-block-item">
                <strong className="text-xs text-primary block mb-1">🔥 Top High-CTR Subject Lines:</strong>
                <ul className="copy-list">
                  {copyResults.subjectLineOptions.map((subj, idx) => (
                    <li key={idx} className="copy-line-item">
                      <span>{subj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preview Text */}
              <div className="copy-block-item">
                <strong className="text-xs text-cyan block mb-1">👀 Preview Text Snippets:</strong>
                <ul className="copy-list">
                  {copyResults.previewTextOptions.map((prev, idx) => (
                    <li key={idx} className="copy-line-item">
                      <span>{prev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SMS Copy */}
              <div className="copy-block-item">
                <strong className="text-xs text-success block mb-1">💬 SMS Blast Copy:</strong>
                <p className="sms-copy-preview">"{copyResults.smsMessageCopy}"</p>
              </div>

              {/* Spam Score */}
              <div className="spam-score-pill">
                <ShieldCheck size={14} className="text-success" />
                <span>Inbox Deliverability: <strong>{copyResults.spamScore}</strong></span>
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

export default AIEmailCopyModal;
