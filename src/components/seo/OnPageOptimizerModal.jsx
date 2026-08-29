import React, { useState } from 'react';
import { X, Zap, CheckCircle2, AlertTriangle, Sparkles, Copy, ArrowRight } from 'lucide-react';
import { seoService } from '../../services/seoService.js';

export function OnPageOptimizerModal({
  isOpen,
  onClose,
}) {
  const [formData, setFormData] = useState({
    targetKeyword: 'cold plunge austin tx',
    url: 'https://apexfit.com/recovery/cold-plunge',
    title: 'Austin Cold Plunge & Contrast Therapy | Apex Fitness',
    metaDescription: 'Experience Austin premier cold plunge suites and infrared saunas at Apex Fitness Club. Book your recovery pass today.',
    h1: 'Cold Plunge & Contrast Therapy in Austin TX',
    content: 'Discover cold plunge therapy in Austin TX. Our luxury recovery facility features precision-chilled 45°F plunge tubs and high-heat infrared saunas designed for athletic performance and recovery.',
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    const result = await seoService.optimizeOnPage(formData);
    setAnalysisResult(result);
    setAnalyzing(false);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card onpage-optimizer-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="modal-title">On-Page SEO Analyzer & Content Optimizer</h3>
              <p className="modal-subtitle">Audit title tags, keyword density, semantic entities, and heading hierarchies</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="optimizer-modal-body">
          <form onSubmit={handleAnalyze} className="optimizer-form-left">
            <div className="form-grid-two-col">
              <div className="form-field-group">
                <label className="form-label">Primary Target Keyword</label>
                <input
                  type="text"
                  required
                  value={formData.targetKeyword}
                  onChange={(e) => setFormData({ ...formData, targetKeyword: e.target.value })}
                  className="form-text-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Target Page URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="form-text-input"
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">SEO Page Title Tag</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Meta Description</label>
              <textarea
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="form-textarea-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Main H1 Heading</label>
              <input
                type="text"
                value={formData.h1}
                onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                className="form-text-input"
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Body Content / Copy</label>
              <textarea
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="form-textarea-input"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="btn-saas-primary w-full justify-center"
            >
              <Zap size={15} />
              <span>{analyzing ? 'Evaluating On-Page Signals...' : 'Audit On-Page Signals'}</span>
            </button>
          </form>

          {/* Results Output */}
          <div className="optimizer-results-right">
            {analysisResult ? (
              <div className="analysis-output-container">
                {/* Score Header */}
                <div className="analysis-score-header">
                  <div>
                    <span className="text-xs text-muted block">On-Page SEO Score</span>
                    <strong className="score-big-gradient">{analysisResult.seoScore} / 100</strong>
                  </div>
                  <span className={`score-verdict-tag ${analysisResult.seoScore >= 80 ? 'pass' : 'warn'}`}>
                    {analysisResult.seoScore >= 80 ? '✓ Well Optimized' : '⚡ Improvements Needed'}
                  </span>
                </div>

                {/* Checks */}
                <div className="checks-list">
                  {analysisResult.checks.map((check, idx) => (
                    <div key={idx} className={`check-item ${check.status}`}>
                      {check.status === 'pass' ? (
                        <CheckCircle2 size={13} className="text-success" />
                      ) : (
                        <AlertTriangle size={13} className="text-warning" />
                      )}
                      <span className="text-xs">{check.text}</span>
                    </div>
                  ))}
                </div>

                {/* AI Recommendations */}
                <div className="optimizer-rec-card">
                  <span className="text-xs text-primary font-bold block mb-1">Recommended Optimized Title:</span>
                  <p className="rec-text">"{analysisResult.titleRecommendation}"</p>
                </div>

                <div className="optimizer-rec-card">
                  <span className="text-xs text-cyan font-bold block mb-1">Recommended Meta Description:</span>
                  <p className="rec-text">"{analysisResult.metaRecommendation}"</p>
                </div>

                <div className="optimizer-rec-card">
                  <span className="text-xs text-warning font-bold block mb-1">Suggested Internal Inlinks:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {analysisResult.internalLinkSuggestions.map((lnk, i) => (
                      <span key={i} className="link-suggestion-chip">{lnk}</span>
                    ))}
                  </div>
                </div>

                <div className="optimizer-rec-card">
                  <span className="text-xs text-success font-bold block mb-1">Structured FAQ Opportunities:</span>
                  <ul className="faq-sugg-list">
                    {analysisResult.faqOpportunities.map((faq, i) => (
                      <li key={i} className="text-xs text-muted">{faq}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="analysis-placeholder-card">
                <Zap size={32} className="text-dim" />
                <h4 className="text-white text-sm font-bold">Real-Time On-Page Analysis</h4>
                <p className="text-xs text-muted">Click "Audit On-Page Signals" to evaluate keyword placement, heading hierarchy, and AI recommendations.</p>
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

export default OnPageOptimizerModal;
