import React, { useState } from 'react';
import { X, Send, Download, Copy, CheckCircle2, Video, Image as ImageIcon, Sparkles, HardDrive } from 'lucide-react';

export function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onSendToComposer,
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen || !asset) return null;

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(asset.url).catch(() => {});
    }
    setCopiedUrl(true);
    setTimeout(() => {
      setCopiedUrl(false);
    }, 2500);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card asset-detail-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              {asset.type === 'Video' ? <Video size={18} /> : <ImageIcon size={18} />}
            </div>
            <div>
              <h3 className="modal-title">{asset.title}</h3>
              <p className="modal-subtitle">🏢 {asset.clientName} • Uploaded on {asset.uploadedAt} by {asset.uploader}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="asset-detail-body">
          {/* Left Column: Media Preview */}
          <div className="asset-large-preview-col">
            <div className="large-preview-wrapper">
              <img
                src={asset.url}
                alt={asset.title}
                className="large-preview-img"
              />
              <span className="preview-ratio-tag">{asset.aspectRatio}</span>
              {asset.type === 'Video' && (
                <div className="preview-video-badge">
                  <Video size={20} />
                  <span>4K Video Asset</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata Diagnostics & AI Tags */}
          <div className="asset-metadata-col">
            <div className="meta-card-block">
              <h4 className="meta-section-title">Technical Diagnostics</h4>
              <div className="meta-specs-grid">
                <div className="spec-item">
                  <span className="spec-lbl">Resolution</span>
                  <strong className="spec-val">{asset.resolution}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">Aspect Ratio</span>
                  <strong className="spec-val text-cyan">{asset.aspectRatio}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">File Format</span>
                  <strong className="spec-val">{asset.format}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">File Size</span>
                  <strong className="spec-val">{asset.fileSize}</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">Campaign Usage</span>
                  <strong className="spec-val text-success">{asset.usedCount} Posts</strong>
                </div>
                <div className="spec-item">
                  <span className="spec-lbl">Uploaded By</span>
                  <strong className="spec-val">{asset.uploader}</strong>
                </div>
              </div>
            </div>

            {/* AI Auto-Tags */}
            <div className="meta-card-block">
              <div className="meta-section-head">
                <Sparkles size={14} className="text-warning" />
                <h4 className="meta-section-title">AI Computer Vision Tags</h4>
              </div>
              <div className="ai-tags-cloud-large">
                {asset.aiTags.map((tag, i) => (
                  <span key={i} className="ai-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct CDN Link */}
            <div className="meta-card-block">
              <span className="spec-lbl mb-1 block">Global Edge CDN URL:</span>
              <div className="cdn-url-box">
                <input
                  type="text"
                  readOnly
                  value={asset.url}
                  className="cdn-url-input"
                />
                <button
                  type="button"
                  className="btn-copy-cdn"
                  onClick={handleCopyUrl}
                >
                  {copiedUrl ? <CheckCircle2 size={13} className="text-success" /> : <Copy size={13} />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
          <a
            href={asset.url}
            target="_blank"
            rel="noreferrer"
            download
            className="btn-saas-secondary"
          >
            <Download size={14} />
            <span>Download Asset</span>
          </a>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => {
              onSendToComposer(asset);
              onClose();
            }}
          >
            <Send size={15} />
            <span>Use in Post Composer</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssetDetailModal;
