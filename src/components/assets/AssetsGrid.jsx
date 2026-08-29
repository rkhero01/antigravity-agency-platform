import React from 'react';
import { FolderGit2, Plus } from 'lucide-react';
import { AssetCard } from './AssetCard.jsx';

export function AssetsGrid({
  assets = [],
  onInspect,
  onSendToComposer,
  onDeleteAsset,
  onOpenUploadModal,
}) {
  if (assets.length === 0) {
    return (
      <div className="assets-empty-state-card">
        <FolderGit2 size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No media assets found</h4>
        <p className="empty-state-subtitle">Adjust your filter parameters or upload creative assets for your client accounts.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenUploadModal}
        >
          <Plus size={15} />
          <span>Upload Media Asset</span>
        </button>
      </div>
    );
  }

  return (
    <div className="assets-cards-grid">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onInspect={onInspect}
          onSendToComposer={onSendToComposer}
          onDeleteAsset={onDeleteAsset}
        />
      ))}
    </div>
  );
}

export default AssetsGrid;
