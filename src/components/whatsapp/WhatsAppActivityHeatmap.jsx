import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flame,
  Zap,
  Sparkles,
} from 'lucide-react';
import { whatsappService } from '../../services/whatsappService.js';

export function WhatsAppActivityHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    setLoading(true);
    const res = await whatsappService.getHourlyHeatmapAnalytics();
    setData(res);
    setLoading(false);
  };

  if (loading || !data) return null;

  const getHeatmapColor = (val) => {
    if (val >= 80) return 'rgba(239, 68, 68, 0.75)'; // High peak red
    if (val >= 60) return 'rgba(245, 158, 11, 0.65)'; // Medium amber
    if (val >= 40) return 'rgba(59, 130, 246, 0.45)'; // Normal blue
    return 'rgba(255, 255, 255, 0.06)'; // Low
  };

  return (
    <div className="wa-heatmap-card">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame size={17} className="text-warning" />
            <span>Customer Hourly Engagement &amp; Conversion Heatmap</span>
          </h3>
          <p className="text-xs text-muted">
            Inbound chat density by hour of day and day of week to optimize operator shift scheduling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-warning font-bold bg-warning/10 px-2.5 py-1 rounded border border-warning/20">
            🔥 Peak Window: {data.peakWindow}
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="heatmap-grid-container">
        {/* Header Hours */}
        <div className="heatmap-header-row">
          <div className="heatmap-day-label">Day</div>
          {data.hours.map((hr) => (
            <div key={hr} className="heatmap-hour-cell">
              {hr}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.grid.map((row) => (
          <div key={row.day} className="heatmap-data-row">
            <div className="heatmap-day-label font-bold text-white">{row.day}</div>
            {row.values.map((val, idx) => (
              <div
                key={idx}
                className="heatmap-cell"
                style={{ backgroundColor: getHeatmapColor(val) }}
                title={`${row.day} at ${data.hours[idx]}: Intensity ${val}%`}
              >
                <span className="cell-val-text">{val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Behavioral Insights Footnote */}
      <div className="heatmap-footnote-row mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-dim flex-wrap gap-2">
        <span><strong>Peak Conversion Velocity:</strong> {data.bestConversionVelocity}</span>
        <span><strong>Busiest Days:</strong> {data.peakDay}</span>
      </div>
    </div>
  );
}

export default WhatsAppActivityHeatmap;
