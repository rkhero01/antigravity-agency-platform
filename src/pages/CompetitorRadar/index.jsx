import React, { useState, useEffect, useMemo } from 'react';
import {
  CompetitorHeader,
  CompetitorKpiCards,
  CompetitorsGrid,
  CompetitorContentRadar,
  CompetitorAdsSpy,
  AddCompetitorModal,
  AIGapAnalysisModal,
} from '../../components/competitors/index.js';
import { competitorService } from '../../services/competitorService.js';
import { CheckCircle2 } from 'lucide-react';

export function CompetitorRadarPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [competitors, setCompetitors] = useState([]);
  const [contentRadar, setContentRadar] = useState([]);
  const [adsList, setAdsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('benchmarks'); // 'benchmarks' | 'radar' | 'ads'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedClientFilter]);

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
    const [compData, radarData, adsData] = await Promise.all([
      competitorService.getCompetitors(),
      competitorService.getContentRadar(selectedClientFilter),
      competitorService.getCompetitorAds(selectedClientFilter),
    ]);
    setCompetitors(compData);
    setContentRadar(radarData);
    setAdsList(adsData);
    setLoading(false);
  };

  // Filtered Competitors
  const filteredCompetitors = useMemo(() => {
    return competitors.filter((c) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : c.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : c.platform.toLowerCase() === selectedPlatform.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.strengths.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesPlatform && matchesSearch;
    });
  }, [competitors, selectedClientFilter, selectedPlatform, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return competitorService.calculateCompetitorMetrics(filteredCompetitors);
  }, [filteredCompetitors]);

  // Handlers
  const handleAddCompetitor = async (formData) => {
    const created = await competitorService.addCompetitor(formData);
    setCompetitors((prev) => [created, ...prev]);
    showToast(`🎯 Added competitor "${created.name}" (${created.handle}) to radar!`);
  };

  const handleDeleteCompetitor = async (id) => {
    await competitorService.deleteCompetitor(id);
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    showToast('Competitor removed from benchmark tracking.');
  };

  return (
    <div className="competitor-radar-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <CompetitorHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenGapModal={() => setIsGapModalOpen(true)}
      />

      {/* 5 KPI Metric Cards */}
      <CompetitorKpiCards metrics={metrics} />

      {/* 3 Interactive Tab Views */}
      {viewMode === 'benchmarks' && (
        <CompetitorsGrid
          competitors={filteredCompetitors}
          onDeleteCompetitor={handleDeleteCompetitor}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}

      {viewMode === 'radar' && (
        <CompetitorContentRadar contentList={contentRadar} />
      )}

      {viewMode === 'ads' && (
        <CompetitorAdsSpy adsList={adsList} />
      )}

      {/* Add Competitor Modal */}
      <AddCompetitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCompetitor={handleAddCompetitor}
      />

      {/* AI Gap Analysis Modal */}
      <AIGapAnalysisModal
        selectedClient={selectedClientFilter !== 'all' ? selectedClientFilter : 'c1'}
        isOpen={isGapModalOpen}
        onClose={() => setIsGapModalOpen(false)}
      />
    </div>
  );
}

export default CompetitorRadarPage;
