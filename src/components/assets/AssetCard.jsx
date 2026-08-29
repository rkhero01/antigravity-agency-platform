import React from 'react';
import { Video, Image as ImageIcon, Eye, Send, Trash2, Tag, FileText } from 'lucide-react';

export function AssetCard({
  asset,
  onInspect,
  onSendToComposer,
  onDeleteAsset,
}) {
  const isVideo = asset.type === 'Video';

  return (
    <div className="asset-card-item">
      {/* Thumbnail Container */}
      <div className="asset-media-preview-box" onClick={() => onInspect(asset)}>
        <img
          src={asset.url}
          alt={asset.title}
          className="asset-thumbnail-img"
        />

        <span className="asset-ratio-badge">{asset.aspectRatio}</span>

        {isVideo && (
          <div className="asset-video-play-indicator">
            <Video size={18} />
          </div>
        )}

        <div className="asset-hover-overlay">
          <button
            type="button"
            className="btn-overlay-inspect"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(asset);
            }}
          >
            <Eye size={14} />
            <span>Quick Inspect</span>
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="asset-card-info">
        <div className="asset-meta-top">
          <span className="asset-client-chip">🏢 {asset.clientName}</span>
          <span className="asset-format-chip">{asset.format}</span>
        </div>

        <h4 className="asset-file-title" title={asset.title}>
          {asset.title}
        </h4>

        <div className="asset-dimensions-row">
          <span>📐 {asset.resolution}</span>
          <span>• {asset.fileSize}</span>
          <span>• Used in {asset.usedCount} posts</span>
        </div>

        {/* AI Tags */}
        <div className="asset-ai-tags-strip">
          {asset.aiTags.slice(0, 3).map((tag, i) => (
            <span key={i} className="asset-mini-tag">
              #{tag}
            </span>
          ))}
          {asset.aiTags.length > 3 && (
            <span className="asset-mini-tag more">+{asset.aiTags.length - 3}</span>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="asset-card-footer">
          <button
            type="button"
            className="btn-send-to-composer"
            onClick={() => onSendToComposer(asset)}
            title="Insert into post composer"
          >
            <Send size={12} />
            <span>Use Asset</span>
          </button>

          <button
            type="button"
            className="btn-delete-asset"
            onClick={() => onDeleteAsset(asset.id)}
            title="Delete from library"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssetCard;
