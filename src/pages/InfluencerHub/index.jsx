import React, { useState, useEffect, useMemo } from 'react';
import {
  InfluencerHeader,
  InfluencerKpiCards,
  InfluencersGrid,
  InfluencersTable,
  AddInfluencerModal,
  OutreachPitchModal,
} from '../../components/influencers/index.js';
import { influencerService } from '../../services/influencerService.js';
import { CheckCircle2 } from 'lucide-react';

export function InfluencerHubPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pitchInfluencer, setPitchInfluencer] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadInfluencers();
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

  const loadInfluencers = async () => {
    setLoading(true);
    const data = await influencerService.getInfluencers();
    setInfluencers(data);
    setLoading(false);
  };

  // Filtered List
  const filteredInfluencers = useMemo(() => {
    return influencers.filter((inf) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : inf.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : inf.platform.toLowerCase() === selectedPlatform.toLowerCase();
      const matchesStage =
        selectedStage === 'all'
          ? true
          : inf.stage.toLowerCase() === selectedStage.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inf.promoCode.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesPlatform && matchesStage && matchesSearch;
    });
  }, [
    influencers,
    selectedClientFilter,
    selectedPlatform,
    selectedStage,
    searchQuery,
  ]);

  // Metrics
  const metrics = useMemo(() => {
    return influencerService.calculateInfluencerMetrics(filteredInfluencers);
  }, [filteredInfluencers]);

  // Handlers
  const handleAddInfluencer = async (formData) => {
    const created = await influencerService.addInfluencer(formData);
    setInfluencers((prev) => [created, ...prev]);
    showToast(`✨ Onboarded creator partner ${created.name} (${created.handle})!`);
  };

  const handleUpdateStage = async (id, newStage) => {
    const updated = await influencerService.updateStage(id, newStage);
    setInfluencers((prev) => prev.map((i) => (i.id === id ? updated : i)));
    showToast(`Campaign stage updated to "${newStage}" for ${updated.name}`);
  };

  const handleDeleteInfluencer = async (id) => {
    await influencerService.deleteInfluencer(id);
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
    showToast('Creator partnership removed from campaign roster.');
  };

  return (
    <div className="influencer-hub-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <InfluencerHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* 5 KPI Metric Cards */}
      <InfluencerKpiCards metrics={metrics} />

      {/* Main View: Cards Grid or Pipeline Table */}
      {viewMode === 'grid' ? (
        <InfluencersGrid
          influencers={filteredInfluencers}
          onOpenPitchModal={(inf) => setPitchInfluencer(inf)}
          onUpdateStage={handleUpdateStage}
          onDeleteInfluencer={handleDeleteInfluencer}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      ) : (
        <InfluencersTable
          influencers={filteredInfluencers}
          onOpenPitchModal={(inf) => setPitchInfluencer(inf)}
          onUpdateStage={handleUpdateStage}
          onDeleteInfluencer={handleDeleteInfluencer}
        />
      )}

      {/* Onboard Creator Modal */}
      <AddInfluencerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddInfluencer={handleAddInfluencer}
      />

      {/* AI Outreach Pitch Generator Modal */}
      <OutreachPitchModal
        influencer={pitchInfluencer}
        isOpen={Boolean(pitchInfluencer)}
        onClose={() => setPitchInfluencer(null)}
      />
    </div>
  );
}

export default InfluencerHubPage;
