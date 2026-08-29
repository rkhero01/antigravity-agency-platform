import React, { useState, useEffect, useMemo } from 'react';
import {
  AdsHeader,
  AdsKpiCards,
  AdsPerformanceChart,
  PlatformBreakdown,
  BudgetOptimizerAlerts,
  CampaignsTable,
  CampaignDetailModal,
  CreateCampaignModal,
} from '../../components/ads/index.js';
import { adsService } from '../../services/adsService.js';
import { CheckCircle2 } from 'lucide-react';

export function AdsPerformancePage({
  dateRange = '30d',
  onDateRangeChange,
  activeClient = 'all',
  onNavigate,
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  // Modals
  const [inspectedCampaign, setInspectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadAllAdsData();
  }, []);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientFilter(activeClient);
    }
  }, [activeClient]);

  useEffect(() => {
    loadTimeSeries(localDateRange);
  }, [localDateRange]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadAllAdsData = async () => {
    setLoading(true);
    const [camps, recs, tSeries] = await Promise.all([
      adsService.getCampaigns(),
      adsService.getRecommendations(),
      adsService.getPerformanceTimeSeries(localDateRange),
    ]);
    setCampaigns(camps);
    setRecommendations(recs);
    setTimeSeriesData(tSeries);
    setLoading(false);
  };

  const loadTimeSeries = async (range) => {
    const tSeries = await adsService.getPerformanceTimeSeries(range);
    setTimeSeriesData(tSeries);
  };

  const handleDateRangeSelect = (newRange) => {
    setLocalDateRange(newRange);
    onDateRangeChange?.(newRange);
  };

  // Filtered campaigns computation
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : c.clientId === selectedClientFilter;
      const matchesPlatform =
        selectedPlatform === 'all'
          ? true
          : c.platform.toLowerCase().includes(selectedPlatform.toLowerCase());
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : c.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.objective.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [campaigns, selectedClientFilter, selectedPlatform, selectedStatus, searchQuery]);

  // Aggregated Metrics
  const calculatedMetrics = useMemo(() => {
    return adsService.calculateMetrics(filteredCampaigns);
  }, [filteredCampaigns]);

  // Handlers
  const handleToggleStatus = async (id, newStatus) => {
    const updated = await adsService.updateCampaignStatus(id, newStatus);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    showToast(`Campaign status updated to "${newStatus}"`);
  };

  const handleUpdateBudget = async (id, newBudget) => {
    const updated = await adsService.updateCampaignBudget(id, newBudget);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    showToast(`Daily budget updated to $${newBudget}/day`);
  };

  const handleDeleteCampaign = async (id) => {
    await adsService.deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('Campaign deleted successfully');
  };

  const handleCreateCampaign = async (newCampData) => {
    const created = await adsService.createCampaign(newCampData);
    setCampaigns((prev) => [created, ...prev]);
    showToast(`🎉 Campaign "${created.campaignName}" launched successfully!`);
  };

  const handleApplyRecommendation = async (recId) => {
    await adsService.applyRecommendation(recId);
    setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    // Reload campaigns to reflect budget increase
    const updatedCamps = await adsService.getCampaigns();
    setCampaigns(updatedCamps);
    showToast('⚡ Applied AI budget optimization recommendation!');
  };

  const handleExportReport = () => {
    showToast('📄 Generated Paid Ads Executive Summary (PDF / CSV downloaded)');
  };

  return (
    <div className="ads-performance-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <AdsHeader
        dateRange={localDateRange}
        onDateRangeChange={handleDateRangeSelect}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onExportReport={handleExportReport}
      />

      {/* Top 6 KPI Stat Cards */}
      <AdsKpiCards metrics={calculatedMetrics} />

      {/* Performance Chart & Platform Breakdown Grid */}
      <div className="ads-charts-breakdown-grid">
        <AdsPerformanceChart
          timeSeriesData={timeSeriesData}
          dateRange={localDateRange}
        />
        <PlatformBreakdown campaigns={filteredCampaigns} />
      </div>

      {/* AI Campaign Budget Optimizer Recommendations */}
      <BudgetOptimizerAlerts
        recommendations={recommendations}
        onApplyRecommendation={handleApplyRecommendation}
      />

      {/* All Campaigns Data Table */}
      <CampaignsTable
        campaigns={filteredCampaigns}
        onSelectCampaign={(camp) => setInspectedCampaign(camp)}
        onToggleStatus={handleToggleStatus}
        onDeleteCampaign={handleDeleteCampaign}
        onQuickAdjustBudget={(camp) => setInspectedCampaign(camp)}
      />

      {/* Campaign Detail / Funnel Modal */}
      <CampaignDetailModal
        campaign={inspectedCampaign}
        isOpen={Boolean(inspectedCampaign)}
        onClose={() => setInspectedCampaign(null)}
        onUpdateBudget={handleUpdateBudget}
        onToggleStatus={handleToggleStatus}
        onDeleteCampaign={handleDeleteCampaign}
      />

      {/* Create New Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  );
}

export default AdsPerformancePage;
