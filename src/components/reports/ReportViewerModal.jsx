import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';

export function ReportViewerModal({
  report,
  isOpen,
  onClose,
  onDownloadReport,
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
    }, 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card report-viewer-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="report-viewer-control-bar">
          <div className="doc-type-badge">
            <FileText size={14} />
            <span>Executive Client Deliverable</span>
          </div>

          <div className="viewer-actions-group">
            <button
              type="button"
              className="btn-saas-secondary btn-sm"
              onClick={handleCopyLink}
              title="Copy shareable link for client review"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 size={14} className="text-success" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share Client Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-saas-secondary btn-sm"
              onClick={handlePrint}
              title="Print document"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              className="btn-saas-primary btn-sm"
              onClick={() => onDownloadReport(report)}
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>

            <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="printable-report-sheet">
          {/* Header Banner */}
          <div className="sheet-header-banner">
            <div className="sheet-logo-group">
              <div className="agency-brand-badge">
                <Sparkles size={16} />
                <span>PulseAI Marketing OS</span>
              </div>
              <span className="watermark-tag">Confidential Agency Audit</span>
            </div>

            <div className="sheet-title-group">
              <h2 className="sheet-main-title">{report.title}</h2>
              <div className="sheet-meta-pills">
                <span className="sheet-meta-pill">🏢 {report.clientName}</span>
                <span className="sheet-meta-pill">
                  <Calendar size={12} className="inline-icon" /> {report.period}
                </span>
                <span className="sheet-meta-pill">Category: {report.category}</span>
              </div>
            </div>
          </div>

          {/* AI Executive Summary Box */}
          <div className="sheet-summary-box">
            <div className="summary-box-header">
              <Sparkles size={16} className="text-primary" />
              <strong>Executive Summary & Strategic Takeaways</strong>
            </div>
            <p className="summary-box-text">{report.summaryText}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="sheet-kpis-grid">
            <div className="sheet-kpi-item">
              <span className="sheet-kpi-lbl">Total Cross-Channel Reach</span>
              <strong className="sheet-kpi-val text-primary">{report.highlights?.reach || '112.5K'}</strong>
              <span className="sheet-kpi-sub">Organic & Paid impressions</span>
            </div>

            <div className="sheet-kpi-item">
              <span className="sheet-kpi-lbl">Audience Engagement</span>
              <strong className="sheet-kpi-val text-cyan">{report.highlights?.engagement || '24.2K'}</strong>
              <span className="sheet-kpi-sub">Reactions, shares & comments</span>
            </div>

            <div className="sheet-kpi-item">
              <span className="sheet-kpi-lbl">Total Paid Ad Spend</span>
              <strong className="sheet-kpi-val text-muted">{report.highlights?.spend || '$3,850'}</strong>
              <span className="sheet-kpi-sub">Meta & Google Ads spend</span>
            </div>

            <div className="sheet-kpi-item">
              <span className="sheet-kpi-lbl">Attributed Revenue</span>
              <strong className="sheet-kpi-val text-success">{report.highlights?.revenue || '$21,400'}</strong>
              <span className="sheet-kpi-sub">Direct ecommerce & bookings</span>
            </div>

            <div className="sheet-kpi-item">
              <span className="sheet-kpi-lbl">Portfolio ROAS</span>
              <strong className="sheet-kpi-val text-warning">{report.highlights?.roas || '5.56x'}</strong>
              <span className="sheet-kpi-sub">556% Return on Ad Spend</span>
            </div>
          </div>

          {/* Channel Attribution Breakdown */}
          <div className="sheet-channel-breakdown">
            <h4 className="sheet-section-heading">Cross-Platform Distribution & Attribution</h4>
            <table className="sheet-data-table">
              <thead>
                <tr>
                  <th>Channel Platform</th>
                  <th>Published Posts</th>
                  <th>Engaged Reach</th>
                  <th>Attributed Conversions</th>
                  <th>Yield ROAS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Instagram Business</strong></td>
                  <td>18 Reels & Carousels</td>
                  <td>64,200</td>
                  <td>284 Leads</td>
                  <td><strong className="text-success">5.82x</strong></td>
                </tr>
                <tr>
                  <td><strong>Facebook Pages & Ads</strong></td>
                  <td>12 Posts & Link Ads</td>
                  <td>42,100</td>
                  <td>192 Leads</td>
                  <td><strong className="text-success">5.20x</strong></td>
                </tr>
                <tr>
                  <td><strong>LinkedIn Company Page</strong></td>
                  <td>8 Thought Leadership Posts</td>
                  <td>18,400</td>
                  <td>86 B2B Inquiries</td>
                  <td><strong className="text-success">6.10x</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Document Footer */}
          <div className="sheet-footer">
            <span>Prepared by <strong>{report.author}</strong> via PulseAI Operating System</span>
            <span>Generated: {report.generatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportViewerModal;
