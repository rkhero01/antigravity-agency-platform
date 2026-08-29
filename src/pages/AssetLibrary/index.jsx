import React, { useState, useEffect, useMemo } from 'react';
import {
  AssetHeader,
  AssetKpiCards,
  AssetsGrid,
  AssetsTable,
  AssetDetailModal,
  UploadAssetModal,
} from '../../components/assets/index.js';
import { assetService } from '../../services/assetService.js';
import { MODULES } from '../../utils/constants.js';
import { CheckCircle2 } from 'lucide-react';

export function AssetLibraryPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [assets, setAssets] = useState([]);
  const [storageMetrics, setStorageMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRatio, setSelectedRatio] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [inspectedAsset, setInspectedAsset] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientFilter(activeClient);
    }
  }, [activeClient]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    setLoading(true);
    const [assetData, storageData] = await Promise.all([
      assetService.getAssets(),
      assetService.getStorageMetrics(),
    ]);
    setAssets(assetData);
    setStorageMetrics(storageData);
    setLoading(false);
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : a.clientId === selectedClientFilter;
      const matchesType =
        selectedType === 'all'
          ? true
          : a.type.toLowerCase() === selectedType.toLowerCase();
      const matchesRatio =
        selectedRatio === 'all'
          ? true
          : a.aspectRatio.toLowerCase() === selectedRatio.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.format.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.aiTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesClient && matchesType && matchesRatio && matchesSearch;
    });
  }, [assets, selectedClientFilter, selectedType, selectedRatio, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return assetService.calculateAssetMetrics(filteredAssets);
  }, [filteredAssets]);

  // Handlers
  const handleUploadAsset = async (formData) => {
    const created = await assetService.uploadAsset(formData);
    setAssets((prev) => [created, ...prev]);
    showToast(`✨ Successfully uploaded and AI-indexed "${created.title}"!`);
  };

  const handleDeleteAsset = async (id) => {
    await assetService.deleteAsset(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    showToast('Asset removed from cloud vault.');
  };

  const handleSendToComposer = (asset) => {
    showToast(`🚀 Dispatched "${asset.title}" to Content Post Composer!`);
    if (onNavigate) {
      setTimeout(() => {
        onNavigate(MODULES.CONTENT);
      }, 700);
    }
  };

  return (
    <div className="asset-library-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <AssetHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedRatio={selectedRatio}
        onRatioChange={setSelectedRatio}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        storageMetrics={storageMetrics}
      />

      {/* 5 KPI Metric Cards */}
      <AssetKpiCards metrics={metrics} />

      {/* Main Content: Grid vs Table */}
      {viewMode === 'grid' ? (
        <AssetsGrid
          assets={filteredAssets}
          onInspect={setInspectedAsset}
          onSendToComposer={handleSendToComposer}
          onDeleteAsset={handleDeleteAsset}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <AssetsTable
          assets={filteredAssets}
          onInspect={setInspectedAsset}
          onSendToComposer={handleSendToComposer}
          onDeleteAsset={handleDeleteAsset}
        />
      )}

      {/* Asset Detail & Technical Specs Modal */}
      <AssetDetailModal
        asset={inspectedAsset}
        isOpen={Boolean(inspectedAsset)}
        onClose={() => setInspectedAsset(null)}
        onSendToComposer={handleSendToComposer}
      />

      {/* Upload Media Asset Modal */}
      <UploadAssetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadAsset={handleUploadAsset}
      />
    </div>
  );
}

export default AssetLibraryPage;
