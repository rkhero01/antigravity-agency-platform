import React, { useState, useEffect } from 'react';
import {
  AnalyticsHeader,
  AnalyticsKpiCards,
  AudienceGrowthChart,
  ChannelBreakdownTable,
  DemographicsCard,
  TopContentLeaderboard,
  ExecutiveReportModal,
  ScheduleReportModal,
} from '../../components/analytics/index.js';
import { analyticsService } from '../../services/analyticsService.js';
import { CheckCircle2 } from 'lucide-react';

export function AnalyticsReportsPage({
  dateRange = '30d',
  onDateRangeChange,
  activeClient = 'all',
  onNavigate,
}) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClient, setSelectedClient] = useState(activeClient);
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  // Modals & Feedback
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadData();
    loadSchedules();
  }, [selectedClient, localDateRange]);

  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClient(activeClient);
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
    const data = await analyticsService.getAnalytics(selectedClient, localDateRange);
    setAnalyticsData(data);
    setLoading(false);
  };

  const loadSchedules = async () => {
    const list = await analyticsService.getScheduledReports();
    setSchedules(list);
  };

  const handleDateRangeSelect = (newRange) => {
    setLocalDateRange(newRange);
    onDateRangeChange?.(newRange);
  };

  const handleSendEmailReport = (clientName, email) => {
    showToast(`✉️ Executive PDF Report dispatched successfully to ${email}!`);
  };

  const handleAddSchedule = async (config) => {
    await analyticsService.scheduleAutomatedReport(config);
    loadSchedules();
    showToast('📅 Automated recurring report schedule created!');
  };

  const handleDeleteSchedule = async (id) => {
    await analyticsService.deleteScheduledReport(id);
    loadSchedules();
    showToast('Schedule removed successfully');
  };

  const handleExportCsv = () => {
    showToast('📊 Exported cross-channel analytics dataset (CSV downloaded)');
  };

  // Filter channel breakdown if network filter is applied
  const filteredChannels =
    analyticsData?.channelBreakdown?.filter((c) =>
      selectedNetwork === 'all'
        ? true
        : c.channel.toLowerCase().includes(selectedNetwork.toLowerCase())
    ) || [];

  return (
    <div className="analytics-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <AnalyticsHeader
        dateRange={localDateRange}
        onDateRangeChange={handleDateRangeSelect}
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
        selectedNetwork={selectedNetwork}
        onNetworkChange={setSelectedNetwork}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* 6 Executive KPI Stat Cards */}
      <AnalyticsKpiCards summary={analyticsData?.summary || {}} />

      {/* Audience Growth & Timeseries Trajectory */}
      <AudienceGrowthChart
        timeseries={analyticsData?.timeseries || []}
        dateRange={localDateRange}
      />

      {/* Channel Breakdown Comparison Table */}
      <ChannelBreakdownTable channels={filteredChannels} />

      {/* Demographics & Geography */}
      <DemographicsCard demographics={analyticsData?.demographics} />

      {/* Top Performing Content Leaderboard */}
      <TopContentLeaderboard
        posts={analyticsData?.topContentLeaderboard || []}
        onInspectPost={(post) => showToast(`Selected "${post.title}"`)}
      />

      {/* Executive PDF & Client Report Builder Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeClient={selectedClient}
        analyticsData={analyticsData}
        onSendEmailReport={handleSendEmailReport}
      />

      {/* Automated Report Scheduler Modal */}
      <ScheduleReportModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        schedules={schedules}
        onAddSchedule={handleAddSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />
    </div>
  );
}

export default AnalyticsReportsPage;
