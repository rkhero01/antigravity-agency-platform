import React, { useState } from 'react';
import { X, Sparkles, Copy, CheckCircle2, Calendar, Layers, ArrowRight } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { campaignService } from '../../services/campaignService.js';

export function AICampaignRoadmapModal({
  isOpen,
  onClose,
}) {
  const [clientId, setClientId] = useState('c1');
  const [themePrompt, setThemePrompt] = useState('Q4 Winter Transformation Blitz');
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    const result = await campaignService.generateAICampaignRoadmap(clientId, themePrompt);
    setRoadmap(result);
    setGenerating(false);
  };

  const handleCopyRoadmap = () => {
    if (!roadmap) return;
    const text = `${roadmap.roadmapTitle}\n\n` +
      roadmap.weeks.map((w) => `${w.week}\n- Strategic Focus: ${w.focus}\n- Deliverables: ${w.deliverables}\n`).join('\n');

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
        className="modal-dialog-card ai-roadmap-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Omnichannel Campaign Roadmap Generator</h3>
              <p className="modal-subtitle">Synthesize a complete 4-week multi-channel sprint with weekly milestones</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ai-roadmap-body">
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
                <label className="form-label">Campaign Theme / Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Black Friday VIP Early Access Sprint"
                  value={themePrompt}
                  onChange={(e) => setThemePrompt(e.target.value)}
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
              <span>{generating ? 'Synthesizing Strategic Roadmap...' : 'Generate 4-Week Launch Roadmap'}</span>
            </button>
          </form>

          {/* Roadmap Result */}
          {roadmap && (
            <div className="roadmap-output-container">
              <div className="roadmap-output-header">
                <strong className="roadmap-output-title">{roadmap.roadmapTitle}</strong>
                <button
                  type="button"
                  className="btn-copy-roadmap"
                  onClick={handleCopyRoadmap}
                >
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

              <div className="roadmap-weeks-list">
                {roadmap.weeks.map((w, idx) => (
                  <div key={idx} className="roadmap-week-item">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="week-number-pill">Phase {idx + 1}</span>
                      <h5 className="week-name-title">{w.week}</h5>
                    </div>
                    <p className="week-focus-text"><strong>Focus:</strong> {w.focus}</p>
                    <p className="week-deliv-text"><strong>Deliverables:</strong> {w.deliverables}</p>
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

export default AICampaignRoadmapModal;
