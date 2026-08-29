import React, { useState } from 'react';
import {
  Copy,
  Check,
  CalendarPlus,
  Wand2,
  Sparkles,
  Share2,
  Bookmark,
  BookmarkCheck,
  Layers,
  Clock,
  FileText,
  Flame,
} from 'lucide-react';

export function AIResultCard({
  variations = [],
  isGenerating = false,
  activeToolId,
  selectedClientObj,
  onUseInContentCalendar,
  onQuickRefine,
}) {
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);
  const [savedFavorites, setSavedFavorites] = useState([]);

  const currentVariation = variations[selectedVarIndex] || variations[0];

  const handleCopy = (text, keyName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const toggleFavorite = (varId) => {
    setSavedFavorites((prev) =>
      prev.includes(varId) ? prev.filter((id) => id !== varId) : [...prev, varId]
    );
  };

  if (isGenerating) {
    return (
      <div className="ai-results-pane loading-state-card">
        <div className="ai-generation-loader">
          <div className="pulsing-ai-orb">
            <Sparkles size={28} className="spin-slow" />
          </div>
          <h4>Synthesizing Brand Strategy...</h4>
          <p>
            Analyzing voice rules for <strong>{selectedClientObj?.name || 'Client'}</strong> and optimizing high-conversion copy...
          </p>
          <div className="loading-bar-track">
            <div className="loading-bar-progress" />
          </div>
        </div>
      </div>
    );
  }

  if (!variations || variations.length === 0) {
    return (
      <div className="ai-results-pane empty-state-card">
        <div className="ai-empty-illustration">
          <Wand2 size={40} className="empty-wand-icon" />
        </div>
        <h3 className="empty-title">Ready for Your Creative Prompt</h3>
        <p className="empty-desc">
          Select your tool mode, tweak your tone parameters on the left, and click <strong>Generate with AI</strong> to craft multi-angle marketing copy.
        </p>
        <div className="empty-features-strip">
          <div className="empty-feat-pill">⚡ 3 On-Brand Variations</div>
          <div className="empty-feat-pill">🎯 Algorithmic Hashtags</div>
          <div className="empty-feat-pill">📅 1-Click to Calendar</div>
        </div>
      </div>
    );
  }

  const isFavorite = savedFavorites.includes(currentVariation?.id);
  const fullTextToCopy = `${currentVariation.hook}\n\n${currentVariation.body}\n\n${currentVariation.cta}\n\n${currentVariation.hashtags?.join(' ')}`;

  return (
    <div className="ai-results-pane result-active-card">
      {/* Variation Switcher Tabs & Meta */}
      <div className="result-top-bar">
        <div className="variation-tabs-list">
          {variations.map((v, idx) => (
            <button
              key={v.id || idx}
              type="button"
              className={`variation-tab-btn ${selectedVarIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedVarIndex(idx)}
            >
              <Layers size={13} />
              <span>{v.title?.split(':')[0] || `Variation ${idx + 1}`}</span>
            </button>
          ))}
        </div>

        <div className="result-metrics-badges">
          {currentVariation.wordCount && (
            <span className="metric-tag">
              <FileText size={11} /> {currentVariation.wordCount} words
            </span>
          )}
          {currentVariation.readingTime && (
            <span className="metric-tag">
              <Clock size={11} /> {currentVariation.readingTime}
            </span>
          )}
          {currentVariation.toneScore && (
            <span className="metric-tag highlight">
              <Flame size={11} /> {currentVariation.toneScore}
            </span>
          )}
        </div>
      </div>

      {/* Main Copy Content Box */}
      <div className="result-content-container">
        {/* Title Header */}
        <div className="result-variation-header">
          <h4 className="variation-full-title">{currentVariation.title}</h4>
          <button
            type="button"
            className={`btn-favorite-icon ${isFavorite ? 'active' : ''}`}
            onClick={() => toggleFavorite(currentVariation.id)}
            title={isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
          >
            {isFavorite ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        {/* Hook Box */}
        {currentVariation.hook && (
          <div className="copy-section-box hook-box">
            <div className="section-label-row">
              <span className="section-tag hook-tag">Attention Hook</span>
              <button
                type="button"
                className="btn-mini-copy"
                onClick={() => handleCopy(currentVariation.hook, 'hook')}
              >
                {copiedKey === 'hook' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                <span>{copiedKey === 'hook' ? 'Copied' : 'Copy Hook'}</span>
              </button>
            </div>
            <p className="hook-text-content">{currentVariation.hook}</p>
          </div>
        )}

        {/* Body Text */}
        {currentVariation.body && (
          <div className="copy-section-box body-box">
            <div className="section-label-row">
              <span className="section-tag body-tag">Core Body Copy & Framework</span>
              <button
                type="button"
                className="btn-mini-copy"
                onClick={() => handleCopy(currentVariation.body, 'body')}
              >
                {copiedKey === 'body' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                <span>{copiedKey === 'body' ? 'Copied' : 'Copy Body'}</span>
              </button>
            </div>
            <div className="body-formatted-text">
              {currentVariation.body.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* CTA Box */}
        {currentVariation.cta && (
          <div className="copy-section-box cta-box">
            <div className="section-label-row">
              <span className="section-tag cta-tag">Call to Action (CTA)</span>
              <button
                type="button"
                className="btn-mini-copy"
                onClick={() => handleCopy(currentVariation.cta, 'cta')}
              >
                {copiedKey === 'cta' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                <span>{copiedKey === 'cta' ? 'Copied' : 'Copy CTA'}</span>
              </button>
            </div>
            <p className="cta-text-content">{currentVariation.cta}</p>
          </div>
        )}

        {/* Hashtags Cloud */}
        {currentVariation.hashtags && currentVariation.hashtags.length > 0 && (
          <div className="copy-section-box hashtags-box">
            <div className="section-label-row">
              <span className="section-tag hashtags-tag">Hashtags & SEO Tags</span>
              <button
                type="button"
                className="btn-mini-copy"
                onClick={() => handleCopy(currentVariation.hashtags.join(' '), 'hashtags')}
              >
                {copiedKey === 'hashtags' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                <span>{copiedKey === 'hashtags' ? 'Copied All' : 'Copy All Tags'}</span>
              </button>
            </div>
            <div className="hashtags-interactive-cloud">
              {currentVariation.hashtags.map((tag, tagIdx) => (
                <button
                  key={tagIdx}
                  type="button"
                  className="hashtag-interactive-pill"
                  onClick={() => handleCopy(tag, `tag-${tagIdx}`)}
                  title="Click to copy tag"
                >
                  <span>{tag}</span>
                  {copiedKey === `tag-${tagIdx}` && <Check size={10} className="text-success ml-1" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Refine Bar */}
      <div className="result-refine-bar">
        <span className="refine-label">
          <Wand2 size={13} />
          <span>Quick AI Refinements:</span>
        </span>
        <div className="refine-buttons-group">
          <button
            type="button"
            className="btn-refine-chip"
            onClick={() => onQuickRefine?.('Make it punchier, concise and high-energy')}
          >
            🔥 Make Punchier
          </button>
          <button
            type="button"
            className="btn-refine-chip"
            onClick={() => onQuickRefine?.('Add engaging emojis and list formatting')}
          >
            ✨ Add More Emojis
          </button>
          <button
            type="button"
            className="btn-refine-chip"
            onClick={() => onQuickRefine?.('Rewrite for B2B executive LinkedIn audience')}
          >
            👔 Executive B2B Tone
          </button>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="result-footer-actions">
        <button
          type="button"
          className="btn-saas-secondary btn-copy-full"
          onClick={() => handleCopy(fullTextToCopy, 'all')}
        >
          {copiedKey === 'all' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          <span>{copiedKey === 'all' ? 'Copied Full Post!' : 'Copy Entire Post'}</span>
        </button>

        <button
          type="button"
          className="btn-saas-primary btn-use-calendar"
          onClick={() =>
            onUseInContentCalendar?.({
              title: currentVariation.title?.split(':')[1]?.trim() || 'AI Generated Post',
              caption: `${currentVariation.hook}\n\n${currentVariation.body}\n\n${currentVariation.cta}`,
              hashtags: currentVariation.hashtags || [],
            })
          }
        >
          <CalendarPlus size={16} />
          <span>Use in Content Calendar</span>
        </button>
      </div>
    </div>
  );
}

export default AIResultCard;
