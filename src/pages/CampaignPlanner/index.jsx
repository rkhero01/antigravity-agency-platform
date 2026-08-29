import React, { useState, useEffect, useMemo } from 'react';
import {
  CampaignHeader,
  CampaignKpiCards,
  CampaignsGrid,
  CampaignTimelineTab,
  CampaignDetailModal,
  CreateCampaignModal,
  AICampaignRoadmapModal,
} from '../../components/campaigns/index.js';
import { campaignService } from '../../services/campaignService.js';
import { CheckCircle2 } from 'lucide-react';

export function CampaignPlannerPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'timeline'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [inspectedCampaign, setInspectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
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
    const data = await campaignService.getCampaigns();
    setCampaigns(data);
    setLoading(false);
  };

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : c.clientId === selectedClientFilter;
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : c.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.primaryGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.audiencePersona.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesStatus && matchesSearch;
    });
  }, [campaigns, selectedClientFilter, selectedStatus, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return campaignService.calculateCampaignMetrics(filteredCampaigns);
  }, [filteredCampaigns]);

  // Handlers
  const handleCreateCampaign = async (formData) => {
    const created = await campaignService.createCampaign(formData);
    setCampaigns((prev) => [created, ...prev]);
    showToast(`🚀 Initialized campaign brief "${created.title}"!`);
  };

  const handleDeleteCampaign = async (id) => {
    await campaignService.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('Campaign brief deleted.');
  };

  return (
    <div className="campaign-planner-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
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
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* 5 KPI Metric Cards */}
      <CampaignKpiCards metrics={metrics} />

      {/* Main Content: Cards vs Timeline */}
      {viewMode === 'cards' ? (
        <CampaignsGrid
          campaigns={filteredCampaigns}
          onInspect={setInspectedCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <CampaignTimelineTab
          campaigns={filteredCampaigns}
          onInspect={setInspectedCampaign}
        />
      )}

      {/* Inspect Strategy Brief Modal */}
      <CampaignDetailModal
        campaign={inspectedCampaign}
        isOpen={Boolean(inspectedCampaign)}
        onClose={() => setInspectedCampaign(null)}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />

      {/* AI Roadmap Generator Modal */}
      <AICampaignRoadmapModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}

export default CampaignPlannerPage;
