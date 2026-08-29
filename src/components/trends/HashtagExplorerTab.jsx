import React, { useState } from 'react';
import { Hash, Copy, CheckCircle2, Trash2, Plus, TrendingUp, Layers } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function HashtagExplorerTab({
  hashtags = [],
  savedSets = [],
  onDeleteSet,
  onOpenSaveModal,
}) {
  const [copiedSetId, setCopiedSetId] = useState(null);
  const [copiedTag, setCopiedTag] = useState(null);

  const handleCopySet = (set) => {
    const text = set.hashtags.join(' ');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedSetId(set.id);
    setTimeout(() => {
      setCopiedSetId(null);
    }, 2500);
  };

  const handleCopyTag = (tag) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tag).catch(() => {});
    }
    setCopiedTag(tag);
    setTimeout(() => {
      setCopiedTag(null);
    }, 2000);
  };

  const getCompetitionBadge = (comp) => {
    if (comp === 'Low') return <Badge variant="success" size="sm">✓ Low Competition</Badge>;
    if (comp === 'Medium') return <Badge variant="warning" size="sm">⚡ Medium Density</Badge>;
    return <Badge variant="danger" size="sm">🔥 High Volume</Badge>;
  };

  return (
    <div className="hashtag-explorer-pane">
      {/* Top Section: Saved Client Hashtag Sets */}
      <div className="saved-sets-section">
        <div className="section-head-row">
          <div>
            <h3 className="section-title">Saved Client Hashtag Sets</h3>
            <p className="section-desc">Curated 3-tier hashtag bundles ready for 1-click clipboard or composer export</p>
          </div>
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onOpenSaveModal}
          >
            <Plus size={14} />
            <span>New Hashtag Set</span>
          </button>
        </div>

        <div className="saved-sets-cards-grid">
          {savedSets.map((set) => (
            <div key={set.id} className="saved-set-card">
              <div className="set-card-header">
                <div>
                  <h4 className="set-title">{set.name}</h4>
                  <span className="set-client-tag">🏢 {set.clientName} • {set.tagsCount} Tags</span>
                </div>

                <div className="set-header-actions">
                  <button
                    type="button"
                    className="btn-copy-set-action"
                    onClick={() => handleCopySet(set)}
                  >
                    {copiedSetId === set.id ? (
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

                  <button
                    type="button"
                    className="btn-delete-set"
                    onClick={() => onDeleteSet(set.id)}
                    title="Delete set"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Tags Cloud */}
              <div className="set-tags-cloud">
                {set.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="hashtag-bubble-chip"
                    onClick={() => handleCopyTag(tag)}
                    title="Click to copy single tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Hashtag Volume & Competition Database */}
      <div className="hashtag-database-card">
        <div className="db-card-header">
          <div className="db-title-group">
            <Hash size={16} className="text-primary" />
            <span>Algorithmic Hashtag Density & Reach Explorer</span>
          </div>
          <span className="db-count-tag">{hashtags.length} Tracked Tags</span>
        </div>

        <div className="logs-table-responsive">
          <table className="saas-table hashtag-explorer-table">
            <thead>
              <tr>
                <th>Hashtag</th>
                <th>Platform</th>
                <th>Post Volume</th>
                <th>Estimated Reach Tier</th>
                <th>Competition Density</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hashtags.map((h) => (
                <tr key={h.id} className="ht-row-item">
                  <td>
                    <strong className="ht-tag-name text-cyan">{h.tag}</strong>
                  </td>
                  <td>
                    <span className="ht-platform-text">{h.platform}</span>
                  </td>
                  <td>
                    <span className="ht-vol-text">{h.volume}</span>
                  </td>
                  <td>
                    <span className="ht-reach-text">{h.reachTier}</span>
                  </td>
                  <td>
                    {getCompetitionBadge(h.competition)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-copy-mini-tag"
                      onClick={() => handleCopyTag(h.tag)}
                    >
                      {copiedTag === h.tag ? (
                        <CheckCircle2 size={12} className="text-success" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedTag === h.tag ? 'Copied' : 'Copy'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HashtagExplorerTab;
