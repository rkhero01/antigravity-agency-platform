import React, { useState, useEffect, useMemo } from 'react';
import {
  CampaignHeader,
  CampaignKpiCards,
  CampaignsGrid,
  CampaignsTable,
  CampaignDetailModal,
  CreateCampaignModal,
  EditCampaignModal,
} from '../../components/campaigns/index.js';
import { campaignsService } from '../../services/campaignsService.js';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function CampaignPlannerPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedObjective, setSelectedObjective] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [inspectedCampaign, setInspectedCampaign] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await campaignsService.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns from PostgreSQL:', err);
      setError(
        err.message || 'Unable to retrieve campaigns from database. Please check connection and retry.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : c.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : (c.platform || '').toUpperCase() === selectedPlatform.toUpperCase();
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : (c.statusRaw || c.status || '').toUpperCase() === selectedStatus.toUpperCase();
      const matchesObjective =
        selectedObjective === 'all'
          ? true
          : (c.objective || '').toUpperCase() === selectedObjective.toUpperCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.name || c.title || '').toLowerCase().includes(q) ||
        (c.clientName || '').toLowerCase().includes(q) ||
        (c.objective || '').toLowerCase().includes(q) ||
        (c.externalCampaignId || '').toLowerCase().includes(q);

      return matchesClient && matchesPlatform && matchesStatus && matchesObjective && matchesSearch;
    });
  }, [campaigns, selectedClientFilter, selectedPlatform, selectedStatus, selectedObjective, searchQuery]);

  // Live Summary KPI Metrics
  const kpis = useMemo(() => {
    return campaignsService.calculateCampaignKPIs(campaigns);
  }, [campaigns]);

  // Handlers
  const handleCreateCampaign = async (formData) => {
    const created = await campaignsService.createCampaign(formData);
    await loadData(true);
    showToast(`🚀 Launched campaign "${created.name || created.title}"!`);
  };

  const handleUpdateCampaign = async (id, updates) => {
    const updated = await campaignsService.updateCampaign(id, updates);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    if (inspectedCampaign && inspectedCampaign.id === id) {
      setInspectedCampaign(updated);
    }
    showToast(`✏️ Updated campaign "${updated.name || updated.title}"!`);
  };

  const handleArchiveCampaign = async (id) => {
    const target = campaigns.find((c) => c.id === id);
    const confirm = window.confirm(
      `Are you sure you want to archive campaign "${target?.name || target?.title || 'this campaign'}"? It will be soft-deleted in PostgreSQL.`
    );
    if (!confirm) return;

    try {
      await campaignsService.archiveCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (inspectedCampaign && inspectedCampaign.id === id) {
        setInspectedCampaign(null);
      }
      showToast('Campaign archived successfully');
    } catch (err) {
      console.error('Failed to archive campaign:', err);
      alert(err.message || 'Failed to archive campaign.');
    }
  };

  return (
    <div className="campaign-planner-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification" role="status">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <CampaignHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedObjective={selectedObjective}
        onObjectiveChange={setSelectedObjective}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* 5 KPI Metric Cards */}
      <CampaignKpiCards kpis={kpis} />

      {/* Main Content: Loading, Error, Grid, or Table */}
      {loading ? (
        <div className="clients-state-box loading">
          <div className="clients-loading-spinner" />
          <p className="clients-state-title">
            Loading campaigns from PostgreSQL database...
          </p>
          <span className="clients-state-sub">
            Fetching delivery parameters, budgets & client workspace attribution
          </span>
        </div>
      ) : error ? (
        <div className="clients-state-box error" role="alert">
          <div className="state-icon-badge error">
            <AlertCircle size={28} />
          </div>
          <h3 className="clients-state-title">Database Connection Error</h3>
          <p className="clients-state-desc">{error}</p>
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => loadData(false)}
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <CampaignsGrid
          campaigns={filteredCampaigns}
          onInspect={setInspectedCampaign}
          onEdit={setEditingCampaign}
          onArchive={handleArchiveCampaign}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <CampaignsTable
          campaigns={filteredCampaigns}
          onInspect={setInspectedCampaign}
          onEdit={setEditingCampaign}
          onArchive={handleArchiveCampaign}
        />
      )}

      {/* Inspect Detail Modal */}
      <CampaignDetailModal
        campaign={inspectedCampaign}
        isOpen={Boolean(inspectedCampaign)}
        onClose={() => setInspectedCampaign(null)}
        onEdit={(camp) => setEditingCampaign(camp)}
        onArchive={handleArchiveCampaign}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        campaign={editingCampaign}
        isOpen={Boolean(editingCampaign)}
        onClose={() => setEditingCampaign(null)}
        onUpdateCampaign={handleUpdateCampaign}
      />
    </div>
  );
}

export default CampaignPlannerPage;
