import React from 'react';
import {
  BarChart3,
  Calendar,
  Building,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Filter,
} from 'lucide-react';
import { whatsappClients } from '../../data/mockWhatsApp.js';

export function WhatsAppAnalyticsHeader({
  selectedClient = 'all',
  onClientChange,
  timeframe = '30d',
  onTimeframeChange,
  comparePeriod = true,
  onToggleCompare,
  onExportCSV,
  onOpenReportModal,
  clients = whatsappClients,
}) {
  const datePresets = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'month', label: 'This Month' },
  ];

  return (
    <div className="wa-analytics-header-card">
      <div className="flex justify-between items-center gap-4 flex-wrap w-full">
        <div>
          <div className="flex items-center gap-2">
            <div className="analytics-header-icon-badge">
              <BarChart3 size={18} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">WhatsApp Analytics &amp; Intelligence</h2>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Cross-client messaging volume, SLA velocity, conversion funnels, and revenue attribution
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn-saas-secondary text-xs"
            onClick={onExportCSV}
            title="Download CSV performance export"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn-wa-primary"
            onClick={onOpenReportModal}
          >
            <FileText size={14} />
            <span>Executive Report</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Client & Date Presets */}
      <div className="analytics-controls-bar mt-3 pt-3 border-t border-white/8 flex justify-between items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Client Selector */}
          <div className="followup-mini-select-wrap">
            <Building size={13} className="text-dim" />
            <select
              value={selectedClient}
              onChange={(e) => onClientChange(e.target.value)}
              className="followup-mini-select"
            >
              <option value="all">All Client Workspaces</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Presets */}
          <div className="timeframe-switch" role="group" aria-label="Date Range Presets">
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`timeframe-btn ${timeframe === preset.id ? 'active' : ''}`}
                onClick={() => onTimeframeChange(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Period Toggle */}
        <div className="flex items-center gap-2">
          <label className="checkbox-setting-row text-xs text-dim">
            <input
              type="checkbox"
              checked={comparePeriod}
              onChange={(e) => onToggleCompare && onToggleCompare(e.target.checked)}
            />
            <span>Compare vs Previous Period</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppAnalyticsHeader;
