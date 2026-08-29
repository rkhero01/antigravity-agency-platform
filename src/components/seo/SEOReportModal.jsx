import React, { useState, useEffect } from 'react';
import { X, FileText, Printer, Share2, CheckCircle2, Globe, TrendingUp, ShieldCheck } from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';
import { seoService } from '../../services/seoService.js';

export function SEOReportModal({
  isOpen,
  onClose,
  selectedClient = 'all',
}) {
  const [clientId, setClientId] = useState(selectedClient);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [report, setReport] = useState(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setClientId(selectedClient);
    if (isOpen) {
      loadReport(selectedClient, dateRange);
    }
  }, [selectedClient, dateRange, isOpen]);

  if (!isOpen) return null;

  const loadReport = async (targetClient, range) => {
    const rep = await seoService.generateSEOReport(targetClient, range);
    setReport(rep);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setShared(true);
    setTimeout(() => {
      setShared(false);
    }, 2500);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card seo-report-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="modal-title">Executive SEO & Organic Growth Report</h3>
              <p className="modal-subtitle">Comprehensive search visibility, technical health, and revenue attribution summary</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="seo-report-body">
          {/* Controls Bar */}
          <div className="report-controls-bar">
            <div className="flex items-center gap-2 flex-1">
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  loadReport(e.target.value, dateRange);
                }}
                className="form-select-input flex-1"
              >
                <option value="all">🏢 All Client Portfolios</option>
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  loadReport(clientId, e.target.value);
                }}
                className="form-select-input w-44"
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Year-to-Date">Year-to-Date (2026)</option>
              </select>
            </div>
          </div>

          {/* Printable Report Canvas */}
          {report && (
            <div className="printable-report-canvas">
              <div className="report-canvas-header">
                <div>
                  <h2 className="report-title-main">{report.title}</h2>
                  <span className="text-xs text-muted">Reporting Period: {report.dateRange}</span>
                </div>
                <div className="report-agency-badge">
                  <span>PulseAI Marketing OS</span>
                </div>
              </div>

              {/* 4 Mini Metrics */}
              <div className="report-metrics-grid">
                <div className="rm-box">
                  <span className="rm-lbl">Organic Traffic</span>
                  <strong className="rm-val text-primary">{report.overview.organicTraffic}</strong>
                  <span className="text-xs text-success">{report.overview.trafficMoM}</span>
                </div>

                <div className="rm-box">
                  <span className="rm-lbl">Keywords in Top 3</span>
                  <strong className="rm-val text-success">{report.overview.top3Keywords}</strong>
                  <span className="text-xs text-success">{report.overview.top3MoM}</span>
                </div>

                <div className="rm-box">
                  <span className="rm-lbl">Technical SEO Health</span>
                  <strong className="rm-val text-cyan">{report.overview.healthScore}</strong>
                  <span className="text-xs text-muted">148 Checks Passed</span>
                </div>

                <div className="rm-box">
                  <span className="rm-lbl">Organic Revenue</span>
                  <strong className="rm-val text-white">{report.overview.organicRevenue}</strong>
                  <span className="text-xs text-success">{report.overview.revenueMoM}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="report-highlights-section">
                <strong className="text-xs text-white uppercase block mb-1">Executive Performance Highlights:</strong>
                <ul className="report-bullets-list">
                  {report.highlights.map((item, i) => (
                    <li key={i} className="text-xs text-muted leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-dialog-footer">
          <button type="button" className="btn-saas-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-saas-secondary" onClick={handleShare}>
            {shared ? <CheckCircle2 size={14} className="text-success" /> : <Share2 size={14} />}
            <span>{shared ? 'Link Copied!' : 'Share Public Link'}</span>
          </button>
          <button type="button" className="btn-saas-primary" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SEOReportModal;
