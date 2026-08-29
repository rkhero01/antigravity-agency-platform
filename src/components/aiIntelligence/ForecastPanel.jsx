import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  UserCheck,
  Award,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { aiIntelligenceService } from '../../services/aiIntelligenceService.js';

export function ForecastPanel({
  initialTimeframe = '30d',
  loading = false,
}) {
  const [activeHorizon, setActiveHorizon] = useState(initialTimeframe || '30d');
  const [forecast, setForecast] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    loadForecast(activeHorizon);
  }, [activeHorizon]);

  const loadForecast = async (horizon) => {
    setLocalLoading(true);
    const data = await aiIntelligenceService.getForecast({ timeframe: horizon });
    setForecast(data);
    setLocalLoading(false);
  };

  const horizons = [
    { id: '7d', label: '7-Day Run-Rate' },
    { id: '30d', label: '30-Day Outlook' },
    { id: '90d', label: '90-Day Quarterly' },
  ];

  if (!forecast && (loading || localLoading)) {
    return <div className="forecast-panel-card skeleton-card h-80" />;
  }

  const {
    horizon = '30 Days',
    projectedRevenue = 14200000,
    projectedLeads = 5400,
    projectedConversions = 560,
    projectedSpend = 1150000,
    projectedROAS = '12.3x',
    confidence = '89.5%',
    trendPoints = [],
  } = forecast || {};

  // Find max revenue for SVG bar scaling
  const maxRev = Math.max(...trendPoints.map((p) => p.revenue || 1), 1);

  return (
    <div className="forecast-panel-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="forecast-icon-badge">
            <TrendingUp size={17} className="text-success" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multi-Horizon Predictive Revenue &amp; Lead Forecast
            </h3>
            <p className="text-xs text-muted">
              Predictive growth trajectory synthesizing seasonal patterns, lead velocity, and channel media budgets
            </p>
          </div>
        </div>

        {/* Horizon Switcher */}
        <div className="timeframe-switch" role="group" aria-label="Forecast Horizon">
          {horizons.map((h) => (
            <button
              key={h.id}
              type="button"
              className={`timeframe-btn ${activeHorizon === h.id ? 'active' : ''}`}
              onClick={() => setActiveHorizon(h.id)}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Forecast Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <div className="forecast-kpi-box">
          <span className="forecast-kpi-lbl">Projected Revenue</span>
          <strong className="forecast-kpi-val text-warning">
            ₹{(projectedRevenue || 0).toLocaleString()}
          </strong>
          <span className="forecast-kpi-sub">Expected gross GMV</span>
        </div>

        <div className="forecast-kpi-box">
          <span className="forecast-kpi-lbl">Projected Leads</span>
          <strong className="forecast-kpi-val text-cyan">
            {(projectedLeads || 0).toLocaleString()}
          </strong>
          <span className="forecast-kpi-sub">Total inbound capture</span>
        </div>

        <div className="forecast-kpi-box">
          <span className="forecast-kpi-lbl">Projected Wins</span>
          <strong className="forecast-kpi-val text-purple">
            {(projectedConversions || 0).toLocaleString()} Deals
          </strong>
          <span className="forecast-kpi-sub">Closed transactions</span>
        </div>

        <div className="forecast-kpi-box">
          <span className="forecast-kpi-lbl">Projected Ad Spend</span>
          <strong className="forecast-kpi-val text-slate-300">
            ₹{(projectedSpend || 0).toLocaleString()}
          </strong>
          <span className="forecast-kpi-sub">Planned media budget</span>
        </div>

        <div className="forecast-kpi-box">
          <span className="forecast-kpi-lbl">Forecast Confidence</span>
          <strong className="forecast-kpi-val text-success">
            {confidence}
          </strong>
          <span className="forecast-kpi-sub">Statistical reliability</span>
        </div>
      </div>

      {/* SVG Trend Points Visual */}
      <div className="forecast-chart-container">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="text-dim font-semibold uppercase">Pacing Trajectory ({horizon}):</span>
          <span className="text-success font-bold flex items-center gap-1">
            <Sparkles size={12} /> Projected Target ROAS: {projectedROAS}
          </span>
        </div>

        <div className="forecast-bars-row">
          {trendPoints.map((pt, idx) => {
            const heightPct = Math.max(Math.round((pt.revenue / maxRev) * 100), 12);
            return (
              <div key={idx} className="forecast-bar-col">
                <div className="forecast-bar-track">
                  <div
                    className="forecast-bar-fill"
                    style={{ height: `${heightPct}%` }}
                    title={`${pt.label || pt.day || pt.week || pt.month}: ₹${pt.revenue.toLocaleString()} (${pt.leads} Leads)`}
                  />
                </div>
                <span className="forecast-bar-label">{pt.label || pt.day || pt.week || pt.month}</span>
                <span className="forecast-bar-subval">₹{Math.round(pt.revenue / 1000)}k</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Demo Disclaimer */}
      <div className="forecast-disclaimer-box mt-4 flex items-center gap-2">
        <Info size={13} className="text-dim flex-shrink-0" />
        <span className="text-[11px] text-dim">
          Forecast is based on demo intelligence data and is not a live financial prediction.
        </span>
      </div>
    </div>
  );
}

export default ForecastPanel;
