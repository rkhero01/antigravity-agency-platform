import React, { useState } from 'react';
import { X, Sparkles, Copy, CheckCircle2, DollarSign, FileCheck, Layers } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { contractService } from '../../services/contractService.js';

export function AIProposalGeneratorModal({
  isOpen,
  onClose,
}) {
  const [clientId, setClientId] = useState('c1');
  const [tier, setTier] = useState('Growth Accelerator');
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    const result = await contractService.generateAIProposal(clientId, tier);
    setProposal(result);
    setGenerating(false);
  };

  const handleCopyProposal = () => {
    if (!proposal) return;
    const text = `${proposal.proposalTitle}\nTier: ${proposal.tierName} (${proposal.monthlyFee} | ACV: ${proposal.annualValue})\n\nExecutive Summary:\n${proposal.executiveSummary}\n\nScope of Work:\n` +
      proposal.deliverables.map((d) => `• ${d}`).join('\n') + `\n\nCommercial Terms:\n${proposal.terms}`;

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
        className="modal-dialog-card ai-proposal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Commercial Proposal Synthesizer</h3>
              <p className="modal-subtitle">Generate high-converting enterprise scope proposals and multi-tier pricing</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ai-proposal-body">
          <form onSubmit={handleGenerate} className="ai-generator-form">
            <div className="form-grid-two-col">
              <div className="form-field-group">
                <label className="form-label">Target Client Workspace</label>
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
                <label className="form-label">Service Scope Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="form-select-input"
                >
                  <option value="Starter Foundation">Starter Foundation ($5,500 / mo)</option>
                  <option value="Growth Accelerator">Growth Accelerator ($11,000 / mo)</option>
                  <option value="Enterprise Scale">Enterprise Scale ($22,500 / mo)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="btn-saas-primary w-full justify-center"
            >
              <Sparkles size={15} />
              <span>{generating ? 'Drafting Commercial Proposal...' : 'Synthesize Custom Client Proposal'}</span>
            </button>
          </form>

          {/* Proposal Output */}
          {proposal && (
            <div className="proposal-output-container">
              <div className="proposal-output-header">
                <div>
                  <strong className="proposal-output-title">{proposal.proposalTitle}</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-success font-bold">{proposal.monthlyFee}</span>
                    <span className="text-xs text-muted font-mono">ACV: {proposal.annualValue}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-copy-proposal"
                  onClick={handleCopyProposal}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} className="text-success" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Pitch</span>
                    </>
                  )}
                </button>
              </div>

              <div className="proposal-content-block">
                <p className="text-xs text-muted mb-2 leading-relaxed">"{proposal.executiveSummary}"</p>

                <strong className="text-xs text-white block mb-1">Key Deliverables:</strong>
                <ul className="proposal-deliv-list">
                  {proposal.deliverables.map((d, i) => (
                    <li key={i} className="text-xs text-cyan flex items-center gap-1.5">
                      <span>•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>

                <div className="proposal-terms-box mt-3">
                  <strong className="text-xs text-white block">Commercial Terms:</strong>
                  <span className="text-xs text-muted">{proposal.terms}</span>
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

export default AIProposalGeneratorModal;
