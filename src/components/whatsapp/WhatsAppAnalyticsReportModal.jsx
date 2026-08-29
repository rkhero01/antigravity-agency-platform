import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  Building,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function WhatsAppAnalyticsReportModal({
  isOpen,
  onClose,
  selectedClient = 'all',
  timeframe = '30d',
}) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReport();
    }
  }, [isOpen, selectedClient, timeframe]);

  const loadReport = async () => {
    setLoading(true);
    const data = await whatsappService.generateWhatsAppReport({
      clientId: selectedClient,
      timeframe,
    });
    setReportData(data);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-dialog-card wa-analytics-report-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-dialog-header">
          <div className="flex items-center gap-3">
            <div className="modal-icon-badge">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="modal-title">Executive WhatsApp Performance Report</h3>
              <p className="modal-subtitle">
                {reportData?.clientName} • Timeframe: {reportData?.timeframe} • Generated: {reportData?.generatedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-saas-secondary text-xs"
              onClick={handleShareLink}
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
            </button>

            <button
              type="button"
              className="btn-wa-primary text-xs"
              onClick={handlePrint}
            >
              <Printer size={13} />
              <span>Print / Export PDF</span>
            </button>

            <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Report Document Body */}
        <div className="wa-report-document-body">
          {loading ? (
            <div className="p-8 text-center text-muted">Generating executive report document...</div>
          ) : (
            <div className="printable-report-paper">
              {/* Report Header */}
              <div className="report-paper-header">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    WhatsApp Marketing &amp; Automation Intelligence
                  </h2>
                  <p className="text-xs text-dim">
                    Prepared for: <strong className="text-white">{reportData.clientName}</strong> | Reference: #{reportData.reportId}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-success font-bold bg-success/10 px-2.5 py-1 rounded">
                    Status: Verified Active
                  </span>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="report-section-block">
                <h4 className="report-sec-title">1. Executive Summary &amp; Key Highlights</h4>
                <div className="p-3.5 bg-slate-950/60 rounded-lg border border-white/5">
                  <p className="text-xs text-muted leading-relaxed">
                    During the evaluated period, WhatsApp marketing drove a total of{' '}
                    <strong className="text-white">{reportData.kpis?.messagesSent?.value} messages sent</strong> with an exceptional delivery rate of{' '}
                    <strong className="text-success">{reportData.kpis?.deliveryRate?.value}</strong> and read velocity of{' '}
                    <strong className="text-purple">{reportData.kpis?.readRate?.value}</strong>. Attributed sales revenue reached{' '}
                    <strong className="text-warning">{reportData.kpis?.revenue?.value}</strong> with a blended campaign ROAS of{' '}
                    <strong className="text-cyan">{reportData.kpis?.roas?.value}</strong>. First-response customer SLA averaged{' '}
                    <strong className="text-white">{reportData.kpis?.avgResponseTime?.value}</strong>.
                  </p>
                </div>
              </div>

              {/* 2. KPI Summary Grid */}
              <div className="report-section-block">
                <h4 className="report-sec-title">2. Core Operational &amp; Revenue KPIs</h4>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="report-kpi-box">
                    <span className="text-[10px] text-dim block uppercase font-bold">Total Sent</span>
                    <strong className="text-sm text-white">{reportData.kpis?.messagesSent?.value}</strong>
                    <span className="text-[10px] text-success block mt-0.5">{reportData.kpis?.messagesSent?.change}</span>
                  </div>

                  <div className="report-kpi-box">
                    <span className="text-[10px] text-dim block uppercase font-bold">Delivery Rate</span>
                    <strong className="text-sm text-success">{reportData.kpis?.deliveryRate?.value}</strong>
                    <span className="text-[10px] text-success block mt-0.5">{reportData.kpis?.deliveryRate?.change}</span>
                  </div>

                  <div className="report-kpi-box">
                    <span className="text-[10px] text-dim block uppercase font-bold">Read Velocity</span>
                    <strong className="text-sm text-purple">{reportData.kpis?.readRate?.value}</strong>
                    <span className="text-[10px] text-success block mt-0.5">{reportData.kpis?.readRate?.change}</span>
                  </div>

                  <div className="report-kpi-box">
                    <span className="text-[10px] text-dim block uppercase font-bold">Total Revenue</span>
                    <strong className="text-sm text-warning">{reportData.kpis?.revenue?.value}</strong>
                    <span className="text-[10px] text-success block mt-0.5">{reportData.kpis?.revenue?.change}</span>
                  </div>
                </div>
              </div>

              {/* 3. Top Campaigns Table */}
              <div className="report-section-block">
                <h4 className="report-sec-title">3. Top Performing Broadcast Campaigns</h4>
                <table className="wa-followup-table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Recipients</th>
                      <th>Delivery %</th>
                      <th>Read %</th>
                      <th>Conversions</th>
                      <th>Revenue</th>
                      <th>ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topCampaigns?.map((c) => (
                      <tr key={c.id}>
                        <td><strong className="text-white text-xs">{c.name}</strong></td>
                        <td><span className="text-xs text-white">{(c.recipients || 0).toLocaleString()}</span></td>
                        <td><span className="text-xs text-success">{c.deliveryRate}</span></td>
                        <td><span className="text-xs text-purple">{c.readRate}</span></td>
                        <td><span className="text-xs text-white font-bold">{c.conversions || 0}</span></td>
                        <td><strong className="text-xs text-success">₹{(c.revenue || 0).toLocaleString()}</strong></td>
                        <td><span className="text-xs text-cyan font-bold">{c.roas}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. AI Strategic Recommendations */}
              <div className="report-section-block">
                <h4 className="report-sec-title">4. Strategic Recommendations &amp; Next Steps</h4>
                <div className="space-y-2">
                  {reportData.insights?.recommendedActions?.map((act, i) => (
                    <div key={i} className="p-2.5 bg-slate-950/60 rounded border border-white/5">
                      <strong className="text-xs text-white block mb-0.5">{act.priority}: {act.title}</strong>
                      <p className="text-[11px] text-muted">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhatsAppAnalyticsReportModal;
