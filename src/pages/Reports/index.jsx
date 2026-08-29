import React, { useState, useEffect, useMemo } from 'react';
import {
  ReportsHeader,
  ReportsKpiCards,
  ReportsGrid,
  ReportsTable,
  GenerateReportModal,
  ReportViewerModal,
} from '../../components/reports/index.js';
import { reportsService } from '../../services/reportsService.js';
import { CheckCircle2 } from 'lucide-react';

export function ReportsPage({
  activeClient = 'all',
  onNavigate,
}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode & Filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedClientFilter, setSelectedClientFilter] = useState(activeClient);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadReports();
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

  const loadReports = async () => {
    setLoading(true);
    const data = await reportsService.getReports();
    setReports(data);
    setLoading(false);
  };

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesClient =
        selectedClientFilter === 'all' ? true : r.clientId === selectedClientFilter;
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : r.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesClient && matchesCategory && matchesSearch;
    });
  }, [reports, selectedClientFilter, selectedCategory, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    return reportsService.calculateReportMetrics(filteredReports);
  }, [filteredReports]);

  // Handlers
  const handleGenerateReport = async (formData) => {
    const created = await reportsService.generateReport(formData);
    setReports((prev) => [created, ...prev]);
    showToast(`✨ Generated executive report for ${created.clientName}!`);
  };

  const handleDownloadReport = (report) => {
    showToast(`📥 Downloading "${report.title}" (PDF)...`);
  };

  const handleDeleteReport = async (id) => {
    await reportsService.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast('Report removed from agency library.');
  };

  const handleBulkDownload = () => {
    showToast('📦 Bundling and downloading all filtered client reports as ZIP archive...');
  };

  return (
    <div className="reports-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <ReportsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedClient={selectedClientFilter}
        onClientChange={setSelectedClientFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
        onBulkDownload={handleBulkDownload}
      />

      {/* 4 KPI Metrics */}
      <ReportsKpiCards metrics={metrics} />

      {/* Main Content Area: Grid vs Table */}
      {viewMode === 'grid' ? (
        <ReportsGrid
          reports={filteredReports}
          onViewReport={(rep) => setViewingReport(rep)}
          onDownloadReport={handleDownloadReport}
          onDeleteReport={handleDeleteReport}
          onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
        />
      ) : (
        <ReportsTable
          reports={filteredReports}
          onViewReport={(rep) => setViewingReport(rep)}
          onDownloadReport={handleDownloadReport}
          onDeleteReport={handleDeleteReport}
        />
      )}

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerateReport={handleGenerateReport}
      />

      {/* Live Presentation Sheet Modal */}
      <ReportViewerModal
        report={viewingReport}
        isOpen={Boolean(viewingReport)}
        onClose={() => setViewingReport(null)}
        onDownloadReport={handleDownloadReport}
      />
    </div>
  );
}

export default ReportsPage;
