import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Target, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

export function AdsPerformanceChart({ timeSeriesData = [], dateRange = '30d' }) {
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'spend' | 'leads' | 'roas'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!timeSeriesData || timeSeriesData.length === 0) return null;

  // Compute maximum values for SVG scaling
  const maxRevenue = Math.max(...timeSeriesData.map((d) => d.revenue), 1000);
  const maxSpend = Math.max(...timeSeriesData.map((d) => d.spend), 500);
  const maxLeads = Math.max(...timeSeriesData.map((d) => d.leads), 50);
  const maxRoas = Math.max(...timeSeriesData.map((d) => d.roas), 6);

  const getMetricMax = () => {
    switch (activeMetric) {
      case 'revenue':
        return maxRevenue;
      case 'spend':
        return maxSpend;
      case 'leads':
        return maxLeads;
      case 'roas':
        return maxRoas;
      default:
        return maxRevenue;
    }
  };

  const getMetricValueFormatted = (item) => {
    switch (activeMetric) {
      case 'revenue':
        return formatCurrency(item.revenue);
      case 'spend':
        return formatCurrency(item.spend);
      case 'leads':
        return `${item.leads} Leads`;
      case 'roas':
        return `${item.roas.toFixed(2)}x ROAS`;
      default:
        return item[activeMetric];
    }
  };

  const metricColors = {
    revenue: { primary: '#10b981', gradient: 'rgba(16, 185, 129, 0.4)' },
    spend: { primary: '#6366f1', gradient: 'rgba(99, 102, 241, 0.4)' },
    leads: { primary: '#a855f7', gradient: 'rgba(168, 85, 247, 0.4)' },
    roas: { primary: '#06b6d4', gradient: 'rgba(6, 182, 212, 0.4)' },
  };

  const activeColor = metricColors[activeMetric];

  return (
    <div className="ads-chart-card">
      {/* Chart Header */}
      <div className="ads-chart-top-bar">
        <div className="chart-heading-group">
          <div className="chart-icon-box">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="chart-main-title">Pacing & Conversion Trajectory</h3>
            <p className="chart-subtitle">Cross-network yield performance across {dateRange.toUpperCase()}</p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="chart-metric-selector" role="tablist">
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'revenue' ? 'active revenue' : ''}`}
            onClick={() => setActiveMetric('revenue')}
          >
            <TrendingUp size={13} />
            <span>Revenue</span>
          </button>
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'spend' ? 'active spend' : ''}`}
            onClick={() => setActiveMetric('spend')}
          >
            <DollarSign size={13} />
            <span>Spend</span>
          </button>
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'leads' ? 'active leads' : ''}`}
            onClick={() => setActiveMetric('leads')}
          >
            <Target size={13} />
            <span>Leads</span>
          </button>
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'roas' ? 'active roas' : ''}`}
            onClick={() => setActiveMetric('roas')}
          >
            <Zap size={13} />
            <span>ROAS</span>
          </button>
        </div>
      </div>

      {/* SVG Multi-Bar & Line Chart */}
      <div className="chart-render-wrapper">
        <div className="chart-bars-container">
          {timeSeriesData.map((item, idx) => {
            const rawVal = item[activeMetric];
            const maxVal = getMetricMax();
            const barHeightPercent = Math.max(Math.round((rawVal / maxVal) * 100), 8);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.date || idx}
                className="chart-bar-column"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="bar-hover-tooltip">
                    <span className="tooltip-date">{item.date}</span>
                    <strong className="tooltip-value">{getMetricValueFormatted(item)}</strong>
                    <div className="tooltip-subline">
                      <span>Spend: {formatCurrency(item.spend)}</span>
                      <span>ROAS: {item.roas.toFixed(2)}x</span>
                    </div>
                  </div>
                )}

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${barHeightPercent}%`,
                      background: `linear-gradient(180deg, ${activeColor.primary} 0%, ${activeColor.gradient} 100%)`,
                      boxShadow: isHovered ? `0 0 15px ${activeColor.primary}` : 'none',
                    }}
                  />
                </div>

                <span className={`bar-date-label ${isHovered ? 'active' : ''}`}>{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Footer Summary */}
      <div className="chart-footer-metrics-strip">
        <div className="footer-metric-item">
          <span className="footer-metric-label">Period Total Spend</span>
          <strong>{formatCurrency(timeSeriesData.reduce((acc, d) => acc + d.spend, 0))}</strong>
        </div>
        <div className="footer-metric-item">
          <span className="footer-metric-label">Period Total Revenue</span>
          <strong className="text-success">{formatCurrency(timeSeriesData.reduce((acc, d) => acc + d.revenue, 0))}</strong>
        </div>
        <div className="footer-metric-item">
          <span className="footer-metric-label">Period Total Leads</span>
          <strong>{timeSeriesData.reduce((acc, d) => acc + d.leads, 0)} High-Intent Leads</strong>
        </div>
        <div className="footer-metric-item">
          <span className="footer-metric-label">Weighted Period ROAS</span>
          <strong className="text-cyan">
            {(
              timeSeriesData.reduce((acc, d) => acc + d.revenue, 0) /
              Math.max(timeSeriesData.reduce((acc, d) => acc + d.spend, 0), 1)
            ).toFixed(2)}x
          </strong>
        </div>
      </div>
    </div>
  );
}

export default AdsPerformanceChart;
