import React from 'react';
import { Eye, Send, Trash2, Video, Image as ImageIcon } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function AssetsTable({
  assets = [],
  onInspect,
  onSendToComposer,
  onDeleteAsset,
}) {
  return (
    <div className="assets-table-card">
      <div className="table-card-header">
        <span className="table-title">Media Files & Creative Asset Repository</span>
        <span className="table-count-chip">{assets.length} Total Files</span>
      </div>

      <div className="logs-table-responsive">
        <table className="saas-table assets-audit-table">
          <thead>
            <tr>
              <th>Asset Preview</th>
              <th>File Title</th>
              <th>Client Scope</th>
              <th>Type</th>
              <th>Ratio</th>
              <th>Resolution</th>
              <th>Size</th>
              <th>AI Content Tags</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted">
                  No assets match current criteria.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="asset-table-row">
                  <td>
                    <div
                      className="table-thumb-wrapper"
                      onClick={() => onInspect(asset)}
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="table-thumb-img"
                      />
                      {asset.type === 'Video' && (
                        <div className="thumb-video-icon">
                          <Video size={11} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong
                      className="table-asset-name text-cyan cursor-pointer"
                      onClick={() => onInspect(asset)}
                    >
                      {asset.title}
                    </strong>
                  </td>
                  <td>
                    <span className="table-client-text">🏢 {asset.clientName}</span>
                  </td>
                  <td>
                    <Badge variant={asset.type === 'Video' ? 'primary' : 'neutral'} size="sm">
                      {asset.type}
                    </Badge>
                  </td>
                  <td>
                    <span className="table-ratio-text">{asset.aspectRatio}</span>
                  </td>
                  <td>
                    <span className="table-res-text">{asset.resolution}</span>
                  </td>
                  <td>
                    <span className="table-size-text">{asset.fileSize}</span>
                  </td>
                  <td>
                    <div className="table-tags-cell">
                      {asset.aiTags.slice(0, 2).map((t, i) => (
                        <span key={i} className="asset-mini-tag">
                          #{t}
                        </span>
                      ))}
                      {asset.aiTags.length > 2 && (
                        <span className="asset-mini-tag more">+{asset.aiTags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="table-time-text">{asset.uploadedAt}</span>
                  </td>
                  <td>
                    <div className="table-actions-cell">
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onInspect(asset)}
                        title="Inspect asset"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-table-action text-primary"
                        onClick={() => onSendToComposer(asset)}
                        title="Use in post composer"
                      >
                        <Send size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-table-action text-danger"
                        onClick={() => onDeleteAsset(asset.id)}
                        title="Delete asset"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetsTable;
