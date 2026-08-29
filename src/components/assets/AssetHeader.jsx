import React from 'react';
import {
  FolderGit2,
  UploadCloud,
  LayoutGrid,
  List,
  Search,
  Building,
  Filter,
  Image as ImageIcon,
  Ratio,
  HardDrive,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function AssetHeader({
  viewMode,
  onViewModeChange,
  selectedClient,
  onClientChange,
  selectedType,
  onTypeChange,
  selectedRatio,
  onRatioChange,
  searchQuery,
  onSearchChange,
  onOpenUploadModal,
  storageMetrics = {},
}) {
  const assetTypes = ['all', 'Image', 'Video', 'Logo'];
  const ratios = ['all', '1:1', '9:16', '16:9', '4:5'];

  return (
    <div className="asset-header-container">
      {/* Top Banner */}
      <div className="asset-top-banner">
        <div className="asset-title-block">
          <div className="asset-badge-tag">
            <FolderGit2 size={14} />
            <span>Digital Asset Management & AI Creative Cloud Vault</span>
          </div>
          <h1 className="asset-main-title">Media Asset Library & Creative Vault</h1>
          <p className="asset-subtitle-text">
            Centralized 4K video, high-res photography, vector logos, and marketing collateral library with automated AI visual tagging and instant multi-channel composer dispatching.
          </p>

          {/* Mini Storage Quota Strip */}
          <div className="storage-mini-meter">
            <div className="storage-meter-text">
              <HardDrive size={13} className="text-cyan" />
              <span>Cloud Storage: <strong>{storageMetrics.usedBytes || '142.8 GB'}</strong> of {storageMetrics.totalQuota || '1.0 TB'} ({storageMetrics.percentageUsed || 14.2}% Used)</span>
            </div>
            <div className="storage-progress-bar">
              <div
                className="storage-progress-fill"
                style={{ width: `${storageMetrics.percentageUsed || 14.2}%` }}
              />
            </div>
          </div>
        </div>

        <div className="asset-banner-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-tabs-group" role="group" aria-label="Asset View Mode">
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            className="btn-upload-asset-primary"
            onClick={onOpenUploadModal}
          >
            <UploadCloud size={16} />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="asset-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Search Box */}
          <div className="asset-search-field-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search assets by file title, client, or AI tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="asset-search-input"
            />
          </div>

          {/* Client Filter */}
          <div className="asset-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="asset-select-field"
              aria-label="Filter by Client Workspace"
            >
              <option value="all">🏢 All Client Workspaces</option>
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="asset-select-wrapper">
            <ImageIcon size={14} className="icon-muted" />
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="asset-select-field"
              aria-label="Filter by Asset Type"
            >
              <option value="all">📁 All Media Types</option>
              {assetTypes.filter((t) => t !== 'all').map((type) => (
                <option key={type} value={type}>
                  {type}s
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio Filter */}
          <div className="asset-select-wrapper">
            <Ratio size={14} className="icon-muted" />
            <select
              value={selectedRatio}
              onChange={(e) => onRatioChange(e.target.value)}
              className="asset-select-field"
              aria-label="Filter by Aspect Ratio"
            >
              <option value="all">📐 All Aspect Ratios</option>
              {ratios.filter((r) => r !== 'all').map((ratio) => (
                <option key={ratio} value={ratio}>
                  {ratio} {ratio === '9:16' ? '(Story/Reel)' : ratio === '1:1' ? '(Square)' : ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetHeader;
