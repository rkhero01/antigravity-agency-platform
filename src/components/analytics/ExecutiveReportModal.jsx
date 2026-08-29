import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Mail,
  CheckCircle2,
  Sparkles,
  Building,
  Calendar,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { formatCurrency } from '../../utils/formatters.js';

export function ExecutiveReportModal({
  isOpen,
  onClose,
  activeClient = 'all',
  analyticsData,
  onSendEmailReport,
}) {
  const [reportTitle, setReportTitle] = useState('Executive Cross-Channel Performance Summary');
  const [selectedClientId, setSelectedClientId] = useState(
    activeClient && activeClient !== 'all' ? activeClient : 'c1'
  );
  const [reportPeriod, setReportPeriod] = useState('August 2026 (Monthly Review)');
  const [clientEmail, setClientEmail] = useState('');
  const [includeSections, setIncludeSections] = useState({
    summaryKpi: true,
    channelBreakdown: true,
    topContent: true,
    aiTakeaways: true,
  });

  if (!isOpen) return null;

  const currentClient = mockClients.find((c) => c.id === selectedClientId) || mockClients[0];
  const summary = analyticsData?.summary || {};
  const channels = analyticsData?.channelBreakdown || [];
  const topContent = analyticsData?.topContentLeaderboard || [];

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    onSendEmailReport?.(currentClient.name, clientEmail || currentClient.email);
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card executive-report-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="modal-title">Executive PDF & Client Report Builder</h3>
              <p className="modal-subtitle">Generate presentation-ready performance summaries and audits</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="report-modal-body">
          <div className="report-two-columns">
            {/* Left Column: Report Controls */}
            <div className="report-controls-left">
              <h4 className="config-heading">Report Configuration</h4>

              <div className="form-field-group">
                <label className="form-label">Client Workspace</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="form-select-input"
                >
                  {mockClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-label">Report Document Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="form-text-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Reporting Period</label>
                <input
                  type="text"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="form-text-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Include Sections in PDF</label>
                <div className="section-checkboxes-list">
                  <label className="checkbox-row-label">
                    <input
                      type="checkbox"
                      checked={includeSections.summaryKpi}
                      onChange={() =>
                        setIncludeSections({ ...includeSections, summaryKpi: !includeSections.summaryKpi })
                      }
                    />
                    <span>Executive KPI Summary Matrix</span>
                  </label>
                  <label className="checkbox-row-label">
                    <input
                      type="checkbox"
                      checked={includeSections.channelBreakdown}
                      onChange={() =>
                        setIncludeSections({
                          ...includeSections,
                          channelBreakdown: !includeSections.channelBreakdown,
                        })
                      }
                    />
                    <span>Cross-Network Channel Breakdown</span>
                  </label>
                  <label className="checkbox-row-label">
                    <input
                      type="checkbox"
                      checked={includeSections.topContent}
                      onChange={() =>
                        setIncludeSections({ ...includeSections, topContent: !includeSections.topContent })
                      }
                    />
                    <span>Top Performing Creative Showcase</span>
                  </label>
                  <label className="checkbox-row-label">
                    <input
                      type="checkbox"
                      checked={includeSections.aiTakeaways}
                      onChange={() =>
                        setIncludeSections({
                          ...includeSections,
                          aiTakeaways: !includeSections.aiTakeaways,
                        })
                      }
                    />
                    <span>Strategic Recommendations & Next Steps</span>
                  </label>
                </div>
              </div>

              {/* Email Send Box */}
              <div className="report-email-box">
                <label className="form-label">Send Directly to Client Stakeholder</label>
                <div className="email-input-btn-row">
                  <input
                    type="email"
                    placeholder={currentClient.email || 'client@brand.com'}
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="form-text-input"
                  />
                  <button type="button" className="btn-send-email-report" onClick={handleSendEmail}>
                    <Mail size={14} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Printable PDF Document Preview */}
            <div className="report-preview-right">
              <div className="preview-label-bar">
                <span>📄 Live Document Preview (Page 1 of 1)</span>
                <button type="button" className="btn-print-action" onClick={handlePrint}>
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              <div className="printable-document-sheet" id="printable-report-area">
                {/* Agency Brand Document Header */}
                <div className="doc-header-strip">
                  <div className="doc-brand-left">
                    <div className="doc-logo-pill">PulseAI</div>
                    <span className="doc-org-name">PulseAI Marketing Operating System</span>
                  </div>
                  <div className="doc-date-right">
                    <span>Generated: <strong>August 28, 2026</strong></span>
                  </div>
                </div>

                {/* Report Title & Client Bar */}
                <div className="doc-title-block">
                  <h2 className="doc-main-title">{reportTitle}</h2>
                  <div className="doc-meta-info-row">
                    <span>Client: <strong>{currentClient.name}</strong></span>
                    <span>•</span>
                    <span>Industry: <strong>{currentClient.industry}</strong></span>
                    <span>•</span>
                    <span>Period: <strong>{reportPeriod}</strong></span>
                  </div>
                </div>

                {/* Section 1: Executive KPI Matrix */}
                {includeSections.summaryKpi && (
                  <div className="doc-section-block">
                    <h3 className="doc-section-title">1. Executive Overview & Key Benchmarks</h3>
                    <div className="doc-kpi-grid-four">
                      <div className="doc-kpi-cell">
                        <span className="doc-label">Total Reach</span>
                        <strong className="doc-value">
                          {summary.totalReach ? summary.totalReach.toLocaleString() : '318,500'}
                        </strong>
                        <span className="doc-delta text-success">+18.4% YoY</span>
                      </div>
                      <div className="doc-kpi-cell">
                        <span className="doc-label">Engagements</span>
                        <strong className="doc-value">
                          {summary.totalEngagement ? summary.totalEngagement.toLocaleString() : '64,800'}
                        </strong>
                        <span className="doc-delta text-success">+19.2% Growth</span>
                      </div>
                      <div className="doc-kpi-cell">
                        <span className="doc-label">Engagement Rate</span>
                        <strong className="doc-value">{summary.engagementRate || '5.42%'}</strong>
                        <span className="doc-delta text-cyan">+2.1% vs Benchmark</span>
                      </div>
                      <div className="doc-kpi-cell">
                        <span className="doc-label">Pipeline Value</span>
                        <strong className="doc-value">
                          {formatCurrency(summary.attributedRevenue || 94200)}
                        </strong>
                        <span className="doc-delta text-success">+26.8% Revenue</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Channel Breakdown */}
                {includeSections.channelBreakdown && (
                  <div className="doc-section-block">
                    <h3 className="doc-section-title">2. Omnichannel Network Yield Breakdown</h3>
                    <table className="doc-summary-table">
                      <thead>
                        <tr>
                          <th>Network</th>
                          <th>Followers</th>
                          <th>Reach</th>
                          <th>Engagement Rate</th>
                          <th>Conversion %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {channels.slice(0, 4).map((ch, idx) => (
                          <tr key={idx}>
                            <td><strong>{ch.channel}</strong></td>
                            <td>{ch.followers}</td>
                            <td>{ch.reach}</td>
                            <td><span className="doc-badge-green">{ch.engagement}</span></td>
                            <td>{ch.conversion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Section 3: Strategic Recommendations */}
                {includeSections.aiTakeaways && (
                  <div className="doc-section-block">
                    <h3 className="doc-section-title">3. Strategic Takeaways & Q4 Action Plan</h3>
                    <div className="doc-takeaway-box">
                      <p>
                        ✓ <strong>Short-form video momentum:</strong> Instagram Reels and LinkedIn native video yielded 4.2X higher comment conversion than static graphics.
                      </p>
                      <p>
                        ✓ <strong>Conversion funnel optimization:</strong> Recommended scaling high-performing lead generation campaigns on Meta and Google Ads by 20% to capture upcoming seasonal demand.
                      </p>
                    </div>
                  </div>
                )}

                {/* Document Footer Signoff */}
                <div className="doc-signoff-strip">
                  <div className="doc-account-lead">
                    <span>Account Lead: <strong>Alex Morgan (Senior Director)</strong></span>
                  </div>
                  <div className="doc-confidential-tag">
                    <span>CONFIDENTIAL • PREPARED EXCLUSIVELY FOR {currentClient.name.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-saas-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveReportModal;
