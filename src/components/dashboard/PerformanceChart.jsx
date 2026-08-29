import React, { useState } from 'react';
import { mockChartData } from '../../data/mockDashboard.js';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';

export function PerformanceChart() {
  const [timeframe, setTimeframe] = useState('7d');
  const [activeSeries, setActiveSeries] = useState({
    revenue: true,
    spend: true,
    leads: true,
  });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = mockChartData[timeframe] || mockChartData['7d'];

  // SVG Chart Dimensions
  const width = 760;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  // Maximum values for normalization
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const maxSpend = Math.max(...data.map((d) => d.spend), 1000);
  const maxLeads = Math.max(...data.map((d) => d.leads), 10);

  // Generate SVG path coordinate points
  const getPoints = (seriesKey, maxVal) => {
    return data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
      const val = d[seriesKey];
      const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
      return { x, y, val, label: d.label, item: d };
    });
  };

  const revenuePoints = getPoints('revenue', maxRevenue);
  const spendPoints = getPoints('spend', maxRevenue * 0.4); // scale spend relative
  const leadsPoints = getPoints('leads', maxLeads);

  const makePath = (points) => {
    if (!points.length) return '';
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      // Smooth cubic bezier spline
      const prev = points[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
    }, '');
  };

  const makeAreaPath = (points) => {
    if (!points.length) return '';
    const line = makePath(points);
    const last = points[points.length - 1];
    const first = points[0];
    const baselineY = height - paddingY;
    return `${line} L ${last.x},${baselineY} L ${first.x},${baselineY} Z`;
  };

  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];

  return (
    <div className="performance-chart-card">
      {/* Header */}
      <div className="chart-header-row">
        <div className="chart-title-block">
          <h3 className="chart-title">Marketing Performance</h3>
          <p className="chart-subtitle">
            Omnichannel revenue generation vs ad spend & lead velocity
          </p>
        </div>

        <div className="chart-controls-toolbar">
          {/* Series Toggles */}
          <div className="series-toggles-group">
            <button
              type="button"
              className={`series-pill rev ${activeSeries.revenue ? 'active' : ''}`}
              onClick={() => toggleSeries('revenue')}
            >
              <span className="series-color-dot dot-revenue" />
              <span>Revenue</span>
            </button>
            <button
              type="button"
              className={`series-pill spend ${activeSeries.spend ? 'active' : ''}`}
              onClick={() => toggleSeries('spend')}
            >
              <span className="series-color-dot dot-spend" />
              <span>Ad Spend</span>
            </button>
            <button
              type="button"
              className={`series-pill leads ${activeSeries.leads ? 'active' : ''}`}
              onClick={() => toggleSeries('leads')}
            >
              <span className="series-color-dot dot-leads" />
              <span>Leads</span>
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="timeframe-switch" role="group" aria-label="Chart Timeframe">
            <button
              type="button"
              className={`tf-btn ${timeframe === '7d' ? 'active' : ''}`}
              onClick={() => setTimeframe('7d')}
            >
              7 Days
            </button>
            <button
              type="button"
              className={`tf-btn ${timeframe === '30d' ? 'active' : ''}`}
              onClick={() => setTimeframe('30d')}
            >
              30 Days
            </button>
            <button
              type="button"
              className={`tf-btn ${timeframe === '90d' ? 'active' : ''}`}
              onClick={() => setTimeframe('90d')}
            >
              90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Value Summary Strip */}
      <div className="chart-metric-strip">
        <div className="chart-stat-item">
          <span className="chart-stat-label">Period Revenue</span>
          <span className="chart-stat-val text-violet">
            ₹{activePoint.revenue.toLocaleString()}
          </span>
        </div>
        <div className="chart-stat-item">
          <span className="chart-stat-label">Period Spend</span>
          <span className="chart-stat-val text-cyan">
            ₹{activePoint.spend.toLocaleString()}
          </span>
        </div>
        <div className="chart-stat-item">
          <span className="chart-stat-label">Qualified Leads</span>
          <span className="chart-stat-val text-emerald">
            {activePoint.leads.toLocaleString()}
          </span>
        </div>
        <div className="chart-stat-item">
          <span className="chart-stat-label">Period ROAS</span>
          <span className="chart-stat-val text-gold">
            {(activePoint.revenue / (activePoint.spend || 1)).toFixed(2)}x
          </span>
        </div>
      </div>

      {/* SVG Responsive Chart Viewport */}
      <div className="svg-chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="responsive-svg-chart"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Revenue Gradient */}
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            {/* Spend Gradient */}
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            className="chart-grid-line"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            className="chart-grid-line"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            className="chart-grid-line"
          />

          {/* Revenue Area & Line */}
          {activeSeries.revenue && (
            <>
              <path d={makeAreaPath(revenuePoints)} fill="url(#revenueGradient)" />
              <path
                d={makePath(revenuePoints)}
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Spend Area & Line */}
          {activeSeries.spend && (
            <>
              <path d={makeAreaPath(spendPoints)} fill="url(#spendGradient)" />
              <path
                d={makePath(spendPoints)}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Leads Line */}
          {activeSeries.leads && (
            <path
              d={makePath(leadsPoints)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Hover Crosshair and Data Points */}
          {revenuePoints.map((pt, idx) => (
            <g key={idx} className="chart-interactive-point">
              {hoveredIndex === idx && (
                <line
                  x1={pt.x}
                  y1={paddingY}
                  x2={pt.x}
                  y2={height - paddingY}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Revenue point */}
              {activeSeries.revenue && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === idx ? 6 : 4}
                  fill="#c084fc"
                  stroke="#111624"
                  strokeWidth="2"
                />
              )}

              {/* Spend point */}
              {activeSeries.spend && (
                <circle
                  cx={spendPoints[idx].x}
                  cy={spendPoints[idx].y}
                  r={hoveredIndex === idx ? 5 : 3}
                  fill="#22d3ee"
                  stroke="#111624"
                  strokeWidth="2"
                />
              )}

              {/* Leads point */}
              {activeSeries.leads && (
                <circle
                  cx={leadsPoints[idx].x}
                  cy={leadsPoints[idx].y}
                  r={hoveredIndex === idx ? 5 : 3}
                  fill="#34d399"
                  stroke="#111624"
                  strokeWidth="2"
                />
              )}

              {/* Invisible touch/hover target bar */}
              <rect
                x={pt.x - 25}
                y={0}
                width={50}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              />

              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className={`chart-axis-label ${hoveredIndex === idx ? 'highlight' : ''}`}
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default PerformanceChart;
