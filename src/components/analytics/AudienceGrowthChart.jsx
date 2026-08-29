import React, { useState } from 'react';
import { LineChart, Users, Eye, UserPlus, Zap } from 'lucide-react';

export function AudienceGrowthChart({ timeseries = [], dateRange = '30d' }) {
  const [activeMetric, setActiveMetric] = useState('reach'); // 'reach' | 'engagement' | 'growth' | 'conversion'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!timeseries || timeseries.length === 0) return null;

  const maxReach = Math.max(...timeseries.map((d) => d.reach), 10000);
  const maxEngagement = Math.max(...timeseries.map((d) => d.engagement), 2000);
  const maxGrowth = Math.max(...timeseries.map((d) => d.growth), 100);
  const maxConversion = Math.max(...timeseries.map((d) => d.conversion), 8);

  const getMetricMax = () => {
    switch (activeMetric) {
      case 'reach':
        return maxReach;
      case 'engagement':
        return maxEngagement;
      case 'growth':
        return maxGrowth;
      case 'conversion':
        return maxConversion;
      default:
        return maxReach;
    }
  };

  const getFormattedValue = (item) => {
    switch (activeMetric) {
      case 'reach':
        return `${item.reach.toLocaleString()} Reach`;
      case 'engagement':
        return `${item.engagement.toLocaleString()} Engagements`;
      case 'growth':
        return `+${item.growth} New Followers`;
      case 'conversion':
        return `${item.conversion}% Conversion Rate`;
      default:
        return item[activeMetric];
    }
  };

  const metricColors = {
    reach: { primary: '#6366f1', gradient: 'rgba(99, 102, 241, 0.4)' },
    engagement: { primary: '#ec4899', gradient: 'rgba(236, 72, 153, 0.4)' },
    growth: { primary: '#10b981', gradient: 'rgba(16, 185, 129, 0.4)' },
    conversion: { primary: '#06b6d4', gradient: 'rgba(6, 182, 212, 0.4)' },
  };

  const activeColor = metricColors[activeMetric];

  return (
    <div className="analytics-chart-card">
      {/* Header */}
      <div className="analytics-chart-top-bar">
        <div className="chart-heading-group">
          <div className="chart-icon-box">
            <LineChart size={16} />
          </div>
          <div>
            <h3 className="chart-main-title">Audience Reach & Velocity Trends</h3>
            <p className="chart-subtitle">Cross-platform growth trajectory for {dateRange.toUpperCase()}</p>
          </div>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="chart-metric-selector" role="tablist">
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'reach' ? 'active spend' : ''}`}
            onClick={() => setActiveMetric('reach')}
          >
            <Users size={13} />
            <span>Reach</span>
          </button>
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'engagement' ? 'active revenue' : ''}`}
            onClick={() => setActiveMetric('engagement')}
          >
            <Eye size={13} />
            <span>Engagement</span>
          </button>
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'growth' ? 'active leads' : ''}`}
            onClick={() => setActiveMetric('growth')}
          >
            <UserPlus size={13} />
            <span>Followers</span>
          </button>
          <button
            type="button"
            className={`metric-tab-pill ${activeMetric === 'conversion' ? 'active roas' : ''}`}
            onClick={() => setActiveMetric('conversion')}
          >
            <Zap size={13} />
            <span>Conversion %</span>
          </button>
        </div>
      </div>

      {/* Rendered Bar & Area Chart */}
      <div className="chart-render-wrapper">
        <div className="chart-bars-container">
          {timeseries.map((item, idx) => {
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
                {/* Tooltip */}
                {isHovered && (
                  <div className="bar-hover-tooltip">
                    <span className="tooltip-date">{item.date}</span>
                    <strong className="tooltip-value">{getFormattedValue(item)}</strong>
                    <div className="tooltip-subline">
                      <span>Reach: {item.reach.toLocaleString()}</span>
                      <span>CVR: {item.conversion}%</span>
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

      {/* Footer Metrics */}
      <div className="chart-footer-metrics-strip">
        <div className="footer-metric-item">
          <span className="footer-metric-label">Total Period Reach</span>
          <strong>{timeseries.reduce((acc, d) => acc + d.reach, 0).toLocaleString()}</strong>
        </div>
        <div className="footer-metric-item">
          <span className="footer-metric-label">Total Period Interactions</span>
          <strong className="text-success">{timeseries.reduce((acc, d) => acc + d.engagement, 0).toLocaleString()}</strong>
        </div>
        <div className="footer-metric-item">
          <span className="footer-metric-label">Net Audience Growth</span>
          <strong className="text-primary">+{timeseries.reduce((acc, d) => acc + d.growth, 0).toLocaleString()}</strong>
        </div>
        <div className="footer-metric-item">
          <span className="footer-metric-label">Avg Conversion Velocity</span>
          <strong className="text-cyan">
            {(timeseries.reduce((acc, d) => acc + d.conversion, 0) / Math.max(timeseries.length, 1)).toFixed(2)}%
          </strong>
        </div>
      </div>
    </div>
  );
}

export default AudienceGrowthChart;
