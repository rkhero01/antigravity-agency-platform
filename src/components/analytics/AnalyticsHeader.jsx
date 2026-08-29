import React from 'react';
import {
  BarChart3,
  FileText,
  Clock,
  Download,
  Building,
  Share2,
} from 'lucide-react';
import { mockClients } from '../../data/mockClients.js';

export function AnalyticsHeader({
  dateRange,
  onDateRangeChange,
  selectedClient,
  onClientChange,
  selectedNetwork,
  onNetworkChange,
  onOpenReportModal,
  onOpenScheduleModal,
  onExportCsv,
}) {
  const networks = ['all', 'Instagram', 'LinkedIn', 'Facebook', 'YouTube', 'Google Business'];

  return (
    <div className="analytics-header-container">
      {/* Top Banner */}
      <div className="analytics-top-banner">
        <div className="analytics-title-block">
          <div className="analytics-badge-tag">
            <BarChart3 size={14} />
            <span>Cross-Channel Intelligence</span>
          </div>
          <h1 className="analytics-main-title">Analytics & Executive Reports</h1>
          <p className="analytics-subtitle-text">
            Aggregate omnichannel audience reach, engagement velocity, conversion attribution, and one-click client PDF reports.
          </p>
        </div>

        <div className="analytics-banner-actions">
          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onOpenScheduleModal}
            title="Configure Automated Email Deliveries"
          >
            <Clock size={15} />
            <span>Report Schedules</span>
          </button>

          <button
            type="button"
            className="btn-saas-secondary"
            onClick={onExportCsv}
            title="Export Raw CSV Data"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn-generate-report-primary"
            onClick={onOpenReportModal}
          >
            <FileText size={16} />
            <span>Generate Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="analytics-toolbar-card">
        <div className="toolbar-controls-row">
          {/* Client Filter */}
          <div className="analytics-select-wrapper">
            <Building size={14} className="icon-muted" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="analytics-select-field"
              aria-label="Filter by Client Account"
            >
              <option value="all">🏢 All Client Accounts</option>
              {mockClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Network Filter */}
          <div className="analytics-select-wrapper">
            <Share2 size={14} className="icon-muted" />
            <select
              value={selectedNetwork}
              onChange={(e) => onNetworkChange(e.target.value)}
              className="analytics-select-field"
              aria-label="Filter by Channel"
            >
              <option value="all">🌐 All Channels</option>
              {networks.filter((n) => n !== 'all').map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="analytics-date-range-pills" role="group" aria-label="Date Range">
            <button
              type="button"
              className={`range-pill-btn ${dateRange === '7d' ? 'active' : ''}`}
              onClick={() => onDateRangeChange('7d')}
            >
              7D
            </button>
            <button
              type="button"
              className={`range-pill-btn ${dateRange === '30d' ? 'active' : ''}`}
              onClick={() => onDateRangeChange('30d')}
            >
              30D
            </button>
            <button
              type="button"
              className={`range-pill-btn ${dateRange === '90d' ? 'active' : ''}`}
              onClick={() => onDateRangeChange('90d')}
            >
              90D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsHeader;
