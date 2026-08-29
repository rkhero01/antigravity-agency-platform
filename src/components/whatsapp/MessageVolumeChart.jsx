import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  CheckCircle2,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function MessageVolumeChart({
  timeframe = '30d',
  selectedClient = 'all',
}) {
  const [interval, setInterval] = useState('daily');
  const [chartData, setChartData] = useState({ series: [], summary: {} });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    loadChartData();
  }, [timeframe, interval, selectedClient]);

  const loadChartData = async () => {
    const data = await whatsappService.getMessageVolumeAnalytics({
      timeframe,
      interval,
      clientId: selectedClient,
    });
    setChartData(data);
  };

  const series = chartData.series || [];
  const maxVal = Math.max(...series.map((d) => d.sent || 0), 100);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Generate SVG path for metric
  const generatePath = (key) => {
    if (series.length < 2) return '';
    return series
      .map((pt, i) => {
        const x = paddingX + (i / (series.length - 1)) * chartW;
        const y = paddingY + chartH - (pt[key] / maxVal) * chartH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const generateAreaPath = (key) => {
    if (series.length < 2) return '';
    const line = generatePath(key);
    const lastX = paddingX + chartW;
    const baseY = paddingY + chartH;
    return `${line} L ${lastX} ${baseY} L ${paddingX} ${baseY} Z`;
  };

  return (
    <div className="wa-message-volume-chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <span>Message Volume &amp; Engagement Trajectory</span>
          </h3>
          <p className="chart-card-subtitle">
            Time-series dispatch velocity, delivery confirmations, and customer response volume
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Interval Switcher */}
          <div className="timeframe-switch">
            <button
              type="button"
              className={`timeframe-btn ${interval === 'daily' ? 'active' : ''}`}
              onClick={() => setInterval('daily')}
            >
              Daily
            </button>
            <button
              type="button"
              className={`timeframe-btn ${interval === 'weekly' ? 'active' : ''}`}
              onClick={() => setInterval('weekly')}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Summary Row */}
      <div className="chart-legend-strip">
        <div className="legend-item">
          <span className="legend-dot sent" />
          <span className="legend-lbl">Sent ({chartData.summary?.totalSent || '48.6k'})</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot delivered" />
          <span className="legend-lbl">Delivered ({chartData.summary?.avgDeliveryRate || '99.4%'})</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot read" />
          <span className="legend-lbl">Read ({chartData.summary?.avgReadRate || '88.9%'})</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot received" />
          <span className="legend-lbl">Received ({chartData.summary?.totalReceived || '36.8k'})</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="svg-chart-container relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradReceived" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + chartH * pct;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={paddingX + chartW}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                >
                  {Math.round(maxVal * (1 - pct))}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={generateAreaPath('sent')} fill="url(#gradSent)" />
          <path d={generateAreaPath('received')} fill="url(#gradReceived)" />

          {/* Paths */}
          <path d={generatePath('sent')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
          <path d={generatePath('delivered')} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
          <path d={generatePath('read')} fill="none" stroke="#f59e0b" strokeWidth="2" />
          <path d={generatePath('received')} fill="none" stroke="#22c55e" strokeWidth="2.5" />

          {/* Interactive Data Points */}
          {series.map((pt, i) => {
            const x = paddingX + (i / (series.length - 1)) * chartW;
            const ySent = paddingY + chartH - (pt.sent / maxVal) * chartH;
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ pt, x, ySent })}>
                <circle cx={x} cy={ySent} r="4" fill="#3b82f6" className="transition-all hover:r-6" />
                <text
                  x={x}
                  y={paddingY + chartH + 16}
                  fill="#64748b"
                  fontSize="9.5"
                  textAnchor="middle"
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="chart-hover-tooltip"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `10%`,
            }}
          >
            <div className="tooltip-date-header">{hoveredPoint.pt.date}</div>
            <div className="tooltip-row">
              <span className="text-primary font-semibold">Sent:</span>
              <strong className="text-white">{hoveredPoint.pt.sent.toLocaleString()}</strong>
            </div>
            <div className="tooltip-row">
              <span className="text-purple font-semibold">Delivered:</span>
              <strong className="text-white">{hoveredPoint.pt.delivered.toLocaleString()}</strong>
            </div>
            <div className="tooltip-row">
              <span className="text-warning font-semibold">Read:</span>
              <strong className="text-white">{hoveredPoint.pt.read.toLocaleString()}</strong>
            </div>
            <div className="tooltip-row">
              <span className="text-success font-semibold">Received:</span>
              <strong className="text-white">{hoveredPoint.pt.received.toLocaleString()}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageVolumeChart;
