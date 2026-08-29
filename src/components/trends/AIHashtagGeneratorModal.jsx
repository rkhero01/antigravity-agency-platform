import React, { useState } from 'react';
import { X, Sparkles, Copy, CheckCircle2, Plus, Hash } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { trendService } from '../../services/trendService.js';

export function AIHashtagGeneratorModal({
  isOpen,
  onClose,
  onSaveGeneratedSet,
}) {
  const [clientId, setClientId] = useState('c1');
  const [topicPrompt, setTopicPrompt] = useState('Mobility Recovery & Sauna');
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    const result = await trendService.generateAIHashtags(clientId, topicPrompt);
    setGeneratedResult(result);
    setGenerating(false);
  };

  const handleCopyTags = () => {
    if (!generatedResult) return;
    const text = generatedResult.tags.join(' ');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const handleSaveToLibrary = () => {
    if (!generatedResult) return;
    onSaveGeneratedSet({
      name: generatedResult.clusterName,
      clientId,
      hashtags: generatedResult.tags,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card ai-hashtag-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Algorithmic Hashtag Engine</h3>
              <p className="modal-subtitle">Generate high-reach, low-competition 3-tier hashtag clusters</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ai-hashtag-body">
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
                <label className="form-label">Post or Campaign Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Skincare Morning Routine"
                  value={topicPrompt}
                  onChange={(e) => setTopicPrompt(e.target.value)}
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
              <span>{generating ? 'Optimizing Hashtag Density...' : 'Generate 15-Tag Cluster'}</span>
            </button>
          </form>

          {/* Generated Result Output */}
          {generatedResult && (
            <div className="generated-cluster-box">
              <div className="cluster-header-row">
                <strong className="cluster-title">{generatedResult.clusterName}</strong>
                <button
                  type="button"
                  className="btn-copy-cluster"
                  onClick={handleCopyTags}
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

              <div className="cluster-tags-cloud">
                {generatedResult.tags.map((tag, i) => (
                  <span key={i} className="cluster-tag-chip">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="cluster-actions-row">
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={handleSaveToLibrary}
                >
                  <Plus size={14} />
                  <span>Save to Client Hashtag Library</span>
                </button>
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

export default AIHashtagGeneratorModal;
