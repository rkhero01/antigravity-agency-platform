import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  Clock,
  Download,
  Building,
  Share2,
} from 'lucide-react';
import { clientsService } from '../../services/clientsService.js';

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
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const list = await clientsService.getClients();
      setClients(list);
    } catch (e) {
      console.error('Failed to load clients in analytics header:', e);
    }
  };

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
            className="btn-saas-primary"
            onClick={onOpenReportModal}
          >
            <FileText size={15} />
            <span>Generate Client Report</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Date Range, Client Filter, Social Platform */}
      <div className="analytics-filter-bar">
        {/* Date Range Selector */}
        <div className="analytics-date-range-pills" role="group" aria-label="Date Range">
          <button
            type="button"
            className={`date-pill ${dateRange === '7d' || dateRange === 'last_7_days' ? 'active' : ''}`}
            onClick={() => onDateRangeChange('last_7_days')}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            className={`date-pill ${dateRange === '30d' || dateRange === 'last_30_days' ? 'active' : ''}`}
            onClick={() => onDateRangeChange('last_30_days')}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className={`date-pill ${dateRange === '90d' || dateRange === 'this_month' ? 'active' : ''}`}
            onClick={() => onDateRangeChange('this_month')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`date-pill ${dateRange === 'previous_month' ? 'active' : ''}`}
            onClick={() => onDateRangeChange('previous_month')}
          >
            Previous Month
          </button>
        </div>

        <div className="analytics-dropdown-filters">
          {/* Client Filter */}
          <div className="filter-select-wrapper">
            <Building size={14} className="filter-icon" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="analytics-select"
              aria-label="Filter by Client Workspace"
            >
              <option value="all">All Client Workspaces</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.clientName}
                </option>
              ))}
            </select>
          </div>

          {/* Social Network Filter */}
          <div className="filter-select-wrapper">
            <Share2 size={14} className="filter-icon" />
            <select
              value={selectedNetwork}
              onChange={(e) => onNetworkChange(e.target.value)}
              className="analytics-select"
              aria-label="Filter by Network"
            >
              {networks.map((n) => (
                <option key={n} value={n}>
                  {n === 'all' ? 'All Networks' : n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsHeader;
