import React from 'react';
import {
  Brain,
  RotateCw,
  Sparkles,
  FileText,
  Settings,
  Calendar,
  Radio,
  Sliders,
} from 'lucide-react';
import { ClientIntelligenceSelector } from './ClientIntelligenceSelector.jsx';

export function AIIntelligenceHeader({
  selectedClient = 'all',
  onClientChange,
  timeframe = '30d',
  onTimeframeChange,
  onRefresh,
  onGenerateBriefing,
  clients = [],
  loading = false,
}) {
  const datePresets = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
  ];

  return (
    <div className="ai-intelligence-header-card">
      {/* Top Banner */}
      <div className="flex justify-between items-start gap-4 flex-wrap w-full">
        <div className="ai-intelligence-title-block">
          <div className="ai-engine-status-tag">
            <Radio size={12} className="text-cyan animate-pulse" />
            <span className="text-[11px] font-bold text-cyan">
              AI Intelligence Engine — Demo / API Ready
            </span>
          </div>

          <div className="flex items-center gap-2.5 mt-1.5">
            <div className="ai-header-icon-badge">
              <Brain size={22} className="text-purple" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                AI Intelligence Command Center
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Unified agency intelligence across marketing, sales, customer engagement, operations and revenue.
              </p>
            </div>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn-saas-secondary text-xs"
            onClick={onRefresh}
            disabled={loading}
            title="Re-synchronize all intelligence models"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Analyzing...' : 'Refresh Intelligence'}</span>
          </button>

          <button
            type="button"
            className="btn-ai-primary text-xs"
            onClick={onGenerateBriefing}
            title="Generate executive daily briefing"
          >
            <Sparkles size={13} className="text-warning" />
            <span>Generate Daily Briefing</span>
          </button>

          <button
            type="button"
            className="btn-saas-secondary text-xs opacity-60 cursor-not-allowed"
            disabled
            title="AI Config Settings (API Ready)"
          >
            <Settings size={13} />
            <span>AI Config (Sandbox)</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Client & Date Presets */}
      <div className="ai-intelligence-controls-bar mt-4 pt-3.5 border-t border-white/8 flex justify-between items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Client Workspace Selector */}
          <ClientIntelligenceSelector
            selectedClient={selectedClient}
            onClientChange={onClientChange}
            clients={clients}
          />

          {/* Timeframe Presets */}
          <div className="timeframe-switch" role="group" aria-label="Intelligence Timeframe">
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`timeframe-btn ${timeframe === preset.id ? 'active' : ''}`}
                onClick={() => onTimeframeChange && onTimeframeChange(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Analysis Context */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-dim font-medium">
            Active Scope:{' '}
            <strong className="text-white">
              {selectedClient === 'all'
                ? 'Agency-Wide (7 Clients)'
                : clients.find((c) => (c.clientId || c.id) === selectedClient)?.clientName ||
                  'Filtered Client Workspace'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default AIIntelligenceHeader;
