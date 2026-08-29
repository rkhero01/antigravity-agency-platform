import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, CheckCircle2, FileText, Layers, Link2 } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { seoService } from '../../services/seoService.js';

export function AIContentBriefModal({
  isOpen,
  onClose,
  initialKeyword = '',
}) {
  const [formData, setFormData] = useState({
    clientId: 'c1',
    primaryKeyword: 'Contrast Therapy Protocols',
    secondaryKeywords: 'cold plunge austin, infrared sauna benefits, recovery routine',
    intent: 'Informational',
    audience: 'Fitness enthusiasts & wellness members',
    contentType: 'Comprehensive Pillar Guide',
  });

  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialKeyword) {
      setFormData((prev) => ({ ...prev, primaryKeyword: initialKeyword }));
    }
  }, [initialKeyword, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setGenerating(true);
    const result = await seoService.generateContentBrief(formData);
    setBrief(result);
    setGenerating(false);
  };

  const handleCopy = () => {
    if (!brief) return;
    const text = `SEO Content Brief: ${brief.primaryKeyword}\nClient: ${brief.clientName}\nTarget Word Count: ${brief.recommendedWordCount}\n\nSEO Title: ${brief.seoTitle}\nMeta Description: ${brief.metaDescription}\nH1: ${brief.suggestedH1}\n\nOutline Structure:\n` +
      brief.outlineStructure.map((s) => `${s.h2}\n` + s.h3.map((sub) => `  - ${sub}`).join('\n')).join('\n') +
      `\n\nSemantic Keywords:\n` + brief.semanticKeywords.join(', ') +
      `\n\nInternal Links:\n` + brief.internalLinks.map((l) => `- [${l.anchor}](${l.url})`).join('\n') +
      `\n\nCTA:\n${brief.callToAction}`;

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
        className="modal-dialog-card ai-brief-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI SEO Content Brief Synthesizer</h3>
              <p className="modal-subtitle">Generate data-backed editorial outlines, heading structures, and semantic keywords</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="ai-brief-body">
          <form onSubmit={handleGenerate} className="brief-form-left">
            <div className="form-grid-two-col">
              <div className="form-field-group">
                <label className="form-label">Client Workspace</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
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
                <label className="form-label">Primary Target Keyword</label>
                <input
                  type="text"
                  required
                  value={formData.primaryKeyword}
                  onChange={(e) => setFormData({ ...formData, primaryKeyword: e.target.value })}
                  className="form-text-input"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">Secondary / LSI Keywords (Comma-separated)</label>
              <input
                type="text"
                value={formData.secondaryKeywords}
                onChange={(e) => setFormData({ ...formData, secondaryKeywords: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-grid-three-col">
              <div className="form-field-group">
                <label className="form-label">Search Intent</label>
                <select
                  value={formData.intent}
                  onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                  className="form-select-input"
                >
                  <option value="Informational">Informational</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Transactional">Transactional</option>
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-label">Target Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="form-text-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Content Format</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="form-select-input"
                >
                  <option value="Comprehensive Pillar Guide">Pillar Guide</option>
                  <option value="Comparison Article">Comparison / Vs</option>
                  <option value="How-To Tutorial">How-To Tutorial</option>
                  <option value="Landing Page Copy">Landing Page Copy</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="btn-saas-primary w-full justify-center"
            >
              <Sparkles size={15} />
              <span>{generating ? 'Drafting AI Content Brief...' : 'Generate Editorial Brief'}</span>
            </button>
          </form>

          {/* Results Output */}
          <div className="brief-results-right">
            {brief ? (
              <div className="brief-output-card">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-xs text-muted block">Client: {brief.clientName}</span>
                    <strong className="text-white text-sm">Target Word Count: {brief.recommendedWordCount}</strong>
                  </div>
                  <button type="button" className="btn-copy-brief" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <CheckCircle2 size={13} className="text-success" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Brief</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="brief-section-box">
                  <span className="text-xs text-primary font-bold block mb-0.5">SEO Title & Meta:</span>
                  <p className="text-xs text-white font-semibold mb-0.5">"{brief.seoTitle}"</p>
                  <p className="text-xs text-muted">"{brief.metaDescription}"</p>
                </div>

                <div className="brief-section-box">
                  <span className="text-xs text-cyan font-bold block mb-1">Outline Hierarchy:</span>
                  <div className="outline-list">
                    {brief.outlineStructure.map((sec, i) => (
                      <div key={i} className="outline-item">
                        <strong className="text-xs text-white block">{sec.h2}</strong>
                        <div className="flex gap-2 text-xs text-muted ml-3">
                          {sec.h3.map((sub, j) => (
                            <span key={j}>• {sub}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="brief-section-box">
                  <span className="text-xs text-success font-bold block mb-1">Semantic Keyword Entities:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {brief.semanticKeywords.map((sem, i) => (
                      <span key={i} className="sem-chip">{sem}</span>
                    ))}
                  </div>
                </div>

                <div className="brief-section-box">
                  <span className="text-xs text-warning font-bold block mb-1">Call to Action:</span>
                  <p className="text-xs text-muted">"{brief.callToAction}"</p>
                </div>
              </div>
            ) : (
              <div className="analysis-placeholder-card">
                <FileText size={32} className="text-dim" />
                <h4 className="text-white text-sm font-bold">AI Content Brief Studio</h4>
                <p className="text-xs text-muted">Configure primary and secondary keywords, then generate an exhaustive editorial outline.</p>
              </div>
            )}
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

export default AIContentBriefModal;
