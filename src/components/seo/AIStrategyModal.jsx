import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, CheckCircle2, ShieldAlert, ArrowRight, Target } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { seoService } from '../../services/seoService.js';

export function AIStrategyModal({
  isOpen,
  onClose,
  selectedClient = 'all',
}) {
  const [clientId, setClientId] = useState(selectedClient);
  const [generating, setGenerating] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setClientId(selectedClient);
    if (isOpen) {
      handleGenerate(selectedClient);
    }
  }, [selectedClient, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (targetClientId) => {
    setGenerating(true);
    const result = await seoService.generateStrategy(targetClientId || clientId);
    setStrategy(result);
    setGenerating(false);
  };

  const handleCopy = () => {
    if (!strategy) return;
    const text = `30-Day SEO Strategy & Action Roadmap: ${strategy.clientName}\n\nSummary:\n${strategy.summary}\n\nAction Plan:\n` +
      strategy.actionPlan.map((item) => `[${item.priority}] ${item.category}: ${item.action} (Impact: ${item.impact})`).join('\n\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const getPriorityColor = (p) => {
    if (p.includes('P0')) return '#ef4444';
    if (p.includes('P1')) return '#f59e0b';
    return '#06b6d4';
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-strategy-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI 30-Day SEO Strategy & Action Roadmap</h3>
              <p className="modal-subtitle">Algorithmic analysis of ranking losses, technical crawl bottlenecks, and content gap ROI</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="ai-strategy-body">
          <div className="strategy-top-controls">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted font-semibold">Client Workspace:</span>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  handleGenerate(e.target.value);
                }}
                className="form-select-input flex-1"
              >
                <option value="all">🏢 All Client Portfolios</option>
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={generating}
              onClick={() => handleGenerate(clientId)}
              className="btn-saas-primary"
            >
              <Sparkles size={14} />
              <span>{generating ? 'Synthesizing...' : 'Regenerate'}</span>
            </button>
          </div>

          {/* Strategy Output */}
          {strategy && (
            <div className="strategy-output-container">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white font-bold">Executive Strategic Summary</span>
                <button type="button" className="btn-copy-strategy" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} className="text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Roadmap</span>
                    </>
                  )}
                </button>
              </div>

              <p className="strategy-summary-text">{strategy.summary}</p>

              <div className="strategy-plan-list">
                {strategy.actionPlan.map((item, idx) => (
                  <div key={idx} className="strategy-action-card">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="priority-pill"
                          style={{
                            backgroundColor: `${getPriorityColor(item.priority)}20`,
                            color: getPriorityColor(item.priority),
                            border: `1px solid ${getPriorityColor(item.priority)}40`,
                          }}
                        >
                          {item.priority}
                        </span>
                        <strong className="text-xs text-white">{item.category}</strong>
                      </div>
                      <span className="text-xs text-success font-semibold">{item.impact}</span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">{item.action}</p>
                  </div>
                ))}
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

export default AIStrategyModal;
