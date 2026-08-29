import React from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Building,
  Sparkles,
  Trash2,
  Share2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function ReportCard({
  report,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
}) {
  const getCategoryVariant = (category) => {
    switch (category) {
      case 'Executive Summary':
        return 'primary';
      case 'Paid Media Audit':
        return 'success';
      case 'Strategic Forecast':
        return 'warning';
      case 'Organic Growth':
        return 'cyan';
      default:
        return 'default';
    }
  };

  return (
    <div className="report-card-item">
      {/* Thumbnail Banner */}
      <div className="report-thumb-box" onClick={() => onViewReport(report)}>
        <img
          src={report.thumbnail}
          alt={report.title}
          className="report-thumb-img"
        />
        <div className="report-thumb-overlay">
          <button type="button" className="btn-quick-preview">
            <Eye size={14} />
            <span>Open Presentation Sheet</span>
          </button>
        </div>
        <span className="report-category-ribbon">{report.category}</span>
      </div>

      {/* Body */}
      <div className="report-card-body">
        <div className="report-card-meta-top">
          <span className="report-client-tag">🏢 {report.clientName}</span>
          <span className="report-period-pill">
            <Calendar size={11} className="inline-icon" /> {report.period}
          </span>
        </div>

        <h4
          className="report-card-title clickable"
          onClick={() => onViewReport(report)}
        >
          {report.title}
        </h4>

        {/* Highlights Row */}
        {report.highlights && (
          <div className="report-highlights-strip">
            <div className="hl-item">
              <span className="hl-label">Reach</span>
              <strong className="hl-val">{report.highlights.reach}</strong>
            </div>
            <div className="hl-item">
              <span className="hl-label">Yield ROAS</span>
              <strong className="hl-val text-success">{report.highlights.roas}</strong>
            </div>
            <div className="hl-item">
              <span className="hl-label">Revenue</span>
              <strong className="hl-val text-cyan">{report.highlights.revenue}</strong>
            </div>
          </div>
        )}

        <p className="report-summary-text">{report.summaryText}</p>

        {/* Footer Meta & Actions */}
        <div className="report-card-footer">
          <div className="report-file-meta">
            <span className="file-size-text">📄 {report.fileSize} • {report.type}</span>
          </div>

          <div className="report-card-actions">
            <button
              type="button"
              className="btn-download-report"
              onClick={() => onDownloadReport(report)}
              title="Download PDF"
            >
              <Download size={13} />
              <span>PDF</span>
            </button>

            <button
              type="button"
              className="btn-view-report"
              onClick={() => onViewReport(report)}
              title="View & Present"
            >
              <Eye size={13} />
              <span>Present</span>
            </button>

            <button
              type="button"
              className="btn-delete-report"
              onClick={() => onDeleteReport(report.id)}
              title="Delete Report"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportCard;
