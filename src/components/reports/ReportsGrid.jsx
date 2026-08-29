import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { ReportCard } from './ReportCard.jsx';

export function ReportsGrid({
  reports = [],
  onViewReport,
  onDownloadReport,
  onDeleteReport,
  onOpenGenerateModal,
}) {
  if (reports.length === 0) {
    return (
      <div className="reports-empty-state-card">
        <FileText size={36} className="empty-icon-muted" />
        <h4 className="empty-state-title">No client reports found</h4>
        <p className="empty-state-subtitle">Adjust your search filter or generate a new AI executive report.</p>
        <button
          type="button"
          className="btn-saas-primary mt-2"
          onClick={onOpenGenerateModal}
        >
          <Sparkles size={15} />
          <span>Generate AI Report</span>
        </button>
      </div>
    );
  }

  return (
    <div className="reports-cards-grid">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onViewReport={onViewReport}
          onDownloadReport={onDownloadReport}
          onDeleteReport={onDeleteReport}
        />
      ))}
    </div>
  );
}

export default ReportsGrid;
