import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  Target,
  Flame,
} from 'lucide-react';
import { crmService } from '../../services/crmService.js';

export function AIAssistantModal({
  lead,
  isOpen,
  onClose,
  allLeads = [],
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(lead ? lead.id : (allLeads[0]?.id || ''));
  const [analysis, setAnalysis] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lead) {
      setSelectedLeadId(lead.id);
      handleAnalyze(lead);
    } else if (allLeads.length > 0) {
      handleAnalyze(allLeads[0]);
    }
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleAnalyze = async (targetLead) => {
    setGenerating(true);
    const target = targetLead || allLeads.find((l) => l.id === selectedLeadId) || allLeads[0];
    if (target) {
      const res = await crmService.generateAILeadAnalysis(target);
      setAnalysis(res);
    }
    setGenerating(false);
  };

  const handleCopyMessage = () => {
    if (!analysis) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(analysis.suggestedResponse).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-crm-copilot-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Sales Co-Pilot & Deal Closing Studio</h3>
              <p className="modal-subtitle">Synthesize high-converting reply scripts, objection handlers, and closing roadmaps</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="ai-crm-body">
          {/* Target Lead Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-semibold">Select Target Lead:</span>
            <select
              value={selectedLeadId}
              onChange={(e) => {
                setSelectedLeadId(e.target.value);
                const target = allLeads.find((l) => l.id === e.target.value);
                handleAnalyze(target);
              }}
              className="form-select-input flex-1"
            >
              {allLeads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.company} (${(l.value || 0).toLocaleString()} • {l.status})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={generating}
              onClick={() => handleAnalyze(null)}
              className="btn-saas-primary"
            >
              <Sparkles size={14} />
              <span>{generating ? 'Analyzing...' : 'Regenerate'}</span>
            </button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="copilot-output-container">
              {/* Quality & Probability Header */}
              <div className="copilot-header-strip">
                <div>
                  <span className="text-xs text-muted block">Lead Opportunity Assessment</span>
                  <strong className="text-white text-sm">{analysis.leadQuality}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame size={15} className="text-warning" />
                  <span className="text-xs text-success font-bold">{analysis.probabilityOfConversion} Close Probability</span>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="copilot-action-box">
                <strong className="text-xs text-cyan block mb-1">Recommended Next Sales Action:</strong>
                <p className="text-xs text-white leading-relaxed">{analysis.recommendedAction}</p>
              </div>

              {/* Suggested Message */}
              <div className="copilot-action-box">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-xs text-primary font-bold">Personalized Outreach Script (Email / WhatsApp):</strong>
                  <button
                    type="button"
                    className="btn-copy-script"
                    onClick={handleCopyMessage}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={13} className="text-success" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="script-text-box">"{analysis.suggestedResponse}"</p>
              </div>

              {/* Objection Handling & Closing Strategy */}
              <div className="copilot-grid-two">
                <div className="copilot-card-sub">
                  <strong className="text-xs text-warning block mb-1">Objection Prevention:</strong>
                  <ul className="sub-bullet-list">
                    {analysis.objectionPreventions.map((obj, i) => (
                      <li key={i} className="text-xs text-muted">• {obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="copilot-card-sub">
                  <strong className="text-xs text-success block mb-1">Optimal Closing Strategy:</strong>
                  <p className="text-xs text-muted">{analysis.closingStrategy}</p>
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
        </div>
      </div>
    </div>
  );
}

export default AIAssistantModal;
